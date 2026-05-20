# Hermes Agent 教程系列 · HANDOFF

> **用途**：制作进度与撰写要点。正文为简体中文；机制以 [官方文档](https://hermes-agent.nousresearch.com/docs/) 与 [GitHub](https://github.com/NousResearch/hermes-agent) 为准。
>
> **站点**：内容目录 `src/content/docs/hermes-agent/`，文档路由 `/hermes-agent/`，侧栏 `src/config/hermes-agent-sidebar.ts`。首页与 Claude Code 落地页已接入 Hermes 入口。

**状态**：`[ ]` 未完成 · `[x]` 已完成

---

## 制作清单

### 入门

- [x] **认识 Hermes Agent** — 定位、closed learning loop、与 Copilot/Auto-GPT/LangChain 对比、适用场景  
  - 文稿：`src/content/docs/hermes-agent/what-is-hermes-agent.md`
- [x] **安装与环境准备** — 一键安装、`hermes postinstall`、`hermes doctor`、Linux/macOS/WSL/Termux/Windows  
  - 文稿：`src/content/docs/hermes-agent/installation-setup.md`
- [x] **第一次对话** — `hermes model`、`hermes` / `hermes --tui`、Slash 命令、`hermes --continue`、≥64K 上下文  
  - 文稿：`src/content/docs/hermes-agent/first-conversation.md`

### 核心机制

- [x] **记忆、学习与 Skill** — `MEMORY.md`/`USER.md`、frozen snapshot、`session_search`、`skill_manage`、Curator、可选 Honcho 等  
  - 文稿：`src/content/docs/hermes-agent/memory-learning-skills.md`
- [ ] **配置与个性化** — `config.yaml`、`.env`、`SOUL.md`、`AGENTS.md`、Profile（`hermes -p`）  
  - 来源：[Configuration](https://hermes-agent.nousresearch.com/docs/user-guide/configuration)、[Personality](https://hermes-agent.nousresearch.com/docs/user-guide/features/personality)、[Context Files](https://hermes-agent.nousresearch.com/docs/user-guide/features/context-files)
- [ ] **工具系统** — Toolsets、`hermes tools`、执行环境（local/docker/ssh 等）、审批与沙箱、MCP  
  - 来源：[Tools](https://hermes-agent.nousresearch.com/docs/user-guide/features/tools)、[Security](https://hermes-agent.nousresearch.com/docs/user-guide/security)、[MCP](https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp)

### 实战

- [ ] **消息网关** — `hermes gateway setup`、多平台、授权与配对、Cron 推送  
  - 来源：[Messaging](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/)
- [ ] **技能系统实战** — `SKILL.md` 结构、Hub 安装、`hermes curator`、手写与 Agent 自创建 Skill  
  - 来源：[Skills](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills)
- [ ] **高级特性** — Voice、浏览器/视觉/TTS、子 Agent 委托、`hermes acp`、`execute_code`  
  - 来源：[Voice Mode](https://hermes-agent.nousresearch.com/docs/user-guide/features/voice-mode)、[ACP](https://hermes-agent.nousresearch.com/docs/user-guide/features/acp)

### 进阶

- [ ] **安全、性能与最佳实践** — 命令审批、容器隔离、Prompt Caching、`auxiliary.*`、`hermes doctor`  
  - 来源：[Security](https://hermes-agent.nousresearch.com/docs/user-guide/security)、[Tips](https://hermes-agent.nousresearch.com/docs/guides/tips)、[Context Compression & Caching](https://hermes-agent.nousresearch.com/docs/developer-guide/context-compression-and-caching)
- [ ] **架构拆解** — Agent Loop、Prompt 组装、`tools/registry.py`、`COMMAND_REGISTRY`、Gateway/Cron 数据流  
  - 来源：[Architecture](https://hermes-agent.nousresearch.com/docs/developer-guide/architecture)、[Agent Loop](https://hermes-agent.nousresearch.com/docs/developer-guide/agent-loop)、[Prompt Assembly](https://hermes-agent.nousresearch.com/docs/developer-guide/prompt-assembly)
- [ ] **从零实现类似 Agent** — Loop、CLI、工具注册表、记忆与 Persona、Skill 披露、Gateway、MCP、Profile  
  - 来源：[DEV Build-Your-Own](https://dev.to/truongpx396/hermes-agent-deep-dive-build-your-own-guide-1pcc)、Contributing
- [ ] **贡献与社区** — Skills Hub 发布、核心仓库 PR、Trajectories/Atropos、生产案例  
  - 来源：GitHub CONTRIBUTING、Trajectories 文档
- [ ] **系列总结与自测** — 能力边界、自测项、下一步真实项目  
  - 自测项见下文「读者自测」

### 站点与配套（非正文章节）

- [ ] Hermes 专题落地页 `src/pages/hermes-agent/index.astro`
- [ ] 侧栏 `src/config/hermes-agent-sidebar.ts`
- [x] 首页轨道改为可进入（`src/pages/index.astro`）
- [ ] `astro.config.mjs` 路由/重定向（若需要）

---

## 撰写约定（摘自 CLAUDE.md）

- Frontmatter：`title`、`description`、`sidebar.order`
- 正文结构：场景 → 概念 → 最小路径（命令/文件）→ 机制 → 故障模式 → 边界 → 练习 → 下一主题链接
- 每章至少一个误用边界；重要结论有官方来源或标注推断
- 版本锚点：撰写前复核 **v0.14.x** 与 `hermes --version`
- 不写天数/周数学习路径；Skill 创建条件以官方 **5+ tool calls** 等表述为准，勿写死社区「15 次」说法

---

## 参考备忘

### 系列主轴（一句话）

Hermes 是模型无关的自主 Agent：**闭环自改进**（`skill_manage` + `memory` + 会话检索 + Curator），可跑 CLI/TUI/Gateway/Cron，70+ 工具与 MCP 扩展。

### 官方文档索引

| 区块 | 链接 |
| --- | --- |
| 安装 / 上手 | [Installation](https://hermes-agent.nousresearch.com/docs/getting-started/installation)、[Quickstart](https://hermes-agent.nousresearch.com/docs/getting-started/quickstart) |
| 用户指南 | [Configuration](https://hermes-agent.nousresearch.com/docs/user-guide/configuration)、[Messaging](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/)、[Memory](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory)、[Skills](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills) |
| 开发者 | [Architecture](https://hermes-agent.nousresearch.com/docs/developer-guide/architecture)、[Agent Loop](https://hermes-agent.nousresearch.com/docs/developer-guide/agent-loop) |
| 机器可读 | [llms.txt](https://hermes-agent.nousresearch.com/docs/llms.txt) |

### 竞品对比（第 1 篇素材）

| 维度 | Hermes | 典型聊天/IDE Agent | Auto-GPT 类 | LangChain |
| --- | --- | --- | --- | --- |
| 跨会话记忆 | MEMORY/USER + SessionDB + 可选插件 | 通常弱 | 因实现而异 | 自建 |
| 程序性记忆 | Skill + `skill_manage` | 少见 | 少见标准化 | 自建 |
| 自改进 | closed loop + Curator | 一般无 | 易漂移 | 无默认 |
| 多平台 | Gateway 20+ | 少见 | 少见 | 自建 |

### 读者自测（总结篇可复用）

- [ ] `hermes doctor` 通过
- [ ] `hermes model` + 多轮对话 + `hermes --continue`
- [ ] 说清 frozen snapshot 与 `memory` 工具
- [ ] 说清 Skill L0/L1 与 `skill_manage`
- [ ] Gateway 或说明跳过原因
- [ ] Tool 审批与 sandbox 边界
- [ ] 能简述 AIAgent 在 CLI/Gateway 中的位置

---

## 变更记录

| 日期 | 说明 |
| --- | --- |
| 2026-05-20 | 初版 HANDOFF |
| 2026-05-20 | 改为主题清单 + 完成状态，移除 Part/天数/阶段/月路线图 |
| 2026-05-20 | 完成入门第 1–2 章文稿并接入 Starlight 侧栏 |
| 2026-05-20 | 完成入门第 3 章与核心机制第 4 章，更新侧栏与漫游指南索引 |
