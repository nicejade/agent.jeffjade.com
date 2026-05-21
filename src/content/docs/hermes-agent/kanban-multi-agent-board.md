---
title: Kanban 多 Agent 看板
description: 用 SQLite 任务板协调多 Profile 工人、理解卡片状态机，并对比 delegate_task 的适用边界。
sidebar:
  order: 10
---

*「三个子 Agent 并行改同一仓库，父会话上下文被压扁——你需要的是看板上的三行任务，而不是三次 `delegate_task` 把摘要塞回父线程。」*

[高级特性](./advanced-features/) 里的 `delegate_task` 适合「父 Agent 等一个答案再继续」。当工作要**跨角色、跨重启、等人批复、或事后审计**时，应改用 Kanban：每步 handoff 是 `~/.hermes/kanban.db` 里的一行。依据官方 [Kanban](https://hermes-agent.nousresearch.com/docs/user-guide/features/kanban)、[Kanban Tutorial](https://hermes-agent.nousresearch.com/docs/user-guide/features/kanban-tutorial)。

**前置**：已配置多个 [Profile](./configuration-personalization/#profile-隔离多套-agent-状态)；Gateway 常驻时调度最省事。

## Kanban 与 delegate_task：取舍表

| 维度 | `delegate_task` | Kanban |
| --- | --- | --- |
| 形态 | RPC：fork → join | 持久队列 + 状态机 |
| 父会话 | 阻塞直到子 Agent 返回 | create 后可 fire-and-forget |
| 子身份 | 匿名子 Agent | 具名 Profile + 独立记忆 |
| 失败恢复 | 无；失败即失败 | block → unblock → 重派 |
| 人工介入 | 不支持 | comment / unblock 任意时刻 |
| 审计 | 易被上下文压缩吞掉 | SQLite 永久留痕 |
| 协调 | 层级（父 → 子） | 对等：任意 Profile 读写 |

一句话：`delegate_task` 是函数调用；Kanban 是**任何人都能看见和编辑的工作队列**。子工人内部仍可调 `delegate_task`。

## 两个入口，同一数据库

| 入口 | 谁用 | 方式 |
| --- | --- | --- |
| `kanban_*` 工具集 | Agent 工人 | `kanban_show`、`kanban_list`、`kanban_complete`、`kanban_block` 等 |
| `hermes kanban` / `/kanban` / Web Dashboard | 人与脚本 | CLI、Slash、浏览器面板 |

读写都经 `kanban_db` 层，CLI 与工具视图一致。文档示例多用 CLI 便于复制；工人实际用 **tool call**，不会 shell 出 `hermes kanban`。

默认库路径：`~/.hermes/kanban.db`。多项目可用 **boards** 隔离到 `~/.hermes/kanban/boards/<slug>/kanban.db`。

## 卡片状态机（列）

Dashboard 典型六列：

```text
Triage → Todo → Ready → In Progress → Blocked → Done
```

| 列 | 含义 |
| --- | --- |
| Triage | 待分解的原始想法 |
| Todo | 已创建，未分配或未就绪 |
| Ready | 已分配，等待 dispatcher 领取 |
| In Progress | 工人 Profile 正在执行 |
| Blocked | 等人或熔断器触发 |
| Done | 已完成 |

`Blocked` 可写 comment 后 `unblock` 回到 Ready。工人崩溃后 dispatcher 可 **reclaim** Ready 任务。

## 最小路径

```bash
hermes kanban init
hermes gateway start          # 内嵌 dispatcher，默认约 60s tick

hermes kanban create "调研 AI 融资报告" --assignee researcher
hermes kanban list
hermes kanban watch           # 实时活动
```

`config.yaml`：

```yaml
kanban:
  dispatch_in_gateway: true       # 默认：随 Gateway 调度
  dispatch_interval_seconds: 60
```

**勿**同时跑 Gateway 内嵌 dispatcher 与独立 `hermes kanban daemon`（除非 `--force` 旧路径）：会对同一 `kanban.db` **抢任务**。

工人被 spawn 时环境变量 `HERMES_KANBAN_BOARD` 限制可见面板；首个动作通常是 `kanban_show()` 读任务，而非 CLI。

## Workspace 类型

| 类型 | 说明 |
| --- | --- |
| `scratch` | 默认临时目录，适合一次性调研 |
| `dir:/abs/path` | 共享目录；**必须绝对路径**，防 confused-deputy |
| `worktree` | Git worktree，适合并行改码 |

工程流水线常见：分解任务 → 多 worktree 实现 → 审查 Profile → 迭代 → PR。详见官方教程四种用户故事。

## Boards 与租户

- **Board**：硬隔离（独立 DB、workspaces、logs）。`hermes kanban boards create <slug> --switch`。
- **Tenant**：板内软命名空间，便于一套 fleet 服务多业务线。

解析顺序：`--board` 参数 > `HERMES_KANBAN_BOARD` > `~/.hermes/kanban/current` > `default`。

## Web Dashboard

```bash
hermes dashboard
```

默认 `http://127.0.0.1:9119`，Kanban 标签页含看板切换、建卡、归档（非 default 板）。浏览器 `localStorage` 记住当前板，**不会**改掉 CLI 的 `current` 指针，避免终端与浏览器抢状态。

远程 VPS 长跑时，应配合 [安全章](./security-performance-best-practices/#web-dashboard-远程访问) 的绑定地址与鉴权，勿直接 `0.0.0.0` 暴露无认证面板。

## 适用场景与误用

**适合**：

- 研究分流：多 researcher + analyst + writer + 人工 triage
- 定时运维：Cron 建卡，工人 Profile 累积日志
- 数字分身：`inbox-triage`、`ops-review` 等长期角色
- Fleet：一专员管多账号/多服务主题

**不适合**：

- 父 Agent 只需一轮推理摘要（用 `delegate_task`）
- 无 Gateway 且不愿跑 dispatcher 的环境（Ready 卡会堆积）
- 期望 Kanban 替代 Git 分支策略（仍应用 worktree + 人工 review）

## 故障模式

| 现象 | 可能原因 | 处理 |
| --- | --- | --- |
| 任务一直 Ready | Gateway 未运行 | `hermes gateway status` |
| 工人 401 | Profile 未配 Provider | 对该 assignee 跑 `hermes -p <name> model` |
| 重复执行 | 双 dispatcher | 关掉 standalone daemon |
| 跨板看不见任务 | `HERMES_KANBAN_BOARD` 不一致 | `hermes kanban boards show` |
| `dir:../foo` 被拒 | 相对路径不允许 | 改为绝对路径 |

## 动手练习

1. `hermes kanban init`，创建一张 assign 给自己的卡，开 Gateway 观察是否进入 In Progress。
2. 用 `hermes kanban block <id> "需要 API Key"`，再在 Dashboard 或 CLI comment 后 unblock。
3. 对比同一任务用 `delegate_task` 与 Kanban 的会话 token 占用（定性即可）。
4. 打开 `hermes dashboard`，确认列与 CLI `hermes kanban list` 一致。

## 读者自测

- [ ] 说出 Kanban 相对 `delegate_task` 的三个优势。
- [ ] 解释 Gateway 内嵌 dispatcher 与独立 daemon 的风险。
- [ ] 列出三种 workspace 类型及编码场景。
- [ ] 说明 Agent 读任务用工具而非 CLI 的原因。

---

下一章：[高级特性](./advanced-features/)，展开 Voice、浏览器、`execute_code` 与 ACP。
