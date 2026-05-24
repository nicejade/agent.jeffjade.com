---
title: Agent SDK 程序化调用
description: 用 TypeScript Agent SDK 把 Claude Code 嵌入 CI、脚本与服务，理解 send/stream、权限与和 `claude -p` 的分工。
sidebar:
  order: 28
---

*「PR 机器人能跑，但我想在自己的 Node 服务里启动同样的代理循环。」*

[CI/CD 集成](/claude-code/ci-cd-integrations/) 里的 GitHub Action 底层即 **Claude Agent SDK**。SDK 把 Claude Code 的代理循环、工具、权限当作**库**调用，适合自定义服务、内部平台与复杂流水线。官方：[Overview](https://code.claude.com/docs/en/agent-sdk/overview)、[Quickstart](https://code.claude.com/docs/en/agent-sdk/quickstart)、[Headless](https://code.claude.com/docs/en/headless)。

> 包名、API 面（`query` / `send` / `stream`）随版本演进。以下示例发布前对照 [TypeScript reference](https://code.claude.com/docs/en/agent-sdk/typescript) 与 quickstart。

---

## 三种调用方式对比

| 方式 | 入口 | 适用 |
|------|------|------|
| 交互 CLI | `claude` | 日常开发 |
| 非交互 CLI | `claude -p "..."` | 简单 CI 脚本 |
| **Agent SDK** | Node / Python 库 | 多轮、流式、嵌应用、细粒度权限 |

`claude -p` 适合一次性 prompt；SDK 适合**循环读事件、分支处理 tool call、嵌 UI**。二者可共存。

---

## TypeScript 最小示例

```bash
mkdir my-agent && cd my-agent
npm init -y
npm install @anthropic-ai/claude-agent-sdk
```

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  for await (const message of query({
    prompt: "List the files in the current directory",
    options: {
      maxTurns: 5,
      allowedTools: ["Read", "Glob", "Grep"],
    },
  })) {
    console.log(message);
  }
}

main().catch(console.error);
```

在仓库根运行，应看到代理循环与工具调用事件。若 import 报错，以官方 quickstart 中的包名为准。

### 流式与多轮

- **流式：** 见 [Streaming output](https://code.claude.com/docs/en/agent-sdk/streaming-output)，边生成边处理。
- **多轮：** 见 [Sessions](https://code.claude.com/docs/en/agent-sdk/sessions) 的 `continue` / `resume` / `fork`。
- **用户审批：** 见 [User input](https://code.claude.com/docs/en/agent-sdk/user-input)，在应用里展示 allow/deny。

---

## 加载 Claude Code 项目能力

SDK 可复用仓库内配置，见 [Claude Code features in the SDK](https://code.claude.com/docs/en/agent-sdk/claude-code-features)：

| 能力 | 说明 |
|------|------|
| CLAUDE.md / rules | 与本地会话一致的项目记忆 |
| Skills | `.claude/skills/` |
| Hooks | 生命周期脚本 |
| Subagents | `.claude/agents/` |
| MCP | 按项目 `.mcp.json` 等 |

这使「本地能跑通的规范」更容易迁到服务端，但仍需在服务端限制密钥与网络。

---

## 权限、成本与预算

| 机制 | 文档 |
|------|------|
| allow/deny | [SDK permissions](https://code.claude.com/docs/en/agent-sdk/permissions) |
| `maxTurns` / `max_budget_usd` | [Agent loop · Turns and budget](https://code.claude.com/docs/en/agent-sdk/agent-loop#turns-and-budget) |
| 成本跟踪 | [Cost tracking](https://code.claude.com/docs/en/agent-sdk/cost-tracking) |

无人值守服务**必须**设 turn 与工具白名单，等同 [CI/CD 章](/claude-code/ci-cd-integrations/) 对 `claude -p` 的要求。

---

## 部署与安全

生产部署见 [Hosting](https://code.claude.com/docs/en/agent-sdk/hosting)、[Secure deployment](https://code.claude.com/docs/en/agent-sdk/secure-deployment)：

- API Key 仅环境变量或密钥管理，不进镜像层。
- 与 [沙箱](/claude-code/sandboxing/) 或容器隔离结合。
- OpenTelemetry 见 [Observability](https://code.claude.com/docs/en/agent-sdk/observability)。

---

## 失败模式

| 现象 | 可能原因 | 下一步 |
|------|----------|--------|
| 工具未执行 | `allowedTools` 过窄 | 对照 tools reference |
| 费用失控 | 无 `maxTurns` | 加预算与并发上限 |
| 与本地行为不一致 | 未加载 CLAUDE.md | 指定 `cwd` 与 settingSources |
| 版本 API 报错 | SDK 升级 | 读 migration guide |

---

## 决策边界

**用 SDK：** 自建 bot、内部开发者平台、要比 `-p` 更细的事件处理。

**用 `claude -p`：** 单次审查、GitLab job 一行脚本。

**用官方 Action：** GitHub 标准 `@claude`，少维护。

---

## 继续读下一章之前

1. SDK 与 `claude -p` 各适合什么流水线？  
2. 为何服务端必须设 `allowedTools`？  
3. Action 与自建 SDK 服务如何分工？

自检：

- [ ] 跑通过 quickstart 级示例  
- [ ] 知道去哪查 TypeScript API  
- [ ] 能说出 SDK 可加载的三种仓库内配置  

---

上一章：[生态深度集成](/claude-code/ecosystem-integration/) · 下一章：[CI/CD 与代码审查集成](/claude-code/ci-cd-integrations/)
