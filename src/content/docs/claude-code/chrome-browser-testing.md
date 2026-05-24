---
title: Chrome 与 Web UI 测试
description: 连接 Chrome 测 Web 应用、读控制台日志，并了解 voice、status line 等 CLI 体验增强入口。
sidebar:
  order: 31
---

*「Agent 改了前端，我想让它自己打开浏览器点一遍登录流程。」*

[Claude in Chrome](https://code.claude.com/docs/en/chrome)（beta）让 Claude Code 连接 Chrome：打开页面、读控制台、填表、抓数据。VS Code 扩展中可用 `@browser` 配合测试。与「控制整个 macOS 桌面」的 [Computer use](https://code.claude.com/docs/en/computer-use) 不同，Chrome 集成聚焦 **Web**。

---

## 启用与基本流程

1. 安装并登录 Claude Code，使用支持 Chrome 的版本（见官方 chrome 页 Plan 要求）。
2. CLI 中 `/chrome` 配置连接，或按扩展文档启用 `@browser`。
3. 提示词示例：

```text
用浏览器打开 http://localhost:3000/login ，填测试账号，点登录，把控制台 error 列出来。
```

4. 在 diff 审查前对比截图或 DOM 结论。

**边界：** beta 能力、站点登录、2FA 可能需人工介入。勿对生产账号存密码于 prompt。

---

## 与 VS Code `@browser` 的关系

[多平台章](/claude-code/platforms-overview/#vs-code-与-cursor) 中，扩展可把浏览器上下文送进会话。分工：

| 入口 | 场景 |
|------|------|
| CLI + `/chrome` | 终端为主、本地 dev server |
| VS Code `@browser` | 同屏改码 + 看 diff |

---

## Computer use（CLI，macOS）

[Computer use](https://code.claude.com/docs/en/computer-use) 让 Claude 操作 **macOS GUI**（点击、输入、截屏），适合原生应用，不仅是浏览器。风险高于 Chrome：屏幕可见内容多、误点面大。团队应限制启用范围。

---

## 体验增强（CLI）

以下能力不单开章，按需查阅官方页：

| 能力 | 入口 | 文档 |
|------|------|------|
| 语音听写 | `/voice [hold\|tap\|off]` | [Voice dictation](https://code.claude.com/docs/en/voice-dictation) |
| 快速 Opus | `/fast` | [Fast mode](https://code.claude.com/docs/en/fast-mode) |
| 状态栏 | `/statusline` | [Status line](https://code.claude.com/docs/en/statusline) |
| 键位 | 配置文件 | [Keybindings](https://code.claude.com/docs/en/keybindings) |
| 长会话渲染 | 设置 | [Fullscreen](https://code.claude.com/docs/en/fullscreen) |
| 非工程场景 | output style | [Output styles](https://code.claude.com/docs/en/output-styles) |

[Slash 命令](/claude-code/slash-commands/) 表中有对应 `/` 项；配置细节以官方为准。

---

## 失败模式

| 现象 | 可能原因 | 下一步 |
|------|----------|--------|
| 连不上 Chrome | 扩展未装、未授权 | 官方 chrome 故障排除 |
| localhost 打不开 | 服务未启 | 先 `pnpm dev` |
| 误判 UI 通过 | 未看 console | 要求必须贴 error 行 |
| Computer use 误点 | 提示含糊 | 缩小窗口；人工确认 |

---

## 决策边界

**用 Chrome 集成：** Web 应用 E2E 冒烟、前端回归。

**用 Computer use：** 必须操作原生应用、无 Web 接口。

**不用浏览器自动化：** 纯后端、API-only 任务。

---

## 继续读下一章之前

1. Chrome 与 Computer use 范围差异？  
2. 前端任务你如何写验收（console 零 error）？  
3. `/voice` 适合什么场景？

自检：

- [ ] 知道 `/chrome` 与 `@browser` 入口  
- [ ] 读过 chrome 官方 beta 限制  
- [ ] 能说出体验增强官方链接在哪  

---

上一章：[远程会话与 Channels](/claude-code/remote-sessions-channels/) · 下一章：[局限性与应对](/claude-code/limitations/)
