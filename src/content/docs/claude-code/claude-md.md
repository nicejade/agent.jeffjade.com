---
title: CLAUDE.md 文件的艺术
description: 用 CLAUDE.md 为项目注入持久记忆、编码规范与架构灵魂，让 Claude Code 真正理解你的项目。
sidebar:
  order: 7
---

## CLAUDE.md 是什么？

- 项目级持久记忆文件
- Claude Code 启动时自动加载
- 相当于给 Agent 的"项目入职文档"

## CLAUDE.md 的结构最佳实践

```markdown
# 项目名称

## 项目概览
- 一句话描述项目
- 核心业务领域

## 技术栈
- 语言、框架、构建工具

## 架构约定
- 目录结构说明
- 模块边界
- 数据流方向

## 编码规范
- 命名约定
- 文件组织方式
- 禁止事项

## 约束与偏好
- 测试策略
- 提交规范
- 文档要求
```

## 分层 CLAUDE.md 策略

- 根目录 CLAUDE.md：项目全局
- 子目录 CLAUDE.md：模块/包级别
- `.claude/CLAUDE.md`：个人偏好（gitignore）
- 优先级与合并规则：子目录覆盖父级

## 编写技巧与常见陷阱

- 不要太长：聚焦 Claude 不知道的事
- 不要重复：框架文档已有信息无需写入
- 保持更新：随项目演进迭代
- 实例分析：优秀 CLAUDE.md 案例拆解

## CLAUDE.md 与团队协作

- 团队共享 CLAUDE.md 的版本管理
- 个人偏好与团队约定的分层
- 在 Monorepo 中的组织方式
