---
title: 工具系统
description: 理解 Toolsets 与 hermes tools、终端 backend 隔离、危险命令审批与 MCP 接入，建立可审计的执行边界。
sidebar:
  order: 6
---

*「Agent 提议执行 rm -rf，你点了允许——之后才发现命令其实在本地 shell 跑，而不是你以为的 Docker 里。」*

工具系统是 Hermes 与「纯聊天」的分水岭：模型通过 function calling 触发 `terminal`、`read_file`、`web_search` 等能力。本章说明**工具如何分组启用**、**命令实际在哪执行**、**审批与硬阻断如何叠层**，以及 **MCP 如何扩展外部工具**。依据官方 [Tools](https://hermes-agent.nousresearch.com/docs/user-guide/features/tools)、[Security](https://hermes-agent.nousresearch.com/docs/user-guide/security)、[MCP](https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp)。

## 工具在 Agent Loop 中的位置

每一轮模型若返回 tool calls，运行时执行对应 handler，把结果塞回对话，再请求模型，直到产生最终文本。内置工具在仓库 `tools/registry.py` 注册；你通过 **toolsets** 决定当前平台暴露哪些工具，避免一次塞进过大的 schema。

高层分类（非完整列表）：

| 类别 | 代表工具 | 典型用途 |
| --- | --- | --- |
| Web | `web_search`、`web_extract` | 检索与抓页 |
| 终端与文件 | `terminal`、`read_file`、`patch` | 命令与编辑 |
| 浏览器 | `browser_navigate`、`browser_snapshot` | 交互式自动化 |
| 媒体 | `vision_analyze`、`image_generate`、`text_to_speech` | 多模态 |
| 编排 | `todo`、`clarify`、`execute_code`、`delegate_task` | 规划与子 Agent |
| 记忆 | `memory`、`session_search` | 跨会话状态 |
| 自动化 | `cronjob`、`send_message` | 定时与出站消息 |
| 集成 | `ha_*`、MCP 前缀工具、`rl_*` | 外部系统 |

权威列表见 [Built-in Tools Reference](https://hermes-agent.nousresearch.com/docs/reference/tools-reference) 与 [Toolsets Reference](https://hermes-agent.nousresearch.com/docs/reference/toolsets-reference)。

## Toolsets：按需启用，而不是全开

```bash
hermes tools                    # 交互式配置各平台 toolsets
hermes chat --toolsets "web,terminal,file"
```

常见 toolset 包括 `web`、`terminal`、`file`、`browser`、`vision`、`memory`、`skills`、`code_execution`、`delegation`、`cronjob`、`messaging`、`safe` 等。平台预设如 `hermes-cli`、`hermes-telegram` 会为 Gateway 预置不同组合。

设计意图：

- **减小 schema**：模型更易选对工具，也省上下文。
- **分平台策略**：Telegram 上可关掉重型 `browser`，CLI 开发机可全开。
- **MCP 动态集**：每个已连接且有过滤后工具的 MCP 服务器对应 `mcp-<server>` toolset。

误用边界：关掉 `memory` 或 `skills` 不会「更安全」，只是让 Agent 失去闭环学习能力；应在明确不需要时再禁。

## `hermes tools`：配置入口

`hermes tools` 提供 TUI/交互菜单，按**平台**勾选 toolsets（CLI、各消息渠道等）。与 `config.yaml` 中的设置一致，适合不熟悉 YAML 时快速试验。

Nous Portal 订阅用户可通过 [Tool Gateway](https://hermes-agent.nousresearch.com/docs/user-guide/features/tool-gateway) 使用网页搜索、图像、TTS、浏览器等而无需逐项自备 API Key；也可在 `hermes tools` 里单独开关。

部分能力默认关闭，需主动加入 toolset，例如：

- `video_gen` / `video`：`video_generate`、`video_analyze`
- X 搜索：需 xAI 凭据，在 tools 菜单 opt-in

## 终端 Backend：命令实际跑在哪

`terminal` 与 `execute_code`、文件工具共享 backend 配置：

```yaml
# ~/.hermes/config.yaml
terminal:
  backend: local    # local | docker | ssh | modal | daytona | vercel_sandbox | singularity
  cwd: "."
  timeout: 180
```

| Backend | 隔离 | 适用 |
| --- | --- | --- |
| `local` | 无，等同你的用户 | 本机可信开发 |
| `docker` | 单容器持久沙箱，cap-drop 等加固 | 默认推荐的隔离方式 |
| `ssh` | 网络边界，推荐防 Agent 改自身代码 | 远程算力 |
| `modal` / `daytona` / `vercel_sandbox` | 云 VM/工作区 | 无本地 Docker、弹性算力 |
| `singularity` | HPC 容器 | 集群共享机 |

### Docker：一个长生命周期容器

Hermes 首次需要时启动**一个**长驻容器，后续 `terminal`、`read_file`、`execute_code` 均 `docker exec` 进同一实例；`/new`、`delegate_task` 子 Agent 默认**共享**该容器，工作目录与已装包会延续，进程退出时销毁。

并行 `delegate_task` 多子任务会争用同一容器内 cwd 与环境；需要每任务独立镜像时由 RL/评测环境注册 per-task override。

`container_persistent: true` 时 `/workspace` 等可在 Hermes 重启后保留；**不保证**后台进程与 PID 空间延续。

### SSH 与云后端要点

SSH 凭据放 `.env`：`TERMINAL_SSH_HOST`、`TERMINAL_SSH_USER`、可选 `TERMINAL_SSH_KEY`。默认 persistent shell，cwd 在远程会话内保持。

云 sandbox 需各自 API token（如 `MODAL_TOKEN_*`、`DAYTONA_API_KEY`、`VERCEL_TOKEN` 三元组）。Vercel 本地可短期用 `VERCEL_OIDC_TOKEN`，生产应用 access token。

资源可调：`container_cpu`、`container_memory`、`container_disk`（Vercel 自定义 disk 可能不受支持）。

### 与审批层的关系

当 backend 为 `docker`、`singularity`、`modal`、`daytona`、`vercel_sandbox` 时，**容器内**的危险命令模式检查会跳过：隔离边界视为已满足；主机仍受 hardline blocklist 约束的路径取决于实现，但破坏性操作主要伤害容器文件系统。

在 `local` 上跑生产 Gateway 时，官方建议改用容器 backend，以减少对「逐条审批」的依赖。

## 后台进程与 PTY

```python
terminal(command="pytest -v", background=true)
# 返回 session_id 后用 process 工具：
process(action="poll", session_id="proc_...")
process(action="log", session_id="proc_...")
process(action="kill", session_id="proc_...")
```

`pty=true` 可驱动需要伪终端的交互 CLI。长时间任务应设合理 `timeout`，避免挂死 Agent loop。

## 危险命令审批：三层防护

官方安全模型包含用户授权、审批、容器隔离、MCP 凭据过滤、上下文扫描等。与工具最直接相关的是**审批 + hardline**。

### 审批模式

```yaml
approvals:
  mode: manual    # manual | smart | off
  timeout: 60
```

| 模式 | 行为 |
| --- | --- |
| `manual`（默认） | 命中危险模式则人工确认 |
| `smart` | 辅助模型评估；低风险自动过，高风险自动拒，模糊则追问 |
| `off` | 不提示，等同全局 YOLO |

### YOLO：会话级绕过

- `hermes --yolo` / `hermes chat --yolo`
- 会话内 `/yolo` 切换
- `HERMES_YOLO_MODE=1`

YOLO 会显示状态栏与横幅提醒。它**不**绕过 **hardline blocklist**（如 `rm -rf /`、fork bomb、`dd` 写块设备等），这些在审批层之前直接拒绝。

CLI 审批选项：`once` | `session` | `always` | `deny`（默认 deny）。`always` 写入 `config.yaml` 的 `command_allowlist`。

Gateway 上用户回复 `yes`/`approve` 或 `no`/`deny`；超时**默认拒绝**（fail-closed）。

### 常见触发模式（节选）

递归 `rm`、写 `/etc/` 或 `~/.hermes/.env`、`chmod` 宽松权限、`dd`、`DROP TABLE`、管道到 `sh` 的 curl/wget、`bash -c` 等。完整表见 [Security](https://hermes-agent.nousresearch.com/docs/user-guide/security)。

## MCP：外接工具生态

[MCP](https://modelcontextprotocol.io/) 让 Hermes 连接外部工具服务器，无需先写原生 Hermes tool。

### 最小接入

```yaml
# ~/.hermes/config.yaml
mcp_servers:
  filesystem:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/projects"]
```

```bash
cd ~/.hermes/hermes-agent && uv pip install -e ".[mcp]"
hermes chat
```

HTTP 服务器用 `url` + `headers` 而非 `command`。

工具注册名：`mcp_<server>_<tool>`，例如 `mcp_filesystem_read_file`。模型通常无需你手写全名。

### 过滤与安全

```yaml
mcp_servers:
  github:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-github"]
    env:
      GITHUB_PERSONAL_ACCESS_TOKEN: "***"
    tools:
      include: [create_issue, list_issues]
      prompts: false
      resources: false
  legacy:
    url: "https://mcp.legacy.internal"
    enabled: false
```

- `enabled: false`：完全不连接
- `include` / `exclude`：工具白黑名单；同时存在时 **include 优先**
- stdio 子进程**不会**继承完整 shell 环境，仅配置 `env` 与安全基线
- 改配置后会话内 `/reload-mcp`；服务器也可推送 `tools/list_changed` 自动刷新

`supports_parallel_tool_calls: true` 仅在对只读、无共享状态工具确认安全后开启。

### Hermes 作为 MCP 服务器

`hermes mcp serve` 暴露会话列表、读消息、发消息等，供 Claude Code/Cursor 等客户端调用；读操作可不启 Gateway，**发送**需 Gateway 与平台连接。见官方 MCP 文档「Running Hermes as an MCP server」。

### 预设

```bash
hermes mcp add codex --preset codex
```

## 文件读取与其它边界

- **Checkpoints**：破坏性文件操作前可选快照（`checkpoints.enabled`，常配合 `hermes chat --checkpoints`）。
- **环境变量 passthrough**：`terminal.env_passthrough` 控制哪些变量进入沙箱；含 `KEY`/`TOKEN` 等模式的变量在 `execute_code` 等路径会被拦截。
- **Tirith**（若启用）：对可疑命令附加分析，仍可由用户否决。

## 最小工作流示例

**本机开发（可信仓库）**

```bash
hermes tools    # 确认 CLI 启用 web, terminal, file, memory, skills
hermes chat
```

**不可信脚本或爬取任务**

```bash
hermes config set terminal.backend docker
hermes config set terminal.docker_image python:3.11-slim
hermes chat     # 保持 approvals.mode manual
```

**接 GitHub MCP 且最小暴露**

```yaml
mcp_servers:
  github:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-github"]
    env:
      GITHUB_PERSONAL_ACCESS_TOKEN: "${GITHUB_TOKEN}"
    tools:
      include: [list_issues, create_issue]
```

## 故障模式

| 现象 | 可能原因 | 处理 |
| --- | --- | --- |
| 模型说无法读文件 | `file` toolset 未启用 | `hermes tools` 勾选；或 `--toolsets file` |
| Docker 命令失败 | daemon 未运行或镜像拉取失败 | `docker ps`；查 `hermes doctor` |
| 审批刷屏 | `local` + 大量 shell 一行命令 | `approvals.mode: smart` 或改 docker backend |
| MCP 工具不出现 | 连接失败或 include 过滤空了 | 日志；`/reload-mcp`；检查 `enabled` |
| 子 Agent 互相 cd 乱套 | 共享 docker 容器 | 评测用 per-task 镜像；或减少并行 delegate |
| sudo 卡住 Gateway | 无人输入密码 | `.env` 设 `SUDO_PASSWORD`（评估风险） |
| YOLO 仍被拒 | hardline blocklist | 在容器外人工执行；勿期待 Agent 代跑 |

## 决策边界

- **不要把 `approvals.mode: off` 当开发默认**：一次误判即可删库；隔离环境再用。
- **不要假设「装了 Docker」就等于 backend 是 docker**：必须 `config set terminal.backend docker`。
- **不要对不可信 MCP 服务器开全工具 + parallel**：用 `include` 最小化；敏感服禁用 sampling 或设 `sampling.enabled: false`。
- **不要在 Telegram 上默认开 terminal 且无 allowlist**：结合 Gateway 用户授权与 backend 隔离。
- **不要用工具数量代替任务分解**：toolset 过大反而增加误选与 token 消耗。

## 动手练习

1. 运行 `hermes tools`，记录 CLI 平台当前启用的 5 个 toolset 名称。
2. `hermes config set terminal.backend docker` 后发起「在容器里 python --version」并 `/status` 核对 backend。
3. 在 `manual` 审批下让 Agent 提议 `rm -r` 某临时目录，练习一次 `deny` 与一次 `once`。
4. 添加只读 filesystem MCP（限制路径为临时目录），`/reload-mcp` 后列出目录。
5. 阅读 `~/.hermes/config.yaml` 是否已有 `command_allowlist` 条目。

## 苏格拉底式反思

1. 你的主力场景下，破坏性命令最可能伤害的是主机、容器还是远程 SSH 机？
2. 若关闭 `web` toolset，Agent 还能通过 `terminal` + curl 达到类似效果吗？边界在哪？
3. MCP `include` 列表与 Gateway `ALLOWED_USERS` 哪个防的是不同威胁？

## 读者自测

- [ ] 解释 toolset 的作用与 `hermes tools` 的用途。
- [ ] 对比 `local` 与 `docker` backend 的隔离与持久化行为。
- [ ] 说出审批三种模式与 YOLO、hardline 的关系。
- [ ] 写出一个 stdio MCP 最小 `config.yaml` 片段。
- [ ] 说明容器 backend 下为何可跳过部分危险命令审批。

---

下一章：[消息网关](./messaging-gateway/)，展开 `hermes gateway setup`、多平台接入、授权与 Cron 推送。
