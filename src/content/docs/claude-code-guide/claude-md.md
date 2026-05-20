---
title: CLAUDE.md 的艺术
description: 用 CLAUDE.md 与自动记忆为项目注入跨会话约定，让代理循环与 Plan Mode 默认遵守同一套命令、规范与边界。
sidebar:
  order: 8
---

*「Plan Mode 里的计划写得挺好，可一批准执行，它又跑了 `npm test` 而不是我们仓库里的 `pnpm test`。」*

前三章你已理解 [代理循环](/claude-code-guide/agent-loop/) 与 [Plan Mode](/claude-code-guide/plan-mode/)：模型每轮都会读当前上下文里的项目说明，再决定调用哪些工具。缺的不是「更聪明的提示」，而是**跨会话仍生效的项目入职文档**。本指南把这一块单独收成**第四部分 · 项目记忆**：只谈 Claude 如何记住你的项目，以及你应把什么写进记忆、什么交给别的机制。

官方说明见 [How Claude remembers your project](https://code.claude.com/docs/en/memory)。

---

## 项目记忆解决什么问题

每次新会话的上下文窗口都是空的。若没有持久记忆，你会反复交代：

- 测试命令是 `pnpm test` 还是 `npm test`
- 哪些目录禁止修改
- 大改前是否要先 `/plan`

**项目记忆**不是让模型「变聪明」，而是把**团队已达成共识的事实**写进每次会话都会加载的上下文，减少循环里的重复纠正。

Claude Code 提供两套互补机制：

| | CLAUDE.md | 自动记忆 Auto Memory |
| --- | --- | --- |
| 谁写 | 你 | Claude |
| 内容 | 规范、命令、架构约定 | 从纠正中沉淀的偏好与经验 |
| 共享 | 项目级可进 Git；用户级在本机 | 按仓库哈希存在本机，不进 Git |
| 适用 | 每条会话都应遵守的硬事实 | 调试心得、临时决策、个人习惯 |
| 加载 | 会话启动时全文注入 | `MEMORY.md` 前 200 行或 25KB |

两者都是**上下文**，不是客户端强制配置。写得越具体，遵守越稳定；要「无论模型怎么想都必须执行」的步骤，见 [Hooks](/claude-code-guide/hooks/) 与 [代理循环](/claude-code-guide/agent-loop/) 中的权限规则。

---

## CLAUDE.md 是什么

**CLAUDE.md** 是纯 Markdown 文件。Claude Code 在会话启动时自动读取，**不必在提示词里 `@` 它**。它相当于：

1. **新同事的入职说明**：项目做什么、怎么跑、目录大致分工。
2. **可执行的编码约定**：命名、测试、禁止事项。
3. **架构速查**：三到五句话说清模块如何协作。

最小示例：

```markdown
# My Project

## 命令
- 构建: `pnpm build`
- 测试: `pnpm test`
- Lint: `pnpm lint`

## 架构
- src/ — 源码
- tests/ — 测试

## 硬约束
- 禁止修改 generated/
- 禁止编辑已有 migration，只能新增
```

短文件往往比在长提示里重复十遍「用 TypeScript 严格模式」更稳，因为它在**会话起点**就与对话一起进入上下文。

### 何时该往 CLAUDE.md 里加一行

官方建议：当你发现自己在**重复纠正同一件事**时写入。典型信号：

- Claude 第二次犯同一种错
- Code Review 指出「它本该知道」的仓库约定
- 你刚在上个会话里打过的说明，这次又要再打一遍

若某条说明只属于**单一子目录**或**多步流程**，优先考虑 [`.claude/rules/`](#organize-with-rules) 的路径规则，或第五部分的 [Skills](/claude-code-guide/skills/)，而不是全部堆进根 `CLAUDE.md`。

---

## 加载机制：拼接，不是覆盖

常见误解是「后加载的文件会覆盖先加载的」。官方行为是：**沿目录树发现的多个 CLAUDE.md 会拼接进同一段上下文**，而不是后者替换前者。

### 从工作目录向上 walk

Claude Code 从**当前工作目录**向上走到文件系统根，收集沿途的 `CLAUDE.md` 与 `CLAUDE.local.md`。例如在 `foo/bar/` 启动时，会加载 `foo/bar/` 与 `foo/` 两级（以及更上层若存在）。

拼接顺序（先进入上下文的在前，后进入的在后）：

1. **目录树**：从靠近根的路径到靠近你 `cwd` 的路径，越靠近你启动位置的内容越靠后。
2. **同一目录内**：先 `CLAUDE.md`，再 `CLAUDE.local.md`。

因此：**更靠近你当前工作目录的说明，在上下文中更靠后**，模型读完全部拼接内容后再开始第一轮推理。

```
/  …  /foo/CLAUDE.md          ← 先进入上下文
        /foo/bar/CLAUDE.md    ← 后进入，更贴近当前任务
        /foo/bar/CLAUDE.local.md
```

### 子目录：按需懒加载

子目录下的 `CLAUDE.md` **不在会话启动时加载**。当 Claude 在该子目录内 **Read** 相关文件时，才把该子目录的说明注入上下文。适合 monorepo 里 `packages/api/`、`apps/web/` 的专用约定。

### 用户级与托管策略

| 范围 | 位置 | 用途 |
| --- | --- | --- |
| 托管策略 | macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`；Linux/WSL: `/etc/claude-code-guide/CLAUDE.md`；Windows: `C:\Program Files\ClaudeCode\CLAUDE.md` | 组织统一安全与合规说明 |
| 用户 | `~/.claude/CLAUDE.md` | 跨项目个人偏好 |
| 用户规则 | `~/.claude/rules/*.md` | 模块化个人规则 |
| 项目 | `./CLAUDE.md` 或 `./.claude/CLAUDE.md` | 团队共享，应纳入 Git |
| 项目规则 | `./.claude/rules/*.md` | 模块化、可路径作用域 |
| 本地覆盖 | `./CLAUDE.local.md` | 本机专用，应 `.gitignore` |

托管策略与用户说明在会话启动时加载；项目与子目录规则按上文 walk 与懒加载规则处理。用户级 rules 先于项目 rules 进入上下文，**项目规则优先级更高**。

### 与 `/compact` 的关系

根目录的 `CLAUDE.md` 在 `/compact` 之后会从磁盘**重新注入**。子目录 `CLAUDE.md` 不会在 compact 后自动重载，要等到再次 Read 该目录文件时才会出现。只在聊天里说过、没写进文件的约定，compact 后可能丢失。详见官方 [What survives compaction](https://code.claude.com/en/context-window#what-survives-compaction)。

**动手**：在项目根写 `CLAUDE.md`，加一行「回答以收到开头」。新开会话任意提问，确认前缀。删掉该行并新开会话，确认效果消失。再运行 `/memory`，核对列表里是否出现该文件。

---

## 分层策略：写在哪一层

### 用户层 `~/.claude/CLAUDE.md`

放**所有项目**都适用的偏好，不提交 Git：

```markdown
# 个人偏好

- 默认用中文回复
- 包管理器优先 pnpm
- 改完相关代码后运行测试
- 回复简洁，不用 emoji
```

### 项目层 `./CLAUDE.md`

团队共享的**主记忆文件**，纳入版本管理与 PR 评审。本仓库示例见项目根 [CLAUDE.md](https://github.com/nicejade/agent.jeffjade.com/blob/main/CLAUDE.md)：技术栈、`pnpm` 命令、教程写作契约等。

### 本地层 `./CLAUDE.local.md`

本机端口、个人沙箱 URL、临时豁免。`/init` 若选择 personal 选项会提示加入 `.gitignore`。多 worktree 时，单个 worktree 里的 `CLAUDE.local.md` 不会自动同步到其他 worktree；要跨 worktree 共享可 `@~/.claude/my-project-instructions.md` 导入。

### 子目录层 `<subdir>/CLAUDE.md`

仅当该目录规则足够多、且与仓库其他部分差异大时使用。不要重复根文件已有内容。

### Monorepo 排除无关记忆

大仓库 walk 可能拾取其他团队的 `CLAUDE.md`。在 `.claude/settings.local.json` 用 `claudeMdExcludes` 按 glob 跳过路径。托管策略文件不可被排除。

---

## 用 `.claude/rules/` 拆分大文件 {#organize-with-rules}

根 `CLAUDE.md` 超过约 **200 行**时，遵守度与 token 成本都会变差。把主题拆到 `.claude/rules/*.md`：

```text
your-project/
├── CLAUDE.md
└── .claude/
    └── rules/
        ├── testing.md
        └── api-design.md
```

无 frontmatter 的 rule **每次会话启动都加载**。带 `paths` 的 rule **仅在 Claude 处理匹配文件时**加载，节省上下文：

```markdown
---
paths:
  - "src/api/**/*.ts"
---

# API 规则

- 路由必须做参数校验
- 错误统一用 ApiError
```

`paths` 支持 glob 与花括号，如 `src/**/*.{ts,tsx}`。规则目录支持 symlink，便于多仓库共享一套 `~/company-rules`。

---

## 导入：`@` 与 AGENTS.md

### `@` 引用其他文件

在 `CLAUDE.md` 中用 `@path/to/file` 拉入 README、`package.json` 或 `docs/git-instructions.md`。相对路径相对于**当前文件**解析；最多递归 5 层。首次遇到外部导入会弹出批准列表。

注意：**导入只为组织方便，导入内容仍会在启动时全部进入上下文**，不能靠导入减少 token。

### 已有 AGENTS.md 的仓库

Claude Code 读 `CLAUDE.md`，不自动读 `AGENTS.md`。可让 `CLAUDE.md` 导入统一说明：

```markdown
@AGENTS.md

## Claude Code

对 `src/billing/` 下改动先使用 plan 模式。
```

`/init` 会参考已有 `AGENTS.md`、`.cursorrules` 等生成草稿，但仍需你审查。

---

## `/init`：五分钟生成草稿

手动从零写容易漏掉「Claude 已从 `package.json` 能推断的内容」，或误写已废弃命令。

`/init` 会扫描目录与配置，生成或**建议改进**现有 `CLAUDE.md`，不盲目覆盖。推荐流程：

```text
/init → 核对测试命令能跑通 → 补硬约束与陷阱 → 提交 Git
```

设置 `CLAUDE_CODE_NEW_INIT=1` 可启用交互式多阶段流程：选择生成 CLAUDE.md、Skills、Hooks，子代理探索后再写入。

**动手**：在没有 `CLAUDE.md` 的仓库运行 `/init`，逐条验证测试与构建命令，删掉未验证的猜测。

---

## 写什么、不写什么

### 值得写

| 类型 | 示例 |
| --- | --- |
| 命令 | `pnpm test`、`pnpm test -- -t "name"` |
| 硬约束 | 禁止改 `generated/`、禁止 force push 到 main |
| 命名与目录 | 组件 PascalCase、API 只走 services 层 |
| 架构概要 | 三句话说明数据流 |
| 已知陷阱 | `astro.config` 改路由后同步 sidebar |

写法要**可验证**：「2 空格缩进」优于「格式规范一点」。

### 不必写

| 不必写 | 原因 |
| --- | --- |
| 完整 API 文档 | Claude 会 Read 源码 |
| 变更日志 | `git log` 更准确 |
| 目录树已能看出的结构 | 浪费上下文 |
| 团队并不遵守的规则 | 比没有更糟 |
| 长篇设计 doc | 放 `docs/`，根文件只放链接或 `@` 导入 |

**经验法则**：若 Claude 有九成概率不需要这条信息，就不要放在每次会话都加载的 `CLAUDE.md` 里。下次它做错时问自己：「多写一行能否避免？」能则加；不能则改提示或权限。

---

## 自动记忆

自动记忆（v2.1.59+）让 Claude 在会话中把值得保留的观察写入本机目录，默认开启。存储位置：

```text
~/.claude/projects/<project-hash>/memory/
├── MEMORY.md          # 索引，每次会话加载前 200 行或 25KB
├── debugging.md       # 主题文件，按需 Read
└── …
```

`<project-hash>` 由 git 仓库推导，同一仓库的 worktree 共享一份。可用 `autoMemoryDirectory` 改路径；用 `/memory` 浏览、开关 auto memory、编辑文件。

界面出现 “Writing memory” / “Recalled memory” 时表示正在读写该目录。你说「记住：测试要起本地 Redis」时，通常会进 auto memory；要说「写进 CLAUDE.md」才会改团队共享文件。

与 CLAUDE.md 分工回顾：**你要团队统一的行为写 CLAUDE.md；你从纠正里希望 Claude 自己积累的写 auto memory。**

---

## 与 Plan Mode、权限、Hooks 的边界

| 你想达到的效果 | 用哪种机制 |
| --- | --- |
| 默认测试命令、命名风格 | `CLAUDE.md` |
| 大改前先规划 | `CLAUDE.md` 提醒 + [Plan Mode](/claude-code-guide/plan-mode/) |
| 禁止 `git push --force` 或 `rm -rf` | `permissions.deny`，不是 CLAUDE.md |
| Edit 后必须跑 Prettier | [Hooks](/claude-code-guide/hooks/) `PostToolUse` |
| 多步发布流程、偶尔才用 | [Skills](/claude-code-guide/skills/) |

[代理循环](/claude-code-guide/agent-loop/) 已说明：CLAUDE.md 写在上下文里，**挡不住**已授权的 Bash。在 CLAUDE.md 里写「禁止删文件」不等于安全；`deny` 规则或 Hook 才是硬边界。

组织部署时，官方区分：

| 关切 | 配置位置 |
| --- | --- |
| 拦截工具、沙箱、登录方式 | Managed settings |
| 代码风格、合规提醒、流程偏好 | Managed `CLAUDE.md` 或 `claudeMd` 字段 |

---

## 团队协作

1. **项目 `CLAUDE.md` 进 Git**，与 `eslint.config` 同级对待：改记忆即改人机接口。
2. **个人偏好**放 `~/.claude/CLAUDE.md` 或 `CLAUDE.local.md`，不污染团队文件。
3. **Monorepo**：根文件写通用规则，包内 `CLAUDE.md` 写包专用规则，避免复制粘贴。
4. **PR 描述**可引用 Plan Mode 批准的计划，与 `CLAUDE.md` 中的验收命令对齐，减少「Agent 以为可以改、人以为不能改」。

```bash
git add CLAUDE.md
git commit -m "添加项目 CLAUDE.md，统一 AI 协作约定"
```

---

## 失败模式

| 症状 | 常见原因 | 下一步 |
| --- | --- | --- |
| 反复犯同一错 | 未写入 CLAUDE.md | 加一行可验证规则 |
| 改了文件却不生效 | 未在 `/memory` 列表中 | 确认路径与 cwd；新开会话 |
| 子目录规则不出现 | 未 Read 该目录文件 | 让 Claude 打开该路径下文件 |
| 规则互相矛盾 | 多层 CLAUDE.md 冲突 | 合并或删除过时条目 |
| 文件太长、遵守变差 | 超过约 200 行 | 拆到 `paths` 作用域 rules |
| compact 后丢约定 | 只存在于聊天或子目录 CLAUDE.md | 提到根 CLAUDE.md |
| auto memory 找不到 | 细节在主题文件 | `/memory` 打开目录人工查看 |
| 写了仍 push 了 main | 只靠 CLAUDE.md | 加 `deny` 或 Hook |

---

## 决策边界

| 场景 | 写在哪 |
| --- | --- |
| 所有项目用 pnpm | `~/.claude/CLAUDE.md` |
| 本仓库用 Vitest | `./CLAUDE.md` |
| 本地 DB 端口 5433 | `CLAUDE.local.md` |
| 仅 API 包禁止直查库 | `packages/api/CLAUDE.md` |
| 仅编辑 `*.tsx` 时格式化 | `.claude/rules/` + `paths` |
| 每次提交前必须 lint | Hook，不是 CLAUDE.md |

长任务的窗口挤占与 handoff 属于 [上下文管理与多代理](/claude-code-guide/context-management/)，本章只解决「什么该被记住、记在哪」。

---

## 继续读下一章之前

试着回答：

1. CLAUDE.md 与 auto memory 各由谁写、适合放什么？
2. 为什么子目录 `CLAUDE.md` 不在启动时加载？取舍是什么？
3. 目录树上是「覆盖」还是「拼接」？靠近 `cwd` 的文件在上下文中偏前还是偏后？
4. 在 CLAUDE.md 写「禁止 force push」能否阻止已授权的 `git push --force`？

自检清单：

- [ ] 运行过 `/init` 并验证测试命令
- [ ] 项目 `CLAUDE.md` 含至少一条硬约束与一条陷阱
- [ ] 用 `/memory` 确认加载列表与 auto memory 目录
- [ ] 知道子目录规则与 `/compact` 后的行为差异
- [ ] 能区分 CLAUDE.md、权限 deny 与 Hooks 各自管什么

---

下一章：[Hooks 机制](/claude-code-guide/hooks/)——在工具调用前后用确定性脚本补上一道关。CLAUDE.md 表达「希望怎么做」；Hooks 在生命周期节点保证「一定执行或一定拦住」。
