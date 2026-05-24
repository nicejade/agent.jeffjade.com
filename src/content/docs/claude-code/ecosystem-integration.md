---
title: Claude Code 与生态的深度集成
description: 从本机、仓库到组织三层落地 Claude Code：协作记忆、CI 触达与企业策略，并链到多平台与 CI 专章。
sidebar:
  order: 27
---

*「个人在终端里用得顺手，但团队要统一权限、PR 里要能 @ 机器人、JetBrains 同事也要 diff 进 IDE。」*

[完整实战工作流](/claude-code/complete-workflow/) 讲的是单人如何在仓库里完成任务。本章讲**组织层集成总览**：三层分工、仓库内协作规范、企业策略与推广节奏。本机选型与 IDE 安装见 [多平台运行环境全览](/claude-code/platforms-overview/)；GitHub/GitLab 与 PR 审查见 [CI/CD 与代码审查集成](/claude-code/ci-cd-integrations/)；程序化嵌入见 [Agent SDK](/claude-code/agent-sdk/)。

机制仍建立在 [代理循环](/claude-code/agent-loop/)、[CLAUDE.md](/claude-code/claude-md/) 与 [Hooks](/claude-code/hooks/) 之上。

官方入口：[Admin setup](https://code.claude.com/docs/en/admin-setup)、[Platforms](https://code.claude.com/docs/en/platforms.md)。

---

## 生态全景：三层集成

```
开发者本机                仓库与 CI                    组织策略
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ VS Code / Cursor│      │ GitHub Actions  │      │ managed settings│
│ JetBrains 插件  │      │ @claude / 定时   │      │ 权限 / 沙箱 / MCP│
│ 终端 claude CLI │      │ claude -p 脚本   │      │ 审计与用量看板   │
│ Desktop 并行会话│      │ CLAUDE.md 入库   │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

| 层 | 你要解决什么 | 典型产物 |
|----|--------------|----------|
| 本机 | 写代码时的交互与 diff | 扩展、插件、`~/.claude/settings.json` |
| 仓库 | 协作与自动化 | `.github/workflows/`、`.claude/`、根目录 `CLAUDE.md` |
| 组织 | 合规与成本 | managed-settings、deny 规则、Bedrock/Vertex 等 |

**动手：** 画出你团队当前缺哪一层。只有个人终端、没有入库 `CLAUDE.md`，通常先补仓库层再推组织层。

| 层 | 深入阅读 |
|----|----------|
| 本机 | [多平台运行环境全览](/claude-code/platforms-overview/) |
| 仓库 | 本章「团队协作」+ [CI/CD 集成](/claude-code/ci-cd-integrations/) |
| 组织 | 本章「企业部署」+ [团队与组织级落地](/claude-code/team-organization/) |

---

## Neovim、Emacs 与其它编辑器

无官方 GUI 插件时，标准路径是 **终端 + CLI**：

1. 在项目根用内置终端跑 `claude`
2. 用 [CLAUDE.md](/claude-code/claude-md/) 与 [Skills](/claude-code/skills/) 固化流程
3. 需要 IDE diff 时，在 VS Code/JetBrains 开同仓库并用 `/ide` 或扩展

Neovim/Emacs 用户常把终端分屏或 tmux 与编辑器并排；`@` 引用在 CLI 中同样可用。IDE 插件选型、Desktop 与 Web 见 [多平台运行环境全览](/claude-code/platforms-overview/)。

---

## CI 与流水线（摘要）

GitHub Actions、`@claude`、GitLab、`claude -p` 与多代理 Code Review 的逐步配置见 [CI/CD 与代码审查集成](/claude-code/ci-cd-integrations/)。仓库层务必 **CLAUDE.md 与 `.claude/settings.json` 入库**，并与 workflow 同级 review。

交互式会话与流水线无人值守要分开设计：后者必须限制 `--allowedTools`、`--max-turns`，且禁止在无人工批准时直推 main。

---

## 团队协作：CLAUDE.md 与 `.claude/`

### 分层记忆

| 位置 | 是否提交 Git | 用途 |
|------|--------------|------|
| 仓库根 `CLAUDE.md` | 是 | 全员默认：命令、结构、规范 |
| `CLAUDE.local.md` | 否，加入 `.gitignore` | 个人路径、本地工具偏好 |
| 子目录 `CLAUDE.md` | 视需要 | monorepo 模块级规则，按需加载 |
| `~/.claude/CLAUDE.md` | 个人 | 跨项目习惯 |
| `.claude/settings.json` | 通常**是** | 团队权限 allow/deny、默认模式 |
| `settings.local.json` | 否 | 个人覆盖 |
| `.claude/skills/`、`hooks/`、`agents/` | 建议是 | 可 review 的流程与策略 |

原则与 [CLAUDE.md 一章](/claude-code/claude-md/) 一致：**短、高频、可验证**；长流程进 Skills，硬约束进 Hooks 或 `permissions.deny`。

### 权限与安全策略（仓库级）

示例 `.claude/settings.json`：

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run test *)",
      "Bash(npm run lint *)",
      "Read",
      "Grep",
      "Glob"
    ],
    "deny": [
      "Bash(git push *)",
      "Edit(.env)",
      "Edit(**/secrets/**)"
    ]
  }
}
```

`deny` 优先于 `allow`。合并到 main 前应由安全或负责人 review，与改 CI 同级。

### Hooks 与审计

组织级拦截用 [Hooks](/claude-code/hooks/)：`PreToolUse` 拦危险 Bash、写操作日志进 SIEM。企业可 `allowManagedHooksOnly`，仅运行托管 Hook。

开发者跑 `/status` 可看到是否加载 **Enterprise managed settings** 及来源 `(remote)`、`(file)`、`(plist)` 等。

---

## 企业部署与管理员

管理员按 [Admin setup](https://code.claude.com/docs/en/admin-setup) 顺序决策：

| 步骤 | 决策内容 |
|------|----------|
| API 提供商 | Teams/Enterprise、Console、Bedrock、Vertex、Foundry |
| 策略下发 | Server-managed、plist/注册表、`/etc/claude-code/managed-settings.json` |
| 强制项 | `permissions.deny`、沙箱、`allowedMcpServers`、`allowManagedHooksOnly` |
| 可观测性 | [Analytics](https://code.claude.com/docs/en/analytics)、OpenTelemetry [Monitoring](https://code.claude.com/docs/en/monitoring-usage) |
| 数据 | [Data usage](https://code.claude.com/docs/en/data-usage)、ZDR 等 |

**注意：** 仅 Bedrock/Vertex/Foundry 凭证时，[Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web)、部分 Code Review、Routines 等可能不可用，需额外 Teams 席位。见各功能页 Plan 要求。

托管 **managed CLAUDE.md** 可向全员注入合规指令，且无法被项目排除。与项目 `CLAUDE.md` 并存时，以官方 [precedence](https://code.claude.com/docs/en/settings#settings-files) 为准。

沙箱与 `deny WebFetch` 不同：若允许 Bash，`curl` 仍可能出站；敏感环境应开 [沙箱隔离机制](/claude-code/sandboxing/) 的网络域白名单。

国内或自建网关场景见本系列 [第三方 API](/claude-code/third-party-api/) 与官方 [LLM gateway](https://code.claude.com/docs/en/llm-gateway)。

---

## 在团队内推广

### 建议节奏

| 阶段 | 动作 | 成功标志 |
|------|------|----------|
| 1. 试点 | 1～2 个 repo 入库 `CLAUDE.md` + 示例 Skill | 能完成 [complete-workflow](/claude-code/complete-workflow/) 练习 B |
| 2. 规范 | 统一 `settings.json` deny、PR 模板提醒审查 diff | 无 `.env` 误提交事件 |
| 3. CI | 启用 `@claude` 或 `-p` 审查，先只读后实现 | PR 上有可追溯 bot 输出 |
| 4. 扩展 | 插件、MCP、子代理模板入库 | 重复流程 `/command` 化 |
| 5. 治理 | managed settings、用量看板 | `/status` 显示企业策略 |

### 培训资源

- 本系列教程与 [Common workflows](https://code.claude.com/docs/en/common-workflows)
- [Claude Code in Action](https://anthropic.skilljar.com/claude-code-in-action) 课程
- 内部录屏：一次 Plan Mode 大改 + 一次 PR `@claude` 修 issue

### 度量（务实）

| 指标 | 说明 |
|------|------|
| 采用率 | 活跃开发者数、`/status` 或分析后台 |
| PR 周期 | 试点前后对比，注意混杂因素 |
| 返工率 | 合并后 revert、hotfix 比例 |
| 成本 | API 与 Actions 分钟；`/cost` 与云账单 |

避免只盯「生成了多少行代码」；结合 review 评论与缺陷率更有参考价值。

---

## 失败模式

| 症状 | 可能原因 | 下一步 |
|------|----------|--------|
| `@claude` 无响应 | App 未装、Secret 错 | [CI/CD 章](/claude-code/ci-cd-integrations/#失败模式) |
| Action 改坏主分支 | workflow 直接 push main | 限制 PR 分支；人工合并 |
| 团队规则被忽略 | CLAUDE.md 过长 | 精简；关键项改 Hook/deny |
| 企业策略未生效 | 未用 Teams 或未刷新 | `/status`；重装后 `/login` |
| IDE 登录或检测失败 | 环境、WSL | [多平台章](/claude-code/platforms-overview/#失败模式) |

---

## 决策边界

**读本机选型：** [多平台运行环境全览](/claude-code/platforms-overview/#决策边界)。

**本仓库 + CI：** 先入库 `CLAUDE.md` 与 deny 规则，再开 [CI/CD 集成](/claude-code/ci-cd-integrations/)。

**企业 managed settings：** 必须统一 deny/MCP/沙箱且能下发到每台机器。

**不适合：** 生产密钥写进 `CLAUDE.md`；无 review 自动合 main。

---

## 继续读下一章之前

试着回答：

1. 三层集成各自典型产物是什么？  
2. 为什么仓库级 `permissions.deny` 应与改 workflow 同级 review？  
3. managed settings 与项目 `CLAUDE.md` 冲突时以谁为准？

自检清单：

- [ ] 能画出团队缺本机、仓库、组织哪一层  
- [ ] 仓库里有团队可读的 `CLAUDE.md` 或 `.claude/settings.json`  
- [ ] 知道深入阅读应打开多平台章还是 CI/CD 章  
- [ ] 能说出企业部署时 API 提供商与策略下发两条决策线  

---

下一章：[Agent SDK 程序化调用](/claude-code/agent-sdk/)——把 Claude Code 嵌入流水线；再读 [CI/CD 与代码审查集成](/claude-code/ci-cd-integrations/)、[远程会话与 Channels](/claude-code/remote-sessions-channels/)、[Chrome 与 Web UI 测试](/claude-code/chrome-browser-testing/)，最后进入 [局限性与应对](/claude-code/limitations/)。
