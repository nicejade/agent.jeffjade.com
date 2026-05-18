---
title: MCP：Claude Code 的万能接口
description: 理解 Model Context Protocol，用 MCP Server 将 Claude Code 连接到 GitHub、数据库、浏览器、Figma 等外部工具与服务。
---

## MCP（Model Context Protocol）是什么？

- Anthropic 提出的开放协议
- 类比：USB 接口——统一的连接标准
- 架构：MCP Client（Claude Code）→ MCP Server（外部服务适配器）
- 解决的问题：AI 与外部工具的一对一集成→一对多标准化

## MCP 的核心概念

```
Claude Code (MCP Client)
       │
       ├── MCP Server: GitHub → Issues, PRs, Code Search
       ├── MCP Server: PostgreSQL → Schema Query, Data Analysis
       ├── MCP Server: Playwright → Browser Automation
       ├── MCP Server: Figma → Design File Access
       ├── MCP Server: Filesystem → Extended File Operations
       └── MCP Server: 自定义服务 → ...
```

## 配置 MCP Server

### 配置文件位置
- 全局：`~/.claude/claude_desktop_config.json`
- 项目级：`.claude/mcp.json`

### 配置示例
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" }
    }
  }
}
```

## 常用 MCP Server 推荐

| Server | 能力 | 典型场景 |
|--------|------|----------|
| GitHub | Issues / PRs / Code | 项目管理 |
| PostgreSQL | 数据库查询 | 数据分析 |
| Playwright | 浏览器自动化 | E2E 测试 |
| Figma | 设计文件 | 设计→代码 |
| Filesystem | 文件操作 | 项目管理 |

## 构建自定义 MCP Server

- MCP SDK 快速上手
- 定义 Tools / Resources / Prompts
- 在 Claude Code 中注册与调试
- 安全性考量：最小权限原则
