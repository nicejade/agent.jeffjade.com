---
title: 事件钩子（Event Hooks）
description: 掌握 Gateway 钩子、Plugin 钩子与 Shell 钩子三种体系，用最小示例实现审计、阻断与上下文注入。
sidebar:
  order: 9
---

*「想在 Telegram 上每次长任务超过 10 步就收到提醒，却改动了核心仓库——其实只需在 `~/.hermes/hooks/` 放一个 Gateway 钩子。」*

[技能系统实战](./skills-in-practice/) 之后，你可能需要**在 Agent 生命周期里插入自己的逻辑**：记录 Slash 使用、阻断危险工具、或在每轮对话前注入 `git status`。Hermes 提供三套互不替代的钩子体系。依据官方 [Hooks](https://hermes-agent.nousresearch.com/docs/user-guide/features/hooks)。

**前置**：已能跑通 CLI 或 Gateway；若用 Plugin 钩子，需理解 [工具系统](./tools-system/) 中的审批与 `pre_tool_call` 概念。

## 三种钩子：一张决策矩阵

| 体系 | 注册方式 | 运行范围 | 典型用途 | 能否阻断工具 |
| --- | --- | --- | --- | --- |
| **Gateway hooks** | `~/.hermes/hooks/<name>/` 下 `HOOK.yaml` + `handler.py` | 仅 Gateway（Telegram、Discord 等） | 启动清单、Webhook、步数告警 | 否 |
| **Plugin hooks** | 插件 `register()` 里 `ctx.register_hook()` | CLI + Gateway | 审计、策略、`pre_llm_call` 注入 | 是（`pre_tool_call`） |
| **Shell hooks** | `config.yaml` 的 `hooks:` 块指向脚本 | CLI + Gateway | Bash 一键格式化、阻断 `rm` | 是（`pre_tool_call`） |

三套钩子**错误均被捕获并记录**，不会拖垮 Agent 主循环。这与审批、沙箱的关系是：**钩子可提前否决或改写行为；审批与 hardline 仍是内置地板**。

```text
用户消息 → Gateway/CLI
         → [pre_gateway_dispatch]（仅 Gateway，Plugin）
         → Agent Loop
              → [pre_llm_call] 可注入上下文
              → 工具循环
                   → [pre_tool_call] 可 block
                   → 执行工具（含审批）
                   → [post_tool_call] / [transform_tool_result]
              → [transform_llm_output]
         → [agent:* Gateway hooks] 观测用
```

## Gateway Event Hooks

Gateway 钩子在 `gateway:startup`、`agent:start`、`agent:step`、`command:*` 等时刻触发，**不阻塞**主 Agent 管线，适合日志与外部通知。

### 最小可跑示例

```text
~/.hermes/hooks/my-hook/
├── HOOK.yaml
└── handler.py
```

`HOOK.yaml`：

```yaml
name: my-hook
description: 记录 agent 活动
events:
  - agent:start
  - agent:end
  - agent:step
```

`handler.py`（函数名必须为 `handle`，支持 `async def`）：

```python
import json
from datetime import datetime
from pathlib import Path

LOG = Path.home() / ".hermes" / "hooks" / "my-hook" / "activity.log"

async def handle(event_type: str, context: dict):
    entry = {"ts": datetime.now().isoformat(), "event": event_type, **context}
    LOG.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG, "a") as f:
        f.write(json.dumps(entry) + "\n")
```

重启 Gateway 后，在 Telegram 发一条消息，检查日志是否出现 `agent:start` / `agent:end`。

### 常用事件

| 事件 | 时机 | 典型 context |
| --- | --- | --- |
| `gateway:startup` | Gateway 进程启动 | `platforms` |
| `session:start` / `session:end` / `session:reset` | 会话生命周期 | `platform`, `user_id`, `session_key` |
| `agent:start` / `agent:end` | 处理一条用户消息 | `message`, `response` |
| `agent:step` | 工具循环每一步 | `iteration`, `tool_names` |
| `command:*` | 任意 Slash | `command`, `args` |

订阅 `command:*` 可一次监听所有 Slash，无需逐个列举。

### BOOT.md 启动清单（社区模式）

官方教程演示：在 `~/.hermes/BOOT.md` 写自然语言清单，用 `gateway:startup` 钩子 spawn 一次性 Agent 执行。要点：

- 用 `_resolve_gateway_model()` 与 `_resolve_runtime_agent_kwargs()`，避免裸 `AIAgent()` 导致自定义端点 401。
- 后台线程执行，不阻塞 Gateway 启动。
- Agent 无事项可报时回复 `[SILENT]`，钩子不对外发消息。

**误用边界**：Gateway 钩子**不会**在纯 CLI 会话触发；要全环境生效请用 Plugin 或 Shell 钩子。

## Plugin Hooks

已启用插件在 `register(ctx)` 中注册，CLI 与 Gateway 共用同一分发器。

```python
def register(ctx):
    ctx.register_hook("pre_tool_call", audit_tool)
    ctx.register_hook("pre_llm_call", inject_context)
    ctx.register_hook("transform_tool_result", redact_secrets)
```

回调应接受 `**kwargs`，便于未来扩展参数。

### 能改变行为的钩子

| 钩子 | 返回值作用 |
| --- | --- |
| `pre_tool_call` | `{"action": "block", "message": "..."}` 否决工具，模型看到错误信息 |
| `pre_llm_call` | `{"context": "..."}` 或纯字符串，追加到**当前轮用户消息**（不改 system，利于 Prompt Cache） |
| `transform_tool_result` | 非空 `str` 替换工具结果 |
| `transform_terminal_output` | 在 terminal 截断/脱敏前改写原始输出 |
| `transform_llm_output` | 改写最终助手文本 |

其余钩子（`post_tool_call`、`post_llm_call`、`on_session_*` 等）为观察型，返回值被忽略。

### 阻断决策表（与审批的关系）

| 场景 | 推荐机制 | 说明 |
| --- | --- | --- |
| 通用危险命令（`rm -rf /`） | hardline + `approvals` | 内置地板，钩子不必重复 |
| 组织策略（禁止某目录 `write_file`） | `pre_tool_call` 插件/Shell | 可带业务规则 |
| 每轮注入 RAG / 记忆 | `pre_llm_call` | 不污染 system 前缀 |
| Gateway 步数告警 | Gateway `agent:step` | 不阻塞，只通知 |
| 对外 Webhook | Gateway `session:start` | 与工具无关 |

**注册顺序**：`pre_tool_call` 的 block 以**先注册者优先**（Python 插件先于 Shell 钩子）。多个插件都返回 block 时，第一个生效。

### pre_llm_call 示例

```python
def inject_git_status(session_id, user_message, is_first_turn, **kwargs):
    import subprocess
    try:
        out = subprocess.check_output(
            ["git", "status", "--short"], text=True, timeout=3
        )
        if out.strip():
            return {"context": f"Git status:\n{out}"}
    except Exception:
        pass
    return None
```

注入内容**仅本轮 API 调用可见**，不写入 SessionDB 中的原始用户消息。

## Shell Hooks

在 `~/.hermes/config.yaml` 声明，脚本放在 `~/.hermes/agent-hooks/` 等路径，**无需写 Python 插件**。

```yaml
hooks:
  pre_tool_call:
    - matcher: "terminal"
      command: "~/.hermes/agent-hooks/block-dangerous.sh"
      timeout: 10
  post_tool_call:
    - matcher: "write_file|patch"
      command: "~/.hermes/agent-hooks/auto-format.sh"
hooks_auto_accept: false
```

Hermes 向 stdin 写入 JSON，从 stdout 读取 JSON 响应。`pre_tool_call` 可返回：

```json
{"action": "block", "message": "禁止删除系统路径"}
```

首次运行某 `(event, command)` 对会提示确认（除非 `hooks_auto_accept: true`），避免静默执行未知脚本。

### 三体系对比（运维视角）

| 维度 | Shell | Plugin | Gateway |
| --- | --- | --- | --- |
| 语言 | 任意可执行脚本 | Python | Python |
| 进程隔离 | 子进程 | 进程内 | 进程内 |
| 需 `plugins.enabled` | 否 | 是（通用插件） | 否（目录即加载） |
| 适合团队 | 运维脚本 | 可分发 pip 包 | 仅消息平台侧效应 |

## 与 Skill、MCP、审批的边界

| 能力 | 钩子 | Skill | MCP |
| --- | --- | --- | --- |
| 教 Agent **怎么做** | 否 | 是 | 提供新工具 |
| **强制**策略 | 是 | 否（建议性） | 否 |
| 跨会话程序性知识 | 否 | 是 | 否 |
| 观测 Gateway 步数 | Gateway 钩子 | 否 | 否 |

不要把应用层业务规则写进 `SOUL.md` 指望模型自觉遵守；应使用 `pre_tool_call` 或审批。

## 故障模式

| 现象 | 可能原因 | 处理 |
| --- | --- | --- |
| CLI 里钩子不触发 | 用了 Gateway 专用目录 | 改 Plugin/Shell |
| `pre_tool_call` 无效 | 插件未 `plugins.enabled` | `hermes plugins enable <name>` |
| Shell 钩子静默失败 | JSON 格式错、超时 | 查 `~/.hermes/logs/`；降 matcher 范围 |
| BOOT 清单 401 | 未用 gateway 凭据解析 | 对照官方 BOOT 教程改 handler |
| 注入无效 | 返回了空 context | 确认 `pre_llm_call` 返回值非空 |

## 决策边界

- **不要用 Gateway 钩子做工具阻断**：它没有 `pre_tool_call` 语义。
- **不要在 `pre_llm_call` 塞入整份仓库**：用 `@file` 或 `session_search`；见 [第一次对话](./first-conversation/#上下文引用-语法)。
- **不要默认 `hooks_auto_accept: true` 于不可信机器**：等同自动执行任意脚本。
- **不要与 hardline 重复造轮子**：`rm -rf /` 已被内置拒绝，钩子应补组织特有规则。

## 动手练习

1. 创建 `command-logger` Gateway 钩子，订阅 `command:*`，记录 3 次 Slash 使用。
2. 写一个 Shell `post_tool_call` 钩子，在 `write_file` 修改 `.py` 后尝试调用 `black`（若已安装）。
3. 在测试插件里注册 `pre_tool_call`，对 `tool_name == "terminal"` 且命令含 `/etc` 时 block，验证模型收到 block 消息。
4. 对比同一会话在 CLI 与 Gateway 下 Gateway 钩子是否仅后者触发。

## 读者自测

- [ ] 说出三套钩子的运行范围差异。
- [ ] 解释 `pre_llm_call` 为何注入用户消息而非 system。
- [ ] 写出 `pre_tool_call` block 的 JSON 形状。
- [ ] 说明 Gateway 钩子与审批的分工。

---

下一章：[Kanban 多 Agent 看板](./kanban-multi-agent-board/)，对比 `delegate_task` 与持久任务队列的取舍。
