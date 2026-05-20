---
title: Plan Mode：先规划再执行
description: 在代理循环之上用 Plan Mode 把探索与改码拆开，经你批准后再执行，减少灾难性乱改与跑偏循环。
sidebar:
  order: 7
---

*「它说已经修好了，测试却红了一片；再让它修，又动了三个无关文件。」*

上一章你理解了 [代理循环](/claude-code-guide/agent-loop/)：模型可以一轮接一轮地 Read、Edit、跑 Bash。循环越强，**在错误方向上跑得越快**的风险也越大。本章讲的 Plan Mode，是在同一套循环上加一层**人控检查点**：先只探索、写出可审查的计划，你点头后再进入改代码阶段。

官方说明见 [Choose a permission mode · Analyze before you edit with plan mode](https://docs.anthropic.com/en/docs/claude-code-guide/permission-modes#analyze-before-you-edit-with-plan-mode) 与工具表中的 [`EnterPlanMode` / `ExitPlanMode`](https://code.claude.com/docs/en/tools-reference)。

---

## 灾难循环从哪来

「灾难循环」不是修辞，而是一组可观察症状：

| 症状 | 常见机制 |
|------|----------|
| 修 A 坏了 B、C | 没先摸清依赖就 Edit |
| 同一文件反复改又改不对 | `old_string` 与磁盘不一致，模型在猜 |
| 测试绿了还在乱动 | 停止条件没写清，循环缺少出口 |
| diff 越来越大却说不清目标 | 探索与执行混在同一上下文里 |

根因往往不是你「没盯紧」，而是**缺少可验证的中间态**：在动源码之前，双方对「改哪些文件、按什么顺序、怎样算完成」没有对齐。

Plan Mode 要解决的，正是把 [代理循环](/claude-code-guide/agent-loop/) 拆成两段：

1. **规划段**：读代码、跑探索性命令、产出结构化计划，**不改你的业务源码**。
2. **执行段**：你批准计划后，再按选定权限模式去 Edit、Write、跑测试。

这和网页聊天里「先聊方案」不同：计划基于真实 repo 的 Read/Grep/Bash 输出，而不是凭空编造文件结构。

---

## 两层概念：权限模式与规划工具

初学者容易把两件事混为一谈，分开记更稳。

### 权限模式 `plan`

`plan` 是六种 [权限模式](https://docs.anthropic.com/en/docs/claude-code-guide/permission-modes) 之一。进入后，Claude **不会编辑你的源码文件**，但可以 Read、Grep、Glob，并按与 `default` 相同的规则向你申请 Bash 等操作。官方表述是：可以调研、写计划，**不直接改源文件**；敏感命令仍会弹窗。

状态栏会显示当前模式。`Shift+Tab` 在交互会话里循环切换，默认顺序为 `default` → `acceptEdits` → `plan`，具体可见你安装版本里的状态栏提示。

### 工具 `EnterPlanMode` 与 `ExitPlanMode`

在 `plan` 权限模式下，模型还可以调用专用工具：

| 工具 | 作用 | 是否要批准 |
|------|------|------------|
| `EnterPlanMode` | 主动进入规划流程 | 否 |
| `ExitPlanMode` | 提交计划并请求你批准、退出规划 | 是 |

复杂任务时，模型可能自行调用 `EnterPlanMode`。你不一定每次都要手动切模式，但**批准 `ExitPlanMode` 之前，计划应已写清**。若你更希望始终由自己触发，可在提示里写「未经我要求不要进入 Plan Mode」，或在权限里 `deny` 对应工具，代价是失去自动建议规划的能力。

---

## 完整工作流

```
你描述目标（或 /plan 带描述）
        ↓
进入 plan 权限模式 / EnterPlanMode
        ↓
只读探索：Read、Grep、Glob、经批准的 Bash 等
        ↓
ExitPlanMode 呈现结构化计划
        ↓
你审查：修改计划、要求继续规划、或批准
        ↓
批准 → 退出 plan 模式，切换到所选执行模式 → 按计划改码、验证
        ↓
偏离计划 → 再次 Shift+Tab 或 /plan，或缩小任务
```

**关键人控节点**在「批准计划」：未批准前，不应出现对业务源码的 Edit/Write。批准后进入哪种执行模式，由你在批准对话框里选择，例如自动执行、自动接受编辑、或仍逐条审查编辑。选项以你当前版本界面为准，官方列出的方向包括：批准后进入 auto、进入 acceptEdits、逐条审查编辑、继续规划反馈，以及通过 [Ultraplan](https://docs.anthropic.com/en/ultraplan) 在浏览器中细化计划。

批准前可按 `Ctrl+G` 用系统默认编辑器直接改计划文本。若启用了 [`showClearContextOnPlanAccept`](https://docs.anthropic.com/en/settings#available-settings)，批准时还可选择先清空规划阶段上下文再执行，避免探索过程挤占执行窗口。接受计划后，会话名常会依计划内容自动命名，除非你已用 `--name` 或 `/rename` 指定。

---

## 如何进入 Plan Mode

### 会话内切换

| 方式 | 操作 |
|------|------|
| 快捷键 | `Shift+Tab` 切到 `plan`；再按一次可退出规划模式且不必批准计划 |
| 单条消息 | 在提示前加 `/plan`，例如 `/plan 把 auth 模块从 session 迁到 JWT` |
| 模型主动 | 调用 `EnterPlanMode` |

### 启动时即处于 plan 模式

```bash
claude --permission-mode plan
```

### 把 plan 设为项目默认

在 `.claude/settings.json` 中：

```json
{
  "permissions": {
    "defaultMode": "plan"
  }
}
```

适合你不熟的大型 monorepo：每次进项目先规划再动手。小改频繁的项目可保持 `default`，需要时再 `Shift+Tab`。

VS Code 扩展里也可在提示框底部切换模式；Plan 模式下计划常以 Markdown 文档展示，便于行内批注。见 [Use Claude Code in VS Code](https://code.claude.com/docs/en/vs-code)。

---

## 一份好计划应包含什么

计划质量决定批准后的执行是否顺滑。审查时至少核对下面四类信息。

| 要素 | 读者应能回答的问题 |
|------|-------------------|
| 范围 | 会动哪些路径？有没有明确不动的目录？ |
| 步骤 | 顺序是什么？某步是否依赖前一步的测试结果？ |
| 决策 | 在方案 A/B 之间选了哪个？理由是否写在计划里？ |
| 验收 | 跑哪条命令算完成？失败时先查什么？ |

官方未强制固定模板，但好的计划读起来像**可执行的 PR 描述**，而不是「我会优化代码」这类空话。

**动手：** 在真实仓库执行：

```
/plan 列出将 auth 登录从 session 改为 JWT 的步骤，先不要改任何文件
```

计划里应出现具体文件路径、测试命令、风险点。若只有泛泛描述，回复：「请补充将修改的文件列表和验收命令。」

---

## 批准后如何跟踪进度

规划阶段结束后，执行段仍走代理循环。跟踪方式有两种，以你环境为准：

| 机制 | 说明 |
|------|------|
| Task 工具 | 交互会话默认用 `TaskCreate`、`TaskList`、`TaskUpdate` 管理任务项 |
| `TodoWrite` | 在 `claude -p` 与 Agent SDK 场景仍常见；交互会话中已逐步由 Task 取代 |

执行时让模型「按批准计划逐步做，每完成一步更新任务状态并跑验收命令」，比一次性「全部改完」更容易在中间发现偏离。

若执行中发现计划前提错误，**不要硬扛**：停止大范围 Edit，再次 `/plan` 或说明「第 2 步假设不成立，请修订计划」，比在同一上下文里补丁叠补丁更省 token。

---

## 为什么 Plan Mode 能压住灾难循环

把机制拆开看，对应关系很直接：

| 没有检查点时 | 有 Plan Mode 时 |
|--------------|-----------------|
| 第一轮就可能 Edit | 批准前 Edit/Write 被权限模式挡住 |
| 探索日志与改码 diff 混在上下文 | 可选在批准时清空规划上下文 |
| 你不知道它打算动哪些文件 | `ExitPlanMode` 强制呈现计划供审查 |
| 完成标准模糊 | 计划里应写明验收命令 |

Plan Mode **不能**代替代码审查：批准后若你选了较宽松的模式，模型仍可能执行宽泛的 Bash。权限 `deny`、沙箱与 [Hooks](/claude-code-guide/hooks/) 仍是长期防线。

---

## 实战：用 Plan Mode 规划一次模块重构

假设目标：把 `src/legacy/auth.ts` 中的校验逻辑抽到 `src/auth/`，并保证现有测试通过。

**1. 进入规划**

```
/plan 将 legacy/auth.ts 的校验逻辑抽到 src/auth/，保持对外 API 不变，测试全部通过后再停
```

**2. 审查计划**

检查是否包含：将读取的文件、新建/删除的路径、迁移顺序、回滚方式、`npm test` 或项目等价命令。用 `Ctrl+G` 在编辑器里改计划，补上你团队必须的约束，例如「禁止改 `src/legacy/` 下除 auth 以外的文件」。

**3. 选择批准方式**

不熟代码库：选「逐条审查编辑」。信任目录且测试齐全：可选「批准后 acceptEdits」。仅在满足官方要求的账号与环境上才考虑 auto 类选项，并阅读 [auto mode](https://docs.anthropic.com/en/docs/claude-code-guide/permission-modes#eliminate-prompts-with-auto-mode) 的限制。

**4. 执行中抽查**

每完成计划中的一步，看任务列表与 `git diff`。若 diff 出现计划外文件，立即打断并要求回到计划或重新规划。

---

## 失败模式

| 症状 | 可能原因 | 下一步 |
|------|----------|--------|
| 一直 Read 不出计划 | 目标过大或缺少边界 | 缩小范围；要求先列文件清单再写步骤 |
| 计划很虚 | 未强制验收命令 | 在提示里写「必须包含测试命令与文件列表」 |
| 批准后改飞 | 选了过宽执行模式 | 改逐条审查；收窄 Bash allow |
| 不想规划却进了 Plan | 模型调用了 EnterPlanMode | 提示里禁止，或 `deny EnterPlanMode` |
| 计划对了执行仍错 | 上下文里残留错误假设 | 批准时尝试清空规划上下文；或 `/clear` 后只带计划执行 |
| 探索命令太多 | 在 plan 下仍广撒网 Bash | 限制探索范围；用 `@` 指向关键文件 |

---

## 决策边界：何时用、何时不用

| 场景 | 建议 |
|------|------|
| 错字、单行明显 bug | 直接 `default` 或 `acceptEdits`，不必规划 |
| 跨 3 个以上文件、架构二选一 | 用 Plan Mode |
| 不熟仓库的大功能 | 默认 `plan` 或先 `/plan` |
| 支付、鉴权、生产数据路径 | Plan Mode + 严格 deny + 人工审查每步 diff |
| 已有详细设计 doc / RFC | 可把 doc `@` 进会话，缩短规划轮次，但仍建议列验收 |

与 [CLAUDE.md](/claude-code-guide/claude-md/) 的配合：在 CLAUDE.md 里写「大改前先 `/plan`」「测试命令是 `pnpm test`」「禁止动 `migrations/`」，计划与执行都会更一致。那是下一章主题。

团队协作时，可把批准前的计划粘贴到 PR 描述或 issue，让人类 reviewer 与 Agent 共享同一份「契约」，减少「Agent 以为可以改、人以为不能改」的分歧。

---

## 继续读下一章之前

试着回答：

1. 权限模式 `plan` 与工具 `ExitPlanMode` 分别解决什么问题？  
2. 为什么 plan 模式下仍可能出现 Bash 弹窗？  
3. 批准计划后，循环与上一章讲的代理循环是什么关系？  
4. 什么情况下应重新 `/plan` 而不是继续补丁式 Edit？

自检清单：

- [ ] 用 `Shift+Tab` 或 `/plan` 完成过一次规划且未批准即退出  
- [ ] 审查过一份包含文件列表与验收命令的计划  
- [ ] 至少用一种批准方式走完执行段  
- [ ] 见过一次计划与执行偏离时的处理（修订计划或打断）  

---

下一章：[CLAUDE.md 的艺术](/claude-code-guide/claude-md/)——把项目约定写进持久记忆，让规划与执行阶段都默认遵守同一套规范。
