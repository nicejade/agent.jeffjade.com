# Claude Code 指南：独立「Skill 体系」部分 — 设计说明

**日期**：2026-05-21  
**状态**：已实现（2026-05-21）  
**修订**：2026-05-21 — 插入第六部分，原第六～九部分顺延为第七～十部分  
**目标读者成功标准（C）**：读完本部分能为自己团队写出可触发、可 review、可入库的 `SKILL.md`，并知道何时参考社区包、何时只借模式而不整包安装。

---

## 1. 背景与问题

- 现有 `skills.md`（机制）与 `skill-recommendations.md`（社区推荐 + Superpowers 长文 + 启发）挤在「第五部分 · 高级扩展」。
- `skill-recommendations.md` 约 290 行，Superpowers 占过半；「作用 / 使用 / 启发」与「安装说明书」混在一章。
- `skills.md` 与 `skill-recommendations.md` 的 `sidebar.order` 均为 `9`，可能影响 Starlight 自动 prev/next。
- 用户要求：新开独立部分；五章分工；终点是自建团队 Skill；社区「批发」采用 **B（分类导读 + 代表项 + 外链发现）**。

---

## 2. 信息架构

### 2.1 部分重排（sidebar + index.md）

| 原部分 | 新部分 |
|--------|--------|
| 第一～四部分 | 不变 |
| **第五部分 · 高级扩展** | **保持不变**（仅 Hooks、SubAgents、MCP；**移出** Skills / Skill 推荐） |
| （无） | **第六部分 · Skill 体系**（新建，5 章，终点 = 团队 playbook） |
| 原第六部分 · 实战与最佳实践 | **第七部分** |
| 原第七部分 · 反思与进阶 | **第八部分** |
| 原第八部分 · 进阶实践 | **第九部分** |
| 原第九部分 · 排障速查 | **第十部分** |

**第五部分 · 高级扩展**（sidebar 顺序不变，条目精简为 3 篇）：

1. Hooks  
2. SubAgents  
3. MCP  

**第六部分 · Skill 体系**（sidebar 新建分组，5 篇）：

1. Skill 的作用与边界  
2. 编写与调试 Skill  
3. 编码向社区精选  
4. 社区技能目录导读  
5. 团队 Skill 实战  

`context-management` 留在 sidebar「实战」组；`index.md` 归入 **第七部分 · 实战与最佳实践**（修复现 index 误放在第五部分下的不一致）。

**index.md 建议阅读路径（侧栏为 Hooks 先于 Skill 时）：**

- **默认线性顺序**：第四部分 `claude-md` → 第五部分 Hooks → … → MCP → 第六部分 Skills → … → playbook → 第七部分实战。  
- **Skill 优先路径**（在漫游指南或第六部分开头注明）：已熟悉 Hook 的读者可从 [Skill 的作用与边界](/claude-code/skills/) 直接进入第六部分，完成后再回读第五部分。

### 2.2 第六部分 · Skill 体系 — 五章

| 序 | 侧栏标签 | 文件 slug | 读者问题 |
|----|----------|-----------|----------|
| 1 | Skill 的作用与边界 | `skills.md`（保留 URL） | Skill 是什么，和 CLAUDE.md / Hook / SubAgent 差在哪 |
| 2 | 编写与调试 Skill | `skills-authoring.md`（新建） | 如何写出可 `/` 触发、模型会选用的技能 |
| 3 | 编码向社区精选 | `skill-recommendations.md`（保留 URL，改写） | 哪些包值得装、如何验证 |
| 4 | 社区技能目录导读 | `skill-catalog.md`（新建） | 还有哪些场景、如何自行扩展发现 |
| 5 | 团队 Skill 实战 | `skills-team-playbook.md`（新建） | 如何从社区包提炼并落地团队技能 |

**部分级 prev/next 链（全站线性，与 sidebar order 一致）：**

`claude-md` → `hooks` → `subagents` → `mcp` → `skills` → `skills-authoring` → `skill-recommendations` → `skill-catalog` → `skills-team-playbook` → `prompt-engineering` → …

**第六部分内：**

`skills` → `skills-authoring` → `skill-recommendations` → `skill-catalog` → `skills-team-playbook`

**跨部分文末链接（需改的文件）：**

| 文件 | 上一章 | 下一章 |
|------|--------|--------|
| `claude-md.md` | （不变） | `hooks` |
| `hooks.md` | `claude-md` | `subagents`（**不再**链 `skills`） |
| `mcp.md` | `subagents` | `skills`（第六部分入口） |
| `skills.md` | `mcp` | `skills-authoring` |
| `skills-team-playbook.md` | `skill-catalog` | `prompt-engineering`（第七部分首章） |
| `skill-recommendations.md` | `skills-authoring` | `skill-catalog`（删除链 SubAgents） |
| `subagents.md` | `hooks` | `mcp`（不再从 skill-recommendations 接入） |

### 2.3 frontmatter `sidebar.order`（建议）

| 文件 | order | 所属部分 |
|------|-------|----------|
| hooks.md | 9 | 五 |
| subagents.md | 10 | 五 |
| mcp.md | 11 | 五 |
| skills.md | 12 | 六 |
| skills-authoring.md | 13 | 六 |
| skill-recommendations.md | 14 | 六 |
| skill-catalog.md | 15 | 六 |
| skills-team-playbook.md | 16 | 六 |
| context-management.md | 17 | 七（实战） |
| prompt-engineering.md | 18 | 七 |
| … | +1 自原 14 章起 | 七～十 |

（实现时核对所有 `claude-code/*.md` 的 `order`，避免与第五部分三篇冲突。）

---

## 3. 各章内容边界

### 3.1 `skills.md` — 作用与边界（目标 ~120 行）

**保留：**

- 开篇场景句
- 「Skills 解决什么问题」对比表（与 CLAUDE.md、Hook、SubAgent）
- 懒加载 vs CLAUDE.md 的一句话机制
- 技能放在哪里（四级路径表，简表）
- 与 commands 合并的一句说明 + 官方链接
- 章末自检 2～3 题（概念级）

**迁出到 `skills-authoring.md`：**

- 目录与 SKILL.md 结构详解
- 最小可验证示例全文
- frontmatter 大全、`!` 注入、`context: fork`
- 调试与失败模式表
- 团队落地、SubAgent `skills:` 字段、压缩行为

**迁出到 `skill-recommendations.md` / `skills-team-playbook.md`：**

- 社区包、Superpowers 链、启发六条

**新增：**

- 顶部 **第六部分路线图**（五章各一句话 + 预计阅读时间）
- 明确「本部分终点是第 5 章团队实战」
- 一句 **与第五部分关系**：Hooks 管确定性脚本，本部分管可复用流程；可先读本部分再回读 Hooks（链到 index 双路径）

### 3.2 `skills-authoring.md` — 编写与调试（新建，~200 行）

**来源：** 现 `skills.md` 主体机制。

**结构：**

1. 前置：完成第 1 章或已理解懒加载
2. 最小可验证示例（summarize-changes，完整可复制）
3. frontmatter 常用字段表 + 官方 Frontmatter reference 链接
4. `!` 命令注入、`$ARGUMENTS`、`allowed-tools` 风险一句
5. `context: fork` 与 SubAgents 交叉链（不深讲 SubAgent）
6. 调试与失败模式（ symptom → check）
7. `/doctor`、`skillOverrides`、描述预算
8. 团队：`.claude/skills/` 入仓 review 要点
9. 自检清单（动手项）
10. 下一章：编码向精选

### 3.3 `skill-recommendations.md` — 编码向社区精选（改写，~180 行）

**保留并压缩：**

- 三种安装入口表 + 验证清单（4 步）
- 安全提醒（Plugin allowed-tools）
- Superpowers：定位、哲学、安装 A/B、**压缩** mermaid 主链（保留表，删重复 prose）、试跑 3 步、Plan Mode 关系 **≤1 段**
- Karpathy：原则表 + Plugin 安装 + CLAUDE.md 路径对比 **≤1 段**
- UI UX Pro Max：**缩短为「前端向附录」**（安装 + 适用谁 + 与 Superpowers 正交），约 40 行
- 组合建议表（保留）
- Plugin 安装失败：官方市场重名/flaky（链 [obra/superpowers#355](https://github.com/obra/superpowers/issues/355)）、`/plugins` 检查

**删除 / 迁出：**

- 「Skill 的作用」整节 → 第 1 章
- 「启发：从社区包学到什么」整节 → 第 5 章（扩展为 playbook）
- Superpowers 调试技能长列表 → 第 4 章「调试类」代表一行

**开篇改为：** 假设已会写 Skill；本章只解决「装什么、怎么验」。

### 3.4 `skill-catalog.md` — 社区技能目录导读（新建，~150 行）

**形态 B：分类导读，非全量大表。**

**固定结构：**

1. **如何自己发现**（必写）
   - `/plugin` Discover 页
   - [Discover plugins](https://code.claude.com/docs/en/discover-plugins)
   - [claude.com/plugins](https://claude.com/plugins)
   - 添加 marketplace：`/plugin marketplace add owner/repo`
   - 选型四维：信任来源、allowed-tools、描述长度(/doctor)、是否与现有 Plugin 冲突

2. **分类导读表**（每类 3～5 代表 + 不追求完备）

| 分类 | 代表（示例，实现时核对官方市场） | 本站深度链接 |
|------|----------------------------------|--------------|
| 端到端工程方法论 | Superpowers | 第 3 章 |
| 编码纪律 / 性格 | Karpathy skills | 第 3 章 |
| 前端 / UI / UX | UI UX Pro Max | 第 3 章附录 |
| 测试 / TDD | Superpowers `test-driven-development`（仅技能名提示） | 第 3 章 + [tdd-quality](/claude-code/tdd-quality/) |
| 调试 / 根因 | Superpowers `systematic-debugging` | [debug-error-recovery](/claude-code/debug-error-recovery/) |
| 代码审查 / PR | 官方 marketplace 中 review 类 Plugin（实现时从 discover 文档举 1～2 个具名例子） | — |
| 安全 / 合规 | 指向 security-permissions 章 + 官方安全类 Plugin 若有 | — |
| 文档 / 变更说明 | 内置 `/commit`、项目内自建 skill 为主 | 第 5 章 |

每类格式：

- **何时选这类**
- **代表 1～3 个**（仓库或 `@marketplace` 安装一行）
- **不建议**：与第 3 章已深度写的重复安装说明

3. **维护声明**（必写）

> 插件名称与市场条目随版本变化；安装前以 [官方 Discover 文档](https://code.claude.com/docs/en/discover-plugins) 为准。本站只做分类与评估框架，不维护全量清单。

4. 下一章：团队 Skill 实战

### 3.5 `skills-team-playbook.md` — 团队 Skill 实战（新建，~200 行，**部分终点**）

**来源：** 现 `skill-recommendations.md` 启发节 + 扩展练习。

**结构：**

1. 开篇：社区包是教材，不是依赖
2. **六条可迁移模式**（保留现六条，每条加「团队落地检查项」一行）
3. **练习 1**：读 Superpowers `writing-skills` SKILL.md，改一条你们最常粘贴的流程为 `.claude/skills/`
4. **练习 2**：为「发 PR」写 `description` 仅含用户真实说法
5. **练习 3**：选一个仅手动触发的部署类技能，设 `disable-model-invocation`
6. **组织 Plugin** 路径：链 skills-authoring 团队节 + 官方 Plugins 文档
7. **与 Hooks / Managed settings 分工** 决策表（何时 skill、何时 hook）
8. 部分总结自检（对应 C）
9. 下一章：[提示工程](/claude-code/prompt-engineering/)（第七部分）；文内交叉链 [Hooks](/claude-code/hooks/) 分工表

---

## 4. 全站同步清单

| 文件 | 改动 |
|------|------|
| `src/config/claude-code-sidebar.ts` | **第五部分** 仅 Hooks / SubAgents / MCP；**新增第六部分** Skill 五篇；第七～十部分 label 改序号 |
| `src/content/docs/claude-code/index.md` | 插入第六部分块；第五部分去掉 Skills 两条；原第六～九部分改七～十；双路径阅读说明 |
| `README.md` | 部分表：五不变、六 Skill、七～十顺延 |
| `astro.config.mjs` | `claudeCodeSlugs` 增加三个新 slug |
| `hooks.md` | 下一章 → `subagents`；保留「第五部分」 |
| `mcp.md` | 下一章 → `skills` |
| `claude-md.md` | 下一章 → `hooks`（不变） |
| `skills.md` | 上一章 `mcp`；瘦身 + 第六部分路线图 |
| `skill-recommendations.md` | 改写 |
| `subagents.md` | 上一章 `hooks`；下一章 `mcp` |
| `prompt-engineering.md` | 上一章可链 `skills-team-playbook` |
| `ecosystem-integration.md` 等 | 「第 N 部分」数字按新序号替换 |
| `tdd-quality.md` | 可链 skill-recommendations Superpowers TDD |

**不重定向：** 保留 `/claude-code/skills/` 与 `/claude-code/skill-recommendations/` URL。

---

## 5. 写作与质量约束

- 正文简体中文； volatile 安装命令标注「以官方为准」。
- 每章顶部路线图或「本章解决一个问题」。
- 风险命令（Plugin install、curl CLAUDE.md）配确认或回滚提示。
- 实现后 `pnpm build` 通过。
- 不在 spec 阶段提交 git（除非用户要求 commit）。

---

## 6. 非目标（YAGNI）

- 不建独立 `/claude-code/skills-hub/` 枢纽页（方案 C 否决）。
- 不在站内维护 50+ 行全量 Plugin 表（方案 A 否决）。
- 不重写 Hooks / SubAgents / MCP 章节正文。
- 不新增第六个 Skill 章（如「Skill 与 MCP 联合」）除非用户后续要求。

---

## 7. 实现顺序（供 writing-plans 使用）

1. 新建 `skills-authoring.md`、`skill-catalog.md`、`skills-team-playbook.md`（骨架 + frontmatter order）
2. 从 `skills.md` 迁出机制到 authoring；瘦身 `skills.md`
3. 改写 `skill-recommendations.md`
4. 更新 sidebar、index、orders、prev/next 全站
5. `pnpm build` 修复死链
6. 通读五章：C 终点是否可达（练习 + 自检）

---

## 8. Spec 自检

- [x] 无 TBD / TODO 占位
- [x] 架构与五章描述一致
- [x] 范围单迭代可完成
- [x] 「批发」= B 已写死为分类导读 + 发现方法
- [x] URL 策略明确

---

## 9. 待用户确认后

1. 用户审阅本 spec 并批准或修改  
2. 调用 `writing-plans` 生成实现计划  
3. 执行文稿拆分与配置更新（另一会话或同会话按 plan）
