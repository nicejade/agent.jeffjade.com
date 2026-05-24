# Claude Code 官方差距补充（+9 章）— Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在《Claude Code 漫游指南》中新增 9 个 slug（8 主题章 + 1 查阅章），迁出并瘦身 `ecosystem-integration`，扩写安全/成本/团队等现有章，使系列对齐官方 `llms.txt` 核心缺口且 `pnpm build` 通过。

**Architecture:** P0 先锁导航与 order（43 篇正文 + index）；P1 从 `ecosystem-integration` / `installation-setup` **剪切**正文到新章并留摘要链；P2 按 spec 内容契约写满新章并扩写横切章；P3 构建与链接验收。不新增 Starlight 组件，仅 Markdown + 侧栏配置。

**Tech Stack:** Astro 5、Starlight、`src/config/claude-code-sidebar.ts`、`pnpm build`

**Spec:** `docs/superpowers/specs/2026-05-25-claude-code-gap-supplement-design.md`

---

## File map

| Action | Path |
|--------|------|
| Create | `src/content/docs/claude-code/platforms-overview.md` |
| Create | `src/content/docs/claude-code/agent-teams.md` |
| Create | `src/content/docs/claude-code/agent-sdk.md` |
| Create | `src/content/docs/claude-code/ci-cd-integrations.md` |
| Create | `src/content/docs/claude-code/remote-sessions-channels.md` |
| Create | `src/content/docs/claude-code/chrome-browser-testing.md` |
| Create | `src/content/docs/claude-code/routines-automation.md` |
| Create | `src/content/docs/claude-code/sandboxing.md` |
| Create | `src/content/docs/claude-code/cli-and-settings-reference.md` |
| Modify | `src/config/claude-code-sidebar.ts` |
| Modify | `src/content/docs/claude-code/index.md` |
| Modify | `src/pages/claude-code/index.astro`（若硬编码章数） |
| Modify | `astro.config.mjs` |
| Modify | `README.md`（若写 34 章） |
| Modify | `docs/superpowers/specs/2026-05-25-claude-code-gap-supplement-design.md`（状态 → 已实现） |
| Migrate / slim | `ecosystem-integration.md`, `installation-setup.md` |
| Expand | `security-permissions.md`, `token-economics.md`, `team-organization.md`, `plugins.md`, `skills-team-playbook.md`, `limitations.md`, `slash-commands.md`, `subagents.md`, `context-management.md`, `agent-loop.md`, `mcp.md` |
| Bump `sidebar.order` | 见 Task 2 表（凡原 order ≥ 7 者） |

---

## Order 批量对照（Task 2 执行时逐文件改 frontmatter）

| order | slug |
|------:|------|
| 1–6 | `what-is-claude-code` … `slash-commands`（不变） |
| 7 | `platforms-overview` **新** |
| 8 | `agent-loop`（原 6，修复与 slash 冲突） |
| 9 | `plan-mode`（原 7） |
| 10–14 | `claude-md` … `memory-team-playbook`（原 8–12） |
| 15–18 | `hooks` … `subagents`（原 13–16） |
| 19 | `agent-teams` **新** |
| 20–27 | `mcp` … `ecosystem-integration`（原 17–24） |
| 28–31 | `agent-sdk` … `chrome-browser-testing` **新** |
| 32–33 | `limitations`, `reflection`（原 25–26） |
| 34 | `routines-automation` **新** |
| 35–36 | `debug-error-recovery`, `token-economics`（原 27–28） |
| 37 | `sandboxing` **新** |
| 38–40 | `security-permissions` … `team-organization`（原 29–31） |
| 41 | `mental-model-migration`（原 32） |
| 42 | `cli-and-settings-reference` **新** |
| 43 | `troubleshooting-faq`（原 33） |

**漫游口径（全站统一）：** `index.md` 写「**42 章教程正文 + 排障速查**」（order 1–42 含查阅章，order 43 为 FAQ）。

---

## 新章 frontmatter 模板（9 个文件共用结构）

```yaml
---
title: <中文标题>
description: <一句具体收益，含可观察行为>
sidebar:
  order: <上表>
---
```

每章占位正文最低要求（P0）：

```markdown
*「<一句读者痛点>」*

> 本章依据 [官方 …](https://code.claude.com/docs/en/….md)。发布前请对照官方更新。

## 待深化

正文将在 P2 按 spec 补全。

---

上一章：[…](/claude-code/…/) · 下一章：[…](/claude-code/…/)
```

**9 章 title / order / prev→next：**

| slug | title | order | 上一章 → 下一章 |
|------|-------|------:|------------------|
| `platforms-overview` | 多平台运行环境全览 | 7 | `slash-commands` → `agent-loop` |
| `agent-teams` | Agent Teams 与多会话协作 | 19 | `subagents` → `mcp` |
| `agent-sdk` | Agent SDK 程序化调用 | 28 | `ecosystem-integration` → `ci-cd-integrations` |
| `ci-cd-integrations` | CI/CD 与代码审查集成 | 29 | `agent-sdk` → `remote-sessions-channels` |
| `remote-sessions-channels` | 远程会话与 Channels | 30 | `ci-cd-integrations` → `chrome-browser-testing` |
| `chrome-browser-testing` | Chrome 与 Web UI 测试 | 31 | `remote-sessions-channels` → `limitations` |
| `routines-automation` | Routines 与定时自动化 | 34 | `reflection` → `debug-error-recovery` |
| `sandboxing` | 沙箱隔离机制 | 37 | `token-economics` → `security-permissions` |
| `cli-and-settings-reference` | CLI 与配置查阅 | 42 | `mental-model-migration` → `troubleshooting-faq` |

---

### Task 1: 创建 9 个 slug 占位文件

**Files:** Create 9 paths under `src/content/docs/claude-code/`

- [ ] **Step 1:** 按上表创建 9 个 `.md`，填入 frontmatter + 占位 + prev/next。

- [ ] **Step 2:** 验证文件存在

```bash
cd /Users/jade/WorkSpace/agent.jeffjade.com
ls src/content/docs/claude-code/{platforms-overview,agent-teams,agent-sdk,ci-cd-integrations,remote-sessions-channels,chrome-browser-testing,routines-automation,sandboxing,cli-and-settings-reference}.md
```

Expected: 9 行输出，无 missing。

---

### Task 2: 全站 `sidebar.order` 与冲突修复

**Files:** Modify every `src/content/docs/claude-code/*.md` listed in Order 表（除 index order 0）

- [ ] **Step 1:** 将 `agent-loop.md` 的 `sidebar.order` 从 `6` 改为 `8`。

- [ ] **Step 2:** 按 Order 表批量修改其余文件（可用脚本或逐文件；勿漏 `troubleshooting-faq` → 43）。

- [ ] **Step 3:** 确认无重复 order（除 index 0）

```bash
cd /Users/jade/WorkSpace/agent.jeffjade.com
rg "order: " src/content/docs/claude-code --no-heading | sort -t: -k3 -n | uniq -d -f1
```

Expected: 无输出（无重复 order）。

---

### Task 3: 侧栏、`claudeCodeSlugs`、漫游索引

**Files:**
- Modify: `src/config/claude-code-sidebar.ts`
- Modify: `astro.config.mjs`
- Modify: `src/content/docs/claude-code/index.md`
- Modify: `src/pages/claude-code/index.astro`（若存在「34 章」）
- Modify: `README.md`（若提及章数）

- [ ] **Step 1: `claude-code-sidebar.ts`**

在对应 `items` 数组插入（顺序与 spec 一致）：

```ts
// 第二部分，slash-commands 之后
{ label: '多平台运行环境全览', link: '/claude-code/platforms-overview/' },

// 第五部分，subagents 之后
{ label: 'Agent Teams 与多会话协作', link: '/claude-code/agent-teams/' },

// 第七部分，ecosystem-integration 之后、limitations 之前
{ label: 'Agent SDK 程序化调用', link: '/claude-code/agent-sdk/' },
{ label: 'CI/CD 与代码审查集成', link: '/claude-code/ci-cd-integrations/' },
{ label: '远程会话与 Channels', link: '/claude-code/remote-sessions-channels/' },
{ label: 'Chrome 与 Web UI 测试', link: '/claude-code/chrome-browser-testing/' },

// 第九部分，reflection 之后
{ label: 'Routines 与定时自动化', link: '/claude-code/routines-automation/' },
// token-economics 与 security-permissions 之间插入（侧栏在 security 前）：
{ label: '沙箱隔离机制', link: '/claude-code/sandboxing/' },

// 第十部分，troubleshooting 之前
{ label: 'CLI 与配置查阅', link: '/claude-code/cli-and-settings-reference/' },
```

- [ ] **Step 2: `astro.config.mjs`**

在 `claudeCodeSlugs` 中按阅读顺序插入 9 个 slug，并**追加**缺失的 `'troubleshooting-faq'`（当前数组末尾无此项）：

```js
// 在 'slash-commands' 后
'platforms-overview',
// 在 'subagents' 后
'agent-teams',
// 在 'ecosystem-integration' 后
'agent-sdk',
'ci-cd-integrations',
'remote-sessions-channels',
'chrome-browser-testing',
// 在 'reflection' 后（逻辑位置；数组顺序可与 sidebar 一致）
'routines-automation',
// 在 'token-economics' 后
'sandboxing',
// 在 'mental-model-migration' 后
'cli-and-settings-reference',
// 数组末尾确保有
'troubleshooting-faq',
```

- [ ] **Step 3: 更新 `index.md`**

- 开篇改为「**42 章教程正文 + 排障速查**」。
- 在对应 Part 列表插入 9 条链接（与 sidebar 标题一致）。
- 第五部分阅读提示：`SubAgents → Agent Teams → MCP`。
- 标注扩展必读：多平台、Agent Teams、Agent SDK、CI/CD。
- `cli-and-settings-reference` 标注「查阅，非跟读」。

- [ ] **Step 4: 更新相邻章 prev/next 脚链**

至少修改以下文件文末「上一章 / 下一章」行：

| 文件 | 新链 |
|------|------|
| `slash-commands.md` | 下一章 → `platforms-overview` |
| `agent-loop.md` | 上一章 → `platforms-overview` |
| `subagents.md` | 下一章 → `agent-teams` |
| `mcp.md` | 上一章 → `agent-teams` |
| `ecosystem-integration.md` | 下一章 → `agent-sdk` |
| `limitations.md` | 上一章 → `chrome-browser-testing` |
| `reflection.md` | 下一章 → `routines-automation` |
| `debug-error-recovery.md` | 上一章 → `routines-automation` |
| `token-economics.md` | 下一章 → `sandboxing` |
| `security-permissions.md` | 上一章 → `sandboxing` |
| `mental-model-migration.md` | 下一章 → `cli-and-settings-reference` |
| `cli-and-settings-reference.md` | （新建时已写） |
| `troubleshooting-faq.md` | 上一章 → `cli-and-settings-reference` |

- [ ] **Step 5: P0 构建**

```bash
cd /Users/jade/WorkSpace/agent.jeffjade.com && pnpm build
```

Expected: exit 0；`dist/claude-code/platforms-overview/` 等 9 路径存在。

---

### Task 4: 迁出 `ecosystem-integration` → 新章（P1）

**Files:**
- Modify: `src/content/docs/claude-code/ecosystem-integration.md`
- Modify: `src/content/docs/claude-code/platforms-overview.md`
- Modify: `src/content/docs/claude-code/ci-cd-integrations.md`

- [ ] **Step 1:** 从 `ecosystem-integration.md` **剪切**以下区块到 `platforms-overview.md`（保留标题层级，改开场为平台选型场景）：
  - `## VS Code 与 Cursor` 至 `## Neovim` 之前（不含 Neovim 节）
  - `## JetBrains 系列` 整节
  - `## Claude Code Desktop` 整节

- [ ] **Step 2:** 在 `ecosystem-integration.md` 原位置替换为 3–5 句摘要 + 链接：

```markdown
编辑器与 Desktop、Web 的选型与安装见 [多平台运行环境全览](/claude-code/platforms-overview/)。
```

- [ ] **Step 3:** **剪切** `## GitHub Actions 集成` 至该节结束（含 workflow 示例）到 `ci-cd-integrations.md`。

- [ ] **Step 4:** 生态章该处改为：

```markdown
GitHub Actions、GitLab 与 PR 自动审查见 [CI/CD 与代码审查集成](/claude-code/ci-cd-integrations/)。
```

- [ ] **Step 5:** 保留生态章：`生态全景`、Neovim/Emacs、团队协作 CLAUDE.md、企业部署表、推广节奏、失败模式；`非交互 -p` 缩为短表并链 CI 章。

- [ ] **Step 6:** 检查生态章篇幅

```bash
wc -m src/content/docs/claude-code/ecosystem-integration.md
```

Expected: 迁出后明显缩短；P2 目标约 1800–2200 汉字（不必精确到字，但 GitHub Actions 长示例不得仍在生态章）。

- [ ] **Step 7:** `pnpm build`

---

### Task 5: 迁出 `installation-setup` → `platforms-overview`（P1）

**Files:**
- Modify: `src/content/docs/claude-code/installation-setup.md`
- Modify: `src/content/docs/claude-code/platforms-overview.md`

- [ ] **Step 1:** 剪切 `installation-setup.md` 内 `### VS Code 插件` 与 `### Claude Code Desktop` 两小节至 `platforms-overview.md` 合适位置（与 Task 4 迁来内容合并去重）。

- [ ] **Step 2:** 安装章原处留摘要：

```markdown
VS Code、JetBrains、Desktop 与 Web 版安装与差异见 [多平台运行环境全览](/claude-code/platforms-overview/)。
```

- [ ] **Step 3:** `pnpm build`

---

### Task 6: 撰写 `platforms-overview.md` 全文（P2）

**Files:** Modify `platforms-overview.md`

- [ ] **Step 1:** 删除 `## 待深化`，按 spec 写满，必含：

**选型矩阵表（5 列）：** CLI | VS Code/Cursor | JetBrains | Desktop | Web — 行含 diff、并行会话、完整 `/`、MCP 编辑、`!` Bash。

**最小路径：**

```bash
# 终端基线
claude --version
# VS Code：扩展市场安装 Claude Code 后 Spark 图标打开
# Web：浏览器打开 https://claude.ai/code（需 Teams/计划以官方为准）
```

**失败模式表** ≥ 4 行（扩展登录、Web + 仅 Bedrock、JetBrains WSL 等）。

**官方链：** platforms, vs-code, jetbrains, desktop, claude-code-on-the-web。

- [ ] **Step 2:** `pnpm build`

---

### Task 7: 撰写 `agent-teams.md`（P2）

**Files:**
- Modify: `agent-teams.md`
- Modify: `subagents.md`
- Modify: `context-management.md`

- [ ] **Step 1:** `agent-teams.md` 必含对比表：SubAgents | agent view | agent teams | worktree（4 行 + 通信/成本列）。

- [ ] **Step 2:** 写启用说明（引用官方 agent-teams；标注实验/环境变量以官方为准，不写死未核实变量名）。

- [ ] **Step 3:** 场景：并行 review、竞争假设；反例：小任务单会话。

- [ ] **Step 4:** 改 `subagents.md` 第 77 行附近边界段为：

```markdown
**边界：** 单会话内委派见本章。多会话协作见 [Agent Teams](/claude-code/agent-teams/)；仅监控多会话见官方 agent view。
```

- [ ] **Step 5:** 在 `context-management.md` 的「组合工作流」mermaid 或列表中增加分支：「多独立会话需互通信 → Agent Teams」。

- [ ] **Step 6:** `pnpm build`

---

### Task 8: 撰写 `ci-cd-integrations.md`（P2）

**Files:** Modify `ci-cd-integrations.md`

- [ ] **Step 1:** 整合 Task 4 迁入的 GitHub Actions 正文，补全：
  - `/install-github-app` 路径
  - `anthropics/claude-code-action@v1` 最小 workflow（保留 spec 示例）
  - [GitHub Code Review](https://code.claude.com/docs/en/code-review.md) 专节（与 Action 差异一句）
  - **GitLab CI/CD** 新节：链官方 gitlab-ci-cd，`claude -p` + CI 变量模式（不必抄全长 yaml，给 1 个 job 骨架）

```yaml
# .gitlab-ci.yml 示意
claude-review:
  script:
    - npm install -g @anthropic-ai/claude-code
    - claude -p "审查 $CI_MERGE_REQUEST_DIFF_BASE_SHA...HEAD 的风险" --allowedTools "Read,Grep"
  variables:
    ANTHROPIC_API_KEY: $ANTHROPIC_API_KEY
```

- [ ] **Step 2:** 失败模式表：Secret 泄露、自动合 main、费用并发。

- [ ] **Step 3:** `pnpm build`

---

### Task 9: 撰写 `agent-sdk.md`（P2）

**Files:** Modify `agent-sdk.md`

- [ ] **Step 1:** 开篇区分 CLI 交互 vs SDK 嵌入 vs `claude -p`。

- [ ] **Step 2:** 贴官方 quickstart 对齐的 **TypeScript** 最小示例（从 https://code.claude.com/docs/en/agent-sdk/quickstart.md 核对后抄写，含 package 名 `@anthropic-ai/claude-agent-sdk` 或文档当前包名）：

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "List files in the current directory",
  options: { maxTurns: 3 },
})) {
  console.log(message);
}
```

若官方 API 已更名，以 quickstart 为准替换 import/API。

- [ ] **Step 3:** 小节：加载 CLAUDE.md / skills / hooks（链 claude-code-features）；permissions + max_turns；与 `claude -p` 决策表。

- [ ] **Step 4:** `pnpm build`

---

### Task 10: 撰写 `remote-sessions-channels.md`（P2）

**Files:**
- Modify: `remote-sessions-channels.md`
- Modify: `mcp.md`

- [ ] **Step 1:** Remote Control：`/remote-control`、`claude.ai` 续会话；链 `--remote` / `--teleport`（交叉链 platforms-overview Web 节）。

- [ ] **Step 2:** Channels：事件推送 vs Hooks（Hooks=必跑脚本；Channels=外部事件进会话）。

- [ ] **Step 3:** 扩写 `mcp.md` 中 Channels 表格行为半节「详见 [远程会话与 Channels](/claude-code/remote-sessions-channels/)」。

- [ ] **Step 4:** `pnpm build`

---

### Task 11: 撰写 `chrome-browser-testing.md`（P2）

**Files:** Modify `chrome-browser-testing.md`

- [ ] **Step 1:** Chrome：`/chrome`、`@browser`（VS Code）工作流；Web UI 测试步骤列表。

- [ ] **Step 2:** 边界：Chrome beta vs [Computer use](https://code.claude.com/docs/en/computer-use.md)（CLI 控 macOS GUI）。

- [ ] **Step 3:** 末节「体验增强」各 1 段 + 官方链：voice-dictation, fast-mode, statusline, keybindings, output-styles, fullscreen。

- [ ] **Step 4:** 在 `slash-commands.md` 的 `/voice`、`/fast` 等行后加「详见 [Chrome 与 Web UI 测试](/claude-code/chrome-browser-testing/#体验增强)」。

- [ ] **Step 5:** `pnpm build`

---

### Task 12: 撰写 `routines-automation.md` 与 `sandboxing.md`（P2）

**Files:** Modify `routines-automation.md`, `sandboxing.md`, `agent-loop.md`, `slash-commands.md`

- [ ] **Step 1:** `routines-automation.md` 三层对照表：`/loop` | 会话内 scheduled-tasks | Routines 云端；`/schedule` 创建路径；Plan/API 限制（链 data-usage / admin-setup）。

- [ ] **Step 2:** `sandboxing.md`：`/sandbox`、网络域白名单、与 deny 区别；对照 devcontainer/Docker/VM 表；**可验证实验**：开启沙箱后让 Claude 写 `/etc/hosts` 类路径（预期拒绝，以你环境输出为准）。

- [ ] **Step 3:** 缩短 `agent-loop.md` 沙箱段至 ≤1 段 + 链 `sandboxing`。

- [ ] **Step 4:** `slash-commands` 中 `/loop`、`/schedule` 链 `routines-automation`。

- [ ] **Step 5:** `pnpm build`

---

### Task 13: 撰写 `cli-and-settings-reference.md`（P2）

**Files:** Modify `cli-and-settings-reference.md`

- [ ] **Step 1:** 文首声明：查阅章，不全量同步官方；发布前对照 cli-reference / settings / env-vars。

- [ ] **Step 2:** 三张表（只列本系列常引用项，每组 8–15 行）：
  - **CLI flags：** `--print`/`-p`, `--pipe`, `--allowedTools`, `--permission-mode`, `--max-turns`, `--continue`, `--resume`, `--model`
  - **settings.json 顶层键：** `permissions`, `hooks`, `env`, `model`, `autoUpdates`（以官方 settings 页为准核对键名）
  - **env-vars：** `ANTHROPIC_API_KEY`, `ANTHROPIC_BASE_URL`, `ANTHROPIC_DEFAULT_*_MODEL`, `CLAUDE_CODE_*` 常用项

- [ ] **Step 3:** `pnpm build`

---

### Task 14: 扩写现有章（P2 横切）

**Files:** 见 spec「现有章扩写」表

- [ ] **Step 1: `security-permissions.md`**

新增 `## 权限模式（permission modes）`：default / acceptEdits / plan / bypassPermissions / auto（链 permission-modes）；`managed policies` 2–3 句 + 链 permissions；文末链 `sandboxing`。

- [ ] **Step 2: `token-economics.md`**

新增：团队 spend limits（链 costs）、`opusplan` 与 model-config、OpenTelemetry（链 monitoring-usage / agent-sdk observability）。

- [ ] **Step 3: `team-organization.md`**

新增表格式小节：server-managed-settings、analytics、ZDR、network-config、devcontainer、Bedrock/Vertex/Foundry（各 1 段 + 官方链，不重复 ecosystem 长文）。

- [ ] **Step 4: `plugins.md`**

新增 `## 创建与分发 marketplace`：链 plugin-marketplaces、create plugins；最小步骤 5 条。

- [ ] **Step 5: `limitations.md`**

新增可用性矩阵：Agent Teams / Routines / Web / Code Review 与 API 提供商组合（「仅 Bedrock 时…」一行，链官方）。

- [ ] **Step 6:** `pnpm build`

---

### Task 15: P3 验收与 spec 状态

- [ ] **Step 1: 构建**

```bash
cd /Users/jade/WorkSpace/agent.jeffjade.com && pnpm build
```

- [ ] **Step 2: 死链与锚点**

```bash
cd /Users/jade/WorkSpace/agent.jeffjade.com
rg "ecosystem-integration\.md#" src/content/docs/claude-code || true
rg "/claude-code/ecosystem-integration/#" src/content/docs/claude-code
```

Expected: 无指向已删除锚点的链接；若有，改为新章路径。

- [ ] **Step 3: 新章结构自检**

```bash
for f in platforms-overview agent-teams agent-sdk ci-cd-integrations remote-sessions-channels chrome-browser-testing routines-automation sandboxing cli-and-settings-reference; do
  echo "== $f =="
  rg -c "## 失败模式|## 决策边界|自检" "src/content/docs/claude-code/$f.md" || echo "MISSING sections"
done
```

Expected: 每文件至少匹配失败模式或决策边界之一（查阅章可为「维护约定」代替决策边界）。

- [ ] **Step 4: 对照 spec 覆盖表**（人工勾选 `docs/superpowers/specs/2026-05-25-claude-code-gap-supplement-design.md` 官方覆盖表）。

- [ ] **Step 5:** 将 spec 顶部 `状态：待实现` 改为 `状态：已实现`。

---

## PR 拆分建议

| PR | Tasks | 说明 |
|----|-------|------|
| PR1 | 1–3 | P0 骨架，仅导航与占位 |
| PR2 | 4–5 | P1 迁出与瘦身 |
| PR3 | 6–8 | 平台 + teams + CI |
| PR4 | 9–13 | SDK + remote + chrome + routines + sandbox + CLI 查阅 |
| PR5 | 14–15 | 横切扩写 + 验收 |

---

## Spec coverage self-review

| Spec 要求 | Task |
|-----------|------|
| 9 新 slug | 1, 3 |
| order 1–43 | 2 |
| 生态瘦身 | 4 |
| installation 迁出 | 5 |
| 9 章内容契约 | 6–13 |
| 现有章扩写 | 14 |
| prev/next / index / sidebar | 3 |
| claudeCodeSlugs + troubleshooting | 3 |
| pnpm build | 3, 4–15 |
| 官方覆盖表 | 6–14, 15 |

无 TBD 占位步骤；文档项目以 `pnpm build` 与 rg 检查代替单元测试。

---

## PR4 验收记录（2026-05-25）

| 检查项 | 结果 |
|--------|------|
| `pnpm build` | 通过 |
| 9 个新 slug 在 `dist/` | 通过 |
| `claudeCodeSlugs` 含 9 新章 + `troubleshooting-faq` | 通过 |
| 侧栏 9 项与 `index.md` | 通过 |
| 新章无「待深化」 | 通过 |
| 新章含失败模式/决策边界（查阅章为维护约定） | 通过 |
| 站内 `/claude-code/*` 死链 | 0 |
| `ecosystem-integration` 无 GitHub Actions 专节 | 通过 |
| 官方 URL 抽检（4 条） | HTTP 200 |
| `index.astro` 章节表 | 已同步 42 章 + 排障 |

**备注：** `ecosystem-integration` 约 9.9k 字符，仍含组织协作/企业部署正文，高于 spec「约 2k 汉字」目标，但平台/CI 重复正文已迁出。

---

## 执行方式（完成后由负责人选择）

**Plan 已保存至：** `docs/superpowers/plans/2026-05-25-claude-code-gap-supplement.md`

1. **Subagent-Driven（推荐）** — 按 PR 派发子代理，每 Task 后人工或 reviewer 过一遍 diff。  
2. **Inline Execution** — 本会话用 executing-plans 按 Task 1→15 连续执行，在 P0/P1 结束设检查点。

你希望用哪种方式开始落地？
