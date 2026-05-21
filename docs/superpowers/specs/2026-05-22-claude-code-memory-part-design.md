# Claude Code 指南：独立「项目记忆」五章 — 设计说明

**日期**：2026-05-22  
**状态**：已实现  
**方案**：A（第四部分扩为 5 章）

## 第四部分章节

| 序 | 侧栏 | slug | order |
| --- | --- | --- | --- |
| 1 | 项目记忆总览 | `claude-md`（保留 URL） | 8 |
| 2 | CLAUDE.md 编写与维护 | `claude-md-authoring` | 9 |
| 3 | 自动记忆与 /memory | `auto-memory` | 10 |
| 4 | Monorepo 与多工具记忆 | `memory-monorepo-ecosystem` | 11 |
| 5 | 团队记忆落地 | `memory-team-playbook` | 12 |

**部分终点**：`memory-team-playbook` → 第五部分 `hooks`（order 13）。

## 全站 order 偏移

原 order ≥ 9 的章节 +4（hooks 13 … troubleshooting-faq 32）。

## 同步文件

- `src/config/claude-code-sidebar.ts`
- `astro.config.mjs`（`claudeCodeSlugs`）
- `src/content/docs/claude-code/index.md`（33 章）
- `src/pages/claude-code/index.astro`
- `README.md`
- prev/next：`plan-mode` → `claude-md`；`memory-team-playbook` → `hooks`；`hooks` 上一章链 playbook

## 非目标

- 不重写 `team-organization` 正文（交叉链接即可）
- 不新增第六部分章节
