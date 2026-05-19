---
title: Claude Code 与生态的深度集成
description: 在 VS Code、JetBrains 与终端中落地开发体验，用 GitHub Actions 与托管策略把 Claude Code 纳入团队工作流与企业合规。
sidebar:
  order: 15
---

*「个人在终端里用得顺手，但团队要统一权限、PR 里要能 @ 机器人、JetBrains 同事也要 diff 进 IDE。」*

[完整实战工作流](/claude-code/complete-workflow/) 讲的是单人如何在仓库里完成任务。本章讲**工具链与组织**：编辑器里怎么接、CI 里怎么跑、策略怎么下发、同事怎么一起用。机制仍建立在 [代理循环](/claude-code/agent-loop/)、[CLAUDE.md](/claude-code/claude-md/) 与 [Hooks](/claude-code/hooks/) 之上。

官方入口：[Use Claude Code in VS Code](https://code.claude.com/docs/en/vs-code)、[JetBrains IDEs](https://code.claude.com/docs/en/jetbrains)、[GitHub Actions](https://code.claude.com/docs/en/github-actions)、[Admin setup](https://code.claude.com/docs/en/admin-setup)。

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

---

## VS Code 与 Cursor

Anthropic 提供 [Claude Code 扩展](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code)。**Cursor** 等 VS Code 系编辑器可通过扩展市场或 [Open VSX](https://open-vsx.org/extension/Anthropic/claude-code) 安装；无法装扩展时，在集成终端运行 `claude` 即可，见 [Quickstart](https://code.claude.com/docs/en/quickstart)。

### 前置条件

- VS Code **1.98.0+**
- Anthropic 账号登录，或按 [第三方 API](/claude-code/third-party-api/) 配置提供商
- 扩展内包含 CLI，高级能力仍可在终端调用

### 安装与打开

- 扩展视图搜索 **Claude Code** 安装，或使用官方 `vscode:extension/anthropic.claude-code` 链接
- 编辑器工具栏 **Spark** 图标、左侧 Activity Bar、命令面板 `Claude Code: Open in New Tab`、状态栏均可打开面板
- 首次打开在浏览器完成登录；若 shell 里已有 `ANTHROPIC_API_KEY` 仍提示登录，可用 `code .` 从终端启动 VS Code 以继承环境变量

### 图形界面相对终端的优势

| 能力 | 说明 |
|------|------|
| 并排 diff | 接受/拒绝改动前可视对比；你在 diff 里手改后 Claude 会被告知 |
| Plan 文档 | Plan 模式计划以 Markdown 打开，可批注后再执行 |
| `@` 与选区 | `Alt+K` / `Option+K` 插入 `@file#L1-10`；选区自动进上下文 |
| 多会话 | 多 Tab/多窗口并行，图标颜色提示待权限或已完成 |
| 会话历史 | 图形化浏览、重命名、恢复本地与部分远程会话 |
| 插件 `/plugins` | 图形化管理 [Plugins](/claude-code/mcp/) 与市场源 |
| `@browser` | 配合 [Claude in Chrome](https://code.claude.com/docs/en/chrome) 测 Web UI |

提示框底部可切换 **default / plan / acceptEdits** 等权限模式，对应 [Plan Mode](/claude-code/plan-mode/) 与 [安装章](/claude-code/installation-setup/) 中的模式表。扩展设置 `claudeCode.initialPermissionMode` 可设默认值。

### 扩展 vs CLI：何时用哪边

| 能力 | CLI | VS Code 扩展 |
|------|-----|----------------|
| 全部 `/` 命令与 Skills | 是 | 子集，输入 `/` 可见 |
| MCP 完整配置 | 是 | 部分，现有服务用 `/mcp` 管理 |
| Checkpoint / `/rewind` | 是 | 是，消息悬停可 fork/回滚 |
| `!` 快速 Bash 前缀 | 是 | 否 |
| Tab 补全 | 是 | 否 |
| `@terminal:name` 引用终端输出 | 是 | 有限 |

**建议：** 日常编码用扩展看 diff；需要 `!`、完整 MCP 编辑、脚本化时用集成终端 `claude`。扩展与 CLI **共享会话历史**，终端 `claude --resume` 可继续扩展里的对话。

在外部终端已开 `claude` 时，输入 `/ide` 可连上当前 VS Code 工作区。

### 与 GitHub Copilot 等共存

二者可同时安装。分工上，Copilot 偏行内补全，Claude Code 偏多文件任务与代理循环。避免对同一文件让两个 Agent 同时大改；大任务用 Claude Code，补全用 Copilot 通常冲突更少。

### 常用快捷键

| 操作 | macOS | Windows/Linux |
|------|-------|----------------|
| 焦点在编辑器和 Claude 间切换 | `Cmd+Esc` | `Ctrl+Esc` |
| 新 Tab 会话 | `Cmd+Shift+Esc` | `Ctrl+Shift+Esc` |
| 插入 @ 引用 | `Option+K` | `Alt+K` |

完整表见官方 [VS Code commands and shortcuts](https://code.claude.com/docs/en/vs-code#vs-code-commands-and-shortcuts)。

---

## JetBrains 系列

IntelliJ IDEA、PyCharm、WebStorm、GoLand、Android Studio 等通过 [JetBrains 插件](https://plugins.jetbrains.com/plugin/27310-claude-code-beta-) 集成。

### 特性摘要

- `Cmd+Esc` / `Ctrl+Esc` 或工具栏按钮启动
- diff 在 IDE diff 查看器中展示
- 当前选区/标签页自动作为上下文
- `Cmd+Option+K` / `Alt+Ctrl+K` 插入 `@path#L1-99` 引用
- Lint/语法诊断自动分享给 Claude

### 使用方式

在 **IDE 集成终端** 项目根运行 `claude`，集成自动生效。若在外部终端，先 `claude` 再 `/ide` 连接 IDE。

`/config` 里将 diff 工具设为 `auto` 可在 IDE 中显示变更。Remote Development 须在**远程主机**安装插件，而非仅本机客户端。

WSL2 下若提示未检测到 IDE，多为防火墙或 NAT 问题，见官方 [WSL configuration](https://code.claude.com/docs/en/jetbrains#wsl-configuration)。

### 安全提示

JetBrains 下若开启自动接受编辑，Claude 可能改动 IDE 会加载的配置文件，风险高于纯终端。团队可要求 **manual approval** 模式，敏感仓库配合 [权限 deny](/claude-code/installation-setup/) 与 [Hooks](/claude-code/hooks/)。

---

## Neovim、Emacs 与其它编辑器

无官方 GUI 插件时，标准路径是 **终端 + CLI**：

1. 在项目根用内置终端跑 `claude`
2. 用 [CLAUDE.md](/claude-code/claude-md/) 与 [Skills](/claude-code/skills/) 固化流程
3. 需要 IDE diff 时，在 VS Code/JetBrains 开同仓库并用 `/ide` 或扩展

Neovim/Emacs 用户常把终端分屏或 tmux 与编辑器并排；`@` 引用在 CLI 中同样可用。组织若统一 JetBrains/VS Code，可为这两类配插件，其余编辑器保持 CLI 文档即可。

---

## Claude Code Desktop

[Desktop](https://code.claude.com/docs/en/desktop) 适合在图形界面管理**多个本地并行会话**，常与 [git worktree](https://code.claude.com/docs/en/worktrees) 配合。CLI 中 `/desktop`（macOS/Windows）可把当前会话迁到桌面端继续。

与 VS Code 扩展的差异：Desktop 偏会话编排；深度 diff、与仓库同屏编码仍以 VS Code/JetBrains 插件或 CLI 为主。团队是否允许 Desktop 取决于 managed settings 与网络策略。

---

## GitHub Actions 集成

[Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions) 基于 [Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview)，在 Issue/PR 评论中 `@claude` 即可触发，也可定时或事件驱动无人值守任务。

### 能做什么

- PR/Issue 评论里实现功能、修 bug、回答问题
- 定时生成报告、同步文档
- 在 workflow 的 `prompt` 中调用仓库 [Skills](/claude-code/skills/)，例如 `/code-review:...`
- 与 [GitHub Code Review](https://code.claude.com/docs/en/code-review) 配合做自动审查（产品能力与 Action 略有不同，以官方说明为准）

### 快速安装

在本地已安装 Claude Code 的仓库中：

```text
/install-github-app
```

向导会配置 GitHub App 与 `ANTHROPIC_API_KEY` 等密钥。需**仓库管理员**权限。仅直连 Anthropic API 时可用此快捷方式；Bedrock/Vertex 见官方 [Using with Amazon Bedrock & Google Vertex AI](https://code.claude.com/docs/en/github-actions#using-with-amazon-bedrock--google-vertex-ai)。

### 手动安装要点

1. 安装 [Claude GitHub App](https://github.com/apps/claude)，授予 Contents、Issues、Pull requests 读写
2. 在仓库 Secrets 添加 `ANTHROPIC_API_KEY`
3. 将 [examples/claude.yml](https://github.com/anthropics/claude-code-action/blob/main/examples/claude.yml) 复制到 `.github/workflows/`

使用 **`anthropics/claude-code-action@v1`**（非 `@beta`）。v1 用 `prompt` 替代 `direct_prompt`，CLI 参数放进 `claude_args`。

### 最小 workflow 示例

```yaml
name: Claude Code
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
jobs:
  claude:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

配置 `prompt` 时可在 `pull_request` 打开时自动跑审查，无需评论触发：

```yaml
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: "/code-review:code-review 审查本 PR 的安全与测试缺口"
          claude_args: |
            --max-turns 15
            --model claude-sonnet-4-6
```

评论中的典型用法：

```text
@claude 根据 issue 描述实现功能并补测试
@claude 修复 user dashboard 的 TypeError，跑 CI 中的测试命令
```

### 仓库侧配置

- **CLAUDE.md 入库**：Action 会读取，与本地会话一致；写清测试命令、禁止路径、PR 规范
- **Skills 入库**：`.claude/skills/`，workflow 需 `checkout` 后才能 `/skill-name`
- **密钥**：只用 `secrets.*`，禁止把 API Key 写进 workflow 明文
- **权限**：workflow `permissions` 遵循最小权限；Action 仍需 App 的读写以推分支、开 PR

### 成本与性能

- **GitHub Actions 分钟**：跑在 GitHub 托管 runner 上
- **API Token**：随任务复杂度与仓库大小变化
- 优化：评论里 `@claude` 指令要具体；`claude_args` 设合理 `--max-turns`；用 concurrency 限制并行

与 [complete-workflow](/claude-code/complete-workflow/#工作流-fgit-与-pr) 的分工：本地 `gh` 适合交互式提交；Action 适合「PR 上留痕、异步实现、定时任务」。

---

## 非交互模式与自建 CI

不限于 GitHub，任何能跑 shell 的环境都可用 **`claude -p`**：

```bash
git diff origin/main...HEAD | claude -p "列出安全风险，输出 JSON" --output-format json
```

见 [Non-interactive mode](https://code.claude.com/docs/en/headless)。可配合 `--allowedTools` 限制无人值守时的工具范围。

| 场景 | 做法 |
|------|------|
| Pre-commit | 钩子中 `claude -p` 做轻量检查，注意延迟与成本 |
| 自建 GitLab/Jenkins | 同样 `claude -p`，密钥进 CI 变量 |
| 批量迁移 | 循环调用，见 [Best practices · Fan out](https://code.claude.com/docs/en/best-practices#fan-out-across-files) |

团队应区分：**交互式 Claude Code** 与 **流水线里的 `-p`**。后者必须写死验收与工具白名单，不能指望人工点权限。

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

沙箱与 `deny WebFetch` 不同：若允许 Bash，`curl` 仍可能出站；敏感环境应开 [sandboxing](https://code.claude.com/docs/en/sandboxing) 的网络域白名单。

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
| VS Code 扩展无法登录 | 环境变量未传入 GUI | `code .` 从终端启动或扩展内登录 |
| `@claude` 无响应 | App 未装、Secret 错、workflow 未触发 | 查 Actions 日志与 App 权限 |
| Action 改坏主分支 | workflow 直接 push main | 限制为 PR 分支；人工批准合并 |
| 团队规则被忽略 | CLAUDE.md 过长 | 精简；关键项改 Hook/deny |
| JetBrains 检测不到 IDE | 插件未启、目录不对、WSL 网络 | 官方 JetBrains 故障排除 |
| 企业策略未生效 | 未用 Teams 或未刷新 | `/status`；重装后 `/login` |
| CI 费用飙升 | 无 turn 上限、并发过多 | `claude_args`、concurrency |

---

## 决策边界

**适合 VS Code/JetBrains 插件：** 需要图形 diff、Plan 文档批注、多 Tab 并行。

**适合纯终端：** 远程 SSH、无 GUI、要完整 CLI 命令与 `!`。

**适合 GitHub Action：** Issue/PR 驱动、定时报告、标准化 review。

**适合企业 managed settings：** 必须统一 deny/MCP/沙箱，且能下发到每台机器。

**不适合：** 把生产密钥写进 `CLAUDE.md`；让 Action 在无 review 时直接合 main；用 Copilot 与 Claude 同时改同一文件而不协调。

---

## 继续读下一章之前

试着回答：

1. 扩展与 CLI 共享什么、各缺什么？  
2. 为什么仓库级 `permissions.deny` 应与改 workflow 同级 review？  
3. `@claude` 与本地 `claude -p` 各适合什么场景？  
4. managed settings 与项目 `CLAUDE.md` 冲突时以谁为准？

自检清单：

- [ ] 在 VS Code/Cursor 或 JetBrains 中跑通过一次带 diff 审查的编辑  
- [ ] 仓库里有团队可读的 `CLAUDE.md` 或 `.claude/settings.json`  
- [ ] 知道 `/install-github-app` 或手动配置 Action 的步骤  
- [ ] 能说出企业部署时 API 提供商与策略下发两条决策线  

---

下一章：[局限性与应对](/claude-code/limitations/)——上下文、幻觉、成本与安全边界的系统梳理，以及与本章企业策略相衔接的排障清单。
