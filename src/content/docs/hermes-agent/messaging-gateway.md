---
title: 消息网关
description: 用 hermes gateway setup 把 Hermes 接到 Telegram、Discord 等平台，配置授权与配对，并用 Cron 向聊天推送定时结果。
sidebar:
  order: 7
---

*「Telegram 里 bot 能回话了，却谁都能 @ 它跑 shell——多半是 Gateway 默认拒绝未授权用户，而你还没配 allowlist 或 pairing。」*

前几章你在本机 CLI 里验证了对话与工具。本章把同一套 Agent **常驻到消息平台**：一个 Gateway 进程同时挂多个适配器，按聊天路由会话，并驱动内置 Cron 调度器。依据官方 [Messaging Gateway](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/)、[Scheduled Tasks (Cron)](https://hermes-agent.nousresearch.com/docs/user-guide/features/cron)。

**前置**：本机 `hermes doctor` 通过、`hermes model` 已配好 Provider，且至少完成过一轮正常 CLI 对话。官方 Quickstart 也建议先能聊天，再叠 Gateway。

## Gateway 解决什么问题

| 场景 | 只有 CLI | 加 Gateway |
| --- | --- | --- |
| 手机随手问 Agent | 需 SSH 或开电脑 | Telegram / WhatsApp 等直接聊 |
| 团队共用同一 bot | 每人各装一套 | 一台 VPS 上 Gateway + 授权名单 |
| 定时简报推送到群 | 靠外部 cron 调脚本 | Gateway 内 60 秒 tick + `cronjob` 投递 |
| Slash 与审批 | 终端内操作 | 聊天里 `/approve`、`/deny` |

Gateway **不是**第二个 Hermes 产品：它与 CLI 共用 `COMMAND_REGISTRY`、同一套 toolsets 与 `~/.hermes/state.db` 会话存储，差异主要在**入站适配器**与**出站渲染**（流式编辑、附件、语音转写等）。

## 架构：一条流水线

```text
平台适配器 (Telegram / Discord / …)
        ↓
按 chat 的 Session store
        ↓
AIAgent (run_agent.py)
        ↑
Cron scheduler（约每 60s tick，执行到期 job）
```

要点：

1. **每个聊天**有独立会话上下文，直到 `/new` 或重置策略触发清空。
2. **Cron 由 Gateway 进程调度**，不在纯 CLI 前台进程里跑长期调度；VPS 上通常 `hermes gateway install` 后常驻。
3. 各平台预设 toolset 名如 `hermes-telegram`、`hermes-discord`，默认含 `terminal` 等完整工具，见官方平台对照表。

平台能力差异很大。Telegram、Discord、Slack、Matrix、Feishu/Lark 等支持流式更新、线程、文件与语音；SMS 能力最简。选型前对照官方 [Platform Comparison](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/#platform-comparison)。

## 最小路径：从向导到常驻

### 1. 交互配置

```bash
hermes gateway setup
```

向导用方向键选择平台，显示已配置项，完成后可提示启动或重启 Gateway。

### 2. 前台试跑

```bash
hermes gateway run
# 部分版本子命令为 hermes gateway，无 run 时直接：
hermes gateway
```

在聊天里发一条消息，确认 bot 在线且模型有回复。此时终端需保持运行。

### 3. 安装为系统服务

```bash
hermes gateway install
hermes gateway start
hermes gateway status
```

| 环境 | 服务类型 | 日志 |
| --- | --- | --- |
| Linux 用户级 | systemd user unit | `journalctl --user -u hermes-gateway -f` |
| Linux 服务器 | `sudo hermes gateway install --system` | `journalctl -u hermes-gateway -f` |
| macOS | launchd | `tail -f ~/.hermes/logs/gateway.log` |

笔记本开发用 **user service**；无图形界面的 VPS 可用 **system service** 开机自启。避免同一机器同时启用 user 与 system 两套 unit，Hermes 会警告行为歧义。

多 Profile 或多套 `HERMES_HOME` 时，服务名会带 hash 后缀，对应各自的 `HERMES_HOME`。

### 4. 常用管理命令

```bash
hermes gateway stop
hermes gateway restart
hermes gateway uninstall
```

会话内也可用 `/platforms` 看连接概况，`/restart` 重启 Gateway（网关侧命令）。

## 授权：默认拒绝陌生人

Gateway **默认拒绝**不在 allowlist 且未完成 pairing 的用户。对带 `terminal` 的 bot，这是必要默认，不是可选项。

### 方式 A：环境变量 allowlist

在 `~/.hermes/.env` 配置平台专用变量，例如：

```bash
TELEGRAM_ALLOWED_USERS=123456789,987654321
DISCORD_ALLOWED_USERS=123456789012345678
GATEWAY_ALLOWED_USERS=123456789
```

也可用 `GATEWAY_ALLOW_ALL_USERS=true` 放开所有人。官方明确标注：**对具备终端能力的 bot 不推荐**。

各平台用户 ID 获取方式见对应子文档（Telegram、Discord 等）。

### 方式 B：DM pairing

未知用户私聊 bot 时会收到一次性配对码：

```text
Pairing code: XKGH5N7P
```

你在本机批准：

```bash
hermes pairing approve telegram XKGH5N7P
hermes pairing list
hermes pairing revoke telegram 123456789
```

配对码约 1 小时过期，有速率限制。适合不方便预先收集 ID 的场景。

### Admin 与普通用户

allowlist 回答「能否接触 bot」。**admin / user** 分层回答「进来后能跑哪些 Slash」：

| 层级 | Slash |
| --- | --- |
| Admin | 全部已注册命令（含插件） |
| User | 仅 `user_allowed_commands` 中列出的命令；`/help`、`/whoami` 始终可用 |

在 `gateway-config.yaml` 或 `config.yaml` 的 `gateway.platforms.<平台>.extra` 中配置，例如：

```yaml
gateway:
  platforms:
    discord:
      extra:
        allow_from: ["111", "222"]
        allow_admin_from: ["111"]
        user_allowed_commands: [status, model]
```

若某 scope 未设 `allow_admin_from`，该 scope **不启用**分层，所有已允许用户拥有完整 Slash 权限，兼容旧安装。

在任意平台发送 `/whoami` 可查看当前 scope、层级与可用命令列表。

## 会话、打断与 Gateway 专用 Slash

### 会话持久与重置

消息在 `/new` 或策略触发前保持上下文。可在 `~/.hermes/gateway.json` 按平台覆盖：

```json
{
  "reset_by_platform": {
    "telegram": { "mode": "idle", "idle_minutes": 240 },
    "discord": { "mode": "idle", "idle_minutes": 60 }
  }
}
```

常见策略：每日固定时刻、空闲 N 分钟、或二者取先触发者。

### 打断 Agent

默认：**新消息会打断**正在执行的任务。

- 进行中的终端命令会 SIGTERM，约 1 秒后 SIGKILL
- 进行中的 tool call 取消，队列中未执行的跳过
- 打断期间多条消息会合并成一条 prompt
- `/stop` 只打断，不附带新任务

可改 `display.busy_input_mode`：

| 值 | 行为 |
| --- | --- |
| `interrupt` | 默认，新消息打断 |
| `queue` | 排队，当前轮结束后再处理 |
| `steer` | 通过 `/steer` 注入，不打断当前轮 |

```yaml
display:
  busy_input_mode: queue
  busy_ack_enabled: true
```

`busy_ack_enabled: false` 可关闭「忙碌中」的即时 ack 回复，输入仍按模式处理。

### 网关侧危险命令审批

与 CLI 相同，破坏性 shell 可进入待批准状态，在聊天里：

```text
/approve
/deny
```

需配合 [工具系统](./tools-system/) 中的 `approvals.mode` 与 backend 隔离策略一起设计。

### 其他高频 Slash

| 命令 | 用途 |
| --- | --- |
| `/new`、`/reset` | 新会话 |
| `/model [provider:model]` | 查看或切换模型 |
| `/status` | 会话与 Gateway 信息 |
| `/background <prompt>` | 独立后台会话，完成后回帖到当前聊天 |
| `/sethome` | 把当前聊天设为 home channel（Cron 投递等用） |
| `/compress` | 手动压缩上下文 |
| `/<skill-name>` | 加载已安装 Skill |

完整列表以会话内 `/help` 与 [Slash Commands Reference](https://hermes-agent.nousresearch.com/docs/reference/slash-commands) 为准。

## Cron：Gateway 内的定时推送

Cron **执行依赖 Gateway**。调度器约每 60 秒检查到期任务，在隔离会话中跑 Agent，再把结果**投递**到聊天或文件。

### 创建任务

**聊天内**（需启用 `cronjob` toolset）：

```text
/cron add "every 2h" "检查服务器磁盘并摘要"
/cron add "0 9 * * *" "汇总 HN AI 新闻" --skill blogwatcher
```

**CLI**：

```bash
hermes cron create "every 2h" "检查服务器状态"
hermes cron list
hermes cron status
hermes cron pause <id>
hermes cron run <id>
```

也可用自然语言让 Agent 调用 `cronjob` 工具创建。Cron 会话内**不能**再创建 cron，防止调度循环。

### 投递目标

`deliver` 参数或配置决定结果发到哪。常见 token：

| 值 | 含义 |
| --- | --- |
| `origin` | 创建该 job 时的来源聊天 |
| `telegram` | `TELEGRAM_HOME_CHANNEL` 对应 home |
| `telegram:123456` | 指定 chat id |
| `all` | 所有已配置 home 的平台（运行时解析） |
| `origin,all` | 来源 + 其余 home，去重 |

Agent 的最终回复会自动投递，一般**不必**在 prompt 里再调 `send_message`。

Telegram 可用 `TELEGRAM_CRON_THREAD_ID` 把 cron 消息固定到某 topic，避免污染主 DM。详见官方 Cron 文档 [Delivery options](https://hermes-agent.nousresearch.com/docs/user-guide/features/cron#delivery-options)。

成功输出默认带 cron 头尾包装；设 `cron.wrap_response: false` 可发裸内容。回复以 `[SILENT]` 开头可抑制成功投递（失败仍会通知）。

### 与 Profile、工作目录

- Job 默认继承创建时 Gateway 所属 Profile；可用 `--profile` 或 `profile=` 指向另一 `HERMES_HOME`。
- 默认不加载某仓库的 `AGENTS.md`；用 `--workdir` 让定时任务在指定项目根执行。

## 多平台运维

### `/platform` 与熔断

```text
/platform list
/platform pause telegram
/platform resume telegram
```

适配器有 **circuit breaker**：连续可重试失败会自动暂停适配器，并尝试通知其他平台的 home channel。**不会自动 resume**，需你确认上游恢复后手动 `/platform resume`。

排查顺序：Gateway 日志 → `/platform list` → 平台状态页。

### 重启通知与会话恢复

`gateway_restart_notification` 可在 `gateway-config.yaml` 控制重启后是否向 home 发一条通知。Gateway 异常退出时，会话可标记 `restart_interrupted`，下次启动后用户回复即可尝试从上次已提交轮次续跑。

### 工具进度与后台任务

```yaml
display:
  tool_progress: all
  background_process_notifications: all
```

聊天中可看到 `💻 ls -la` 类进度提示。`/background` 会 fork 独立 Agent，结果回到**发起该命令的同一聊天**。

## Web Dashboard 与运维面板

除消息平台外，可用浏览器查看会话、Kanban、定时任务等：

```bash
hermes dashboard
```

默认监听 `127.0.0.1:9119`。与 Gateway 并行时常驻；VPS 上建议 SSH 端口转发，远程暴露须加 TLS 与认证，见 [安全、性能与最佳实践](./security-performance-best-practices/#web-dashboard-远程访问)。

Kanban 看板、多 board 切换、建卡与归档在 Dashboard 与 `hermes kanban` CLI 间共享同一 SQLite，见 [Kanban 多 Agent 看板](./kanban-multi-agent-board/)。

## 与 CLI、Profile、工具章的衔接

| 主题 | 关联 |
| --- | --- |
| Profile | 不同 bot token 用 `hermes -p` 隔离 `~/.hermes/profiles/` |
| Toolsets | `hermes tools` 按平台开关；Telegram 默认 `hermes-telegram` |
| 终端 backend | Gateway 上 `terminal` 仍受 `terminal.backend` 约束 |
| 记忆与 Skill | 同一 `MEMORY.md` 与 `~/.hermes/skills/`，Gateway 会话写入 `state.db` |
| API Server | Gateway 启动后可开 OpenAI 兼容 HTTP，见 [架构拆解](./architecture-deep-dive/#api-serveropenai-兼容) |

**不要**在未配 Provider 时先起 Gateway：错误会出现在每个聊天里，排查成本更高。

**不要**在公网 bot 上 `GATEWAY_ALLOW_ALL_USERS=true` 且 `terminal.backend: local`：等同向互联网开放你的用户 shell。

**不要**忘记设 home channel：Cron 的 `telegram`、`all` 等投递依赖 `TELEGRAM_HOME_CHANNEL` 等变量或 `/sethome`。

## 故障模式

| 现象 | 可能原因 | 处理 |
| --- | --- | --- |
| bot 不回复 | Gateway 未运行、token 错 | `hermes gateway status`；查 `gateway.log` |
| 陌生人能聊、熟人不能 | allowlist ID 写错 | 核对平台用户 ID；试 pairing |
| 所有人被拒 | 未 allowlist 也未 pairing | `hermes pairing list` 或补 env |
| Cron 从不触发 | 无 Gateway 进程 | `install` + `start`；`hermes cron status` |
| Cron 无推送 | 无 home / deliver 配错 | `/sethome`；检查 `TELEGRAM_HOME_CHANNEL` |
| 平台突然静默 | circuit breaker 暂停 | `/platform list`；恢复后 `resume` |
| 审批卡住 | 无人看聊天 | 设 `SUDO_PASSWORD` 仅评估风险；或改 `approvals.mode` |
| macOS 上工具找不到 | launchd PATH 陈旧 | 重装工具后重新 `hermes gateway install` |

## 动手练习

1. 只配置 **一个**平台（建议 Telegram 或 Discord），完成 `hermes gateway setup` 与前台试跑。
2. 用 allowlist 或 pairing 拒绝你自己的小号，再批准，确认策略生效。
3. 在聊天发送 `/whoami`，记录 admin 或 user 与可用 Slash。
4. 创建 `hermes cron create "30m" "回复 pong"`，设 deliver 为 `origin` 或当前平台 home，等待一次触发。
5. 运行 `/background 列出当前目录前 5 个文件`，确认主聊天仍可对话且结果回帖。
6. `hermes gateway install` 后断开 SSH，从手机发消息验证常驻。

## 苏格拉底式反思

1. 你的 bot 面向「仅自己」还是「小团队」？allowlist 与 admin 分层应如何划？
2. Cron 结果发到 `origin` 还是 `all`，对隐私与噪音的影响分别是什么？
3. Gateway 与 CLI 共用记忆时，Telegram 里下的命令实际在哪台机器的哪个 backend 执行？

## 读者自测

- [ ] 说清 Gateway 与 CLI 共享、适配器独有的部分。
- [ ] 独立完成 `gateway setup` 与一个平台的授权配置。
- [ ] 对比 allowlist 与 `hermes pairing approve` 的适用场景。
- [ ] 创建一个 Cron job 并收到至少一次投递。
- [ ] 解释 `busy_input_mode` 三种模式的差异。
- [ ] 知道 circuit breaker 暂停后如何恢复。

---

下一章：[技能系统实战](./skills-in-practice/)，展开 `SKILL.md`、Hub 安装、Skill 生命周期与 Curator。
