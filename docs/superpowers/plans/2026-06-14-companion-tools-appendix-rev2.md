# Claude Code 配套工具附录扩充 Rev.2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `companion-tools.md` 新增「本机进阶工具一览」双附录结构，插入分类 CLI/MCP 工具表与黄金搭档组合，精简外延专章索引，使 `pnpm build` 通过。

**Architecture:** 仅改单 Markdown 文件；四层核心正文不动。在「选型与组合」与「外延」之间插入新节；更新章首路由表、选型交叉引用、章末自检；外延节删除三行本机候选小表并加回链句。sidebar 与 prev/next 无需改动。

**Tech Stack:** Astro 5、Starlight、`src/content/docs/claude-code/companion-tools.md`、`pnpm build`

**Spec:** `docs/superpowers/specs/2026-06-14-companion-tools-design.md`（Rev.2）

---

## File map

| Action | Path |
|--------|------|
| Modify | `src/content/docs/claude-code/companion-tools.md` |
| Modify | `docs/superpowers/specs/2026-06-14-companion-tools-design.md`（5.2 checklist → 已实现） |

---

### Task 1: 更新章首路由与导语

**Files:**
- Modify: `src/content/docs/claude-code/companion-tools.md:10-24`

- [ ] **Step 1: 更新开篇导语**

将第 10 行：

```markdown
[基于第三方 API](/claude-code/third-party-api/) 讲环境变量与网关机制。本章讲**本机配套工具**：把连接、隔离、编排、审阅四层工作流做顺。外延能力如 gh、MCP、CI 见文末对照表，各链到本系列专章。
```

替换为：

```markdown
[基于第三方 API](/claude-code/third-party-api/) 讲环境变量与网关机制。本章讲**本机配套工具**：把连接、隔离、编排、审阅四层工作流做顺。进阶 CLI 与 MCP 见「本机进阶工具一览」；外延专章索引见文末对照表。
```

- [ ] **Step 2: 路由表增补「进阶」行**

在第 22 行 `| 外延 | 见附录表 | ...` **之前**插入：

```markdown
| 进阶 | 见本机进阶工具一览 | 终端提速、测试闭环、MCP 扩展 | 按需查阅 |
```

并将原外延行改为：

```markdown
| 外延 | 见扩展阅读对照表 | gh、MCP、CI、Chrome 等专章 | 链到专章 |
```

- [ ] **Step 3: 验证路由表行数**

路由表应有 6 行数据：连接、隔离、编排、审阅、进阶、外延。

---

### Task 2: 选型与组合加交叉引用

**Files:**
- Modify: `src/content/docs/claude-code/companion-tools.md:222-226`

- [ ] **Step 1: 在推荐组合后追加一句**

在：

```markdown
- **终端重度：** 上述 + tmux 或 zellij
```

之后、`---` 之前插入：

```markdown

终端重度用户可继续读下节「本机进阶工具一览」，按场景补 fzf、direnv、watchexec 等。
```

---

### Task 3: 插入「本机进阶工具一览」全文

**Files:**
- Modify: `src/content/docs/claude-code/companion-tools.md`（在「选型与组合」节 `---` 之后、「外延」节之前）

- [ ] **Step 1: 插入以下完整 Markdown 块**

在 `## 选型与组合` 节的 closing `---` 与 `## 外延：扩展阅读对照表` 之间，写入：

```markdown
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
```

---

### Task 4: 精简「外延」节

**Files:**
- Modify: `src/content/docs/claude-code/companion-tools.md:229-248`

- [ ] **Step 1: 删除「本机更多候选」块**

删除从 `**本机更多候选，各一行：**` 到三行小表结束的整段（含空行），保留专章索引五列表不变。

- [ ] **Step 2: 节末加回链句**

在五列表之后、`---` 之前插入：

```markdown

本机 CLI 工具清单见上一节「本机进阶工具一览」。
```

---

### Task 5: 更新章末自检

**Files:**
- Modify: `src/content/docs/claude-code/companion-tools.md:272-282`

- [ ] **Step 1: 自检问题增补第 4 题**

在问题 3 之后插入：

```markdown
4. direnv 与 git worktree 如何配合实现环境隔离？
```

- [ ] **Step 2: checkbox 增补一项**

在自检 checkbox 列表末尾追加：

```markdown
- [ ] 在本机进阶表里找到 direnv、watchexec 或一个 MCP server 的最小信号
```

---

### Task 6: 构建验证与 spec 状态

**Files:**
- Modify: `docs/superpowers/specs/2026-06-14-companion-tools-design.md`

- [ ] **Step 1: 运行构建**

```bash
cd /Users/jade/WorkSpace/agent.jeffjade.com && pnpm build
```

Expected: exit 0；无 broken internal link 警告指向 `/claude-code/` 路径。

- [ ] **Step 2: 行数抽查**

```bash
wc -l src/content/docs/claude-code/companion-tools.md
```

Expected: 约 340～370 行。

- [ ] **Step 3: 内容抽查**

```bash
rg "本机进阶工具一览|黄金搭档|优先上手|本机更多候选" src/content/docs/claude-code/companion-tools.md
```

Expected: 命中「本机进阶工具一览」「黄金搭档」「优先上手」；**不**命中「本机更多候选」。

- [ ] **Step 4: 更新 spec 5.2 checklist**

在 `docs/superpowers/specs/2026-06-14-companion-tools-design.md` 将 5.2 全部 `[ ]` 改为 `[x]`，状态行改为「附录扩充 rev.2 已实现」。

- [ ] **Step 5: Commit**

```bash
git add src/content/docs/claude-code/companion-tools.md docs/superpowers/specs/2026-06-14-companion-tools-design.md docs/superpowers/plans/2026-06-14-companion-tools-appendix-rev2.md
git commit -m "$(cat <<'EOF'
docs: expand companion-tools with categorized CLI appendix

Add local advanced tools tables, golden workflow combos, and trim
the external reading section per rev.2 spec.
EOF
)"
```

---

## Spec coverage（自检）

| Spec 要求 | Task |
|-----------|------|
| 路由表增补「进阶」行 | Task 1 |
| 选型交叉引用 | Task 2 |
| 五张场景表 + 黄金搭档 + 优先上手 | Task 3 |
| 外延删三行 + 回链 | Task 4 |
| 自检增补 | Task 5 |
| pnpm build + spec 状态 | Task 6 |

## Placeholder scan

无 TBD / TODO /「implement later」；Task 3 含完整 Markdown 正文。

---

Plan complete and saved to `docs/superpowers/plans/2026-06-14-companion-tools-appendix-rev2.md`.
