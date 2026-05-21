---
title: 从零实现类似 Agent
description: 按九阶段路线图实现 Agent 循环、工具注册表、冻结记忆与 Skill 披露、Gateway 与 MCP，并避开常见架构陷阱。
sidebar:
  order: 15
---

*「只想做一个能调工具和记住偏好的 CLI，却先写了 Telegram 网关——结果三周过去，循环还没跑通。」*

读完 [架构拆解](./architecture-deep-dive/)，你已经知道 Hermes 把**一个 `AIAgent` 循环**接到多种入口。本章面向「要自己造轮子或做内部 fork」的读者：用分阶段清单说明最小可交付路径、每阶段验收标准，以及社区 [Build-Your-Own 导读](https://dev.to/truongpx396/hermes-agent-deep-dive-build-your-own-guide-1pcc) 与官方 [Contributing](https://github.com/NousResearch/hermes-agent/blob/main/CONTRIBUTING.md) 的对照关系。时间估算因人而异；下文阶段名中的「天」仅表依赖顺序，不是日历承诺。

**前置**：能读懂 Python 或同类语言，并已在 Hermes 上跑通过 [第一次对话](./first-conversation/) 与 [技能系统实战](./skills-in-practice/)。

## 目标画像：你要造的是什么

Hermes 式 Agent 不是「聊天 API 套壳」，而是同时具备：

| 能力 | 最小可观察行为 |
| --- | --- |
| 工具循环 | 模型返回 function call → 执行 → 再调模型 |
| 持久会话 | 重启后可 `--continue` 或按标题恢复 |
| 人格与事实文件 | `SOUL.md`、`MEMORY.md` 注入 system |
| 程序性记忆 | `SKILL.md` + 渐进披露 + Agent 可写回 |
| 可选多入口 | CLI 先成，Gateway/MCP 后挂 |

一句话心智模型：**循环负责干活，文件夹负责变聪明**；工具、网关、Provider 都是让循环更快、更安全、触达更广的脚手架。

## 九条设计原则（实现时当 checklist）

摘自 Hermes 架构文档与社区 deep dive，实现自有 Agent 时建议默认遵守：

1. **平台无关核心**：Telegram 分支不要写进循环体，只在 adapter 翻译事件。
2. **Prompt 稳定**：system 会话内字节级稳定，利于缓存与记忆语义；变更推迟到「下一会话」。
3. **渐进披露**：Skill 先索引后 `read_skill`，工具 schema 按组启用。
4. **自注册**：`registry.register()` at import，避免手工维护工具列表。
5. **Profile 隔离**：所有路径经 `get_home()`，禁止硬编码 `~/.hermes`。
6. **Agent 拥有学习产物**：Skill 由任务后工具写入，而非人手改仓库。
7. **工具错误进对话**：handler 抛错应变成 tool result，不可炸穿循环。
8. **迭代预算**：无上限时模型会 `list_dir` 数百次；硬 cap 并友好收尾。
9. **执行面分级**：开发 `local`，生产容器或 SSH 分离。

## 阶段 1：最小 Agent 循环

**交付**：`run_conversation(messages) -> messages`（或返回最终 assistant 文本）。

```text
while True:
    response = call_llm(messages, tools=schemas)
    if response.tool_calls:
        for call in response.tool_calls:
            result = dispatch(call)
            messages.append(tool_result(result))
        continue
    return response.text
```

验收：模型能根据你编造的「假天气 API」工具返回，完成两轮以上 tool call。此步已有「工具型聊天机器人」约八成价值。

陷阱：未 `try/except` 的工具异常会直接终止会话；应对每个 handler 捕获并返回错误字符串。

## 阶段 2：CLI 与会话持久化

**交付**：REPL、`Ctrl+C` 单次中断、SQLite 存消息。

建议表结构：sessions(id, title, created_at)、messages(session_id, role, content, tool_calls_json)。为 `content` 建 **FTS5** 虚拟表，供日后 `session_search` 类工具使用。

验收：退出再进，同 session 历史仍在；中断时正在进行的 HTTP 请求可被放弃且不把半条 assistant 写入历史。

## 阶段 3：工具注册表与五个起步工具

**交付**：`registry.py` + import 时注册；实现：

| 工具 | 作用 |
| --- | --- |
| `read_file` / `write_file` / `list_dir` | 文件面 |
| `run_shell` | 先仅 local |
| `web_fetch` | 简单 HTTP GET |

加 **toolsets** 概念：例如 `minimal = {read_file, run_shell}`，`full` 再加 web。会话启动时只把启用组的 schema 发给模型。

验收：新增 `tools/foo.py` 只改一处文件即可在 CLI 列出 `foo`。

阶段末可加 `terminal.backend` 配置，为阶段 7 Docker 留接口。

## 阶段 4：记忆与人格

**交付**：`~/.youragent/SOUL.md`、`MEMORY.md`、`USER.md`；`build_system_prompt()` 按 SOUL → MEMORY → USER 嵌入；Agent 级工具 `memory`（append/replace/delete）写盘。

**冻结快照**：会话开始时读入 memory 文本并固定进 system；会话中工具改文件但不改已发送的 system。与 Hermes 一致，避免破坏 Prompt Cache，也让「本会话内刚记住的事实」与「提示里的事实」可区分。

验收：第一轮让 Agent `memory` 写入一条偏好；不重启会话再问「我偏好什么」，观察是否需依赖 tool result 或新开 session 才进入 system。

可选：对 `AGENTS.md` 做注入前扫描（忽略指令、零宽字符），见官方 Security 文档。

## 阶段 5：Skill 与 closed loop 起点

**交付**：

- 目录 `skills/<name>/SKILL.md`，frontmatter + Procedure。
- L0：`skills_list()` 仅名称与描述。
- L1：`skill_view(name)` 全文。
- L2：按需读 skill 内引用文件。
- `skill_manage(create|patch|edit|delete)`，官方建议复杂任务在 **5+ tool calls** 后再创建，勿写死社区「15 次」说法。

在 system 中加一句明确授权：「完成非平凡任务后，应把步骤写入 Skill。」这是从聊天机器人迈向自改进的关键 nudge。

验收：完成多步任务后生成 Skill；新会话用 `/skillname` 或 `skill_view` 能复现流程。

可选：简易 Curator（合并重复 Skill、归档长期未用），对应 Hermes `hermes curator`。

## 阶段 6：Prompt Caching 与压缩

**交付**：

- 若用 Anthropic：在 system 末条加 `cache_control` ephemeral。
- CI 或单测：同 session 第 1 轮与第 10 轮 system **字节相同**（无 `datetime.now()` 注入）。
- 当 messages token > 50% 窗口：剪旧 tool 输出 + 中间段 LLM 摘要 + 保留 tail。

验收：`/usage` 或日志见 cache read 相关字段（若 Provider 暴露）；超长会话不 API 413。

陷阱：每轮刷新 memory 进 system 会使成本约 × 轮数；Hermes 用 frozen + 工具返回值提示最新磁盘状态。

## 阶段 7：Gateway（一个平台即可）

**交付**：例如 Telegram adapter：鉴权 → session key → `run_conversation` → 格式化回复。

必须做：

- allowlist 或 pairing，默认 deny。
- 与 CLI **同一** `HERMES_HOME` 时，验证 Telegram 里写的 `MEMORY.md` CLI 可读。

验收：同一用户 CLI 与 Telegram 共享记忆；未授权 user id 被拒。

Cron 可与本阶段并行：无历史 Agent、到期执行、deliver 到 home channel；存储用 JSON job 列表，路径防遍历。

## 阶段 8：MCP

**交付**：stdio MCP 客户端；每个 server 映射为 toolset `mcp-<name>`；环境变量仅传 MCP config 里声明的项。

验收：连接只读 filesystem MCP，Agent 列出指定目录；主机 `OPENAI_API_KEY` 不出现在 MCP 子进程环境中。

## 阶段 9：Profile 与打磨

**交付**：`--profile work` → `~/.youragent-work/`；压缩、fallback、迭代预算、可选 `hermes doctor` 类自检。

验收：两 profile 并行跑 Gateway 不抢同一 bot token（若你实现了 token lock）。

## 与 Hermes 仓库的对照表

| 你的阶段 | Hermes 参考 |
| --- | --- |
| 循环 | `run_agent.py` |
| Prompt | `agent/prompt_builder.py` |
| 工具 | `tools/registry.py`、`toolsets.py` |
| 记忆 | `tools/memory_tool.py`、`agent/memory_manager.py` |
| Skill | `agent/skill_commands.py`、bundled `skills/` |
| Gateway | `gateway/run.py`、`gateway/platforms/` |
| Slash | `hermes_cli/commands.py` `COMMAND_REGISTRY` |
| 压缩 | `agent/context_compressor.py` |
| MCP | `tools/mcp_tool.py` |

不必复制 70+ 工具；先 **5 工具 + 3 文件记忆 + Skill** 即可验证闭环。

## 技术选型（可替换）

| Concern | Hermes | 合理替代 |
| --- | --- | --- |
| 语言 | Python 3.11+ | Go 单二进制、TS 全栈 |
| 存储 | SQLite + FTS5 | 同级即可，慎换复杂向量库当先手 |
| 配置 | YAML + `.env` | TOML |
| 沙箱 | Docker / Modal | Firecracker、E2B |
| 文档格式 | Markdown Skill | 同左，便于 Agent `cat` 自检 |

「无聊」选型（SQLite、Markdown）Often 是为让 Agent 用自己的文件工具维护自身状态。

## 常见陷阱（按出现顺序）

1. 工具异常未捕获 → 循环崩溃。
2. system 含每轮变化的时间戳 → 缓存与成本模型失效。
3. 无迭代上限 → 无限 `list_dir`。
4. 生产仍 local shell → 等同裸奔，需容器或 SSH。
5. Skill 引用不存在的工具 → 安装时校验 `requires_toolsets`。
6. `MEMORY.md` 无限增长 → system 提示定期 consolidate。
7. 测试污染真实 `~/.youragent` → mock home 环境变量。
8. 中途切换 toolset 破坏前缀 → 默认「下一会话生效」。
9. Gateway 并发两条消息 → per-session 锁。
10. reasoning 块有时保存有时丢弃 → 破坏 Provider 历史一致性。

## 决策边界

- **不要跳过阶段 1–4 直接做 Gateway**：循环与记忆未稳时，多入口只放大 bug。
- **不要把 LangChain 当必需**：Hermes 选择薄封装 + 自有 registry；你可同样保持循环可读。
- **不要追求功能对标 70 工具**：先闭环再扩展 MCP。
- **社区「15 次才写 Skill」非官方**：以官方 **5+ tool calls** 等表述为准。

## 动手练习

1. 用伪代码写出 8 行的 `run_conversation` 循环，标出 tool call 分支。
2. 设计你的 `registry.register(name, schema, handler)` 签名，写清与 toolset 过滤的交互。
3. 列出 frozen memory 下，用户说「记住我喜欢 pytest」后的两条可测预期（同会话 vs 新会话）。
4. 选一个阶段作为你两周内的 MVP 终点，写下验收命令三条。
5. 对照 Hermes `tools/registry.py` 与一个最简单工具文件，标出 3 处你会照抄的设计。

## 苏格拉底式反思

1. 你的组织更需要 Hermes 本体、内部 fork，还是从零迷你 Agent 证明概念？
2. 若没有 Skill，仅靠长 system 与 RAG，会损失什么可审计性？
3. Profile 隔离对你的「工作/个人」分轨是否必要，还是单 home 就够？

## 读者自测

- [ ] 说出九阶段中任意三阶段的交付物与验收标准。
- [ ] 解释 frozen snapshot 对缓存与测试的意义。
- [ ] 对比自注册 registry 与中央 import 列表的取舍。
- [ ] 列出 Gateway 比 CLI 多做的两件安全相关的事。
- [ ] 说明 Skill L0/L1 与 `skill_manage` 在闭环中的角色。
- [ ] 指出两条「无聊技术选型」背后的工程理由。

---

下一章：[贡献与社区](./contributing-and-community/)，说明 Skill/Tool 贡献路径、Skills Hub 与 Trajectory；全系列收束见 [系列总结与自测](./series-summary-and-self-test/)。
