---
title: 记忆、学习与 Skill
description: 掌握 MEMORY.md 与 USER.md 的 frozen snapshot、session_search、skill_manage 渐进披露与 Curator 维护机制。
sidebar:
  order: 4
---

*「Agent 说『我已经记住了』，但同一会话里它仍按旧偏好回答——多半不是撒谎，而是 frozen snapshot 还没在下一轮会话里生效。」*

第一章介绍了 closed learning loop 的概念。本章把三条腿拆开讲清：**声明式记忆**、**程序性记忆 Skill**、**会话检索**，以及 **Curator** 如何防止 Skill 库无限膨胀。依据官方 [Memory](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory)、[Skills](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills)、[Curator](https://hermes-agent.nousresearch.com/docs/user-guide/features/curator)。

## 三种「记住」方式，不要混为一谈

| 机制 | 存什么 | 何时进入模型上下文 | 典型问题 |
| --- | --- | --- | --- |
| `MEMORY.md` / `USER.md` | 精炼事实与偏好 | 每次会话开始，frozen 注入 | 「这台机器用什么包管理器？」 |
| Skill（`SKILL.md`） | 可复用工作流步骤 | 渐进披露：先索引，再 `skill_view` | 「按我们团队的流程发 PR」 |
| `session_search` | 历史对话原文 | 按需 FTS 查询 | 「上周是否讨论过某 API？」 |

三者互补。把一切都塞进 `MEMORY.md` 会触达字符上限；把流程只写在聊天记录里则无法跨会话复用。

## 声明式记忆：MEMORY.md 与 USER.md

默认路径：`~/.hermes/memories/`。

| 文件 | 用途 | 字符上限（默认） |
| --- | --- | --- |
| `MEMORY.md` | 环境、项目惯例、踩坑、任务日记 | 2,200（约 800 tokens） |
| `USER.md` | 用户身份、沟通偏好、禁忌 | 1,375（约 500 tokens） |

Agent 通过 **`memory` 工具**维护，支持 `add`、`replace`、`remove`。没有 `read` action：会话开始时内容已出现在系统提示中。

### Frozen snapshot：机制与边界

会话启动时，Hermes 从磁盘读取记忆，渲染成系统提示里的固定块，例如：

```text
══════════════════════════════════════════════
MEMORY (your personal notes) [67% — 1,474/2,200 chars]
══════════════════════════════════════════════
User's project is a Rust web service at ~/code/myapi ...
§
This machine runs Ubuntu 22.04, has Docker installed
```

要点：

1. **会话中途** `memory` 工具写入会立刻落盘，但**不会**更新当前会话里已冻结的系统提示块。
2. **下一次新会话**才会加载新内容。
3. 这样设计是为了保持提示前缀稳定，利于 [Prompt Caching](https://hermes-agent.nousresearch.com/docs/developer-guide/context-compression-and-caching)；工具返回值里会展示**实时**条目状态，Agent 仍能知道磁盘上的最新内容。

若你要求「记住」后立刻在同一会话看到行为变化，应把关键约束写进**当前用户消息**或 `AGENTS.md` / `SOUL.md`（配置章详述），不要只依赖 mid-session 的 `memory` add。

### replace / remove 的子串匹配

`replace` 与 `remove` 用 `old_text` 做**唯一子串**匹配，不必粘贴整段：

```python
# 记忆中有 "User prefers dark mode in all editors"
memory(action="replace", target="memory",
       old_text="dark mode",
       content="User prefers light mode in VS Code, dark mode in terminal")
```

子串匹配多条时会报错，要求更具体的 `old_text`。

### 该记什么、不该记什么

**适合写入**（官方鼓励 Agent 主动保存）：

- 用户偏好 → 通常 `user` target
- 环境事实、项目惯例、纠正过的命令 → `memory` target
- 明确说「记住」的周期性情报

**应跳过**：

- 过于笼统的句子
- 可随手搜到的百科事实
- 大段日志或代码 dump
- 已在 `SOUL.md` / `AGENTS.md` 中的静态指令

记忆满时 `add` 返回错误，Agent 应先 `replace` 合并条目再添加。系统提示头里的占用百分比超过约 80% 时，合并是合理策略。

### 安全扫描

写入前会扫描注入与外传模式，并拦截含不可见 Unicode 的内容。这是记忆会被注入系统提示的后果，不是可选装饰。

### 配置项

```yaml
# ~/.hermes/config.yaml
memory:
  memory_enabled: true
  user_profile_enabled: true
  memory_char_limit: 2200
  user_char_limit: 1375
```

## 会话检索：session_search

所有 CLI 与网关会话写入 `~/.hermes/state.db`，带 FTS5 全文索引。`session_search` 返回数据库中的真实消息，不经 LLM 摘要。

| 对比项 | 持久记忆 | session_search |
| --- | --- | --- |
| 容量 | 约 1,300 tokens 级固定占用 | 全部历史会话 |
| 延迟 | 已在系统提示 | 约 20ms 级查询 |
| 成本 | 每会话固定 token | 按需，无额外 LLM |
| 场景 | 关键事实常驻 | 「某次对话里说过什么」 |

人工浏览：

```bash
hermes sessions list
```

与 `hermes --continue` 配合：检索找到线索后，可用 `/resume` 打开完整会话。

## 程序性记忆：Skill 与渐进披露

Skill 是带 YAML frontmatter 的 Markdown，目录默认 `~/.hermes/skills/`，兼容 [agentskills.io](https://agentskills.io/) 标准。

### Level 0 / 1 / 2

```text
Level 0: skills_list()           → 名称 + 描述索引（约 3k tokens 量级）
Level 1: skill_view(name)        → 完整 SKILL.md
Level 2: skill_view(name, path)  → references/ 下某一文件
```

系统提示里通常只放 **Level 0**，避免一次性塞满上下文。需要步骤时再加载全文。

每个已安装 Skill 也对应一个 Slash，例如 `/plan`、`/github-pr-workflow`。运行 `/plan 设计 auth 迁移方案` 会加载该 Skill 指令并按 Skill 要求把计划写到工作区下的 `.hermes/plans/`。

### SKILL.md 最小结构

```markdown
---
name: my-skill
description: 一句话说明用途
version: 1.0.0
metadata:
  hermes:
    tags: [devops]
    category: devops
---

# 标题

## When to Use
触发条件。

## Procedure
1. 步骤一
2. 步骤二

## Pitfalls
已知失败模式。

## Verification
如何确认成功。
```

可选字段 `platforms: [macos, linux]` 会在不匹配的系统上隐藏该 Skill。

### skill_manage：Agent 自写 Skill 的条件

官方 [Skills — Agent-Managed](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills#agent-managed-skills-skill_manage-tool) 写明，Agent 应在例如以下情况后倾向创建或修订 Skill：

- 完成**复杂任务**（例如 **5 次以上工具调用**）并找到可行路径
- 经历错误与死胡同后摸清正确做法
- 用户纠正了做法
- 发现非平凡工作流

| Action | 场景 |
| --- | --- |
| `create` | 新建完整 `SKILL.md` |
| `patch` | 小范围修改，优先于整文件 `edit` |
| `edit` | 结构性重写 |
| `delete` | 删除整个 Skill |
| `write_file` / `remove_file` | 维护 `references/`、`scripts/` 等附属文件 |

**Hub 安装与用户安装**：`hermes skills install` 只能由**用户**执行；Agent 不能自行从未信任源拉包。Hub 状态在 `~/.hermes/skills/.hub/lock.json`。

**外部目录**：`config.yaml` 的 `skills.external_dirs` 可扫描只读共享目录；Agent 创建或修改仍只写入 `~/.hermes/skills/`。同名时本地优先。

### Skill 与 memory 的分工

| 写进 memory | 写成 Skill |
| --- | --- |
| 「项目用 pnpm，不用 npm」 | 「从 fork 到提 PR 的完整检查清单」 |
| 「用户讨厌冗长解释」 | 「K8s 滚动发布验证步骤」 |
| 单句可压缩的事实 | 多步、可重复、会演进的流程 |

## Curator：防止 Skill 库腐烂

自改进循环会持续往 `~/.hermes/skills/` 添加 Agent 创建的 Skill。若无维护，会出现大量窄重复条目，浪费 Level 0 索引 token。

Curator 是**后台维护**，不是 cron 守护进程。在 CLI 启动或 Gateway 空闲 tick 时检查：

1. 距上次运行 ≥ `interval_hours`（默认 168，即 7 天）
2. Agent 空闲 ≥ `min_idle_hours`（默认 2 小时）

满足则 fork 一个独立 `AIAgent` 做两阶段处理：

1. **确定性**：30 天未用 → `stale`；90 天未用 → 移入 `~/.hermes/skills/.archive/`
2. **辅助模型审查**：提议合并、patch 或归档

**不触碰**：`.bundled_manifest` 中的内置 Skill、`.hub/lock.json` 中的 Hub Skill。

**会触碰**：`skill_manage` 创建的、你手写放在 skills 目录的、以及 external_dirs 里被扫描到的同名 Skill。Curator **无法区分**「人手写的」与「Agent 写的」，重要 Skill 请提前 `hermes curator pin <name>`。

```bash
hermes curator status
hermes curator run --dry-run    # 预览，不修改
hermes curator pin my-workflow
hermes curator restore my-workflow
```

每次真实运行前会备份 `~/.hermes/skills/` 到 `.curator_backups/`；可用 `hermes curator rollback` 恢复。会话内可用 `/curator status` 等子命令。

审查模型走 `auxiliary.curator` 槽位，可在 `hermes model` 里指定比主模型更便宜的模型。

## 持久目标（Persistent Goals）

`/goal <描述>` 在会话元数据里保存**跨轮站立目标**：每轮结束后辅助模型（`goal_judge`）用 JSON 判定 `done` 或 `continue`，未完成则自动注入续跑提示，默认最多约 20 轮续跑（`goals.max_turns`）。用户任意真实消息会**抢占**续跑循环。

| 机制 | 说明 |
| --- | --- |
| 判定 | `auxiliary.goal_judge`，宜配便宜快模型 |
| 失败开放 | 法官出错视为 `continue`，预算兜底 |
| 持久化 | `SessionDB.state_meta`，`/resume` 可恢复 |
| 与 memory | memory 存事实；goal 存**本轮任务终点** |

子目标：`/subgoal` 追加条件，法官须同时满足原目标与全部 subgoal。适合「修完 lint 且补回归测试」类可验证终点；探索性闲聊不必开。入口提示见 [第一次对话](./first-conversation/#goal-与自动化续跑)。官方 [Persistent Goals](https://hermes-agent.nousresearch.com/docs/user-guide/features/goals)。

## 可选：外部记忆插件

内置 `MEMORY.md` / `USER.md` 与插件**并存**，不互相替换：

```bash
hermes memory setup
hermes memory status
hermes memory off
```

### 外部记忆插件生态对比

同时只能激活**一个**外部 provider；内置记忆始终在场。

| Provider | 定位 | 接入 | 数据归属 | 典型坑点 |
| --- | --- | --- | --- | --- |
| **Honcho** | 跨会话用户建模、 dialectic 推理 | `hermes memory setup` → honcho；`honcho.json` | Honcho Cloud 或自建 | `contextCadence` / `dialecticCadence` 配错导致成本或延迟飙升 |
| **OpenViking** | 向量 + 结构化检索 | `memory.provider: openviking` | 依部署 | 需单独服务与索引维护 |
| **Mem0** | 托管记忆 API | setup 向导 | Mem0 云 | 与内置 memory 重复写入时需理解镜像规则 |
| **Hindsight** | 长期反思型记忆 | provider 切换 | 服务商 | 延迟预取失败时表现为「偶发健忘」 |
| **Holographic** | 实验性/领域特化 | provider 切换 | 依实现 | 文档迭代快，以官方为准 |
| **RetainDB** | 本地/自托管 DB | provider 切换 | 本机或内网 | 备份与迁移需自行规划 |
| **ByteRover** | 字节级/代码向记忆 | provider 切换 | 依产品 | 大仓库索引耗时 |
| **Supermemory** | 第三方记忆 SaaS | provider 切换 | 服务商 | 密钥与合规审查 |

共性机制（官方）：注入 provider 上下文、每轮预取、回合同步、会话结束抽取、镜像内置 `memory` 写入，并增加 provider 专用工具。

**决策边界**：外部插件不能替代 `MEMORY.md` 的「始终在场精炼事实」；应用 Skill 存流程。新后端应发布**独立插件**，不进核心 `plugins/memory/` 树（见 [插件系统](./plugins-system/)）。

选型详解：[Memory Providers](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory-providers)。

## 记忆失效与修正

| 信号 | 可能原因 | 处理 |
| --- | --- | --- |
| 行为与 `USER.md` 矛盾 | frozen snapshot 或过时条目 | 新会话；`memory` replace；人工编辑 `~/.hermes/memories/` |
| 重复矛盾事实 | 多次 `add` 未合并 | 让 Agent `replace` 合并；或手工删段 |
| 外部 provider「幻觉记忆」 | 错误同步 | `hermes memory off` 对比；清 provider 侧数据 |
| Skill 与 memory 重复 | 分工不清 | 事实留 memory，流程迁 Skill |

```bash
hermes memory status    # 当前 provider
# 直接编辑（谨慎）：
${EDITOR:-nano} ~/.hermes/memories/MEMORY.md
```

触发 Curator 不会修 memory 文件；应用 `memory` 工具或人工编辑。若错误已进 Skill，用 [技能系统实战](./skills-in-practice/) 的 `pin` / `restore` 流程。

## 数据流总览

```text
会话开始
  ├─ 读取 MEMORY.md / USER.md → frozen 注入系统提示
  ├─ 扫描 ~/.hermes/skills/ → Level 0 索引注入
  └─ 加载 SOUL.md / AGENTS.md 等上下文文件（配置章）

对话进行中
  ├─ memory 工具 → 写磁盘，当前会话系统块不变
  ├─ skill_view / skill_manage → 按需加载或修改 Skill
  └─ session_search → 查 state.db FTS

会话结束 / 新会话
  └─ 新 frozen snapshot 反映最新 memory 文件

空闲且满足条件
  └─ Curator fork → stale / archive / 合并 Skill
```

## 故障模式

| 现象 | 可能原因 | 处理 |
| --- | --- | --- |
| 说记住了但行为仍旧 | frozen snapshot | 开 `/new` 或新 `hermes` 会话；或当场重申约束 |
| memory add 失败 | 超字符上限 | 让 Agent 合并条目；人工编辑 `~/.hermes/memories/` |
| Skill 找不到 | 未 reload | `/reload-skills` 或 `hermes skills` 检查路径 |
| 重要 Skill 被归档 | Curator 自动过渡 | `hermes curator restore`；事先 `pin` |
| session_search 无结果 | 关键词太泛或会话在别的 profile | `hermes sessions list` 确认 profile |
| Hub Skill 不生效 | 未 install 或平台限制 | `hermes skills install`；查 `platforms` 字段 |

## 决策边界

- **不要把长篇教程塞进 memory**：应写 Skill 或项目内文档，memory 只留索引级事实。
- **不要期待 Curator 理解业务关键性**：手写关键 Skill 务必 `pin`。
- **不要让 Agent 自装 Hub Skill**：供应链风险由用户控制安装。
- **不要用 session_search 替代 memory**：检索有延迟且占用对话轮次；常驻事实应进 `MEMORY.md`。
- **不要在本章未读配置章前就堆满 `AGENTS.md`**：静态人格与项目规则与 memory 有重叠，需分工。

## 动手练习

1. 在对话中明确一条偏好，例如「回复用简体中文且先给结论」，结束后检查 `~/.hermes/memories/USER.md` 是否出现对应条目。
2. 在同一会话再问一次偏好，观察是否仍按 frozen 块行为；开 `hermes` 新会话再验证是否更新。
3. 运行 `hermes skills list` 或会话内 `/skills`，记下 3 个 bundled Skill 名称与描述。
4. 执行 `hermes curator run --dry-run`，阅读报告里将被 stale 的 Skill。
5. 用 `hermes sessions list` 找到旧会话，在对话里问 Agent「我们是否讨论过 X」，观察是否调用 `session_search`。

## 苏格拉底式反思

1. 你团队里哪些知识适合 Skill，哪些只适合仓库里的 `CONTRIBUTING.md`？
2. 若 Curator 合并了两个相似 Skill，你如何从事后 `~/.hermes/logs/curator/` 的 `REPORT.md` 审计？
3. frozen snapshot 与 Prompt Caching 的权衡，对你「边聊边改人格」的需求意味着什么？

## 读者自测

- [ ] 解释 frozen snapshot 及新记忆何时生效。
- [ ] 对比 memory、Skill、session_search 各解决什么问题。
- [ ] 说出 Skill Level 0 与 Level 1 的差异。
- [ ] 复述官方建议的 `skill_manage` 创建时机（含 5+ tool calls 表述）。
- [ ] 说明 Curator 不处理哪两类 Skill，以及 `pin` 的作用。

---

下一章：[配置与个性化](./configuration-personalization/)，展开 `config.yaml`、`.env`、`SOUL.md`、`AGENTS.md` 与 Profile（`hermes -p`）。
