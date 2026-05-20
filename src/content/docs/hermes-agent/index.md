---
title: Hermes Agent 漫游指南
description: 从认识 Hermes、安装上手到记忆与 Skill、Gateway 与架构拆解，系统掌握 Nous Research 出品的自改进 AI Agent。
sidebar:
  order: 0
---

[Hermes Agent](https://hermes-agent.nousresearch.com/) 是 [Nous Research](https://nousresearch.com/) 出品的模型无关自主 Agent。它不绑定 IDE，可跑在本地终端、远程 VPS 或消息平台上；核心差异是 **closed learning loop**：在工具调用中沉淀 Skill、维护 `MEMORY.md` / `USER.md`，并由 Curator 整理自创建技能，使 Agent 在长期运行中更可复用。

本指南按「入门 → 核心机制 → 实战 → 进阶」组织。若你刚接触 Hermes，建议从 [认识 Hermes Agent](/hermes-agent/what-is-hermes-agent/) 读起，再完成 [安装与环境准备](/hermes-agent/installation-setup/)。

与本站 [Claude Code 漫游指南](/claude-code-guide/) 的关系：Claude Code 侧重代码库内的 Agentic 工程循环；Hermes 侧重长期驻留、多平台 Gateway 与自编写 Skill。二者可配合使用。

## 第一部分：入门

| # | 主题 | 状态 |
| --- | --- | --- |
| 1 | [认识 Hermes Agent](/hermes-agent/what-is-hermes-agent/) — 定位、学习闭环、工具对比与适用边界 | 已发布 |
| 2 | [安装与环境准备](/hermes-agent/installation-setup/) — 安装、`hermes doctor`、平台差异与故障排查 | 已发布 |
| 3 | [第一次对话](/hermes-agent/first-conversation/) — `hermes model`、CLI/TUI、Slash 命令、`hermes --continue` | 已发布 |

## 第二部分：核心机制

| # | 主题 | 状态 |
| --- | --- | --- |
| 4 | [记忆、学习与 Skill](/hermes-agent/memory-learning-skills/) — `MEMORY.md`、`skill_manage`、Curator、会话检索 | 已发布 |
| 5 | 配置与个性化 — `config.yaml`、`.env`、`SOUL.md`、`AGENTS.md`、Profile | 撰写中 |
| 6 | 工具系统 — Toolsets、沙箱执行环境、审批流、MCP | 撰写中 |

## 第三部分：实战

| # | 主题 | 状态 |
| --- | --- | --- |
| 7 | 消息网关 — `hermes gateway setup`、多平台与 Cron | 撰写中 |
| 8 | 技能系统实战 — `SKILL.md`、Skills Hub、`hermes curator` | 撰写中 |
| 9 | 高级特性 — Voice、浏览器、子 Agent、ACP | 撰写中 |

## 第四部分：进阶

| # | 主题 | 状态 |
| --- | --- | --- |
| 10 | 安全、性能与最佳实践 | 撰写中 |
| 11 | 架构拆解 — Agent Loop、Prompt 组装、工具注册表 | 撰写中 |
| 12 | 从零实现类似 Agent | 撰写中 |
| 13 | 贡献与社区 | 撰写中 |
| 14 | 系列总结与自测 | 撰写中 |

## 官方资源

- [Hermes 文档](https://hermes-agent.nousresearch.com/docs/)
- [GitHub 仓库](https://github.com/NousResearch/hermes-agent)
- [Quickstart](https://hermes-agent.nousresearch.com/docs/getting-started/quickstart)
