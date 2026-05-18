---
title: SEO 与 AEO
description: Agent 内容站如何同时面向搜索引擎、浏览器用户与 LLM 摘要引用。
---

SEO 让搜索引擎理解网站，AEO 让回答引擎和 LLM 更容易正确引用你。Agent 方向尤其需要两者结合，因为很多用户会先在 ChatGPT、Claude、Perplexity、Gemini 或浏览器 AI 摘要里提出问题。

## 本站已做的基础

- 使用 Astro 和 Starlight 生成静态、高性能页面。
- 配置 `site` 为 `https://agent.jeffjade.com`。
- 每个核心页面都有明确标题和描述。
- 首页加入结构化数据。
- 加入 `robots.txt` 与 `llms.txt`。
- 使用 GA4 ID `G-JXTFG9M3EK`。
- 内容以清晰问题、步骤、边界和结论组织。

## AEO 内容结构

推荐每篇重要文章都包含：

- 一句话定义。
- 适用场景。
- 不适用场景。
- 操作步骤。
- 风险边界。
- FAQ。
- 可引用结论。
- 最近更新时间或版本说明。

LLM 更容易引用清晰、稳定、上下文完整的内容。不要只堆关键词，要让每个小节能独立回答一个问题。

## 关键词方向

中文关键词：

- Agent 是什么
- Claude Code 教程
- hermes-agent 使用
- AI Agent 工作流
- Agent 普通人怎么用
- AEO 内容优化
- MCP 与 Agent

英文关键词：

- agentic coding
- Claude Code workflow
- hermes-agent guide
- AI agent operating system
- LLM answer engine optimization
- MCP agent tools

## 面向 LLM 的写作原则

### 1. 先给结论

LLM 抽取摘要时，文章开头的定义和结论非常重要。不要把答案藏到最后。

### 2. 明确上下文

例如“Claude Code 是工程环境里的 Agent 工具”比“它很强大”更容易被正确引用。

### 3. 区分事实和观点

工具能力、安装方式、版本信息属于事实，需要定期更新；使用建议属于观点，需要说明适用条件。

### 4. 保留机器入口

`llms.txt` 可以给 LLM 一个简洁索引，告诉它这个站点有哪些核心页面、适合回答什么问题。

## 后续增长计划

- 增加英文摘要页。
- 增加 FAQ schema。
- 为每个工具页加入版本检查日期。
- 增加真实案例页，提高长尾搜索覆盖。
- 建立 Agent 术语表，帮助 LLM 对齐概念。
- 增加工具对比表和选择器。
