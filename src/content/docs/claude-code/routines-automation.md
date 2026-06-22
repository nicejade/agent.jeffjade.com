---
title: Routines 与定时自动化
description: 区分会话内 `/loop`、定时任务与云端 Routines，在关机后仍能跑团队级自动化。
sidebar:
  order: 35
---

*「`/loop` 要开着终端；我想要每天九点自动审查 main 上的依赖漏洞。」*

Claude Code 有**四层**「让会话继续干活」的机制，容易混用：**条件续跑**、**会话内循环**、**会话内定时**、**云端 Routines**。官方：[goal](https://code.claude.com/docs/en/goal)、[Routines](https://code.claude.com/docs/en/routines)、[Scheduled tasks](https://code.claude.com/docs/en/scheduled-tasks)、bundled skill `/loop`（见 [Commands](https://code.claude.com/docs/en/commands)）。`/goal` 机制见专章 [`/goal` 与跨轮持续目标](/claude-code/goal-mode/)。

---

## 四层对照

| 层 | 入口 | 运行位置 | 终端要开着吗 | 典型用途 |
|----|------|----------|--------------|----------|
| **`/goal`** | `/goal <条件>` | 本机当前会话 | **是** | 直到测试绿、验收满足等可验证终点 |
| **Bundled `/loop`** | `/loop [间隔] [提示]` | 本机当前会话 | **是** | 按间隔重复尝试 |
| **会话内定时** | `/schedule`、cron 工具 | 本机当前会话 | **是** | 轮询、提醒、会话内周期任务 |
| **Routines** | Web、Desktop、`/schedule` 向导 | Anthropic 托管云 | **否** | 每日 review、依赖审计、GitHub 事件 |

**记忆：** `/goal` 是「跑到条件满足」；`/loop` 是「别关这个终端、按间隔重试」；Routines 是「像 cron 一样在云上跑」。

---

## `/loop` 与会话内定时

`/loop` 是 bundled skill：在**同一交互会话**里按间隔重复执行提示，直到目标达成或你停止。适合：

- 本地盯着 Claude 跑测试直到绿
- 短周期重试（注意 token）

[Scheduled tasks](https://code.claude.com/docs/en/scheduled-tasks) 文档描述会话内的 cron 式调度工具，与 `/loop` 互补。Desktop 另有 [Desktop scheduled tasks](https://code.claude.com/docs/en/desktop-scheduled-tasks)。

**风险：** 终端休眠、笔记本合盖会中断；长间隔任务应上 Routines 或 CI。

---

## Routines（云端）

[Routines](https://code.claude.com/docs/en/routines) 在 Anthropic 基础设施运行，电脑关机仍可执行。可：

- 按 cron 调度
- 由 API 触发
- 响应 **GitHub 事件**

创建路径包括 Web、[Desktop](/claude-code/platforms-overview/#claude-code-desktop)、CLI `/schedule`（或 `/routines`，以 `/` 菜单为准）。

### Plan 与 API 限制

与 [生态集成](/claude-code/ecosystem-integration/#企业部署与管理员) 一致：**仅 Bedrock/Vertex/Foundry** 时，Routines、部分 Web、Code Review 等可能不可用，需 Anthropic API 或 Teams 席位。发布前对照各功能页。

---

## 与 CI、Hooks 的分工

| 方式 | 确定性 | 成本归属 |
|------|--------|----------|
| GitHub Action `@claude` | 高，workflow 定义清晰 | Actions 分钟 + API |
| Routines | 中，依赖模型判断 | 订阅/API |
| `/loop` | 低，人在环 | 本机会话 token |
| Hooks | 最高，脚本必跑 | 几乎无模型费 |

**推荐：** 合 main 门禁用 CI；个人每日简报用 Routines；当场调试循环用 `/loop`。

---

## 失败模式

| 现象 | 可能原因 | 下一步 |
|------|----------|--------|
| `/loop` 停了 | 终端关闭 | 改 Routines 或 CI |
| Routine 未跑 | Plan 限制 | 查账号与官方 routines 页 |
| 重复改坏仓库 | 无 review | Routine 只读 + 开 PR |
| 费用高 | 频率过高 | 降频；换 Sonnet |

---

## 决策边界

**用 `/loop`：** 你在场、要快迭代、可接受关终端即停。

**用 Routines：** 定时、关机后仍跑、GitHub 事件驱动。

**用 CI：** 必须审计、合 main 前硬门禁。

---

## 继续读下一章之前

1. 四层自动化哪一层要开着终端？  
2. `/goal` 与 `/loop` 的「下一 turn」触发条件有何不同？  
3. 仅 Bedrock 凭证时 Routines 可能怎样？

自检：

- [ ] 能区分 `/goal`、`/loop` 与 Routines  
- [ ] 知道 `/schedule` 应链到本章  
- [ ] 读过官方 routines 创建步骤  

---

上一章：[`/goal` 与跨轮持续目标](/claude-code/goal-mode/) · 下一章：[调试与错误恢复](/claude-code/debug-error-recovery/)
