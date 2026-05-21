---
title: Claude Code 漫游指南
description: 从基础认知到进阶实践，33 章系统掌握 Claude Code——高权限、本地上下文感知的 Agentic Coding 工具。
sidebar:
  order: 0
---

[Claude Code](https://code.claude.com/docs/en/overview) 是 Anthropic 面向软件开发的 agentic coding 工具。本指南从心智模型、快速上手、工作原理、项目记忆、高级扩展、Skill 体系、实战方法、反思进阶到进阶实践，共 **33 章**，帮助你系统掌握 Claude Code。

**阅读路径：** [Skills](./skills/) 在第五部分讲机制；[第六部分 · Skill 体系](#第六部分skill-体系) 讲社区包与团队落地，请先读完 Skills 再进入第六部分。第四部分五章以 [团队记忆落地](./memory-team-playbook/) 为终点，再进入 Hooks。

## 第一部分：基础认知

1. [Claude Code 究竟是什么？](./what-is-claude-code/)——定位、本质与 Agentic Coding 范式
2. [为什么能 10 倍提升效率？](./core-advantages/)——核心优势与竞品对比

## 第二部分：快速上手

3. [安装与配置](./installation-setup/)——从零到可用的全流程
4. [基于第三方 API](/claude-code/third-party-api/)——基于第三方 API 使用 Claude Code
5. [第一个会话](./first-session/)——基础命令与交互模式
6. [Slash 命令](./slash-commands/)——常用命令与分类查阅

## 第三部分：工作原理

7. [代理循环与工具调用](./agent-loop/)——理解 Agent Loop 内核
8. [Plan Mode](./plan-mode/)——先规划再执行的杀手级功能

## 第四部分：项目记忆

9. [项目记忆总览](./claude-md/)——双机制、分工与路线图
10. [CLAUDE.md 编写与维护](./claude-md-authoring/)——分层、rules、`/init`
11. [自动记忆与 `/memory`](./auto-memory/)——审计与晋升到 CLAUDE.md
12. [Monorepo 与多工具记忆](./memory-monorepo-ecosystem/)——walk、懒加载、AGENTS.md
13. [团队记忆落地](./memory-team-playbook/)——Managed、PR 评审（本部分终点）

## 第五部分：高级扩展

14. [Hooks](./hooks/)——自动化、安全校验与生命周期控制
15. [Skills](./skills/)——可重用提示模板与工作流（`/claude-code/skills/`）
16. [SubAgents](./subagents/)——上下文隔离与任务拆解
17. [MCP 协议](./mcp/)——连接外部工具与服务

## 第六部分：Skill 体系

18. [编码向社区精选](./skill-recommendations/)——Superpowers、Karpathy、UI UX Pro Max
19. [社区技能目录导读](./skill-catalog/)——按场景发现 Plugin，不维护全量表
20. [团队 Skill 实战](./skills-team-playbook/)——从社区包到团队自建（本部分终点；需先读第五部分 Skills）

## 第七部分：实战与最佳实践

21. [提示工程秘诀](./prompt-engineering/)——高效沟通方法论
22. [完整实战工作流](./complete-workflow/)——从理解到部署
23. [上下文管理与多代理架构](./context-management/)——窗口满载、handoff 与组合工作流
24. [生态集成](./ecosystem-integration/)——IDE、CI/CD 与团队协作

## 第八部分：反思与进阶

25. [局限性与应对](./limitations/)——安全、成本与常见坑
26. [AI Agent 时代的开发者](./reflection/)——角色转变与新技能体系

## 第九部分：进阶实践

27. [调试与错误恢复](./debug-error-recovery/)——失败信号、/rewind 与 CLAUDE.md 反馈闭环
28. [Token 成本与会话经济学](./token-economics/)——/context、/usage 与按需加载规则
29. [安全边界与权限心智](./security-permissions/)——allow/deny、沙箱与人类确认
30. [测试驱动与质量保障](./tdd-quality/)——TDD、Hooks/CI 门禁与 diff 审查
31. [团队与组织级落地](./team-organization/)——Managed 治理、PR 透明度与 onboarding
32. [心智模型迁移](./mental-model-migration/)——意图式协作与认知分工

## 第十部分：排障速查

33. [常见问题排查](./troubleshooting-faq/)——安装、登录、API、性能与 IDE 集成
