---
title: 高级特性
description: 掌握 Voice 与视觉输入、浏览器自动化、execute_code 与 delegate_task 子 Agent，以及在编辑器中通过 hermes acp 使用 Hermes。
sidebar:
  order: 11
---

*「开了 Voice 和 browser toolset，Token 账单却暴涨——多半是云端浏览器与流式 TTS 叠在默认主模型上，而没有用 auxiliary 或子 Agent 分流。」*

实战三章之后，你已能在 CLI、Gateway 与 Skill 上跑通日常任务。本章集中讲**会显著改变交互形态与成本**的能力：语音、视觉、浏览器、程序式工具调用、子 Agent 委托，以及 ACP 编辑器集成。它们都建立在 [工具系统](./tools-system/) 的 toolset 与 backend 之上。依据官方 [Voice Mode](https://hermes-agent.nousresearch.com/docs/user-guide/features/voice-mode)、[Vision](https://hermes-agent.nousresearch.com/docs/user-guide/features/vision)、[Browser](https://hermes-agent.nousresearch.com/docs/user-guide/features/browser)、[Delegation](https://hermes-agent.nousresearch.com/docs/user-guide/features/delegation)、[Code Execution](https://hermes-agent.nousresearch.com/docs/user-guide/features/code-execution)、[ACP](https://hermes-agent.nousresearch.com/docs/user-guide/features/acp)。

**前置**：文本对话、toolsets、`hermes model` 与至少一种 terminal backend 已可用。Voice 与浏览器各有额外系统依赖，下文会标明。

## 能力地图：何时用哪一块

| 能力 | 主要入口 | 典型场景 | 主要成本 |
| --- | --- | --- | --- |
| Voice | `/voice`、`Ctrl+B` | 免提对话、Telegram 语音回复 | STT/TTS API 或本地模型下载 |
| Vision | `/paste`、`/image`、`vision_analyze` | 截图排错、UI 比对 | 视觉模型 token |
| Browser | `browser_*` toolset、`/browser` | 登录态操作、填表、抓动态页 | 云浏览器 API 或本机 Chromium |
| `execute_code` | `code_execution` toolset | 多步过滤、批量处理，中间结果不进上下文 | 脚本内 tool call 次数 |
| `delegate_task` | `delegation` toolset | 并行调研、大块重构，只回收摘要 | 子 Agent 多轮 × 模型单价 |
| `hermes acp` | VS Code / Zed 等 | 编辑器内 diff、审批、工作区 cwd | 与 CLI 相同 Provider |

这些能力**默认不全开**。用 `hermes tools` 按平台勾选；ACP 使用精简的 `hermes-acp` toolset，不含 `cronjob`、`send_message` 等。

需要 Web UI 或第三方聊天前端时，可启用 Gateway 附带的 [OpenAI 兼容 API Server](./architecture-deep-dive/#api-serveropenai-兼容)，与下表能力正交。

## Voice：CLI 麦克风与 Gateway 语音

### 依赖与安装

```bash
pip install "hermes-agent[voice]"      # CLI 麦克风 + 播放
pip install "hermes-agent[messaging]"  # Telegram / Discord 等
pip install "hermes-agent[tts-premium]" # ElevenLabs 等（可选）
```

系统依赖示例：

```bash
# macOS
brew install portaudio ffmpeg opus

# Ubuntu/Debian
sudo apt install portaudio19-dev ffmpeg libopus0
```

STT 优先级（自动检测）：本地 **faster-whisper**（无 Key）→ Groq Whisper → OpenAI Whisper → Mistral Voxtral。在 `.env` 中可设 `GROQ_API_KEY`、`VOICE_TOOLS_OPENAI_KEY` 等。TTS 默认 **Edge TTS** 无需 Key。

### CLI 交互循环

```bash
hermes          # 或 hermes --tui
/voice on
/voice status
/voice tts      # 开关朗读
```

流程摘要：

1. `/voice on` 后按 **Ctrl+B**（可在 `config.yaml` 的 `voice.record_key` 修改）开始录音。
2. 静音约 3 秒自动结束；Whisper 转写后送入 Agent。
3. 若开启 TTS，回复按句流式朗读。
4. 录音可自动进入下一轮，直到连续 3 次无有效语音或再按 Ctrl+B 退出连续模式。

Whisper 对静音的幻听短语会被过滤。网关侧：Telegram、Discord DM/频道可自动语音回复；Discord 还支持 **语音频道** 双向对话，需 `discord.py[voice]` 与 Opus。详见 [Use Voice Mode with Hermes](https://hermes-agent.nousresearch.com/docs/guides/use-voice-mode-with-hermes)。

Gateway 聊天内：

```text
/voice on
/voice off
/voice tts
/voice join      # Discord 语音频道
/voice status
```

**边界**：SSH 远程终端上 CLI 剪贴板贴图与 Voice 能力受限；密钥应在 `.env` 配置，不要在 Telegram 聊天里输入 API Key。

## Vision：剪贴板与工具分析

### CLI 贴图

| 方式 | 说明 |
| --- | --- |
| `/paste` | 最稳妥，从剪贴板附加图片 |
| `Ctrl+V` / `Cmd+V` | 文本优先；纯图片剪贴板时仍建议 `/paste` |
| `/image <路径>` | 附加本地文件 |
| `/terminal-setup` | VS Code 族本地终端优化快捷键 |

多图可在发送前叠多个 `[📎 Image #n]` 徽章；图片落盘 `~/.hermes/images/`。需启用 `vision` toolset 且主模型或 auxiliary 支持视觉。

### `vision_analyze` 工具

对已有文件路径或浏览器截图做分析，常与 `browser_snapshot` 配合。Gateway 会把回复中的**绝对路径媒体**自动变成附件，见 [技能系统实战](./skills-in-practice/) 中的 `[[as_document]]` 说明。

**边界**：远程 SSH 会话中 `/paste` 通常不可用，应在本地终端或先把图传到服务器路径再用 `/image`。

## 浏览器自动化

启用 `browser` toolset 后，Agent 通过无障碍树快照操作页面，元素带 `@e1` 类 ref。

### 后端选型

| 模式 | 配置要点 | 适用 |
| --- | --- | --- |
| Browserbase 云 | `BROWSERBASE_API_KEY`、`BROWSERBASE_PROJECT_ID` | 免本地浏览器、带 stealth |
| Browser Use 云 | `BROWSER_USE_API_KEY` | 备选云提供商 |
| Firecrawl 云 | `FIRECRAWL_API_KEY` | 云浏览器 + 抓取 |
| 本地 CDP | `/browser connect` 挂 Chrome/Brave/Edge | 需保留登录态 |
| Camofox 本地 | 自建反检测 Firefox 服务 | 无云依赖 |
| agent-browser CLI | `hermes setup tools` 或 `hermes acp --setup-browser` | 本机 Chromium |

Nous Portal 订阅可通过 [Tool Gateway](https://hermes-agent.nousresearch.com/docs/user-guide/features/tool-gateway) 使用部分能力而无需逐项 Key。

**混合路由**（默认开启）：已配云提供商时，访问 `localhost`、内网等私有 URL 会自动走**本地 sidecar**，公网 URL 仍走云，避免云浏览器够不到本机开发服。关闭：

```yaml
browser:
  cloud_provider: browserbase
  auto_local_for_private_urls: false
```

会话在空闲超时后自动清理。复杂站点可结合 `vision_analyze` 读截图。

**边界**：在 Gateway 上对不可信用户默认开 `terminal` + 云浏览器，等于远程代操作你的账号与会话 cookie，务必配合 [消息网关](./messaging-gateway/) 的授权与 backend 隔离。

## `execute_code`：单轮内跑 Python 流水线

`execute_code` 让 Agent 写 Python，通过 Unix socket RPC 调用白名单工具；**只有 `print()` 输出**回到对话，中间 tool 结果不占上下文。

### 何时值得用

官方倾向在例如以下情况使用：

- **3 次以上** tool call，且中间需要过滤、分支、循环
- 批量读文件或网页再聚合
- 需要把多步结果压成一段摘要

脚本内可用：`web_search`、`web_extract`、`read_file`、`write_file`、`search_files`、`patch`、`terminal`（仅前台）。**不可**递归 `execute_code`、`delegate_task` 或 MCP。

示例结构：

```python
from hermes_tools import web_search, web_extract

results = web_search("Rust async 2025", limit=5)
# ... 处理 ...
print(summary)
```

### 执行模式与限制

```yaml
code_execution:
  mode: project    # 默认，与 terminal 同 cwd、同 venv
  timeout: 300
  max_tool_calls: 50
```

| 模式 | cwd | 解释器 |
| --- | --- | --- |
| `project` | 会话工作目录 | 当前 venv，否则 Hermes 自带 Python |
| `strict` | 临时隔离目录 | 固定 `sys.executable` |

默认限制：超时 300s、stdout 50KB、每轮最多 50 次 RPC tool call。子进程环境会剥离含 `KEY`/`TOKEN`/`SECRET` 等模式的变量；Skill 声明的 `required_environment_variables` 在加载 Skill 后可透传。

与 `terminal.backend` 共享 Docker 等 backend 时，脚本在**同一长驻容器**内执行。

**边界**：不要把 `execute_code` 当「任意 Python 后门」；白名单与 env 清洗是硬约束。敏感批处理仍应在 `docker` backend 下跑。

## `delegate_task`：子 Agent 与并行

子 Agent 是**全新会话**：看不到父对话历史，只靠 `goal` 与 `context` 字段。

```python
# 不充分
delegate_task(goal="修复那个错误")

# 充分
delegate_task(
    goal="修复 api/handlers.py 第 47 行 TypeError",
    context="NoneType 无 get 属性；项目在 /home/user/myproject；Python 3.11",
    toolsets=["terminal", "file"],
)
```

### 并行批处理

```python
delegate_task(tasks=[
    {"goal": "调研主题 A", "toolsets": ["web"]},
    {"goal": "调研主题 B", "toolsets": ["web"]},
    {"goal": "修复构建", "toolsets": ["terminal", "file"]},
])
```

默认最多 **3** 个并发子任务，可通过 `delegation.max_concurrent_children` 或环境变量调整。父会话被用户打断时，活跃子任务一并中断。

### 子 Agent 禁用的 toolset

无论你怎么传参，叶子子 Agent **不能**使用：`delegation`（默认）、`clarify`、`memory` 写、`code_execution`、`send_message`。需要多层编排时用 `role="orchestrator"` 并提高 `delegation.max_spawn_depth`（默认 1 为扁平）。

```yaml
delegation:
  model: "google/gemini-flash-2.0"
  provider: "openrouter"
  child_timeout_seconds: 600
  max_concurrent_children: 3
  max_spawn_depth: 1
```

TUI 中 `/agents`（别名 `/tasks`）可查看子 Agent 树、成本与终止单个分支。

### 与「再 spawn 一个 hermes 进程」对比

| 维度 | `delegate_task` | `terminal` 里 `hermes chat -q '...'` |
| --- | --- | --- |
| 隔离 | 同进程内子会话，摘要回父上下文 | 完全独立进程 |
| 时长 | 分钟级，受 child_timeout 约束 | 可小时级、可 tmux 常驻 |
| 工具 | 父配置的子集 | 完整 Hermes |
| 交互 | 无 | 可 PTY 交互 |

长时间无人值守任务更适合独立进程或 Gateway `/background`，而不是嵌套 `delegate_task`。

## `hermes acp`：编辑器内的 Hermes

[Agent Client Protocol](https://agentclientprotocol.io/) 让 VS Code、Zed、JetBrains 等通过 stdio JSON-RPC 驱动 Hermes，展示消息、tool 活动、diff、终端与审批。

### 安装与启动

```bash
pip install "hermes-agent[acp]"
hermes acp --check
hermes acp
```

等价命令：`hermes-acp`、`python -m acp_adapter`。日志写 **stderr**，stdout 留给协议。

Zed 注册表通过 `uvx --from 'hermes-agent[acp]==<version>' hermes-acp` 启动，需本机有 `uv`。

浏览器工具可选：

```bash
hermes acp --setup-browser
hermes acp --setup-browser --yes
```

会在 `~/.hermes/node/` 安装 Node 与 `agent-browser`、Playwright Chromium 等。

### `hermes-acp` toolset 范围

包含：文件、终端、web/browser、memory、todo、session_search、skills、`execute_code`、`delegate_task`、`vision`。**不含** messaging、cronjob 等不适合编辑器 UX 的工具。

### 工作区与审批

ACP 会话 cwd 绑定**编辑器工作区**，`read_file` / `terminal` 相对项目根，而非 server 进程 cwd。危险命令可在编辑器内审批：

| 选项 | 作用 |
| --- | --- |
| Allow once | 仅此一次 |
| Allow for session | 当前 ACP 会话内同类命令免审 |
| Allow always | 写入永久 allowlist |
| Deny | 拒绝 |

配置与 CLI 相同：`~/.hermes/.env`、`config.yaml`、skills、state.db。首次可在编辑器触发 `hermes model` 或 registry 的 `--setup` 流程。

VS Code 示例（手动注册）：

```json
{
  "acp.agents": {
    "Hermes Agent": {
      "command": "hermes",
      "args": ["acp"]
    }
  }
}
```

**边界**：ACP 的 `list/load/resume` 作用于**当前 ACP 进程**内的会话管理器；与 `hermes --continue` 的持久化路径相关但不完全等同，重启编辑器 server 后需按编辑器文档理解会话范围。

## 组合使用时的数据流

```text
用户输入（文本 / 语音 / 图片）
        ↓
   主 Agent Loop
        ├─ vision_analyze / browser_*  → 多模态或页面状态
        ├─ execute_code → RPC → 白名单工具 → 仅 print 回上下文
        ├─ delegate_task → 子 AIAgent → 摘要回父上下文
        └─ 普通 terminal / file / web
        ↓
   回复（文本 / TTS / Gateway 附件）
```

## 故障模式

| 现象 | 可能原因 | 处理 |
| --- | --- | --- |
| `/voice` 无麦克风 | 缺 `voice` extra 或 PortAudio | `pip install "hermes-agent[voice]"`；`hermes doctor` |
| 转写乱码或空 | 环境噪声、幻听被滤 | 靠近麦克风；检查 `voice.silence_threshold` |
| `/paste` 无效 | SSH 或无剪贴板 | 用 `/image` 路径；本地终端 |
| 浏览器连不上内网 | 云模式且关闭本地路由 | 开启 `auto_local_for_private_urls` 或本地 CDP |
| `execute_code` 超时 | 脚本死循环或 tool 过多 | 拆脚本；调 `timeout` / `max_tool_calls` |
| 子 Agent 空结果 | context 不足 | 在 `context` 中写全路径、错误栈、约束 |
| 子 Agent 零调用超时 | Provider/鉴权失败 | 查 `~/.hermes/logs/subagent-timeout-*.log` |
| ACP 连不上 | 未装 acp extra | `pip install "hermes-agent[acp]"`；`hermes acp --check` |
| Zed 找不到 Agent | 无 `uv` | 安装 uv 或用手动 `agent_servers` |

## 决策边界

- **不要**在未授权 Gateway 上默认开启 Voice + browser + `terminal: local`：攻击面叠加。
- **不要**用 `delegate_task` 代替简短单次 `terminal`：子 Agent 启动与摘要都有开销。
- **不要**在子 Agent `context` 里漏掉路径与错误原文：子 Agent **零历史**是设计如此。
- **不要**指望 `execute_code` 调用 MCP 或再委托：白名单故意收窄。
- **不要**把 ACP 的 Allow always 当默认：优先 Allow once，确认模式后再 Allow for session。
- **不要**混淆 Cloud 浏览器费用与 LLM token：两者分开监控，必要时 `delegation.model` 用更便宜模型跑子任务。

## 动手练习

1. 在本机 `hermes` 中 `/voice on`，用 Ctrl+B 录一句中文问题，确认转写与 TTS 至少一种可用。
2. 截图复制到剪贴板，`/paste` 后问「图里报错是什么」，确认 `vision` toolset 已启用。
3. 用 `hermes tools` 确认 `browser` 状态；让 Agent 打开一个公网页面并 `browser_snapshot`，记录 ref 格式。
4. 让 Agent 用 `execute_code` 对 3 个以上 URL 做搜索+摘录，对比与普通多轮 `web_search` 的 token 体感差异。
5. 发起 `delegate_task` 并行两个 `web` 仅调研任务，在 TUI 用 `/agents` 观察完成顺序与摘要回写。
6. 若使用 Zed 或 VS Code，安装 ACP 客户端并 `hermes acp --check`，在编辑器内完成一次带文件修改的任务与一次审批。

## 苏格拉底式反思

1. 你的主力场景更需要 Voice，还是 Gateway 文字 + 偶尔图？
2. 浏览器任务应走云还是本地 CDP，取决于你是否需要已登录会话还是只需公网抓取？
3. 父 Agent 该用 `execute_code` 压 token，还是用 `delegate_task` 压对话长度，边界在哪？

## 读者自测

- [ ] 说清 CLI Voice 与 Gateway `/voice` 的差异及 STT 无 Key 路径。
- [ ] 列出 `execute_code` 脚本内可调用的工具类型与不可调用项。
- [ ] 解释子 Agent 为何必须在 `context` 里写全信息。
- [ ] 对比 `delegate_task` 与独立 `hermes chat -q` 进程。
- [ ] 描述 `hermes-acp` toolset 与 CLI 全量 toolset 的主要取舍。
- [ ] 知道浏览器「云 + 本地私有 URL」混合路由的目的。

---

下一章：[安全、性能与最佳实践](./security-performance-best-practices/)，汇总 Checkpoints、审批、容器隔离、成本控制与 `hermes doctor`。
