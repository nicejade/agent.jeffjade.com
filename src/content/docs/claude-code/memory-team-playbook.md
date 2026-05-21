---
title: 团队记忆落地
description: 划分 Managed 与项目 CLAUDE.md 职责，建立记忆文件的 PR 评审与晋升节奏，完成第四部分团队向终点练习。
sidebar:
  order: 12
---

*「每个人本地的 CLAUDE.md 都不一样，PR 里看不出记忆文件该不该 merge；IT 下发的合规条和工程约定混在同一文件里。」*

本章是 **第四部分 · 项目记忆** 的终点：把前几章的机制变成**团队可执行**的治理节奏。Managed 部署与 PR 透明度细节另见 [团队与组织级落地](/claude-code/team-organization/)，本章不重复长篇部署步骤。

---

## Managed 与项目：各写什么

| 层级 | 位置 | 谁维护 | 典型内容 |
| --- | --- | --- | --- |
| Managed policy | macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`；Linux/WSL: `/etc/claude-code/CLAUDE.md`；Windows: `C:\Program Files\ClaudeCode\CLAUDE.md` | IT / 平台 | 不可协商的安全与合规提醒 |
| Managed `claudeMd` | `managed-settings.json` 内字段 | IT | 与独立 Managed 文件二选一或并用 |
| 项目 | `./CLAUDE.md` | 工程团队 | 构建命令、架构、仓库陷阱 |
| 用户 | `~/.claude/CLAUDE.md` | 个人 | 语言、包管理器偏好 |

**原则：** Managed 写**不可协商**项；项目写**本仓库事实**；不要把全部团队细节塞进 Managed，否则更新慢、难 fork。

官方对照：settings 管**强制拦截**；CLAUDE.md 管**行为引导**。示例：

| 关切 | 配置位置 |
| --- | --- |
| 拦截工具、沙箱 | Managed `permissions.deny` |
| 代码风格、合规提醒 | Managed `CLAUDE.md` 或 `claudeMd` |
| 本仓库测试命令 | 项目 `CLAUDE.md` |

`managed-settings.json` 内嵌示例：

```json
{
  "claudeMd": "提交前运行 `make lint`。\n禁止直接 push 到 main。"
}
```

---

## 项目 CLAUDE.md 维护节奏

1. **每迭代：** Review 中若出现「Agent 本该知道」，开 issue 更新 `CLAUDE.md` 或 `.claude/rules/`。
2. **每季度：** 删过时条、合并冲突、检查是否超过 200 行应拆分。
3. **与 Plan Mode：** PR 描述可引用已批准计划，与 `CLAUDE.md` 验收命令对齐。

```bash
git add CLAUDE.md .claude/rules/
git commit -m "docs: 更新 Agent 协作记忆（统一 pnpm test）"
```

### PR Review 检查项（记忆相关）

- [ ] 新增规则是否可验证、无模糊形容词
- [ ] 是否与 Managed 或现有 rules 冲突
- [ ] 是否应改为 `paths` 作用域而非全局加载
- [ ] 是否应进 Hook 而非 CLAUDE.md（必须 deterministic 时）
- [ ] auto memory 中团队级事实是否已晋升进 Git

---

## 练习 1：30 分钟建立团队记忆基线

1. 在目标仓库根运行 `/init`，本地跑通列出的测试命令。
2. 补三条：**硬约束**、**已知陷阱**、**大改前 `/plan`**（若团队采用）。
3. 提交 PR，指定 reviewer 用上一节检查项过一遍。
4. 运行 `/memory` 截图或记录加载列表，附在 PR 说明（可选，便于 onboarding）。

---

## 练习 2：从 auto memory 晋升

1. 完成 [自动记忆](/claude-code/auto-memory/) 一章的「记住 Redis」实验。
2. 若全团队需要，把条目改写进 `CLAUDE.md` 并删 auto memory 中重复表述。
3. 在 PR 中注明「来自会话纠正 → 团队记忆」。

---

## 练习 3：Monorepo 包边界

1. 在常用子包目录启动 Claude，`/memory` 列出加载文件。
2. 若出现无关团队 `CLAUDE.md`，添加 `claudeMdExcludes` 并文档化原因。
3. 为子包新增专用 `CLAUDE.md` 仅写与根文件不重复的 5～10 行。

---

## 与 Hooks、Skill 的决策表

| 需求 | 首选 |
| --- | --- |
| 每会话都知道测试命令 | 项目 `CLAUDE.md` |
| Edit 后必须 format | Hook `PostToolUse` |
| 偶尔才跑的发布清单 | Skill |
| 禁止 `rm -rf` | `permissions.deny` |
| 个人回复语言 | `~/.claude/CLAUDE.md` |

---

## 第四部分总结自检

读完第四部分五章后，你应能：

- [ ] 运行过 `/init` 并验证测试命令
- [ ] 用 `/memory` 区分 CLAUDE.md 与 auto memory
- [ ] 说出 walk 拼接与兄弟包不加载
- [ ] 能区分 CLAUDE.md、deny、Hooks
- [ ] 团队有记忆文件 PR 检查项或维护责任人

---

下一章：[Hooks 机制](/claude-code/hooks/)——CLAUDE.md 表达「希望怎么做」；Hooks 在生命周期节点保证「一定执行或一定拦住」。
