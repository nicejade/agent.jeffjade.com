---
title: Monorepo 与多工具记忆
description: 掌握 CLAUDE.md 向上拼接与向下懒加载，用 claudeMdExcludes 排除无关记忆，并与 AGENTS.md、Cursor 规则共存。
sidebar:
  order: 13
---

*「在 monorepo 的 `apps/web` 里启动 Claude，却加载了隔壁团队的 CLAUDE.md；Cursor 里改的是 `.cursor/rules`，同事用 Claude Code 完全看不到。」*

本章深入 [加载机制](/claude-code/claude-md/#加载机制一句话直觉)：目录树行为、大仓库治理，以及多 AI 工具下的记忆桥接。

---

## 加载机制：拼接，不是覆盖 {#loading-mechanism}

Claude Code 从**当前工作目录**向上走到文件系统根，收集 `CLAUDE.md` 与 `CLAUDE.local.md`，**拼接**进同一段上下文。

拼接顺序：

1. **目录树**：从靠近文件系统根的路径到靠近 `cwd` 的路径；**越靠近 `cwd` 的内容在拼接结果里越靠后**。
2. **同一目录**：先 `CLAUDE.md`，再 `CLAUDE.local.md`。

```
/  …  /monorepo/CLAUDE.md           ← 先进入
        /monorepo/apps/web/CLAUDE.md ← 后进入，更贴近当前任务
```

### 祖先 vs 后代

| 方向 | 何时加载 | 典型场景 |
| --- | --- | --- |
| 向上（祖先） | 会话启动 | 公司规范 + 仓库根约定 + 当前包约定 |
| 向下（子目录） | Claude Read 该目录文件时 | `packages/api/CLAUDE.md` 仅在改 API 时出现 |
| 兄弟目录 | **不加载** | 在 `frontend/` 不会带上 `backend/CLAUDE.md` |

**动手：** 在 monorepo 子包目录启动 `claude`，运行 `/memory`，确认列表中有根与子包文件、无无关兄弟包文件。

### 与 `/compact` 的关系

- 根目录 `CLAUDE.md`：compact 后从磁盘**重新注入**。
- 子目录 `CLAUDE.md`：compact 后**不自动重载**，需再次 Read 该目录文件。

只在聊天里说过、未写入文件的约定，compact 后可能丢失。长任务 handoff 见 [上下文管理](/claude-code/context-management/)。

---

## 排除无关 CLAUDE.md

大仓库 walk 可能拾取其他团队的祖先记忆。在 `.claude/settings.local.json` 配置 `claudeMdExcludes`：

```json
{
  "claudeMdExcludes": [
    "**/monorepo/other-team/CLAUDE.md",
    "/absolute/path/to/noisy-rules/**"
  ]
}
```

- 模式对**绝对路径**做 glob 匹配。
- 可在 user / project / local / managed 各层配置，数组会合并。
- **托管策略 CLAUDE.md 不可被排除**，保证组织级说明始终生效。

---

## Monorepo 分层建议

1. **根 `CLAUDE.md`**：全仓测试命令、共享 lint、禁止动 `infra/` 等。
2. **包内 `CLAUDE.md`**：仅该包的框架版本、目录约定；不复制根文件全文。
3. **`.claude/rules/` + `paths`**：仅改 `*.tsx` 或 `src/api/**` 时才加载的规范。

注意：Hooks、MCP、部分 settings 仍以**仓库根**为会话全局为主；技能与 CLAUDE.md 支持嵌套发现。配置边界见官方 [Settings](https://code.claude.com/en/settings) 与 [生态深度集成](/claude-code/ecosystem-integration/)。

---

## AGENTS.md 与 Cursor 规则

| 文件 | Claude Code 行为 | 建议 |
| --- | --- | --- |
| `CLAUDE.md` | 原生加载 | 团队主入口 |
| `AGENTS.md` | 不自动加载 | 在 `CLAUDE.md` 写 `@AGENTS.md` 统一多工具说明 |
| `.cursor/rules` | 不加载 | 重要条目同步到 `CLAUDE.md` 或 `AGENTS.md` |

`/init` 可参考 `AGENTS.md`、`.cursorrules` 生成草稿。GitHub 上有 [支持 AGENTS.md 的 feature request](https://github.com/anthropics/claude-code/issues/6235)；发布前以官方文档为准。

**跨工具维护策略（推荐）：**

1. 单一事实源：`AGENTS.md` 或根 `CLAUDE.md` 之一为主。
2. Claude 专用补充写在 `CLAUDE.md` 的 `## Claude Code` 小节。
3. 季度 review：删 Cursor 已废弃但 `CLAUDE.md` 仍保留的规则。

---

## 失败模式

| 症状 | 常见原因 | 下一步 |
| --- | --- | --- |
| 子目录规则不出现 | 未 Read 该目录 | 让 Claude 打开该路径下文件 |
| 加载了隔壁团队规范 | 祖先 walk | `claudeMdExcludes` |
| compact 后子包约定消失 | 子目录 CLAUDE.md | 关键条提升到根或再 Read |
| Cursor 与 Claude 行为不一致 | 两套文件未同步 | 合并到 `@AGENTS.md` |

---

## 自检清单

- [ ] 能画出当前 `cwd` 的祖先链
- [ ] 知道兄弟包记忆不会自动加载
- [ ] monorepo 中配置过或考虑过 `claudeMdExcludes`

---

下一章：[团队记忆落地](/claude-code/memory-team-playbook/)——Managed、PR 评审与组织节奏（第四部分终点）。
