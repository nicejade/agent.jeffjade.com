# Claude Code 指南：第五部分 Plugins 章与 skill-catalog 优化 — 设计说明

**日期**：2026-05-22  
**状态**：待实现  
**用户确认**：2026-05-22 — 推荐范围 **B**；信息架构方案 **1**；四节设计全部通过  

**目标**：第五部分新增独立 Plugins 机制章；第六部分 `skill-catalog` 纠错并纳入 `anthropics/skills`、`garrytan/gstack`；全站 33 → 34 章，sidebar 与 prev/next 一致。

---

## 1. 背景与问题

- 第五部分仅有 Hooks、Skills、SubAgents、MCP，**缺少 Plugin 作为分发层的系统讲解**。
- Plugin 内容分散在 `skills.md`（单行「插件分发」）、`skill-recommendations`、`skill-catalog`；`ecosystem-integration.md` 将 `/plugins` 误链到 MCP 章。
- `skill-catalog` 未覆盖 **anthropics/skills**、**gstack**；读者易把 gstack 当成 `/plugin install` 市场包。
- 2026-05-21 skill 部分设计已实现第六部分三分工，但 **未** 落地 `skills-authoring.md`；本轮 **不** 新建该章。

**官方依据（实现前再核对 volatile 细节）：**

- [Discover and install plugins](https://code.claude.com/docs/en/discover-plugins)
- [Plugins](https://code.claude.com/docs/en/plugins)
- [Claude Code Setup](https://claude.com/plugins/claude-code-setup)
- [anthropics/skills README](https://github.com/anthropics/skills)
- [garrytan/gstack README](https://github.com/garrytan/gstack)

---

## 2. 信息架构（方案 1）

### 2.1 部分与章节

| 部分 | 变化 |
|------|------|
| 第五部分 · 高级扩展 | 4 章 → **5 章**；新增 `plugins.md` |
| 第六部分 · Skill 体系 | 三章职责不变；`skill-catalog` 增补与纠错 |
| 全站 | **33 → 34 章** |

**第五部分阅读顺序：**

```
Hooks → Skills → Plugins → SubAgents → MCP → skill-recommendations（第六部分入口）
```

**不在本轮：** 新建 `skills-authoring.md`；把 `skill-recommendations` 三篇长文迁入第五部分。

### 2.2 Sidebar 与 `sidebar.order`

| 文件 | order | 部分 |
|------|-------|------|
| hooks.md | 13 | 五 |
| skills.md | 14 | 五 |
| **plugins.md**（新建） | **15** | 五 |
| subagents.md | 16 | 五 |
| mcp.md | 17 | 五 |
| skill-recommendations.md | 18 | 六 |
| skill-catalog.md | 19 | 六 |
| skills-team-playbook.md | 20 | 六 |
| context-management.md 及第七部分起 | 21+ | 原 17+ 各 **+1** |

**需同步文件：**

- `src/config/claude-code-sidebar.ts` — 第五部分插入「Plugins 插件」
- `src/content/docs/claude-code/index.md` — 第五部分列表 + 章节编号 14–18 / 19–21 顺延
- `src/pages/claude-code/index.astro` — `parts` 数组与 `n` 编号
- `README.md` — 若仍写 33 章则改为 34

### 2.3 prev/next 链（全站线性）

| 文件 | 上一章 | 下一章 |
|------|--------|--------|
| skills.md | hooks | **plugins** |
| **plugins.md**（新） | skills | subagents |
| subagents.md | **plugins** | mcp |
| mcp.md | subagents | skill-recommendations |
| hooks.md | memory-team-playbook | skills（不变） |
| skill-recommendations.md | mcp | skill-catalog（不变） |

实现时 grep 全站 `claude-code/` 内硬编码 prev/next 与「第五部分」「33 章」表述一并更新。

---

## 3. 新建 `plugins.md` 内容边界（~180–220 行）

**slug：** `/claude-code/plugins/`  
**title：** Plugins：通过市场扩展 Claude Code  
**description：** 理解 Plugin 与 marketplace 的安装模型，区分 Plugin、Skill、Hook、SubAgent、MCP，并选型官方与社区高价值扩展。

### 3.1 章节结构

1. **开篇场景** — 希望一键获得 GitHub MCP、审查技能、LSP，而非五处手配。
2. **Plugin 是什么** — marketplace 两步（register catalog → install plugin）；官方 `claude-plugins-official` 默认可 Discover。
3. **与 Skill / Hook / SubAgent / MCP 对比表** — Plugin = **分发包**（可捆绑 skills、hooks、agents、MCP、commands）；其余维度与现有 hooks/skills/mcp 章一致，避免重复机制长文。
4. **安装最小路径** — `/plugin` Discover；`/plugin install <name>@<marketplace>`；`/plugin marketplace add owner/repo`；`/plugin marketplace update` 刷新官方市场。
5. **推荐 Plugins（B 范围）** — 下表；**不维护全量清单**，脚注链官方 Discover。
6. **社区扩展（短节）** — Superpowers、anthropics/skills、gstack；**明确 gstack 非 Plugin**。
7. **失败模式** — 市场过期、LSP binary 缺失、`/doctor` 描述预算、Plugin 重名（superpowers#355）。
8. **决策边界** — Plugin vs 复制 `.claude/skills/` vs CLAUDE.md only。
9. **章末自检** — 2～3 题。
10. **交叉链接** — 下一章 SubAgents；第六部分 skill-recommendations / skill-catalog。

### 3.2 推荐 Plugins 表（章内）

| 插件 / 来源 | 何时装 | 安装要点 |
|-------------|--------|----------|
| [Claude Code Setup](https://claude.com/plugins/claude-code-setup) | 新项目不知配什么自动化 | 只读分析代码库；提示如 “recommend automations for this project”；推荐 hooks/skills/MCP/subagents |
| Code intelligence（如 `typescript-lsp`） | 跳转定义、编辑后类型诊断 | 需本机 language server；Errors 见 `/plugin` |
| `github` 等外部集成 | 少粘贴 PR/Issue | `github@claude-plugins-official`（以 Discover 为准） |
| Frontend Design / Code Review / Context7 | UI、PR 审查、实时文档 | Anthropic Verified；条目以 [claude.com/plugins](https://claude.com/plugins) 为准 |
| [Superpowers](https://github.com/obra/superpowers) | 端到端交付方法论 | 详装见 [skill-recommendations](/claude-code/skill-recommendations/) |
| [anthropics/skills](https://github.com/anthropics/skills) | 官方范例与 document-skills | `plugin marketplace add anthropics/skills` → `document-skills@anthropic-agent-skills` 或 `example-skills@anthropic-agent-skills` |
| [gstack](https://github.com/garrytan/gstack) | 角色化 slash 工作流（CEO/QA/ship 等） | **非 Plugin**：`git clone` → `~/.claude/skills/gstack` + `./setup`；团队模式见仓库 README |

### 3.3 `skills.md` 调整

- 「插件分发」小节压缩为 2～3 句 + 链到 [Plugins](/claude-code/plugins/)。
- 「Skills、Hooks、SubAgents 如何分工」表可增加 Plugin 行，或链 plugins 章对比表，避免两处大表完全重复。

---

## 4. `skill-catalog.md` 优化

### 4.1 纠错与统一

1. **安装形态三元说明**（置于「如何自己发现」后）：
   - **Plugin 市场**：`/plugin marketplace add` + `/plugin install`
   - **anthropics/skills 市场**：`anthropic-agent-skills` 下的 `document-skills` / `example-skills`
   - **目录克隆**：`~/.claude/skills/`（**gstack**），禁止写成 plugin install
2. **命令表述**与 [Discover plugins](https://code.claude.com/docs/en/discover-plugins) 对齐；不出现单独 `@claude-plugins-official` 作为 install 目标的误导写法。
3. **与 skill-recommendations 去重**：Superpowers / Karpathy / UI UX 仅保留分类行 + 链精选章，不复制安装长文。

### 4.2 新增分类（代表项 + 外链）

| 分类 | 代表 | 说明 |
|------|------|------|
| 官方技能范例库 | anthropics/skills | document-skills、example-skills；链 plugins 章 |
| 全栈角色化工作流 | garrytan/gstack | 23+ slash；目录安装；链 plugins 章 gstack 小节 |
| （可选一行）官方工作流 Plugin | commit-commands、pr-review-toolkit | Discover development workflows；不扩写 |

### 4.3 保留原则

- 本站 **不维护** 50+ 行全量 Plugin 表（延续 2026-05-21 设计）。
- 分类导读 + 代表项 + 官方 Discover 四维选型框架。

---

## 5. 横切改动

| 文件 | 改动 |
|------|------|
| `skill-recommendations.md` | 文首加一句：Plugin 机制见 [Plugins](/claude-code/plugins/) |
| `mcp.md` | 补一句：许多 MCP 可通过官方 Plugin 预配置，见 Plugins 章 |
| `ecosystem-integration.md` | `/plugins` 链到 `plugins.md` 而非 `mcp.md` |
| `index.md` | 第五部分 5 条；总章数 34；阅读路径提及 Plugins |
| `claude-code/index.astro` | 插入 Plugins 卡片，后续 `n` +1 |

**不重写：** `skill-recommendations.md` 正文安装步骤。

---

## 6. 写作与质量约束

- 正文简体中文；volatile 声明链官方文档。
- 区分 **已验证事实** / **推荐** / **推断**。
- 风险命令：`plugin install`、gstack `git clone`、marketplace add — 配信任来源与回滚提示。
- 遵守 `CLAUDE.md` 写作规范：无 em dash、无二元对比句、无省略号、无括号旁注。

---

## 7. 验证

```bash
pnpm build
```

- 34 章在 index 与落地页编号连续。
- 抽查 `/claude-code/plugins/` 构建产物存在。
- prev/next 从 memory-team-playbook → hooks → skills → plugins → subagents → mcp → skill-recommendations 可走通。

---

## 8. 实现范围外（YAGNI）

- `skills-authoring.md` 拆分
- 站内全量 Plugin 清单或自动抓取 claude.com/plugins
- 把 Superpowers/Karpathy 长文迁入 plugins 章
- Hermes Agent 文档

---

## 9. 实现顺序建议（供 writing-plans 使用）

1. 新建 `plugins.md`（frontmatter order 15）+ sidebar/index/astro
2. 批量调整 `sidebar.order` 21+ 与 prev/next
3. 精简 `skills.md` Plugin 提及并链新章
4. 改写 `skill-catalog.md`（三元表 + 新分类 + 纠错）
5. 横切 `skill-recommendations`、`mcp`、`ecosystem-integration`、`index.md`
6. `pnpm build` 与链接抽查

---

## 10. Spec 自检（2026-05-22）

| 检查项 | 结果 |
|--------|------|
| Placeholder / TBD | 无 |
| 内部矛盾 | 方案 1 顺序与 order 表一致；gstack 仅目录安装 |
| 范围 | 单实现计划可覆盖；不含 skills-authoring |
| 歧义 | B 范围已表格式锁定；官方插件名实现时以 Discover 再核对 |
