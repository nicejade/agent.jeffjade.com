---
title: MCP：为 Claude Code 接入外部工具与服务
description: 通过 Model Context Protocol 将 GitHub、数据库、Sentry 等外部工具接入 Claude Code，让模型直接查询、操作外部系统而不依赖粘贴数据。
sidebar:
  order: 12
---

*「每次查 JIRA 需求都要把标题和描述复制进对话；GitHub PR 的 diff 要先在浏览器看完再人工概括给 Claude。」*

提示词和 [CLAUDE.md](/claude-code/claude-md/) 解决「告诉模型什么」， [Skills](/claude-code/skills/) 解决「可复用的流程模板」，[Hooks](/claude-code/hooks/) 解决「到点必跑的脚本」。但还有一类问题它们都解决不了：**模型需要直接访问外部系统的实时数据**，而你成了人肉 API——从 JIRA 粘贴需求、从 Sentry 复制报错、从数据库导出 CSV 再贴进对话。

MCP（Model Context Protocol）让 Claude Code **直接连接**外部工具与数据源。你不再搬运数据，模型自己查询、自己操作。官方说明见 [Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp)，协议规范见 [modelcontextprotocol.io](https://modelcontextprotocol.io)。

本章目标：理解 MCP 的架构与三种接入方式，能添加第一个 MCP Server 并验证连通性，知道什么场景该用 MCP、什么场景不该引入。

---

## MCP 解决什么问题

| 手段 | 数据来源 | 模型能主动查询 | 实时性 | 配置成本 |
|------|----------|---------------|--------|----------|
| 粘贴到对话 | 你手动复制 | 否 | 取决于你何时粘贴 | 无 |
| CLAUDE.md 写死 | 你预先编撰 | 否 | 静态 | 低 |
| `!` 命令注入 | 命令输出 | 否（一次性） | 调用时快照 | 低 |
| **MCP** | **外部系统直接提供** | **是** | **按需查询** | **中** |
| [渠道（Channels）](https://code.claude.com/docs/en/channels) | 外部事件推送 | 是，被动接收 | 事件驱动 | 中 |

MCP 的核心差异：**模型可以自行决定何时、以什么参数去查询外部系统**，而不是被动接受你提供的数据。这让 Claude Code 从「听你描述外部世界」变成「自己去看外部世界」。

MCP 本身是一个开放标准协议，不限于 Claude Code。任何 AI 应用都可以实现 MCP Host 角色，连接任意的 MCP Server。这种标准化避免了每个 AI 工具与每个外部系统各自实现一对一集成的 `M × N` 问题——类比 USB 协议为各种外设提供统一接口，MCP 为各种数据源和工具提供统一的 AI 接入规范。

---

## 核心概念：客户端-服务器架构

MCP 遵循客户端-服务器模型，三个角色：

```
MCP Host（Claude Code）
    ├── MCP Client 1 ──── MCP Server A（本地 stdio）
    ├── MCP Client 2 ──── MCP Server B（远程 HTTP）
    └── MCP Client 3 ──── MCP Server C（远程 HTTP）
```

- **MCP Host**：AI 应用本身，即 Claude Code。负责管理多个 MCP Client 实例。
- **MCP Client**：与一个 MCP Server 维持一对一连接，将服务器提供的工具、资源、提示注册到 Host。
- **MCP Server**：运行在本机或远程的程序，通过 JSON-RPC 2.0 协议暴露能力。

MCP Server 可以暴露三种**原语（Primitive）**：

| 原语 | 作用 | 在 Claude Code 中的表现 |
|------|------|------------------------|
| **Tools** | 可执行函数 | 模型看到新的可用工具，命名格式 `mcp__serverName__toolName` |
| **Resources** | 结构化数据源 | 通过 `@server:path` 引用，自动注入对话上下文 |
| **Prompts** | 可复用的提示模板 | 出现在 `/` 菜单，格式 `/mcp__serverName__promptName` |

连接建立时，Claude Code 与服务器完成能力协商（`initialize`），随后通过 `tools/list` 发现可用工具。之后模型在对话中自行决定调用哪个工具、传什么参数，结果返回给模型作为后续推理的上下文。

---

## 传输方式：你的 MCP Server 跑在哪里

| 传输 | 何时用 | 优点 | 限制 |
|------|--------|------|------|
| **stdio**（标准输入输出） | 本地进程，如 `npx` 启动的包 | 零网络开销、直连本机 | 仅本机可用、需管理进程生命周期 |
| **HTTP**（Streamable HTTP） | 远程服务 | 推荐用于云服务、支持 OAuth | 依赖网络、首次配置稍多 |
| **SSE**（Server-Sent Events） | 旧式远程服务 | 向后兼容 | **已废弃**，尽量改用 HTTP |

**动手：** 在终端执行 `claude mcp list`，确认当前尚无服务器（或看到已有列表）。再执行 `claude mcp help` 确认可用子命令。

---

## 最小路径：添加第一个 MCP Server

以连接 GitHub 为例，让你能直接在对话中查询 PR、Issue、仓库信息。

**1. 生成 GitHub Personal Access Token：**

打开 [GitHub Token 设置](https://github.com/settings/personal-access-tokens)，创建一个 Fine-grained token，授权你希望 Claude 访问的仓库。记录 token。

**2. 添加远程 HTTP Server：**

```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/ \
  --header "Authorization: Bearer YOUR_GITHUB_PAT"
```

**3. 验证：** 在 Claude Code 中输入 `/mcp`，确认 `github` 服务器状态为已连接且工具数量大于 0。

**4. 试用：**

```text
Review PR #456 in our repo and suggest improvements
```

```text
Show me all open PRs assigned to me
```

模型会调用 `mcp__github__*` 系列工具去 GitHub 读取数据，而不是等你粘贴。

如果想先测试不直接联网，可以用 `claude mcp add --transport stdio` 加一个本地 npm 包实验，成功后再配远程服务。

---

## 三种作用域：你的配置放在哪

添加 MCP Server 时，`--scope` 决定配置写在哪里、谁能看到：

| 作用域 | CLI 标志 | 存储位置 | 加载范围 | 是否提交 Git |
|--------|----------|----------|----------|-------------|
| **local** | 默认 | `~/.claude.json`，按项目路径隔离 | 仅当前项目，仅你本人 | 否 |
| **project** | `--scope project` | 项目根 `.mcp.json` | 当前项目，全员共享 | 是 |
| **user** | `--scope user` | `~/.claude.json` | 本机所有项目，仅你本人 | 否 |

### local 作用域（默认）

未指定 scope 时默认为 local：仅当前项目可用，私密。适合带个人 API key 的开发服务器。

```bash
claude mcp add --transport http stripe https://mcp.stripe.com
```

配置写入 `~/.claude.json` 中对应项目路径的条目。

### project 作用域（团队共享）

写入项目根目录的 `.mcp.json`，可提交 Git。适合团队共用的服务如 Sentry、公司的内部 API。

```bash
claude mcp add --transport http sentry --scope project https://mcp.sentry.dev/mcp
```

生成的 `.mcp.json` 格式：

```json
{
  "mcpServers": {
    "sentry": {
      "type": "http",
      "url": "https://mcp.sentry.dev/mcp"
    }
  }
}
```

**安全机制**：Claude Code 在首次加载团队的 `.mcp.json` 时会弹出批准提示，需用户确认后才连接，防止恶意仓库通过 MCP 获取权限。

### 环境变量展开

`.mcp.json` 支持 `${VAR}` 和 `${VAR:-default}` 语法，让团队共享配置而密钥各自维护：

```json
{
  "mcpServers": {
    "api-server": {
      "type": "http",
      "url": "${API_BASE_URL:-https://api.example.com}/mcp",
      "headers": {
        "Authorization": "Bearer ${API_KEY}"
      }
    }
  }
}
```

### 作用域优先级

同一名称的服务器在多个作用域定义时，Claude Code 只连接优先级最高的一个：

**local > project > user > 插件提供 > claude.ai 连接器**

这让你可以用 local 作用域覆盖团队的 project 配置，例如替换自己的 API key。

---

## 三种添加方式：命令行、JSON、Desktop 导入

### 方式一：`claude mcp add`（命令行）

最常用的方式。关键规则：**所有选项（`--transport`、`--scope`、`--env`）必须放在服务器名之前，`--` 分隔服务器名和启动命令**。

```bash
# stdio 本地进程
claude mcp add --transport stdio --env AIRTABLE_API_KEY=YOUR_KEY airtable \
  -- npx -y airtable-mcp-server

# HTTP 远程服务
claude mcp add --transport http notion https://mcp.notion.com/mcp
```

### 方式二：`claude mcp add-json`（JSON 配置）

适合从文档或第三方获取到的现成 JSON 配置：

```bash
# HTTP 服务器
claude mcp add-json weather-api \
  '{"type":"http","url":"https://api.weather.com/mcp","headers":{"Authorization":"Bearer token"}}'

# stdio 服务器
claude mcp add-json local-tool \
  '{"type":"stdio","command":"/path/to/server","args":["--config","prod.json"]}'
```

### 方式三：从 Claude Desktop 导入

如果之前在 Claude Desktop 中配过 MCP，可以一键导入：

```bash
claude mcp add-from-claude-desktop
```

仅限 macOS 和 WSL。导入后会出现交互式选择菜单。

### 常用管理命令

```bash
claude mcp list          # 列出所有服务器及状态
claude mcp get github    # 查看某个服务器的详细配置
claude mcp remove github # 移除服务器
/mcp                     # 在 Claude Code 会话中查看状态、认证
```

---

## 实战场景

### 查询 PostgreSQL 数据库

```bash
claude mcp add --transport stdio db \
  -- npx -y @bytebase/dbhub \
  --dsn "postgresql://readonly:pass@prod.db.com:5432/analytics"
```

然后直接问：

```text
本月总收入是多少？
orders 表的 schema 是什么样的？
找出 90 天内未购买的用户。
```

**安全提示**：生产数据库应使用只读账户，避免模型执行写操作。可在 [权限](https://code.claude.com/docs/en/permissions) 中对特定 MCP 工具设置 `allow` / `deny`。

### 捕获生产错误（Sentry）

```bash
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
```

在 Claude Code 中执行 `/mcp` 完成 OAuth 认证，然后：

```text
过去 24 小时最常见的错误是什么？
显示错误 abc123 的堆栈跟踪。
哪次部署引入了这些新错误？
```

### 自动化浏览器测试（Playwright）

```bash
claude mcp add --transport stdio playwright -- npx -y @playwright/mcp@latest
```

```text
测试 test@example.com 的登录流程
在移动端截取结算页的屏幕截图
```

---

## 认证：OAuth 与自定义鉴权

### OAuth 2.0 认证

远程 MCP Server 返回 401/403 时，Claude Code 自动将该服务器标记为需认证。在 `/mcp` 面板中完成浏览器登录即可。Token 安全存储并在过期前自动刷新。

### 预配置的 OAuth 凭证

部分服务器不支持自动注册，需先在服务方开发者门户创建 OAuth App，然后：

```bash
claude mcp add --transport http \
  --client-id your-client-id --client-secret --callback-port 8080 \
  my-server https://mcp.example.com/mcp
```

`--client-secret` 会在终端中以掩码输入。`--callback-port` 固定回调端口，需与服务方注册的 redirect URI 一致。

### 自定义鉴权头

非 OAuth 方案（如内部 SSO、短时效 token）可用 `headersHelper` 动态生成请求头：

```json
{
  "mcpServers": {
    "internal-api": {
      "type": "http",
      "url": "https://mcp.internal.example.com",
      "headersHelper": "/opt/bin/get-mcp-auth-headers.sh"
    }
  }
}
```

脚本向 stdout 输出一个 JSON 对象，Claude Code 在每次建立连接时执行。有 10 秒超时，无缓存。

---

## MCP 资源引用

MCP Server 可以暴露 Resources（结构化数据源），通过 `@` 菜单引用：

```text
分析 @github:issue://123 并提出修复建议
对比 @postgres:schema://users 和 @docs:file://database/user-model
```

输入 `@` 后，自动补全菜单中会列出所有已连接服务器提供的资源路径。资源内容以附件形式注入对话。

---

## MCP Prompt 即命令

MCP Server 暴露的 Prompts 会出现在 `/` 命令菜单中：

```text
/mcp__github__list_prs
/mcp__github__pr_review 456
/mcp__jira__create_issue "Bug in login flow" high
```

格式为 `/mcp__服务器名__模板名`，空格和特殊字符规范化为下划线。参数按空格分隔传入。

---

## 工具搜索：控制上下文占用

较早的 Claude Code 会在会话启动时加载**所有** MCP 工具定义，每多一个服务器就多占一截上下文。Tool Search（工具搜索）改变了这一点：启动时只记录工具名和描述摘要，模型需要时才实时检索完整定义。

Tool Search 默认启用，要求模型为 Sonnet 4+ 或 Opus 4+。可通过环境变量控制：

| `ENABLE_TOOL_SEARCH` | 行为 |
|----------------------|------|
| 不设 | 默认启用，MCP 工具延迟加载 |
| `true` | 强制延迟加载全部 MCP 工具 |
| `auto` | 阈值模式：工具定义在上下文窗口 10% 以内时直接加载，超出则延迟 |
| `auto:N` | 自定义阈值百分比，如 `auto:5` |
| `false` | 关闭，所有工具定义在启动时全部加载 |

```bash
ENABLE_TOOL_SEARCH=auto:5 claude
```

如果某个服务器的工具需要在每轮对话中都可见（不需额外搜索步骤），在配置中设 `alwaysLoad: true`：

```json
{
  "mcpServers": {
    "core-tools": {
      "type": "http",
      "url": "https://mcp.example.com/mcp",
      "alwaysLoad": true
    }
  }
}
```

这会让该服务器在会话启动时阻塞连接（最多 5 秒），确保首条提示构建时工具已就绪。

---

## 把 Claude Code 本身作为 MCP Server

Claude Code 可以对外作为 MCP Server 运行，让其他 AI 应用调用 Claude Code 的工具：

```bash
claude mcp serve
```

在 Claude Desktop 中添加：

```json
{
  "mcpServers": {
    "claude-code": {
      "type": "stdio",
      "command": "claude",
      "args": ["mcp", "serve"]
    }
  }
}
```

这会暴露 Claude Code 的 Read、Edit、Bash 等工具给外部 MCP Client。注意：工具调用的确认逻辑由 Client 方负责实现，Server 端不做用户确认。

---

## 企业管控

### 独占控制：`managed-mcp.json`

系统管理员将 `managed-mcp.json` 部署到系统级目录（macOS 为 `/Library/Application Support/ClaudeCode/`，Linux 为 `/etc/claude-code/`），用户无法自行添加或修改 MCP Server。

格式与 `.mcp.json` 相同：

```json
{
  "mcpServers": {
    "github": { "type": "http", "url": "https://api.githubcopilot.com/mcp/" },
    "sentry": { "type": "http", "url": "https://mcp.sentry.dev/mcp" },
    "internal": {
      "type": "stdio",
      "command": "/usr/local/bin/company-mcp-server",
      "args": ["--config", "/etc/company/mcp-config.json"]
    }
  }
}
```

### 策略控制：allowlist / denylist

在 [managed settings](https://code.claude.com/docs/en/settings) 中配置 `allowedMcpServers` 和 `deniedMcpServers`，允许用户自行添加但限制范围和端点：

```json
{
  "allowedMcpServers": [
    { "serverName": "github" },
    { "serverUrl": "https://mcp.company.com/*" },
    { "serverCommand": ["npx", "-y", "@modelcontextprotocol/server-filesystem"] }
  ],
  "deniedMcpServers": [
    { "serverUrl": "https://*.untrusted.com/*" }
  ]
}
```

三种匹配方式：按名称、按 URL 模式（支持 `*` 通配符）、按精确命令。denylist 优先级高于 allowlist。

---

## 安全边界

MCP Server 有权执行命令、访问文件、发起网络请求。需要保持警惕：

1. **只连接你信任的服务器**。远程服务器返回的内容会注入模型上下文，存在 [提示注入](https://code.claude.com/docs/en/security#protect-against-prompt-injection) 风险。
2. **项目作用域的 `.mcp.json` 需用户批准后才连接**，但首次弹窗时务必仔细查看。
3. **数据库连接用只读凭据**，或通过 [权限配置](https://code.claude.com/docs/en/permissions) 对特定 MCP 工具设 `deny`。
4. **不要在 `.mcp.json` 中硬编码密钥**，使用 `${ENV_VAR}` 展开。
5. **命名规范**：MCP 工具在模型侧以 `mcp__serverName__toolName` 格式暴露，注意服务器名可能泄露给模型。

---

## 失败模式与调试

| 症状 | 可能原因 | 下一步 |
|------|----------|--------|
| 服务器状态为 failed | 连接超时、命令不存在、网络不可达 | `claude mcp get <name>` 查看配置；手动执行启动命令验证 |
| 工具数为 0 | 服务器未声明 tools 能力、配置了 `alwaysLoad` 但连接失败 | 检查服务器实现；`/mcp` 面板会标记此类异常 |
| `/mcp` 中看不到服务器 | scope 错误、未在对应目录启动 | `claude mcp list` 确认所有作用域的服务器 |
| 认证失败（401） | token 过期或无效 | `/mcp` 面板重新认证 |
| 工具调用报错 | 参数不符合 `inputSchema` | 让模型先获取准确 schema 再调用 |
| 上下文窗口暴涨 | 服务器过多或工具描述过长 | 启用 Tool Search（默认开启）；关闭不需要的服务器 |
| MCP 输出截断 | 超出 `MAX_MCP_OUTPUT_TOKENS`（默认 25000） | `export MAX_MCP_OUTPUT_TOKENS=50000` |
| `.mcp.json` 不生效 | JSON 语法错误、环境变量未设置且无默认值 | `claude mcp get <name>` 检查解析结果 |
| 连接速度慢 | 启动超时默认 30 秒 | 设 `MCP_TIMEOUT=10000` 缩短 |
| stdout 被污染 | stdio 服务器向 stdout 写了日志而非 `console.error` | 检查服务器代码，日志只用 stderr |

调试入口：`/mcp` 面板、`claude mcp list`、`claude mcp get <name>`、启动时加 `--debug`。

---

## 决策边界：该用 MCP 吗

**适合用 MCP：**

- 你每次对话都要从同一个外部系统（JIRA、GitHub、数据库、日志平台）复制数据。
- 模型需要根据对话上下文**自主决定**查什么、什么时候查。
- 你需要团队共享一套标准化工具接入方案。
- 外部系统提供的数据是**结构化的**（API 返回 JSON、SQL 结果集），模型可直接消耗。

**不适合用 MCP：**

- 一次性查询——复制粘贴一次更快。
- 数据完全可以通过 `!` 命令注入满足——例如每次启动看一眼 git status。
- 你需要的结果来自需要人工判断的网页内容——MCP 工具适合结构化 API，不适合爬取。
- 服务器需要长时间运行且你不想管理进程——这时考虑远程 HTTP 服务器或 claude.ai 连接器。

**与 Skills 的分工：**

- **Skills**：告诉模型**怎么做**某类任务的一套流程（如 `/deploy`）。
- **MCP**：给模型**访问外部系统的能力**（如 GitHub API、数据库查询工具）。
- 两者可以组合：Skill 正文里写「用 `mcp__github__*` 工具去查 PR 状态」。

**与 Hooks 的分工：**

- **Hooks**：在 Claude Code 生命周期节点执行你的脚本（格式化、拦截、通知）。
- **MCP**：让模型能调用**外部系统的工具**。
- MCP 工具本身可以是 Hook handler 的一种类型（`type: "mcp_tool"`）。

---

## 继续读下一章之前

试着回答：

1. MCP Server 的三种原语（Tool、Resource、Prompt）分别在 Claude Code 中如何体现？
2. local、project、user 三个作用域的优先级顺序是什么？为什么这样设计？
3. 什么情况下应该用 `alwaysLoad: true`？会带来什么代价？
4. 团队提交 `.mcp.json` 后，为什么不会自动生效？安全机制是什么？

自检清单：

- [ ] 用 `claude mcp add` 添加过一个 MCP Server 并成功看到工具列表
- [ ] 执行过 `/mcp` 查看服务器状态
- [ ] 理解 `--scope` 三个选项的区别与适用场景
- [ ] 能说出 MCP 与 Skills、Hooks 各解决什么问题
- [ ] 知道生产数据库连接应该用什么权限策略

---

下一章：[编码向社区精选](/claude-code/skill-recommendations/)——第六部分：Superpowers 等社区技能包；机制与编写见 [Skills](/claude-code/skills/)。
