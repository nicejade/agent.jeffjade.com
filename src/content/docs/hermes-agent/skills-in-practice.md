---
title: 技能系统实战
description: 从 SKILL.md 结构与目录布局，到 Hub 安装、Bundle、hermes curator 与 Agent 自创建 Skill 的可验证工作流。
sidebar:
  order: 8
---

*「Hub 里装了十几个 Skill，Level 0 索引却越来越长，Agent 反而更爱瞎猜——多半是缺 Curator、也没 pin 团队关键流程。」*

第四章讲了记忆、渐进披露与 `skill_manage` 概念。本章偏**动手**：如何写合格的 `SKILL.md`、如何从 Hub 安全安装、如何用 Bundle 组合任务、以及如何让 Agent 沉淀流程而不把库弄乱。依据官方 [Skills](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills)、[Curator](https://hermes-agent.nousresearch.com/docs/user-guide/features/curator)、[Creating Skills](https://hermes-agent.nousresearch.com/docs/developer-guide/creating-skills)。

## 实战前要区分的三层

| 层 | 你做什么 | Agent 做什么 |
| --- | --- | --- |
| 发现 | `hermes skills browse`、`/skills search` | `skills_list` 看 Level 0 索引 |
| 加载 | `/plan …`、`/skill-name` | `skill_view` 读全文或 `references/` |
| 演进 | `install`、`pin`、`curator` | `skill_manage` 创建或 patch |

**单一事实来源**仍是 `~/.hermes/skills/`。Hub 安装、bundled 同步、Agent 自写都落在此目录；`external_dirs` 只读扫描，写入仍回本地。

## SKILL.md：可维护的最小契约

### Frontmatter 字段

```markdown
---
name: deploy-runbook
description: 生产发布检查清单与回滚步骤
version: 1.0.0
platforms: [linux]
metadata:
  hermes:
    tags: [deploy, internal]
    category: devops
    requires_toolsets: [terminal]
    config:
      - key: deploy.notify_channel
        description: 发布通知频道
        default: "#releases"
        prompt: Slack 或 Telegram 频道名
required_environment_variables:
  - name: DEPLOY_WEBHOOK
    prompt: 部署 webhook URL
    help: 从内部文档获取
    required_for: full functionality
---
```

| 字段 | 作用 |
| --- | --- |
| `name` | 标识符，对应 `/deploy-runbook` |
| `description` | Level 0 索引中的一行说明 |
| `platforms` | 非匹配 OS 上隐藏 Skill 与 Slash |
| `metadata.hermes.requires_toolsets` | 缺 toolset 时不展示 |
| `metadata.hermes.fallback_for_toolsets` | 仅在某 toolset **不可用**时作为兜底展示 |
| `required_environment_variables` | 加载时可在 **CLI** 安全提示填密钥；网关聊天不会索要秘密 |

正文建议四段式，与官方模板一致：

```markdown
## When to Use
触发条件，避免与其它 Skill 重叠。

## Procedure
1. 可验证步骤
2. 每步期望输出

## Pitfalls
- 已知失败与修复

## Verification
如何确认成功（命令、文件、URL）。
```

### 目录布局

```text
~/.hermes/skills/
├── devops/deploy-runbook/
│   ├── SKILL.md
│   ├── references/
│   │   └── rollback.md
│   ├── scripts/
│   │   └── preflight.sh
│   └── templates/
│       └── release-note.md
├── .hub/
│   ├── lock.json
│   └── audit.log
├── .bundled_manifest
└── .archive/          # Curator 归档
```

- `references/`：Level 2 用 `skill_view(name, path)` 按需加载
- `scripts/`：可由 `execute_code` 或 `terminal` 调用；声明的 env 会透传到沙箱
- Hub 多文件 Skill 安装时会一并拉取子目录；**单 URL 安装**仅支持单文件 `SKILL.md`

### 媒体与投递指令

若 Skill 产出截图或图表，回复里写**绝对路径**时 Gateway 会抽成附件发送，而不是把路径留在正文里。

| 指令 | 效果 |
| --- | --- |
| `[[as_document]]` | 该条回复中所有媒体以文件附件发送，避免 Telegram 压图 |
| `[[audio_as_voice]]` | 音频尽量以语音气泡发送 |

这些指令会从用户可见文本中剥离。

## 手写 Skill：从草稿到可用

### 1. 直接创建目录

```bash
mkdir -p ~/.hermes/skills/team/oncall-playbook
${EDITOR:-nano} ~/.hermes/skills/team/oncall-playbook/SKILL.md
```

保存后在 CLI 或 Gateway：

```text
/reload-skills
/oncall-playbook 按 playbook 处理当前告警
```

### 2. 用 CLI 发布到团队 tap（可选）

组织可把多个 Skill 放在 GitHub 仓库的 `skills/` 下，他人订阅：

```bash
hermes skills tap add myorg/hermes-skills
hermes skills install myorg/hermes-skills/oncall-playbook
```

tap 配置在 `~/.hermes/.hub/taps.json`。详见官方 Skills Hub 文档 [Publishing a custom skill tap](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills#publishing-a-custom-skill-tap)。

### 3. 与 memory、AGENTS.md 分工

| 放 memory | 放 Skill | 放 AGENTS.md |
| --- | --- | --- |
| 「生产用 pnpm」 | 「发版 12 步与回滚」 | 「禁止改 main 分支」 |
| 用户偏好一句 | 可重复多步流程 | 仓库静态规范 |

流程会变长、会变复杂时，**优先 Skill**；单行事实用 memory。

## Skills Hub：安装、更新与信任

### 浏览与安装

```bash
hermes skills browse
hermes skills browse --source official
hermes skills search kubernetes
hermes skills inspect openai/skills/k8s
hermes skills install official/security/1password
hermes skills install https://example.com/SKILL.md --name my-skill
hermes skills list --source hub
hermes skills check
hermes skills update
hermes skills uninstall k8s
```

会话内等价：

```text
/skills search react --source skills-sh
/skills install openai/skills/skill-creator --force
/skills check
/skills update
```

### 来源与信任级别

| 级别 | 来源 | 说明 |
| --- | --- | --- |
| `builtin` | 随 Hermes 安装 | 始终信任 |
| `official` | 仓库 `optional-skills/` | 无第三方警告面板 |
| `trusted` | 如 `openai/skills` 等白名单仓库 | 策略较宽松 |
| `community` | skills.sh、well-known URL、自定义 GitHub | 扫描后可 `--force` 覆盖非 dangerous 项 |

`hermes skills inspect` 会显示上游 repo、skills.sh 页面、安装量等元数据。`--force` **不能**绕过 `dangerous` 扫描结论。

未认证 GitHub API 约 60 次/小时；在 `.env` 设 `GITHUB_TOKEN` 可提高到约 5000 次/小时。

### Agent 不能替你装 Hub

`hermes skills install` 与 Hub 拉取**只能由用户**执行。Agent 可用 `skill_manage` 在本地目录创建 Skill，不能从未信任 URL 自行安装。这是供应链控制，不是功能缺失。

## Skill Bundle：一次加载多个 Skill

重复任务常需要固定组合，例如 code review + TDD + PR：

```bash
hermes bundles create backend-dev \
  --skill github-code-review \
  --skill test-driven-development \
  --skill github-pr-workflow \
  -d "后端功能开发标准组合"
```

Bundle 存放在 `~/.hermes/skill-bundles/backend-dev.yaml`：

```yaml
name: backend-dev
description: 后端功能开发标准组合
skills:
  - github-code-review
  - test-driven-development
  - github-pr-workflow
instruction: |
  先写失败测试，再实现，最后按团队 PR 模板提交。
```

使用：

```text
/backend-dev 重构 auth 中间件
```

规则摘要：

- Bundle 与同名 Skill 冲突时 **Bundle 优先**
- 缺失的 Skill 会跳过并提示，不致命
- 不自动安装 Skill，只加载已有项

## Agent 自创建 Skill：何时发生、如何验收

官方建议在例如以下情况后 `skill_manage` **create** 或 **patch**：

- 完成复杂任务且工具调用约 **5 次以上**并找到可行路径
- 经历错误与死胡同后摸清正确做法
- 用户纠正了做法
- 发现非平凡、可重复工作流

| Action | 用途 |
| --- | --- |
| `create` | 新建完整 `SKILL.md` |
| `patch` | 小改，优先于整文件 `edit` |
| `edit` | 结构性重写 |
| `delete` | 删除整个 Skill |
| `write_file` / `remove_file` | 维护 `references/`、`scripts/` |

验收清单：

1. 磁盘上是否存在 `~/.hermes/skills/<category>/<name>/SKILL.md`
2. `/reload-skills` 后 Level 0 是否出现新描述
3. 用 `/name` 触发一次，Agent 是否按 Procedure 执行
4. 若流程关键，立即 `hermes curator pin <name>`

**不要**用社区流传的固定「15 次」阈值替代官方 **5+ tool calls** 表述；那是非官方口径。

## Curator：实战运维

Curator 在 CLI 启动或 Gateway 空闲时检查：默认距上次 ≥ 7 天且空闲 ≥ 2 小时则 fork 维护 Agent。

| 阶段 | 行为 |
| --- | --- |
| 确定性 | 30 天未用 → `stale`；90 天未用 → 移入 `.archive/` |
| LLM 审查 | 提议合并、patch 或归档 |

**不触碰**：`.bundled_manifest` 中的 bundled、`.hub/lock.json` 中的 Hub Skill。

**会触碰**：Agent 创建的、你手写的、external_dirs 扫描到的同名 Skill。Curator **无法区分**人手与 Agent 作品。

```bash
hermes curator status
hermes curator run --dry-run
hermes curator pin deploy-runbook
hermes curator restore deploy-runbook
hermes curator rollback
```

会话内：`/curator status`、`/curator run` 等。

每次真实运行前备份到 `~/.hermes/skills/.curator_backups/`；报告在 `~/.hermes/logs/curator/`。审查模型走 `auxiliary.curator`，可在 `hermes model` 里配更便宜模型。

### bundled 与用户修改：`hermes skills reset`

`hermes update` 会同步 bundled Skill。你若改过 bundled 副本，manifest 会标记为 user-modified，后续更新不再覆盖。

```bash
hermes skills reset google-workspace
hermes skills reset google-workspace --restore --yes
```

仅清除 manifest 条目不删本地；`--restore` 会删本地并重新复制上游 bundled 版。

## 条件激活与配置注入

兜底 Skill 示例：未配置 `FIRECRAWL_API_KEY` 时 `web` toolset 不可用，`duckduckgo-search` 通过 `fallback_for_toolsets: [web]` 自动出现。

Skill 声明的 `metadata.hermes.config` 写入 `config.yaml` 的 `skills.config`；`hermes config migrate` 会提示未配置项。加载 Skill 时解析值会注入上下文，Agent 无需猜路径。

## 故障模式

| 现象 | 可能原因 | 处理 |
| --- | --- | --- |
| `/skill` 不存在 | 未 reload 或 platforms 限制 | `/reload-skills`；查 `platforms` 字段 |
| Hub 安装被拦 | 安全扫描 | `inspect` 报告；仅 community 可 `--force` |
| 更新不生效 | user-modified bundled | `hermes skills reset --restore` |
| 关键流程被归档 | 未 pin | `curator restore`；事先 `pin` |
| 密钥在 Telegram 里问不到 | 设计如此 | 在本机 `hermes setup` 或 `.env` 配置 |
| Level 0 过长 | Skill 过多 | `curator run --dry-run`；合并重复 Skill |
| 外部目录不显示 | 路径不存在 | 检查 `skills.external_dirs`；本地同名覆盖 |

## 决策边界

- **不要把整本 runbook 塞进一个 Skill 又不拆 references**：Level 1 一次加载过大，浪费上下文。
- **不要指望 Curator 理解业务关键性**：生产必备 Skill 必须 `pin`。
- **不要在不审 inspect 报告时对 community Skill 滥用 `--force`**：`dangerous` 仍会被拒。
- **不要用 Skill 存密钥**：用 `required_environment_variables` 与 `.env`。
- **不要与 memory 重复堆相同流程**：memory 保持短句索引，步骤放 Skill。

## 动手练习

1. `hermes skills browse --source official`，安装一个与你工作相关的 `official/...` Skill，用 `/技能名` 触发一次。
2. 手写 `~/.hermes/skills/personal/daily-standup/SKILL.md`（When/Procedure/Pitfalls/Verification 四段齐全），`/reload-skills` 后运行。
3. 对一个复杂 CLI 任务（多步 shell + 文件），观察 Agent 是否在约 5 次以上 tool call 后提议 `skill_manage`；若有，检查生成文件并决定是否 `pin`。
4. `hermes curator run --dry-run`，阅读将被 stale 的列表，对一条关键 Skill 执行 `pin`。
5. 创建含两个 Skill 的 bundle，用 `/bundle-name 任务描述` 验证组合加载。
6. `hermes skills inspect` 任一 community Skill，记录 trust 级别与扫描摘要。

## 苏格拉底式反思

1. 你团队哪些流程值得 Bundle，哪些只需单个官方 Skill？
2. Agent 自写 Skill 与你在仓库里维护的 `AGENTS.md`，边界如何划才不重复？
3. 若 Curator 合并了两个相似 Skill，你会用哪份 `REPORT.md` 做审计？

## 读者自测

- [ ] 写出 SKILL.md 四段式与至少 3 个 frontmatter 字段含义。
- [ ] 独立完成一次 `hermes skills install` 与 `/reload-skills`。
- [ ] 说清 Hub 四类信任级别与 `--force` 边界。
- [ ] 创建或使用过至少一个 Bundle。
- [ ] 解释 Curator 不处理哪两类 Skill，以及 `pin` 的作用。
- [ ] 复述官方 `skill_manage` 创建时机（含 5+ tool calls）。

---

下一章：[高级特性](./advanced-features/)，展开 Voice、浏览器与子 Agent、`hermes acp`、`execute_code` 等。
