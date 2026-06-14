# Claude Code 指南：配套工具精选 — 设计说明

**日期**：2026-06-14（初版）· 2026-06-14（附录扩充 rev.2）  
**状态**：初版已实现；**附录扩充待实现**  
**决策摘要**：全景清单（本机工作流 + 外部集成外延）+ 混合深度（四层核心工具展开 + 双附录）；sidebar 插入第二部分「快速上手」，`third-party-api` 与 `first-session` 之间。

**Rev.2 决策（2026-06-14 批准）**：采用**方案 2（双附录）**——四层正文不动；新增「本机进阶工具一览」分类附录表；「外延：扩展阅读对照表」保留专章索引，删除原三行本机候选小表。

---

## 1. 背景与问题

### 1.1 读者痛点

读者在 [基于第三方 API](/claude-code/third-party-api/) 配好 `ANTHROPIC_BASE_URL` 后，常遇到：

- 换提供商要改多处配置，缺少一键切换与故障转移；
- 多个 Claude 会话在同一工作区互相干扰；
- 终端关闭后会话上下文丢失；
- Agent 大改后纯 `git diff` 难以快速审阅。

现有章节未专门回答「**用什么外部工具把 Claude Code 本机工作流做顺**」：

| 已有章节 | 覆盖 | 本篇边界 |
|----------|------|----------|
| `third-party-api.md` | 手改 env、OpenRouter 等机制 | 本篇讲 CC Switch 等「产品化管理」配置 |
| `platforms-overview.md` | 官方 CLI/IDE/Desktop | 本篇 IDE 仅一句 + 外链，不重复 |
| `ecosystem-integration.md` | 团队/CI/企业三层 | 附录表链过去，正文不展开 |
| `skill-recommendations.md` | 社区 Skill/Plugin | 本篇 CC Switch 管 Skills 是工具能力，不是社区包推荐 |

### 1.2 成功标准

读完本章，读者能够：

1. 按工作流四层（连接 / 隔离 / 编排 / 审阅）选对工具组合；
2. 独立完成 CC Switch 安装与 `claude` 验证；
3. 用 git worktree 开第二个并行 Claude 目录；
4. 用 tmux 或 zellij 搭一个最小「Claude 专用」布局；
5. 用 lazygit 浏览 Agent 批量改动并按 hunk 暂存；
6. 知道 gh、MCP、CI、Chrome 等外延能力应去读哪篇专章。
7. 按场景在本机进阶附录中查到 fzf、direnv、watchexec、MCP server 等与 Claude Code 的配合方式及最小验证信号。
8. 理解黄金搭档组合如何在 tmux/zellij 布局中叠用。

---

## 2. 信息架构

### 2.1 元数据

| 项 | 值 |
|----|-----|
| 文件 | `src/content/docs/claude-code/companion-tools.md` |
| 路由 | `/claude-code/companion-tools/` |
| 标题 | Claude Code 配套工具精选 |
| description | 从 CC Switch、tmux、worktree 到 lazygit：本机工作流增强、价值、最小用法与选型边界 |
| sidebar 分组 | 第二部分 · 快速上手 |
| `sidebar.order` | `5` |

### 2.2 Sidebar 与 order 顺延

当前第二部分 order：

| order | 章节 |
|-------|------|
| 3 | installation-setup |
| 4 | third-party-api |
| 5 | first-session → **改为 6** |
| 6 | slash-commands → **改为 7** |
| 7 | platforms-overview → **改为 8** |

新增 `companion-tools` 占 **order 5**。

`src/config/claude-code-sidebar.ts` 在 `third-party-api` 与 `first-session` 之间插入：

```ts
{ label: '配套工具精选', link: '/claude-code/companion-tools/' },
```

### 2.3 Prev/Next 链

| 文件 | 上一章 | 下一章 |
|------|--------|--------|
| `third-party-api.md` | installation-setup | **companion-tools**（改） |
| `companion-tools.md`（新） | third-party-api | first-session |
| `first-session.md` | **companion-tools**（改） | slash-commands |

其余第二部分章节 prev/next 若文内硬编码，需核对；Starlight 主要靠 `sidebar.order`。

---

## 3. 正文结构

### 3.1 章首

- **开场场景**：API 配好后的四类摩擦（换提供商、多会话抢工作区、终端断线、大 diff 难 review）。
- **路由图**：四层本机工作流 + 本机进阶附录 + 外延专章索引；标注必读 / 可选 / 按需查阅 / 链到专章。
- **路由表增补一行**：`进阶 | 见本机进阶工具一览 | 终端提速、测试闭环、MCP 扩展 | 按需查阅`。
- **与 API 章关系**：机制读 `third-party-api`，工具化读本章。

### 3.2 连接层：CC Switch（最深）

**来源**：[ccswitch.io](https://ccswitch.io/zh)、[GitHub farion1231/cc-switch](https://github.com/farion1231/cc-switch)。写前查 [官方文档](https://ccswitch.io/zh/docs) 与 [changelog](https://ccswitch.io/zh/changelog)。

**价值（需与官方表述对齐后写正文）**：

- 多 AI 编码 CLI 的提供商统一管理（含 Claude Code）；
- 一键切换、`Local Routing`、自动故障转移；
- 集中管理 MCP、Skills、Prompts、会话与用量统计。

**最小路径**（实现时逐步写，以官方为准）：

1. 安装（macOS/Windows/Linux，链到 releases）；
2. 添加提供商（可复用 API 章已有 OpenRouter 等示例字段）；
3. 设为当前提供方；
4. 新终端运行 `claude`，`/status` 或等价信号确认路由生效。

**与 `third-party-api` 的分工**：

- API 章：手改 `~/.claude/settings.json` 的 `env`；
- 本篇：CC Switch 写回同类配置时的优先级与冲突（shell `export` vs GUI 管理）。

**常见坑**：

- 环境变量与 CC Switch 写入互相覆盖；
- 多 CLI 工具（Codex、Gemini CLI 等）并存时的当前目标选择（一句边界，不展开其它 CLI 教程）。

**决策边界**：

- 适合：频繁换提供商、要故障转移、想 GUI 管 MCP/Skills；
- 不适合：企业统一 managed settings 已下发、只需单一 Anthropic 原生 Key 且从不切换。

### 3.3 隔离层：git worktree

**价值**：多目录并行多 Claude 任务，减少分支切换与未提交改动互踩。

**最小路径**：

```bash
git worktree add ../myproject-feature-a -b feature/a
cd ../myproject-feature-a && claude
```

**验证信号**：两个目录各跑 `claude`，`git status` 互不影响（同一 repo 不同 path）。

**边界**：

- monorepo 每 worktree 可能需重复装依赖；
- 不能替代 CI 或 PR review；
- 与 [Agent Teams](/claude-code/agent-teams/)、Desktop 多会话：一句对比，详读链后文。

### 3.4 编排层：tmux 与 zellij

**价值**：会话持久、分屏（编辑器 + Claude + 测试输出）、SSH 远程不断线。

**对比表**（正文一张小表即可）：

| 维度 | tmux | zellij |
|------|------|--------|
| 生态与资料 | 成熟 | 较新 |
| 布局配置 | 传统 | 内置 layout 友好 |
| 与 Claude Code | 均适合终端 CLI 用户 | 同左 |

**最小路径**：一个「window：左编辑 / 右 claude」或 zellij 默认 layout 启动示例；**不**写成完整 tmux 教程。

**边界**：IDE 扩展 + 图形 diff 用户可跳过；Desktop 多 Tab 用户可跳过。

### 3.5 审阅层：lazygit

**价值**：Agent 改多文件时，文件树 + hunk 级 stage 比纯 CLI diff 更快。

**最小路径**：项目根 `lazygit` → 查看 unstaged → 按 hunk stage → commit message。

**与 Claude 协作**：Agent 跑完 `git status` 后人工 lazygit 把关；强调「提交前必人审」。

**边界**：非 PR review 替代；团队 gate 见 [CI/CD](/claude-code/ci-cd-integrations/)。

### 3.6 选型与组合

**决策表**（正文）：

| 痛点 | 优先 | 可跳过 |
|------|------|--------|
| 换 API 麻烦 | CC Switch | — |
| 多任务同 repo | worktree | tmux |
| SSH 易断 | tmux/zellij | lazygit |
| Agent 大 diff | lazygit | — |

**推荐组合**：

- 最小套装：CC Switch + worktree + lazygit；
- 终端重度：上述 + tmux 或 zellij。
- **交叉引用（rev.2）**：推荐组合段末加一句，指向「本机进阶工具一览」，供终端重度用户补 fzf、direnv、watchexec 等。

### 3.7 本机进阶工具一览（rev.2 新增，分类附录）

**位置**：「选型与组合」之后、「外延：扩展阅读对照表」之前。

**导读**：四层核心工具装好后，可按场景补 CLI 与 MCP；本节为索引，不写安装教程。

**表结构（五张场景表统一三列）**：

| 列 | 说明 |
|----|------|
| 工具 | 名称 + 官方链接 |
| 与 Claude Code 的关系 | 1～2 句可观察行为 |
| 最小信号 | 装好后一条验证命令或场景 |

每张表前各有一句「何时查这张表」。

**3.7.1 终端与 Shell 增强**

| 工具 | 关系要点 | 最小信号 |
|------|----------|----------|
| [fzf](https://github.com/junegunn/fzf) | 模糊搜历史命令、文件路径；多 worktree 切换时少敲路径 | `Ctrl+R` 或 `fzf` 能列出最近命令 |
| [zoxide](https://github.com/ajeetdsouza/zoxide) | 智能 `cd`，多项目并行时快速跳转 | `z docs` 类短别名能进常用目录 |
| [direnv](https://direnv.net/) | 进目录自动加载/卸载 env；每个 worktree 独立 `.envrc` | 进 worktree 目录后 env 与主目录不同 |
| [atuin](https://github.com/atuinhq/atuin) | Shell 历史跨会话、可语义搜索；找回给 Claude 用过的长命令 | `atuin search deploy` 能命中历史 |

**3.7.2 文件与代码浏览**

| 工具 | 关系要点 | 最小信号 |
|------|----------|----------|
| [ripgrep](https://github.com/BurntSushi/ripgrep) (`rg`) | Claude Code 也会调用；本机安装后大型 monorepo 搜索更快 | `rg "pattern" --files-with-matches` 有结果 |
| [fd](https://github.com/sharkdp/fd) | `find` 的现代替代；Agent 找文件时受益 | `fd companion-tools` 能定位文件 |
| [bat](https://github.com/sharkdp/bat) | 带高亮的 `cat`；审阅 Agent 生成文件更舒适 | `bat companion-tools.md` 有语法高亮 |
| [yazi](https://github.com/sxyazi/yazi) / [ranger](https://github.com/ranger/ranger) | 终端文件管理器；tmux pane 常驻，快速看 Agent 改了哪些文件 | 打开后能预览 diff 前文件树 |

**3.7.3 开发流程**

| 工具 | 关系要点 | 最小信号 |
|------|----------|----------|
| [gh](https://cli.github.com/) | 终端创建 PR、review、merge；与 worktree 工作流配合 | `gh pr create` 或 `gh pr list` 正常 |
| [watchexec](https://github.com/watchexec/watchexec) / [entr](https://eradman.com/entrproject/) | 文件变动自动跑测试；Agent 改完即反馈 | 保存文件后终端自动触发测试 |
| [just](https://github.com/casey/just) | 比 Makefile 友好的任务入口；写入 [CLAUDE.md](/claude-code/claude-md/) 供 Agent 调用 | `just test` 跑通项目任务 |
| [pre-commit](https://pre-commit.com/) | 提交前自动格式化、lint | `git commit` 触发 hook 且通过 |

**3.7.4 MCP 生态**

表前说明：配置步骤见 [MCP 协议章](/claude-code/mcp/)，此处只列场景与代表 server（[modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)、[Playwright MCP](https://github.com/microsoft/playwright-mcp)）。

| 代表 | 与 Claude Code 的关系 |
|------|----------------------|
| mcp-server-filesystem | 精细控制 Claude Code 可访问目录 |
| mcp-server-github | 直接操作 Issues、PR、仓库，不限于本地 git |
| mcp-server-postgres / sqlite | 查 schema、调试 SQL，少来回粘贴 |
| Playwright MCP | 真实浏览器做 E2E、UI 验证 |

**3.7.5 可观测性**

| 工具 | 关系要点 | 最小信号 |
|------|----------|----------|
| [bottom](https://github.com/ClementTsang/bottom) / [htop](https://htop.dev/) | Agent 跑密集任务时看 CPU/内存 | 任务期间占用率可见 |
| [lnav](https://lnav.org/) | 智能日志查看；与 Claude 分析日志同步跟进 | `lnav app.log` 能高亮解析 |

**3.7.6 黄金搭档组合**

树前一句：「四层核心工具装好后，可按下面组合叠进 tmux/zellij 布局。」

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

**3.7.7 优先上手**

独立小段，四条 bullet：

1. **direnv** — worktree 必备，环境随目录切换
2. **gh CLI** — 配合 PR 工作流，详读链 [CI/CD 章](/claude-code/ci-cd-integrations/)
3. **watchexec** — 自动测试闭环，Agent 改完即验证
4. **项目适配的 MCP server** — 按栈选 database / GitHub / Playwright

**去重规则（rev.2）**：

- `gh`：本机进阶表写工具价值；外延表保留一行并链 CI/CD 章
- `direnv` / `fzf` / `just`：从外延「本机更多候选」移除，完整条目在本节分类表
- `MCP`：本节列代表 server 与场景；外延表保留「链到 MCP 章」索引行

### 3.8 外延层：扩展阅读对照表（专章索引，rev.2 精简）

**外部集成**（每项一行 + 链到本系列专章，不展开命令）：

| 方向 | 代表 | 深入阅读 |
|------|------|----------|
| 版本托管 / PR | GitHub CLI、`gh` | [CI/CD 与代码审查集成](/claude-code/ci-cd-integrations/) |
| 外部服务 | Linear、Sentry 等 MCP | [MCP 协议](/claude-code/mcp/) |
| 浏览器 / UI | Chrome 集成 | [Chrome 与 Web UI 测试](/claude-code/chrome-browser-testing/) |
| 组织策略 | managed settings | [生态深度集成](/claude-code/ecosystem-integration/) |
| IDE 壳层 | VS Code/Cursor 扩展 | [多平台运行环境全览](/claude-code/platforms-overview/) |

**节末（rev.2）**：加一句「本机 CLI 工具清单见上一节。」

~~**本机类更多候选**（rev.1，已删除）~~：direnv、fzf、just 已迁入 3.7。

### 3.9 章末（对齐系列惯例）

- **失败模式**：CC Switch 与 shell env 冲突；worktree 忘 merge 清理；tmux 会话 attach 错项目；lazygit 误 stage 全文件。
- **决策边界**：何时不必装任何配套工具（单一原生 API + IDE 扩展足够）。
- **苏格拉底式自检**：3 个问题 + checkbox 清单。
- **导航**：上一章 third-party-api · 下一章 first-session。

---

## 4. 写作与质量约束

遵循 `CLAUDE.md`：

1. 正文简体中文，中文标点；
2. CC Switch 功能与安装步骤写前 **Web 查官方**； volatile 处注明「以官方文档为准」；
3. 命令可复制、有预期输出或验证信号；
4. 不用 em dash、不用括号旁白、不用「不是 A 而是 B」句式；
5.  risky 命令（如覆盖全局 git 配置）若有则标注；
6. 表格前有一句「何时用这张表」。

**篇幅预期（rev.1）**：正文约 180～250 行（含 CC Switch 深度块）；附录表控制在 30 行内。

**篇幅预期（rev.2）**：四层正文不变；新增本机进阶附录约 70～85 行；全文约 350 行。

---

## 5. 实现清单

### 5.1 初版（已完成）

- [x] 新建 `companion-tools.md`
- [x] 更新 `claude-code-sidebar.ts`
- [x] 修改 `third-party-api.md` 文末下一章链接
- [x] 修改 `first-session.md` 上一章链接（若有）
- [x] 更新 `first-session`、`slash-commands`、`platforms-overview` 的 `sidebar.order`
- [x] 写前检索 CC Switch docs/changelog
- [x] `pnpm build` 通过

### 5.2 附录扩充 rev.2（待实现）

- [ ] 更新章首「本章路由」表，增补「进阶」行
- [ ] 「选型与组合」段末加交叉引用至本机进阶节
- [ ] 新增「本机进阶工具一览」：五张场景表 + 黄金搭档 + 优先上手
- [ ] 精简「外延」节：删除三行本机候选表，节末加回链句
- [ ] 自检清单可增补一题：能说出 direnv + worktree 的配合
- [ ] `pnpm build` 通过

---

## 6. 非目标

- 不重复 `third-party-api` 提供商矩阵；
- 不写 tmux/zellij/lazygit 完整教程；
- 不把 MCP 服务配置步骤搬进正文（只附录链 MCP 章）；
- 不评测商业闭源工具排名；
- 不在此 spec 阶段改 `index.md` 漫游指南（可选后续：加一句「配 API 后读配套工具」）。

**Rev.2 追加非目标**：

- 不写 fzf、direnv、watchexec 等进阶工具的安装教程；
- 不把 MCP server 配置步骤搬进 3.7 分类表；
- 不重复 CI/CD、MCP 专章正文。

---

## 7. Spec 自检

### 7.1 初版（2026-06-14）

| 检查项 | 结果 |
|--------|------|
| 无 TBD / 占位 | 通过 |
| 架构与章节分工一致 | 通过 |
| 单章可实现 | 通过；order 顺延为机械改动 |
| 歧义 | 已明确 CC Switch 步骤以官方为准；核心工具列表固定为四层 |
| 与用户确认一致 | 全景 C + sidebar A + 混合 C + 核心工具用户指定 + 附录 brief_table |

### 7.2 Rev.2（2026-06-14）

| 检查项 | 结果 |
|--------|------|
| 无 TBD / 占位 | 通过 |
| 架构与 3.1～3.9 一致 | 通过；双附录边界清晰 |
| 单章可实现 | 通过；仅改 `companion-tools.md` |
| 歧义 | gh/MCP 去重规则已写；MCP 表两列、其余三列 |
| 与用户确认一致 | 方案 2 + 分类附录 A + 三节设计全部批准 |

---

**审批记录**：

- 2026-06-14：初版「整体 OK」
- 2026-06-14 rev.2：用户确认「符合预期，采取方案 2」；三节设计「批准」
