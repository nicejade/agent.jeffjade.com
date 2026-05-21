---
title: 安全、性能与最佳实践
description: 掌握七层安全模型、hermes doctor 体检、auxiliary 与压缩缓存调优，以及 Gateway 生产部署清单。
sidebar:
  order: 12
---

*「Gateway 已上线，YOLO 也开了，某天 Agent 在宿主机上跑了 rm -rf——你才发现 terminal.backend 仍是 local。」*

实战九章之后，你多半已经让 Hermes 能干活。本章把**代价与边界**摆到台面上：命令审批与 hardline 底线、容器隔离、辅助模型与上下文压缩、Prompt Caching，以及 `hermes doctor` 如何把「感觉不对」变成可核对项。依据官方 [Security](https://hermes-agent.nousresearch.com/docs/user-guide/security)、[Tips & Best Practices](https://hermes-agent.nousresearch.com/docs/guides/tips)、[Context Compression & Caching](https://hermes-agent.nousresearch.com/docs/developer-guide/context-compression-and-caching)。

**前置**：已读过 [工具系统](./tools-system/) 与 [消息网关](./messaging-gateway/)。若 Gateway 带 `terminal` 且面向公网，本章应优先落实。

## 七层安全模型：从谁能说话到命令能否跑

官方把安全边界叠成七层，理解顺序有助于排障：

| 层 | 机制 | 典型配置 |
| --- | --- | --- |
| 1 | 用户授权 | `TELEGRAM_ALLOWED_USERS`、`hermes pairing` |
| 2 | 危险命令审批 | `approvals.mode`、`/yolo` |
| 3 | 容器隔离 | `terminal.backend: docker` |
| 4 | MCP 凭据过滤 | MCP `env` 白名单，主机 Key 不传入子进程 |
| 5 | 上下文文件扫描 | `AGENTS.md` / `SOUL.md` 注入前检测注入模式 |
| 6 | 跨会话隔离 | SessionDB、Cron 路径防遍历 |
| 7 | 输入净化 | terminal 工作目录 allowlist |

单层失效不应拖垮全部：Gateway 开了 allowlist，但 backend 仍是 `local`，属于「身份对了、执行面仍危险」的常见组合。

## Checkpoints 与 /rollback

Hermes 可在**破坏性写操作前**自动快照工作目录，并用 `/rollback` 恢复。实现上使用 `~/.hermes/checkpoints/store/` 的**共享 shadow git 仓库**，不触碰项目自身的 `.git`。依据官方 [Checkpoints & Rollback](https://hermes-agent.nousresearch.com/docs/user-guide/checkpoints-and-rollback)。

**默认关闭**（v2 opt-in）：存储会随时间增长，多数用户只用 Git 即可。

```bash
hermes chat --checkpoints
```

或全局：

```yaml
checkpoints:
  enabled: true
  max_snapshots: 20
  max_total_size_mb: 500
  max_file_size_mb: 10
  auto_prune: true
  retention_days: 7
```

### 何时自动快照

每目录每轮至多一次，触发于：

- `write_file`、`patch`
- 破坏性终端命令：`rm`、`mv`、`sed -i`、重定向 `>`、`git reset`/`clean`/`checkout` 等

### 会话内恢复

| 命令 | 作用 |
| --- | --- |
| `/rollback` | 列出检查点 |
| `/rollback <N>` | 恢复检查点 N，并撤销上一轮对话 |
| `/rollback diff <N>` | 预览差异 |
| `/rollback <N> <file>` | 仅恢复单文件 |

```bash
hermes checkpoints status
hermes checkpoints prune
hermes checkpoints clear-legacy
```

### 与 Git 工作流协同

| 做法 | 说明 |
| --- | --- |
| 日常开发 | 仍以 Git commit 为真相源 |
| Agent 试错 | checkpoints 快速回到 Agent 改乱前 |
| 并行 Agent | 配合 [git worktree](https://hermes-agent.nousresearch.com/docs/user-guide/git-worktrees) + checkpoints |

**不可逆操作**：已 `git push`、已发外部消息、已调支付 API、共享库已 migration 等。checkpoint 只覆盖 shadow 跟踪的工作区文件；超大文件与超大目录会跳过。PATH 无 `git` 时功能透明禁用。

## 命令审批：manual、smart、off 与 YOLO

```yaml
# ~/.hermes/config.yaml
approvals:
  mode: manual    # manual | smart | off
  timeout: 60   # 秒，超时默认 deny（fail-closed）
```

| 模式 | 行为 |
| --- | --- |
| `manual` | 命中危险模式即提示用户 |
| `smart` | 辅助模型评估风险；低风险自动过，高风险自动拒，不确定再人工 |
| `off` | 等同全程无审批，仅 hardline 仍生效 |

YOLO 会跳过审批提示，可通过 `hermes --yolo`、`/yolo` 或 `HERMES_YOLO_MODE=1` 开启；会话内会有红色横幅与状态栏 `⚠ YOLO` 提醒。

**hardline blocklist** 是地板：`rm -rf /`、fork bomb、`dd` 写块设备等**无论 YOLO、off 或 Cron 无人值守**均拒绝，实现在 `tools/approval.py::UNRECOVERABLE_BLOCKLIST`。合法运维若确需此类命令，应在 Agent 外由操作员执行。

容器 backend（`docker`、`singularity`、`modal`、`daytona`、`vercel_sandbox`）下，危险命令检查会跳过，因为隔离边界在容器内。误用边界：容器内仍可删挂载卷上的数据；`docker_forward_env` 会把列出的变量注入容器，恶意代码可读走 `GITHUB_TOKEN` 等。

## Gateway 授权：allowlist 与 pairing

未配置 allowlist 且未设 `GATEWAY_ALLOW_ALL_USERS=true` 时，**默认拒绝所有人**。检查顺序（简化）：

1. 平台 `ALLOW_ALL`
2. pairing 已批准列表
3. 平台 `*_ALLOWED_USERS`
4. `GATEWAY_ALLOWED_USERS`
5. `GATEWAY_ALLOW_ALL_USERS`
6. 默认 deny

配对流程：陌生人 DM 收到 8 位码 → 你在 CLI 执行 `hermes pairing approve telegram ABC12DEF`。代码 1 小时过期、每用户 10 分钟限 1 次、每平台最多 3 个待处理。比手工收集 user id 更适合小团队。

```bash
hermes pairing list
hermes pairing approve telegram ABC12DEF
hermes pairing revoke telegram 123456789
```

**误用边界**：带 `terminal` 的 bot 切勿 `GATEWAY_ALLOW_ALL_USERS=true`。审批在聊天里用 `yes`/`deny` 回复，Gateway 会设 `HERMES_EXEC_ASK=1`。

## 容器与终端 backend 选型

| Backend | 隔离 | 危险命令检查 | 适用 |
| --- | --- | --- | --- |
| `local` | 无 | 有 | 本机可信开发 |
| `docker` | 容器 | 跳过 | 生产 Gateway |
| `ssh` | 远程机 | 有 | 网关与执行分离 |
| `modal` / `daytona` / `vercel_sandbox` | 云沙箱 | 跳过 | 弹性算力 |

Docker 默认带 `--cap-drop ALL`、`no-new-privileges`、tmpfs 限制等（见 `tools/environments/docker.py`）。生产 Gateway 建议：

```yaml
terminal:
  backend: docker
  docker_image: "nikolaik/python-nodejs:python3.11-nodejs20"
  container_cpu: 1
  container_memory: 5120
  container_persistent: true
  docker_forward_env: []   # 空列表避免密钥进容器
```

`execute_code` 与 `terminal` 会剥离含 `KEY`/`TOKEN`/`SECRET` 等模式的变量；Skill 声明的 `required_environment_variables` 在加载后可透传，勿把 Provider API Key 写进 `env_passthrough`。

## MCP、SSRF 与上下文文件

MCP stdio 子进程默认只继承 `PATH`、`HOME` 等安全变量；额外凭据只能写在对应服务器的 `env` 块。错误信息中的 `ghp_`、`sk-` 等会在回传模型前脱敏。

`security.website_blocklist` 可拦域名；`security.allow_private_urls` 默认 `false`，防 SSRF 打内网与云元数据。仅在家用内网调试 Ollama 等场景才考虑开启，公网 Gateway 应保持关闭。

`AGENTS.md`、`SOUL.md` 注入前会扫描「忽略先前指令」、隐藏 Unicode、诱导读 `.env` 等模式；命中则整文件不加载并显示 `[BLOCKED: ...]`。

可选 **Tirith** 在模式匹配之外做内容级扫描；`tirith_fail_open: true` 时未安装则放行，高安全环境可设为 `false`。

## `hermes doctor`：把隐患列成清单

```bash
hermes doctor
hermes doctor --ack <advisory-id>   # 确认并永久忽略某条供应链告警
```

`doctor` 会检查 Python 版本、可选依赖、Provider 配置、终端 backend、浏览器依赖、Gateway 相关项，以及**供应链 advisory**（已知被投毒版本等）。CLI 启动时也可能打印一行摘要，指向 `doctor` 看完整修复步骤。

与审批、容器相关的自检习惯：

1. `hermes doctor` 无阻塞项后再开 Gateway。
2. `hermes config get terminal.backend` 与预期一致。
3. 审阅 `command_allowlist`：`hermes config edit`。
4. `chmod 600 ~/.hermes/.env`，密钥不进 Git。

## 性能与成本：auxiliary、压缩与缓存

### auxiliary：侧任务用便宜模型

主模型负责对话与复杂推理；压缩摘要、部分视觉、审批 smart 模式等可走 **auxiliary** 路由：

```yaml
auxiliary:
  compression:
    model: null
    provider: auto
  vision:
    provider: auto
```

在 `hermes model` 的 Auxiliary models 段可单独指定。官方要求**压缩用模型的上下文窗口不得小于主模型**，否则中间段摘要失败会静默丢上下文，这是长会话变「健忘」的常见原因。

### 双层压缩

```text
Gateway 会话卫生（约 85% 窗口）→ 进 Agent 前的安全网
Agent ContextCompressor（默认 50%）→ 循环内主压缩
```

Agent 侧默认 `compression.threshold: 0.50`，`protect_last_n: 20`；先剪旧 tool 输出，再对中间轮次做结构化摘要（Goal / Progress / Relevant Files 等）。可用 `/compress` 手动触发；`/usage` 查看 token 占用。

Gateway 85% 阈值故意高于 Agent 50%，避免长会话每轮都被压一遍。详见 [Context Compression & Caching](https://hermes-agent.nousresearch.com/docs/developer-guide/context-compression-and-caching)。

### Prompt Caching（Anthropic）

系统提示前缀稳定时，Claude 经 Anthropic 或 OpenRouter 可启用 **cache_control**，多轮输入成本可显著下降。设计要点：

- `SOUL.md`、`MEMORY.md` 冻结快照在会话开始时注入，会话中 `memory` 工具改盘但不改已缓存前缀（见 [记忆、学习与 Skill](./memory-learning-skills/)）。
- 避免中途 `/model` 换提供商除非接受缓存失效。
- 压缩首次发生时系统提示会追加一条说明，之后前缀仍相对稳定。

```yaml
prompt_caching:
  cache_ttl: "5m"   # 或 "1h"，长间隔对话可用 1h
```

策略 `system_and_3`：系统提示 + 滚动 3 条非 system 消息各一个断点（Anthropic 最多 4 个断点）。

### 日常省 token 习惯（摘自官方 Tips）

| 做法 | 原因 |
| --- | --- |
| 任务具体、一次给全路径与报错 | 减少澄清轮次 |
| 用 `AGENTS.md` 代替每轮重复规范 | 稳定前缀 |
| 批量操作用 `execute_code` | 中间结果不进主上下文 |
| 并行调研用 `delegate_task` | 只回收摘要 |
| 长会话主动 `/compress` | 避免撞窗 |

`security.allow_lazy_installs: false` 可禁止运行时 `pip install` 可选依赖，适合隔离网络，但需事先装好对应 extra。

## 成本控制框架

账单暴涨通常来自**隐性乘数**，而非单次对话。

| 成本大头 | 机制 | 抑制手段 |
| --- | --- | --- |
| 子 Agent | `delegate_task` 多轮 × 全工具 | 只回收摘要；Kanban 拆长期任务 |
| 云浏览器 | Browserbase 等按会话/分钟 | 本地 Chromium；任务结束关会话 |
| 流式 TTS | Voice 长回复朗读 | CLI 关 TTS；Gateway 限平台 |
| 长上下文 | 每轮塞满 `@file` 全文 | 行范围引用；`/compress` |
| 续跑目标 | `/goal` 默认 20 轮 | 收紧 `goals.max_turns`；便宜 `goal_judge` |

### auxiliary 实测收益

为 **compression**、**vision**、**approval smart**、**goal_judge**、**curator** 指定便宜模型，常比降主模型档位更安全。约束：**compression 模型上下文不得小于主模型**，否则长会话「健忘」。用 `/usage` 对比压缩前后 token。

### Prompt Caching 生效条件

- 系统提示前缀跨轮稳定（frozen memory、`AGENTS.md` 少动）
- 避免频繁 `/model` 换提供商
- Anthropic 经官方或 OpenRouter 时配置 `prompt_caching.cache_ttl`

### hermes logs 审计示例

```bash
hermes logs --follow --level INFO
hermes logs --grep "TOOL_CALL"
```

结合 Gateway `gateway.log` 与 `~/.hermes/logs/curator/`，可回溯「哪次 Cron / 哪条会话」触发大量工具。详见 [高级特性](./advanced-features/) 成本表与官方 [Tips](https://hermes-agent.nousresearch.com/docs/guides/tips)。

## Web Dashboard 远程访问

```bash
hermes dashboard    # 默认 http://127.0.0.1:9119
```

面板含会话历史、Kanban、Cron 等（随版本迭代）。**默认仅本机回环**，适合 VPS 上 `ssh -L 9119:127.0.0.1:9119 user@vps` 转发。

若必须远程直连：

1. 置于反向代理 后并启用 TLS。
2. 设强认证，勿裸奔 `0.0.0.0`。
3. 与 [API Server](./architecture-deep-dive/#api-serveropenai-兼容) 的 `API_SERVER_KEY` 分开管理。

误用边界：Dashboard 能查看会话与触发操作，权限等同能登录该 Hermes 主机的用户。

## 生产 Gateway 检查清单

1. 显式 allowlist 或 pairing，禁止全局 `ALLOW_ALL`。
2. `terminal.backend: docker`（或云沙箱），并限制 CPU/内存/磁盘。
3. `MESSAGING_CWD` 指向非敏感目录。
4. 不以 root 跑 Gateway；定期 `hermes update`。
5. 审计 `command_allowlist` 与 `~/.hermes/logs/`。
6. 需要时 `terminal.backend: ssh`，密钥只在 `.env`。

## 故障模式

| 症状 | 可能原因 | 下一步 |
| --- | --- | --- |
| 长会话突然「失忆」 | 压缩摘要模型窗口小于主模型 | 对齐 `auxiliary.compression` 与主模型上下文 |
| 账单暴涨 | 每轮改 system、未命中 cache | 稳定 `AGENTS.md`，少中途换模型 |
| Gateway 无人回复 | 未 allowlist | `pairing list` / 配置 `*_ALLOWED_USERS` |
| 容器里仍删了重要数据 | 持久化 bind mount | 评估 `container_persistent` 与挂载路径 |
| `doctor` 报 advisory | 依赖版本命中投毒 catalog | 按提示升级并 `--ack` |

## 决策边界

- **不要把 `approvals.mode: off` 当开发默认**：一次误判即可毁数据；隔离环境再用。
- **不要「装了 Docker」却不改 backend**：必须 `hermes config set terminal.backend docker`。
- **不要为省几毛钱把压缩模型换成极小窗口**：质量损失往往大于模型费。
- **不要在公网 Gateway 开 `allow_private_urls`**：等于允许 Agent 扫内网。

## 动手练习

1. 运行 `hermes doctor`，记录一项 warning 及建议修复。
2. 查看 `approvals.mode` 与 `terminal.backend`，写下你当前组合的风险一句话。
3. 在同一会话运行 `/usage`，再 `/compress`，对比前后 token 字段（若显示）。
4. 在 `manual` 下触发一次 `rm -r` 临时目录，练习 `once` 与 `deny`。
5. 阅读 `~/.hermes/config.yaml` 是否含 `command_allowlist` 条目。

## 苏格拉底式反思

1. 你的 Agent 破坏性命令最可能伤害主机、容器还是 SSH 远程机？
2. frozen memory 与「边聊边改 USER.md」的需求冲突时，你会开新会话还是接受本会话不见新事实？
3. Gateway 85% 与 Agent 50% 两层压缩，哪一层更适合你排查「昨晚 Telegram 堆太多轮」的问题？

## 读者自测

- [ ] 说出七层安全中 Gateway 最常漏配的两层。
- [ ] 对比 `manual`、`smart`、`off` 与 YOLO、hardline 的关系。
- [ ] 解释容器 backend 跳过审批的前提与剩余风险。
- [ ] 说明 auxiliary.compression 窗口不足时的症状。
- [ ] 列出 Prompt Caching 依赖的三条稳定前缀习惯。
- [ ] 写出 `hermes doctor` 与供应链 `--ack` 的用途。

---

下一章：[插件系统（Plugins）](./plugins-system/)，扩展工具、钩子与记忆后端而不改核心仓库。
