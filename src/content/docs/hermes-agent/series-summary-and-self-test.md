---
title: 系列总结与自测
description: 串联 Hermes 全系列 17 章能力地图，给出可勾选自测项、能力边界与下一步真实项目建议。
sidebar:
  order: 17
---

*「教程都看完了，真要在一台 VPS 上长期跑 Gateway，却说不出会先检查 allowlist 还是 terminal.backend。」*

本章不重复各章细节，而是帮你**验收是否真会用了**：用一张能力地图对照 17 章，用自测清单暴露缺口，并给出可落地的下一步项目。若你同时学习本站 [Claude Code 漫游指南](/claude-code/)，文末有二者分工说明。

## 系列在解决什么问题

Hermes Agent 的主轴可以收成一句：

> 模型无关的自主 Agent，通过 **closed learning loop**（`skill_manage` + `memory` + 会话检索 + Curator）在长期运行中沉淀 Skill 与记忆，经 CLI/TUI/Gateway/Cron 触达，并用 toolsets 与执行 backend 约束破坏半径。

你若只能记住三个可观察差异：

| 相对普通聊天 | Hermes 多什么 |
| --- | --- |
| 工具循环 | 回复基于命令、文件、网页等真实输出 |
| 跨会话状态 | `MEMORY.md`、`USER.md`、SessionDB + FTS5 |
| 程序性记忆 | `SKILL.md` 与渐进披露，而非每轮重讲流程 |

## 全系列地图（17 章）

### 入门：能跑起来

| 章 | 主题 | 你应该能 |
| --- | --- | --- |
| 1 | [认识 Hermes Agent](./what-is-hermes-agent/) | 说清 Agent Loop 与 closed loop，判断该不该用 Hermes |
| 2 | [安装与环境准备](./installation-setup/) | `hermes doctor`、理解 `~/.hermes/` 布局 |
| 3 | [第一次对话](./first-conversation/) | `hermes model`、@ 引用、多轮对话、`hermes --continue` |

### 核心机制：懂规则

| 章 | 主题 | 你应该能 |
| --- | --- | --- |
| 4 | [记忆、学习与 Skill](./memory-learning-skills/) | frozen snapshot、`/goal`、记忆插件、`skill_manage` |
| 5 | [配置与个性化](./configuration-personalization/) | routing/fallback/凭据池、Profile、`SOUL.md` |
| 6 | [工具系统](./tools-system/) | toolsets、`hermes tools`、审批与 backend |

### 实战：日常干活

| 章 | 主题 | 你应该能 |
| --- | --- | --- |
| 7 | [消息网关](./messaging-gateway/) | Gateway、Dashboard、Cron deliver |
| 8 | [技能系统实战](./skills-in-practice/) | Skill 生命周期、Hub、`hermes curator` |
| 9 | [事件钩子](./event-hooks/) | 三类钩子与 `pre_tool_call` 阻断 |
| 10 | [Kanban 看板](./kanban-multi-agent-board/) | 与 `delegate_task` 取舍、dispatcher |
| 11 | [高级特性](./advanced-features/) | Voice/browser、`delegate_task`、ACP |

### 进阶：边界与延伸

| 章 | 主题 | 你应该能 |
| --- | --- | --- |
| 12 | [安全、性能与最佳实践](./security-performance-best-practices/) | Checkpoints、成本控制、`hermes doctor` |
| 13 | [插件系统](./plugins-system/) | `plugins.enabled`、记忆 provider |
| 14 | [架构拆解](./architecture-deep-dive/) | Agent Loop、API Server、Gateway 数据流 |
| 15 | [从零实现类似 Agent](./build-your-own-agent/) | 九阶段 MVP 与常见陷阱 |
| 16 | [贡献与社区](./contributing-and-community/) | Skill vs Tool、批处理轨迹、Atropos |
| 17 | 本章 | 自测通过、选好下一个真实项目 |

## 能力边界：Hermes 擅长与不擅长

### 较匹配

- **个人或团队长期助理**：偏好、环境、重复流程进 memory/Skill。
- **可脚本化的运维与研发任务**：检查、报告、按 Skill 发版。
- **多入口同一 Agent**：CLI 调试 + Telegram 值班 + Cron 提醒。
- **研究与轨迹导出**：JSONL trajectory、对接训练管线（需额外工程）。

### 不必强上

| 情况 | 更合适的方向 |
| --- | --- |
| 偶尔一问、不需工具 | 网页聊天或 IDE 内助手 |
| 深度改本地 monorepo | [Claude Code](/claude-code/) 等 IDE Agent |
| 严格禁止数据出网 | 先解决合规与自托管模型，再谈 Gateway |
| 期望零配置完美 | Hermes 需 Provider、审批、记忆/Skill 治理 |

### 硬边界（易误解）

1. **frozen snapshot**：本会话改 `MEMORY.md` 不会立刻进 system；下一会话或靠 tool 返回值知新状态。
2. **容器 ≠ 自动 docker**：须显式 `terminal.backend: docker`。
3. **YOLO ≠ 无底线**：hardline blocklist 仍拒绝灾难命令。
4. **Skill 创建**：官方倾向复杂任务 **5+ tool calls** 后 `skill_manage`；勿迷信社区「固定 15 次」。
5. **Gateway 默认 deny**：无 allowlist 时无人能用，不是 bug。
6. **Trajectory ≠ 自动微调**：导出数据后仍需训练栈（如 Atropos 等）。

## 综合自测清单

建议逐项**真做一遍**再勾选。失败项回到对应章节。

### 环境与对话

- [ ] `hermes doctor` 无阻塞项（或你清楚每条 warning 的处置）
- [ ] `hermes --version` 与教程版本锚点（撰写时 v0.14.x 量级）对照过 release note
- [ ] `hermes model` 配置主模型，完成 ≥3 轮带工具对话
- [ ] `hermes --continue` 恢复同一会话标题与上下文

### 记忆与 Skill

- [ ] 用一句话说明 frozen snapshot 与 `memory` 工具的关系
- [ ] 说清 Skill L0 索引与 L1 `skill_view` 的区别
- [ ] 触发或手写一个 Skill，并用 `/reload-skills` 或 slash 调用
- [ ] 知道 Curator 归档 stale Skill 的大致策略（30/90 天）

### 工具与安全

- [ ] 用 `hermes tools` 列出 CLI 平台当前 5 个 toolset
- [ ] 解释 `manual` 审批与 YOLO、hardline 的关系
- [ ] 说清 `local` 与 `docker` backend 下审批差异
- [ ] 若用 Gateway：配置 allowlist 或 pairing，并知 `GATEWAY_ALLOW_ALL` 的风险

### Gateway 与进阶（按需）

- [ ] 完成 Gateway 部署**或**书面说明跳过原因（如无公网 bot）
- [ ] 简述 `AIAgent` 在 CLI 与 `gateway/run.py` 中的位置
- [ ] 知道 `/compress` 与 auxiliary.compression 窗口对齐的重要性
- [ ] 能指出 system prompt 组装中 SOUL 与 AGENTS.md 的分工

### 架构与贡献（选做）

- [ ] 画出入口 → AIAgent → `tools/registry` 简图
- [ ] 判断一项工作应做成 Skill 还是 Tool，理由各一句
- [ ] 知道 Skills Hub 与 `hermes skills tap add` 的差异

## 最小验收实验（约 90 分钟）

若时间紧，用一条链路覆盖主干：

```text
1. hermes doctor && hermes model
2. 新会话：让 Agent 列出项目目录并写入一条 memory
3. hermes --continue：问「我上次让你记住什么」——对照 frozen 行为
4. 完成多步任务，观察是否提议 skill_manage；若有则检查 ~/.hermes/skills/
5. hermes tools：记下 terminal backend；若 Gateway 已开，发 /whoami 与 /status
```

记录：哪一步与预期不符、对应哪一章。

## 下一步真实项目（按成熟度）

| 你已满足 | 建议项目 |
| --- | --- |
| 仅完成入门+核心 | 为当前仓库写 `AGENTS.md` + 一条团队 Skill（发版或 oncall） |
| 完成实战 | 单平台 Gateway + docker backend + 一条 Cron 心跳 |
| 完成进阶 10–11 | 写内部 runbook：审批、压缩阈值、auxiliary 模型表 |
| 完成 12–13 | 组织 tap 发布 3 个 Skill，或贡献 optional skill PR |
| 要训练数据 | 小批量 prompt + `save_trajectories` / batch_runner，检查 JSONL 再入训练栈 |

每个项目应有**书面验收**：例如「Telegram 未授权用户被拒」「Skill 第二次调用步骤与第一次一致」。

## 与 Claude Code 教程如何配合

| 维度 | Hermes 系列 | Claude Code 系列 |
| --- | --- | --- |
| 主战场 | 终端/IM/定时、长期驻留 | IDE 内代码库、PR 循环 |
| 记忆 | MEMORY/USER、Skill 文件 | CLAUDE.md、项目 memory |
| 编排 | Gateway、Cron、delegate | Plan Mode、SubAgents、Hooks |
| 重叠 | 都强调工具循环、上下文、验证 | 都强调工具循环、上下文、验证 |

实用分工：**在 Claude Code 里改仓**；**用 Hermes 跑跨会话助理、IM 与定时**。二者可共用 `AGENTS.md` 风格的项目说明，但运行时不要混用 Profile 与密钥目录。

## 官方资源（持续更新）

- [Hermes 文档](https://hermes-agent.nousresearch.com/docs/)
- [GitHub](https://github.com/NousResearch/hermes-agent)
- [llms.txt](https://hermes-agent.nousresearch.com/docs/llms.txt)（机器可读索引）
- [Discord](https://discord.gg/NousResearch)
- 版本行为以 `hermes --version` 与 release 为准，教程滞后时请信官方

## 苏格拉底式反思

1. 全系列里你**只懂概念却从未执行**的是哪一章？下周补哪一条命令？
2. 若 Agent 写错 `MEMORY.md`，你的发现机制是什么？
3. 你第一个生产 Gateway 的最大风险是授权、backend 还是模型成本？

## 读者自测（本章）

- [ ] 不看目录说出 closed learning loop 的三个组成部分。
- [ ] 从 14 章中任选三章，各写一句「我能用它做什么」。
- [ ] 完成上文「综合自测」中至少 10 项勾选。
- [ ] 选定「下一步真实项目」并写下三条验收标准。
- [ ] 说明 Hermes 与 Claude Code 在你工作流中的分工。

---

全系列正文至此收束。返回 [Hermes Agent 漫游指南](/hermes-agent/) 查阅章节索引，或前往 [Claude Code 漫游指南](/claude-code/) 继续 IDE 侧 Agentic 工程循环。
