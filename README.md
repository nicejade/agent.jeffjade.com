# 智能体漫游

[agent.jeffjade.com](https://agent.jeffjade.com) 是一个面向中文读者的 **AI Agent 教程站**。目标不是堆概念，而是让读者能讲清机制、完成真实任务，并知道工具边界在哪里。

本站用可复现的命令、文件路径与故障现象组织内容，重要结论尽量追溯到官方文档、本地代码或可验证步骤；证据不足时会直接说明。

## 项目介绍

### 定位

- **主题**：主流 AI Agent 的入门与进阶，当前以 [Claude Code](https://agent.jeffjade.com/claude-code/) 与 [Hermes Agent](https://hermes-agent.nousresearch.com/docs/) 两条教程轨道为主。
- **读者**：需要上手 Agent 工具的开发者，以及希望把 Agent 纳入日常工程流程的技术负责人。
- **写法**：每章围绕一个具体问题展开，结构为场景、概念、最小路径、机制、故障模式、使用边界；同一篇文章兼顾新手能跟做、熟手能排错、进阶读者能看到系统设计层面的取舍。

### 内容质量约定

一篇合格教程应满足三条：

1. **有据**：结论可追溯到官方文档、仓库内文件、可复现命令，或明确标注为推断。
2. **闭环**：每节有问题、答案、机制与边界。
3. **可验**：读者能通过命令输出、文件对比或典型报错自行核对。

正文默认使用**简体中文**与中文标点。撰写与评审约定见仓库根目录 [`CLAUDE.md`](./CLAUDE.md)。

## 技术栈

| 类别 | 技术 | 说明 |
| --- | --- | --- |
| 框架 | [Astro](https://astro.build/) 6.x | 静态站点与页面路由 |
| 文档 | [@astrojs/starlight](https://starlight.astro.build/) | 教程章节、侧栏、全文检索 |
| 组件 | [Svelte](https://svelte.dev/) 5 | 站点内交互组件 |
| 样式 | [Tailwind CSS](https://tailwindcss.com/) 4 | 全局与落地页样式 |
| 主题 | `starlight-theme-rapide` | Starlight 阅读体验 |
| 语言 | TypeScript | 配置、侧栏、集成逻辑 |
| 包管理 | [pnpm](https://pnpm.io/) 10 | 依赖与脚本 |

主要依赖版本见 [`package.json`](./package.json)。

## 本地开发

```bash
pnpm install
pnpm dev      # 开发服务器，默认监听 0.0.0.0
pnpm check    # Astro 类型检查（改配置或组件时建议运行）
pnpm build    # 生产构建
pnpm preview  # 预览构建结果
```

- 仅改 Markdown 文档时，建议至少执行 `pnpm build`。
- 改动 `astro.config.mjs`、组件、类型或侧栏时，建议 `pnpm check` 后再 `pnpm build`。

## 仓库结构

```
agent.jeffjade.com/
├── astro.config.mjs              # Starlight、重定向、全局侧栏
├── CLAUDE.md                     # 撰写约定与协作说明
├── HANDOFF.md                    # Hermes 系列制作进度（维护用）
├── src/
│   ├── content/docs/
│   │   ├── claude-code/          # Claude Code 正文章节
│   │   └── hermes-agent/         # Hermes Agent 正文章节
│   ├── config/
│   │   ├── claude-code-sidebar.ts
│   │   └── hermes-agent-sidebar.ts
│   ├── pages/
│   │   ├── index.astro           # 站点首页 /
│   │   ├── claude-code/          # Claude Code 专题落地页
│   │   └── hermes-agent/         # Hermes Agent 专题落地页
│   └── styles/global.css
└── README.md
```

## 站点路由

| 路径 | 说明 |
| --- | --- |
| `/` | 首页，展示各教程轨道入口 |
| `/claude-code/` | Claude Code 专题落地页；章节正文为 `/claude-code/<slug>/` |
| `/hermes-agent/` | Hermes Agent 专题落地页；章节正文为 `/hermes-agent/<slug>/` |

## 路线图

路线图按**内容轨道**与**章节状态**维护，不按日历排期。Hermes 系列的细项勾选见 [`HANDOFF.md`](./HANDOFF.md)。

### Claude Code 教程

**状态：已上线（25 章）**

| 区块 | 主题 | 状态 |
| --- | --- | --- |
| 第零部分 | 漫游前瞻 | 已发布 |
| 第一部分 | 基础认知（是什么、效率心智） | 已发布 |
| 第二部分 | 快速上手（安装、第三方 API、首会话、Slash） | 已发布 |
| 第三部分 | 工作原理（代理循环、Plan Mode） | 已发布 |
| 第四部分 | 项目记忆（CLAUDE.md） | 已发布 |
| 第五部分 | 高级扩展（Hooks、Skills、SubAgents、MCP） | 已发布 |
| 第六部分 | 实战与最佳实践 | 已发布 |
| 第七部分 | 反思与进阶 | 已发布 |
| 第八部分 | 进阶实践（调试、Token、安全、TDD、团队、心智迁移） | 已发布 |

**后续（维护向，非阻塞发布）**

- 随 Claude Code 官方能力变更，逐章核对安装步骤、命令与权限模型。
- 根据读者反馈补充故障模式与边界案例，不扩写无关章节。

侧栏顺序以 [`src/config/claude-code-sidebar.ts`](./src/config/claude-code-sidebar.ts) 为准。

### Hermes Agent 教程

**状态：已上线（14 章）**

| 区块 | 主题 | 状态 |
| --- | --- | --- |
| 入门 | 认识、安装、第一次对话 | 已发布 |
| 核心机制 | 记忆与 Skill、配置、工具系统 | 已发布 |
| 实战 | 消息网关、技能实战、高级特性 | 已发布 |
| 进阶 | 安全与性能、架构、从零实现、贡献与社区 | 已发布 |
| 收尾 | 系列总结与自测 | 已发布 |

**站点配套**

- [x] Hermes 专题落地页 `src/pages/hermes-agent/index.astro`
- [x] 首页轨道入口（`src/pages/index.astro`）
- [x] 侧栏 `src/config/hermes-agent-sidebar.ts`
- [x] Starlight 内容与 `/hermes-agent/<slug>/` 路由

侧栏顺序以 [`src/config/hermes-agent-sidebar.ts`](./src/config/hermes-agent-sidebar.ts) 为准。

### 站点与体验

| 项 | 状态 |
| --- | --- |
| 双轨道首页与 Claude Code 落地页 | 已上线 |
| Hermes 正文、侧栏与专题落地页 | 已上线 |
| 新 Agent 专题（第三条轨道） | 规划中，随选题与证据就绪再开 |

## 参与撰写

1. 先读 [`CLAUDE.md`](./CLAUDE.md) 与目标章节相邻文稿。
2. 涉及产品版本、API、安装步骤时，先查官方文档再落笔。
3. 新增章节时同步更新对应 `src/config/*-sidebar.ts`，并在章末链到下一主题。
4. 提交前运行本节「本地开发」中的校验命令。

Hermes 系列进度与官方文档索引见 [`HANDOFF.md`](./HANDOFF.md)。

## 许可与链接

- 线上站点：https://agent.jeffjade.com
- Claude Code 官方文档：https://docs.anthropic.com/en/docs/claude-code
- Hermes Agent 官方文档：https://hermes-agent.nousresearch.com/docs/
