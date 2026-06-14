# Claude Code 指南：配套工具精选 — 设计说明

**日期**：2026-06-14  
**状态**：待实现  
**决策摘要**：全景清单（本机工作流 + 外部集成外延）+ 混合深度（5 类核心工具展开 + 附录对照表）；sidebar 插入第二部分「快速上手」，`third-party-api` 与 `first-session` 之间。

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
- **路由图**：四层本机工作流 + 外延附录；标注必读 / 可选 / 链到专章。
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

### 3.7 外延层：扩展阅读对照表（附录，简短）

**外部集成**（每项一行 + 链到本系列专章，不展开命令）：

| 方向 | 代表 | 深入阅读 |
|------|------|----------|
| 版本托管 / PR | GitHub CLI、`gh` | [CI/CD 与代码审查集成](/claude-code/ci-cd-integrations/) |
| 外部服务 | Linear、Sentry 等 MCP | [MCP 协议](/claude-code/mcp/) |
| 浏览器 / UI | Chrome 集成 | [Chrome 与 Web UI 测试](/claude-code/chrome-browser-testing/) |
| 组织策略 | managed settings | [生态深度集成](/claude-code/ecosystem-integration/) |
| IDE 壳层 | VS Code/Cursor 扩展 | [多平台运行环境全览](/claude-code/platforms-overview/) |

**本机类更多候选**（各一行，无深度）：

- direnv：目录级 env 隔离；
- fzf：快速 `@` 文件引用辅助；
- just / make：把 `pnpm test` 等固化为 Claude 可引用命令（链 [CLAUDE.md](/claude-code/claude-md/)）。

### 3.8 章末（对齐系列惯例）

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

**篇幅预期**：正文约 180～250 行（含 CC Switch 深度块）；附录表控制在 30 行内。

---

## 5. 实现清单

- [ ] 新建 `companion-tools.md`
- [ ] 更新 `claude-code-sidebar.ts`
- [ ] 修改 `third-party-api.md` 文末下一章链接
- [ ] 修改 `first-session.md` 上一章链接（若有）
- [ ] 更新 `first-session`、`slash-commands`、`platforms-overview` 的 `sidebar.order`
- [ ] 写前检索 CC Switch docs/changelog
- [ ] `pnpm build` 通过

---

## 6. 非目标

- 不重复 `third-party-api` 提供商矩阵；
- 不写 tmux/zellij/lazygit 完整教程；
- 不把 MCP 服务配置步骤搬进正文（只附录链 MCP 章）；
- 不评测商业闭源工具排名；
- 不在此 spec 阶段改 `index.md` 漫游指南（可选后续：加一句「配 API 后读配套工具」）。

---

## 7. Spec 自检（2026-06-14）

| 检查项 | 结果 |
|--------|------|
| 无 TBD / 占位 | 通过 |
| 架构与章节分工一致 | 通过 |
| 单章可实现 | 通过；order 顺延为机械改动 |
| 歧义 | 已明确 CC Switch 步骤以官方为准；核心工具列表固定为 5 类 |
| 与用户确认一致 | 全景 C + sidebar A + 混合 C + 核心工具用户指定 + 附录 brief_table |

---

**审批记录**：用户在 2026-06-14 对话中确认「整体 OK」。
