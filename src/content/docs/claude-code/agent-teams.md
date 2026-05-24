---
title: Agent Teams 与多会话协作
description: 区分 SubAgents 与多会话 Agent Teams，在并行审查与竞争假设调试时选对协作模型并控制成本。
sidebar:
  order: 19
---

*「我想让两个 Claude 会话互相讨论同一份 PR，而不是在一个窗口里派子代理。」*

[SubAgents](/claude-code/subagents/) 在**同一会话**里隔离上下文；**Agent Teams** 是多个**独立 Claude Code 会话**组成队伍，共享任务列表、可点对点发消息，由主会话或你统一协调。官方见 [Agent teams](https://code.claude.com/docs/en/agent-teams)、[Run agents in parallel](https://code.claude.com/docs/en/agents)、[Agent view](https://code.claude.com/docs/en/agent-view)。

> Agent Teams 与启用方式可能随版本变化，属实验或受 Plan 限制的能力。实施前对照官方文档与 `/doctor`。

---

## 四种并行方式怎么选

| 方式 | 进程模型 | 会话间通信 | 典型场景 |
|------|----------|------------|----------|
| **SubAgents** | 单会话内子循环 | 仅摘要回主会话 | 重探索、单任务分工 |
| **agent view** | 多会话，统一监控 | 各自独立 | 同时开多个无关任务 |
| **git worktree** | 多目录隔离 | 无自动通信 | 并行改不同分支，防文件冲突 |
| **Agent Teams** | 多会话 + 共享任务板 | **可互发消息** | 并行 review、竞争假设、互相质疑 |

**记忆口诀：** 要「一个大脑派探子」用 SubAgents；要「多个同事开会」用 Agent Teams；要「多个实习生各干各的」用 agent view + worktree。

---

## Agent Teams 解决什么

官方定位：协调多个 Claude Code 实例，**共享任务**、**队友间消息**、集中管理。适合：

1. **并行 code review**：不同队友按安全/性能/测试维度审查同一 diff，主会话汇总。
2. **竞争假设调试**：一队友坚持「竞态」，另一坚持「配置错误」，用证据互相反驳。
3. **大模块拆分**：前端与后端会话各改各目录，通过消息同步接口约定。

不适合：改一行文案、单文件 bug、成本敏感且可一次 SubAgent 完成的探索。

---

## 与 SubAgents 的成本差异

[局限性与应对](/claude-code/limitations/) 提到：Agent Teams 可能达到**多实例、高 token**（例如 plan 模式队友约 7x 量级，以你环境实测为准）。SubAgents 通常更省，因为共用一个计费会话外壳，只多子循环。

| 维度 | SubAgents | Agent Teams |
|------|-----------|-------------|
| 实例数 | 逻辑子代理 | 多个完整会话 |
| 通信 | 摘要 | 可双向消息 |
| 成本 | 中 | 高 |
| 启用复杂度 | 低 | 较高 |

团队默认应 **SubAgents 优先**；仅在需要会话间辩论或长期并行时开 Teams。

---

## 启用与最小路径（以官方为准）

启用步骤、环境变量名、Desktop/Web 是否支持，以 [Agent teams](https://code.claude.com/docs/en/agent-teams) 当前说明为准。一般流程类似：

1. 在支持的平台更新 Claude Code 到文档要求的版本。
2. 按官方说明开启 Teams 实验开关（若有）。
3. 创建 team，添加队友会话，分配共享任务。
4. 主会话下发目标；队友完成后通过任务板或消息回报。

**可观察信号：** 任务列表出现多成员状态；队友会话可 `SendMessage` 类交互（API 名以官方为准）。

---

## 与上下文管理、handoff 的组合

[上下文管理](/claude-code/context-management/) 的 handoff 解决**单会话**窗口爆满。Agent Teams 解决**多会话**分工，二者可叠加：

```text
主会话 Plan 拆任务
    ↓
Agent Teams：队友 A 只读探索 / 队友 B 实现
    ↓
主会话合并结论；若单会话仍过长 → /handoff
```

不要让每个队友各自扫全库；在任务描述里写清目录与输出格式。

---

## 失败模式

| 现象 | 可能原因 | 下一步 |
|------|----------|--------|
| 队友结论互相矛盾 | 任务描述重叠 | 划分只读/只写边界 |
| 账单暴增 | 多 Opus 队友并行 | 换 Sonnet 队友；减并行度 |
| 消息无人回复 | 队友会话未启动 | agent view 检查状态 |
| 与 SubAgents 混淆 | 期望单窗口 | 改委派 SubAgent |

---

## 决策边界

**用 Agent Teams：** 需要多会话**互相通信**或共享任务板的并行审查/调研。

**用 SubAgents：** 单会话内探索或实现，成本可控。

**用 worktree：** 主要是**文件隔离**，不需要队友对话。

**不用 Teams：** 小任务、预算紧、只需一个结论。

---

## 继续读下一章之前

1. SubAgents 与 Agent Teams 在「通信」上的根本区别？  
2. 为何 Teams 通常比 SubAgents 更贵？  
3. 你团队有一个适合 Teams 的真实 PR 场景吗？

自检：

- [ ] 读过官方 agent-teams 页的启用说明  
- [ ] 能说出四种并行方式选型  
- [ ] 知道高成本时先缩 SubAgents  

---

上一章：[SubAgents](/claude-code/subagents/) · 下一章：[MCP 协议](/claude-code/mcp/)
