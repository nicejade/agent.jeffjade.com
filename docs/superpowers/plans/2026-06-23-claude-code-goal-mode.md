# Claude Code `/goal` 独立章节 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 `goal-mode.md` 教程章，更新 sidebar order 34–44、导航链与交叉链接，使 `pnpm build` 通过。

**Architecture:** 单篇新 Markdown + 配置与 8 个现有章节的轻量补丁；不新增组件或路由重定向。order 插入后 Part 9–10 顺延 +1。

**Tech Stack:** Astro 5、Starlight、`src/config/claude-code-sidebar.ts`、`pnpm build`

**Spec:** `docs/superpowers/specs/2026-06-23-claude-code-goal-mode-design.md`

---

## File map

| Action | Path |
|--------|------|
| Create | `src/content/docs/claude-code/goal-mode.md` |
| Modify | `src/config/claude-code-sidebar.ts` |
| Modify | `src/content/docs/claude-code/index.md` |
| Modify | `src/pages/claude-code/index.astro` |
| Modify | `src/content/docs/claude-code/reflection.md` |
| Modify | `src/content/docs/claude-code/routines-automation.md` |
| Modify | `src/content/docs/claude-code/debug-error-recovery.md` |
| Modify | `src/content/docs/claude-code/slash-commands.md` |
| Modify | `src/content/docs/claude-code/agent-loop.md` |
| Modify | `src/content/docs/claude-code/hooks.md` |
| Modify | `src/content/docs/claude-code/complete-workflow.md` |
| Modify | order frontmatter: `routines-automation` 35, `debug-error-recovery` 36, `token-economics` 37, `sandboxing` 38, `security-permissions` 39, `tdd-quality` 40, `team-organization` 41, `mental-model-migration` 42, `cli-and-settings-reference` 43, `troubleshooting-faq` 44 |
| Modify | `docs/superpowers/specs/2026-06-23-claude-code-goal-mode-design.md` 状态 → 已实现 |

---

### Task 1: 撰写 `goal-mode.md`

**Files:**
- Create: `src/content/docs/claude-code/goal-mode.md`

- [ ] **Step 1:** 按 spec 十章结构写入正文，`sidebar.order: 34`
- [ ] **Step 2:** prev/next 链到 `reflection` 与 `routines-automation`

---

### Task 2: Sidebar 与 order 顺延

**Files:**
- Modify: `src/config/claude-code-sidebar.ts`
- Modify: 10 个文件的 `sidebar.order` frontmatter

- [ ] **Step 1:** 第九部分首项插入 goal-mode 链接
- [ ] **Step 2:** 原 order ≥34 各 +1

---

### Task 3: 索引与漫游页

**Files:**
- Modify: `src/content/docs/claude-code/index.md`
- Modify: `src/pages/claude-code/index.astro`

- [ ] **Step 1:** 第九部分插入第 34 章，后续编号 +1
- [ ] **Step 2:** 全站「42 章」改为「43 章」

---

### Task 4: 交叉链接补丁

**Files:** `reflection.md`, `routines-automation.md`, `slash-commands.md`, `agent-loop.md`, `hooks.md`, `complete-workflow.md`

- [ ] **Step 1:** 按 spec 表插入链接与一句说明

---

### Task 5: 验证

- [ ] **Step 1:** `pnpm build` 无错误
- [ ] **Step 2:** 更新 spec 状态为已实现
