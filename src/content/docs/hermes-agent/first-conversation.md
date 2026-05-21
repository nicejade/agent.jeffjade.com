---
title: 第一次对话
description: 配置 hermes model、启动 CLI 或 TUI、使用 Slash 命令与会话恢复，完成可验证的首轮多轮对话。
sidebar:
  order: 3
---

*「`hermes doctor` 全绿，但一开口就 401 或空回复。先查 `hermes model` 与 `~/.hermes/.env`，再怀疑安装步骤。」*

上一章你已经能让 `hermes` 命令跑起来。本章只做一件事：**在本机完成一轮可验证的多轮对话**，并确认 `hermes --continue` 能恢复同一会话。官方 [Quickstart](https://hermes-agent.nousresearch.com/docs/getting-started/quickstart) 的规则同样适用：若还无法正常聊天，先不要叠 Gateway、Cron 或大量 Skill。

**本章路线（必读）**：配置 `hermes model` → 启动 `hermes` 或 `hermes --tui` → 发可验证的首条消息 → `hermes --continue` 恢复 → 熟悉核心 Slash。**可选 · CLI 进阶**：`@` 上下文引用，见本章后半「可选」一节。

## 本章要解决的三个问题

| 问题 | 本章答案 |
| --- | --- |
| 模型从哪来？ | `hermes model` 在终端外配置；会话内用 `/model` 在已配置 Provider 间切换 |
| 从哪进对话？ | `hermes` 经典 CLI，或 `hermes --tui` 现代 TUI |
| 会话如何延续？ | `hermes --continue`、Slash 里的 `/resume`、`hermes sessions list` |

## 第一步：配置推理 Provider

Hermes 至少需要一种 LLM 接入方式。在**任何 Hermes 会话之外**的终端里运行：

```bash
hermes model
```

向导会引导 OAuth、API Key 或自定义 OpenAI 兼容端点。常见路径见下表；完整列表见官方 [AI Providers](https://hermes-agent.nousresearch.com/docs/integrations/providers)。

| 路径 | 典型操作 |
| --- | --- |
| Nous Portal | `hermes model` → 选 Nous Portal → 浏览器 OAuth |
| OpenRouter | 在 `~/.hermes/.env` 写入 `OPENROUTER_API_KEY`，或在向导里填写 |
| Anthropic API Key | `export ANTHROPIC_API_KEY=...` 或 `hermes config set` |
| Anthropic OAuth | 需 Claude Max 且已购买 extra usage credits；Pro 订阅不能走此 OAuth 路径。OAuth 路径偶发配额或工具调用报错，以官方 issue 与 `hermes doctor` 为准；求稳可改用 `ANTHROPIC_API_KEY` |
| 自托管 Ollama / vLLM | `hermes model` → Custom endpoint，并**显式设置足够大的 context** |

### 两个「换模型」命令别混用

| 命令 | 运行位置 | 作用 |
| --- | --- | --- |
| `hermes model` | 会话**外**的普通 shell | 完整向导：新增 Provider、OAuth、写 API Key |
| `/model` | **正在进行的** Hermes 会话里 | 在**已配置好**的 Provider 与模型之间快速切换 |

若你只有 OpenRouter，却想在会话里切到 Anthropic，必须先 `Ctrl+C` 或 `/quit` 退出会话，在 shell 里跑 `hermes model` 完成 Anthropic 配置，再重新 `hermes`。

### 配置写在哪

Hermes 把秘密与普通配置分开存放，这是官方设计，不是本指南的推断：

| 类型 | 路径 |
| --- | --- |
| API Key、Token | `~/.hermes/.env` |
| 非秘密项 | `~/.hermes/config.yaml` |

推荐用 CLI 写入，避免把 Key 写进 yaml：

```bash
hermes config set model anthropic/claude-sonnet-4-6
hermes config set OPENROUTER_API_KEY sk-or-...
```

### 上下文下限：至少 64K

[Quickstart](https://hermes-agent.nousresearch.com/docs/getting-started/quickstart) 要求模型具备 **至少 64,000 tokens** 上下文；窗口过小会在启动时被拒绝，或在多步工具调用中迅速耗尽上下文。主流托管模型通常满足。自托管须按后端单独配置：Ollama 文档建议 agent 场景至少 16k～32k，且 Hermes 启动校验仍以 64K 为准，常见做法为 `OLLAMA_CONTEXT_LENGTH=65536`；llama.cpp 用 `-c 65536`；LM Studio 用 `--context-length 64000`。详见 [Providers](https://hermes-agent.nousresearch.com/docs/integrations/providers) 中 Ollama、LM Studio 等小节与 [Context Length Detection](https://hermes-agent.nousresearch.com/docs/integrations/providers#context-length-detection)。

侧任务压缩、视觉等可走 **auxiliary** 模型，首轮对话可保持默认 `auto`，需要时再在 `hermes model` 的 Auxiliary models 或 [Configuration](https://hermes-agent.nousresearch.com/docs/user-guide/configuration#auxiliary-models) 中单独指定。

## 第二步：启动 CLI 或 TUI

```bash
hermes          # 经典 CLI（prompt_toolkit）
hermes --tui    # 现代 TUI：模态层、鼠标选择、非阻塞输入（官方推荐尝试）
```

两者共享同一会话存储、Slash 命令与 `config.yaml`。启动后应看到欢迎横幅，其中包含当前 **model / provider**、可用工具与 Skill 索引摘要。

若横幅里的模型与你预期不符，在会话外重新 `hermes model`，或在会话内 `/status` 查看详情。

## 第三步：发一条可验证的首条消息

选一条**结果容易核对**的提示，避免模糊闲聊：

```text
检查当前工作目录，列出顶层文件，并指出最像主入口的文件名。
```

或：

```text
用不超过 5 条要点概括当前目录下的项目结构，并说明判断依据。
```

**成功标准**（可对照观察）：

1. 横幅显示的 model/provider 与 `hermes model` 配置一致。
2. 助手回复无认证类报错。
3. 若任务需要，Agent 会调用 `terminal` 等工具，并在回复中引用命令输出。
4. 连续追问 2～3 轮，上下文仍连贯。

失败时先不要改 Gateway，按 Quickstart 的恢复顺序排查：

```text
hermes doctor → hermes model → hermes setup → hermes sessions list
```

## 第四步：验证会话恢复

退出当前会话后，在 shell 中执行：

```bash
hermes --continue
# 或
hermes -c
```

应回到**最近一次**会话。若失败，检查：

| 可能原因 | 检查方式 |
| --- | --- |
| 换了 Profile | `/profile` 或 `hermes sessions list` 确认 profile |
| 会话未落盘 | 是否正常 `/quit` 退出；异常杀进程可能丢最后一轮 |
| 要找更早的会话 | 会话内 `/sessions` 交互选择，或 `/resume 会话标题` |

列出历史：

```bash
hermes sessions list
```

会话数据在 `~/.hermes/state.db`（SQLite + FTS5），与 `MEMORY.md` 是不同层，第四章会展开。

## Slash 命令：会话内的控制面

在输入框输入 `/` 会弹出自动补全菜单。命令由中央 `COMMAND_REGISTRY` 注册，CLI 与消息网关共用同一套定义，详见 [Slash Commands Reference](https://hermes-agent.nousresearch.com/docs/reference/slash-commands)。

### 入门阶段建议熟悉的命令

| 命令 | 用途 |
| --- | --- |
| `/help` | 列出可用命令 |
| `/status` | 当前 model、provider、session ID、工作目录、token 统计等 |
| `/new [名称]` | 新会话；可选名称便于日后 `/resume` |
| `/history` | 查看当前会话历史 |
| `/save` | 保存对话 |
| `/model [名称]` | 在已配置模型间切换；`/model --global` 可写回 config |
| `/tools` | 列出或临时禁用本会话的工具 |
| `/compress [主题]` | 手动压缩上下文并 flush 记忆相关处理 |
| `/usage` | Token 用量与上下文窗口状态 |
| `/quit` | 退出；`/quit --delete` 可删除本会话 SQLite 记录 |

已安装的 Skill 会注册为动态 Slash，例如 `/plan` 进入计划模式。Hub 技能用 `hermes skills install` 安装，Agent **不能**自行从 Hub 拉未信任包。

### 会话内换模型示例

```text
/model
/model claude-sonnet-4-6
/model openrouter:anthropic/claude-sonnet-4.6
```

要**新增**从未配置过的 Provider，必须退出会话后在 shell 执行 `hermes model`。

### 多行输入与中断

| 操作 | 行为 |
| --- | --- |
| `Alt+Enter` / `Ctrl+J` / `Shift+Enter` | 插入换行（部分终端对 Shift+Enter 需 Kitty 键盘协议） |
| 运行中再按 Enter 发新消息 | 中断当前任务，转向新指令 |
| `Ctrl+C` | 中断 |

长任务中若只想**轻推方向**而不打断工具循环，可用 `/steer 请关注 auth 模块`：内容会在当前工具完成后注入，见官方 Slash 文档。跨轮自动续跑可用 `/goal`，日常首轮对话不必开启，机制见 [记忆、学习与 Skill](./memory-learning-skills/#持久目标-persistent-goals)。

## CLI 与 TUI 怎么选

| 维度 | `hermes` 经典 CLI | `hermes --tui` |
| --- | --- | --- |
| 交互风格 | 传统行编辑 | 模态、状态栏、鼠标友好 |
| 适用 | 脚本化、SSH 低配终端 | 本地长时间盯屏 |
| 底层 | 同一 `AIAgent` 与会话 DB | 同上 |

没有「更高级」之分，只有终端能力与个人习惯之分。

## 机制简述：从输入到工具再回模型

你发出的每一轮用户消息进入 **Agent Loop**：组装系统提示 → 调用模型 → 若返回 tool calls 则执行 → 将结果塞回上下文 → 再次调用模型，直到产生最终自然语言回复。CLI 只负责渲染与 Slash 分发；核心逻辑与 Gateway 共用 `AIAgent`。

因此第一次对话成功的本质是：**Provider 认证正确 + 上下文足够 + 工具后端可达**。`hermes doctor` 不保证三者同时成立。

## 可选 · CLI 进阶：上下文引用（@ 语法）

首轮对话成功后，可在 CLI 输入框用 `@` 把文件、目录或 diff **展开进当前消息**，无需让 Agent 先猜路径再 `read_file`。依据官方 [Context References](https://hermes-agent.nousresearch.com/docs/user-guide/features/context-references)。Telegram、Discord 等 Gateway **不会**展开 `@`，仍可用 `read_file` 等工具。

| 语法 | 作用 |
| --- | --- |
| `@file:src/main.py` | 注入文件全文 |
| `@file:src/main.py:10-25` | 注入行范围（1 起始，含首尾） |
| `@folder:src/components` | 目录树与元数据（最多 200 项） |
| `@diff` | 工作区 `git diff` |
| `@staged` | `git diff --staged` |
| `@git:5` | 最近 N 次提交与 patch（N 上限 10） |
| `@url:https://example.com` | 抓取网页正文 |

示例：`审查 @file:src/auth.py:50-80，并对照 @diff 看是否有回归`。大文件用行范围，避免一次注入整库。

| 维度 | `@` 引用 | `session_search` |
| --- | --- | --- |
| 内容来源 | 当前工作区文件 / git / URL | `state.db` 历史消息 |
| 时机 | 发送前展开到用户消息 | 对话中工具按需查询 |
| 成本 | 占用上下文；软限约 25%、硬限约 50% 会警告或拒绝 | FTS 查询，无额外 LLM |
| 平台 | 主要支持 CLI | CLI 与 Gateway |

敏感路径如 `~/.ssh/`、`~/.hermes/.env` 会被阻断；工作区外与二进制文件会拒绝展开。

## 故障模式

| 现象 | 可能原因 | 处理 |
| --- | --- | --- |
| 空回复或反复 401 | Key 过期、OAuth 需重登、模型 ID 写错 | `hermes model` 重配；查 `~/.hermes/.env` |
| 启动报 context 过小 | 自托管默认 4k～8k | 按 [Quickstart](https://hermes-agent.nousresearch.com/docs/getting-started/quickstart) 与 [Providers](https://hermes-agent.nousresearch.com/docs/integrations/providers) 把 context 提到 ≥64K |
| 工具执行失败 | `terminal.backend` 为 docker 但 daemon 未起 | `/status` 看工作目录与 backend；`hermes doctor` |
| `--continue` 进了错会话 | 多 Profile 或多台机器 | `hermes sessions list`，必要时 `/new` 命名会话 |
| `/model` 切不过去 | 目标 Provider 从未在 `hermes model` 里配置 | 退出会话后跑 `hermes model` |
| 回复变慢或变傻 | 上下文接近上限 | `/usage`；必要时 `/compress` |

## 决策边界

- **不要在首轮对话未成功时配置 Gateway**：消息平台只会把 Provider 问题放大。
- **不要指望 `/model` 代替 `hermes model` 做 OAuth**：OAuth 与设备码流程只能在会话外完成。
- **不要用 <64K 上下文的本地模型「先试试」**：Hermes 的多工具工作流依赖足够大的系统提示与 tool schema 空间。
- **不要把 Slash 里的 `/yolo` 当默认**：它会跳过危险命令确认，适合隔离环境而非主力笔记本。

## 动手练习

1. 运行 `hermes model`，记下最终 provider 与 model 名称，与启动横幅交叉核对。
2. 完成 3 轮对话：第一轮要目录列表，第二轮追问某个文件内容，第三轮要求总结。
3. 执行 `hermes --continue`，确认 session 标题与历史一致。
4. 在会话内输入 `/`，浏览命令列表，试用 `/status` 与 `/usage`。
5. 用 `/new smoke-test` 开新会话，再 `/resume smoke-test` 验证命名恢复。

## 苏格拉底式反思

1. 你的主模型是订阅 OAuth 还是按量 API Key？配额耗尽时症状会是什么？
2. 若 Hermes 跑在远程 VPS 上，你在本机 CLI 里下的 `ls` 实际在哪台机器执行？
3. 何时应该用 `/new` 开新会话，而不是 `--continue` 堆在同一线程里？

## 读者自测

- [ ] 说清 `hermes model` 与 `/model` 的分工。
- [ ] 解释为何要求 ≥64K 上下文。
- [ ] 独立完成 `hermes` 启动、多轮对话、`hermes --continue` 恢复。
- [ ] 列举至少 5 个你会在调试时使用的 Slash 命令。

---

下一章：[记忆、学习与 Skill](./memory-learning-skills/)，弄清 `MEMORY.md` 的 frozen snapshot、`skill_manage`、持久目标与 Curator 如何支撑 closed learning loop。
