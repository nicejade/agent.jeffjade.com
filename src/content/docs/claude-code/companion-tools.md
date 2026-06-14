---
title: Claude Code 配套工具精选
description: 从 CC Switch、tmux、worktree 到 lazygit：本机工作流增强、价值、最小用法与选型边界。
sidebar:
  order: 5
---

*「第三方 API 配好了，但换提供商要改三个地方；两个 Claude 会话在同一目录里互相踩改动；终端一关，上下文全丢。」*

[基于第三方 API](/claude-code/third-party-api/) 讲环境变量与网关机制。本章讲**本机配套工具**：把连接、隔离、编排、审阅四层工作流做顺。进阶 CLI 与 MCP 见「本机进阶工具一览」；外延专章索引见文末对照表。

---

## 本章路由

| 层 | 工具 | 你要解决什么 | 深度 |
|----|------|--------------|------|
| 连接 | [CC Switch](https://ccswitch.io/zh) | 提供商切换、故障转移、MCP/Skills 管理 | 必读 |
| 隔离 | git worktree | 同 repo 多任务并行 | 必读 |
| 编排 | tmux / zellij | 终端持久与分屏 | 终端用户推荐 |
| 审阅 | lazygit | Agent 大 diff 人工把关 | 推荐 |
| 进阶 | 见本机进阶工具一览 | 终端提速、测试闭环、MCP 扩展 | 按需查阅 |
| 外延 | 见扩展阅读对照表 | gh、MCP、CI、Chrome 等专章 | 链到专章 |

**动手：** 若你只用 Anthropic 原生 Key 且从不切换提供商，可跳过 CC Switch，直接从 worktree 或 lazygit 读起。

---

## 连接层：CC Switch

[CC Switch](https://ccswitch.io/zh) 是开源桌面应用，统一管理多种 AI 编码 CLI 的工作流，包括 Claude Code。官方能力包括：提供商管理、Local Routing、自动故障转移，以及 MCP、Skills、Prompts、会话与用量统计。源码：[farion1231/cc-switch](https://github.com/farion1231/cc-switch)。

### 带来什么价值

| 痛点 | 手改 `settings.json` | CC Switch |
|------|---------------------|-----------|
| 换 OpenRouter / 备用网关 | 改 env 或 JSON，易漏终端 session | GUI 一键切换当前提供商 |
| 主通道不可用 | 手动改配置、重启终端 | 自动故障转移，具体行为以官方文档为准 |
| MCP / Skills 分散在多个文件 | 自己记路径 | 同一界面管理 Claude Code 的配置 |

与 [第三方 API 章](/claude-code/third-party-api/) 的关系：API 章教**机制**；CC Switch 教**产品化管理**。两者可并存：先在 API 章理解 `ANTHROPIC_BASE_URL`，再用 CC Switch 维护多套配置。

### 最小路径

以下步骤以 [CC Switch 官方文档](https://ccswitch.io/zh/docs) 为准；版本更新时安装方式可能变化。

**1. 安装**

从 [GitHub Releases](https://github.com/farion1231/cc-switch/releases) 下载对应 macOS / Windows / Linux 包，按官方说明安装并启动应用。

**2. 添加 Claude Code 提供商**

在 CC Switch 中选择 **Claude Code** 为目标 CLI，新建提供商。字段可与 API 章 OpenRouter 示例对齐，例如：

| 字段 | 示例值 |
|------|--------|
| Base URL | `https://openrouter.ai/api/anthropic` |
| API Key | 你的 OpenRouter Key |

Anthropic 原生 API 则 Base URL 留空或使用官方端点，Key 填 Anthropic Key。

**3. 设为当前提供商**

在列表中将该配置设为**当前**或**启用**。CC Switch 会写入 Claude Code 使用的配置；具体文件路径见官方文档。

**4. 验证**

打开**新**终端，在项目根执行：

```bash
claude
/status
```

预期：`/status` 显示的模型与路由与 CC Switch 当前提供商一致。若仍走旧配置，检查 shell 是否仍 `export ANTHROPIC_*` 覆盖 GUI 写入，见下节。

### 常见坑

**shell 环境变量覆盖 GUI**

若在 `~/.zshrc` 里 `export ANTHROPIC_BASE_URL=...`，可能优先于 CC Switch 写入。排查：

```bash
echo $ANTHROPIC_BASE_URL
echo $ANTHROPIC_API_KEY
```

临时验证可 `unset ANTHROPIC_BASE_URL ANTHROPIC_API_KEY` 后重开终端。长期方案：只保留一处真相，要么 CC Switch 管，要么 shell 管。

**多 CLI 目标**

CC Switch 还支持 Codex、Gemini CLI 等。切换**当前管理的 CLI 目标**后再改提供商，避免改错配置集。

### 决策边界

**适合：** 频繁换提供商、需要备用通道、希望 GUI 管 MCP/Skills。

**不适合：** 企业已下发 managed settings 且禁止本地改配置；单一原生 Key、从不切换，手改 API 章方案更轻。

---

## 隔离层：git worktree

两个 Claude 会话若共用一个工作目录，常见症状是：A 会话改了未提交文件，B 会话 `git checkout` 冲突；或两个 Agent 同时改同一分支。

`git worktree` 在同一仓库下挂多个**独立目录**，各目录可各绑一条分支，各跑一个 `claude`。

### 最小路径

在仓库根：

```bash
git worktree add ../myapp-feature-a -b feature/a
cd ../myapp-feature-a
claude
```

另开终端，在原目录或再 add 一个 worktree：

```bash
git worktree add ../myapp-fix-b -b fix/b
cd ../myapp-fix-b
claude
```

**验证信号：** 在 `../myapp-feature-a` 里创建未提交改动，`../myapp-fix-b` 里 `git status` 应保持干净。

### 清理

任务完成后：

```bash
git worktree remove ../myapp-feature-a
git branch -d feature/a   # 已合并时
```

未 merge 的分支用 `-D` 会丢提交，执行前确认。

### 边界

monorepo 每个 worktree 可能需要各自 `pnpm install`，占磁盘。worktree 不能替代 CI 或 PR review。需要多 Agent 编排见后文 [Agent Teams](/claude-code/agent-teams/)；Desktop 多 Tab 见 [多平台章](/claude-code/platforms-overview/)。

---

## 编排层：tmux 与 zellij

Claude Code CLI 会话在终端里跑。关闭窗口或 SSH 断开时，未绑持久会话的 shell 会结束；长任务输出也不易与编辑器并排查看。

tmux 与 zellij 提供**可 detach 的终端会话**与**分屏布局**。二者对 Claude Code 的价值相同：左编辑、右 `claude`，或上日志、下 Agent。

### 何时用这张表

你在 SSH 远程机或纯终端工作，且希望会话在断开连接后仍可恢复时选其一。

| 维度 | tmux | zellij |
|------|------|--------|
| 生态与教程 | 极成熟 | 较新，默认 UI 更直观 |
| 布局 | 手动 split / 脚本 | 内置 layout、插件 |
| 学习成本 | 需记快捷键 | 底部提示栏友好 |
| 与 Claude Code | 适合长期 CLI 用户 | 适合想快速分屏的用户 |

### tmux 最小示例

```bash
tmux new -s claude-dev
# Ctrl+b %  竖分 |  Ctrl+b "  横分
# 一侧 nvim，一侧 claude
# Ctrl+b d  detach；tmux attach -t claude-dev  恢复
```

### zellij 最小示例

```bash
zellij -s claude-dev
# 内置 split；Ctrl+o 切换 pane
# detach 后 zellij attach claude-dev
```

### 边界

日常用 VS Code / Cursor 扩展看 diff 时，IDE 集成终端 + 扩展往往足够，可不装 tmux。Claude Desktop 多会话用户也可跳过。

---

## 审阅层：lazygit

Agent 一次改十几个文件时，`git diff` 在终端里滚动效率低。lazygit 用 TUI 展示文件树、hunk 级 stage 与 commit。

### 最小路径

安装后于项目根：

```bash
lazygit
```

典型流程：

1. 左侧选 **Unstaged Changes**
2. 选中文件查看 hunk diff
3. 按 hunk 或整文件 **Stage**
4. 写 commit message 并提交

与 Claude 协作：让 Agent 跑完测试后执行 `git status`；**提交前**用 lazygit 人工过一遍 diff，避免误 stage 生成物或密钥。

### 边界

lazygit 是本地提交前审阅，不是 GitHub PR review。团队 gate 见 [CI/CD 与代码审查集成](/claude-code/ci-cd-integrations/)。

---

## 选型与组合

按痛点选工具，不必全装。

| 痛点 | 优先 | 可跳过 |
|------|------|--------|
| 换 API 麻烦 | CC Switch | 无 |
| 多任务抢同一目录 | worktree | tmux |
| SSH 易断线 | tmux 或 zellij | lazygit |
| Agent 改动面大 | lazygit | 无 |

**推荐组合：**

- **最小套装：** CC Switch + worktree + lazygit
- **终端重度：** 上述 + tmux 或 zellij

终端重度用户可继续读下节「本机进阶工具一览」，按场景补 fzf、direnv、watchexec 等。

---

## 本机进阶工具一览

四层核心工具装好后，可按场景补 CLI 与 MCP。本节为索引，安装步骤见各工具官方文档，不写完整教程。

### 终端与 Shell 增强

你在多 worktree、多项目间频繁切换，想少敲路径、少忘 env、快找回历史命令时查这张表。

| 工具 | 与 Claude Code 的关系 | 最小信号 |
|------|----------------------|----------|
| [fzf](https://github.com/junegunn/fzf) | 模糊搜历史命令与文件路径；多 worktree 切换时少敲完整路径 | `Ctrl+R` 或 `fzf` 能列出最近命令 |
| [zoxide](https://github.com/ajeetdsouza/zoxide) | 比 `cd` 更智能的目录跳转；多项目并行时快速进入常用目录 | `z docs` 类短别名能进常用目录 |
| [direnv](https://direnv.net/) | 进目录自动加载/卸载环境变量；每个 worktree 可维护独立 `.envrc` | 进 worktree 目录后 env 与主目录不同 |
| [atuin](https://github.com/atuinhq/atuin) | Shell 历史跨会话、可语义搜索；找回给 Claude 用过的长命令 | `atuin search deploy` 能命中历史 |

### 文件与代码浏览

Claude Code 与 Agent 会频繁搜索、读文件；本机装好下列工具后，你自己审阅 Agent 产出时也更顺手。

| 工具 | 与 Claude Code 的关系 | 最小信号 |
|------|----------------------|----------|
| [ripgrep](https://github.com/BurntSushi/ripgrep)（`rg`） | Claude Code 也会调用；本机安装后大型 monorepo 搜索更快 | `rg "pattern" --files-with-matches` 有结果 |
| [fd](https://github.com/sharkdp/fd) | `find` 的现代替代；Agent 查找文件时受益 | `fd companion-tools` 能定位文件 |
| [bat](https://github.com/sharkdp/bat) | 带语法高亮的 `cat`；审阅 Agent 生成文件更舒适 | `bat companion-tools.md` 有语法高亮 |
| [yazi](https://github.com/sxyazi/yazi) / [ranger](https://github.com/ranger/ranger) | 终端文件管理器；在 tmux pane 常驻，快速预览 Agent 改了哪些文件 | 打开后能浏览 diff 前文件树 |

### 开发流程

你想把测试、lint、PR 留在终端闭环，或把常用命令固化给 Agent 调用时查这张表。

| 工具 | 与 Claude Code 的关系 | 最小信号 |
|------|----------------------|----------|
| [gh](https://cli.github.com/) | 终端创建 PR、review、merge；与 worktree 工作流配合 | `gh pr create` 或 `gh pr list` 正常 |
| [watchexec](https://github.com/watchexec/watchexec) / [entr](https://eradman.com/entrproject/) | 文件变动自动跑测试；Agent 改完代码后结果立刻反馈 | 保存文件后终端自动触发 `pnpm test` 等项目命令 |
| [just](https://github.com/casey/just) | 比 Makefile 更友好的任务入口；写入 [CLAUDE.md](/claude-code/claude-md/) 供 Agent 调用 | `just test` 跑通项目任务 |
| [pre-commit](https://pre-commit.com/) | Git hook 管理；提交前自动格式化、lint | `git commit` 触发 hook 且通过 |

### MCP 生态

配置步骤见 [MCP 协议](/claude-code/mcp/)。此处只列代表 server 与场景；server 源码见 [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) 与 [Playwright MCP](https://github.com/microsoft/playwright-mcp)。

| 代表 | 与 Claude Code 的关系 |
|------|----------------------|
| mcp-server-filesystem | 精细控制 Claude Code 可访问的目录范围 |
| mcp-server-github | 直接操作 Issues、PR、仓库，不限于本地 git |
| mcp-server-postgres / sqlite | 查询 schema、调试 SQL，减少来回粘贴 |
| Playwright MCP | 真实浏览器做 E2E 测试、UI 验证 |

### 可观测性

Agent 跑长任务或你让 Claude 分析日志时，用下列工具同步跟进机器状态与日志解析。

| 工具 | 与 Claude Code 的关系 | 最小信号 |
|------|----------------------|----------|
| [bottom](https://github.com/ClementTsang/bottom) / [htop](https://htop.dev/) | Agent 跑密集任务时监控 CPU、内存，区分模型等待与机器瓶颈 | 任务期间占用率可见 |
| [lnav](https://lnav.org/) | 智能日志查看；与 Claude 分析日志时同步跟进 | `lnav app.log` 能高亮解析 |

### 黄金搭档组合

四层核心工具装好后，可按下面组合叠进 tmux 或 zellij 布局：

```
tmux / zellij
├── pane 1: Claude Code（主力）
├── pane 2: lazygit（随时看 diff）
├── pane 3: watchexec（自动跑测试）
└── pane 4: yazi（文件预览）

git worktree × direnv → 多任务并行，环境隔离
gh CLI × lazygit → PR 全流程不出终端
ripgrep + fzf → Claude Code 搜索提速
just + pre-commit → 标准化任务入口 + 质量守门
MCP servers → Claude Code 直连数据库 / GitHub
```

### 优先上手

若时间有限，建议按此顺序补工具：

1. **direnv** — worktree 必备，环境随目录切换
2. **gh CLI** — 配合 PR 工作流，详读 [CI/CD 与代码审查集成](/claude-code/ci-cd-integrations/)
3. **watchexec** — 自动测试闭环，Agent 改完即验证
4. **项目适配的 MCP server** — 按栈选 database、GitHub 或 Playwright

---

## 外延：扩展阅读对照表

本机四层之外，Claude Code 还可接版本托管、MCP 服务、浏览器测试与组织策略。下表只作索引，步骤见各专章。

| 方向 | 代表工具或能力 | 在本系列深入阅读 |
|------|----------------|------------------|
| 版本托管 / PR | GitHub CLI `gh` | [CI/CD 与代码审查集成](/claude-code/ci-cd-integrations/) |
| 外部服务 | Linear、Sentry 等 MCP | [MCP 协议](/claude-code/mcp/) |
| 浏览器 / UI | Chrome 集成 | [Chrome 与 Web UI 测试](/claude-code/chrome-browser-testing/) |
| 组织策略 | managed settings | [生态深度集成](/claude-code/ecosystem-integration/) |
| IDE 壳层 | VS Code / Cursor 扩展 | [多平台运行环境全览](/claude-code/platforms-overview/) |

本机 CLI 工具清单见上一节「本机进阶工具一览」。

---

## 失败模式

| 症状 | 可能原因 | 下一步 |
|------|----------|--------|
| CC Switch 切换无效 | shell 仍 export `ANTHROPIC_*` | `unset` 或只保留一处配置源 |
| worktree 目录删不掉 | 目录内仍有未提交改动 | 提交或 stash 后再 `git worktree remove` |
| tmux attach 进错项目 | 会话名重复 | `tmux ls`，用项目名作 session 名 |
| lazygit 误提交 `.env` | 全文件 stage | 按 hunk stage；`.gitignore` 与 [权限章](/claude-code/security-permissions/) 对齐 |

---

## 决策边界

**不必装任何本章工具：** 单一 Anthropic 原生 Key、只用 IDE 扩展、单任务单目录，且 Agent 改动你能在 IDE diff 里看完。

**读本机编排：** 本章 + [第一个会话](/claude-code/first-session/)。

**读组织与 CI：** [生态深度集成](/claude-code/ecosystem-integration/) → [CI/CD](/claude-code/ci-cd-integrations/)。

---

## 继续读下一章之前

1. CC Switch 与手改 `settings.json` 各适合什么场景？
2. 两个并行 Claude 任务，worktree 与开两个终端 tab 差在哪？
3. 外延表里 PR 审查应打开哪一章？
4. direnv 与 git worktree 如何配合实现环境隔离？

自检：

- [ ] 能说出连接 / 隔离 / 编排 / 审阅四层各对应什么工具
- [ ] 用 CC Switch 或 API 章方式之一验证过 `claude` 路由
- [ ] 至少创建过一个 worktree 或在 lazygit 里按 hunk stage 过一次
- [ ] 在本机进阶表里找到 direnv、watchexec 或一个 MCP server 的最小信号

---

上一章：[基于第三方 API 使用 Claude Code](/claude-code/third-party-api/) · 下一章：[启动你的第一个 Claude Code 会话](/claude-code/first-session/)。配置与工作流就绪后，开始第一次真正有用的对话。
