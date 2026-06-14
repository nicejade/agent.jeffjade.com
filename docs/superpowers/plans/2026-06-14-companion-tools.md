# Claude Code 配套工具精选 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 `/claude-code/companion-tools/` 教程章，深度覆盖 CC Switch、git worktree、tmux/zellij、lazygit，附外延对照表；更新 sidebar、order 与 prev/next，使 `pnpm build` 通过。

**Architecture:** 单 Markdown 文件 + `claude-code-sidebar.ts` 插入条目；`sidebar.order` 5 给新章，原 5–7 顺延为 6–8；`third-party-api` 与 `first-session` 更新导航链。正文按「连接 → 隔离 → 编排 → 审阅 → 选型 → 附录」分层，CC Switch 写前查官方文档。

**Tech Stack:** Astro 5、Starlight、`src/config/claude-code-sidebar.ts`、`pnpm build`

**Spec:** `docs/superpowers/specs/2026-06-14-companion-tools-design.md`

---

## File map

| Action | Path |
|--------|------|
| Create | `src/content/docs/claude-code/companion-tools.md` |
| Modify | `src/config/claude-code-sidebar.ts` |
| Modify | `src/content/docs/claude-code/third-party-api.md`（文末下一章） |
| Modify | `src/content/docs/claude-code/first-session.md`（`sidebar.order` + 可选上一章） |
| Modify | `src/content/docs/claude-code/slash-commands.md`（`sidebar.order: 7`） |
| Modify | `src/content/docs/claude-code/platforms-overview.md`（`sidebar.order: 8`） |
| Modify | `docs/superpowers/specs/2026-06-14-companion-tools-design.md`（状态 → 已实现） |

---

### Task 1: 官方资料检索（CC Switch）

**Files:** 无（研究步骤，结果写入 Task 2 正文）

- [ ] **Step 1: 打开官方文档与 changelog**

浏览器或 `WebFetch` 阅读：

- https://ccswitch.io/zh/docs
- https://ccswitch.io/zh/changelog
- https://github.com/farion1231/cc-switch/releases

记录：各平台安装方式、添加 Claude Code 提供商的 UI 路径、切换当前提供商的步骤、`/status` 或 CLI 侧验证信号、与 `~/.claude/settings.json` 的写入关系。

- [ ] **Step 2: 核对 volatile 表述**

正文里凡涉及功能列表、安装命令、配置文件路径，必须与 Step 1 一致；无法确认处写「以 [CC Switch 官方文档](https://ccswitch.io/zh/docs) 为准」。

---

### Task 2: 更新导航与 sidebar order

**Files:**
- Modify: `src/config/claude-code-sidebar.ts`
- Modify: `src/content/docs/claude-code/third-party-api.md`（末段）
- Modify: `src/content/docs/claude-code/first-session.md`
- Modify: `src/content/docs/claude-code/slash-commands.md`
- Modify: `src/content/docs/claude-code/platforms-overview.md`

- [ ] **Step 1: 插入 sidebar 条目**

在 `src/config/claude-code-sidebar.ts` 第二部分，`third-party-api` 与 `first-session` 之间加入：

```ts
{ label: '配套工具精选', link: '/claude-code/companion-tools/' },
```

- [ ] **Step 2: 更新 frontmatter order**

`first-session.md`：

```yaml
sidebar:
  order: 6
```

`slash-commands.md`：

```yaml
sidebar:
  order: 7
```

`platforms-overview.md`：

```yaml
sidebar:
  order: 8
```

- [ ] **Step 3: 修改 third-party-api 文末链接**

将：

```markdown
下一章：[启动你的第一个会话](/claude-code/first-session/)，把本章配置好的环境用起来——我们开始真正和 Claude Code 对话。
```

改为：

```markdown
下一章：[配套工具精选](/claude-code/companion-tools/)——用 CC Switch、worktree 等把 API 配置与会话工作流理顺；再读 [启动你的第一个会话](/claude-code/first-session/)，开始第一次对话。
```

- [ ] **Step 4: 修改 first-session 开篇或文末导航**

在 `first-session.md` 文末「下一章」段之前增加上一章（若尚无）：

```markdown
上一章：[配套工具精选](/claude-code/companion-tools/) · 下一章：[Slash 命令与常用功能](/claude-code/slash-commands/)——把会话控制面板系统过一遍；再读 [代理循环与工具调用](/claude-code/agent-loop/)，理解命令背后的执行机制。
```

删除原单独一行的 `下一章：[Slash 命令…` 避免重复。

- [ ] **Step 5: 验证 grep**

```bash
cd /Users/jade/WorkSpace/agent.jeffjade.com
rg "companion-tools" src/config/claude-code-sidebar.ts src/content/docs/claude-code/third-party-api.md src/content/docs/claude-code/first-session.md
rg "sidebar:" -A1 src/content/docs/claude-code/{first-session,slash-commands,platforms-overview}.md
```

Expected: sidebar 含 `companion-tools`；三文件 order 分别为 6、7、8。

- [ ] **Step 6: Commit**

```bash
git add src/config/claude-code-sidebar.ts \
  src/content/docs/claude-code/third-party-api.md \
  src/content/docs/claude-code/first-session.md \
  src/content/docs/claude-code/slash-commands.md \
  src/content/docs/claude-code/platforms-overview.md
git commit -m "$(cat <<'EOF'
docs(nav): insert companion-tools chapter in quick-start sidebar

Add sidebar entry and bump order for first-session through platforms-overview; link third-party-api to the new chapter.
EOF
)"
```

---

### Task 3: 撰写 `companion-tools.md` 全文

**Files:**
- Create: `src/content/docs/claude-code/companion-tools.md`

- [ ] **Step 1: 创建文件**

将下列全文写入 `src/content/docs/claude-code/companion-tools.md`。Task 1 检索结果若有出入，以官方为准微调 CC Switch 安装小节，其余结构不变。

```markdown
---
title: Claude Code 配套工具精选
description: 从 CC Switch、tmux、worktree 到 lazygit：本机工作流增强、价值、最小用法与选型边界。
sidebar:
  order: 5
---

*「第三方 API 配好了，但换提供商要改三个地方；两个 Claude 会话在同一目录里互相踩改动；终端一关，上下文全丢。」*

[基于第三方 API](/claude-code/third-party-api/) 讲环境变量与网关机制。本章讲**本机配套工具**：把连接、隔离、编排、审阅四层工作流做顺。外延能力如 gh、MCP、CI 见文末对照表，各链到本系列专章。

---

## 本章路由

| 层 | 工具 | 你要解决什么 | 深度 |
|----|------|--------------|------|
| 连接 | [CC Switch](https://ccswitch.io/zh) | 提供商切换、故障转移、MCP/Skills 管理 | 必读 |
| 隔离 | git worktree | 同 repo 多任务并行 | 必读 |
| 编排 | tmux / zellij | 终端持久与分屏 | 终端用户推荐 |
| 审阅 | lazygit | Agent 大 diff 人工把关 | 推荐 |
| 外延 | 见附录表 | gh、MCP、CI、Chrome 等 | 链到专章 |

**动手：** 若你只用 Anthropic 原生 Key 且从不切换提供商，可跳过 CC Switch，直接从 worktree 或 lazygit 读起。

---

## 连接层：CC Switch

[CC Switch](https://ccswitch.io/zh) 是开源桌面应用，统一管理多种 AI 编码 CLI 的工作流，包括 Claude Code。官方能力包括：提供商管理、Local Routing、自动故障转移，以及 MCP、Skills、Prompts、会话与用量统计。源码：[farion1231/cc-switch](https://github.com/farion1231/cc-switch)。

### 带来什么价值

| 痛点 | 手改 `settings.json` | CC Switch |
|------|---------------------|-----------|
| 换 OpenRouter / 备用网关 | 改 env 或 JSON，易漏终端 session | GUI 一键切换当前提供商 |
| 主通道不可用 | 手动改配置、重启终端 | 自动故障转移（以官方文档为准） |
| MCP / Skills 分散在多个文件 | 自己记路径 | 同一界面管理（Claude Code 目标） |

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

预期：`/status` 显示的模型与路由与 CC Switch 当前提供商一致。若仍走旧配置，检查 shell 是否仍 `export ANTHROPIC_*` 覆盖 GUI 写入（见下节）。

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

你在 SSH 远程机或纯终端工作，且希望会话 survives 断开时选其一。

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
| 换 API 麻烦 | CC Switch | — |
| 多任务抢同一目录 | worktree | tmux |
| SSH 易断线 | tmux 或 zellij | lazygit |
| Agent 改动面大 | lazygit | — |

**推荐组合：**

- **最小套装：** CC Switch + worktree + lazygit
- **终端重度：** 上述 + tmux 或 zellij

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

**本机更多候选（各一行）：**

| 工具 | 与 Claude Code 的关系 |
|------|----------------------|
| direnv | 进目录自动加载 env，多 repo 切换时减少 export 遗忘 |
| fzf | 终端 fuzzy 找文件，辅助你自己 `@` 引用前定位路径 |
| just / make | 把 `pnpm test` 等固化；写入 [CLAUDE.md](/claude-code/claude-md/) 供 Agent 引用 |

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

自检：

- [ ] 能说出连接 / 隔离 / 编排 / 审阅四层各对应什么工具
- [ ] 用 CC Switch 或 API 章方式之一验证过 `claude` 路由
- [ ] 至少创建过一个 worktree 或在 lazygit 里按 hunk stage 过一次

---

上一章：[基于第三方 API 使用 Claude Code](/claude-code/third-party-api/) · 下一章：[启动你的第一个 Claude Code 会话](/claude-code/first-session/)——配置与工作流就绪后，开始第一次真正有用的对话。
```

- [ ] **Step 2: 通读 CLAUDE.md 写作约束**

确认全文无 em dash、无括号旁白、无「不是 A 而是 B」句式；表格前有过渡句。

- [ ] **Step 3: Commit**

```bash
git add src/content/docs/claude-code/companion-tools.md
git commit -m "$(cat <<'EOF'
docs: add companion-tools chapter for Claude Code workflow tooling

Cover CC Switch, git worktree, tmux/zellij, and lazygit with selection tables and links to existing integration chapters.
EOF
)"
```

---

### Task 4: 构建验收与 spec 状态

**Files:**
- Modify: `docs/superpowers/specs/2026-06-14-companion-tools-design.md`

- [ ] **Step 1: 运行构建**

```bash
cd /Users/jade/WorkSpace/agent.jeffjade.com
pnpm build
```

Expected: exit 0；无 broken link 警告（Starlight 若报 dead link，修正 companion-tools 内路径）。

- [ ] **Step 2: 可选预览抽查**

```bash
pnpm preview
```

浏览器打开 `/claude-code/companion-tools/`，确认 sidebar 位于「基于第三方 API」与「第一个会话」之间。

- [ ] **Step 3: 更新 spec 状态**

在 `docs/superpowers/specs/2026-06-14-companion-tools-design.md` 将：

```markdown
**状态**：待实现
```

改为：

```markdown
**状态**：已实现（2026-06-14）
```

实现清单 `- [ ]` 全部改为 `- [x]`。

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-06-14-companion-tools-design.md
git commit -m "$(cat <<'EOF'
docs(spec): mark companion-tools design as implemented

Record build verification and completed checklist after shipping the new chapter.
EOF
)"
```

---

## Plan self-review

| Spec 要求 | 对应 Task |
|-----------|-----------|
| 路由 / 标题 / description | Task 3 frontmatter |
| sidebar 插入 + order 5–8 | Task 2 |
| prev/next 链 | Task 2 + Task 3 文末 |
| CC Switch 深度 + 官方来源 | Task 1 + Task 3 §连接层 |
| worktree / tmux / lazygit | Task 3 |
| 选型表 + 附录外延 | Task 3 |
| 失败模式 / 自检 / 决策边界 | Task 3 章末 |
| pnpm build | Task 4 |
| 非目标：不重复 API 矩阵、不写 tmux 全书 | Task 3 已控制篇幅 |

Placeholder 扫描：无 TBD；CC Switch 安装细节以 Task 1 官方检索为准微调。

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-14-companion-tools.md`.

**两种执行方式：**

1. **Subagent-Driven（推荐）** — 每个 Task 派生子代理，任务间 review  
2. **Inline Execution** — 本会话按 Task 1→4 连续执行，检查点处暂停

请选择执行方式；若选 Inline，我将直接开始 Task 1。
