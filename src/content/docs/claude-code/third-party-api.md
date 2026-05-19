---
title: 如何基于第三方 API 使用 Claude Code？
description: 通过第三方 API 提供商（OpenRouter、DeepSeek、Gemini 等）接入 Claude Code，突破地区限制、降低成本、灵活选择模型。
sidebar:
  order: 4
---

*"我所在的国家不在 Anthropic 的支持列表里，我就不能用 Claude Code 了吗？"*

这是 Claude Code 用户最常问的问题之一。好消息是：你不需要直接访问 Anthropic API。Claude Code 支持通过第三方 API 提供商接入——无论你用的是 OpenRouter、Google Gemini、还是 DeepSeek，只要一个环境变量就能打通。

本章从原理到实战，讲清楚如何用第三方 API 驱动 Claude Code，以及每种方式的门道和坑。

## 为什么需要第三方 API？

先搞清楚你的需求属于哪种场景：

| 场景 | 典型用户 | 核心诉求 |
|------|---------|---------|
| **地区限制** | 所在国家不在 Anthropic 支持列表 | 只要能访问 Claude 模型就行 |
| **成本控制** | 个人开发者、学生 | OpenRouter 等平台的 Claude 模型可能更便宜 |
| **模型自由** | 想同时使用 Gemini、DeepSeek 等其他模型 | 不被单一厂商绑定 |
| **统一账单** | 已在某个平台有余额/企业账户 | 不想额外管理 Anthropic 账单 |
| **合规要求** | 企业要求 API 流量经过特定网关 | 数据路径可控 |

> **注意**：如果你已经有 Anthropic API Key 且网络能直连，直接用它就好——不引入第三方是最简单也最稳定的方案。本章的价值在于给你 B 计划。

## 工作原理：一个环境变量的魔法

Claude Code 的第三方 API 支持并非 hack，而是内置的正式功能。核心思路是：**通过环境变量告知 Claude Code 使用哪个 API 端点、哪个 API Key**。

两个关键环境变量：

| 环境变量 | 作用 |
|---------|------|
| `ANTHROPIC_API_KEY` | 你的第三方 API 密钥（注意：变量名不因提供商而改变） |
| `ANTHROPIC_BASE_URL` | 第三方 API 的基础 URL 端点 |

当你设置了 `ANTHROPIC_BASE_URL`，Claude Code 的请求就不再发往 `https://api.anthropic.com`，而是发往你指定的地址。**只要目标端点兼容 Anthropic Messages API 格式，就能正常工作。**

```
你的终端
    ↓
Claude Code 发送请求（同 Anthropic API 格式）
    ↓
ANTHROPIC_BASE_URL（你的第三方网关）
    ↓
网关转发到实际模型（Claude / Gemini / DeepSeek 等）
    ↓
响应原路返回，Claude Code 无感知
```

## 方式一：OpenRouter

[OpenRouter](https://openrouter.ai) 是目前最流行的第三方 AI API 网关，支持数十种模型，包括 Claude Opus、Sonnet、Haiku 全系列。

### 配置步骤

**1. 获取 API Key**

注册 [OpenRouter](https://openrouter.ai)，在 [Keys 页面](https://openrouter.ai/keys) 创建一个 API Key。

**2. 编辑设置文件**

在 `~/.claude/settings.json` 中添加：

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://openrouter.ai/api/anthropic",
    "ANTHROPIC_API_KEY": "sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  }
}
```

或者在终端中导出环境变量：

```bash
export ANTHROPIC_BASE_URL="https://openrouter.ai/api/anthropic"
export ANTHROPIC_API_KEY="sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

将上述命令追加到 `~/.zshrc` 或 `~/.bashrc` 可持久化。

**3. 验证**

```bash
claude --version
claude
```

进入会话后，输入一条简单指令验证连通性。

### 模型选择

OpenRouter 上可用的 Claude 模型（截至当前）：

| 模型 ID | 对应模型 | 适用场景 |
|--------|---------|---------|
| `anthropic/claude-opus-4-7` | Claude Opus 4.7 | 最复杂任务、架构设计 |
| `anthropic/claude-sonnet-4-6` | Claude Sonnet 4.6 | 日常开发主力 |
| `anthropic/claude-haiku-4-5-20251001` | Claude Haiku 4.5 | 快速任务、简单修改 |

在 Claude Code 中切换模型：

```bash
claude --model anthropic/claude-sonnet-4-6
```

或者在会话中使用 `/model` 命令。

> OpenRouter 的模型 ID 与 Anthropic 原生 ID 不完全相同。在 Claude Code 中使用 `/model` 查看可用模型列表，或通过 OpenRouter 的 [Models API](https://openrouter.ai/models) 查询。

### OpenRouter 特有功能

- **自动路由**：OpenRouter 会自动选择延迟最低、可用性最高的提供商。
- **用量仪表盘**：在 OpenRouter 控制台查看所有模型的 Token 用量和费用。
- **价格对比**：同一模型在不通提供商之间价格可能不同，OpenRouter 默认选最优价格路由。

## 方式二：直接使用其他模型

Claude Code 可以驱动任何兼容 Anthropic Messages API 的模型。这意味着你不仅能用 Claude 系列——你还可以用 Gemini、DeepSeek、Qwen 等。

### DeepSeek

[DeepSeek](https://api-docs.deepseek.com/quick_start/agent_integrations/claude_code) 是性价比最高的选择之一——它的 API 部分兼容 Anthropic 格式：

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "ANTHROPIC_API_KEY": "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  }
}
```

> 注意：DeepSeek 的 Anthropic 兼容端点可能不支持全部 Messages API 特性（如 tool_use 的流式返回），Claude Code 的一些高级功能可能受限。建议查阅 [DeepSeek 官方文档](https://platform.deepseek.com/api-docs) 确认最新兼容性。

### Google Gemini

通过支持 Anthropic API 格式的代理（如 [gemini-openai-proxy](https://github.com/zhu327/gemini-openai-proxy) 或自建网关），可以让 Claude Code 用上 Gemini：

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://your-gemini-proxy.example.com",
    "ANTHROPIC_API_KEY": "your-google-ai-studio-key"
  }
}
```

> Google 官方未提供 Anthropic 格式兼容端点，需要中间代理层转换格式。大多数社区方案已覆盖了 Messages API 的主要字段。

### 自定义 LiteLLM 代理

[LiteLLM](https://github.com/BerriAI/litellm) 是一个开源的多模型代理，支持 OpenAI、Anthropic、Gemini 等 100+ 模型。你可以自部署一个实例：

```bash
# 启动 LiteLLM 代理
litellm --model claude-sonnet-4-6 --model gemini/gemini-2.5-pro

# 配置 Claude Code 指向它
export ANTHROPIC_BASE_URL="http://localhost:4000/anthropic"
export ANTHROPIC_API_KEY="your-litellm-virtual-key"
```

这种方案的优势：

- **完全控制**：代理在你自己的服务器上，数据不经过第三方。
- **模型池**：一个端点背后可以挂多个模型，Claude Code 中随时切换。
- **统一成本**：所有模型调用走同一个账单。

## 方式三：组织级 SSO 与自定义 OAuth

> 注意：此方式主要面向企业用户，需要 Enterprise 账户或 Console API Key 权限。

如果你的组织使用自定义 OAuth 端点（如 Okta、Azure AD），Claude Code 支持通过 Console API Key 管理 OAuth 集成。详情参考 [Anthropic Console 文档](https://console.anthropic.com/docs/oauth)。对于第三方 API 场景，通常使用环境变量方式即可，无需配置 SSO。

## 配置管理的最佳实践

### 1. 按项目配置，而非全局

不同项目可能需要不同的 API 提供商。在项目根目录的 `.claude/settings.json` 中配置会覆盖全局设置：

```json
// 项目 .claude/settings.json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://openrouter.ai/api/anthropic",
    "ANTHROPIC_API_KEY": "sk-or-v1-project-specific-key"
  }
}
```

优先级：**项目 settings.json > 全局 settings.json > shell 环境变量 > 默认值**。

### 2. 不要将 API Key 写进 Git

如果你在项目的 `.claude/settings.json` 中配置了 API Key，务必将其加入 `.gitignore`：

```bash
echo ".claude/settings.json" >> .gitignore
```

更安全的做法是使用环境变量引用 shell 变量，而不是硬编码：

```bash
# ~/.zshrc
export MY_OPENROUTER_KEY="sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 然后在 Claude Code 启动前做一次 export
export ANTHROPIC_API_KEY=$MY_OPENROUTER_KEY
```

### 3. 快速切换方案

如果你需要在多个 API 提供商之间切换，用 shell alias 是最快的方式：

```bash
# ~/.zshrc
alias cc-native='ANTHROPIC_BASE_URL="" ANTHROPIC_API_KEY="sk-ant-xxx" claude'
alias cc-openrouter='ANTHROPIC_BASE_URL="https://openrouter.ai/api/anthropic" ANTHROPIC_API_KEY="sk-or-v1-xxx" claude'
alias cc-deepseek='ANTHROPIC_BASE_URL="https://api.deepseek.com/anthropic" ANTHROPIC_API_KEY="sk-xxx" claude'
```

## 推荐添加的配置

针对你这个使用第三方代理的场景，建议补充以下配置（更多配置参见 [Claude Code 环境变量文档](https://code.claude.com/docs/en/env-vars)）：

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-your-deepseek-api-key",
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
	"ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-v4-flash",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-v4-pro",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-v4-pro[1m]"

    "API_TIMEOUT_MS": "3000000",
    "DISABLE_TELEMETRY": "1",
    "DISABLE_ERROR_REPORTING": "1"

    "CLAUDE_CODE_ATTRIBUTION_HEADER": "0",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1",
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "120000",

    "DISABLE_PROMPT_CACHING": "0",
    "ENABLE_PROMPT_CACHING_1H": "1",

    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "32000",
    "MAX_THINKING_TOKENS": "10000",

    "DISABLE_AUTO_COMPACT": "0",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "80",

    "CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING": "0",
    "CLAUDE_CODE_EFFORT_LEVEL": "auto",

    "BASH_DEFAULT_TIMEOUT_MS": "300000",
    "BASH_MAX_TIMEOUT_MS": "1800000",
    "BASH_MAX_OUTPUT_LENGTH": "50000",

    "CLAUDE_CODE_MAX_RETRIES": "5",
    "CLAUDE_CODE_MAX_TOOL_USE_CONCURRENCY": "5"
  },
  "model": "opus",
  "skipDangerousModePermissionPrompt": true
}
```

### 📋 各参数说明

#### 缓存相关（对代理场景最重要）

| 参数 | 建议值 | 说明 |
|---|---|---|
| `CLAUDE_CODE_ATTRIBUTION_HEADER` | `0` | 设置为启用后，系统提示符开头将省略归属信息块（客户端版本和提示符指纹）。禁用此功能可提高通过 [LLM 网关](https://code.claude.com/docs/en/llm-gateway) 路由时的提示符缓存命中率。Anthropic API 缓存不受影响。|
| `DISABLE_PROMPT_CACHING` | `0` | 确保缓存开启，你已经关掉了 attribution header，缓存应该能正常命中 |
| `ENABLE_PROMPT_CACHING_1H` | `1` | 请求 1 小时 TTL 缓存（默认只有 5 分钟），长任务节省大量 token |

#### 输出与思考 token

| 参数 | 建议值 | 说明 |
|---|---|---|
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | `32000` | 防止代理截断过长的输出，按需调整 |
| `MAX_THINKING_TOKENS` | `10000` | 使用 Haiku 模型时建议控制思考 token，避免浪费 |

#### 压缩策略

| 参数 | 建议值 | 说明 |
|---|---|---|
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | `80` | 上下文用到 80% 时触发压缩（默认较高），提前压缩避免超限报错 |

#### 稳定性相关

| 参数 | 建议值 | 说明 |
|---|---|---|
| `CLAUDE_CODE_MAX_RETRIES` | `5` | 代理偶发不稳定时的重试次数，默认 10 可以适当降低 |
| `CLAUDE_CODE_MAX_TOOL_USE_CONCURRENCY` | `5` | 默认 10 并发，代理有并发限制时应降低 |
| `BASH_DEFAULT_TIMEOUT_MS` | `300000` | bash 命令默认超时 5 分钟（原来 2 分钟），长编译任务不会中断 |

#### 隐私与流量

| 参数 | 建议值 | 说明 |
|---|---|---|
| `DISABLE_TELEMETRY` | `1` | 设置为 `1` “关闭”可选择退出遥测。遥测事件不包含用户数据，例如代码、文件路径或 Bash 命令。同时，此功能还会禁用功能标志，因此某些仍在逐步推出的功能可能无法使用。 |
| `DISABLE_ERROR_REPORTING` | `1` | 你已禁用遥测，顺便禁掉 Sentry 错误上报，避免本地信息外泄 |

#### 持久自动化

| 参数 | 建议值 | 说明 |
|---|---|---|
| `skipDangerousModePermissionPrompt` | `true` | 它会彻底跳过每次进入 bypassPermissions（危险/全权模式） 时的“Are you sure?” 二次确认弹窗，让 Claude Code 能够真正零中断地自动运行所有操作（读写文件、执行命令、改代码等）。最大好处是解锁“无人值守”的极致自动化工作流，尤其适合你已经在容器、VM 或完全信任的环境中重度使用时，效率大幅提升。**风险提醒**：仅在你明确知道自己在做什么且环境安全时开启，否则风险较高。 |

---

### ⚠️ 注意事项

**`CLAUDE_CODE_AUTO_COMPACT_WINDOW`** 你设置的是 `120000`（约 12 万 token），如果你的代理模型实际 context window 比这小，建议改成和模型实际窗口匹配的值，否则压缩触发时机会算错。

**`model: "haiku"`** 使用 Haiku 时，adaptive thinking 和 effort level 对它效果有限，如果代理后端映射的模型不支持思考，建议加上 `CLAUDE_CODE_DISABLE_THINKING: "1"` 避免报错。

## 常见问题与排错

### Q: 设置后 Claude Code 仍然无法连接

**诊断三步法：**

```bash
# 1. 确认环境变量生效
echo $ANTHROPIC_BASE_URL
echo $ANTHROPIC_API_KEY

# 2. 运行 claude doctor 查看诊断信息
claude doctor

# 3. 用 curl 测试端点可达性
curl -X POST "$ANTHROPIC_BASE_URL/v1/messages" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet-4-6","max_tokens":100,"messages":[{"role":"user","content":"hi"}]}'
```

### Q: 第三方 API 的功能支持不完整

Claude Code 依赖以下 Anthropic Messages API 特性，请确认你的第三方端点支持：

| 特性 | 影响范围 | 缺失后果 |
|------|---------|---------|
| **Streaming** | 所有交互 | 无法流式输出，响应延迟显著增加 |
| **Tool Use** | Agent 循环 | Agent 无法使用工具（读写文件、执行命令），Claude Code 降级为聊天 |
| **Extended Thinking** | 复杂推理 | Opus 的长思考能力不可用，复杂任务质量下降 |
| **Cache Control** | 成本与速度 | 每次对话重新发送完整上下文，不可用提示缓存 |
| **Image Input** | 截图交互 | 无法粘贴截图给 Claude Code |
| **Computer Use** | 屏幕感知 | 不影响 CLI 模式（CLI 不使用此特性） |

> 其中 **Tool Use** 和 **Streaming** 是最关键的——缺一不可。如果第三方端点不支持这两个，Claude Code 无法正常工作。

### Q: OpenRouter 上的 Claude 和 Anthropic 原生的有什么区别？

**模型本身相同**——OpenRouter 调用的是 Anthropic 提供的实际 Claude 模型。区别在于：

- **网络路径**：多了一层代理，延迟可能略高（通常 <100ms）
- **可用性**：OpenRouter 有多个提供商做冗余，理论上可用性更高
- **计费**：OpenRouter 的定价可能与 Anthropic 官方有微小差异
- **功能覆盖**：OpenRouter 覆盖了 Messages API 的核心特性，但某些边缘功能（如特定扩展字段）可能缺失

### Q: 能用 ChatGPT / GPT-4 吗？

技术上可以，如果你有将 Anthropic Messages API 格式转换为 OpenAI Chat Completions 格式的中间层（如 LiteLLM）。但需要注意：

- GPT-4 的 system prompt 行为和 Claude 不同，Claude Code 的指令格式针对 Claude 优化。
- GPT-4 的 tool_use 机制与 Claude 的工具调用不同，Agent 循环可能不稳定。
- **这不是官方支持的用法**，遇到问题需要自己排查。

## 选择指南

没有银弹，只有适合你的方案：

```
你是否有合法的 Anthropic API 访问权限？
├── 是 → 直接使用 Anthropic 原生 API（最简单最稳定）
│   └── 想省钱或同时用其他模型 → OpenRouter
└── 否 → 使用第三方 API
    ├── 想要稳定的 Claude 体验 → OpenRouter
    ├── 预算极其有限 → DeepSeek（确认兼容性后再决策）
    ├── 想要 Gemini → 自建代理（LiteLLM 或 openai-gemini-proxy）
    └── 企业环境有网关 → 配置 ANTHROPIC_BASE_URL 指向企业网关
```

> 如果你的优先级是稳定和完整功能，**OpenRouter + Claude 原生模型** 是第三方方案中最接近原生体验的选择。如果你想省到极致、愿意接受部分功能折损，DeepSeek 值得尝试。

## 苏格拉底式反思

在配置第三方 API 之前，问自己三个问题：

1. **为什么不用原生 API？** 如果答案是"地区限制"，第三方是必然选择。如果是"便宜一点"，算一下你一个月实际花多少 Token——很可能省的钱对不上你花在配置和排错上的时间。

2. **你对第三方提供商的信任程度？** API 密钥给了第三方网关，意味着你的代码会被第三方中转。如果代码包含敏感业务逻辑，确保你理解数据的流转路径。

3. **如果明天这个第三方挂了，你有备选方案吗？** 建议至少配置两个可用方案——比如 OpenRouter + DeepSeek 双通道，五秒切换。

---

下一章：[启动你的第一个会话](/claude-code/first-session/)，把本章配置好的环境用起来——我们开始真正和 Claude Code 对话。
