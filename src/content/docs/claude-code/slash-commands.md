---
title: Slash 命令与常用功能
description: 用 / 命令面板管理上下文、模型、权限与会话；掌握日常最常用命令，并知道如何查全量列表与自定义扩展。
sidebar:
  order: 6
---

*「`/compact` 和 `/clear` 到底差在哪？为什么同事说 `/btw` 几乎不占上下文？」*

[第一个会话](/claude-code/first-session/) 里你已经用过 `/help`、`/doctor` 和权限相关命令。本章把 Slash 命令当作**会话内的控制面板**系统讲清楚：怎么发现完整列表、日常该记哪些、按任务阶段怎么选，以及哪些能力会随版本和订阅变化。

命令表以 Anthropic 官方 [Commands](https://code.claude.com/docs/en/commands) 为准；下文在 2026 年 3 月前后核对。内置命令与 bundled skills 合计会随版本增减，**以你本机输入 `/` 显示的列表为准**。

---

## Slash 命令是什么

以 `/` 开头、出现在**消息最前面**的输入，会被 CLI 当作指令处理，而不是普通聊天内容。命令名之后的文字通常作为**参数**传给该命令，例如 `/export my-session.txt`、`/compact 保留与 auth 相关的决策`。

它和 [代理循环](/claude-code/agent-loop/) 里的工具有分工：

| 机制 | 谁发起 | 典型用途 |
|------|--------|----------|
| Slash 命令 | 你 | 切模型、清上下文、导出会话、开计划模式 |
| 内置工具 | 模型在循环中调用 | Read、Edit、Bash、Grep 等 |
| Bundled skill | 你以 `/` 触发，或模型在合适时自动用 | `/simplify`、`/loop`、`/batch` 等 |

在终端里输入 `/`，会弹出**当前版本、当前账号、当前环境**下可用的完整命令，并支持 `/hel` 这类前缀过滤。社区 cheatsheet 往往滞后；排查「有没有这个命令」时，以面板为准。

---

## 日常最值得记住的命令

不必背整张表。下面这组覆盖多数开发者**每天**会碰到的场景；记不住时回到 `/` 搜索即可。

| 命令 | 作用 | 典型场景 |
|------|------|----------|
| `/help` | 列出命令与简要说明 | 忘了命令名 |
| `/config` | 打开设置（模型、主题、输出风格等） | 换默认模型或权限模式 |
| `/model [名称]` | 切换模型；无参数时打开选择器 | 简单任务用 Sonnet，难题用 Opus |
| `/effort [low\|medium\|high\|…]` | 调整推理深度 | 避免简单问题占用高 effort |
| `/plan [描述]` | 直接进入计划模式并开始任务 | 大改前先只探索、出方案 |
| `/clear` | 清空当前对话上下文（旧会话仍可在 `/resume` 找回） | 任务彻底换了 |
| `/compact [说明]` | 压缩长对话为摘要，继续同一任务 | 同一 bug 聊了很多轮 |
| `/context [all]` | 查看上下文占用与优化提示 | 变慢或「变笨」时 |
| `/usage` | 用量与费用（别名 `/cost`、`/stats`） | 关心 token |
| `/rewind` | 回滚对话和/或代码到检查点 | 改乱了想撤销 |
| `/btw <问题>` | 旁白式短问，不污染主对话历史 | 中途查概念、不抢主线 |
| `/permissions` | 管理 allow / ask / deny | 弹窗太烦或要预授权 |
| `/doctor` | 诊断安装与环境 | 升级后异常 |
| `/init` | 生成或完善项目 `CLAUDE.md` | 新仓库起手 |
| `/export [文件名]` | 导出会话为纯文本 | 存档或分享 |
| `/diff` | 查看未提交改动与按轮次 diff | 提交前自查 |

### `/clear` 与 `/compact` 别混用

这是新手最常搞混的一对：

- **`/clear`**：换一道菜。上下文清空，适合功能 A 做完、要做无关功能 B。历史会话通过 `/resume` 仍可找回。
- **`/compact`**：换盘子不换菜。把**同一条任务**的长对话压成摘要，腾出窗口继续修同一个问题。

能向同事讲清这句区别，比多记十个冷门命令更有用。更长的上下文策略见 [上下文管理与多代理](/claude-code/context-management/)。

### `/btw`：不抢主线的旁白

`/btw` 用于**短问、快答**：例如「这个报错码一般表示什么？」主任务仍是改 auth 模块时，用 `/btw` 比在主线里插一大段解释更省上下文。官方说明见 [Side questions with /btw](https://code.claude.com/docs/en/interactive-mode#side-questions-with-%2Fbtw)。

### `/rewind`：对话与代码的检查点

`/rewind`（别名 `/checkpoint`、`/undo`）可回滚对话和/或工作区到先前检查点，也可从某条消息起做摘要。Esc 连按两次在部分版本会打开同类界面。适合「这一轮改坏了，但不想 `/clear` 丢掉全部背景」时使用。机制见官方 [Checkpointing](https://code.claude.com/docs/en/checkpointing)。

---

## 按工作阶段选用命令

官方文档按典型流程组织命令；下面用中文场景对齐，便于你对号入座。

### 第一次进仓库

```
/init
/memory          # 编辑 CLAUDE.md 与记忆文件
/mcp             # 连接外部服务
/agents          # 配置子代理
/permissions     # 设定 allow / ask / deny
```

`/init` 会生成 starter `CLAUDE.md`；团队规范与分层记忆见 [第四部分 · 项目记忆](/claude-code/claude-md/)。`/fewer-permission-prompts` 是 bundled skill，可扫描历史 transcript 并建议只读类 allow 规则，减少打断。

### 任务进行中

| 需求 | 命令 |
|------|------|
| 大改前先规划 | `/plan` 或 `Shift+Tab` 切到 plan 权限模式 |
| 调模型与推理成本 | `/model`、`/effort`、`/fast` |
| 上下文快满 | `/context`，再 `/compact` |
| 旁问一句 | `/btw` |
| 看改了什么 | `/diff` |
| 设持续目标 | `/goal <条件>` |

计划模式与权限模式 `plan` 的关系，见 [Plan Mode](/claude-code/plan-mode/)。**没有单独的 `/execute` 命令**：批准计划后通过切换权限模式或让模型调用 `ExitPlanMode` 进入执行段。

### 并行与后台

| 命令 | 作用 |
|------|------|
| `/branch [名称]` | 从当前对话点分叉；别名 `/fork`（注意环境变量下 `/fork` 行为可能不同） |
| `/background`（`/bg`） | 将会话挂到后台，释放当前终端 |
| `/tasks`（`/bashes`） | 列出本会话后台任务 |
| `/batch <描述>` | bundled skill：拆分为多单元并在 worktree 中并行（需 git 仓库） |

子代理与并行策略见 [SubAgents](/claude-code/subagents/) 与 [上下文管理](/claude-code/context-management/)。

### 提交前打磨

| 命令 | 作用 |
|------|------|
| `/diff` | 交互式查看改动 |
| `/simplify [焦点]` | bundled skill：三路并行审查近期改动文件并应用修复 |
| `/review [PR]` | 本地 PR 审查 |
| `/security-review` | 针对当前分支 pending 变更的安全审查 |

`/simplify` 会 spawn 三个审查代理并行分析，再汇总并改代码；可带焦点，例如 `/simplify focus on memory efficiency`。不要把它当成「只读安全审计」的唯一手段；深度安全仍应配合 CI 与人工 review。

### 会话之间

| 命令 | 作用 |
|------|------|
| `/resume [名称或 ID]` | 恢复历史会话（别名 `/continue`） |
| `/branch` | 分叉对话尝试另一方案 |
| `/teleport`（`/tp`） | 把 Claude Code on the web 的会话拉到本终端 |
| `/remote-control`（`/rc`） | 让 claude.ai 远程继续本会话 |
| `/export` | 导出全文 |

### 出问题的时候

| 命令 | 作用 |
|------|------|
| `/rewind` | 回滚或摘要 |
| `/doctor` | 安装与健康检查 |
| `/debug [描述]` | bundled skill：开启并分析会话 debug 日志 |
| `/feedback`（`/bug`） | 带会话上下文提交反馈 |

---

## 模型、用量与洞察

| 命令 | 说明 |
|------|------|
| `/model [model]` | 切换模型；部分组合支持在 picker 里调 effort |
| `/effort [level\|auto]` | 设置推理 effort；`auto` 恢复模型默认 |
| `/fast [on\|off]` | 快速模式开关 |
| `/usage` | 费用、限额、活动统计（`/cost`、`/stats` 为别名） |
| `/status` | 版本、模型、账号、连通性 |
| `/insights` | 基于历史会话生成使用分析报告 |

社区常说的 **opusplan** 一类混合规划/执行策略，若在你版本中可用，一般通过 `/model` 选择对应模型名实现，而非独立 slash 命令。以 `/model` 选择器里实际列出的项为准。

---

## 配置、扩展与集成

| 命令 | 说明 |
|------|------|
| `/hooks` | 查看 Hook 配置 |
| `/skills` | 列出 skills，含 token 估算 |
| `/mcp` | 管理 MCP 连接与 OAuth |
| `/agents` | 管理子代理配置 |
| `/plugin`、`/reload-plugins` | 插件管理与热重载 |
| `/keybindings` | 编辑快捷键配置 |
| `/theme`、`/output-style`、`/statusline` | 外观与状态行 |
| `/terminal-setup` | 配置 Shift+Enter 等（部分终端才显示） |
| `/sandbox` | 切换沙箱 Bash |
| `/login`、`/logout` | 账号登录登出 |

自定义 Slash 命令与 bundled skills 共用同一套机制：在 `~/.claude/commands/` 或项目 `.claude/commands/` 放置 Markdown，或在 skills 目录定义。详见 [Skills](/claude-code/skills/)。MCP 服务器还可暴露 `/mcp__<server>__<prompt>` 形式命令。

---

## Bundled skills 与内置命令的区别

官方表中标注 **[Skill]** 的条目（如 `/simplify`、`/loop`、`/batch`、`/debug`、`/claude-api`）是 **bundled skills**：本质是把一段提示交给 Claude 执行，你也可以在 [Skills](/claude-code/skills/) 中按同样方式自建。

| 类型 | 例子 | 行为来源 |
|------|------|----------|
| 内置命令 | `/clear`、`/model`、`/doctor` | 编进 CLI，行为固定 |
| Bundled skill | `/simplify`、`/loop` | 提示驱动，可随版本更新 prompt |

常用 bundled skill 速览：

| 命令 | 用途 |
|------|------|
| `/loop [间隔] [提示]` | 在会话保持打开时重复执行；与云端 Routines 区别见 [Routines 与定时自动化](/claude-code/routines-automation/) |
| `/batch <描述>` | 大规模并行改动编排 |
| `/debug [描述]` | 会话级 debug 日志分析 |
| `/simplify [焦点]` | 并行审查并修复近期改动 |

---

## 远程、桌面与移动端

| 命令 | 说明 |
|------|------|
| `/remote-control`（`/rc`） | 从浏览器继续本地会话 |
| `/teleport` | 从 web 会话拉回终端 |
| `/desktop`（`/app`） | 转到 Desktop 应用（macOS / Windows） |
| `/mobile`（`/ios`、`/android`） | 显示移动端下载二维码 |
| `/voice [hold\|tap\|off]` | 语音听写 |
| `/chrome` | Claude in Chrome 相关设置 |

语音、Chrome、`/fast`、statusline 等体验增强说明见 [Chrome 与 Web UI 测试](/claude-code/chrome-browser-testing/#体验增强cli)。

这些命令**并非每个账号都显示**，常依赖 claude.ai 订阅、平台或企业配置。

---

## 全量命令速查（分类索引）

下列分类便于检索；具体参数、别名与是否显示以官方表为准：[Commands · All commands](https://code.claude.com/docs/en/commands#all-commands)。

**会话与上下文：** `/clear`、`/compact`、`/rewind`、`/recap`、`/copy`、`/rename`、`/resume`、`/branch`、`/export`、`/add-dir`

**模型与执行：** `/model`、`/effort`、`/fast`、`/plan`、`/goal`、`/sandbox`

**代码质量：** `/diff`、`/simplify`、`/review`、`/security-review`、`/ultrareview`

**并行与后台：** `/background`、`/batch`、`/tasks`、`/stop`

**分析与账号：** `/context`、`/usage`、`/insights`、`/status`、`/release-notes`

**项目与协作：** `/init`、`/memory`、`/install-github-app`、`/autofix-pr`、`/team-onboarding`

**系统：** `/config`、`/help`、`/exit`、`/doctor`、`/debug`、`/feedback`、`/heapdump`

**云与供应商向导：** `/setup-bedrock`、`/setup-vertex`、`/web-setup`、`/schedule`（`/routines`，见 [Routines 与定时自动化](/claude-code/routines-automation/)）

部分命令会**随版本移除或改名**，例如旧版 `/vim` 已改为在 `/config` 中切换编辑器模式；`/pr-comments` 在较新版本已移除，应直接让 Claude 读 PR 评论。读到第三方 cheatsheet 时，先用 `/` 面板核对。

---

## 常见误用与边界

| 误用 | 后果 | 更稳妥做法 |
|------|------|------------|
| 大任务不换话题却狂用 `/compact` | 摘要丢细节，修偏 | 任务切换用 `/clear`；compact 时加焦点说明 |
| 把 `/simplify` 当提交前唯一审查 | 漏掉业务逻辑与产品风险 | 配合测试、`/review`、人工看 diff |
| 假设 cheatsheet 里每条命令都存在 | 版本或订阅不匹配时报错 | 以 `/` 面板为准 |
| 在主线里问很长的旁白问题 | 挤占上下文 | 用 `/btw` |
| `/branch` 与 Git 分支混淆 | 以为已经 `git checkout` | `/branch` 是对话分叉；Git 仍要你自己管理 |

**可用性边界：** 平台、订阅、环境变量会影响命令是否出现。Bedrock、Vertex、Foundry 等部署下，部分消费级功能不会显示。第三方 API 网关场景下，以提供商文档为准。

---

## 动手检查

在已配置好的项目根启动 `claude`，依次完成：

1. 输入 `/`，记录你账号下**大约有多少条**命令（内置 + skill + MCP），不必抄全表。  
2. 运行 `/context`，再发几轮与项目无关的闲聊，观察占用变化。  
3. 对同一小问题分别试：主线提问 vs `/btw <同一问题>`，感受主对话长度差异。  
4. 运行 `/doctor`，确认无红色阻塞项。  
5. 打开 `/permissions`，说出一个你已 `allow` 的规则及其匹配模式。

五项都能解释结果，说明你已经能**自助查命令**，而不依赖静态列表。

---

## 自定义你的命令面板

1. **项目级：** 在 `.claude/commands/foo.md` 写团队共享命令。  
2. **个人级：** 在 `~/.claude/commands/` 写仅自己用的命令。  
3. **Skill：** 复杂工作流用 `SKILL.md`，可被 `/skills` 列出，也可被模型自动选用。  
4. **MCP：** 连接服务器后，动态出现 `/mcp__…` 命令。

写自定义命令时，在 frontmatter 里声明 `description`、`allowed-tools` 和参数提示，和官方 [Skills](https://code.claude.com/docs/en/skills) 一致。团队 onboarding 可试 `/team-onboarding` 生成基于你近 30 天用法的说明稿。

---

下一章：[多平台运行环境全览](/claude-code/platforms-overview/)——Slash 命令管「会话怎么开」；先选对 CLI、IDE 或 Web 入口，再进入代理循环。
