---
title: 认识 Hermes Agent
description: 弄清 Hermes Agent 是什么、closed learning loop 如何工作，以及它与聊天工具、IDE 副驾驶和 Agent 框架的差异。
sidebar:
  order: 1
---

*「装一个能自己写 Skill、记住你偏好、还能在 Telegram 里回消息的 Agent，和再开一个 ChatGPT 窗口，差在哪里？」*

如果你把 Hermes 当成「终端里的聊天机器人」，很容易在第一次配置 Gateway、Skill 或记忆文件时感到多余。Hermes 的设计目标不是替代你打字，而是**在长期运行中积累可复用的能力**：把一次复杂任务里摸索出的步骤写成 Skill，把环境事实写进 `MEMORY.md`，并在下次会话里直接调用。

本章回答三个问题：Hermes 是什么、它靠什么「越用越强」、以及你该不该为它投入学习成本。

## 基本单元：自主 Agent，而不是聊天窗口

多数 AI 产品的基本单元是**一轮问答**：你输入，模型输出，会话结束或刷新后上下文清空。

Hermes 的基本单元是 **Agent Loop**：接收意图 → 组装系统提示 → 调用模型 → 若返回工具调用则执行并再次调用模型 → 直到给出最终回复并持久化会话。同一套 `AIAgent` 类驱动 CLI、TUI、消息网关、定时任务和编辑器 ACP 集成，平台差异留在入口适配层，而不是散落在核心逻辑里。

这意味着三件事：

| 能力 | 可观察行为 | 对读者的意义 |
| --- | --- | --- |
| **工具执行** | 可读文件、跑终端、搜网页、控浏览器等 70+ 内置工具 | 回复不只停留在文字，可基于真实命令输出 |
| **跨会话状态** | `MEMORY.md`、`USER.md`、SQLite 会话库与 FTS5 检索 | 关键事实可保留，历史对话可搜索 |
| **程序性记忆** | `~/.hermes/skills/` 下的 `SKILL.md`，由 `skill_manage` 创建与修订 | 复杂工作流可沉淀为可重复调用的「手册」 |

三项能力组合起来，才构成官方所说的 [closed learning loop](https://hermes-agent.nousresearch.com/docs/)：在解决问题过程中写 Skill、维护记忆、检索旧会话，并由 **Curator** 在空闲时整理 Agent 自创建的 Skill，避免技能库无限膨胀。

## Closed learning loop：机制，不是口号

「自改进」容易被理解成模型变聪明。在 Hermes 里，更准确的描述是：**Agent 拥有自己可读写的外部工件**，系统提示引导它在合适时机更新这些工件。

### 1. 声明式记忆：`MEMORY.md` 与 `USER.md`

路径默认为 `~/.hermes/memories/`。Agent 通过 `memory` 工具增删改条目；会话开始时，内容以 **frozen snapshot** 注入系统提示，会话中途写入磁盘，但**不会**立刻改变当前会话里的系统提示块。这样设计是为了保持提示前缀稳定，便于 Prompt Caching，新记忆在**下一次会话**生效。

- `MEMORY.md`：环境、项目惯例、踩坑记录等，约 2200 字符上限。
- `USER.md`：沟通偏好、角色信息等，约 1375 字符上限。

写入前会做安全扫描，拦截明显的注入与外传模式。详见官方 [Memory](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory)。

### 2. 程序性记忆：Skill

Skill 是带 YAML 前言的 Markdown 文档，兼容 [agentskills.io](https://agentskills.io/) 开放标准。系统提示里通常只放 **Level 0** 索引（名称与描述）；需要时再 `skill_view` 加载全文，避免一次性塞满上下文。

官方 [Skills 文档](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills) 写明：在完成**复杂任务（例如 5 次以上工具调用）**、踩坑后找到可行路径、或用户纠正做法等情况下，Agent 应倾向用 `skill_manage` 保存或修订 Skill。Hub 上的第三方 Skill **只能由用户**通过 `hermes skills install` 安装，Agent 不能自行拉取未信任包。

### 3. 会话检索：`session_search`

所有 CLI 与网关会话写入 `~/.hermes/state.db`，支持 FTS5 全文检索。适合「上周我们是否讨论过某配置」类问题，与始终占位的 `MEMORY.md` 互补。

### 4. 维护：Curator

Agent 自创建的 Skill 可能越积越多。[Curator](https://hermes-agent.nousresearch.com/docs/user-guide/features/curator) 在默认空闲条件下周期性运行：未使用 Skill 标记为 stale 或归档到 `~/.hermes/skills/.archive/`，必要时用辅助模型提议合并。可用 `hermes curator pin` 保护关键 Skill；运行前可用 `hermes curator run --dry-run` 预览。

可选：通过 `hermes memory setup` 接入 Honcho、Mem0 等**外部记忆插件**，与内置 `MEMORY.md`/`USER.md` **并存**，不替换内置层。

## 它不是什么：和常见工具的分工

| 维度 | Hermes Agent | 典型 IDE Copilot / 聊天助手 | Auto-GPT 类循环 | LangChain 等框架 |
| --- | --- | --- | --- | --- |
| 主要界面 | CLI、TUI、20+ 消息平台、Cron | 编辑器内或网页 | 脚本/实验项目 | 需自建服务 |
| 跨会话记忆 | 内置文件 + SessionDB + 可选插件 | 通常弱或会话级 | 实现差异大 | 自行接向量库 |
| 工作流沉淀 | 一等公民 Skill + Curator | 少见 | 少见标准化 | 自行设计 |
| 自改进闭环 | 官方默认路径 | 一般无 | 易漂移、难维护 | 无默认实现 |
| 模型选择 | `hermes model`，多 Provider，要求 **≥64K** 上下文 | 绑定厂商 | 视配置 | 任意 |

与本站 [Claude Code 专题](/claude-code/what-is-claude-code/) 的关系：Claude Code 强在**绑定代码库、高权限本地工程循环**；Hermes 强在**长期驻留、多平台触达、自编写 Skill 与网关自动化**。二者可并存：例如在仓库里用 Claude Code 改代码，在 VPS 上用 Hermes 跑定时巡检并把结果推到 Telegram。

关于 **OpenClaw** 等其它 Agent 产品：功能重叠会随版本变化。撰写对比时只写你能从官方文档或发布说明核实的条目，其余标为「未核实」。

## 运行形态：不绑在你的笔记本上

官方定位强调：Hermes 可以跑在低价 VPS、远程 SSH 主机，或通过 Daytona、Modal 等后端在沙箱里执行终端命令。你用 Telegram 发消息，实际命令可能在云端环境执行。

终端后端包括 local、docker、ssh、daytona、modal、singularity 等（以 [Architecture](https://hermes-agent.nousresearch.com/docs/developer-guide/architecture) 当前列表为准）。**同一套 Agent 核心**，换的是命令执行的 blast radius。

消息侧，单个 Gateway 进程可对接 Telegram、Discord、Slack、WhatsApp、Signal、飞书、企业微信、QQ 等适配器，并支持自然语言 Cron 与跨平台投递。细节留到后续「消息网关」一章。

## 适用场景

以下场景与 Hermes 的设计较匹配：

- **个人长期助理**：记住偏好与常用环境，在 IM 里完成查资料、跑脚本、提醒类任务。
- **研发与运维自动化**：在 Docker 或远程主机中执行检查、生成报告、按 Skill 固化发布流程。
- **产品 / 项目管理**：跨会话保留决策上下文，用 Skill 固定周报或需求拆解模板。
- **研究与批处理**：轨迹导出、与 Atropos 等训练管线集成（进阶主题）。

## 决策边界：何时不必上 Hermes

- **只想偶尔问一句、不需要工具和记忆**：直接用网页聊天或 IDE 内助手，启动与维护成本更低。
- **主要需求是深度改本地 monorepo**：优先 Claude Code、Cursor Agent 等 IDE 原生方案。
- **合规禁止代码或日志出网**：Hermes 默认调用云端模型 API，需先确认数据出境与密钥管理策略。
- **期望「装完就零配置完美」**：你仍需配置 Provider、审批策略，并理解 Skill 与记忆文件的作用，否则容易觉得「和 ChatGPT 差不多」。

## 最小认知图

```text
你（CLI / Telegram / Cron …）
        │
        ▼
  入口：CLI · Gateway · Cron · ACP
        │
        ▼
  AIAgent：组 prompt → 调模型 → 执行工具 → 循环
        │
        ├─ Tools（终端、文件、网页、浏览器 …）
        ├─ Skills（SKILL.md，渐进加载）
        ├─ Memory（MEMORY.md / USER.md，frozen snapshot）
        └─ Sessions（SQLite + FTS5）
```

## 苏格拉底式反思

1. 你目前工作流里，哪些步骤每次都要重新解释一遍？它们适合写成 Skill，还是写进 `AGENTS.md`？
2. 若 Agent 自动写入的记忆有一条是错的，你会如何发现并修正？这如何影响你对「自改进」的信任边界？
3. 你愿意把命令执行放在 local 还是 docker/远程？这与你在 IM 里使用 Gateway 的风险承受度是否一致？

## 读者自测

- [ ] 用一句话说明 Agent Loop 与「单轮聊天」的区别。
- [ ] 说出 `MEMORY.md` 与 Skill 各解决哪类问题。
- [ ] 解释 frozen snapshot：为何 mid-session 改记忆不会立刻出现在系统提示里。

---

下一章：[安装与环境准备](./installation-setup/)，完成安装、`hermes doctor` 诊断，并弄清各平台安装差异。
