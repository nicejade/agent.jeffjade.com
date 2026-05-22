# Claude Code Plugins 章与 skill-catalog 优化 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 第五部分新增 `plugins.md`（推荐范围 B），全站 34 章；优化 `skill-catalog` 安装前自检与 anthropics/skills、gstack 条目；修正横切链接与 `sidebar.order`。

**Architecture:** 新建机制章插在 Skills 与 SubAgents 之间；第六部分保持「精选长文 + 目录导读 + 团队实战」三分工；不新建 `skills-authoring.md`。依据 `docs/superpowers/specs/2026-05-22-claude-code-plugins-part-design.md`。

**Tech Stack:** Astro Starlight Markdown、`src/config/claude-code-sidebar.ts`、`pnpm build`

**Spec:** `docs/superpowers/specs/2026-05-22-claude-code-plugins-part-design.md`

---

## File map

| Action | Path |
|--------|------|
| Create | `src/content/docs/claude-code/plugins.md` |
| Modify | `src/config/claude-code-sidebar.ts` |
| Modify | `src/content/docs/claude-code/index.md` |
| Modify | `src/pages/claude-code/index.astro` |
| Modify | `astro.config.mjs`（`claudeCodeSlugs` 加 `plugins`） |
| Modify | `README.md`（33 → 34 章，第五部分条目） |
| Modify | `src/content/docs/claude-code/skills.md` |
| Modify | `src/content/docs/claude-code/subagents.md` |
| Modify | `src/content/docs/claude-code/mcp.md` |
| Modify | `src/content/docs/claude-code/skill-catalog.md` |
| Modify | `src/content/docs/claude-code/skill-recommendations.md` |
| Modify | `src/content/docs/claude-code/ecosystem-integration.md` |
| Bump order | `subagents.md` 15→16, `mcp.md` 16→17, `skill-recommendations.md` 17→18, `skill-catalog.md` 18→19, `skills-team-playbook.md` 19→20, `context-management.md` 20→21, `prompt-engineering.md` 21→22, `complete-workflow.md` 22→23, `ecosystem-integration.md` 23→24, `limitations.md` 24→25, `reflection.md` 25→26, `debug-error-recovery.md` 26→27, `token-economics.md` 27→28, `security-permissions.md` 28→29, `tdd-quality.md` 29→30, `team-organization.md` 30→31, `mental-model-migration.md` 31→32, `troubleshooting-faq.md` 32→33 |

---

### Task 1: 导航与 slug 骨架

**Files:**
- Create: `src/content/docs/claude-code/plugins.md`
- Modify: `src/config/claude-code-sidebar.ts`
- Modify: `astro.config.mjs`

- [ ] **Step 1: 新建 `plugins.md` frontmatter**

```yaml
---
title: Plugins：通过市场扩展 Claude Code
description: 理解 Plugin 与 marketplace 的安装模型，区分 Plugin、Skill、Hook、SubAgent、MCP，并选型官方与社区高价值扩展。
sidebar:
  order: 15
---
```

正文先写占位标题 `## 待撰写`（Task 2 替换全文）。

- [ ] **Step 2: 更新 sidebar**

在 `src/config/claude-code-sidebar.ts` 第五部分 `items` 中，在 Skills 与 SubAgents 之间插入：

```ts
{ label: 'Plugins 插件', link: '/claude-code/plugins/' },
```

- [ ] **Step 3: `astro.config.mjs`**

在 `claudeCodeSlugs` 数组中，`'skills'` 后添加 `'plugins'`。

- [ ] **Step 4: 验证 slug 可解析**

```bash
cd /Users/jade/WorkSpace/agent.jeffjade.com && pnpm build 2>&1 | tail -20
```

Expected: build success; dist 含 `/claude-code/plugins/`。

---

### Task 2: 撰写 `plugins.md` 正文（~180–220 行）

**Files:**
- Modify: `src/content/docs/claude-code/plugins.md`

- [ ] **Step 1: 替换全文**

按下列结构写简体中文（遵守 `CLAUDE.md` 写作规范）。开篇场景一句；机制链官方 [Discover plugins](https://code.claude.com/docs/en/discover-plugins)、[Plugins](https://code.claude.com/docs/en/plugins)。

**必含对比表（5 行 + 表头）：**

| 维度 | Plugin | Skill | Hook | SubAgent | MCP |
|------|--------|-------|------|----------|-----|
| 是什么 | 分发包，可含多种组件 | 单技能 `SKILL.md` | 生命周期脚本 | 隔离上下文代理 | 外部系统协议 |
| 触发/安装 | marketplace install | `/name` 或模型选用 | 事件必跑 | 主代理委派 | 工具调用 |
| 确定性 | 中 | 中 | 高 | 中 | 中 |
| 典型场景 | 跨项目装 GitHub MCP + 技能包 | 可复用流程 | 格式化/拦截 | 探索/并行 | 实时查 JIRA |
| 不适合 | 一两句项目事实 | 必须每次工具后执行 | 整段业务流程 | 琐事 |

**安装最小路径代码块：**

```text
/plugin
/plugin install github@claude-plugins-official
/plugin marketplace add anthropics/skills
/plugin install document-skills@anthropic-agent-skills
```

**推荐 Plugins 表（B 范围，脚注：条目以 Discover 为准）：**

| 插件 / 来源 | 何时装 | 要点 |
| Claude Code Setup | 新项目 | 只读推荐；[claude.com/plugins/claude-code-setup](https://claude.com/plugins/claude-code-setup) |
| typescript-lsp 等 | 要 LSP | 需本机 binary |
| github | 少粘贴 PR | `@claude-plugins-official` |
| Frontend Design / Code Review / Context7 | UI/审查/文档 | Verified |
| Superpowers | 端到端方法论 | 链 skill-recommendations |
| anthropics/skills | 官方范例 | document-skills / example-skills |
| gstack | 角色化 slash | **非 Plugin**；clone 到 `~/.claude/skills/gstack` + `./setup` |

**gstack 安装块（勿写 plugin install）：**

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup
```

**失败模式：** 市场过期、`/plugin marketplace update`、LSP binary、Discover Context cost、`/doctor` listing、superpowers#355 重名。

**章末：** 自检 2–3 题；`上一章：skills` · `下一章：subagents`。

- [ ] **Step 2: 通读一遍**

确认无 em dash、无「选型四维」旧标题、volatile 处链官方文档。

---

### Task 3: 调整 `skills.md` 与 prev/next 链

**Files:**
- Modify: `src/content/docs/claude-code/skills.md`
- Modify: `src/content/docs/claude-code/subagents.md`
- Modify: `src/content/docs/claude-code/mcp.md`

- [ ] **Step 1: `skills.md`**

- 将「## 团队落地与共享」第 3 点「插件分发」改为 2–3 句 + 链 `/claude-code/plugins/`。
- 「Skills、Hooks、SubAgents 如何分工」表增加 Plugin 行，或表下加「含 Plugin 的完整对比见 [Plugins](/claude-code/plugins/)」。
- 文末 `下一章` 改为：`[Plugins](/claude-code/plugins/)`。
- 第 16 节「与子代理的配合」中「详见下一章 SubAgents」可改为「详见 [SubAgents](/claude-code/subagents/)」（因中间插入 Plugins）。

- [ ] **Step 2: `subagents.md`**

- 开篇或 prev 链：`上一章 [Plugins](/claude-code/plugins/)`（若文中有上一章表述则更新）。
- 文末 `上一章`：`plugins`；`下一章`：仍为 `mcp`。
- 删除或改写「再下一章 skill-recommendations」为经 mcp 进入第六部分（保持 mcp 为第五部分末章）。

- [ ] **Step 3: `mcp.md`**

- 在「MCP 解决什么问题」或安装节前加一句：许多集成可通过官方 Plugin 预配置，见 [Plugins](/claude-code/plugins/)。
- 文末 `下一章` 仍为 `skill-recommendations`。

---

### Task 4: 优化 `skill-catalog.md`

**Files:**
- Modify: `src/content/docs/claude-code/skill-catalog.md`

- [ ] **Step 1: 替换「选型四维」为「安装前自检」**

```markdown
**安装前自检（本站归纳，非官方固定术语）：**

1. **信任与透明度**：来源是否可信；能否阅读仓库与 Discover 的 **Will install** 清单；第三方重点看 `allowed-tools`。（GitHub star 仅作参考，不能代替审查。）
2. **权限与治理**：是否扩大 Bash/Edit 等；团队是否允许该 marketplace 与 User/Project/Local scope。
3. **上下文成本**：安装前在 Discover 看 **Context cost**；多包共存后用 `/doctor` 查技能 listing，必要时 `skillOverrides` 折叠。
4. **重复与冲突**：是否与已装 Plugin 重名或流程重叠（如 superpowers#355）。
```

- [ ] **Step 2: 安装形态三元表**

在「如何自己发现」节后增加：

| 形态 | 典型命令 / 路径 | 代表 |
| Plugin 市场 | `/plugin marketplace add` + `/plugin install` | Superpowers、github |
| anthropics/skills 市场 | `anthropic-agent-skills` | document-skills、example-skills |
| 目录克隆 | `~/.claude/skills/<name>/` | gstack |

- [ ] **Step 3: 新增分类小节**

- **官方技能范例库**：链 anthropics/skills、plugins 章。
- **全栈角色化工作流**：gstack；强调非 Plugin；链 plugins 章。

- [ ] **Step 4: 可选一行**

官方工作流：`commit-commands`、`pr-review-toolkit`（Discover development workflows）。

- [ ] **Step 5: 开篇加链**

一句：Plugin 机制见 [Plugins](/claude-code/plugins/)。

---

### Task 5: 横切与章节编号（34 章）

**Files:**
- Modify: `src/content/docs/claude-code/index.md`
- Modify: `src/pages/claude-code/index.astro`
- Modify: `README.md`
- Modify: `src/content/docs/claude-code/skill-recommendations.md`
- Modify: `src/content/docs/claude-code/ecosystem-integration.md`
- Modify: 所有 `order >= 15` 且非 `plugins.md` 的 claude-code 章 frontmatter

- [ ] **Step 1: `index.md`**

- description 与正文「33 章」→ **34 章**。
- 第五部分插入第 15 条 Plugins；原 16–17 顺延为 SubAgents、MCP；第六部分 18–20；第七部分 21–24；第八 25–26；第九 27–32；第十 33–34。
- 阅读路径补一句：第五部分含 Plugins。

- [ ] **Step 2: `index.astro`**

- `description` 34 章；第五部分 chapters 插入 `{ n: 15, title: 'Plugins 插件', href: '/claude-code/plugins/' }`；后续 `n` 全部 +1；`troubleshooting-faq` 为 `n: 34`。
- 页内 `33 章` / `<strong>33</strong>` → 34。

- [ ] **Step 3: `README.md`**

第五部分描述加入 Plugins；「33 章」→ 34。

- [ ] **Step 4: `skill-recommendations.md` 开篇**

加：`Plugin 机制见 [Plugins](/claude-code/plugins/)。`

- [ ] **Step 5: `ecosystem-integration.md`**

将 `/plugins` 相关链接从 `/claude-code/mcp/` 改为 `/claude-code/plugins/`。

- [ ] **Step 6: 批量 `sidebar.order`**

按 File map 表将 order 15→16 … 32→33（`plugins` 固定 15；`hooks` 13、`skills` 14 不变）。

---

### Task 6: 终验

- [ ] **Step 1: 构建**

```bash
cd /Users/jade/WorkSpace/agent.jeffjade.com && pnpm build
```

Expected: exit 0.

- [ ] **Step 2: 链接抽查**

grep 确认无孤立「选型四维」；`skills` → `plugins` → `subagents` → `mcp` → `skill-recommendations` 文末链正确。

- [ ] **Step 3: 更新 spec 状态（可选 commit）**

`docs/superpowers/specs/2026-05-22-claude-code-plugins-part-design.md` 状态改为「已实现」。

---

## Plan self-review

| Spec 章节 | Task |
|-----------|------|
| 新建 plugins.md B 范围 | Task 2 |
| skill-catalog 自检四条 + 三元表 + anthropics/gstack | Task 4 |
| skills/mcp/ecosystem 横切 | Task 3, 5 |
| 34 章 IA | Task 1, 5 |
| sidebar.order + prev/next | Task 1, 3, 5, 6 |
| pnpm build | Task 6 |

无 TBD /「similar to above」占位。

---

## Out of scope

- `skills-authoring.md`
- 全量 Plugin 表抓取
- Superpowers 长文搬迁
