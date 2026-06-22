---
title: Claude Code 漫游指南
description: 从基础认知到进阶实践，43 章教程正文与排障速查，系统掌握 Claude Code——高权限、本地上下文感知的 Agentic Coding 工具。
sidebar:
  order: 0
---

[Claude Code](https://code.claude.com/docs/en/overview) 是 Anthropic 面向软件开发的 agentic coding 工具。本指南从心智模型、快速上手、工作原理、项目记忆、高级扩展、Skill 体系、实战方法、反思进阶到进阶实践，共 **43 章教程正文 + 排障速查**，帮助你系统掌握 Claude Code。

**阅读路径：** 第五部分建议 **Skills → Plugins → SubAgents → Agent Teams → MCP**，再进入第六部分 Skill 体系。第四部分五章以 [团队记忆落地](./memory-team-playbook/) 为终点，再进入 Hooks。

**扩展必读（对齐官方能力域）：** [多平台运行环境](./platforms-overview/)、[Agent Teams](./agent-teams/)、[Agent SDK](./agent-sdk/)、[CI/CD 集成](./ci-cd-integrations/)。

**查阅（非跟读）：** [CLI 与配置查阅](./cli-and-settings-reference/)。

## 第一部分：基础认知

1. [Claude Code 究竟是什么？](./what-is-claude-code/)——定位、本质与 Agentic Coding 范式
2. [为什么能 10 倍提升效率？](./core-advantages/)——核心优势与竞品对比

## 第二部分：快速上手

3. [安装与配置](./installation-setup/)——从零到可用的全流程
4. [基于第三方 API](./third-party-api/)——基于第三方 API 使用 Claude Code
5. [第一个会话](./first-session/)——基础命令与交互模式
6. [Slash 命令](./slash-commands/)——常用命令与分类查阅
7. [多平台运行环境全览](./platforms-overview/)——CLI、IDE、Desktop 与 Web 选型

## 第三部分：工作原理

8. [代理循环与工具调用](./agent-loop/)——理解 Agent Loop 内核
9. [Plan Mode](./plan-mode/)——先规划再执行的杀手级功能

## 第四部分：项目记忆

10. [项目记忆总览](./claude-md/)——双机制、分工与路线图
11. [CLAUDE.md 编写与维护](./claude-md-authoring/)——分层、rules、`/init`
12. [自动记忆与 `/memory`](./auto-memory/)——审计与晋升到 CLAUDE.md
13. [Monorepo 与多工具记忆](./memory-monorepo-ecosystem/)——walk、懒加载、AGENTS.md
14. [团队记忆落地](./memory-team-playbook/)——Managed、PR 评审（本部分终点）

## 第五部分：高级扩展

15. [Hooks](./hooks/)——自动化、安全校验与生命周期控制
16. [Skills](./skills/)——可重用提示模板与工作流
17. [Plugins](./plugins/)——marketplace 安装与扩展边界
18. [SubAgents](./subagents/)——上下文隔离与任务拆解
19. [Agent Teams](./agent-teams/)——多会话协作与并行审查
20. [MCP 协议](./mcp/)——连接外部工具与服务

## 第六部分：Skill 体系

21. [编码向社区精选](./skill-recommendations/)——Superpowers、Karpathy、UI UX Pro Max
22. [社区技能目录导读](./skill-catalog/)——按场景发现 Plugin 与 Skill
23. [团队 Skill 实战](./skills-team-playbook/)——从社区包到团队自建

## 第七部分：实战与最佳实践

24. [提示工程秘诀](./prompt-engineering/)——高效沟通方法论
25. [完整实战工作流](./complete-workflow/)——从理解到部署
26. [上下文管理与多代理架构](./context-management/)——窗口满载、handoff 与组合工作流
27. [生态深度集成](./ecosystem-integration/)——组织层集成总览
28. [Agent SDK](./agent-sdk/)——程序化调用与流水线嵌入
29. [CI/CD 与代码审查集成](./ci-cd-integrations/)——GitHub Actions、GitLab 与 PR 审查
30. [远程会话与 Channels](./remote-sessions-channels/)——Remote Control 与事件推送
31. [Chrome 与 Web UI 测试](./chrome-browser-testing/)——浏览器测试与体验增强

## 第八部分：反思与进阶

32. [局限性与应对](./limitations/)——安全、成本与常见坑
33. [AI Agent 时代的开发者](./reflection/)——角色转变与新技能体系

## 第九部分：进阶实践

34. [`/goal` 与跨轮持续目标](./goal-mode/)——可验证终点与跨轮自主续跑
35. [Routines 与定时自动化](./routines-automation/)——`/loop`、定时任务与云端 Routines
36. [调试与错误恢复](./debug-error-recovery/)——失败信号、/rewind 与反馈闭环
37. [Token 成本与会话经济学](./token-economics/)——/context、/usage 与按需加载规则
38. [沙箱隔离机制](./sandboxing/)——文件系统与网络隔离
39. [安全边界与权限心智](./security-permissions/)——allow/deny、权限模式与人类确认
40. [测试驱动与质量保障](./tdd-quality/)——TDD、Hooks/CI 门禁与 diff 审查
41. [团队与组织级落地](./team-organization/)——Managed 治理、PR 透明度与 onboarding
42. [心智模型迁移](./mental-model-migration/)——意图式协作与认知分工

## 第十部分：排障速查

43. [CLI 与配置查阅](./cli-and-settings-reference/)——flags、settings 与 env-vars 速查（查阅章）

44. [常见问题排查](./troubleshooting-faq/)——安装、登录、API、性能与 IDE 集成（排障速查）
