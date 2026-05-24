# Claude Code 漫游指南：官方差距补充（+9 章）— 设计说明

**日期**：2026-05-25  
**状态**：已实现  
**决策**：方案 B + 方案 2（新增 **9** 个 slug：8 个主题章 + 1 查阅章；系列正文 **43** 篇 + 漫游索引 order 0）

## 背景与目标

对照 [Claude Code 官方文档目录](https://code.claude.com/docs/llms.txt) 与系列 34 章结构，补齐「完全缺失」与「仅链接/命令表」类主题，使系列达到「工程师完全指南」深度，同时避免与已有内容重复堆砌。

**校准结论**（实施前必读）：

- [生态集成](src/content/docs/claude-code/ecosystem-integration.md) 已含 VS Code、Desktop、GitHub Actions 等大量正文；本项工作以**迁出 + 瘦身 + 专章加深**为主，非从零撰写。
- `.claude/rules/`、checkpoint、部分企业话题已在记忆/安全/生态章出现；扩写现有章 + 新章交叉链接。

**非目标**：

- 不维护与官方 1:1 的全量 API 参考（查阅章只列本系列常引用项）。
- 不重写无关章节（如 `reflection`、`prompt-engineering` 全文）。
- 不新增第六部分 Skill 体系章节。

---

## 新增 9 章一览（8 主题 + 1 查阅）

对外可称「**扩展至 42 个跟读主题 + 排障速查**」：order 1–42 为教程正文（第 42 篇为查阅章），`troubleshooting-faq` 为 order 43。

| order | slug | 侧栏标题 | 所属部分 |
|------:|------|----------|----------|
| 7 | `platforms-overview` | 多平台运行环境全览 | 第二部分 · 快速上手 |
| 19 | `agent-teams` | Agent Teams 与多会话协作 | 第五部分 · 高级扩展 |
| 28 | `agent-sdk` | Agent SDK 程序化调用 | 第七部分 · 实战 |
| 29 | `ci-cd-integrations` | CI/CD 与代码审查集成 | 第七部分 · 实战 |
| 30 | `remote-sessions-channels` | 远程会话与 Channels | 第七部分 · 实战 |
| 31 | `chrome-browser-testing` | Chrome 与 Web UI 测试 | 第七部分 · 实战 |
| 34 | `routines-automation` | Routines 与定时自动化 | 第九部分 · 进阶实践 |
| 37 | `sandboxing` | 沙箱隔离机制 | 第九部分 · 进阶实践 |
| 41 | `cli-and-settings-reference` | CLI 与配置查阅 | 第十部分 · 排障速查（可选读） |

插入后，原 `order ≥ 7` 的正文章节整体 **+1**；原 `order ≥ 19` **再 +1**；原 `order ≥ 28` **再 +4**；原 `order ≥ 34` **再 +1**；原 `order ≥ 37` **再 +1**；`troubleshooting-faq` 固定为 **42**。

> 实施时以本表为准批量改 frontmatter，并修复当前 `slash-commands` 与 `agent-loop` 同为 `order: 6` 的冲突。

---

## 全站 order 对照（定稿）

| order | slug | 备注 |
|------:|------|------|
| 0 | `index` | 漫游指南 |
| 1–6 | 不变 | what-is → slash-commands |
| 7 | `platforms-overview` | **新** |
| 8–18 | 原 7–17 +1 | agent-loop → subagents |
| 19 | `agent-teams` | **新** |
| 20–27 | 原 17–24 +2 | mcp → ecosystem-integration |
| 28–31 | **新** ×4 | agent-sdk → chrome-browser-testing |
| 32–33 | 原 25–26 +7 | limitations → reflection |
| 34 | `routines-automation` | **新** |
| 35–36 | 原 27–28 +7 | debug-error-recovery → token-economics |
| 37 | `sandboxing` | **新** |
| 38–40 | 原 29–31 +8 | security-permissions → team-organization |
| 41 | `mental-model-migration` | 原 32 +9 |
| 42 | `cli-and-settings-reference` | **新**，查阅 |
| 43 | `troubleshooting-faq` | 原 33 +10 |

**口径**：`index.md` 写「**42 章教程正文 + 排障速查**」或「**43 章**（含查阅与 FAQ）」二选一，实施时全站统一。

---

## 新章内容契约（摘要）

每章结构遵循 `CLAUDE.md`：frontmatter → 开场 → 概念/对比表 → 最小路径 → 机制 → 失败模式 → 决策边界 → 自检 → prev/next。Volatile 事实附官方链接并注明「发布前对照官方」。

### `platforms-overview`

- **职责**：CLI / VS Code·Cursor / JetBrains / Desktop / Web 选型矩阵与安装要点。
- **迁入**：`installation-setup` 的 VS Code、Desktop 节；`ecosystem-integration` 的 VS Code、JetBrains、Desktop 详述。
- **官方**：[platforms](https://code.claude.com/docs/en/platforms.md)、[vs-code](https://code.claude.com/docs/en/vs-code.md)、[jetbrains](https://code.claude.com/docs/en/jetbrains.md)、[desktop](https://code.claude.com/docs/en/desktop.md)、[claude-code-on-the-web](https://code.claude.com/docs/en/claude-code-on-the-web.md)。
- **目标字数**：2 500–3 200。

### `agent-teams`

- **职责**：与 SubAgents、agent view、worktree 对比；启用、场景、成本。
- **更新**：`subagents.md` 边界段改为链接本章；`context-management.md` 组合剧本增加 teams 分支。
- **官方**：[agent-teams](https://code.claude.com/docs/en/agent-teams.md)、[agents](https://code.claude.com/docs/en/agents.md)。
- **目标字数**：2 000–2 800。

### `routines-automation`

- **职责**：`/loop` vs 会话内 cron vs **Routines**（云端）；`/schedule`；Plan/API 限制。
- **官方**：[routines](https://code.claude.com/docs/en/routines.md)、[scheduled-tasks](https://code.claude.com/docs/en/scheduled-tasks.md)。
- **目标字数**：1 800–2 400。

### `sandboxing`

- **职责**：沙箱 Bash 机制、网络域、`/sandbox`、与 devcontainer/Docker/VM 对照；可验证实验步骤。
- **分工**：`security-permissions` 保留权限心智；本章 OS 层隔离。
- **官方**：[sandboxing](https://code.claude.com/docs/en/sandboxing.md)、[sandbox-environments](https://code.claude.com/docs/en/sandbox-environments.md)。
- **目标字数**：2 000–2 600。

### `agent-sdk`

- **职责**：TypeScript 最小示例（quickstart 对齐）、`send`/`stream`、加载 CLAUDE.md/skills/hooks、权限与成本、与 `claude -p` 边界。
- **官方**：[agent-sdk/overview](https://code.claude.com/docs/en/agent-sdk/overview.md)、[quickstart](https://code.claude.com/docs/en/agent-sdk/quickstart.md)、[headless](https://code.claude.com/docs/en/headless.md)。
- **目标字数**：2 800–3 500。

### `ci-cd-integrations`

- **职责**：GitHub Actions（迁入并加深）、GitHub Code Review、GitLab CI/CD；`claude -p` 自建 CI 表。
- **迁入**：`ecosystem-integration` § GitHub Actions 主体。
- **官方**：[github-actions](https://code.claude.com/docs/en/github-actions.md)、[code-review](https://code.claude.com/docs/en/code-review.md)、[gitlab-ci-cd](https://code.claude.com/docs/en/gitlab-ci-cd.md)。
- **目标字数**：3 000–3 800。

### `remote-sessions-channels`

- **职责**：Remote Control、`--remote`/`--teleport`；Channels 与 Hooks/MCP 分工。
- **扩写**：`mcp.md` Channels 表行 → 半节 + 链接。
- **官方**：[remote-control](https://code.claude.com/docs/en/remote-control.md)、[channels](https://code.claude.com/docs/en/channels.md)。
- **目标字数**：1 800–2 400。

### `chrome-browser-testing`

- **职责**：Chrome 集成、`@browser`、Web UI 测试工作流；与 Computer use 边界。
- **末节**：体验增强聚合（voice、fast mode、status line、keybindings、output styles、fullscreen）各 1 段 + 官方链，不单开章。
- **官方**：[chrome](https://code.claude.com/docs/en/chrome.md)。
- **目标字数**：2 000–2 600（含体验增强末节）。

### `cli-and-settings-reference`

- **职责**：查阅章；分组 flag 表、settings 顶层键、常用 env-vars；维护约定。
- **官方**：[cli-reference](https://code.claude.com/docs/en/cli-reference.md)、[settings](https://code.claude.com/docs/en/settings.md)、[env-vars](https://code.claude.com/docs/en/env-vars.md)。
- **目标字数**：1 500–2 000（表为主）。

---

## `ecosystem-integration` 瘦身

| 块 | 处理 |
|----|------|
| VS Code / JetBrains / Desktop 详述 | 迁出 → `platforms-overview` |
| GitHub Actions 大节 | 迁出 → `ci-cd-integrations` |
| 三层集成图、Neovim/Emacs、CLAUDE.md 协作、企业表、推广节奏、失败模式 | **保留** |
| 非交互 `-p` | 保留短表 + 链 `ci-cd-integrations` |

瘦身后期望 **1 800–2 200 字**，角色为组织层总览。

---

## 现有章扩写（不新开章）

| 章节 | 补充 |
|------|------|
| `security-permissions` | `permission-modes`、managed policies；链 `sandboxing` |
| `token-economics` | 团队限额、`opusplan`、OpenTelemetry |
| `team-organization` | server-managed-settings、analytics、ZDR、network-config、devcontainer、Bedrock/Vertex/Foundry 决策表 |
| `plugins` + `skills-team-playbook` | marketplace 创建与分发 |
| `limitations` | Teams / Routines / Web 可用性矩阵 |
| `slash-commands` | `/loop`、`/schedule` 链 `routines-automation`；体验增强指向 `chrome-browser-testing` |
| `agent-loop` | 沙箱段缩短 + 链 `sandboxing` |
| `installation-setup` | 平台细节迁出后留摘要链 |

---

## 侧栏与导航（`claude-code-sidebar.ts`）

```
第二部分
  … slash-commands
  + 多平台运行环境全览

第五部分
  … subagents
  + Agent Teams
  mcp

第七部分
  … ecosystem-integration（瘦身）
  + Agent SDK
  + CI/CD 与代码审查集成
  + 远程会话与 Channels
  + Chrome 与 Web UI 测试
  limitations …

第九部分
  … reflection 之后
  + Routines 与定时自动化
  debug-error-recovery …
  + 沙箱隔离机制
  security-permissions …

第十部分
  + CLI 与配置查阅（可选读）
  常见问题排查
```

**阅读路径（`index.md`）**：

- 章节列表更新（42 或 43 表述与上表一致）；标注 **扩展必读**：多平台、Agent Teams、Agent SDK、CI/CD。
- 第五部分顺序：**SubAgents → Agent Teams → MCP**。
- `cli-and-settings-reference` 标注「查阅，非跟读」。

**prev/next 关键链**：

- `slash-commands` → `platforms-overview` → `agent-loop`
- `subagents` → `agent-teams` → `mcp`
- `ecosystem-integration` → `agent-sdk` → `ci-cd-integrations` → `remote-sessions-channels` → `chrome-browser-testing` → `limitations`
- `reflection` → `routines-automation` → `debug-error-recovery`
- `token-economics` → `sandboxing` → `security-permissions`
- `mental-model-migration` → `cli-and-settings-reference` → `troubleshooting-faq`

---

## 同步文件清单

| 文件 | 动作 |
|------|------|
| `src/content/docs/claude-code/*.md` | 8 个新文件 + 批量 `sidebar.order` + prev/next |
| `src/config/claude-code-sidebar.ts` | 插入 8 项 |
| `src/content/docs/claude-code/index.md` | 42 章目录与阅读路径 |
| `src/pages/claude-code/index.astro` | 若硬编码章数则更新 |
| `astro.config.mjs` | `claudeCodeSlugs` 增加 9 slug；补全 `troubleshooting-faq`（当前数组缺失） |
| `README.md` | 章数与描述（若提及 34 章） |

---

## 实施分期

### P0 — 骨架（约 1 个 PR）

1. 创建 9 个 md 占位：frontmatter + 开场 + 最小路径 + prev/next。
2. 更新 `claude-code-sidebar.ts`、`index.md`、`claudeCodeSlugs`、全站 `sidebar.order`。
3. `pnpm build` 通过。

### P1 — 迁出与瘦身（约 1–2 个 PR）

1. 从 `ecosystem-integration`、`installation-setup` 迁段落至新章，原处改摘要 + 链接。
2. 生态章压到目标字数。
3. 修复全章 prev/next 与文内死链。

### P2 — 加深与扩写（约 2–3 个 PR）

1. 9 篇新文填满内容契约。
2. 扩写 `security-permissions`、`token-economics`、`team-organization`、`plugins` 等。
3. 更新 `subagents`、`context-management`、`limitations`、`slash-commands`、`mcp`。

### P3 — 验收

1. `pnpm build`
2. 抽检官方链接 HTTP 200（或 docs 站可访问）
3. 对照 `llms.txt` 勾选覆盖表（见下）
4. 通读漫游索引与侧栏顺序一致

---

## 官方覆盖勾选表（P3）

| 官方主题 | 落点 |
|----------|------|
| platforms / vs-code / jetbrains / desktop / web | `platforms-overview` |
| agent-teams / agents | `agent-teams` |
| routines / scheduled-tasks | `routines-automation` |
| sandboxing / sandbox-environments | `sandboxing` |
| agent-sdk/*（核心子页） | `agent-sdk` |
| github-actions / gitlab-ci-cd / code-review | `ci-cd-integrations` |
| remote-control / channels | `remote-sessions-channels` |
| chrome (+ voice 等末节) | `chrome-browser-testing` |
| cli-reference / settings / env-vars | `cli-and-settings-reference` |
| permission-modes / analytics / ZDR / network-config / devcontainer | 现有章扩写 |

---

## 风险与边界

| 风险 | 缓解 |
|------|------|
| Agent Teams / Routines 实验性或 Plan 限制变化 | 文内标「以官方为准」+ changelog 链 |
| 生态章迁出后内链断裂 | P1 末 grep `/ecosystem-integration/` 锚点 |
| 查阅章过时 | 表只列常用项；文首声明不全量同步官方 |
| order 批量改动冲突 | 单 PR 专改 order，避免与正文大改混杂 |

---

## 验收标准

1. 侧栏 9 个新标题可见，顺序与本文一致。
2. `ecosystem-integration` 字数降至约 2k，且不含 GitHub Actions 长教程正文。
3. 每篇新章含：对比表或选型表、至少 1 条可运行命令、失败模式表、官方链接。
4. `pnpm build` 无错误。
5. 漫游 `index.md` 章数表述与侧栏一致。

---

## 下一步

用户审阅本 spec 通过后，调用 **writing-plans** 技能生成 `docs/superpowers/plans/2026-05-25-claude-code-gap-supplement.md` 任务分解。
