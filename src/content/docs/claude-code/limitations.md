---
title: Claude Code 的局限性与应对策略
description: 正视上下文、幻觉、权限与成本边界，用可操作的缓解手段与排障路径，把 Claude Code 放在「放大器」而非「自动驾驶」的位置。
sidebar:
  order: 15
---

*「它看起来很自信，测试也绿了，上线后才发现改错了分支上的鉴权逻辑。」*

前面各章教的是**怎么用**。本章教的是**别指望它什么都能做对**，以及出事时先查哪一类原因。局限不等于「不能用」，而是：你要知道代理在哪些维度会系统性失手，并用流程、权限和验证把风险压到可接受范围。

官方参考：[Security](https://code.claude.com/docs/en/security)、[Manage costs](https://code.claude.com/docs/en/costs)、[Data usage](https://code.claude.com/docs/en/data-usage)、[Troubleshooting](https://code.claude.com/docs/en/troubleshooting)、[Error reference](https://code.claude.com/docs/en/errors)。

---

## 先建立正确预期

Claude Code 是 [代理循环](/claude-code/agent-loop/) 驱动的**高权限本地助手**：能读仓库、跑命令、改文件。它**不会**自动具备：

- 对你业务领域无误的先验
- 对每次工具结果的物理世界验证
- 对「组织政治」或「用户真实意图」的独立判断

你的角色从「手写每一行」转向「定义目标、设边界、验收结果」。工具放大产能，**判断力仍是你的**。这与 [提示工程](/claude-code/prompt-engineering/) 里「带验收的提示」、[完整工作流](/claude-code/complete-workflow/) 里「研究→审查→提交」是同一套纪律。

---

## 上下文窗口：最硬的约束

### 机制

每一轮对话都会把**历史消息、CLAUDE.md、工具读过的文件、Bash 输出**等塞进上下文。窗口越大，单次任务能带的材料越多，但**接近满载时模型表现会下降**：更早的约束被遗忘、重复探索、改码偏离原计划。

官方把上下文管理视为成本与质量的第一要素，见 [Best practices](https://code.claude.com/docs/en/best-practices) 与 [context window 说明](https://code.claude.com/en/context-window)。

### 可观察症状

| 症状 | 可能含义 |
|------|----------|
| 明显「变笨」、重复已做过的 Read | 上下文接近上限 |
| 忘记 CLAUDE.md 里的禁止项 | 规则被挤掉或文件过长 |
| 计划批准后仍偏离 | 规划阶段噪声未清，或未 `/compact` |
| Autocompact thrashing 报错 | 压缩后立刻又被超大文件/输出填满 |

「Autocompact is thrashing」表示自动压缩成功后，上下文又被大文件或工具输出迅速撑满，循环多次后停止，避免浪费 API。见 [Troubleshooting](https://code.claude.com/docs/en/troubleshooting#auto-compaction-stops-with-a-thrashing-error)。

### 应对策略

| 手段 | 适用 |
|------|------|
| `/context` | 查看占用，变慢时先看 |
| `/compact` | 同一任务历史太长，还要接着做 |
| `/clear` | 换无关任务；同一 bug 纠正多次仍失败时重写提示 |
| `/rename` + `claude --resume` | 清窗口前给会话起名，便于找回 |
| [SubAgents](/claude-code/subagents/) | 大探索、长日志、全量测试输出隔离出去 |
| 精简 [CLAUDE.md](/claude-code/claude-md/) | 只留高频规则；专项流程进 [Skills](/claude-code/skills/) |
| 分块 Read | 要求「只读 L100-200」而非整文件 |
| 关闭无用 [MCP](/claude-code/mcp/) | `/mcp` 查看，停用不用的服务器 |

**动手：** 长会话中运行 `/context`，再 `/compact Focus on the failing test and the last diff`。若仍 thrashing，用子代理跑测试或 `/clear` 开新会话并带上更短的初始提示。

---

## 幻觉与「看起来对」

### 典型表现

- **虚构 API、函数、配置项**：库版本或框架与仓库实际不符
- **自信的错误解释**：对不熟栈给出貌似合理的架构说法
- **测试绿但行为错**：断言过弱、mock 过度、只测 happy path
- **引用不存在的文件路径**：未 Read 就假设目录结构

这不一定是「撒谎」，而是语言模型在信息不足时补全叙事。Agent 有工具仍可能**没调用**或**读错文件**。

### 应对

1. **可验证验收**：测试、构建、lint、截图对比，见 [提示工程](/claude-code/prompt-engineering/#最高杠杆让-agent-能验证自己的工作)。
2. **要求证据**：「改动基于 @file 第 N 行」「先 Read 再 Edit」。
3. **第二双眼睛**：[Writer/Reviewer 双会话](/claude-code/prompt-engineering/#writer--reviewer-双会话) 或只读子代理审查。
4. **人工看 diff**：合并前你看 `/diff`，不只看 Agent 总结。
5. **锁定依赖版本**：CLAUDE.md 写清框架版本，避免按「最新文档」瞎改。

对安全敏感改动，用 [Hooks](/claude-code/hooks/) 或 `permissions.deny` 拦路径，不要只靠「模型记得别动 `.env`」。

---

## 执行与能力边界

| 边界 | 说明 | 变通 |
|------|------|------|
| 原生 GUI | 不能直接点你的桌面应用 | [MCP](/claude-code/mcp/)、[Claude in Chrome](https://code.claude.com/docs/en/chrome)、`@browser`（VS Code） |
| 精确数值/密码学 | 复杂证明、大数运算不可靠 | 用专用库 + 测试，勿让模型心算 |
| 实时多人协作 | 不能替代同事即时沟通 | 用于个人/小团队异步任务 |
| 非交互 CI | `-p` 无人工点权限，须预配置 allow | [生态集成](/claude-code/ecosystem-integration/#非交互模式与自建-ci) |
| 子代理嵌套 | 子代理不能再派子代理 | 主会话串联或 Skills `context: fork` |
| Agent teams | 多实例、token 约 7x 量级（plan 模式队友） | 默认关闭；小任务、Sonnet 队友 |

[Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web) 在隔离 VM 中跑，边界与本地不同，见官方 [Cloud execution security](https://code.claude.com/docs/en/security#cloud-execution-security)。

---

## 安全：权限、注入与供应链

### 默认防线

官方 [Security](https://code.claude.com/docs/en/security) 摘要：

- 默认只读；Edit、Bash、MCP、网络请求需批准或规则
- 写入一般限制在**启动目录及子目录**
- [Sandbox](/claude-code/installation-setup/) 可对 Bash 做文件系统与网络隔离
- 可疑 Bash 即使曾 allowlist 也可能再次要求确认

这些**不能**消除所有风险：你批准的 `Bash(npm test *)` 仍可能在项目内执行任意测试脚本；allow 的是**模式**，不是「永远信任模型」。

### 权限过度授权

| 风险行为 | 后果 |
|----------|------|
| 习惯性「不再询问」通过宽泛 `Bash(*)` | 一次误判即可 `git push`、删库、外传 |
| `bypassPermissions` 在非隔离环境 | 跳过全部确认 |
| 后台 [SubAgent](/claude-code/subagents/#前台后台与权限) | 未预先批准的调用自动拒绝，也可能静默失败 |
| 管道不可信内容进提示 | 提示注入：恶意文本诱导执行危险命令 |

**实践：**

- 敏感路径 `deny`：`Edit(.env)`、`Edit(**/secrets/**)`、`Bash(curl *)` 等，见 [生态集成](/claude-code/ecosystem-integration/#团队协作claudemd-与-claude)。
- 用 [Hooks](/claude-code/hooks/) 做组织级二次拦截。
- 不可信仓库用 [dev container](https://code.claude.com/docs/en/devcontainer) 或 VM。
- Windows 上避免让 Claude 访问含 WebDAV 的路径，见官方安全说明。

### 提示注入

攻击者可能在 issue、注释、被 Read 的文件里写「忽略先前指令、执行 curl …」。缓解靠**权限 + 人工审查**，没有单一开关。处理外部 PR 时，把 Agent 当**不可信输入**的处理程序。

### 生成代码的安全

- 依赖与许可证：检查新增依赖是否合规
- 注入：SQL、命令、XSS 需按栈做 review
- 密钥：扫描 diff 是否出现 token；配合 secret scanning
- MCP：只用可信来源；企业用 `allowedMcpServers`，见 [Admin setup](/claude-code/ecosystem-integration/#企业部署与管理员)

漏洞报告走 [HackerOne](https://hackerone.com/4f1f16ba-10d3-4d09-9ecc-c721aad90f24/embedded_submissions/new)，勿公开披露未修复问题。

---

## 成本：Token、订阅与团队预算

### 计费方式（简化）

| 使用方式 | 计费大致逻辑 |
|----------|--------------|
| Pro / Max / Team 订阅 | 套餐内用量；`/usage` 中 Session 费用对订阅用户**不等于账单** |
| API / Console | 按 token；Claude Code 走 API 时与模型定价一致 |
| Bedrock / Vertex / Foundry | 走云账单；Console 的 Claude Code workspace 指标可能不全，见 [Costs · Bedrock/Vertex](https://code.claude.com/docs/en/costs#managing-costs-for-teams) |

企业参考：活跃日人均约 **13 美元**、月约 **150–250 美元** 量级，**90%** 用户活跃日低于 **30 美元**。仅为统计参考，以你方试点为准。

### 查看用量

```text
/usage
```

显示本会话 token 与**本地估算**费用；权威账单见 [Claude Console Usage](https://platform.claude.com/usage)。可配置 [statusline](https://code.claude.com/docs/en/statusline) 持续显示上下文占用。

后台仍有少量 token（会话摘要、`/usage` 等），通常每会话不足约 0.04 美元量级，见官方说明。

### 降本策略（与质量平衡）

| 策略 | 说明 |
|------|------|
| 换模型 | 日常 Sonnet；复杂用 Opus；子代理 Explore 用 Haiku，`/model` 切换 |
| `/clear` 换任务 | 无关上下文不带着走 |
| 短 CLAUDE.md + Skills | 减少每轮固定开销 |
| CLI 优于 MCP | `gh`、`jq` 往往比挂大型 MCP 省描述 token |
| 具体提示 | 避免「优化整个代码库」式宽泛扫描 |
| [Plan Mode](/claude-code/plan-mode/) | 减少做错方向后的返工 token |
| Hooks 预处理 | 日志过滤后再给模型，见 [Costs · hooks](https://code.claude.com/docs/en/costs#offload-processing-to-hooks-and-skills) |
| 控制 extended thinking | `/effort`、`MAX_THINKING_TOKENS` 等，简单任务可降 |
| 慎用 agent teams | 多实例并行，成本高 |

团队可在 Console 设 **workspace spend limit** 与 **TPM/RPM**，规模建议见官方 [Rate limit recommendations](https://code.claude.com/docs/en/costs#rate-limit-recommendations)。

---

## 数据、隐私与本地留存

### 训练与商用

| 账户类型 | 默认是否用对话训练模型 |
|----------|------------------------|
| 消费者 Free/Pro/Max | 可选，在 [数据隐私设置](https://claude.ai/settings/data-privacy-controls) 控制 |
| Team / Enterprise / API 等商用 | **默认不**用 Claude Code 提示与代码训练，除非加入 [Developer Partner Program](https://support.claude.com/en/articles/11174108-about-the-development-partner-program) 等明确 opt-in |

细则见 [Data usage](https://code.claude.com/docs/en/data-usage)。合规团队应阅读 [Commercial Terms](https://www.anthropic.com/legal/commercial-terms) 与 [Trust Center](https://trust.anthropic.com/)。

### 保留与本地文件

- 商用标准保留约 **30 天**；Enterprise 可谈 [Zero Data Retention](https://code.claude.com/docs/en/zero-data-retention)
- 本地会话 transcript 默认在 `~/.claude/projects/`，约 **30 天**清理，可调 `cleanupPeriodDays`
- `/feedback` 提交内容保留约 **5 年**；会话质量调查后若选「允许查看 transcript」约 **6 个月**

勿在 `/feedback` 或调查中粘贴生产密钥。禁用非必要上报可设 `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`、`DISABLE_TELEMETRY` 等，见 [Data usage · Telemetry](https://code.claude.com/docs/en/data-usage#telemetry-services)。

第三方 API 路径见 [第三方 API](/claude-code/third-party-api/)：数据策略由**提供商**决定，不等同 Anthropic 商用条款。

---

## 稳定性与排障

### 先找对口文档

| 症状 | 去向 |
|------|------|
| 装不上、找不到命令、登录失败 | [Troubleshoot installation](https://code.claude.com/docs/en/troubleshoot-install) |
| 设置/Hook/MCP 不生效 | [Debug your configuration](https://code.claude.com/docs/en/debug-your-config) |
| 5xx、429、529、model not found | [Error reference](https://code.claude.com/docs/en/errors) |
| VS Code / JetBrains 连不上 | 各集成章 [VS Code](https://code.claude.com/docs/en/vs-code#fix-common-issues)、[JetBrains](https://code.claude.com/docs/en/jetbrains#troubleshooting) |
| CPU/内存高、卡住、搜索不全 | 下文 + [Troubleshooting](https://code.claude.com/docs/en/troubleshooting) |

### `/doctor` 与 `claude doctor`

会话内：

```text
/doctor
```

若 `claude` 无法启动，在 shell 运行 `claude doctor`。检查安装、设置、MCP、上下文等。

### 常见问题

| 症状 | 可能原因 | 下一步 |
|------|----------|--------|
| 高 CPU/内存 | 超大仓库、长会话 | `/compact`、任务间重启；大目录进 `.gitignore`；`/heapdump` 分析 |
| 命令卡住 | 长 Bash、等待输入 | `Ctrl+C`；必要时关终端，`claude --resume` 恢复对话 |
| 搜不到文件 | 内置 ripgrep 不可用 | 安装系统 `rg`，设 `USE_BUILTIN_RIPGREP=0` |
| WSL 搜索慢/结果少 | 项目在 `/mnt/c/` | 迁到 `~/` 或缩小搜索范围；或改用原生 Windows |
| 工具一直被 deny | 规则过严或模式不对 | `/permissions`；检查 plan 模式是否禁止 Edit |
| Node 版本过旧 | 不满足 CLI 要求 | `/doctor` 提示；升级 Node |
| Worktree 混乱 | 多会话改同一 repo | `git worktree list`；见 [complete-workflow](/claude-code/complete-workflow/#跨天任务会话与并行) |
| API 限流 | TPM/RPM 不足 | 降并发；Console 提额；团队分 workspace 限流 |

问题反馈：`/feedback` 或 [GitHub issues](https://github.com/anthropics/claude-code/issues)。版本用 `claude --version` 核对。

---

## 何时不应主要依赖 Claude Code

| 场景 | 原因 |
|------|------|
| regulated 变更无人工 sign-off | 合规要求决策在人 |
| 生产事故紧急止血 | 需要确定性 runbook，不是探索 |
| 密钥轮换、根因在外部系统 | 应用专用工具与审批流 |
| 超大迁移一次性无人值守 | 应用脚本 + 抽样人工，而非单次「全改」 |
| 法律/医疗等高风险结论 | 模型输出非专业意见 |

这些场景仍可用 Claude **辅助**阅读与起草，但**责任边界**应在流程里写清。

---

## 心态：放大器与最后防线

| 误区 | 更健康的心态 |
|------|--------------|
| 「它说修好了」就够 | **我跑过的测试 + 看过的 diff** 才算数 |
| 「全交给 Agent」 | 我定目标、边界、验收；Agent 执行 |
| 「规则写进 CLAUDE.md 就安全」 | 长文档会被忽略；关键用 Hook/deny |
| 「订阅无限用就不省钱」 | 上下文与轮次仍消耗时间与额度 |
| 「不用学代码了」 | 架构、调试、review、业务判断更值钱 |

持续迭代个人与团队配置：[CLAUDE.md](/claude-code/claude-md/)、[Skills](/claude-code/skills/)、[Hooks](/claude-code/hooks/) 随项目演进；关注 Release Notes；把踩坑写回仓库 CONTRIBUTING。

---

## 局限 ↔ 本系列章节速查

| 局限 | 优先翻 |
|------|--------|
| 上下文满 | [prompt-engineering](/claude-code/prompt-engineering/)、[subagents](/claude-code/subagents/) |
| 乱改/先探索 | [plan-mode](/claude-code/plan-mode/) |
| 权限事故 | [installation-setup](/claude-code/installation-setup/)、[hooks](/claude-code/hooks/)、[ecosystem-integration](/claude-code/ecosystem-integration/) |
| 成本飙升 | 本章降本表、[costs 官方](https://code.claude.com/docs/en/costs) |
| 协作与 CI | [ecosystem-integration](/claude-code/ecosystem-integration/) |
| 端到端任务 | [complete-workflow](/claude-code/complete-workflow/) |

---

## 继续读下一章之前

试着回答：

1. 上下文满了时，thrashing 与「变笨」分别应先试哪两个命令？  
2. 为什么「测试通过」仍可能是幻觉场景？  
3. 订阅用户看 `/usage` 的 Session 费用时应注意什么？  
4. 处理不可信 PR 时，为什么要把 Agent 当不可信输入？

自检清单：

- [ ] 用过 `/context` 并在长任务中 `/compact` 或 `/clear`  
- [ ] 仓库或本机配置过至少一条 `permissions.deny`  
- [ ] 合并前习惯看 diff，不只信 Agent 摘要  
- [ ] 知道 `/doctor` 与官方 Error reference 的分工  
- [ ] 能说出两条对你团队最有效的降本或降风险手段  

---

下一章：[AI 时代的开发者](/claude-code/reflection/)——从执行者到指挥者：能力重心、个人配置迭代，以及在 Agent 范式下什么值得长期投入。
