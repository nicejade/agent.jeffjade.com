---
title: 自动记忆与 /memory
description: 配置与审计 Auto Memory，用 /memory 管理 MEMORY.md，并把应团队共享的条目晋升到 CLAUDE.md。
sidebar:
  order: 10
---

*「界面闪过 Writing memory，但我不知道它记了什么；同事仓库里的约定它记住了，团队却看不见。」*

本章讲 Claude **自动写入**的跨会话记忆：存储位置、加载上限、与手写 `CLAUDE.md` 的分工，以及如何用 `/memory` 审计与纠错。

官方说明见 [Auto memory](https://code.claude.com/docs/en/memory#auto-memory)。需 Claude Code **v2.1.59+**（发布说明以官方为准）。

---

## 与 CLAUDE.md 的分工

| | CLAUDE.md | Auto Memory |
| --- | --- | --- |
| 谁写 | 你或「请写进 CLAUDE.md」 | Claude（你说「记住」时多数进 auto memory） |
| 团队可见 | 进 Git 可 review | 本机 `~/.claude/projects/.../memory/` |
| 启动加载 | 全文（仍建议 <200 行） | `MEMORY.md` 前 **200 行或 25KB** |
| 适合 | 测试命令、硬约束、架构事实 | 调试心得、个人偏好、会话中发现的模式 |

**晋升规则：** 若某条应对**全团队统一**，从 auto memory 抄入或改写进 `CLAUDE.md` 并走 PR。若仅你本机需要，留在 auto memory 或 `CLAUDE.local.md`。

SubAgent 也可维护独立 auto memory，见官方 [Subagent memory](https://code.claude.com/en/sub-agents#enable-persistent-memory) 与 [SubAgents](/claude-code/subagents/)。

---

## 存储结构

```text
~/.claude/projects/<project-hash>/memory/
├── MEMORY.md          # 索引，每次会话加载（有上限）
├── debugging.md       # 主题文件，按需 Read
└── …
```

`<project-hash>` 由 git 仓库推导；同一仓库的 worktree **共享**一份 auto memory。非 git 目录则用项目根推导。

`MEMORY.md` 是目录索引；细节放在主题文件，避免索引超过 200 行后**后半段不进启动上下文**。

---

## 开关与自定义路径

默认开启。关闭方式：

- 会话内 `/memory` 切换 auto memory 开关
- 项目 `.claude/settings.json`：

```json
{
  "autoMemoryEnabled": false
}
```

环境变量 `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` 可全局关闭。

自定义目录（**仅用户或策略层**，项目 settings 不接受，防止克隆仓库重定向写入）：

```json
{
  "autoMemoryDirectory": "~/my-claude-memory"
}
```

值须为绝对路径或以 `~/` 开头。

---

## `/memory` 能做什么

`/memory` 列出当前会话已加载的 `CLAUDE.md`、`CLAUDE.local.md` 与 rules；可开关 auto memory；可打开 auto memory 文件夹编辑。

**动手：**

1. 运行 `/memory`，确认项目 `CLAUDE.md` 在列表中。
2. 对 Claude 说「记住：本仓库 E2E 需要 `docker compose up -d redis`」。
3. 再开 `/memory` 查看 `MEMORY.md` 是否出现对应条目。
4. 若需团队共享，明确说「把这条写进 CLAUDE.md」并人工 review 后提交 Git。

界面出现 **Writing memory** / **Recalled memory** 表示正在读写 auto memory 目录。

---

## 官方排障要点

### Claude 不遵守 CLAUDE.md

CLAUDE.md 作为上下文注入，**无严格保证**。排查：

1. `/memory` 确认文件已加载；未列出则 Claude 看不见。
2. 确认 `cwd` 使 walk 能拾取正确层级。
3. 指令要具体；冲突的多层文件合并或删过时条。
4. 必须在固定节点执行的操作 → [Hooks](/claude-code/hooks/)。
5. 脚本化且每次都要的系统级指令 → CLI `--append-system-prompt`（交互场景较少用）。

调试**哪些说明在何时加载**，可用官方 [`InstructionsLoaded` Hook](https://code.claude.com/en/hooks#instructionsloaded) 打日志。

### 不知道 auto memory 记了什么

`/memory` 打开 auto memory 目录；全是明文 Markdown，可删改。

### compact 后丢约定

根 `CLAUDE.md` 在 `/compact` 后会从磁盘**重新注入**。子目录 `CLAUDE.md` 与**仅存在于聊天**的说明不会自动回来。见 [上下文管理](/claude-code/context-management/) 与官方 [What survives compaction](https://code.claude.com/en/context-window#what-survives-compaction)。

---

## 失败模式

| 症状 | 常见原因 | 下一步 |
| --- | --- | --- |
| 改了 CLAUDE.md 却不生效 | 未在 `/memory` 列表 | 检查路径与 cwd；新开会话 |
| auto memory 找不到细节 | 在主题文件里 | `/memory` 打开目录全文查看 |
| 团队不知道 Redis 依赖 | 只进了 auto memory | 晋升到 `CLAUDE.md` |
| 索引过长后半失效 | `MEMORY.md` 超 200 行 | 拆到 `debugging.md` 等主题文件 |

---

## 自检清单

- [ ] 用 `/memory` 看过当前加载列表
- [ ] 能说出「记住」与「写进 CLAUDE.md」的区别
- [ ] 知道 `MEMORY.md` 的 200 行 / 25KB 启动上限

---

下一章：[Monorepo 与多工具记忆](/claude-code/memory-monorepo-ecosystem/)——walk、懒加载、`claudeMdExcludes` 与 AGENTS.md。
