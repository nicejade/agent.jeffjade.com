---
title: Claude Code 的安装、登录与环境配置
description: 从零开始完成 Claude Code 的 CLI 安装、API 配置、IDE 集成，以及 Node.js 环境准备的全流程指南。
---

## 环境准备

- Node.js 版本要求与 nvm 管理
- 多平台支持：macOS / Linux / Windows (WSL)
- 推荐的终端环境配置

## 安装 Claude Code CLI

```bash
npm install -g @anthropic-ai/claude-code
```

- 全局安装 vs. 项目级安装
- 版本更新策略：`claude update`
- 验证安装：`claude --version`

## 认证与登录

- API 密钥获取与配置
- `claude login` 登录流程
- 环境变量配置（`ANTHROPIC_API_KEY`）
- 多账号切换与管理

## IDE 集成

- VS Code 插件安装与配置
- Claude Code Desktop 桌面版
- JetBrains 插件现状
- 终端内直接使用的最佳实践
