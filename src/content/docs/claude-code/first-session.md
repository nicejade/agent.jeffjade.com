---
title: 启动你的第一个 Claude Code 会话
description: 掌握基础命令、交互模式、权限管理，完成从启动到第一个成功任务的完整流程。
sidebar:
  order: 4
---

## 启动会话

```bash
claude
# 或进入项目目录后直接启动
cd my-project && claude
```

- 基本启动命令
- 指定模型：`claude --model`
- 会话模式 vs. 单次命令模式

## 基础命令速查

| 命令 | 功能 |
|------|------|
| `/help` | 查看帮助 |
| `/clear` | 清除会话上下文 |
| `/compact` | 压缩上下文释放空间 |
| `/cost` | 查看令牌消耗 |
| `/doctor` | 诊断环境问题 |

## 交互模式

- 自由文本对话
- 管道输入：`cat error.log | claude "分析这个错误"`
- 图片输入：拖拽或粘贴截图
- 文件引用：`@filename` 语法
- 会话恢复：自动保存与恢复

## 权限提示（Permission Prompts）

- 权限层级：只读 / 沙箱 / 完全访问
- 理解每次权限请求的含义
- 批量授权策略与安全边界
- 自定义权限配置

## 完成你的第一个任务

- 示例：让 Claude Code 分析一个项目的代码结构
- 示例：用 Claude Code 修复一个 ESLint 错误
- 观察 Agent Loop：规划 → 搜索 → 编辑 → 验证
