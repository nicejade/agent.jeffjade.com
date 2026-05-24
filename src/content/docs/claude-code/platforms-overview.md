---
title: 多平台运行环境全览
description: 在 CLI、VS Code、JetBrains、Desktop 与 Web 之间选对入口，理解 diff、并行会话与 MCP 配置的差异。
sidebar:
  order: 7
---

*「同事用 PyCharm 插件，你在 Cursor 里装扩展，CI 里跑 `claude -p`——它们是不是同一套 Claude Code？」*

是。底层都是同一套代理循环、同一套 `~/.claude/` 状态与 [CLAUDE.md](/claude-code/claude-md/) 记忆；差别在**交互壳层**：有没有图形 diff、能不能并行多 Tab、MCP 能否在 UI 里完整编辑。

官方入口：[Platforms](https://code.claude.com/docs/en/platforms.md)、[VS Code](https://code.claude.com/docs/en/vs-code.md)、[JetBrains](https://code.claude.com/docs/en/jetbrains.md)、[Desktop](https://code.claude.com/docs/en/desktop.md)、[Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web.md)。

---

## 选型矩阵

| 维度 | 终端 CLI | VS Code / Cursor | JetBrains | Desktop | Web (`claude.ai/code`) |
|------|----------|------------------|-----------|---------|------------------------|
| 典型场景 | SSH、脚本、`claude -p` | 日常改码 + diff | IDEA 系用户 | 多会话编排 | 无本地安装、云沙箱 |
| 图形 diff | 依赖 `/ide` 或外部工具 | 内置并排 diff | IDE diff 查看器 | 可视化审阅 | 浏览器内 |
| 完整 `/` 与 Skills | 是 | 子集 | 与 CLI 同会话时大体相同 | 子集 | 以官方为准 |
| MCP 配置编辑 | 完整 | 部分，`/mcp` 管理已有服务 | 同左 | 以官方为准 | 受限 |
| `!` Bash 前缀 | 是 | 否 | 视集成方式 | 否 | 否 |
| 并行多会话 | 多终端 | 多 Tab | 多工具窗口 | **强项** + worktree | 云会话 |
| 与本地仓库 | 直接 | 工作区绑定 | 项目根 | 本地仓库 | 连 GitHub 等 |

**动手：** 先在本机终端跑通 `claude` 与 `/doctor`，再装你日常 IDE 扩展；需要同时开三个互不干扰的任务时，再评估 Desktop 或 [git worktree](https://code.claude.com/docs/en/worktrees)。

组织层集成与 CI 见 [生态深度集成](/claude-code/ecosystem-integration/) 与 [CI/CD 集成](/claude-code/ci-cd-integrations/)。

---

## VS Code 与 Cursor

Anthropic 提供 [Claude Code 扩展](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code)。**Cursor** 等 VS Code 系编辑器可通过扩展市场或 [Open VSX](https://open-vsx.org/extension/Anthropic/claude-code) 安装；无法装扩展时，在集成终端运行 `claude` 即可。

### 前置条件

- VS Code **1.98.0+**
- Anthropic 账号登录，或按 [第三方 API](/claude-code/third-party-api/) 配置提供商
- 扩展内包含 CLI；终端中的 `claude` 与 VS Code **共享** `~/.claude/` 状态目录

### 安装与打开

- 扩展市场搜索 **Claude Code**，或使用 `vscode:extension/anthropic.claude-code`
- 工具栏 **Spark** 图标、Activity Bar、命令面板 `Claude Code: Open in New Tab`、状态栏均可打开
- 首次打开在浏览器完成登录；若 shell 已有 `ANTHROPIC_API_KEY` 仍提示登录，用 `code .` 从终端启动 VS Code 以继承环境变量

### 相对终端的优势

| 能力 | 说明 |
|------|------|
| 并排 diff | 接受/拒绝前可视对比；你在 diff 里手改后 Claude 会被告知 |
| Plan 文档 | Plan 模式计划以 Markdown 打开，可批注后再执行 |
| `@` 与选区 | `Alt+K` / `Option+K` 插入 `@file#L1-10` |
| 多会话 | 多 Tab/多窗口；图标提示待权限或已完成 |
| `@browser` | 配合 [Chrome 集成](/claude-code/chrome-browser-testing/) 测 Web UI |

提示框底部可切换 **default / plan / acceptEdits** 等模式，见 [Plan Mode](/claude-code/plan-mode/)。扩展设置 `claudeCode.initialPermissionMode` 可设默认。

### 扩展 vs CLI

| 能力 | CLI | VS Code 扩展 |
|------|-----|----------------|
| 全部 `/` 命令与 Skills | 是 | 子集 |
| MCP 完整配置 | 是 | 部分 |
| Checkpoint / `/rewind` | 是 | 是 |
| `!` 快速 Bash | 是 | 否 |
| Tab 补全 | 是 | 否 |

**建议：** 日常编码用扩展看 diff；要 `!`、完整 MCP、脚本化时用集成终端 `claude`。外部终端已开 `claude` 时，输入 `/ide` 可连当前工作区。

### 与 GitHub Copilot 共存

Copilot 偏行内补全，Claude Code 偏多文件代理任务。避免两 Agent 同时大改同一文件。

### 常用快捷键

| 操作 | macOS | Windows/Linux |
|------|-------|----------------|
| 编辑器与 Claude 焦点切换 | `Cmd+Esc` | `Ctrl+Esc` |
| 新 Tab 会话 | `Cmd+Shift+Esc` | `Ctrl+Shift+Esc` |
| 插入 @ 引用 | `Option+K` | `Alt+K` |

完整表见 [VS Code commands and shortcuts](https://code.claude.com/docs/en/vs-code#vs-code-commands-and-shortcuts)。

---

## JetBrains 系列

IntelliJ IDEA、PyCharm、WebStorm、GoLand 等通过 [JetBrains 插件](https://plugins.jetbrains.com/plugin/27310-claude-code-beta-) 集成。插件仍在快速迭代，复杂任务可先用终端 CLI，再逐步迁到插件 diff。

### 特性摘要

- `Cmd+Esc` / `Ctrl+Esc` 或工具栏启动
- diff 在 IDE diff 查看器中展示
- 选区/当前标签页自动进上下文
- `Cmd+Option+K` / `Alt+Ctrl+K` 插入 `@path#L1-99`
- Lint/诊断自动分享给 Claude

### 使用方式

在 **IDE 集成终端** 项目根运行 `claude` 即可自动挂钩；外部终端先 `claude` 再 `/ide`。

`/config` 里 diff 工具设为 `auto` 可在 IDE 显示变更。Remote Development 须在**远程主机**安装插件。WSL2 检测失败见官方 [WSL configuration](https://code.claude.com/docs/en/jetbrains#wsl-configuration)。

### 安全提示

自动接受编辑时，Claude 可能改动 IDE 会加载的配置文件。敏感仓库用 **manual approval**，并配合 [权限 deny](/claude-code/security-permissions/) 与 [Hooks](/claude-code/hooks/)。

---

## Claude Code Desktop

[Desktop](https://code.claude.com/docs/en/desktop) 适合图形界面管理**多个本地并行会话**，常与 git worktree 配合。

- [macOS 下载](https://claude.ai/api/desktop/darwin/universal/dmg/latest/redirect)
- Windows：[claude.com/download](https://claude.com/download)

CLI 中 `/desktop`（macOS/Windows）可把当前会话迁到桌面端。Desktop 与 CLI **共享状态文件**，可在终端与桌面间切换。

与 VS Code 扩展的分工：Desktop 偏**会话编排**；深度 diff、与仓库同屏编码仍以 VS Code/JetBrains 或 CLI 为主。团队是否允许 Desktop 取决于 managed settings 与网络策略，见 [生态集成](/claude-code/ecosystem-integration/#企业部署与管理员)。

---

## Web 版（claude.ai/code）

[Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web) 在 Anthropic 云沙箱中运行，适合无本地安装、从浏览器或手机提交任务。可与终端用 `--remote`、`--teleport` 互迁会话，细节见 [远程会话与 Channels](/claude-code/remote-sessions-channels/)。

**限制（发布前对照官方）：** 仅 Bedrock/Vertex/Foundry 凭证时，Web、部分 Code Review、Routines 等可能不可用，需 Teams 等席位。见 [Admin setup](https://code.claude.com/docs/en/admin-setup)。

---

## Neovim、Emacs 与其它编辑器

无官方 GUI 插件时，标准路径是 **终端 + CLI**：

1. 项目根内置终端跑 `claude`
2. 用 [CLAUDE.md](/claude-code/claude-md/) 与 [Skills](/claude-code/skills/) 固化流程
3. 需要 IDE diff 时，在同仓库打开 VS Code/JetBrains 并用 `/ide` 或扩展

tmux 分屏、shell alias（如 `alias cc=claude`）、`claude --print` 脚本化均可在纯终端工作流中使用。

---

## 失败模式

| 症状 | 可能原因 | 下一步 |
|------|----------|--------|
| VS Code 扩展无法登录 | 环境变量未传入 GUI | `code .` 从终端启动或扩展内登录 |
| 扩展与终端会话不一致 | 不同用户目录 | 确认同一 `~/.claude/` |
| JetBrains 检测不到 IDE | 插件未启、WSL 网络 | 官方 JetBrains 故障排除 |
| Desktop 无法连接仓库 | 权限或路径 | 从 CLI 项目根 `/desktop` |
| Web 任务无法启动 | Plan 或 API 提供商限制 | `/status`；查 Admin setup |

---

## 决策边界

**选 VS Code/Cursor 扩展：** 需要图形 diff、Plan 文档批注、多 Tab。

**选 JetBrains 插件：** 团队已统一 IDEA 系，且要 IDE 内 diff。

**选 Desktop：** 要多路并行会话编排，不一定长期开 IDE。

**坚持 CLI：** SSH、无 GUI、要 `!` 与完整 MCP、CI 里 `claude -p`。

**选 Web：** 本机不能装 CLI，或要从手机派任务。

---

## 继续读下一章之前

1. 扩展与 CLI 共享什么目录？各缺哪两项能力？  
2. Desktop 与 VS Code 扩展各擅长什么？  
3. 仅 Bedrock 凭证时，Web 版可能缺什么？

自检：

- [ ] 在常用 IDE 或终端各成功打开过一次 Claude Code  
- [ ] 知道 `/ide` 的作用  
- [ ] 能根据上表为自己选默认入口  

---

上一章：[Slash 命令](/claude-code/slash-commands/) · 下一章：[代理循环与工具调用](/claude-code/agent-loop/)
