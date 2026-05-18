---
title: CLAUDE.md 文件的艺术
description: 用 CLAUDE.md 为项目注入持久记忆、编码规范与架构灵魂，让 Claude Code 真正理解你的项目。
sidebar:
  order: 7
---

*「它刚改完 auth.ts，测试也跑通了。可是切到 api/ 目录再问同一个需求，它怎么又忘了我们的测试命令？」*

这不是 Claude Code 健忘，而是它缺少一份**项目入职文档**。你给新同事讲项目会花半小时交代上下文；给 Claude Code 做同样的事，只需要一个文件：`CLAUDE.md`。

读完本章，你会在自己的项目里写出让 Agent 一次做对的 CLAUDE.md，而不是反复纠正同一个错误。

官方说明见 [Give Claude context: CLAUDE.md](https://support.claude.com/en/articles/14553240-give-claude-context-claude-md-and-better-prompts) 与 [CLAUDE.md Files and Memory Hierarchy](https://deepwiki.com/FlorianBruniaux/claude-code-ultimate-guide/4.1-claude.md-files-and-memory-hierarchy)。

---

## CLAUDE.md 是什么

用最直白的话说：**CLAUDE.md 是一个纯 Markdown 文件，Claude Code 在每次会话启动时自动读取它。你不需要在提示词里手动引用它——文件存在即生效。**

它相当于三样东西的合体：

1. **新同事的入职文档**：项目做什么、怎么跑起来、约定是什么。
2. **团队编码规范的执行版**：不是贴在 Wiki 里没人看的文档，而是每次生成代码时都被遵守的规则。
3. **项目架构的速查卡**：目录结构、模块边界、数据流方向，几句话讲清楚。

下面是一个最小化的 CLAUDE.md 示例：

```markdown
# My Project

## 命令
- 构建: `pnpm build`
- 测试: `pnpm test`
- Lint: `pnpm lint`

## 架构
- src/ — 源码
- tests/ — 测试
- 不要直接在 tests/ 里 import 内部模块

## 规范
- 用 TypeScript 严格模式
- 命名: 组件 PascalCase，函数 camelCase
- 禁止 `any` 类型
```

就这么短。但 Claude Code 读完它之后的行为变化，比在每句提示词里重复十遍"请用 TypeScript 严格模式"更稳定。

---

## 加载机制：什么时候读到、从哪读

### 会话初始化时自动加载

CLAUDE.md 的加载发生在**会话启动时，系统提示词之后，第一条用户消息之前**。它被作为一条用户消息注入上下文——不是嵌在系统提示词里，因此不会因为系统提示词的长度限制被截断。

关键行为：

- **启动时读一次**：会话期间磁盘上的修改不会自动生效。想让新版本生效，用 `/compact` 重新压缩上下文，或通过 `/memory` 打开文件让 Claude 重新读取。
- **无摘要无截断**：CLAUDE.md 的内容会完整进入上下文，不会被自动总结。这也是为什么文件不宜过长——每一条都会占用上下文窗口空间。
- **`/clear` 后依然有效**：清空对话历史不会清掉 CLAUDE.md 的内容，它会随着新会话重新加载。

### 多层级加载顺序

Claude Code 不会只读一个 CLAUDE.md。它按从广到窄的顺序扫描多个位置，**后加载的覆盖先加载的**：

| 优先级 | 位置 | 作用域 | 用途 |
|--------|------|--------|------|
| 1（最低） | 企业管理配置或 `/etc/claude-code/CLAUDE.md` | 全组织 | 安全策略、合规要求 |
| 2 | `~/.claude/CLAUDE.md` | 本机所有项目 | 个人偏好：语言、包管理器、行为风格 |
| 3 | `~/.claude/rules/*.md` | 本机所有项目 | 模块化个人规则 |
| 4 | `./CLAUDE.md` 或 `./.claude/CLAUDE.md` | 当前项目 | 团队共享：架构、命令、约定 |
| 5 | `./.claude/rules/*.md` | 当前项目 | 模块化项目规则，支持 glob 作用域 |
| 6（最高） | `./CLAUDE.local.md` | 当前项目、当前开发者 | 个人覆盖，应加入 `.gitignore` |

子目录 CLAUDE.md 不走上述优先级。它**不在会话启动时加载**，而是在 Claude 访问该子目录内文件时按需懒加载。适合为 `packages/backend/` 或 `apps/web/` 这类独立模块写专用规则。

**动手**：在项目根目录创建 `CLAUDE.md`，写一行「回答一律以"收到"开头」。启动新会话问任意问题，确认回复以"收到"开头。再把文件删掉，开新会话确认效果消失。

---

## 分层 CLAUDE.md 策略

### 全局层：`~/.claude/CLAUDE.md`

放你个人在所有项目里都想遵守的偏好。例如：

```markdown
# 个人偏好

- 永远用中文回复
- 优先用 pnpm，不要建议 npm/yarn
- 改完代码自动运行相关测试
- 回复保持简洁，不要写长篇总结
- 不要用 emoji
```

这个文件只对你这台机器生效，不需要提交到任何仓库。

### 项目层：`./CLAUDE.md`

放团队共享的、与特定项目绑定的知识。这是**最主要、最常用**的 CLAUDE.md。应该纳入版本管理。

示例——就是本项目正在用的 CLAUDE.md：

```markdown
# CLAUDE.md

## Project scope
`agent.jeffjade.com` 是一个中文文档站，技术栈 Astro + Starlight + Svelte + Tailwind + pnpm。
目标：产出高质量教程，让读者理解机制、完成任务、认识工具边界。

## Common commands
pnpm install
pnpm dev
pnpm check
pnpm build

## Content contract
默认正文为简体中文。
一篇合格的教程必须通过三重检验：
1. 事实存在：结论可追溯到源码、官方文档、可复现命令
2. 逻辑闭合：每节有问题、答案、机制、边界
3. 经验可证伪：读者可运行命令、检查文件、对比行为
```

### 子目录层：`<subdir>/CLAUDE.md`

当项目的某个子目录有独立且足够复杂的规则时，在子目录下创建 CLAUDE.md。它只在该目录内文件被访问时加载。适用场景：

- Monorepo 中不同包的构建命令和测试框架不同
- `infra/` 目录有独立的 Terraform 或 k8s 操作规则
- `migrations/` 目录有数据库变更的强约束（如"不可修改已有 migration"）

### 个人覆盖层：`./CLAUDE.local.md`

优先级最高，覆盖以上所有层级。放你在这个项目里的个人偏好，比如本地数据库端口、调试开关、临时豁免规则。这个文件**不应提交到 Git**——加入 `.gitignore`。

### Rules 目录：`./.claude/rules/*.md`

当项目 CLAUDE.md 开始超过 200 行，拆分成多个 rules 文件更易于维护。每个 `.md` 文件是一条独立规则，支持 YAML frontmatter 声明 glob 作用域：

```markdown
---
scope: "src/api/**"
---

# API 模块规则

- 所有 API 路由必须先做参数校验
- 错误返回统一用 `ApiError` 类
```

不带 `scope` 的 rules 全局生效。带 `scope` 的 rules 只在匹配路径的文件被访问时加载。

**动手**：找一个你常用的项目，把 `~/.claude/CLAUDE.md`（全局偏好）、项目 `CLAUDE.md`（架构命令）、`CLAUDE.local.md`（本地端口）各写 3 行。开一个会话，让 Claude 说出它当前遵守了哪些规则。观察三层如何叠加。

---

## /init：五分钟生成项目 CLAUDE.md

手动从零写 CLAUDE.md 最大的问题是：你很难判断哪些信息 Claude 已经能自己看出来，哪些需要你明确告诉它。

`/init` 命令解决这个问题。它会：

1. 扫描项目目录结构、`package.json`、构建配置
2. 识别框架、测试工具、代码风格
3. 检测命名约定和目录模式
4. 生成一份结构化的 CLAUDE.md 草稿

你只需要做一件事：**审查并删除不准确的内容**。这一步不能省——`/init` 可能误判测试命令，或把历史上遗留但已废弃的目录当作活跃模块。

官方推荐的工作流：

```
/init → 审查修改 → 补充硬约束和已知陷阱 → 提交到 Git
```

整个过程约五分钟，收益是永久的。之后每季快速扫一眼，删掉过时内容。

**动手**：在一个你还没有 CLAUDE.md 的项目里运行 `/init`。逐条核对生成的测试命令能否真的跑通。删掉任何"看起来对但你没验证过"的内容。

---

## 编写技巧：什么该写，什么不该写

### 值得写入的内容

**命令**：构建、测试、启动、lint、格式化。这些是 Claude Code 最高频执行的命令，写错一条浪费多轮对话。

```markdown
## 常用命令
- 开发: `pnpm dev`
- 构建: `pnpm build`
- 测试: `pnpm test`          # 别写 npm test，项目用的是 pnpm
- 单文件测试: `pnpm test -- -t "test name"`
- Lint: `pnpm check`
```

**命名与组织约定**：文件放哪、怎么命名、import 顺序。

```markdown
## 命名约定
- 组件文件: PascalCase.svelte
- 工具函数: camelCase.ts
- 测试文件: 与被测文件同名，.test.ts 后缀
- 导入顺序: 第三方 → 内部模块 → 相对路径
```

**硬约束**：不能做的事。这些是 Claude Code 最需要的边界信息，因为它从代码里读不出来。

```markdown
## 硬约束
- 永远不要修改 generated/ 目录
- 不要编辑 migration 文件，只能新增
- 测试不要连接生产数据库
- 不要在组件里直接调 API，统一走 services 层
```

**架构概要**：三到五句话说清楚大块怎么通信。

```markdown
## 架构
- src/content/docs/ — Starlight Markdown 内容
- src/config/ — 侧边栏、导航配置
- src/styles/ — 全局样式
- 数据流: Markdown → Astro/Starlight → 静态 HTML
```

**已知陷阱**：新人最常踩的坑。

```markdown
## 已知陷阱
- astro.config.mjs 里改路由后要检查 sidebar 配置是否同步
- pnpm 的 hoist 行为与 npm 不同，别用 --legacy-peer-deps
```

### 不该写的内容

| 不该写 | 原因 |
|--------|------|
| API 完整文档 | Claude 会直接读源码 |
| 变更日志 | `git log` 比任何手写日志都准确 |
| 从文件树就能看出来的内容 | 例如「src/ 是源码目录」 |
| 团队并不遵守的规则 | 过期规则比没有规则更糟——Claude 会认真遵守，但实际代码不一致 |
| 长篇架构设计文档 | 单独建 `docs/architecture.md`，在 CLAUDE.md 里只放链接 |

### 长度原则

官方建议控制在约 200 行以内。核心逻辑：**CLAUDE.md 的每一行都占用每次请求的上下文窗口**。如果某条信息 Claude 有 90% 的概率不需要，那它就不该在 CLAUDE.md 里。

一个检验方法：下次 Claude 做错事时，先不纠正，而是问自己——「如果 CLAUDE.md 里多写一行规则，这次错误会不会不发生？」如果答案是"会"，加上那条规则。如果答案是"它应该自己知道"，那这条规则不配进 CLAUDE.md。

---

## 自动记忆系统：让 Claude 自己记笔记

CLAUDE.md 是手动编写的、相对稳定的规则。但会话中经常产生临时但重要的上下文——「上次我们决定暂缓升级 React 到 19」「测试数据库的端口改成了 5433」——这些不配写进 CLAUDE.md，但下次会话又需要知道。

Claude Code v2.1.59 引入了**自动记忆系统**解决这个问题。它的存储结构如下：

```
~/.claude/projects/<project-hash>/memory/
├── MEMORY.md              # 索引文件（每行一个指针，上限 200 行）
├── user_role.md           # 你的角色、技能、偏好
├── feedback_style.md      # 你给过的纠正和反馈
├── project_overview.md    # 架构决策、进行中的工作
└── reference_links.md     # 外部资源、文档链接
```

工作机制：

1. **自动记录**：Claude 在会话中察觉到重要信息时（你的偏好、项目决策、bug 修复经验），自动写入对应的 memory 文件。
2. **索引上限**：`MEMORY.md` 是加载到每次会话的索引，上限 200 行。超出时旧条目被推出。
3. **关键词检索**：记忆检索基于精确关键词匹配，不是语义搜索。这意味着你在提示词里用的术语和 memory 里存的术语要一致才能命中。
4. **Dream 清理**：在空闲时，Claude 会在后台合并、清理冗余记忆。

**动手**：在会话中说「记住：我们这个项目的测试超时时间设成了 30 秒」。然后运行 `/memory` 打开 memory 文件，确认新条目已写入。

### 自动记忆与 CLAUDE.md 的分工

| 维度 | CLAUDE.md | 自动记忆 |
|------|-----------|----------|
| 谁写 | 你手动编写 | Claude 自动记录 |
| 更新频率 | 低（季度 review） | 高（每会话都可能写入） |
| 内容类型 | 规范、架构、命令 | 偏好、决策、上下文 |
| 版本管理 | 纳入 Git | 不入 Git（个人数据） |
| 优先级 | 高（显式指令） | 低（供参考的上下文） |

两者的关系不是替代，而是互补。CLAUDE.md 是你的意图；自动记忆是 Claude 的观察笔记。

---

## 团队协作

### 版本管理

项目 CLAUDE.md 应纳入 Git，和代码一起评审、一起演进。改 CLAUDE.md 就是改变团队与 AI 的接口——它的改动应该经过 PR 审查，理由和改 `eslint.config.mjs` 一样。

```bash
# 首次添加
git add CLAUDE.md
git commit -m "添加项目 CLAUDE.md，定义 AI 协作规范"
```

### 团队共享与个人偏好的分层

```
~/.claude/CLAUDE.md          ← 个人，不提交
./CLAUDE.md                  ← 团队共享，提交到 Git
./CLAUDE.local.md            ← 项目级个人覆盖，.gitignore
```

这形成了一个清晰的分工：团队在 `CLAUDE.md` 里统一"这个项目怎么做"，个人在全局或 local 文件里写"我喜欢什么风格"。

### Monorepo 中的组织

```
monorepo/
├── CLAUDE.md                # 全局：monorepo 总则、包管理器
├── packages/
│   ├── web/
│   │   └── CLAUDE.md        # Web 包：React 约定、路由规范
│   └── api/
│       └── CLAUDE.md        # API 包：数据库、鉴权规则
├── .claude/
│   └── rules/
│       ├── testing.md       # 全部包：测试框架与命令
│       └── git.md           # 全部包：提交规范
```

原则：**全局文件写通用规则，子目录文件写模块专属规则**。不要让 `packages/web/CLAUDE.md` 重复根 CLAUDE.md 已有的内容。

---

## 失败模式：症状与排查

| 症状 | 常见原因 | 下一步 |
|------|----------|--------|
| Claude 反复犯同一个错 | 规则没写进 CLAUDE.md | 加一行。不是加一段，一行就够了 |
| 改了 CLAUDE.md 但没用 | 会话已启动，不会自动重读 | `/compact` 或 `/memory` 让 Claude 重新读取 |
| Claude 遵守了规则但代码不对 | 规则本身已过时 | 检查规则是否与当前代码一致；季度 review |
| CLAUDE.md 太长被截断 | 文件超过上下文窗口可用空间 | 拆分为 rules/*.md，只保留高频信息在主文件 |
| 子目录规则不生效 | 子目录文件未被访问 | 确认 CLAUDE.md 在子目录根，不在父级 |
| 团队成员的 local 文件干扰 | `CLAUDE.local.md` 覆盖了团队约定 | 确认 `.gitignore` 包含 local 文件；定期核对 |
| 自动记忆找不到 | 关键词不匹配 | 用 `/memory` 直接查看；提示词用的术语要和 memory 里一致 |
| Claude 的改动违背了规则 | 规则之间有冲突 | 检查优先级：local > project > global。合并冲突指令 |

---

## 决策边界：什么场景配什么层

| 场景 | 写在哪 | 原因 |
|------|--------|------|
| 所有项目都要用 pnpm | `~/.claude/CLAUDE.md` | 跨项目全局偏好 |
| 这个项目用 Vitest 而非 Jest | `./CLAUDE.md` | 项目级约定 |
| 本地测试数据库端口是 5433 | `./CLAUDE.local.md` | 仅本机有效的环境变量 |
| API 包禁止直接查数据库 | `packages/api/CLAUDE.md` | 子目录专用约束 |
| 每次编辑后自动 fmt | `./.claude/rules/formatting.md` | 模块化项目规则 |
| 不要推送到 main | deny 权限规则，不是 CLAUDE.md | CLAUDE.md 管意图，权限管能力 |

最后一条最关键：**CLAUDE.md 告诉 Claude 你"想"做什么；权限设置（`settings.json` 中的 `allow`/`deny`/`ask`）决定它"能"做什么。** 在 CLAUDE.md 里写"禁止删除文件"挡不住 Bash 工具——你需要的是 `deny` 规则。见[代理循环与工具](/claude-code/agent-loop/)中的权限部分。

---

## 从本章带走什么

合上文档，试着回答：

1. CLAUDE.md 和自动记忆系统（MEMORY.md）的分工是什么？什么时候该手动写规则，什么时候交给自动记录？
2. 为什么子目录 CLAUDE.md 不在会话启动时加载？这种"懒加载"设计的取舍是什么？
3. 如果团队有人把个人偏好写进了 `./CLAUDE.md` 并提交了，会发生什么？如何修正？
4. 在 CLAUDE.md 里写"禁止 force push"能阻止 Claude 执行 `git push --force` 吗？如果不能，正确的做法是什么？

自检清单：

- [ ] 在自己的项目里运行过 `/init` 并审查了输出
- [ ] 项目 CLAUDE.md 里至少有一行硬约束和一条已知陷阱
- [ ] 配置了 `~/.claude/CLAUDE.md` 全局个人偏好
- [ ] 通过 `/memory` 查看过自动记忆系统
- [ ] 知道 CLAUDE.md 修改后不生效时如何处理
- [ ] 能区分什么该写进 CLAUDE.md，什么该配在权限设置里

---

下一章：[Hooks 机制](/claude-code/hooks/)——在工具调用前后植入自动化脚本，构建你的安全护栏与工作流引擎。CLAUDE.md 告诉 Agent 你想要什么；Hooks 在执行层面拦住你不想要的事。
