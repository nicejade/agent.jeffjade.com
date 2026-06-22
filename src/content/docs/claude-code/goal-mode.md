---
title: /goal 与跨轮持续目标
description: 设定可验证完成条件，让 Claude 跨多轮自主工作直到达标；掌握条件写法、独立评估者与成本边界。
sidebar:
  order: 34
---

*「迁移 API 要改二十个调用点，每修一轮我都要打字说继续。有没有办法我只说终点，让它自己跑到测试全绿？」*

上一章 [AI 时代的开发者](/claude-code/reflection/) 谈到把重复劳动交给 Agent。本章讲 Claude Code 里与此最直接对齐的原生能力：**`/goal`**。你设定一次完成条件，Claude 跨多个 turn 自主续跑，直到独立评估模型确认条件满足，或你手动清除 goal。

官方说明见 [Keep Claude working toward a goal](https://code.claude.com/docs/en/goal)。`/goal` 需要 **Claude Code v2.1.139 或更高版本**；以你本机 `claude --version` 与 `/` 命令面板为准。

---

## `/goal` 解决什么问题

默认 [代理循环](/claude-code/agent-loop/) 里，模型在一轮工具调用结束后会把控制权还给你。多步任务常见节奏是：

```
你提示 → Claude 做一轮 → 你审查 → 再提示「继续」→ 重复十几次
```

`/goal` 把中间的「继续」外包给系统：

```
你写完成条件 → Claude 跨多轮自主工作 → 每轮后独立评估者判是否达标 → 达标后 goal 自动清除
```

适合有**可验证终态**的工作：模块迁移直到测试全绿、按设计文档实现直到验收满足、修一组 bug 直到相关用例通过、清空带标签的 issue 队列。不适合「让代码更好看」这类无法从命令输出证明的目标。

---

## 最小路径

在交互会话里直接输入：

```text
/goal all tests in test/auth pass and the lint step is clean
```

要点：

- **立刻开始执行**，条件本身即本轮指令，无需再发额外 prompt。
- 界面出现 **`◎ /goal active`** 指示器，显示 goal 已运行时长。
- 每 turn 结束后，评估者给出简短理由；最近理由出现在状态视图与 transcript 里。

**查看与清除：**

```text
/goal          # 当前条件、运行时长、turn 数、token 消耗、评估者最新理由
/goal clear    # 提前结束；别名 stop、off、reset、none、cancel
/clear         # 开启新对话也会清除活跃 goal
```

**非交互：**

```bash
claude -p "/goal CHANGELOG.md has an entry for every PR merged this week"
```

跑完条件或你 Ctrl+C 中断前，进程会持续续跑。也支持 Desktop 与 [Remote Control](/claude-code/remote-sessions-channels/)。

**恢复会话：** 用 `--resume` 或 `--continue` 恢复时，**未完成的 goal 会恢复**；turn 计数、计时器、token 基线会重置。已达成或已清除的 goal 不会恢复。

每会话仅一个活跃 goal；新的 `/goal` 会**替换**当前 goal。条件最长 **4000 字符**。

---

## 机制：独立评估者

这是 `/goal` 与普通「做到我觉得完了就停」最大的区别。

| 角色 | 模型 | 做什么 |
|------|------|--------|
| 执行者 | 你选的主模型，如 Sonnet、Opus | 读文件、改代码、跑命令、思考 |
| 评估者 | 配置的 small fast model，默认 Haiku | 只读**完整对话 + 你的条件**，输出 yes/no 与简短理由 |

每 turn 结束后：

1. 评估者判断条件是否已满足。
2. **否**：理由作为下一 turn 的指导，自动续跑。
3. **是**：goal 清除，transcript 记录 achieved，控制权回到你。

官方表述：`/goal` 是 **session-scoped 的 prompt-based Stop hook**。持久化、可脚本化的 Stop hook 见 [Hooks · 三类节奏](/claude-code/hooks/#三类节奏会话回合工具)。

**必须记住的限制：** 评估者**不会**自己跑命令或读文件，只能根据 Claude **已经写进对话**的内容判断。若测试输出没出现在 transcript 里，它可能判「未完成」；若条件写得模糊，可能误判。写条件时要假设「法官只能看聊天记录」。

评估 token 走 small fast model 计费，通常远低于主 turn 消耗。

### 与默认循环的对比

```
默认：模型自己觉得做完了 → 停下来等你
/goal：模型做完一轮 → 另一个模型只看记录判是否达标 → 未达标则继续
```

执行者不必自证「我做完了」，减少过早收工。代价是条件必须可验证，且长会话会有 [上下文](/claude-code/context-management/) 与成本累积问题。

---

## 写好完成条件

官方建议一条能撑过多轮的条件，通常包含三要素：

1. **可衡量的终态**：测试结果、构建退出码、文件数量、空队列等。
2. **明确的验证方式**：Claude 如何证明，例如 `pnpm test` 退出码为 0、`git status` 工作区干净。
3. **必要约束**：路上不能破坏的边界，例如不得修改 `test/` 外测试文件、保持变更最小。

可加轮次或时间上限，例如 `or stop after 20 turns`。Claude 每 turn 应报告相对该上限的进度，评估者从对话里判断。

### 好条件与差条件

| 差：模糊、无法从记录验证 | 好：可衡量、输出能当证据 |
|---|---|
| improve the dashboard | `pnpm test` 退出码 0；`src/dashboard` 外无文件改动 |
| clean up the code | `pnpm check` 与 `eslint` 均退出码 0 |
| migration done | `rg 'legacy_client'` 无匹配；`go test ./...` 退出码 0 |

关键是给一条**真正可测量的终点线**，而不是「整理代码」这类没有命令能裁决的说法。

复杂任务可拆成多个顺序 goal，或把长条件分成 GOAL、SUCCESS CRITERIA、CONSTRAINTS、VERIFICATION 等小节，每节仍须落在可验证陈述上。

**示例（带约束）：**

```text
/goal Migrate API v1 to v2 in src/services, update all call sites,
ensure all existing tests still pass, do not modify test files outside src/services
```

**示例（带上限）：**

```text
/goal Implement feature X per DESIGN.md, all acceptance criteria met, or stop after 15 turns
```

---

## 与 `/loop`、auto mode、Stop hook 的分工

同一会话里「怎么启动下一轮」有几种方式，不要混用概念：

| 方式 | 下一 turn 何时开始 | 何时停 |
|------|-------------------|--------|
| `/goal` | 上一 turn 结束 | 评估模型确认条件满足 |
| `/loop` | 时间间隔到 | 你停止，或 Claude 自判完成 |
| Stop hook | 上一 turn 结束 | 你的脚本或 prompt 决定 |
| auto mode | **不**启动新 turn | 主模型自判完成 |

- **auto mode** 自动批准单 turn 内的工具调用，**不会**自动开下一轮。与 `/goal` 互补：auto 减少 turn 内弹窗，goal 减少 turn 间催促。无人值守长跑时常两者一起开。见 [安全边界与权限](/claude-code/security-permissions/)。
- **`/loop`** 按**时间间隔**重复提示，适合你在场、短周期重试。`/goal` 按**条件**续跑，适合「直到测试绿」类终点。下一章 [Routines 与定时自动化](/claude-code/routines-automation/) 会把 `/loop`、定时任务与云端 Routines 放在一张全景表里。
- **Stop hook** 写在 settings 里，跨会话生效，可接确定性脚本。`/goal` 是会话内快捷方式，不用改配置文件。

---

## 适用与不适用

**推荐使用：**

- 重构或迁移，直到编译与测试通过
- 按 spec 或 DESIGN.md 实现，直到验收标准满足
- 修复一组相关 bug，直到指定测试绿
- 处理已标记的 backlog，直到队列清空

**谨慎或不推荐：**

- 目标极度模糊，无法写成可验证陈述
- 完成与否依赖外部实时 API，且结果进不了 transcript
- 完全开放式探索，没有终点定义
- 极长、高风险的无人值守任务：须加 turn 上限、中途用 `/goal` 看 token、准备好 Ctrl+C

社区有人报告单次 goal 续跑数小时、token 费用很高。这类数字**因仓库与模型而异**，发布长任务前先用小 goal 试跑一轮。

---

## 失败模式与成本

| 症状 | 可能原因 | 下一步 |
|------|----------|--------|
| 明明做完仍续跑 | 测试或构建输出未写入对话 | 要求每轮贴命令与退出码 |
| 跑很久停不下来 | 条件不可测，或上下文腐烂 | 加 turn 上限；拆小 goal；必要时 `/compact` 或新会话 |
| token 飙升 | 多 turn 累积 | 无参数 `/goal` 看消耗；见 [Token 经济学](/claude-code/token-economics/) |
| 误判已完成 | 条件复杂且证据不足 | 人工看 `/diff`；把条件写得更可验证 |
| `/goal` 不可用 | 未信任工作区，或 hooks 被禁用 | `/doctor`；查 `disableAllHooks`、`allowManagedHooksOnly` |

`/goal` 仅在已接受工作区信任对话框时可用，因为评估者属于 hooks 体系。企业 managed 设置可能禁止；命令会说明原因，不会静默失败。

---

## 决策边界

| 场景 | 用 `/goal` | 更合适的替代 |
|------|------------|--------------|
| 直到 `pnpm test` 全绿 | 是 | — |
| 每 5 分钟重试一次部署 | 否 | `/loop` 或 Routines |
| 合 main 前必须跑的确定性检查 | 否 | CI + [Hooks](/claude-code/hooks/) |
| 单轮内少点批准弹窗 | 配合 auto | auto  alone 不会跨 turn |
| 跨会话持久化同一目标 | 否 | 自定义 Stop hook；社区工具有人做持久化，非官方 |

与 [Slash 命令](/claude-code/slash-commands/) 面板里其他命令一样，以你本机 `/` 列表是否出现 `/goal` 为准。

---

## 动手检查

在已配置好的项目根启动 `claude`，完成下面五项：

1. 对一条极小条件执行 `/goal`，例如某个单测文件全绿。观察 `◎ /goal active` 与评估者理由是否每 turn 更新。
2. 无参数运行 `/goal`，记录 turn 数与 token 字段含义。
3. 用 `/goal clear` 中途取消，确认指示器消失。
4. 各写一条「坏条件」和「好条件」，说明评估者能否仅凭 transcript 判定。
5. 用一句话区分 `/goal`、`/loop`、auto mode 各自解决什么问题。

五项都能解释，说明你可以把 `/goal` 用在真实多步任务上，而不只是记住命令名。

自检：

- [ ] 能解释独立评估者为何存在
- [ ] 能写出含终态、验证方式、约束的条件
- [ ] 知道评估者不看仓库、只看对话
- [ ] 知道何时该拆 goal 或加上限
- [ ] 读过官方 goal 页并对照本机版本

---

上一章：[AI Agent 时代的开发者](/claude-code/reflection/) · 下一章：[Routines 与定时自动化](/claude-code/routines-automation/)——从条件驱动续跑进入时间间隔与云端调度。
