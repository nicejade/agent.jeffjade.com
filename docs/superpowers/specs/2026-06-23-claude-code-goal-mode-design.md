# Claude Code `/goal` 独立章节 — 设计说明

**日期**：2026-06-23  
**状态**：已实现  
**决策**：方案 A（独立章节）+ 方案 2（教程契约驱动结构）+ 第九部分插在 Routines 之前

## 背景与目标

Claude Code 在 v2.1.139 引入 `/goal`：用户设定可验证的完成条件后，Claude 跨多个 turn 自主续跑，直到独立评估模型确认条件满足。官方文档：[Keep Claude working toward a goal](https://code.claude.com/docs/en/goal)。

本系列当前仅在 [`slash-commands.md`](../../../src/content/docs/claude-code/slash-commands.md) 有两处一行提及，缺少机制、条件写法、与 `/loop`/hooks/auto 的分工及成本边界。读者无法从现有正文学会「何时开 goal、如何写可验证终点」。

**目标**：新增独立教程章，融合用户提供的材料与官方文档，使读者能：

1. 理解 `/goal` 与默认代理循环的差异（独立评估者、跨 turn 续跑）。
2. 写出评估者能从 transcript 判定的完成条件。
3. 在 `/goal`、`/loop`、Stop hook、auto mode、Routines 之间做选型。
4. 识别常见失败模式并控制 token 成本。

**非目标**：

- 不维护与官方 1:1 的全量 `/goal` API 参考。
- 不写 Hermes Agent 的 `/goal`/`/subgoal` 机制（与 [`memory-learning-skills.md`](../../../src/content/docs/hermes-agent/memory-learning-skills.md) 区分）。
- 不展开社区工具（如 `jthack/claude-goal`）或 `GOAL.md` 多阶段链式（无官方文档，最多一句「社区实践」带过）。
- 不重写无关章节全文。

---

## 元数据与导航

| 项 | 值 |
|---|---|
| 文件 | `src/content/docs/claude-code/goal-mode.md` |
| 路由 | `/claude-code/goal-mode/` |
| 标题 | `/goal` 与跨轮持续目标 |
| description | 设定可验证完成条件，让 Claude 跨多轮自主工作直到达标；掌握条件写法、独立评估者与成本边界。 |
| sidebar.order | **34**（第九部分 · 进阶实践，**在 Routines 之前**） |
| 官方来源 | [goal](https://code.claude.com/docs/en/goal)、[Commands](https://code.claude.com/docs/en/commands) |

### order 顺延（插入 1 章）

原 `order ≥ 34` 的正文章节各 **+1**：

| 新 order | slug | 原 order |
|--------:|------|--------:|
| 34 | `goal-mode` | —（新） |
| 35 | `routines-automation` | 34 |
| 36 | `debug-error-recovery` | 35 |
| 37 | `token-economics` | 36 |
| 38 | `sandboxing` | 37 |
| 39 | `security-permissions` | 38 |
| 40 | `tdd-quality` | 39 |
| 41 | `team-organization` | 40 |
| 42 | `mental-model-migration` | 41 |
| 43 | `cli-and-settings-reference` | 42 |
| 44 | `troubleshooting-faq` | 43 |

**系列计数**：漫游指南 `index.md` 与 `claude-code/index.astro` 由「42 章教程正文」改为 **43 章教程正文 + 排障速查**（或统一写 44 篇含 FAQ，与现有口径对齐后全站一致）。

### prev/next 链

| 文件 | 上一章 | 下一章 |
|------|--------|--------|
| `reflection.md` | `limitations` | **`goal-mode`**（替换原直链 `routines-automation`） |
| `goal-mode.md` | `reflection` | `routines-automation` |
| `routines-automation.md` | **`goal-mode`** | `debug-error-recovery` |
| `debug-error-recovery.md` | `routines-automation` | 不变 |

### 侧边栏

在 [`claude-code-sidebar.ts`](../../../src/config/claude-code-sidebar.ts) 第九部分首项插入：

```ts
{ label: '/goal 与跨轮持续目标', link: '/claude-code/goal-mode/' },
```

位于 `routines-automation` 之前。

---

## 新章内容契约

遵循 `CLAUDE.md` 教程结构：frontmatter → 开场痛点 → 核心概念 → 最小路径 → 机制 → 失败模式 → 决策边界 → 动手检查 → prev/next。正文简体中文；volatile 事实附官方链接。

**目标字数**：2 200–2 800。

### 1. 开场

- 痛点：默认模式下每轮结束需手动「继续」；多步任务（迁移、修测试、按 spec 实现）babysitting 成本高。
- 承诺：`/goal` 把重复推动外包给系统，读者只定义「什么叫完成」。

### 2. `/goal` 是什么

- 设定完成条件 → 跨 turn 自主工作 → 条件满足后 goal 自动清除，控制权回到用户。
- 版本：**v2.1.139+**（官方明确要求）。
- 前置：已接受工作区信任对话框；evaluator 属于 hooks 体系。`disableAllHooks` 或 managed `allowManagedHooksOnly` 时不可用，命令会说明原因而非静默失败。
- 每会话仅一个活跃 goal；新 `/goal` 替换旧 goal。条件上限 **4000 字符**。

### 3. 最小路径

命令与预期信号：

```text
/goal all tests in test/auth pass and the lint step is clean
/goal                    # 状态：条件、运行时长、turn 数、token、evaluator 最新理由
/goal clear              # 别名：stop, off, reset, none, cancel
/clear                   # 新会话也会清除活跃 goal
claude -p "/goal …"      # 非交互，Ctrl+C 可中断
```

行为要点（官方）：

- 设 goal **立即开始 turn**，条件本身即指令，无需再发 prompt。
- 活跃时显示 `◎ /goal active` 及运行时长。
- 每 turn 后 evaluator 返回简短理由；最近理由出现在状态视图与 transcript。
- `--resume` / `--continue` 恢复会话时，**未完成的 goal 会恢复**；turn 计数、计时器、token 基线重置。已达成或已清除的 goal 不恢复。
- 支持交互模式、非交互 `-p`、Desktop、Remote Control。

### 4. 机制：独立评估者

- **主模型**（Sonnet/Opus 等）：读文件、写代码、跑命令。
- **评估模型**（默认 Haiku 等 small fast model）：每 turn 结束后读取**完整对话 + 条件**，只输出 yes/no 与简短理由；**不调用工具**。
- yes → 清除 goal，transcript 记录 achieved。
- no → 理由作为下一 turn 指导，自动续跑。
- 本质：session-scoped 的 **prompt-based Stop hook**（官方表述）。链到 [Hooks · Stop](../../../src/content/docs/claude-code/hooks.md)。

**核心限制（必须强调）**：评估者**不能**独立跑命令或读文件，只能判断 Claude **已写入 transcript 的证据**。条件必须写成「Claude 跑测试后输出可证明」的形式。

评估 token 走 small fast model 计费，通常远低于主 turn（官方说明）。

### 5. 写好完成条件

三要素（官方）：

1. **可衡量的终态**：测试结果、构建退出码、文件数、空队列等。
2. **明确的验证方式**：`npm test` exits 0、`git status` is clean 等。
3. **必要约束**：如不修改某目录外测试文件、保持变更最小。

可选边界：`or stop after 20 turns`；Claude 每 turn 报告进度，evaluator 从对话判断。

**好/坏条件对照表**（用本系列技术栈示例，非照搬英文）：

| 差（模糊、无法验证） | 好（可衡量、有证据） |
|---|---|
| improve the dashboard | `pnpm test` 退出码 0；`src/dashboard` 外无文件改动 |
| clean up the code | `pnpm check` 与 `eslint` 均退出码 0 |
| migration done | `rg 'legacy_client'` 无匹配；`go test ./...` 退出码 0 |

复杂任务可拆为多段顺序 goal；长条件可用结构化小节（GOAL / SUCCESS CRITERIA / CONSTRAINTS / VERIFICATION），仍须落在可验证陈述上。

### 6. 与其他机制对比

官方对照表（中文化，放入正文）：

| 方式 | 下一 turn 何时开始 | 何时停 |
|---|---|---|
| `/goal` | 上一 turn 结束 | 评估模型确认条件满足 |
| `/loop` | 时间间隔到 | 你停止，或 Claude 自判完成 |
| Stop hook | 上一 turn 结束 | 你的脚本或 prompt 决定 |
| auto mode | **不**启动新 turn | 主模型自判完成 |

补充说明：

- **auto + `/goal`**：auto 自动批准单 turn 内工具；`/goal` 自动启动下一 turn。无人值守时常配合使用。链到 [安全边界与权限](../../../src/content/docs/claude-code/security-permissions.md)。
- **`/goal` vs `/loop`**：`/goal` 条件驱动；`/loop` 时间间隔驱动。本章终点；下一章 [Routines](../../../src/content/docs/claude-code/routines-automation.md) 讲三层自动化（含 `/loop` 与云端 Routines）。
- **Stop hook**：持久化、可脚本化；`/goal` 是会话内快捷方式。

### 7. 适用与不适用

**推荐**：

- 模块迁移直到编译与测试通过
- 按设计文档实现直到验收标准满足
- 修 bug 直到相关测试绿
- 处理有标签的 issue 队列直到清空

**谨慎或不推荐**：

- 目标模糊（「让代码更好看」）
- 需外部实时 API 状态且无法写入 transcript
- 完全开放式探索
- 极长、高风险无人值守（须 turn/时间上限、中途检查、Ctrl+C）

### 8. 失败模式与成本

| 现象 | 可能原因 | 对策 |
|------|----------|------|
| 明明做完仍续跑 | 关键证据未出现在 transcript | 要求 Claude 每轮贴测试/构建输出 |
| 无限或过长循环 | 条件不可测或 context rot | 加 turn 上限；拆 goal；`/compact` 或新会话 |
| token 飙升 | 多 turn 累积 | `/goal` 看消耗；小任务先试；链 [Token 经济学](../../../src/content/docs/claude-code/token-economics.md) |
| 误判已完成 | 复杂条件 + 评估者局限 | 人工审查 diff；条件写得更可验证 |
| 命令不可用 | 未信任工作区或 hooks 禁用 | `/doctor`；查 managed 设置 |

社区有长跑案例（数小时、高费用），正文标注为**用户报告，成本因项目而异**，不作为官方保证。

### 9. 动手检查

读者在已配置项目中验证：

1. `/goal` 设一个极小条件（如某单测文件全绿），观察 `◎ /goal active` 与 evaluator 理由。
2. 无参数 `/goal` 查看 turn 与 token。
3. `/goal clear` 中途取消。
4. 写一条「坏条件」与一条「好条件」，说明 evaluator 能否判定。
5. 能说出 `/goal` 与 `/loop`、auto mode 各解决什么问题。

### 10. 结尾导航

下一章：[Routines 与定时自动化](../../../src/content/docs/claude-code/routines-automation.md)——从条件驱动续跑进入时间间隔与云端调度。

---

## 现有章节补丁（轻量交叉链接）

| 文件 | 改动 |
|------|------|
| `slash-commands.md` | 「设持续目标」链到 `goal-mode`；可加一句「机制见专章」 |
| `agent-loop.md` | 失败模式「测试通过仍继续」→ 链到 `/goal`；可选在停止条件处补一句 |
| `routines-automation.md` | 开篇或三层表增加 `/goal` 行；链到 `goal-mode` |
| `hooks.md` | `Stop` 事件处注 `/goal` 为内置 session-scoped 简化版 |
| `complete-workflow.md` | 验证阶段可选一句 `/goal` 用于「直到测试绿」 |
| `reflection.md` | prev/next 指向 `goal-mode` |
| `index.md` | 第九部分插入第 34 条 |
| `src/pages/claude-code/index.astro` | 章节列表插入一项 |
| `claude-code-sidebar.ts` | 第九部分首项 |

不重写 `routines-automation` 全文；仅在对比语境下补 `/goal`，避免与专章重复。

---

## 事实来源与表述纪律

| _claim_ | 来源 |
|--------|------|
| v2.1.139+ | 官方 goal 页 |
| 默认 Haiku 评估 | 官方 goal 页 |
| 4000 字符上限 | 官方 goal 页 |
| clear 别名 | 官方 goal 页 |
| resume 行为 | 官方 goal 页 |
| Stop hook 封装 | 官方 goal 页 |
| 9 小时 / 数百美元案例 | 社区反馈，标为推断/用户报告 |
| `/subgoal` | **不写**（Hermes 专属） |

发布前执行 `pnpm build` 验证链接与 sidebar。

---

## 验收标准

1. `goal-mode.md` 存在且通过 build。
2. 侧边栏第九部分第一项为 `/goal` 章，Routines 紧随其后。
3. order 34–44 与上表一致，无重复 order。
4. `reflection` → `goal-mode` → `routines-automation` → `debug-error-recovery` 导航链正确。
5. `slash-commands`、`agent-loop`、`routines-automation`、`hooks` 至少各有一处链入新章。
6. 全文无 Hermes `/goal` 机制混淆；无未标注的社区工具依赖。
7. 好/坏条件表与三要素与官方 goal 页一致。

---

## 实现后续

用户批准本 spec 后，调用 **writing-plans** skill 生成 `docs/superpowers/plans/2026-06-23-claude-code-goal-mode.md` 实施计划，再执行文稿与配置修改。
