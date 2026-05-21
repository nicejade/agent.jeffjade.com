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
- [x] **配置与个性化** — `config.yaml`、`.env`、`SOUL.md`、`AGENTS.md`、Profile（`hermes -p`）  
  - 文稿：`src/content/docs/hermes-agent/configuration-personalization.md`
- [x] **工具系统** — Toolsets、`hermes tools`、执行环境（local/docker/ssh 等）、审批与沙箱、MCP  
  - 文稿：`src/content/docs/hermes-agent/tools-system.md`

### 实战

- [x] **消息网关** — `hermes gateway setup`、多平台、授权与配对、Cron 推送  
  - 文稿：`src/content/docs/hermes-agent/messaging-gateway.md`
- [x] **技能系统实战** — `SKILL.md` 结构、Hub 安装、`hermes curator`、手写与 Agent 自创建 Skill  
  - 文稿：`src/content/docs/hermes-agent/skills-in-practice.md`
- [x] **高级特性** — Voice、浏览器/视觉/TTS、子 Agent 委托、`hermes acp`、`execute_code`  
  - 文稿：`src/content/docs/hermes-agent/advanced-features.md`

### 进阶

- [x] **安全、性能与最佳实践** — 命令审批、容器隔离、Prompt Caching、`auxiliary.*`、`hermes doctor`  
  - 文稿：`src/content/docs/hermes-agent/security-performance-best-practices.md`
- [x] **架构拆解** — Agent Loop、Prompt 组装、`tools/registry.py`、`COMMAND_REGISTRY`、Gateway/Cron 数据流  
  - 文稿：`src/content/docs/hermes-agent/architecture-deep-dive.md`
- [x] **从零实现类似 Agent** — Loop、CLI、工具注册表、记忆与 Persona、Skill 披露、Gateway、MCP、Profile  
  - 文稿：`src/content/docs/hermes-agent/build-your-own-agent.md`
- [x] **贡献与社区** — Skills Hub 发布、核心仓库 PR、Trajectories/Atropos、生产案例  
  - 文稿：`src/content/docs/hermes-agent/contributing-and-community.md`
- [x] **系列总结与自测** — 能力边界、自测项、下一步真实项目  
  - 文稿：`src/content/docs/hermes-agent/series-summary-and-self-test.md`

### 站点与配套（非正文章节）

- [x] Hermes 专题落地页 `src/pages/hermes-agent/index.astro`
- [x] 侧栏 `src/config/hermes-agent-sidebar.ts`（含进阶三章）
- [x] 首页轨道改为可进入（`src/pages/index.astro`）
- [x] `astro.config.mjs` 旧路径 `/hermes-agent-guide/<slug>/` 重定向（14 章 slug）

---

## 缺口与增补计划（v2）

> 依据：对照 [Hermes 官方文档](https://hermes-agent.nousresearch.com/docs/) 与 [llms.txt](https://hermes-agent.nousresearch.com/docs/llms.txt) 复盘 14 章覆盖度，下列条目为「完全缺失 / 深度不足 / 研究视角缺位」三类增量。每条标注**新增章节**或**现章扩写**，含建议落点。

### 高优先级（先补）

- [x] **Event Hooks（事件钩子）** — 新增章节  
  - 文稿：`src/content/docs/hermes-agent/event-hooks.md`  
  - 范围：Gateway hooks（`HOOK.yaml` + `handler.py`）、Plugin hooks（`ctx.register_hook()`，含 `pre_tool_call` 拦截、`pre_llm_call` 注入上下文、`transform_tool_result`、`transform_llm_output` 等）、Shell hooks（`config.yaml` 内 shell 脚本）。  
  - 建议位置：实战分组，置于「高级特性」之前；侧栏新增条目。  
  - 必含：三种钩子矩阵、最小可跑示例、阻断/放行决策表、与审批/沙箱的关系。
- [x] **Checkpoints & Rollback** — 并入安全章  
  - 落点：`src/content/docs/hermes-agent/security-performance-best-practices.md`  
  - 范围：写文件前自动快照工作目录、`/rollback`、`checkpoints.enabled` 与 `hermes chat --checkpoints`、与 git 工作流的协同与冲突。  
  - 建议位置：「安全、性能与最佳实践」内新增独立小节，或单列实战短章。  
  - 必含：触发条件、快照路径、回滚边界（不可逆操作清单）。
- [x] **Context References（@ 引用语法）** — 现章扩写  
  - 落点：`first-conversation.md`、`configuration-personalization.md`  
  - 范围：`@file`、`@dir`、`@diff`、`@url` 展开规则；超长内容截断；与 `session_search` 的差异。  
  - 落点：「第一次对话」补成独立小节，并在「配置与个性化」交叉引用。

### 中优先级

- [x] **Kanban 多 Agent 看板** — 新增章节  
  - 文稿：`src/content/docs/hermes-agent/kanban-multi-agent-board.md`  
  - 范围：Multi-Agent Board、worker lanes、卡片状态机、与 `delegate_task` 的取舍。  
  - 建议位置：实战分组，紧邻「高级特性」。
- [x] **Plugins 系统** — 新增章节  
  - 文稿：`src/content/docs/hermes-agent/plugins-system.md`  
  - 范围：通用插件 / 记忆插件 / 上下文引擎三类、`hermes plugins` CLI、与 Hooks 和 Skill 的边界。  
  - 建议位置：进阶分组，置于「架构拆解」之前。
- [x] **Persistent Goals** — 现章扩写  
  - 范围：`/goal` 跨会话目标、辅助模型判定、预算与抢占、与 MEMORY.md 的关系。  
  - 落点：「记忆、学习与 Skill」新增小节，「第一次对话」保留入口提示。
- [x] **Web Dashboard** — 现章扩写  
  - 范围：浏览器面板能力清单、远程访问与鉴权、VPS 长跑场景。  
  - 落点：「消息网关」或「安全、性能与最佳实践」中并入运维小节。
- [x] **API Server（OpenAI 兼容）** — 现章扩写  
  - 范围：`hermes server` 启动、Open WebUI / LobeChat / LibreChat 接入步骤、鉴权与限流。  
  - 落点：「架构拆解」补操作小节；「高级特性」交叉链接。

### 现章补强（深度不足）

- [x] **记忆插件生态对比** — 落点「记忆、学习与 Skill」  
  - 覆盖 Honcho、OpenViking、Mem0、Hindsight、Holographic、RetainDB、ByteRover、Supermemory：定位、接入命令、数据归属、典型坑点、对比表。
- [x] **Provider Routing / Fallback / Credential Pools** — 落点「配置与个性化」  
  - 三机制各给一段独立 YAML 与决策边界（按成本/速度/质量分流、主备切换、多 Key 轮换），避免再合并叙述。
- [x] **Batch Processing 与 RL Training** — 落点「贡献与社区」  
  - 批跑命令、ShareGPT 轨迹格式、Atropos 训练管线对接。
- [x] **记忆失效与修正** — 落点「记忆、学习与 Skill」  
  - 错误记忆识别信号、`hermes memory` CLI、手动编辑、Curator 触发清理。
- [x] **Skill 完整生命周期闭环** — 落点「技能系统实战」  
  - 创建 → 使用计数 → stale 判定 → archive → 手动 pin → `hermes skills publish` 到 agentskills.io → 从 Hub 安装；附状态机图。
- [x] **成本控制框架** — 落点「安全、性能与最佳实践」  
  - 大头识别（子 Agent / 云浏览器 / 流式 TTS）、`auxiliary.*` 实测收益、Prompt Caching 生效条件、`hermes logs` 审计示例。

### 站点与配套（v2 调整）

- [x] 侧栏 `src/config/hermes-agent-sidebar.ts` 新增 Event Hooks / Kanban / Plugins 条目；同步落地页 `src/pages/hermes-agent/index.astro`（17 章）。
- [x] 漫游指南索引 `src/content/docs/hermes-agent/index.md` 已更新。
- [x] `astro.config.mjs` 已补充 `event-hooks`、`kanban-multi-agent-board`、`plugins-system` 重定向 slug。

### 撰写顺序建议

1. 先做高优先级三项（Hooks / Checkpoints / @ 引用）：补完日常安全与扩展底盘。
2. 中优先级按读者路径推进：Kanban → Plugins → Persistent Goals → Web Dashboard → API Server。
3. 现章补强穿插进行；每次只动目标章，不重写无关章节。

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
| 2026-05-20 | 完成核心机制第 5–6 章（配置与个性化、工具系统），更新侧栏与 HANDOFF |
| 2026-05-20 | 完成实战第 7–8 章（消息网关、技能系统实战），更新侧栏与漫游指南索引 |
| 2026-05-20 | 完成实战第 9 章（高级特性），更新侧栏与漫游指南索引 |
| 2026-05-20 | 完成进阶第 10–12 章（安全与性能、架构拆解、从零实现），更新侧栏与漫游指南 |
| 2026-05-20 | 完成进阶第 13–14 章（贡献与社区、系列总结与自测），Hermes 正文章节全部完结 |
| 2026-05-20 | Hermes 专题落地页、首页/Claude 落地页交叉链接、`hermes-agent-guide` 全 slug 重定向 |
| 2026-05-21 | 对照官方文档复盘 14 章覆盖度，新增「缺口与增补计划（v2）」：高优先级 3 项（Event Hooks / Checkpoints / @ 引用）、中优先级 5 项、现章补强 6 项 |
| 2026-05-21 | v2 增补全部完成：新增 3 章（event-hooks、kanban、plugins）+ 10 章扩写；系列 17 章，侧栏/索引/落地页/重定向已同步 |
