---
title: 远程会话与 Channels
description: 用 Remote Control 从浏览器续本地会话，用 Channels 把 CI 与告警事件推入运行中的 Claude Code。
sidebar:
  order: 30
---

*「通勤路上想批准家里终端里跑了一半的会话，同时希望 CI 失败能自动进当前窗口。」*

**Remote Control** 让你从手机或浏览器**继续本地已开的会话**。**Channels** 则把外部事件（CI、监控、聊天）**推入**正在运行的会话。官方：[Remote Control](https://code.claude.com/docs/en/remote-control)、[Channels](https://code.claude.com/docs/en/channels)、[Channels reference](https://code.claude.com/docs/en/channels-reference)。

---

## Remote Control：续写本地会话

在 CLI 中：

```text
/remote-control
```

别名 `/rc`。连接 [claude.ai/code](https://claude.ai/code) 或 Claude 移动应用后，可在外部设备查看进度、回复权限请求。

| 场景 | 做法 |
|------|------|
| 长任务跑着，你离开工位 | 开 Remote Control，手机上批准工具 |
| 从 Web 启动，回本地继续 | `--teleport` / `--remote`，见 [Web 版](/claude-code/platforms-overview/#web-版claudeaicode) |

**边界：** Remote Control 续的是**已有会话**，不是另起一个无状态 API。敏感仓库确认企业是否允许会话出网。

---

## Web 与终端互迁

[Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web) 在云端沙箱执行；与本地互迁见官方 cloud 文档。与 Channels 关系：Web 会话也可配置接收事件，以当前产品为准。

---

## Channels：事件推入会话

Channels 通过 **MCP Server** 声明能力，把 webhook、告警、聊天消息转成会话内通知，Claude 可在你离开时仍**看到**事件并决定是否行动。

| 对比 | Hooks | Channels |
|------|-------|----------|
| 方向 | 工具调用前后拦截 | 外部 → 会话 |
| 确定性 | 高，脚本必跑 | 中，模型选择是否响应 |
| 典型用途 | 格式化、deny | CI 失败、PagerDuty、Slack |

实现自定义 Channel 见 [Channels reference](https://code.claude.com/docs/en/channels-reference)：声明 capability、notification 事件、reply 工具、sender 白名单。

### 最小场景

1. CI 失败 webhook 打到你的 Channel MCP。
2. 本地 `claude` 会话保持打开并订阅 Channel。
3. 终端出现「main 分支测试失败」；你回复「只读查日志并总结」。

与 [MCP](/claude-code/mcp/) 的关系：Channel 是 MCP 的一种**用法**；配置入口可能在 `/mcp` 或专用命令，以版本为准。

---

## 与 Slack 等集成

官方另有 [Claude Code in Slack](https://code.claude.com/docs/en/slack) 等集成；Channels 更偏**通用 webhook 契约**。选型：已在 Slack 全家桶用 Slack 集成；要接自建监控系统用 Channels。

---

## 失败模式

| 现象 | 可能原因 | 下一步 |
|------|----------|--------|
| 手机连不上本地 | 网络或登录 | 重试 `/rc`；查官方 remote-control |
| 事件重复刷屏 | webhook 无去重 | Channel 侧节流 |
| Claude 忽略事件 | 会话已 /clear | 保持会话或写 CLAUDE.md 规则 |
| 误触发写操作 | 权限过宽 | plan 模式 + deny 出站 |

---

## 决策边界

**用 Remote Control：** 人要离开键盘，但会话不能断。

**用 Channels：** 异步事件驱动，愿让模型在事件到达时选择性行动。

**用 Hooks：** 每次 Edit 必须跑脚本，与事件无关。

---

## 继续读下一章之前

1. Remote Control 与新开 Web 任务有何不同？  
2. Channels 与 Hooks 的「方向」差异？  
3. CI 失败更适合 Channel 还是只在 PR 上 `@claude`？

自检：

- [ ] 知道 `/remote-control` 用途  
- [ ] 能解释 Channels 在 MCP 表中的位置  
- [ ] 读过 channels 官方页的产品限制  

---

上一章：[CI/CD 与代码审查集成](/claude-code/ci-cd-integrations/) · 下一章：[Chrome 与 Web UI 测试](/claude-code/chrome-browser-testing/)
