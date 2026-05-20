---
title: Token 成本感知与会话经济学
description: 用 /context、/usage 与 statusline 监测窗口占用，判断何时 /compact 或新开会话，并用 paths 规则与大文件策略控制 monorepo 扫描成本。
sidebar:
  order: 19
---

*「我让 Claude『看一下整个 monorepo 有没有类似实现』，十分钟后测试才跑完。账单里那一格上下文占用，我直到变慢才想起来去看。」*

[上下文管理与多代理](/claude-code/context-management/) 讲**窗口满了怎么办**；本章建立**成本意识**：哪些动作在烧钱、如何在读数上做决策、如何用配置把探索范围收窄。官方见 [Manage costs](https://code.claude.com/docs/en/costs)、[Context window](https://code.claude.com/en/context-window)、[Commands](https://code.claude.com/docs/en/commands)。

---

## 先澄清三个「监测」命令

新手常把 `/status`、`/context`、`/usage` 混为一谈。它们分工不同：

| 命令 | 主要用途 | 与成本的关系 |
|------|----------|----------------|
| `/context` | 网格展示**当前会话上下文占用**、哪些记忆/工具过重 | **直接**关系窗口与 token |
| `/usage` | 本会话 token、**本地估算**费用、套餐限额（别名 `/cost`、`/stats`） | **直接**关系账单感知 |
| `/status` | 打开设置界面 Status 页：版本、模型、账号、**设置来源**（含 Enterprise managed） | 不替代 `/context`；用于确认策略是否生效 |

持续盯占用，可配置 [statusline](https://code.claude.com/docs/en/statusline)：用 `/statusline` 生成脚本，从 stdin JSON 读取 `context_window.used_percentage` 等字段，在终端底部显示进度条。

**动手：** 长任务中每隔约 15 分钟执行 `/context` 与 `/usage`，记下占用跳变最大的那一次工具调用（常见是全库 `Grep`、完整测试日志、或大文件 `Read`）。

---

## 上下文经济学：钱花在哪里

每一轮 [代理循环](/claude-code/agent-loop/) 都会把以下内容送入模型：

| 来源 | 特点 |
|------|------|
| 对话历史 | 随轮次线性增长；`/compact` 可摘要 |
| CLAUDE.md + `.claude/rules/` | 会话启动加载；无 `paths` 的规则**每轮都在** |
| 工具输出 | 单次可极大（测试日志、整文件 Read） |
| MCP 工具定义 | 未用的服务器也占定义开销 |
| 子代理摘要 | 比全文便宜，但仍占主窗口 |

官方强调：上下文管理是**成本与质量的第一要素**，见 [Best practices](https://code.claude.com/docs/en/best-practices)。

### 订阅用户看 `/usage` 时要注意

对 Pro / Max / Team 等订阅，`/usage` 里的 **Session 费用是本地估算，不等于账单**。权威用量见 [Claude Console Usage](https://platform.claude.com/usage)。后台仍有会话摘要、`/usage` 等少量 token，官方说明通常每会话不足约 0.04 美元量级，见 [Costs](https://code.claude.com/docs/en/costs)。

Bedrock / Vertex / Foundry 走云账单时，Console 的 Claude Code 指标可能不全，团队需在云侧对账。

---

## 何时 `/compact`，何时新开会话

与 [调试与错误恢复](/claude-code/debug-error-recovery/) 决策树一致，从**成本**角度补充：

| 信号 | 优先动作 | 原因 |
|------|----------|------|
| 同一任务、历史长、仍记得目标 | `/compact` + 聚焦说明 | 保留任务语义，扔掉噪声 |
| 任务换了、或纠正三轮仍失败 | `/clear` 或新会话 | 避免为纠错付重复全文 token |
| Autocompact thrashing | 子代理跑重探索，或 `/clear` | 压缩救不了「立刻又灌满」 |
| 跨天续作 | `HANDOFF.md` + 新会话 | 见 [上下文管理](/claude-code/context-management/) |
| 探索完成、进入窄范围实现 | `/clear` + 短提示 + `@` 关键文件 | 执行段只要少量文件 |

`/compact` 示例：

```text
/compact Keep: auth middleware decision, failing test name, files already edited. Drop: early repo-wide grep results.
```

压缩后 CLAUDE.md 仍会加载；部分技能在压缩中的保留行为见官方 [What survives compaction](https://code.claude.com/en/context-window#what-survives-compaction)。

### `/btw` 与旁路提问

中途查概念、不想污染主线时，用 `/btw`，见 [Slash 命令 · /btw](/claude-code/slash-commands/#btw不抢主线的旁白)。比在主任务里插入大段解释更省上下文。

---

## 大文件与大仓库的低成本策略

### 读文件：要范围，不要全文

```text
只 Read src/auth/middleware.ts 第 80–120 行，不要读整个 monorepo。
```

对日志：要求「只保留最后 50 行失败栈」，或让子代理跑命令后只返回摘要。

### 搜索：先目录，后全库

| 做法 | 成本 |
|------|------|
| 根目录无范围 `Grep` | 高，易触发大量片段 |
| `Grep` 限定 `src/api/` | 低 |
| 子代理做探索，主会话收结论 | 隔离噪声 |

在 CLAUDE.md 写明默认探索根路径，例如 `业务代码只在 packages/core/`。

### 用 `paths` 按需加载规则

`.claude/rules/` 中带 `paths` frontmatter 的规则，仅在 Claude **读取匹配文件时**加载，而不是每轮全量注入：

```markdown
---
paths:
  - "src/api/**/*.{ts,tsx}"
  - "tests/**/*.test.ts"
---

# API 层约定
- 新 endpoint 必须补 integration test
```

无 `paths` 的规则与 `.claude/CLAUDE.md` 一样在启动时加载。把专项规范拆进路径规则，可显著降低**每轮固定开销**。详见 [Memory · path-specific rules](https://code.claude.com/docs/en/memory#path-specific-rules)。

### MCP 与模型选择

- `/mcp` 停用不用的服务器，减少工具定义占用。  
- 简单任务 `/model` 选 Sonnet、`/effort low`，难题再用 Opus。见 [Slash 命令](/claude-code/slash-commands/)。

### Hooks 预处理

官方建议把日志过滤、统计等放到 Hooks，再只把摘要给模型，见 [Costs · hooks](https://code.claude.com/docs/en/costs#offload-processing-to-hooks-and-skills)。

---

## 团队级成本治理（预览）

| 手段 | 作用 |
|------|------|
| Console workspace spend limit | 硬顶 |
| TPM / RPM 限制 | 防突发 |
| managed settings | 统一禁用 bypass、限制 MCP |
| 共享降本 CLAUDE.md | 「禁止全库 Grep」等约定 |

组织部署细节见 [生态集成](/claude-code/ecosystem-integration/) 与 [团队与组织级落地](/claude-code/team-organization/)。

---

## 降本检查表

| 问题 | 动作 |
|------|------|
| 不知道占用 | 习惯 `/context`；配置 statusline |
| 不知道花了多少钱 | `/usage` + Console；订阅用户勿把 Session 估算当账单 |
| 探索拖垮会话 | SubAgent + 摘要；CLAUDE.md 写探索边界 |
| 规则太多 | 拆 `paths`；专项进 Skills |
| 测试日志巨大 | Hook 截断或 `pnpm test --filter` |

---

## 继续读下一章之前

试着回答：

1. `/status` 与 `/context` 分别解决什么问题？  
2. 为什么「扫一遍 monorepo」往往比「改十个文件」更贵？  
3. `paths` 规则与根 CLAUDE.md 在加载时机上有何区别？  
4. thrashing 时为何 `/compact` 可能不够？

自检清单：

- [ ] 长任务中至少看过一次 `/context` 与 `/usage`  
- [ ] 能说出 `/compact` 与 `/clear` 的成本差异  
- [ ] 仓库有一条探索范围约束或 `paths` 规则  
- [ ] 知道订阅用户 Session 费用需与 Console 对账  

---

下一章：[安全边界与权限心智](/claude-code/security-permissions/)——`--dangerously-skip-permissions` 的真实代价、allow/deny 设计，以及沙箱与人类确认边界。
