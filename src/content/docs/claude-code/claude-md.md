---
title: 项目记忆总览
description: 理解 CLAUDE.md 与自动记忆如何跨会话加载，以及记忆与 Hook、Skill、权限的分工，作为第四部分路线图入口。
sidebar:
  order: 8
---

*「Plan Mode 里的计划写得挺好，可一批准执行，它又跑了 `npm test` 而不是我们仓库里的 `pnpm test`。」*

前三章你已理解 [代理循环](/claude-code/agent-loop/) 与 [Plan Mode](/claude-code/plan-mode/)：模型每轮都会读当前上下文里的项目说明，再决定调用哪些工具。缺的不是「更聪明的提示」，而是**跨会话仍生效的项目入职文档**。本指南把这一块收成**第四部分 · 项目记忆**：只谈 Claude 如何记住你的项目，以及你应把什么写进记忆、什么交给别的机制。

官方说明见 [How Claude remembers your project](https://code.claude.com/docs/en/memory)。

---

## 第四部分路线图

| 序 | 章节 | 你将解决 |
| --- | --- | --- |
| 1 | 本章（总览） | 双机制、加载直觉、扩展分工 |
| 2 | [CLAUDE.md 编写与维护](/claude-code/claude-md-authoring/) | `/init`、分层、rules、写什么 |
| 3 | [自动记忆与 `/memory`](/claude-code/auto-memory/) | Auto memory、审计、晋升到 CLAUDE.md |
| 4 | [Monorepo 与多工具记忆](/claude-code/memory-monorepo-ecosystem/) | walk、懒加载、AGENTS.md、排除无关文件 |
| 5 | [团队记忆落地](/claude-code/memory-team-playbook/) | Managed、PR 评审、组织节奏（**本部分终点**） |

预计通读约 45～60 分钟；若你已在 monorepo 中工作，可先读第 4 章再回第 2 章补写 `CLAUDE.md`。

---

## 项目记忆解决什么问题

每次新会话的上下文窗口都是空的。若没有持久记忆，你会反复交代：

- 测试命令是 `pnpm test` 还是 `npm test`
- 哪些目录禁止修改
- 大改前是否要先 `/plan`

**项目记忆**不是让模型「变聪明」，而是把**团队已达成共识的事实**写进每次会话都会加载的上下文，减少循环里的重复纠正。

Claude Code 提供两套互补机制：

| | CLAUDE.md | 自动记忆 Auto Memory |
| --- | --- | --- |
| 谁写 | 你 | Claude |
| 内容 | 规范、命令、架构约定 | 从纠正中沉淀的偏好与经验 |
| 共享 | 项目级可进 Git；用户级在本机 | 按仓库哈希存在本机，不进 Git |
| 适用 | 每条会话都应遵守的硬事实 | 调试心得、临时决策、个人习惯 |
| 加载 | 会话启动时全文注入 | `MEMORY.md` 前 200 行或 25KB |

两者都是**上下文**，不是客户端强制配置。写得越具体，遵守越稳定；要「无论模型怎么想都必须执行」的步骤，见 [Hooks](/claude-code/hooks/) 与 [代理循环](/claude-code/agent-loop/) 中的权限规则。自动记忆需 Claude Code **v2.1.59+**（以 `claude --version` 为准）。

---

## CLAUDE.md 是什么

**CLAUDE.md** 是纯 Markdown 文件。Claude Code 在会话启动时自动读取，**不必在提示词里 `@` 它**。它相当于：

1. **新同事的入职说明**：项目做什么、怎么跑、目录大致分工。
2. **可执行的编码约定**：命名、测试、禁止事项。
3. **架构速查**：三到五句话说清模块如何协作。

最小示例：

```markdown
# My Project

## 命令
- 构建: `pnpm build`
- 测试: `pnpm test`

## 硬约束
- 禁止修改 generated/
```

### 何时该往 CLAUDE.md 里加一行

官方建议：当你发现自己在**重复纠正同一件事**时写入。典型信号：

- Claude 第二次犯同一种错
- Code Review 指出「它本该知道」的仓库约定
- 你刚在上个会话里打过的说明，这次又要再打一遍

若某条说明只属于**单一子目录**或**多步流程**，见 [编写与维护](/claude-code/claude-md-authoring/) 中的 rules 与 [Skill 体系](/claude-code/skills/)，不要全部堆进根 `CLAUDE.md`。

---

## 加载机制：一句话直觉

常见误解是「后加载的文件会覆盖先加载的」。官方行为是：**沿目录树发现的多个 CLAUDE.md 会拼接进同一段上下文**，越靠近你 `cwd` 的说明在拼接结果里越靠后。

- **向上 walk**：从 `cwd` 到文件系统根，启动时加载沿途 `CLAUDE.md` / `CLAUDE.local.md`。
- **向下懒加载**：子目录 `CLAUDE.md` 仅在 Claude **Read** 该目录文件时注入。
- **兄弟包不加载**：在 `frontend/` 工作不会自动带上 `backend/CLAUDE.md`。

图示、monorepo 排除与跨工具桥接见 [Monorepo 与多工具记忆](/claude-code/memory-monorepo-ecosystem/)。`/compact` 后根 `CLAUDE.md` 会从磁盘重载；子目录记忆需再次 Read 才出现，细节链 [上下文管理](/claude-code/context-management/)。

**动手**：在项目根 `CLAUDE.md` 加一行「回答以收到开头」。新开会话提问，确认前缀；运行 `/memory` 核对文件是否在加载列表中。

---

## 扩展机制分工

| 你想达到的效果 | 用哪种机制 |
| --- | --- |
| 默认测试命令、命名风格 | `CLAUDE.md` |
| 大改前先规划 | `CLAUDE.md` 提醒 + [Plan Mode](/claude-code/plan-mode/) |
| 禁止 `git push --force` 或 `rm -rf` | `permissions.deny`，不是 CLAUDE.md |
| Edit 后必须跑 Prettier | [Hooks](/claude-code/hooks/) `PostToolUse` |
| 多步发布流程、偶尔才用 | [Skills](/claude-code/skills/) |
| 调试中 Claude 自己记的偏好 | [自动记忆](/claude-code/auto-memory/) |
| 仅编辑某类文件时的规范 | `.claude/rules/` + `paths` |

[代理循环](/claude-code/agent-loop/) 已说明：CLAUDE.md 写在上下文里，**挡不住**已授权的 Bash。在 CLAUDE.md 里写「禁止删文件」不等于安全；`deny` 规则或 Hook 才是硬边界。

组织部署时：拦截工具、沙箱用 Managed settings；代码风格与合规提醒用 Managed `CLAUDE.md` 或 `claudeMd` 字段。部署细节见 [团队记忆落地](/claude-code/memory-team-playbook/) 与 [团队与组织级落地](/claude-code/team-organization/)。

---

## 决策边界（速查）

| 场景 | 写在哪 |
| --- | --- |
| 所有项目用 pnpm | `~/.claude/CLAUDE.md` |
| 本仓库用 Vitest | `./CLAUDE.md` |
| 本地 DB 端口 5433 | `CLAUDE.local.md` |
| 仅 API 包禁止直查库 | `packages/api/CLAUDE.md` |
| 仅编辑 `*.tsx` 时格式化 | `.claude/rules/` + `paths` |
| 每次提交前必须 lint | Hook，不是 CLAUDE.md |

长任务的窗口挤占与 handoff 属于 [上下文管理与多代理](/claude-code/context-management/)。

---

## 继续读下一章之前

试着回答：

1. CLAUDE.md 与 auto memory 各由谁写、适合放什么？
2. 目录树上是「覆盖」还是「拼接」？
3. 在 CLAUDE.md 写「禁止 force push」能否阻止已授权的 `git push --force`？

---

下一章：[CLAUDE.md 编写与维护](/claude-code/claude-md-authoring/)——分层、`/init`、rules 与可验证写法。
