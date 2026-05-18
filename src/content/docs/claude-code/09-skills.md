---
title: Skills：构建可重用提示模板与工作流
description: 理解 Skills 与普通提示的本质区别，学会设计、组织与调用 Skills，让 Claude Code 成为领域专家。
---

## Skills 是什么？

- Skills = 预定义的工作流模板 + 领域知识 + 工具配置
- 与普通提示的区别：上下文预加载、工具权限预设、可复用性
- Skills 的执行模型：加载 → 注入上下文 → 执行任务

## 内置 Skills 速览

- `/commit`：规范化 Git 提交
- `/review-pr`：代码审查
- `/simplify`：代码简化与优化
- Skills 的触发方式：主动调用 vs. Claude 自动识别

## 构建你自己的 Skill

### Skill 文件结构
```
.claude/skills/
  my-skill/
    SKILL.md          # 技能定义（必须）
    prompts/
      system.md       # 系统提示
      examples.md     # 示例
    scripts/           # 辅助脚本（可选）
```

### Skill 设计原则
- 单一职责：一个 Skill 做好一件事
- 清晰的输入输出定义
- 提供示例而非抽象指令
- 错误处理与边界定义

## Skills 库的组织与共享

- 个人 Skills 库的演进策略
- 团队 Skills 的版本管理
- 社区 Skills 的发现与复用
- 与 CLAUDE.md 的分工：CLAUDE.md 说"是什么"，Skills 说"怎么做"

## Skills vs. Hooks vs. SubAgents

| 维度 | Skills | Hooks | SubAgents |
|------|--------|-------|-----------|
| 定位 | 工作流模板 | 自动化拦截 | 独立任务执行 |
| 触发方式 | 显式/自动 | 事件驱动 | 显式委托 |
| 上下文 | 共享 | 共享 | 隔离 |
