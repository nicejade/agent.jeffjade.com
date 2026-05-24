---
title: Skills：构建可重用提示模板与工作流
description: 用 SKILL.md 把重复流程写成可懒加载的技能，支持斜杠调用与模型自动选用，并与 CLAUDE.md、Hooks 分工协作。
sidebar:
  order: 16
---

*「每次提 PR 都要粘贴同一段审查清单；CLAUDE.md 已经长到每次会话都占一大块上下文。」*

[CLAUDE.md](/claude-code/claude-md/) 适合写**项目事实**：命令、目录、规范。 [Hooks](/claude-code/hooks/) 适合**到点必跑**的脚本。Skills 解决另一类问题：你把同一套**多步骤流程或领域说明**反复贴进对话，或某段 CLAUDE.md 已经变成「操作手册」而不是「记忆卡片」。

Skills 把流程写进 `SKILL.md`。正文**只在被调用时**进入上下文，长参考材料平时几乎不占窗口。官方说明见 [Extend Claude with skills](https://code.claude.com/docs/en/skills)，内置斜杠命令与捆绑技能见 [Commands](https://code.claude.com/docs/en/commands)。

本章目标：理解 Skills 的加载与触发模型，能写一个可验证的个人或项目技能，并知道何时用 Skill、何时继续用 CLAUDE.md 或 Hook。

**第六部分 · Skill 体系**（社区精选、目录导读、团队自建）见 [编码向社区精选](/claude-code/skill-recommendations/)、[社区技能目录导读](/claude-code/skill-catalog/)、[团队 Skill 实战](/claude-code/skills-team-playbook/)。建议先读完本章再进入该部分。

---

## Skills 解决什么问题

| 手段 | 何时加载 | 典型内容 | 确定性 |
|------|----------|----------|--------|
| 单次提示 | 仅当次对话 | 临时任务说明 | 低 |
| CLAUDE.md | 会话启动（子目录规则按需） | 项目事实、规范、命令 | 中，依赖模型遵守 |
| **Skills** | **调用时**（描述可常驻列表） | 可复用流程、清单、领域手册 | 中，依赖模型按技能执行 |
| Hooks | 工具/回合事件 | 格式化、拦截、通知 | 高 |

Skills 不是「更长的 CLAUDE.md」。差异在于**生命周期与成本**：

1. **懒加载正文**：`SKILL.md` 主体在 `/skill-name` 或模型选用后才进入对话；未调用时不占正文 token。
2. **可斜杠调用**：目录名即命令，例如 `summarize-changes` 对应 `/summarize-changes`。
3. **可限制谁触发**：frontmatter 可禁止模型自动选用，或禁止用户从菜单调用。
4. **可注入动态数据**：`!`git diff HEAD`` 在发送给模型前执行命令并替换为输出。
5. **可与子代理协作**：`context: fork` 在隔离上下文中跑一整套探索或审查流程。

**动手：** 在终端执行 `claude`，输入 `/` 查看当前可用命令。带 Skill 标记的条目（如 `/simplify`、`/debug`）与你自己写的技能机制相同。再问一句「What skills are available?」确认模型能列出技能描述。

---

## 与旧版 commands 的关系

自定义命令已并入 Skills。以下两种写法等价，都会得到 `/deploy`：

- 旧路径：`.claude/commands/deploy.md`
- 推荐路径：`.claude/skills/deploy/SKILL.md`

`.claude/commands/` 仍可用。同名时 **Skill 优先于 command 文件**。Skills 额外支持：附属文件目录、frontmatter 控制调用方、动态上下文、`allowed-tools` 等。详见官方 [Getting started](https://code.claude.com/docs/en/skills#getting-started)。

Claude Code 技能遵循 [Agent Skills](https://agentskills.io/) 开放标准，便于跨工具复用；Claude Code 在此基础上扩展了调用控制、子代理执行与 shell 注入等能力。

---

## 技能放在哪里

| 级别 | 路径 | 作用域 |
|------|------|--------|
| 企业 | 见 [managed settings](https://code.claude.com/docs/en/settings#settings-files) | 组织内全员 |
| 个人 | `~/.claude/skills/<skill-name>/SKILL.md` | 本机所有项目 |
| 项目 | `.claude/skills/<skill-name>/SKILL.md` | 当前仓库，可提交 Git |
| 插件 | 插件内 `skills/<name>/SKILL.md` | 启用插件的项目 |

**同名覆盖**：企业 > 个人 > 项目。插件技能命名空间为 `plugin-name:skill-name`，避免与其它级别冲突。

**发现范围**：

- 从当前工作目录向上到仓库根，加载沿途 `.claude/skills/`。
- 编辑子目录文件时，还会按需发现该子目录下的嵌套 `.claude/skills/`，适合 monorepo 按包拆分技能。
- `--add-dir` 附加目录中的 `.claude/skills/` 会被加载；其它 `.claude/` 配置多数不会从附加目录发现，见 [permissions 例外表](https://code.claude.com/docs/en/permissions#additional-directories-grant-file-access-not-configuration)。

**热更新**：会话中对 `~/.claude/skills/`、项目 `.claude/skills/` 的增删改，通常**无需重启**即可生效。若会话开始时目录尚不存在，需重启一次以便监视器挂载。

---

## 目录与 SKILL.md 结构

每个技能是一个**目录**，`SKILL.md` 为入口（必填）：

```text
summarize-changes/
├── SKILL.md           # 必填：frontmatter + 正文指令
├── reference.md       # 可选：详细参考，按需由模型读取
├── examples.md        # 可选：示例输出
└── scripts/
    └── validate.sh    # 可选：可由模型执行的脚本
```

`SKILL.md` 分两部分：

1. **YAML frontmatter**（`---` 之间）：名称、描述、调用控制、工具白名单等。
2. **Markdown 正文**：模型在技能激活后遵循的步骤与约束。

官方建议 `SKILL.md` 控制在约 500 行以内；长材料拆到 `reference.md` 等，并在正文中说明何时打开。

---

## 最小可验证示例：总结未提交变更

在任意 Git 仓库中创建个人技能（跨项目可用）：

```bash
mkdir -p ~/.claude/skills/summarize-changes
```

写入 `~/.claude/skills/summarize-changes/SKILL.md`：

```yaml
---
description: 总结未提交变更并标出风险。在用户问改了什么、要写 commit message 或 review diff 时使用。
---

## 当前变更

!`git diff HEAD`

## 指令

用两到三条要点总结上方 diff。若发现缺少错误处理、硬编码、测试遗漏等风险，逐条列出。若 diff 为空，说明没有未提交变更。
```

说明：

- `description` 帮助模型**自动选用**；应写清「做什么」和「何时用」，优先把触发场景放在前面。
- `` !`git diff HEAD` `` 为**动态上下文注入**：Claude Code 先执行命令，再把输出替换进正文，模型看到的是真实 diff 而非猜测。

测试两种方式：

```text
我改了哪些文件？
```

或：

```text
/summarize-changes
```

改一个小文件后重试，确认摘要与风险列表符合 diff。

---

## 两类内容：参考型与任务型

| 类型 | 目的 | 典型 frontmatter | 调用方式 |
|------|------|------------------|----------|
| 参考型 | 约定、风格、领域知识 | 默认即可 | 模型在相关任务时自动加载正文 |
| 任务型 | 部署、提交、代码生成等**有副作用**的流程 | `disable-model-invocation: true` | 主要由你输入 `/name` |

参考型示例（节选）：

```yaml
---
name: api-conventions
description: 本仓库 API 设计约定。编写或修改 HTTP 接口时使用。
---

编写 API 时：
- RESTful 资源命名
- 统一错误响应格式
- 请求体验证
```

任务型示例（节选）：

```yaml
---
name: deploy
description: 将应用部署到生产环境
disable-model-invocation: true
---

部署步骤：
1. 运行测试套件
2. 构建应用
3. 推送到目标环境
4. 验证部署结果
```

正文一旦加载，会在会话中**持续占用上下文**（见下文生命周期）。写技能时与 [CLAUDE.md 最佳实践](/claude-code/claude-md/) 相同：只写模型缺少的信息，避免冗长解释。

---

## 控制谁可以调用

| frontmatter | 你可 `/` 调用 | 模型可自动选用 | 描述是否进入技能列表 |
|-------------|---------------|----------------|----------------------|
| 默认 | 是 | 是 | 是，正文调用时再加载 |
| `disable-model-invocation: true` | 是 | 否 | 否，仅你调用时加载正文 |
| `user-invocable: false` | 否 | 是 | 是，供背景知识 |

典型用法：

- **仅手动**：`/deploy`、`/commit` 类有副作用流程，加 `disable-model-invocation: true`。
- **仅模型**：`legacy-system-context` 类背景说明，加 `user-invocable: false`，菜单里不出现无意义的斜杠命令。

在 [权限](/claude-code/agent-loop/) 中还可 `deny` 整个 `Skill` 工具，或用 `Skill(commit)`、`Skill(deploy *)` 细粒度放行或拒绝。`user-invocable: false` **不**阻止 Skill 工具调用；要禁止模型选用需用 `disable-model-invocation: true` 或权限规则。

`/skills` 菜单配合 `skillOverrides` 可在不修改 `SKILL.md` 的情况下折叠描述或关闭技能，写入 `.claude/settings.local.json`。详见官方 [Override skill visibility](https://code.claude.com/docs/en/skills#override-skill-visibility-from-settings)。

---

## 常用 frontmatter 字段

完整列表以 [Frontmatter reference](https://code.claude.com/docs/en/skills#frontmatter-reference) 为准。日常最常接触：

| 字段 | 作用 |
|------|------|
| `name` | 显示名；省略则用目录名。小写字母、数字、连字符，最长 64 字符 |
| `description` | **推荐**；模型用来判断是否选用。与 `when_to_use` 合计展示上限约 1536 字符 |
| `when_to_use` | 补充触发语，拼进描述 |
| `argument-hint` | 自动补全提示，如 `[issue-number]` |
| `arguments` | 命名位置参数，对应正文中的 `$issue` 等 |
| `disable-model-invocation` | 禁止模型自动调用 |
| `user-invocable` | 是否在 `/` 菜单显示 |
| `allowed-tools` | 技能激活期间这些工具可免逐次确认，如 `Bash(git *)` |
| `paths` | glob；仅当操作匹配文件时自动激活 |
| `context: fork` | 在子代理隔离环境中执行正文 |
| `agent` | 与 `context: fork` 配合，如 `Explore`、`Plan` |
| `model` / `effort` | 本回合临时覆盖模型或推理力度 |
| `hooks` | 技能生命周期内的 Hook，见 [Hooks 章节](/claude-code/hooks/) |

### 参数替换

| 占位符 | 含义 |
|--------|------|
| `$ARGUMENTS` | `/skill-name` 后的全部参数 |
| `$0`、`$1` 或 `$ARGUMENTS[0]` | 按位置取参数 |
| `$name` | 与 `arguments:` 列表对应的命名参数 |
| `${CLAUDE_SESSION_ID}` | 当前会话 ID |
| `${CLAUDE_SKILL_DIR}` | 技能目录，便于引用捆绑脚本 |

若调用时带了参数但正文没有 `$ARGUMENTS`，运行时会追加 `ARGUMENTS: ...` 行，避免参数丢失。

### 动态上下文与多行命令

行内注入：

```markdown
当前分支：!`git branch --show-current`
```

多行块：

````markdown
```!
node --version
npm --version
git status --short
```
````

命令在模型看到技能**之前**执行一次；输出以纯文本插入，**不会**二次解析新的 `` !` `` 占位符。

企业可在 [settings](https://code.claude.com/docs/en/settings) 中设置 `disableSkillShellExecution: true`，将用户/项目/插件技能中的 shell 注入替换为策略提示。捆绑技能与企业托管技能不受此项影响。

### 附属文件与脚本

在 `SKILL.md` 中显式指向 `reference.md`、`scripts/helper.py`，模型会在需要时再读或执行。生成可视化 HTML、跑本地分析脚本等模式见官方 [Generate visual output](https://code.claude.com/docs/en/skills#generate-visual-output)。

---

## 技能正文在会话中的生命周期

调用技能后，渲染后的 `SKILL.md` 内容作为**一条消息**进入对话，并在后续回合中保留。Claude Code **不会**每轮重新读磁盘上的文件；若希望全程生效，把约束写成持续有效的指令，而不是「第一步做一次」的一次性说明。

[自动压缩](/claude-code/agent-loop/) 时，每个技能保留最近一次调用的前 5000 token，多技能合计约 25000 token，**从最近调用的技能开始填充**。调用很多技能后，较早的技能可能在压缩后只剩摘要或消失。若发现技能「说着说着就不听了」，可 `/skill-name` 重新调用，或把关键约束改到 [Hook](/claude-code/hooks/) 里做确定性 enforcement。

---

## 捆绑技能与内置命令

捆绑技能与自建技能机制相同：本质是交给 Claude 的详细提示，由 Claude 编排工具完成工作。常见捆绑技能包括：

| 命令 | 用途摘要 |
|------|----------|
| `/simplify` | 审查近期改动，做质量与简化建议 |
| `/batch` | 大规模变更拆分为并行子任务，常配合 worktree |
| `/debug` | 开启并分析会话调试日志 |
| `/loop` | 按条件循环执行直到满足目标 |
| `/claude-api` | 加载 Claude API 参考，支持 migrate 等子命令 |

另有一些内置命令通过 Skill 机制暴露给模型，例如 `/init`、`/review`、`/security-review`；`/compact`、`/help` 等则是 CLI 固定逻辑。完整表见 [Commands](https://code.claude.com/docs/en/commands)。

不要把「营销式内置命令列表」当成你的项目技能。团队应把**自己的**流程写进 `.claude/skills/` 并 code review。

---

## 与子代理的配合

两种组合方式（详见 [SubAgents](/claude-code/subagents/)）：

| 方式 | 谁写任务 | 谁提供系统能力 |
|------|----------|----------------|
| Skill 设 `context: fork` | `SKILL.md` 正文 | `agent: Explore` 等内置或自定义子代理 |
| SubAgent 配置 `skills:` 字段 | 主会话委派消息 | 子代理启动时预加载指定技能全文 |

`context: fork` 适合**明确任务**的技能，例如「调研 $ARGUMENTS 并列出相关文件」。若正文只有「遵循这些 API 约定」而没有可执行任务，子代理可能很快返回空结果。官方 [Run skills in a subagent](https://code.claude.com/docs/en/skills#run-skills-in-a-subagent) 有完整示例。

---

## Skills、Hooks、SubAgents、Plugins 如何分工

| 维度 | Skills | Hooks | SubAgents | Plugins |
|------|--------|-------|-----------|---------|
| 触发 | `/name` 或模型选用 | 生命周期事件 | 主代理委派 | 安装后包内组件生效 |
| 确定性 | 中 | 高 | 中 | 中 |
| 上下文 | 与会话共享；`fork` 时隔离 | 共享 | 默认隔离 | 取决于包内技能与子代理 |
| 适合 | 可复用流程、清单、领域手册 | 格式化、拦截、通知 | 探索、并行、大任务拆分 | 跨项目分发整套能力 |
| 不适合 | 必须每次工具后都执行的动作 | 整段业务流程 | 一句就能说完的琐事 | 一两句项目事实 |

记忆口诀：

- **CLAUDE.md**：项目是什么、默认怎么做。
- **Skills**：某类任务**怎么做**（可很长，但懒加载）。
- **Hooks**：某时刻**必须发生什么**（脚本保证）。
- **SubAgents**：需要**另一段上下文**去执行的任务块。
- **Plugins**：把 Skills、Hooks、MCP 等打成可安装包；机制见 [Plugins](/claude-code/plugins/)。

---

## 团队落地与共享

1. **项目技能入仓**：把 `.claude/skills/` 与 `.claude/settings.json` 一并 review；技能里 `allowed-tools` 会在用户信任工作区后生效，恶意技能可扩大工具权限。
2. **个人技能放本机**：`~/.claude/skills/` 适合个人 commit 模板、私有 checklist，不要写密钥。
3. **插件分发**：成熟流程可打包进 Plugin，经 marketplace 安装；见 [Plugins 插件](/claude-code/plugins/)。
4. **与 CLAUDE.md 拆分**：CLAUDE.md 保留 200 行以内的高频事实；超过且偏流程的内容迁到 Skill，用 `paths` 或清晰 `description` 限制触发范围。
5. **描述预算**：技能很多时，未常用技能的 `description` 可能被截断。运行 `/doctor` 查看 listing 预算；可调 `skillListingBudgetFraction` 或对低优先级技能设 `skillOverrides` 为 `name-only`。详见 [Troubleshooting](https://code.claude.com/docs/en/skills#troubleshooting)。

---

## 调试与失败模式

| 症状 | 可能原因 | 下一步 |
|------|----------|--------|
| 模型从不自动用技能 | `description` 太泛或缺少用户常用说法 | 改描述；直接 `/skill-name` 验证正文 |
| 技能过于频繁触发 | 描述过宽 | 收窄 `description` / `when_to_use`；或 `disable-model-invocation: true` |
| `/` 菜单没有 | 路径错误、未信任工作区、被 `skillOverrides` 关闭 | 检查目录名与 `SKILL.md`；`/doctor` |
| 注入的 diff 为空 | 不在 Git 仓库或命令失败 | 本地运行 `` !`git diff HEAD` `` 同类命令 |
| shell 注入被禁用 | 企业 `disableSkillShellExecution` | 改为静态说明或申请策略例外 |
| 技能后来「失效」 | 上下文压缩或模型改走其它工具 | 重新 `/skill-name`；关键约束改 Hook |
| 项目技能权限过大 | `allowed-tools` 过宽 | 收窄工具模式；配合 `deny` 规则 |

调试入口：[Debug your configuration](https://code.claude.com/docs/en/debug-your-config)。配置变更后新开一轮对话或重新调用技能即可验证。

---

## 决策边界：该写 Skill 吗

**适合写成 Skill：**

- 同一 checklist 每周粘贴多次。
- 部署、发布、合规审查等**多步流程**，且你希望 `/deploy` 一键启动。
- 长参考文档：API 规范、迁移指南，只在相关文件类型出现时加载（`paths`）。
- 需要 `` !`command` `` 把**实时** CI、PR、数据库 schema 注入提示。

**继续用 CLAUDE.md：**

- 每条会话都应知道的测试命令、目录结构、命名规范。
- 一两句话能说清、不需要单独斜杠命令的规则。

**改用 Hook：**

- Edit 后必须跑 formatter，与模型是否记得无关。
- 组织级禁止命令或路径，需要 `exit 2` 硬拦截。

**改用 SubAgent：**

- 任务会占满主会话上下文，需要隔离探索或并行多路执行。

---

## 继续读下一章之前

试着回答：

1. Skill 正文与 CLAUDE.md 在**加载时机**上有何不同？  
2. `disable-model-invocation: true` 与 `user-invocable: false` 分别限制谁？  
3. 为什么有副作用的部署流程应默认禁止模型自动调用？  
4. 什么情况下应把技能里的关键步骤改成 Hook？

自检清单：

- [ ] 在 `~/.claude/skills/` 或 `.claude/skills/` 创建过一个含 `description` 的 `SKILL.md`  
- [ ] 用自然语言与 `/skill-name` 各触发成功一次  
- [ ] 理解 `` !`command` `` 注入的是命令输出而非命令本身  
- [ ] 能说出 Skills 与 CLAUDE.md、Hooks、SubAgents、Plugins 的分工  

---

社区精选与 Superpowers 安装见 [编码向社区精选](/claude-code/skill-recommendations/)。团队自建见 [团队 Skill 实战](/claude-code/skills-team-playbook/)。

下一章：[Plugins 插件](/claude-code/plugins/)——通过 marketplace 安装技能包、Hooks、MCP 与子代理；再读 [SubAgents](/claude-code/subagents/) 理解隔离委派。
