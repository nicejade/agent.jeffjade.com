---
title: 架构拆解
description: 读懂 AIAgent 循环、Prompt 组装顺序、tools/registry 与 COMMAND_REGISTRY，以及 CLI、Gateway、Cron 如何共用同一核心。
sidebar:
  order: 11
---

*「改了 `tools/foo.py` 却未生效——多半是没搞清 import 时自注册，而不是少写了一条 import。」*

你要扩展 Hermes、排查「CLI 正常但 Gateway 行为不同」，或向同事解释系统边界，需要一张**代码级地图**。本章按官方 [Architecture](https://hermes-agent.nousresearch.com/docs/developer-guide/architecture)、[Agent Loop](https://hermes-agent.nousresearch.com/docs/developer-guide/agent-loop)、[Prompt Assembly](https://hermes-agent.nousresearch.com/docs/developer-guide/prompt-assembly) 梳理入口、核心循环与数据流。版本锚点以你本机 `hermes --version` 与 [GitHub main](https://github.com/NousResearch/hermes-agent) 为准；文件路径随版本可能微调。

**前置**：已使用 CLI 与 Gateway，并读过 [工具系统](./tools-system/)、[记忆、学习与 Skill](./memory-learning-skills/)。

## 一张总览图：入口收敛到 AIAgent

```text
┌─────────────────────────────────────────────────────────────┐
│ 入口：cli.py │ gateway/run.py │ acp_adapter │ batch │ API   │
└──────────────┬──────────────────────────────────────────────┘
               ▼
┌─────────────────────────────────────────────────────────────┐
│ AIAgent（run_agent.py）                                      │
│  Prompt Builder │ Provider 解析 │ model_tools 工具分发      │
│  ContextCompressor │ prompt_caching │ 回调与中断             │
└──────┬───────────────────────┬──────────────────────────────┘
       ▼                       ▼
 hermes_state.py          tools/registry.py + environments/
 SessionDB + FTS5         terminal / browser / MCP / ...
```

设计原则（官方归纳）：

| 原则 | 实践含义 |
| --- | --- |
| Prompt stability | 系统提示会话内稳定，利于缓存与可预期记忆 |
| Observable execution | 工具调用经 callback 可见 |
| Interruptible | API 与工具可被取消 |
| Platform-agnostic core | 同一 `AIAgent` 服务 CLI、Gateway、ACP、Cron |
| Loose coupling | MCP、插件、memory provider 用注册表与 check_fn |
| Profile isolation | `hermes -p` 独立 `HERMES_HOME`、会话与 Gateway PID |

## 目录：先记住这些文件

| 路径 | 职责 |
| --- | --- |
| `run_agent.py` | `AIAgent`，完整对话循环 |
| `cli.py` | 交互终端 UI |
| `model_tools.py` | 工具 schema 收集与 `handle_function_call` |
| `toolsets.py` | 工具分组与平台预设 |
| `hermes_state.py` | SQLite 会话、FTS5 |
| `agent/prompt_builder.py` | 系统提示组装 |
| `agent/context_compressor.py` | 默认压缩引擎 |
| `tools/registry.py` | 工具注册中心 |
| `tools/approval.py` | 危险命令与 hardline |
| `hermes_cli/commands.py` | `COMMAND_REGISTRY`，Slash 命令 |
| `hermes_cli/runtime_provider.py` | Provider → api_mode |
| `gateway/run.py` | `GatewayRunner`、会话卫生 85% |
| `gateway/session.py` | Gateway 会话存储 |
| `cron/` | 定时任务调度 |

工具依赖链（import 顺序很重要）：

```text
tools/registry.py
    ↑ 各 tools/*.py 在 import 时 registry.register()
model_tools.py
    ↑
run_agent.py, cli.py, ...
```

新工具 = 新文件 + 顶层 `register()`，**不必**改中央 import 列表。

## Agent Loop：一轮里发生什么

`AIAgent` 提供两种入口：

```python
# 简版：返回最终字符串
agent.chat("修复 main.py 的 bug")

# 完整：含 messages、usage、元数据
agent.run_conversation(user_message="...", conversation_history=None)
```

每轮迭代（简化）：

```text
1. 追加用户消息
2. 构建或复用缓存的系统提示（prompt_builder）
3. 若 token ≥ 阈值 → 预压缩（默认约 50% 窗口）
4. 组装 API 消息；Anthropic 时 apply cache_control
5. 可中断的 API 调用（_interruptible_api_call）
6. 若 tool_calls → 执行 → 结果写回 → 回到 4
7. 否则持久化会话、必要时 flush memory → 返回
```

内部消息统一为 **OpenAI 风格** dict：`system` / `user` / `assistant` / `tool`。三种 **api_mode** 在边界转换：

| api_mode | 典型 Provider |
| --- | --- |
| `chat_completions` | OpenRouter、多数 OpenAI 兼容 |
| `codex_responses` | Codex / Responses API |
| `anthropic_messages` | 原生 Anthropic |

解析顺序：构造参数 `api_mode` > Provider 检测 > base URL 启发 > 默认 `chat_completions`。

**消息交替规则**：禁止连续两条 `user` 或 `assistant`；工具阶段可为连续 `tool`。违反会导致 Provider 拒收。

### 工具执行：串行、并行与 Agent 级拦截

- 单个 tool call：主线程直接执行。
- 多个 tool call：`ThreadPoolExecutor` 并行，结果按原顺序写回；`clarify` 等交互工具强制串行。

部分工具在 `run_agent.py` **先于 registry** 处理：

| 工具 | 原因 |
| --- | --- |
| `todo` | Agent 本地任务状态 |
| `memory` | 写 `MEMORY.md` / `USER.md` 并受字符上限约束 |
| `session_search` | 查当前 Agent 的 SessionDB |
| `delegate_task` | _spawn 子 Agent |

其余走 `tools/registry.py` → handler；危险终端命令经 `approval.py` 与 callback。

### 迭代预算与 fallback

- 默认约 **90** 轮（`agent.max_turns`），子 Agent 另有 `delegation.max_iterations`（默认 50）。
- 主模型 429/5xx 等按 `fallback_providers` 链切换；auxiliary 任务有独立 fallback 配置。

## Prompt 组装：缓存前缀 vs 瞬时层

Hermes 刻意拆分：

- **会话级缓存系统提示**：会话开始组装，会话内默认不变。
- **API 调用瞬时层**：不写入持久前缀，如 `ephemeral_system_prompt`、Gateway 覆盖。

`prompt_builder` 组装顺序（有则加入）：

1. **身份**：`~/.hermes/SOUL.md`，否则 `DEFAULT_AGENT_IDENTITY`
2. 工具使用指引（含 memory、session_search 等说明）
3. 可选 Honcho 静态块
4. 可选 config/API `system_message`
5. **冻结** `MEMORY.md` 快照
6. **冻结** `USER.md` 快照
7. Skills 索引（L0 名称+描述）
8. 项目上下文文件（见下表优先级）
9. 时间戳 / session id
10. 平台提示（CLI 纯文本 vs Gateway Markdown 等）

项目上下文**只加载一种**（先匹配先生效）：

| 优先级 | 文件 | 搜索范围 |
| --- | --- | --- |
| 1 | `.hermes.md` / `HERMES.md` | CWD 向上至 git 根 |
| 2 | `AGENTS.md` | 仅 CWD |
| 3 | `CLAUDE.md` | 仅 CWD |
| 4 | `.cursorrules` / `.cursor/rules/*.mdc` | 仅 CWD |

`SOUL.md` 作身份加载后，`build_context_files_prompt(skip_soul=True)` 避免重复。子 Agent 可 `skip_context_files`，此时用默认身份、不带项目 AGENTS。

文件注入前会**安全扫描**并截断（约 20k 字符，头尾保留）。子目录 `AGENTS.md` 可在工具结果中通过 `subdirectory_hints.py` **渐进**注入，而非全部塞进首轮 system。

**定制边界**：改人格写 `SOUL.md`，改仓库规范写 `AGENTS.md`，改流程加 Skill；改 `prompt_builder.py` 属于 fork/上游贡献，影响所有用户。

## `tools/registry.py` 与 toolsets

每个工具在模块 import 时注册：名称、schema、handler、可选 `check_fn`（依赖是否安装、平台是否允许）。

`toolsets.py` 把工具名分组为 `web`、`terminal`、`memory`、`mcp-<server>` 等；`hermes tools` 与 `config.yaml` 决定**当前平台**暴露哪些组。`model_tools` 在会话开始前收集 schema，过大 schema 会增加 token 与误选率。

终端类工具经 `terminal_tool.py` 路由到 `tools/environments/` 下 backend（local、docker、ssh 等），与 [工具系统](./tools-system/) 一章一致。

## `COMMAND_REGISTRY`：Slash 命令单一来源

`hermes_cli/commands.py` 的 `COMMAND_REGISTRY` 注册 `/model`、`/compress`、`/skills`、`/yolo` 等。CLI 与 Gateway **共用**定义，避免「终端有、Telegram 没有」的分叉。实现上命令可带 handler、权限要求、是否破坏性（`/new` 等需确认）。

新增 Slash 能力应注册于此，而不是在 `gateway/platforms/` 各写一套。

## 三条数据流对比

### CLI 会话

```text
用户输入 → HermesCLI.process_input()
         → AIAgent.run_conversation()
         → prompt_builder + Provider + 工具循环
         → 显示 + 写入 SessionDB
```

### Gateway 消息

```text
平台 Adapter.on_message() → MessageEvent
         → GatewayRunner._handle_message()
         → 授权 _is_user_authorized()
         → 解析 session key，加载历史
         → AIAgent.run_conversation()
         → 可选：进 Agent 前 85% 会话卫生压缩
         → delivery 回平台
```

### Cron

```text
Scheduler tick → jobs.json 到期任务
              → 新建 AIAgent（通常无历史）
              → 注入附加 Skill 上下文
              → 执行 prompt → deliver 到目标平台
              → 更新 next_run
```

Cron 任务是 **Agent 任务**而非裸 shell；存储在 `~/.hermes/cron/`（Profile 下路径随 `HERMES_HOME` 变化）。

## 会话存储与压缩谱系

`hermes_state.py`：SQLite 存消息，FTS5 供 `session_search`。压缩会生成**子 session 谱系**（lineage），便于追溯「哪次压缩前的对话」。

Gateway `gateway/session.py` 与 CLI 共享 Agent 核心，但路由键含平台 id、chat id、topic 等，见 [消息网关](./messaging-gateway/)。

## 插件、MCP 与扩展点

| 扩展 | 注册方式 | 数量限制 |
| --- | --- | --- |
| 普通插件 | `~/.hermes/plugins/`、项目 `.hermes/plugins/`、pip entry | 可多 |
| Memory provider | `plugins/memory/` | **单选** |
| Context engine | `plugins/context_engine/` | **单选**，需 `context.engine` 显式启用 |

MCP 在运行时连接，工具名带服务器前缀；每个服务器可映射为独立 toolset。

## 读代码推荐顺序

1. 本章总览
2. `run_agent.py` 中 `run_conversation` 主路径
3. `agent/prompt_builder.py` 的 `build_system_prompt`
4. `model_tools.py` 的 `handle_function_call`
5. `tools/registry.py` 与一个示例工具文件
6. `gateway/run.py` 的 `_handle_message` 与 session hygiene
7. [Context Compression & Caching](https://hermes-agent.nousresearch.com/docs/developer-guide/context-compression-and-caching)

## 故障模式

| 症状 | 可能原因 | 检查 |
| --- | --- | --- |
| 新工具不出现 | 未 import 到 discovery 链 | 确认 `registry.register` 在模块顶层 |
| Gateway 与 CLI 工具不一致 | platform toolset 不同 | `hermes tools` 分平台查看 |
| Slash 仅一端可用 | 未进 COMMAND_REGISTRY | `hermes_cli/commands.py` |
| 记忆未进提示 | 新会话才快照 | 本会话改 MEMORY 要新开 session 或接受 frozen |
| 压缩后工具 orphaned | 边界切断 tool 对 | 看 compressor 的 sanitize 日志 |

## 决策边界

- **不要在 `run_agent.py` 写平台 if Telegram**：应放在 adapter 或 callback。
- **不要绕过 registry 直接调工具 handler**：会跳过 approval、插件 hook。
- **不要假设改 `MEMORY.md` 立即改变当前 system prompt**：设计如此，非 bug。
- **不要为调试长期关闭压缩**：Gateway 85% 是为防 API 超长失败。

## 动手练习

1. 在仓库打开 `tools/registry.py`，找一个 `register(` 调用，追到对应 handler 文件。
2. 对比 `hermes_cli/commands.py` 里一条 `/compress` 定义与 CLI 里触发路径。
3. 画一张白纸：从你的 Telegram 消息到 `AIAgent` 经过哪 5 个模块名。
4. 用 `hermes sessions list` 找一条会话，说清 CLI 与 Gateway 是否可能共用同一 session id 规则（通常按平台 key 区分）。
5. 阅读 `prompt_builder.py` 中 context 文件优先级注释或代码 10 行。

## 苏格拉底式反思

1. 若你只允许改一个文件加功能，加工具、加 Slash、改 Prompt，你会选哪条依赖链上的位置？
2. Profile 隔离对「两个 Telegram bot 各跑一个 Hermes」意味着什么路径必须分开？
3. frozen snapshot 是缓存优化还是产品语义？对你的自动化测试有何影响？

## 读者自测

- [ ] 画出入口 → AIAgent → registry 的简图。
- [ ] 说出三种 api_mode 及一种 Provider 对应关系。
- [ ] 列出系统提示组装中 SOUL、MEMORY、Skills 索引的先后顺序。
- [ ] 解释 `COMMAND_REGISTRY` 对 CLI/Gateway 的意义。
- [ ] 对比 CLI 会话流与 Cron 任务在历史上的差异。
- [ ] 说明工具 import 自注册链为何不需要中央 import 列表。

---

下一章：[从零实现类似 Agent](./build-your-own-agent/)，用分阶段清单把上述架构落到可交付的迷你实现。
