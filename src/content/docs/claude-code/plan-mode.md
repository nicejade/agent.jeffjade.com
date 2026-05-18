---
title: Plan Mode：Claude Code 的杀手级功能
description: 掌握「先规划再执行」的工作流模式，用 Plan Mode 避免 AI 编码的灾难循环，实现可控的高质量输出。
sidebar:
  order: 6
---

## 为什么需要 Plan Mode？

- 传统模式的问题：Agent 边想边做，容易"跑偏"
- "灾难循环"：修一个 Bug 引入三个新 Bug
- Plan Mode 的核心思想：把"想"和"做"分离

## Plan Mode 的工作流

```
1. 用户提出需求
       ↓
2. Agent 进入 Plan Mode → 只读探索（不写代码）
       ↓
3. Agent 输出结构化计划
       ↓
4. 用户审查、修改、批准 ← 关键的人控节点
       ↓
5. Agent 按计划逐步执行
       ↓
6. 每步完成后验证，偏离计划时回链
```

## 触发 Plan Mode

- 手动触发：`claude --plan-mode`
- 自动触发：复杂任务自动建议进入
- 在会话中切换：`/plan` 命令

## 计划的内容要素

- 受影响的文件列表
- 实现步骤与依赖关系
- 关键决策点与备选方案
- 风险点与回滚策略

## 计划的验证与迭代

- 用 Todo 列表跟踪进度
- 每完成一步的验证标准
- 计划偏离时的处理策略
- 实战案例：用 Plan Mode 重构一个模块

## Plan Mode 的最佳实践

- 何时使用 Plan Mode（vs. 直接执行）
- 计划粒度：不要太粗也不要太细
- 与 CLAUDE.md 的配合使用
- 团队协作中的 Plan Review 流程
