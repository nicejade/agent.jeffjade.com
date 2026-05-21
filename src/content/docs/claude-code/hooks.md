---
title: Hooks：自动化、安全校验与生命周期控制
description: 在代理循环的关键节点插入确定性脚本，用 PreToolUse、PostToolUse、Stop 等事件实现格式化、拦截危险操作与外部通知。
sidebar:
  order: 13
---

*「我在 CLAUDE.md 里写了禁止动 `.env`，模型还是改了一次；每次 Edit 完还要自己跑 Prettier。」*

[项目记忆](/claude-code/claude-md/) 与权限规则告诉模型**应该怎么做**，但模型仍可能偏离或漏掉步骤。Hooks 在 Claude Code **生命周期固定节点**上运行你定义的命令，不依赖模型是否「记得」执行。官方入门见 [Automate workflows with hooks](https://code.claude.com/docs/en/hooks-guide)，事件与 JSON 格式见 [Hooks reference](https://code.claude.com/docs/en/hooks)。

本章目标：理解 Hooks 在 [代理循环](/claude-code/agent-loop/) 中的位置，能配置一条可验证的 Hook，并知道何时用 Hook、何时改用 Skills 或权限规则。

---

## Hooks 解决什么问题

| 手段 | 确定性 | 典型场景 |
|------|--------|----------|
| 提示 / CLAUDE.md | 低，依赖模型遵守 | 风格约定、流程说明 |
| 权限 `allow` / `deny` | 高，规则匹配工具调用 | 禁止 `Bash(rm *)`、限制域名 |
| **Hooks** | **高，你的脚本一定执行** | Edit 后自动格式化、审计日志、组织级二次拦截 |
| Skills | 中，加载工作流模板 | 可复用的 `/commit` 类流程 |

Hooks 不是「更聪明的提示」，而是**事件驱动的拦截器**：在工具执行前、执行后、会话结束等时刻，Claude Code 把事件上下文以 JSON 交给你的 handler，你再决定放行、拒绝或注入额外信息。

与 Git Hooks 的相似点：都在固定节点跑外部命令。不同点：Git Hooks 绑定 git 子命令；Claude Code Hooks 绑定 **Agent 工具与回合**，输入是 `tool_name`、`tool_input` 等 JSON，输出通过退出码或 stdout JSON 反馈给运行时。

---

## 在代理循环中的位置

上一章 [代理循环](/claude-code/agent-loop/) 里，模型反复「推理 → 选工具 → 执行 → 读结果」。Hooks 落在这条链路的壳层上：

```
用户提交提示 (UserPromptSubmit)
        ↓
模型决定调用工具
        ↓
PreToolUse  ← 可阻止本次工具调用
        ↓
权限检查（Hook 早于 allow 规则，见下文）
        ↓
工具执行（Read / Edit / Bash …）
        ↓
PostToolUse / PostToolUseFailure
        ↓
模型继续或结束回合 (Stop)
```

**检查顺序**：据 [代理循环](/claude-code/agent-loop/) 与官方权限文档，**Hook 早于 allow 规则**。适合放组织级策略：即使用户本地配置了较宽的 `allow`，`PreToolUse` 仍可 `deny` 危险操作。

**动手：** 在空目录执行 `claude`，输入 `/hooks`，确认能看到事件列表。尚无配置时，各事件旁计数为 0。记住这个只读面板的位置，后面调试会用到。

---

## 三类节奏：会话、回合、工具

官方把事件分为三种触发节奏。初学先掌握下表中的事件即可，其余见 [Hook lifecycle](https://code.claude.com/docs/en/hooks#hook-lifecycle)。

| 节奏 | 代表事件 | 何时触发 | 本章重点用途 |
|------|----------|----------|--------------|
| 每会话一次 | `SessionStart`, `SessionEnd` | 启动、恢复、退出 | 注入环境说明、清理临时文件 |
| 每回合一次 | `UserPromptSubmit`, `Stop` | 提交提示后、模型结束回复时 | 输入审计、完成通知 |
| 每次工具调用 | `PreToolUse`, `PostToolUse` | 工具执行前后 | 拦截命令、自动格式化 |

常用扩展事件（按需查阅 reference）：

| 事件 | 触发时机 | 典型用途 |
|------|----------|----------|
| `Notification` | 需要权限或空闲等待输入 | 桌面通知、Slack |
| `PermissionRequest` | 权限弹窗出现时 | 自动批准安全操作 |
| `PostToolBatch` | 一批并行工具全部结束后 | 批量检查再进入下一轮模型调用 |
| `InstructionsLoaded` | 加载 CLAUDE.md / rules 时 | 统计或校验注入的说明 |
| `ConfigChange` | 配置变更时 | 审计 `settings.json` 修改 |

`PostToolUse` 在工具**已成功**后触发；若工具失败，对应的是 `PostToolUseFailure`。

---

## 配置写在哪里

Hooks 写在 [settings](https://code.claude.com/docs/en/settings) 的 `hooks` 字段里，常见位置：

| 文件 | 作用域 | 是否适合提交 Git |
|------|--------|------------------|
| `~/.claude/settings.json` | 本机所有项目 | 否 |
| `.claude/settings.json` | 当前仓库 | 是，团队共享 |
| `.claude/settings.local.json` | 当前仓库 | 否，通常 gitignore |

企业还可通过 managed policy 下发；插件、Skill、SubAgent 的 frontmatter 里也能声明临时 Hooks。解析顺序与合并规则以你安装版本的 [settings](https://code.claude.com/docs/en/settings) 为准。

配置是**三层嵌套**：

1. **事件名**：如 `PreToolUse`、`PostToolUse`
2. **matcher 组**：过滤何时触发，如仅 `Bash` 或 `Edit|Write`
3. **handler**：实际执行的 `command`、`http`、`prompt` 等

最小结构示例：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write"
          }
        ]
      }
    ]
  }
}
```

若文件里已有 `hooks` 对象，只**追加**事件键，不要覆盖整个 `hooks`。

**matcher 规则摘要**（详见 [Matcher patterns](https://code.claude.com/docs/en/hooks#matcher-patterns)）：

| matcher 写法 | 含义 |
|--------------|------|
| 省略、`""` 或 `"*"` | 该事件下全部触发 |
| `Bash`、`Edit\|Write` | 精确匹配工具名，`\|` 表示或 |
| 含其它字符 | 按 JavaScript 正则匹配，如 `mcp__github__.*` |

工具类事件还可给单个 handler 加 `if` 字段，使用与 [权限规则](https://code.claude.com/docs/en/permissions) 相同的语法，例如 `"Bash(git *)"`、`"Edit(*.ts)"`，减少无谓启动脚本的开销。

---

## 第一个 Hook：权限等待时通知

以下在 macOS 用 `osascript` 发桌面通知；Linux 可用 `notify-send`，Windows 可用 PowerShell，完整片段见 [Get notified when Claude needs input](https://code.claude.com/docs/en/hooks-guide#get-notified-when-claude-needs-input)。

在 `~/.claude/settings.json` 增加：

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude Code needs your attention\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

**验证：**

1. 输入 `/hooks`，选中 `Notification`，确认命令与来源文件。
2. 让 Claude 执行需要批准的工具，切到其它窗口，应收到通知。

`/hooks` 界面**只读**；增删改请直接编辑 JSON，或在 CLI 里描述需求让 Claude 帮你改配置。

---

## 实战一：PostToolUse 自动格式化

目标：每次 `Edit` / `Write` 成功后，对目标文件跑 Prettier，不依赖模型是否记得。

项目根 `.claude/settings.json`：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write"
          }
        ]
      }
    ]
  }
}
```

**机制：**

- `PostToolUse` 的 stdin 含 `tool_name`、`tool_input` 等字段；`jq` 取出 `file_path`。
- 工具已执行完毕，Hook **不能撤销** 写入，只能再改磁盘上的文件。
- 需要本机已安装 `jq` 与项目的 Prettier。

**边界：** 只对匹配扩展名生效时，把 handler 改成带 `if` 的独立脚本，或 matcher 配合 `Edit(*.ts)` 类规则。Monorepo 里注意 `file_path` 是否相对项目根。

---

## 实战二：PreToolUse 拦截危险命令

目标：在 `Bash` 执行前拒绝包含 `rm -rf` 的命令，并把原因反馈给模型。

**1. 脚本** `.claude/hooks/block-rm.sh`：

```bash
#!/bin/bash
COMMAND=$(jq -r '.tool_input.command')

if echo "$COMMAND" | grep -q 'rm -rf'; then
  jq -n '{
    "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permissionDecision": "deny",
      "permissionDecisionReason": "Destructive command blocked by hook"
    }
  }'
else
  exit 0
fi
```

**2. 可执行权限：**

```bash
chmod +x .claude/hooks/block-rm.sh
```

**3. settings：**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(rm *)",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/block-rm.sh"
          }
        ]
      }
    ]
  }
}
```

`${CLAUDE_PROJECT_DIR}` 会展开为项目根路径，适合把脚本放在仓库内并提交。

**两种拒绝方式（二选一，不要混用）：**

| 方式 | 写法 | 说明 |
|------|------|------|
| 退出码 | `echo "原因" >&2` 后 `exit 2` | 简单；stdout 里的 JSON 会被忽略 |
| JSON | `exit 0` 且 stdout 打印 `hookSpecificOutput` | 可返回 `permissionDecision`、`additionalContext` 等 |

官方强调：要用策略**硬拦截**时，命令 Hook 用 **`exit 2`**，不要用 `exit 1`。对多数事件，`exit 1` 仅记非阻塞错误，**不会**阻止工具执行。

---

## 实战三：保护敏感路径

官方示例用 `PreToolUse` + 脚本检查 `file_path`，匹配 `.env`、`package-lock.json`、`.git/` 等模式则 `exit 2`。见 [Block edits to protected files](https://code.claude.com/docs/en/hooks-guide#block-edits-to-protected-files)。

与权限 `deny` 的关系：

| 方式 | 优点 | 缺点 |
|------|------|------|
| `deny` 规则 | 配置简单、UI 可见 | 复杂条件表达力有限 |
| `PreToolUse` 脚本 | 任意逻辑、可写审计日志 | 需维护脚本与测试 |

团队仓库建议：**敏感路径用 Hook + `deny` 双保险**，并把 `.claude/settings.json` 纳入 code review。

---

## Handler 类型与何时选用

除 `command` 外，官方还支持（见 [Hook handler fields](https://code.claude.com/docs/en/hooks#hook-handler-fields)）：

| type | 适用 |
|------|------|
| `command` | 本地脚本、调用 `jq` / `npx`、最常用 |
| `http` | 把事件 POST 到内部审计或 SIEM |
| `mcp_tool` | 复用已连接的 MCP 工具做校验 |
| `prompt` | 需模型判断的模糊策略 |
| `agent` | 需读仓库验证的复杂条件（实验性） |

需要**完全确定**的行为，优先 `command`。需要「像人一样看 diff 再决定」时，再考虑 `prompt` / `agent`，并接受延迟与成本。

`async: true` 可把 Hook 放到后台，不阻塞主循环；适合日志类任务。带 `asyncRewake` 时，退出码 2 可在后台失败后唤醒 Claude，详见 reference。

---

## 与 Skills、SubAgents、权限的分工

| 维度 | Hooks | Skills | SubAgents |
|------|-------|--------|-----------|
| 触发 | 事件自动 | 用户 `/skill` 或模型选用 | 显式委派 |
| 确定性 | 高 | 中 | 中，取决于子代理提示 |
| 上下文 | 与会话共享 | 注入 SKILL.md | 独立上下文 |
| 适合 | 格式化、拦截、通知 | 可复用工作流 | 大任务拆分 |

[Plan Mode](/claude-code/plan-mode/) 解决「先想再做」；Hooks 解决「到了这一步**必须**发生什么」。三者可同时存在：计划里写测试命令，CLAUDE.md 写目录约束，Hook 在 `PostToolUse` 跑 linter。

---

## 调试与失败模式

| 症状 | 可能原因 | 下一步 |
|------|----------|--------|
| Hook 从未触发 | matcher 写错、事件名拼写错误 | `/hooks` 核对；对照 reference 的 matcher 字段 |
| 策略未拦截危险操作 | 用了 `exit 1` 而非 `exit 2` 或 JSON deny | 改为 `exit 2` 或 `permissionDecision: deny` |
| `JSON validation failed` | stdout 混入了 shell 启动信息 | 脚本只输出 JSON；检查 `.bashrc` 是否 echo |
| 脚本不执行 | 未 `chmod +x` | `chmod +x .claude/hooks/*.sh` |
| Prettier 未运行 | 无 `jq`、路径不对 | 手动 `echo '{...}' \| jq` 测管道 |
| macOS 无通知 | Script Editor 无通知权限 | 按官方指南在系统设置里开启 |
| 团队 Hook 被忽略 | 本地 policy 禁用非托管 Hook | 查 `allowManagedHooksOnly` 与企业策略 |

调试时加 `--debug` 可看完整 stderr 与 Hook 解析日志。改配置后无需重启整个 OS，新开一轮工具调用或新会话即可验证。

---

## 决策边界：该用 Hook 吗

**适合：**

- Edit/Write 后必须跑 formatter 或 linter
- 组织禁止的命令模式，且要留审计痕迹
- 权限弹窗、空闲时通知运维或本人
- CI 里 `--init-only` 场景的 `Setup` 事件准备环境

**不适合：**

- 用 Hook 实现整段业务工作流，应改用 [Skills](/claude-code/skills/)
- 用 `PostToolUse` 试图「撤销」已写入的文件，应在 `PreToolUse` 拦截
- 把密钥写进 Hook 命令行；应用环境变量或密钥管理
- 用大量 `prompt` Hook 替代代码审查，成本高且不稳定

**与 CLAUDE.md：** 文档写「为什么要这样」；Hook 保证「发生了就会执行」。重复内容可简短写在 CLAUDE.md， enforcement 放在 Hook。

---

## 团队落地建议

1. 把 `.claude/settings.json` 与 `.claude/hooks/` 纳入版本库，在 README 或 CONTRIBUTING 说明如何本地覆盖 `settings.local.json`。
2. Hook 脚本保持短小，复杂逻辑抽到 `scripts/` 并加单元测试。
3. PR 模板提醒：改 Hooks 等于改 CI 策略，需要安全同事过目。
4. 个人通知类 Hook 放 `~/.claude/settings.json`，避免强迫全员 osascript。

---

## 继续读下一章之前

试着回答：

1. `PreToolUse` 与 `PostToolUse` 分别能否阻止已经发生的文件写入？  
2. 为什么拦截策略要用 `exit 2` 而不是 `exit 1`？  
3. Hook 与权限 `allow` 谁先执行？这对团队策略意味着什么？  
4. 什么任务应做成 Skill 而不是 Hook？

自检清单：

- [ ] 用 `/hooks` 查看过自己配置的至少一个事件  
- [ ] 成功配置过 `Notification` 或 `PostToolUse` 之一  
- [ ] 写过或读过一条 `PreToolUse` 拒绝逻辑  
- [ ] 能说出 Hooks 与 CLAUDE.md、权限规则各管哪一层  

---

上一章：[团队记忆落地](/claude-code/memory-team-playbook/) · 下一章：[Skills 技能](/claude-code/skills/)——把可复用工作流写成 SKILL.md；社区精选见 [第六部分](/claude-code/skill-recommendations/)。
