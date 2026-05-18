---
title: SubAgents：上下文隔离与复杂任务拆解
description: 学会用 SubAgents 实现独立上下文、权限隔离与并行执行，解决复杂多步骤任务的上下文污染问题。
sidebar:
  order: 10
---

## SubAgents 的设计哲学

- 问题：长会话的上下文膨胀与注意力衰减
- 解法：将大任务拆解为独立子任务，委托给专用 SubAgent
- 核心优势：上下文隔离、权限隔离、并行执行

## SubAgent 类型

| 类型 | 用途 | 隔离级别 |
|------|------|----------|
| Explore | 代码库探索 | Worktree 隔离 |
| Plan | 方案设计 | 上下文隔离 |
| general-purpose | 通用任务 | 上下文隔离 |
| claude-code-guide | 产品问答 | 上下文隔离 |

## 何时使用 SubAgents

- **信息收集**：大规模代码库探索（用 Explore Agent）
- **方案设计**：在独立上下文中规划，避免污染主会话
- **并行任务**：多文件独立修改同时进行
- **风险隔离**：实验性操作在 Worktree 中先行尝试

## SubAgents 的委托模式

```
主会话: "为这个模块写单元测试"
    ↓
主 Agent: 委托 3 个 SubAgent 并行探索 3 个子模块
    ↓           ↓           ↓
 Agent A    Agent B    Agent C
 (模块1)    (模块2)    (模块3)
    ↓           ↓           ↓
    回报探索结果给主 Agent
    ↓
主 Agent: 整合信息，并行执行编写
```

## 与 Skills 的协作

- Skills 定义"怎么做"，SubAgents 负责"去执行"
- Skill 可以触发 SubAgent 实现复杂工作流
- 实战：用 Skill + SubAgent 实现全项目代码迁移

## 注意事项

- SubAgent 有独立令牌消耗
- 子代理结果不会自动显示给用户
- 委托粒度：不要太细（开销）也不要太粗（污染）
