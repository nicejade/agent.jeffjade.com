---
title: Hooks：自动化、安全校验与生命周期控制
description: 掌握 PreToolUse、PostToolUse、Stop 等 Hook 触发器，设计自己的自动化工作流与安全护栏。
---

## Hooks 机制概述

- 什么是 Hooks：Agent 生命周期的拦截器
- Hooks 的执行模型：工具调用前后的钩子
- 与 Git Hooks 的类比理解

## Hook 类型与触发器

| Hook | 触发时机 | 典型用途 |
|------|----------|----------|
| PreToolUse | 工具调用前 | 权限校验、参数检查 |
| PostToolUse | 工具调用后 | 自动格式化、日志记录 |
| Stop | Agent 停止时 | 通知、清理、状态记录 |
| UserPromptSubmit | 用户提交时 | 输入预处理 |
| Notification | 事件通知 | 外部集成触发 |

## 实战 Hook 设计

### 格式化 Hook
- PostToolUse 自动运行 Prettier / ESLint
- 确保 Claude Code 输出的代码符合项目规范

### 安全校验 Hook
- PreToolUse 拦截危险命令（rm -rf /、DROP TABLE）
- 敏感文件保护（.env、credentials.json）

### 通知 Hook
- Stop 时发送系统通知
- 与 Slack / Discord 集成

## Hooks 配置

- settings.json 中的 hooks 配置结构
- Hook 脚本的编写规范
- 调试 Hooks 的技巧
- 团队共享 Hook 配置
