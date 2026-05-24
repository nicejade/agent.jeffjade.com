---
title: CLAUDE.md 编写与维护
description: 用分层文件、路径 rules 与 /init 写出可验证的项目记忆，控制 200 行预算并避免与 Skill 重复堆叠。
sidebar:
  order: 11
---

*「根目录 CLAUDE.md 已经 300 行，模型还是跑错测试命令；同事又在里面贴了整份 API 文档。」*

本章假设你已读过 [项目记忆总览](/claude-code/claude-md/)。目标：能独立维护团队可 review 的 `CLAUDE.md` 与 `.claude/rules/`，并知道什么不该写进每次会话都加载的文件。

---

## 写在哪一层

| 范围 | 位置 | 用途 | 是否进 Git |
| --- | --- | --- | --- |
| 用户 | `~/.claude/CLAUDE.md` | 跨项目偏好 | 否 |
| 用户规则 | `~/.claude/rules/*.md` | 模块化个人规则 | 否 |
| 项目 | `./CLAUDE.md` 或 `./.claude/CLAUDE.md` | 团队共享主记忆 | 是 |
| 项目规则 | `./.claude/rules/*.md` | 可路径作用域 | 是 |
| 本地 | `./CLAUDE.local.md` | 端口、沙箱 URL | 否，应 `.gitignore` |
| 子目录 | `<subdir>/CLAUDE.md` | 包专用约定 | 是 |

用户级 rules 先于项目 rules 加载；**项目规则优先级更高**。

### 用户层示例

```markdown
# 个人偏好

- 默认用中文回复
- 包管理器优先 pnpm
- 改完相关代码后运行测试
```

### 项目层

团队主记忆纳入 PR 评审。本仓库示例见根目录 [CLAUDE.md](https://github.com/nicejade/agent.jeffjade.com/blob/main/CLAUDE.md)。

### 本地层与 worktree

`/init` 若选 personal 会提示把 `CLAUDE.local.md` 加入 `.gitignore`。多 worktree 时单个 worktree 的 `CLAUDE.local.md` 不自动同步；跨 worktree 共享可写：

```markdown
@~/.claude/my-project-instructions.md
```

### 子目录层

仅当该目录规则足够多、且与仓库其他部分差异大时使用。不要重复根文件已有内容。加载时机见 [Monorepo 与多工具记忆](/claude-code/memory-monorepo-ecosystem/)。

---

## 用 `.claude/rules/` 拆分大文件 {#organize-with-rules}

根 `CLAUDE.md` 超过约 **200 行**时，遵守度与 token 成本都会变差。官方建议拆到 `.claude/rules/*.md`：

```text
your-project/
├── CLAUDE.md
└── .claude/
    └── rules/
        ├── testing.md
        └── api-design.md
```

无 frontmatter 的 rule **每次会话启动都加载**。带 `paths` 的 rule **仅在 Claude 处理匹配文件时**加载：

```markdown
---
paths:
  - "src/api/**/*.ts"
---

# API 规则

- 路由必须做参数校验
- 错误统一用 ApiError
```

`paths` 支持 glob 与花括号，如 `src/**/*.{ts,tsx}`。规则目录支持 symlink，便于多仓库共享 `~/company-rules`。

**注意：** `paths` 规则省的是**每轮固定开销**，不是「模型永远看不见」；处理匹配文件时仍会进入上下文。成本细节见 [Token 成本与会话经济学](/claude-code/token-economics/)。

---

## 导入：`@` 与 AGENTS.md

在 `CLAUDE.md` 中用 `@path/to/file` 拉入 README 或 `docs/git-instructions.md`。相对路径相对于**当前文件**；最多递归 5 层。首次外部导入会弹出批准列表。

**误区：** 导入只为组织方便，**导入内容仍会在启动时全部进入上下文**，不能靠 `@` 减少 token。

Claude Code **不自动读** `AGENTS.md`。可统一入口：

```markdown
@AGENTS.md

## Claude Code

对 `src/billing/` 下改动先使用 plan 模式。
```

`/init` 会参考 `AGENTS.md`、`.cursorrules` 等生成草稿，仍需人工审查。跨工具对照见 [Monorepo 与多工具记忆](/claude-code/memory-monorepo-ecosystem/)。

---

## `/init`：生成可验证的草稿

手动从零写容易漏命令或误写已废弃脚本。

```text
/init → 本地跑通测试与构建 → 补硬约束与陷阱 → 提交 Git
```

- 已有 `CLAUDE.md` 时，`/init` **建议改进**而非盲目覆盖。
- `CLAUDE_CODE_NEW_INIT=1` 启用交互式流程：可选生成 CLAUDE.md、Skills、Hooks，子代理探索后再写入。

**动手：** 在无 `CLAUDE.md` 的仓库运行 `/init`，删掉未验证的猜测行，只保留你跑通过的命令。

### 按技术栈的最小模板

**Node / pnpm：**

```markdown
## 命令
- 安装: `pnpm install`
- 测试: `pnpm test`
- 构建: `pnpm build`

## 硬约束
- 禁止修改 lockfile 除非明确要求
```

**Python / uv 或 poetry：**

```markdown
## 命令
- 测试: `pytest` 或项目文档中的等价命令
- 类型检查: `mypy src/`（若项目使用）

## 硬约束
- 禁止向生产配置写入密钥
```

只写 Agent **无法从 `package.json` / `pyproject.toml` 可靠推断**的条目。

---

## 写什么、不写什么

### 值得写

| 类型 | 示例 |
| --- | --- |
| 命令 | `pnpm test -- -t "name"` |
| 硬约束 | 禁止改 `generated/` |
| 命名与目录 | API 只走 services 层 |
| 架构概要 | 三句话数据流 |
| 已知陷阱 | 改 `astro.config` 后同步 sidebar |

写法要**可验证**：「2 空格缩进」优于「格式规范一点」。

### 不必写

| 不必写 | 原因 |
| --- | --- |
| 完整 API 文档 | Claude 会 Read 源码 |
| 变更日志 | `git log` 更准确 |
| 目录树已能看出的结构 | 浪费上下文 |
| 团队并不遵守的规则 | 比没有更糟 |
| 长篇设计 doc | 放 `docs/`，根文件只链或 `@` |

**经验法则：** 若 Claude 有九成概率不需要这条信息，就不要放在每次启动都加载的 `CLAUDE.md` 里。不能则改提示、[权限](/claude-code/security-permissions/) 或 [Hooks](/claude-code/hooks/)。

---

## 失败模式（编写侧）

| 症状 | 常见原因 | 下一步 |
| --- | --- | --- |
| 反复犯同一错 | 未写入 CLAUDE.md | 加一行可验证规则 |
| 文件太长、遵守变差 | 超过约 200 行 | 拆 `paths` rules |
| 规则互相矛盾 | 多层文件冲突 | 合并或删过时条目 |
| `/init` 写了错误命令 | 未本地验证 | 跑通后再提交 |

排障加载列表、compact 丢约定见 [自动记忆与 `/memory`](/claude-code/auto-memory/) 与 [Monorepo 与多工具记忆](/claude-code/memory-monorepo-ecosystem/)。

---

## 自检清单

- [ ] 项目 `CLAUDE.md` 含至少一条硬约束与一条陷阱
- [ ] 测试命令在本地跑通过
- [ ] 超过 200 行时已拆 rules 或子目录文件
- [ ] 没有把多步流程手册塞进根文件

---

下一章：[自动记忆与 `/memory`](/claude-code/auto-memory/)——审计 Claude 自动写的 `MEMORY.md`，并决定何时晋升到 CLAUDE.md。
