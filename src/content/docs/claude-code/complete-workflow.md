---
title: Claude Code 完整实战工作流
description: 从接手陌生代码、调试与重构，到新功能、测试、PR 与并行会话，把提示工程与 Plan Mode 落成可重复的端到端路径。
sidebar:
  order: 22
---

*「提示工程也学了，Plan Mode 也会切了，但真接手一个陌生 repo、修一个红 CI、或从零加功能时，仍不知道先开口说什么、在哪一步停。」*

上一章 [提示工程](/claude-code/prompt-engineering/) 讲的是**怎么说**；本章讲的是**按什么顺序做**。同一套 [代理循环](/claude-code/agent-loop/) 在不同任务里，入口提示、权限模式、是否开子代理、何时 commit 都不一样。

官方分任务食谱见 [Common workflows](https://code.claude.com/docs/en/common-workflows)；高层原则见 [Best practices](https://code.claude.com/docs/en/best-practices)。本章把它们串成一条你可直接照着走的实战链，并标明每步应链接的本系列章节。

---

## 全景：六段可组合的工作流

没有唯一正确的「Claude Code 开发流程」。常见组合如下：

```
理解代码 → 方案设计 → 逐步实现 → 测试验证 → 代码审查 → 提交/部署
     ↑___________________________________________|
              （发现偏差时回到前面某段）
```

| 阶段 | 你的目标 | 常用模式 | 本系列延伸阅读 |
|------|----------|----------|----------------|
| 理解 | 建立心智模型 | 只读 + 子代理探索 | [first-session](/claude-code/first-session/)、[SubAgents](/claude-code/subagents/) |
| 设计 | 对齐改什么、怎么验收 | [Plan Mode](/claude-code/plan-mode/) | [prompt-engineering](/claude-code/prompt-engineering/) |
| 实现 | 改码并自测 | default / acceptEdits | [agent-loop](/claude-code/agent-loop/) |
| 验证 | 测试、lint、构建 | 提示里写死命令 | [Hooks](/claude-code/hooks/) |
| 审查 | 找遗漏与风格问题 | 第二会话或只读子代理 | [prompt-engineering](/claude-code/prompt-engineering/#writer--reviewer-双会话) |
| 提交 | commit、PR、CI | `gh`、worktree | 本章 Git 节；[生态集成](/claude-code/ecosystem-integration/) |

**动手：** 用 30 秒判断你**此刻**处于哪一列。若同时在「理解」和「实现」，先停实现，补设计或缩小范围。

---

## 开工前：三次性准备

每次在新仓库或新任务上花时间做下面三步，后面每轮对话都更省 token。

### 1. 在项目根启动

```bash
cd /path/to/your-repo
claude
```

在子目录启动会让 Agent 默认「视野」变小。见 [第一个会话](/claude-code/first-session/#启动会话)。

### 2. 写入或更新 CLAUDE.md

```text
/init
```

然后人工删减：只保留 Agent 猜不到的命令、测试方式、禁止路径。见 [CLAUDE.md 编写与维护](/claude-code/claude-md-authoring/)。

### 3. 预置权限与常用命令

```text
/permissions
```

为 `npm test`、`npm run lint` 等只读或低风险命令配置 allow；对 `git push`、`rm` 保持 ask 或 deny。团队规则进 `.claude/settings.json` 并入库。

**检查清单：**

- [ ] 工作区干净或你清楚当前未提交改动  
- [ ] 知道本项目的**单测命令**与**全量检查命令**  
- [ ] `CLAUDE.md` 不超过「再删就会犯错」的长度  

---

## 选路径：你现在该走哪条工作流

| 你的情况 | 优先工作流 | 少做 |
|----------|------------|------|
| 刚 clone，还不懂结构 | [理解代码库](#工作流-a理解陌生代码库) | 一上来大改 |
| 有报错或测试红 | [调试](#工作流-b调试) | 无复现步骤就 Edit |
| 技术债、换模式、升级依赖 | [重构](#工作流-c重构) | 一次改几十个文件 |
| 新功能、跨多模块 | [新功能](#工作流-d新功能) | 跳过计划直接写 |
| 覆盖率不够、缺测试 | [测试](#工作流-e测试) | 只生成不测 |
| 要交付、走 review | [Git 与 PR](#工作流-fgit-与-pr) | 未验证就 push |
| 补文档 | [文档](#工作流-g文档) | 让 Agent 编造 API |

---

## 工作流 A：理解陌生代码库

**目标：** 在不动业务代码的前提下，能回答「入口在哪、数据怎么流、测试怎么跑、风险在哪」。

### 推荐节奏

```
概览 → 按领域深挖 → 追踪一条真实路径 → 记下术语与坑
```

### 第一步：概览

```text
给出本仓库的高层概览：主要目录、入口、构建与测试方式。
先列出你将读取哪些文件，再下结论。不要修改任何文件。
```

### 第二步：按领域问

```text
authentication 是在哪些文件里实现的？它们如何协作？
```

```text
从 HTTP 请求到数据库，追踪一次登录成功的调用链，用步骤列表说明。
```

对大型 repo，加一句委派：

```text
用 Explore 子代理查找所有与 token 刷新相关的文件，只把路径和一句职责说明返回给我。
```

### 第三步：固化到笔记

把结论写进 `CLAUDE.md` 或团队 wiki，而不是留在长会话里。下次 `/clear` 后仍可用。

### 接手遗留库的第一天清单

| 顺序 | 动作 | 验收 |
|------|------|------|
| 1 | `/init` + 跑一遍测试 | 知道绿/红基线 |
| 2 | 只读概览 + 一条调用链 | 能口头讲清主路径 |
| 3 | `git log -20` 或让 Agent 总结近期变更 | 知道最近在动哪里 |
| 4 | 标出 3 个技术债或风险点 | 写入 issue 或 CLAUDE.md |

有语言的 [code intelligence 插件](https://code.claude.com/docs/en/discover-plugins#code-intelligence) 时，可让 Agent 做「跳转到定义」「查引用」，比纯 Grep 更准。

---

## 工作流 B：调试

**目标：** 复现 → 定位根因 → 最小修复 → 回归验证。对应 [提示工程](/claude-code/prompt-engineering/) 里的「带验收修复」。

### 1. 把现象变成可复现

```text
我运行 `npm test` 时失败。下面是完整终端输出：

<粘贴>

请先说明你将如何复现，再定位根因。在确认根因前不要改代码。
```

有界面问题时，**粘贴或拖拽截图**，并说明期望与实际行为。

### 2. 缩小范围

```text
失败只在 `UserService.test.ts` 的 "logout clears session" 出现。
请用二分思路：先判断是测试问题、实现问题还是 fixture 问题，并给出证据。
```

让 Agent 先 **Read** 相关文件，再提 patch，避免猜 `old_string`。

### 3. 先红后绿（推荐）

```text
为 logout 会话未清除写一个失败测试（若已有则指出为何仍通过）。
再改实现，跑 `npm test -- UserService`，直到该用例通过且未破坏其它用例。
只改与 auth 相关的文件。
```

### 4. 验证闭环

| 步骤 | 命令/动作 |
|------|-----------|
| 相关单测 | 项目约定的单文件测试命令 |
| 相关 lint | `npm run lint` 或等价 |
| 回归范围 | 若改动面大，跑更广测试集 |

若同一 bug 纠正三轮仍失败，按 [提示工程](/claude-code/prompt-engineering/#agent-迷茫时的信号) **`/clear` 并重写初始提示**，带上已排除的假设。

### 5. 回滚与试错

想试激进改法时，依赖 Git 与 [checkpointing](https://code.claude.com/docs/en/checkpointing)：`Esc` 连按或 `/rewind` 可恢复对话与 Claude 改过的文件。Checkpoint **不**跟踪你在 IDE 里手改的内容，**不能**代替 Git。

---

## 工作流 C：重构

**目标：** 行为不变、测试仍绿、diff 可审查、随时可回滚。

### 安全网

1. **Git 提交点**：重构前 `git commit` 或至少 `git stash`，保证能 `git diff` / `git reset`。  
2. **小步**：一次只动一个模块或一种机械替换。  
3. **每步跑测试**：写进提示，不要靠记忆。  
4. **可选 worktree**：实验性大改可用 `claude --worktree refactor-auth` 隔离分支，见 [SubAgents worktree](/claude-code/subagents/#git-worktree-实验) 与官方 [Worktrees](https://code.claude.com/docs/en/worktrees)。

### 典型提示序列

**发现技术债**

```text
在 src/ 下找出仍使用已废弃 API <名称> 的文件，列表即可，先不改。
```

**单文件试点**

```text
将 @src/utils/legacy.js 改为 ES 模块语法，保持对外导出与行为不变。
改完后只跑与该文件相关的测试。
```

**机械迁移（多文件）**

```text
把 React 类组件改为函数组件，范围仅限 @src/components/legacy/。
每改 2～3 个文件就跑一次 `npm test -- src/components/legacy`。
不要改样式文件与路由配置。
```

大规模迁移可先让 Agent **列出文件清单**，你确认后再 `claude -p` 批处理或 `/batch` 类技能，见 [Slash 命令](/claude-code/slash-commands/)。

### 重构后审查

用**新会话**或只读子代理：

```text
审查我最近对 utils 的重构：行为等价性、遗漏的调用方、测试空洞。只输出问题清单。
```

---

## 工作流 D：新功能

**目标：** 方案经你批准、实现可验证、范围可控。

### 1. 规划段

```bash
claude --permission-mode plan
```

或会话内 `Shift+Tab` 到 plan，然后：

```text
/plan 为公开 API 增加按 IP 的速率限制：列出要改的文件、中间件插入点、测试策略与回滚方式。不要改代码。
```

审查计划是否包含 [Plan Mode 一章](/claude-code/plan-mode/#一份好计划应包含什么) 的四要素：范围、步骤、决策、验收。不足则要求补充后再批准 `ExitPlanMode`。

### 2. 实现段

批准后切换执行模式，并：

```text
按已批准计划执行第 1 步：只实现 rate limit 中间件与单元测试。
每完成一步更新任务状态，并跑 `npm test -- middleware`。
```

复杂功能可拆多会话：规划会话产 `SPEC.md` 或计划文件，**新会话**只负责实现，见 [提示工程](/claude-code/prompt-engineering/#大功能让-claude-先采访你)。

### 3. 测试驱动变体

```text
先为「每 IP 每分钟 100 次」写失败测试，再实现中间件，再跑全量相关测试。
遵循 @tests/middleware/ 里现有测试风格。
```

### 4. 多文件协同

在计划里**锁定文件列表**，执行时强调：

```text
不要修改计划外的文件。若发现必须动其它文件，先停下并说明原因，等我确认。
```

偏离计划时，回到 `/plan` 修订，比在脏上下文里硬改更省成本。

---

## 工作流 E：测试

**目标：** 覆盖关键路径与边界，风格与仓库一致，能稳定跑绿。

### 找缺口

```text
@src/services/NotificationService.ts 里哪些分支没有测试覆盖？
参考 @tests/services/NotificationService.test.ts 的风格。
```

### 生成并收紧

```text
为 NotificationService 的退订逻辑补测试：正常路径、重复退订、无效 token。
跑 `npm test -- NotificationService`，失败则修到通过。
```

### 让 Agent 挑边界

```text
分析 NotificationService 的实现，列出我可能遗漏的边界条件，并各给一个测试用例建议。
```

测试逻辑稳定后，可做成 [Skill](/claude-code/skills/)：`/test-module src/foo`，避免每次粘贴长提示。

---

## 工作流 F：Git 与 PR

**目标：** 提交信息可读、PR 可审查、会话可与 PR 关联。

### 日常提交

```text
查看当前 git diff，写 conventional commit 信息（中文或英文与仓库一致）。
在我确认前不要 commit。
```

确认后：

```text
commit 并附上你写的 message
```

团队规范可写在 `CLAUDE.md` 或 Skill 里，避免每次解释 scope 格式。

### 生成 PR

安装并授权 `gh` CLI 后：

```text
总结本次 auth 相关改动，创建 PR，描述包含：动机、测试方式、风险与回滚说明。
```

也可一步：

```text
create a pr
```

用 `gh pr create` 创建 PR 后，会话常与 PR 绑定；之后可用 `claude --from-pr <url>` 或 `/resume` 找回。见官方 [Manage sessions](https://code.claude.com/docs/en/sessions)。

### Code Review

**自写自审盲区大**，推荐：

| 方式 | 做法 |
|------|------|
| 第二会话 | 新 `claude`，`@src/changed/files` + 「只审查、不改」 |
| 子代理 | `用只读 code-reviewer 子代理审查 @src/auth/` |
| 人工 | 你看 `/diff`，Agent 只回答你标出的行 |

```text
审查 @src/middleware/rateLimiter.ts：竞态、边界、与现有中间件风格。按严重度列问题，不要改文件。
```

### 合并冲突

```text
我在合并 main 时有冲突，文件是 @src/auth/handler.ts。
说明双方改动意图，建议保留哪几段，并给出解决后的完整文件供我确认，不要直接 commit。
```

---

## 工作流 G：文档

```text
找出 @src/auth/ 中缺少 JSDoc 的对外导出函数，按 @docs/contributing.md 的风格补全，含一个用法示例。
```

```text
根据当前 diff 更新 README 的安装步骤，只改与本次功能相关的段落。
```

文档任务也要验收：例如「链接可点」「示例命令能在本仓库跑通」。

---

## 图片、设计稿与 UI 调试

| 场景 | 做法 |
|------|------|
| 报错弹窗 | 截图粘贴 + 「期望 vs 实际」 |
| UI 还原 | 设计稿截图 + 「改完后截图对比差异」 |
| 架构图 | 图 + 「根据图说明数据流并指出风险点」 |

macOS 终端粘贴截图用 **Ctrl+V**（不是 Cmd+V）。多图可在同一会话中引用。详见 [Common workflows · Work with images](https://code.claude.com/docs/en/common-workflows#work-with-images)。

---

## 跨天任务：会话与并行

### 恢复与命名

```bash
claude --continue          # 当前目录最近一次
claude --resume            # 选择列表
claude -r oauth-migration "继续 PR 上的 review 意见"
```

会话内 `/rename feature-auth` 便于一周后找回。长任务**不要**把所有话题塞进一个会话；无关任务用 `/clear`。

### 并行：worktree

功能开发与 hotfix 同时进行：

```bash
# 终端 1
claude --worktree feature-auth

# 终端 2
claude --worktree hotfix-502
```

每个 worktree 独立分支与检出，避免文件互相覆盖。监控多会话可用官方 [agent view](https://code.claude.com/docs/en/agent-view) 或桌面端并行界面。

### 非交互与 CI 预览

```bash
git log --oneline -20 | claude -p "用中文总结这些提交的主题与风险"
```

无人值守流水线、GitHub Actions、`claude -p` 权限范围见下一章 [生态集成](/claude-code/ecosystem-integration/)。交互式实战仍以本机 `claude` 为主。

---

## 端到端示例：从 issue 到 PR

假设 GitHub issue：**登出后会话未清除**。

| 步 | 你做 | 提示要点 |
|----|------|----------|
| 1 | `gh issue view 42` 或粘贴描述 | Material：issue 正文 |
| 2 | plan 模式 | 只读查清 auth 路径，输出计划 |
| 3 | 批准计划 | 切 default，实现 + 测试 |
| 4 | 本地验证 | `npm test` 写进提示并跑 |
| 5 | 新会话审查 | 只读 review 改动文件 |
| 6 | commit + PR | `gh` 创建 PR，链 issue |

合并提示（实现段）示例：

```text
修复 issue #42：登出后会话仍有效。
按批准计划修改；先写/跑失败测试再修实现；只改 auth 相关路径；
完成后跑 `npm test -- auth` 与 lint，给出摘要与 diff 要点，等我确认再 commit。
```

---

## 部署与配置生成

生成 Dockerfile、K8s manifest、GitHub Actions 等**适合在计划明确后**再做：

```text
根据 @package.json 和现有 CI，写 GitHub Actions：在 PR 上跑 lint 与单测。
不要写入密钥；用 repository secrets 占位符。
```

**边界：** 生产部署、密钥轮换、合规审计应以团队流水线为准；Agent 输出必须经人工与 [生态集成](/claude-code/ecosystem-integration/) 中的策略审查。不要把 `.env` 内容贴进对话。

---

## 失败模式

| 症状 | 可能原因 | 下一步 |
|------|----------|--------|
| 改了一堆无关文件 | 范围未写清 | 加「只改 X」；`git checkout --` 回滚 |
| 测试绿了但行为错 | 测试太弱 | 补集成测试或手工验收步骤 |
| 计划获批后跑偏 | 未逐步验收 | 拆步 + 每步跑命令 |
| PR 描述空洞 | 未让 Agent 读 diff | `summarize my changes` 再 `create pr` |
| 并行 worktree 改错分支 | 终端搞混 | `/rename` + 看提示符与 `git branch` |
| 重构后 production 事故 | 无提交点、无测试 | 小步 + 每步 commit |
| 文档与代码不一致 | 未基于 diff | `@` 变更文件再写文档 |

---

## 决策边界：今日最小闭环

时间有限时，优先保证：

1. **可复现**（命令 + 输出或截图）  
2. **可回滚**（Git 或 rewind）  
3. **可验证**（测试或 lint 在提示里跑过）  

不必每天都走满六段。修一个 typo：理解可跳过，设计可跳过，验证 + 提交即可。加跨模块功能：设计段几乎不可省。

把重复三次以上的提示收成 [Skill](/claude-code/skills/)；把每次都要跑的检查收成 [Hook](/claude-code/hooks/)；把探索噪声交给 [SubAgent](/claude-code/subagents/)。

---

## 继续读下一章之前

试着回答：

1. 接手新 repo 的第一天，你会先做只读概览还是先修一个小 issue？为什么？  
2. 调试时「先红后绿」比「直接改实现」多解决了什么问题？  
3. 为什么 PR 审查建议用第二会话或子代理？  
4. `claude --worktree` 解决的是哪类冲突？

自检清单：

- [ ] 在真实仓库完成过一次只读概览 + 一条调用链追踪  
- [ ] 用「粘贴报错 + 验收命令」走完一次调试闭环  
- [ ] 用过 plan 模式批准后再实现一个小功能  
- [ ] 用 `gh` 或等价方式创建过 PR，或生成过 commit message  
- [ ] 知道 worktree 或 `/rename` 在多任务时的用法  

---

下一章：[生态深度集成](/claude-code/ecosystem-integration/)——VS Code 与桌面端、GitHub Actions、团队 `CLAUDE.md` 与企业权限，把本章的 Git/CI 片段扩展到协作与流水线环境。
