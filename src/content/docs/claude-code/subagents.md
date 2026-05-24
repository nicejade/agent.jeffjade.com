---
title: SubAgents：上下文隔离与复杂任务拆解
description: 学会用 SubAgents 实现独立上下文、工具约束与并行执行，把探索、审查、实验性改动挡在主会话之外。
sidebar:
  order: 18
---

*「让它全库搜一遍鉴权实现，主会话里塞了几十份文件片段；接着改代码时模型已经记不住我最初只要动 middleware。」*

[代理循环](/claude-code/agent-loop/) 里，每一轮工具结果都会留在主会话上下文中。探索越大，后面执行越容易被噪声淹没。[Skills](/claude-code/skills/) 解决「流程模板懒加载」；[Hooks](/claude-code/hooks/) 解决「到点必跑」的脚本。**SubAgents** 解决另一类问题：有一块工作会产生大量中间输出，或需要不同的工具权限与模型，但**最终你只需要一段摘要**回到主会话。

官方说明见 [Create custom subagents](https://code.claude.com/docs/en/sub-agents)。本章目标：理解子代理何时被委派、如何自建与约束能力，并与 Skills、Plan Mode、权限规则配合使用。

---

## SubAgents 解决什么问题

| 手段 | 上下文 | 典型场景 |
|------|--------|----------|
| 主会话直接循环 | 共享，越跑越长 | 小改、需要频繁来回澄清 |
| [Plan Mode](/claude-code/plan-mode/) | 共享，但先只读规划 | 大改前先对齐计划 |
| **SubAgents** | **独立窗口**，只回传摘要 | 全库探索、并行调研、高噪声命令输出 |
| [Skills](/claude-code/skills/) `context: fork` | 由技能正文驱动子代理 | 斜杠一键跑隔离任务 |
| `/compact` | 压缩主会话 | 已污染时的补救，不如事前隔离 |

子代理不是「更聪明的模型」，而是**分工**：

1. **上下文隔离**：搜索命中、日志、测试全文留在子代理里，主会话只收到结论。
2. **能力约束**：用 `tools` / `disallowedTools` / `permissionMode` 限制能改什么、能跑什么。
3. **成本与速度**：例如内置 Explore 默认走 Haiku，把重探索从主模型上拆开。
4. **并行**：多个互不依赖的子任务可同时跑，再由主代理综合。

**动手：** 在仓库里输入：「用 Explore 子代理找出所有引用 `deprecatedAuth` 的文件，只把文件路径列表和每个文件一句说明返回给我，不要改代码。」观察主会话是否明显比「自己 Read 一堆文件」更短。再输入：「并行让子代理分别看 `src/api` 和 `src/middleware` 的测试覆盖缺口，各给三条建议。」

---

## 机制：主代理如何委派

主会话里的模型通过 **`Agent` 工具**（旧版配置里可能仍写作 `Task`，为别名）启动子代理。子代理收到**自己的系统提示**（来自内置定义或你的 `.md` 文件正文），加上工作目录等基础环境信息，**不会**继承 Claude Code 的完整主系统提示。

```
你在主会话描述目标
        ↓
主模型判断：是否匹配某子代理的 description
        ↓
调用 Agent → 子代理在独立上下文里多轮工具循环
        ↓
子代理结束 → 摘要写回主会话（中间每步工具默认不逐条展示）
        ↓
主模型继续整合、改码或再派下一个子代理
```

要点：

- **子代理不能再派子代理**。需要多层分工时，由主会话串联多个子代理，或用 [Skills 的 `context: fork`](/claude-code/skills/#与子代理的配合) 从技能侧发起。
- **权限继承再裁剪**：子代理继承主会话权限上下文，再按 frontmatter 收窄；后台子代理对会弹窗的操作**自动拒绝**，见下文。
- **令牌单独计费**：子代理窗口里的输入输出计入该次委派，与主会话分开。

与 [Plan Mode](/claude-code/plan-mode/) 的关系：在 `plan` 权限模式下，Claude 需要大量读库调研时，会委派内置 **Plan** 子代理做只读探索，避免规划阶段与执行阶段抢同一窗口，也避免子代理嵌套子代理。

---

## 内置子代理

Claude Code 自带若干子代理，一般无需你手动注册。主模型按任务与 `description` 自动选用；你也可在提示里点名或 `@` 提及。

| 名称 | 模型倾向 | 工具倾向 | 何时委派 |
|------|----------|----------|----------|
| **Explore** | Haiku，低延迟 | 只读（无 Write/Edit） | 搜文件、读结构、摸清代码库 |
| **Plan** | 继承主会话 | 只读 | [Plan Mode](/claude-code/plan-mode/) 下为写计划做调研 |
| **general-purpose** | 继承主会话 | 全套工具 | 既要探索又要改码的多步任务 |
| **claude-code-guide** | Haiku | 受限 | 问 Claude Code 产品功能时 |
| **statusline-setup** | Sonnet | 受限 | 运行 `/statusline` 配置状态栏时 |

Explore 被调用时，主模型还会指定 thoroughness：`quick`、`medium` 或 `very thorough`，控制探索深度。

**边界：** 单会话内委派见本章。多会话互通信与共享任务板见 [Agent Teams](/claude-code/agent-teams/)；仅统一监控多会话见官方 [agent view](https://code.claude.com/docs/en/agent-view)。

---

## 自定义子代理放在哪

子代理是带 YAML frontmatter 的 Markdown 文件。可用 `/agents` 图形界面创建，也可手写入库。

| 级别 | 路径 | 优先级 | 适用 |
|------|------|--------|------|
| 企业托管 | managed settings 下的 `.claude/agents/` | 最高 | 组织统一审计、审查代理 |
| CLI `--agents` JSON | 仅当前进程 | 高 | 脚本、一次性试验 |
| 项目 | `.claude/agents/` | 中 | 跟仓库共享、可 code review |
| 个人 | `~/.claude/agents/` | 较低 | 跨项目通用审查者 |
| 插件 | 插件内 `agents/` | 最低 | 分发模板包 |

**同名覆盖**：优先级高的定义生效。插件子代理在界面与 `@` 里常带作用域名，如 `my-plugin:code-reviewer`；插件 `agents/` 子目录会进入标识符，例如 `my-plugin:review:security`。

**发现规则**：

- 从当前工作目录**向上**到仓库根，收集沿途 `.claude/agents/` 与 `~/.claude/agents/`（可递归子文件夹，但 **`name` 字段全局唯一**，重名会静默丢弃其一）。
- `--add-dir` 附加目录**只扩文件访问**，不会从附加目录加载子代理定义；跨项目共享请用个人目录或插件。

通过 `/agents` 界面创建后**立即生效**；若直接在磁盘增删改 `.md`，通常需**重启会话**才能加载。

---

## 快速创建：/agents 与最小文件

### 用 /agents（推荐）

```text
/agents
```

在 **Library** 选 Create new agent，范围选 **Personal**（`~/.claude/agents/`）或 **Project**（`.claude/agents/`）。可用 **Generate with Claude** 生成 `description` 与正文，再勾选工具集、模型、颜色、是否启用 [persistent memory](https://code.claude.com/docs/en/sub-agents#enable-persistent-memory)。

保存后试用：

```text
用 code-improver 子代理扫描本仓库并列出可读性与性能方面的改进建议，不要直接改文件
```

**Running** 页可查看正在跑的子代理并停止。

### 手写最小文件

在项目中：

```bash
mkdir -p .claude/agents
```

`.claude/agents/code-reviewer.md`：

```yaml
---
name: code-reviewer
description: 代码质量与安全审查。在较大 diff 或 PR 前主动使用；只读，不修改文件。
tools: Read, Grep, Glob, Bash
model: sonnet
---

你是资深代码审查者。被调用时：
1. 用 git diff 或用户指定范围看变更
2. 按严重度输出：必须修、建议修、可选优化
3. 每条问题给出文件位置与改法示例
```

`name` 与 `description` 为必填。正文即子代理系统提示。文件名不必与 `name` 相同，但 `name` 应唯一且用小写连字符。

---

## frontmatter 常用字段

完整列表以官方 [Supported frontmatter fields](https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields) 为准。日常最常用：

| 字段 | 作用 |
|------|------|
| `name` | 唯一标识；Hook 的 `agent_type`、权限 `Agent(name)` 均引用它 |
| `description` | **决定何时自动委派**；写清场景，可加「主动使用」 |
| `tools` | 允许列表；省略则继承主会话全部工具 |
| `disallowedTools` | 黑名单，如 `Write, Edit` |
| `model` | `sonnet` / `opus` / `haiku` / 完整模型 ID / `inherit` |
| `permissionMode` | `default`、`acceptEdits`、`plan`、`dontAsk`、`bypassPermissions` 等 |
| `maxTurns` | 子代理最多代理轮数 |
| `skills` | 启动时**预加载**技能全文（见下节） |
| `mcpServers` | 仅该子代理可用的 MCP，或引用已连接服务器 |
| `hooks` | 仅在该子代理存活期间生效的 Hook |
| `memory` | `user` / `project` / `local` 持久记忆目录 |
| `isolation: worktree` | 在临时 git worktree 里改码，避免污染主检出 |
| `background: true` | 总是后台运行 |
| `color` | 任务列表中的显示色 |

**模型解析顺序**（简化）：环境变量 `CLAUDE_CODE_SUBAGENT_MODEL` → 单次调用参数 → frontmatter `model` → 主会话模型。

**限制子代理能派谁**：仅当用 `claude --agent` 把某定义当作**主线程**时，`tools` 里可写 `Agent(worker,researcher)` 白名单。普通子代理定义里写 `Agent(...)` **无效**，因为子代理不能再派子代理。

---

## 如何调用：自动、点名、整会话

### 自动委派

Claude 根据你的任务描述与各子代理的 `description` 决定是否委派。描述越具体，误派越少。例：

```yaml
description: 调试测试失败与运行时错误。遇到 CI 红或本地 test fail 时主动使用。
```

### 显式点名

自然语言：

```text
用 test-fixer 子代理修 vitest 失败，修完跑一遍测试，把失败用例与补丁摘要告诉我
```

`@` 提及（保证用到该子代理，提示仍由主模型写给子任务）：

```text
@"code-reviewer (agent)" 只看 auth 目录最近的变更
```

### 整会话当作某子代理

```bash
claude --agent code-reviewer
```

或在 `.claude/settings.json`：

```json
{
  "agent": "code-reviewer"
}
```

此时主线程使用该校验代理的系统提示与工具限制，`CLAUDE.md` 仍会按正常流程加载。适合「今天我只想做审查、不要大改」一类会话。

### 禁止某些子代理

`.claude/settings.json`：

```json
{
  "permissions": {
    "deny": ["Agent(Explore)", "Agent(my-noisy-agent)"]
  }
}
```

---

## 前台、后台与权限

| 模式 | 行为 | 权限 |
|------|------|------|
| **前台** | 阻塞主会话直到结束 | 需要确认的仍会弹窗 |
| **后台** | 你可继续输入；结果稍后以消息形式回到主会话 | **不弹窗**；未预先批准的调用自动拒绝 |

可说「在后台跑」或对运行中任务按 `Ctrl+B` 挂到后台。若后台因权限失败，可改前台重试同一任务。

禁用一切后台能力：

```bash
export CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1
```

**决策提示：** 需要你在子代理执行过程中逐条批准危险命令时，用前台；已用 `allow`/`acceptEdits` 放宽且任务独立时，后台更合适。

---

## 典型工作流模式

### 隔离高噪声输出

```text
派子代理跑完整测试套件，只把失败用例名、断言信息与可能相关的源文件路径返回给我
```

日志与长篇 stdout 留在子代理上下文，主会话保留结论。

### 并行调研

```text
并行：子代理 A 梳理认证模块，子代理 B 梳理数据库迁移，各给架构要点与风险，不要改代码
```

路径互不依赖时效果最好。若每个子代理都返回长篇报告，主会话仍可能被摘要总量撑满；极大规模并行考虑 [agent teams](https://code.claude.com/en/agent-teams)。

### 串行流水线

```text
先用 code-reviewer 子代理列出性能问题，再用 optimizer 子代理只处理其中前 3 条
```

由主会话持有中间结论，再派下一步。

### Git worktree 实验

frontmatter 加 `isolation: worktree`，子代理在临时 worktree 里改文件；无变更时 worktree 会自动清理。适合「试着重构一版，主分支先不动」。

---

## 与 Skills 的两种组合

上一章 [Skills](/claude-code/skills/#与子代理的配合) 已预告，这里对齐机制：

| 方向 | 配置 | 谁写系统提示 | 谁写任务 |
|------|------|--------------|----------|
| 技能驱动子代理 | Skill 设 `context: fork` + `agent: Explore` 等 | 子代理定义 + 技能正文注入 | `SKILL.md` 步骤 |
| 子代理预加载技能 | SubAgent frontmatter `skills: [api-conventions]` | 你的 `.md` 正文 | 主会话委派时的用户消息 |

`skills` 字段会在子代理**启动时**注入列出的技能全文，适合团队规范、错误处理模板。子代理仍可通过 Skill 工具调用未预加载的其他技能，除非你在 `tools` 里去掉 `Skill`。

`context: fork` 适合**任务明确**的技能，例如「调研 $ARGUMENTS 并列出相关文件」。若技能正文只有静态约定、没有可执行步骤，子代理可能很快返回空结果。示例见官方 [Run skills in a subagent](https://code.claude.com/docs/en/skills#run-skills-in-a-subagent)。

---

## 子代理上的 Hooks 与 MCP

### Hooks

- 在子代理 frontmatter 的 `hooks`：仅该子代理存活时运行；`Stop` 会当作 `SubagentStop`。
- 在 `settings.json` 的 `SubagentStart` / `SubagentStop`：主会话在子代理启停时跑脚本，例如 `db-agent` 启动时连测试库。

只读数据库子代理可结合 `PreToolUse` + `exit 2` 拦截写 SQL，模式与 [Hooks 一章](/claude-code/hooks/) 相同。官方 [db-reader 示例](https://code.claude.com/docs/en/sub-agents#database-query-validator) 可照搬。

### MCP 仅给子代理

`mcpServers` 可把 Playwright 等服务器**只挂到子代理**，主会话工具列表不出现，省主窗口描述 token。可内联定义，或引用已在设置里配置的服务器名。

**插件子代理限制**：插件自带的 agent 定义会忽略 `hooks`、`mcpServers`、`permissionMode`；需要这些能力时，把文件复制到 `.claude/agents/`。

---

## Fork 模式（实验）

设置环境变量 `CLAUDE_CODE_FORK_SUBAGENT=1`（需 Claude Code v2.1.117+）后：

- **Fork** 继承当前主会话的完整对话与工具，适合「旁路试一个方案」；工具调用仍不写入主 transcript，只回最终结果。
- 启用后，原会走 general-purpose 的委派可能改为 fork；`/fork` 命令行为也会变化。

```text
/fork 根据目前讨论起草 parser 的单元测试，不要改实现代码
```

Fork 与**命名子代理**对比：前者共享历史与系统提示，后者干净上下文 + 自定义 `tools`/`model`。详见官方 [Fork the current conversation](https://code.claude.com/docs/en/sub-agents#fork-the-current-conversation)。生产团队建议先小范围试用，行为可能随版本调整。

---

## 持久记忆 memory

`memory: project` 时使用 `.claude/agent-memory/<name>/`，可入库共享；`user` 在 `~/.claude/agent-memory/`；`local` 在项目内但不建议提交。启用后子代理会读写 `MEMORY.md` 等文件，适合「审查者记住本仓库常见坑」一类长期角色。

在提示里明确要求：「开始前先读你的 agent memory」「结束后把本次发现写入 memory」，效果更好。

---

## 恢复子代理与 transcript

每次 `Agent` 调用默认**新实例**。若要接着上次子代理的对话，让主模型 **resume** 同一 agent（需 [agent teams](https://code.claude.com/en/agent-teams) 实验能力下的 `SendMessage` 等机制，以你版本文档为准）。

子代理 transcript 在 `~/.claude/projects/{project}/{sessionId}/subagents/agent-{id}.jsonl`，与主会话压缩**独立**。主会话 `/compact` 不会清掉子代理文件。

---

## SubAgents、Skills、Hooks、主会话如何选

| 维度 | 主会话 | SubAgents | Skills | Hooks |
|------|--------|-----------|--------|-------|
| 上下文 | 一条长对话 | 独立窗口 | 调用时注入；`fork` 时隔离 | 共享 |
| 触发 | 你每句输入 | 委派 / `@` / `--agent` | `/skill` 或模型选用 | 事件自动 |
| 确定性 | 低 | 中，靠描述与工具限制 | 中 | 高 |
| 适合 | 迭代式改码、频繁澄清 | 探索、并行、噪声隔离 | 可复用流程模板 | 必须执行的检查 |

记忆口诀（与 [Skills](/claude-code/skills/#skillshookssubagents-如何分工) 一致）：

- **CLAUDE.md**：项目事实与默认约束。
- **Skills**：这类任务**怎么做**。
- **Hooks**：这一刻**必须发生什么**。
- **SubAgents**：需要**另一段上下文**去跑完再汇报。

---

## 调试与失败模式

| 症状 | 可能原因 | 下一步 |
|------|----------|--------|
| 从不自动派子代理 | `description` 太泛或与任务无关 | 改描述；或 `@` 显式指定 |
| 派错子代理 | 多个描述重叠 | 收窄职责；`deny` 误用的内置代理 |
| 子代理说无权限 | 后台运行且未预先 allow | 改前台执行或放宽 `permissions.allow` |
| 子代理很快结束、结果空 | Skill `fork` 无明确任务 | 给可验证步骤与验收标准 |
| 改了磁盘上的 agent 不生效 | 未重启会话 | 重启；或用 `/agents` 保存 |
| 主会话仍然很长 | 并行子代理各返回长文 | 要求「每条不超过 N 行」；减少并行数 |
| worktree 改动找不到 | 在临时 worktree 里 | 到 git worktree 列表合并或手动拷贝 |
| 插件 agent 的 Hook 不跑 | 插件定义忽略 hooks | 复制到项目 `.claude/agents/` |

调试子代理 transcript：打开上述 `subagents/agent-*.jsonl` 看重放。主会话加 `--debug` 可看委派与模型选择日志。

---

## 决策边界：该用 SubAgent 吗

**适合：**

- 全库搜索、读大量文件，只要结论进主会话。
- 并行摸多个模块，彼此弱依赖。
- 需要只读审查、专用模型或专用 MCP，与主会话工具集不同。
- 在 worktree 里做破坏性尝试。

**继续用主会话：**

- 两三轮就能说完的小改。
- 需要你每步盯着改、频繁改口的任务。
- 规划与实现强耦合、中间态都要参与讨论（可 [Plan Mode](/claude-code/plan-mode/) + 主会话执行）。

**改用 Skill 而非单独子代理文件：**

- 流程固定、常通过 `/deploy` 触发，且不需要长期独立的「角色人格」。
- 只想 fork 一次探索，已有 `context: fork` 模板。

**改用 Hook：**

- 无论谁执行，Edit 后都必须跑 formatter。

**不要用子代理：**

- 指望子代理再派子代理做三层编排。
- 把一句能答完的问题硬拆成多个子代理，开销大于收益。

---

## 团队落地建议

1. **项目子代理入仓**：把 `.claude/agents/` 与 `.claude/settings.json` 一并 review；`tools: Bash` 配合 `hooks` 做只读库访问。
2. **描述可测试**：PR 模板问「是否新增/改了子代理 description，触发场景是否写清」。
3. **与 CI 分工**：子代理适合交互式探索；无人值守流水线更宜用脚本 + [生态集成](/claude-code/ecosystem-integration/) 或 SDK [subagents](https://code.claude.com/docs/en/agent-sdk/subagents)。
4. **成本意识**：Explore 用 Haiku 省钱；大段 Sonnet 并行审查前评估配额。
5. **禁用噪声代理**：统一在 managed settings 里 `deny` 不需要的内置 Explore，若团队只希望主会话探索。

---

## 继续读下一章之前

试着回答：

1. 子代理与主会话在**上下文**上的根本区别是什么？  
2. 为什么后台子代理可能「突然做不了」需要弹窗的操作？  
3. `skills` 预加载与 Skill 的 `context: fork` 方向有何不同？  
4. 子代理能否再派子代理？若需要两层分工应怎么做？

自检清单：

- [ ] 用 `/agents` 或手写文件创建过一个带 `description` 的子代理  
- [ ] 成功用自然语言或 `@` 触发过一次委派  
- [ ] 能说出 Explore、Plan、general-purpose 的分工  
- [ ] 知道后台与前台在权限上的差异  
- [ ] 能判断任务应留主会话还是委派  

---

上一章：[Plugins 插件](/claude-code/plugins/) · 下一章：[Agent Teams 与多会话协作](/claude-code/agent-teams/)——多会话互通信与并行审查；再读 [MCP 协议](/claude-code/mcp/)。第五部分结束后进入 [编码向社区精选](/claude-code/skill-recommendations/)。
