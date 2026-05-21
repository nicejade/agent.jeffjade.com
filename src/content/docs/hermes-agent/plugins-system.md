---
title: 插件系统（Plugins）
description: 弄清通用插件、记忆插件与上下文引擎三类入口，掌握 hermes plugins CLI，以及与 Hooks、Skill 的边界。
sidebar:
  order: 13
---

*「给团队加了一个 `grep_logs` 工具，却把它写进核心 `tools/`——维护者会让你改成 `~/.hermes/plugins/` 里的插件。」*

[事件钩子](./event-hooks/) 讲如何在生命周期插入逻辑；**插件**则是官方推荐的扩展面：自定义工具、Slash、CLI 子命令、hooks、甚至 Gateway 平台适配器。依据官方 [Plugins](https://hermes-agent.nousresearch.com/docs/user-guide/features/plugins)、[Build a Hermes Plugin](https://hermes-agent.nousresearch.com/docs/guides/build-a-hermes-plugin)。

**前置**：已读过 [工具系统](./tools-system/) 与 [事件钩子](./event-hooks/)。

## 插件能做什么（一张表）

| 能力 | API | 说明 |
| --- | --- | --- |
| 工具 | `ctx.register_tool(...)` | 与内置工具并列出现在 schema |
| 钩子 | `ctx.register_hook(...)` | 见事件钩子章 |
| Slash | `ctx.register_command(...)` | CLI 与 Gateway 共用 |
| CLI 命令 | `ctx.register_cli_command(...)` | 如 `hermes my-cmd` |
| Skill | `ctx.register_skill(name, path)` | 命名空间 `plugin:skill` |
| 消息注入 | `ctx.inject_message(...)` | 向当前会话注入 |
| Gateway 平台 | `ctx.register_platform(...)` | IRC、Teams 等 |
| 记忆后端 | 子类 `MemoryProvider` | **单选**，独立发现 |
| 上下文引擎 | `ctx.register_context_engine(...)` | **单选**，需 `context.engine` |
| 推理 Provider | `register_provider(...)` | `plugins/model-providers/` |

核心仓库 [Adding Tools](https://hermes-agent.nousresearch.com/docs/developer-guide/adding-tools) 面向**内置**工具；团队定制应优先插件。

## 发现路径与覆盖顺序

| 来源 | 路径 | 说明 |
| --- | --- | --- |
| Bundled | 安装包内 `plugins/` | 部分平台/后端默认加载 |
| 用户 | `~/.hermes/plugins/` | 个人与团队分发主路径 |
| 项目 | `./.hermes/plugins/` | 需 `HERMES_ENABLE_PROJECT_PLUGINS=true` |
| pip | `hermes_agent.plugins` entry point | 可发布到 PyPI |

同名插件：**后发现的覆盖先发现的**（用户目录可覆盖 bundled）。

子目录路由：

| 子目录 | 类型 | 激活方式 |
| --- | --- | --- |
| `plugins/` 根 | 通用插件 | `plugins.enabled` |
| `plugins/platforms/` | 消息平台 | `gateway.platforms.*.enabled` |
| `plugins/memory/` | 记忆 | `memory.provider` |
| `plugins/context_engine/` | 压缩引擎 | `context.engine` |
| `plugins/model-providers/` | LLM Provider | `hermes model` / config |

## 通用插件：opt-in 与安全

除 bundled 平台/后端/记忆/上下文引擎外，**通用插件默认只发现不执行**，须在 `config.yaml` 启用：

```yaml
plugins:
  enabled:
    - my-tool-plugin
    - disk-cleanup
  disabled:
    - noisy-plugin   # 可选 deny-list，优先于 enabled
```

```bash
hermes plugins                  # 交互开关
hermes plugins enable <name>
hermes plugins disable <name>
hermes plugins install owner/repo --enable   # 从 Git 安装
```

`hermes plugins install` 结束时会问 `Enable now?`，默认 **N**，避免供应链静默执行。

项目级 `./.hermes/plugins/` **默认关闭**，只在可信仓库显式 `HERMES_ENABLE_PROJECT_PLUGINS=true`。

## 最小插件示例

```text
~/.hermes/plugins/hello-world/
├── plugin.yaml
├── __init__.py      # register(ctx)
├── schemas.py
└── tools.py
```

`plugin.yaml`：

```yaml
name: hello-world
version: "1.0"
description: 示例插件
```

`__init__.py` 片段：

```python
import json

def register(ctx):
    schema = {
        "name": "hello_world",
        "description": "向名字问好",
        "parameters": {
            "type": "object",
            "properties": {"name": {"type": "string"}},
            "required": ["name"],
        },
    }

    def handle(params, **kwargs):
        name = params.get("name", "World")
        return json.dumps({"success": True, "greeting": f"Hello, {name}!"})

    ctx.register_tool(
        name="hello_world",
        toolset="hello_world",
        schema=schema,
        handler=handle,
        description="问好",
    )
    ctx.register_hook("post_tool_call", lambda tool_name, **k: None)
```

写入目录后重启 Hermes，模型即可调用 `hello_world`。完整 walkthrough 见官方 Build a Plugin 指南。

## 记忆插件（Memory Provider）

与通用插件**不同发现系统**：`hermes memory setup` 或：

```yaml
memory:
  provider: honcho   # openviking | mem0 | hindsight | ...
```

- 内置 `MEMORY.md` / `USER.md` **始终保留**；外部 provider **叠加**注入、预取、同步。
- 同时只能激活 **一个** 外部 provider。
- 新后端**不应**再提 PR 进核心 `plugins/memory/` 树，应独立发布。详见 [记忆章](./memory-learning-skills/#外部记忆插件生态)。

```bash
hermes memory setup
hermes memory status
hermes memory off
```

也可在 `hermes plugins` UI 的 Provider Plugins → Memory Provider 中选择。

## 上下文引擎插件

替代默认 `ContextCompressor`，须在 config **显式**启用：

```yaml
context:
  engine: my-engine-name
```

同一时间仅一个引擎生效。用于实验性压缩策略或企业合规摘要格式。

## 与 Hooks、Skill、MCP 的边界

| 扩展 | 何时选 |
| --- | --- |
| **插件工具** | 需要稳定 schema + 代码侧逻辑 + 可分发 |
| **Plugin hook** | 横切策略、审计、注入，不新增工具名 |
| **Skill** | 教模型**流程**，用现有工具完成 |
| **MCP** | 外部进程服务、第三方生态工具 |
| **Gateway hook** | 仅消息平台侧观测（见事件钩子章） |

Skill 不能替代 `pre_tool_call` 阻断；MCP 不能替代需在进程内低延迟的逻辑。

## 故障模式

| 现象 | 可能原因 | 处理 |
| --- | --- | --- |
| 工具不出现 | 未 enable | `hermes plugins enable` |
| 钩子不跑 | 插件未 enabled | 查 `plugins.enabled` |
| 记忆双写异常 | 切换 provider 未重启 | `hermes memory off` 再 setup |
| 项目插件不可见 | 未开 env | `HERMES_ENABLE_PROJECT_PLUGINS=true` |
| 与内置同名 | 覆盖冲突 | 改名或 disable 其一 |

## 决策边界

- **不要把组织专用 API 封装进核心 `tools/`**：用 pip 或 `~/.hermes/plugins/` 分发。
- **不要未审就 `plugins.enabled` 第三方仓库**：等同运行任意 Python。
- **不要用插件重复实现已有 bundled 工具**：优先 Skill + 现有 terminal/web。
- **不要同时配两个 `memory.provider`**：配置只支持单选。

## 动手练习

1. 复制官方 hello-world 插件，enable 后在会话让 Agent 调用 `hello_world`。
2. `hermes plugins list`，区分 general 与 `platforms/`、`memory/` 条目。
3. `hermes memory status`，记录当前是否有外部 provider。
4. 画一张图：你的扩展应落在插件工具、hook 还是 Skill。

## 读者自测

- [ ] 说出 `plugins.enabled` 不控制的四类 bundled 特例。
- [ ] 对比记忆插件与通用插件的发现路径。
- [ ] 解释项目插件为何默认关闭。
- [ ] 说明插件工具与 MCP 的选型差异。

---

下一章：[架构拆解](./architecture-deep-dive/)，从 `AIAgent` 与 `registry` 到 Gateway 数据流。
