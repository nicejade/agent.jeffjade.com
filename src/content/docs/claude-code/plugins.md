---
title: Plugins：通过市场扩展 Claude Code
description: 理解 Plugin 与 marketplace 的安装模型，区分 Plugin、Skill、Hook、SubAgent、MCP，并选型官方与社区高价值扩展。
sidebar:
  order: 15
---

*「我想一次装上 GitHub 集成、PR 审查技能和 TypeScript LSP，但不想在五个配置文件里分别手配。」*

[Skills](/claude-code/skills/) 教你写单个 `SKILL.md`。[Hooks](/claude-code/hooks/) 在固定事件跑脚本。[MCP](/claude-code/mcp/) 连接外部系统的实时数据。**Plugin** 是把这些能力（以及子代理、斜杠命令）打成**可分发包**的方式：通过 **marketplace** 发现、按插件名安装、用 scope 决定装在本机还是仓库。

官方说明见 [Discover and install plugins](https://code.claude.com/docs/en/discover-plugins)、[Plugins](https://code.claude.com/docs/en/plugins)。本章讲清机制、边界与推荐范围；社区深度安装步骤见 [第六部分 · Skill 体系](/claude-code/skill-recommendations/)。

---

## Plugin 解决什么问题

没有 Plugin 时，你要分别：

- 手写或复制 `.claude/skills/` 目录；
- 在 `settings.json` 里配 Hooks；
- 用 `claude mcp add` 接 GitHub 等；
- 维护子代理定义文件。

Plugin 把维护者打包好的 **skills、hooks、agents、MCP servers、commands** 一次装进 Claude Code。你仍要**选择信任来源**和**控制装多少**，但不必从零拼装。

**市场两步（牢记）：**

1. **添加 marketplace**：注册目录，相当于「订阅应用商店」，此时还不会安装任何插件。
2. **安装 plugin**：从目录里挑选具体包。

官方市场 `claude-plugins-official` 在多数环境下启动 Claude Code 后可在 `/plugin` 的 Discover 里直接浏览；第三方市场需先 `marketplace add`。

---

## 与 Skill、Hook、SubAgent、MCP 如何分工

| 维度 | Plugin | Skill | Hook | SubAgent | MCP |
|------|--------|-------|------|----------|-----|
| 是什么 | 分发包，可含多种组件 | 单技能目录 + `SKILL.md` | 生命周期上的脚本 | 隔离上下文的子代理 | 连接外部系统的协议服务 |
| 何时生效 | 安装并 reload 后 | `/name` 或模型选用时加载正文 | 事件触发必跑 | 主代理委派时 | 模型调用 `mcp__*` 工具时 |
| 确定性 | 中，依赖包内定义 | 中 | 高 | 中 | 中 |
| 典型场景 | 跨项目复用整套能力 | 可复用流程、清单 | 格式化、拦截、审计 | 探索、并行、大任务拆分 | 查 JIRA、PR、数据库 |
| 不适合 | 一两句项目事实 | 必须每次工具后都执行的动作 | 整段业务流程说明 | 一句能说完的琐事 | 只需粘贴一次的静态文本 |

记忆口诀：

- **CLAUDE.md**：项目是什么、默认怎么做。
- **Skill**：某类任务怎么做（可很长，懒加载）。
- **Hook**：某时刻必须发生什么（脚本保证）。
- **SubAgent**：需要另一段上下文执行的任务块。
- **Plugin**：把以上多种能力**打包分发**；装完后技能常带命名空间，如 `plugin-name:skill-name`。
- **MCP**：Plugin 里可以捆绑 MCP Server，也可以单独用 CLI 配置。

完整 Skill 机制见 [Skills](/claude-code/skills/)；子代理见 [SubAgents](/claude-code/subagents/)。

---

## 安装最小路径

**浏览与安装：**

```text
/plugin
/plugin install github@claude-plugins-official
/plugin marketplace add anthropics/skills
/plugin install document-skills@anthropic-agent-skills
```

安装后执行 `/reload-plugins` 激活。Discover 详情页（较新版本）会显示 **Context cost**、**Will install**（将安装的 commands、agents、skills、hooks、MCP、LSP），安装前务必阅读。

**安装范围（scope）：**

| Scope | 含义 |
|-------|------|
| User | 本机所有项目 |
| Project | 当前仓库，协作共享 |
| Local | 仅本机 + 当前仓库 |

详见官方 [Configuration scopes](https://code.claude.com/docs/en/settings#configuration-scopes)。

**添加第三方市场示例：**

```text
/plugin marketplace add anthropics/claude-plugins-community
/plugin install <plugin-name>@claude-community
```

社区市场条目固定到 commit SHA，并经自动化校验；仍只装你信任的来源。

---

## 推荐 Plugins 与社区来源（范围 B）

> 插件名与市场 ID 随版本变化；安装前以 [Discover plugins](https://code.claude.com/docs/en/discover-plugins) 与 [claude.com/plugins](https://claude.com/plugins) 为准。下表为本站归纳的**高价值起点**，非全量清单。

| 插件 / 来源 | 何时装 | 安装要点 |
|-------------|--------|----------|
| [Claude Code Setup](https://claude.com/plugins/claude-code-setup) | 新项目，不知先配 hooks 还是 MCP | Anthropic Verified；**只读**分析代码库，按栈推荐 hooks、skills、MCP、subagents；提示如 “recommend automations for this project” |
| Code intelligence（如 `typescript-lsp`） | 需要跳转定义、编辑后类型诊断 | 需本机 language server binary；缺 binary 时见 `/plugin` Errors |
| `github` 等外部集成 | 少粘贴 PR、Issue | `github@claude-plugins-official` 等 |
| Frontend Design | 要生产级 UI、避免通用 AI 审美 | Anthropic Verified |
| Code Review | PR 合并前多代理审查 | Anthropic Verified |
| Context7 | 需要版本对齐的库文档进上下文 | MCP 型插件 |
| [Superpowers](https://github.com/obra/superpowers) | 端到端交付方法论 | `superpowers@claude-plugins-official`；详装见 [编码向精选](/claude-code/skill-recommendations/#superpowers) |
| [anthropics/skills](https://github.com/anthropics/skills) | 官方技能范例、文档类技能 | 见下节 |
| [gstack](https://github.com/garrytan/gstack) | 创始人式全栈 slash 工作流 | **不是 Plugin**；见下节 |

### anthropics/skills（Plugin 市场）

Anthropic 维护的公开技能仓库，同时提供 marketplace：

```text
/plugin marketplace add anthropics/skills
/plugin install document-skills@anthropic-agent-skills
/plugin install example-skills@anthropic-agent-skills
```

`document-skills` 含 PDF、DOCX 等文档处理范例；`example-skills` 含创意、开发、企业流程等示例。也可在仓库中复制单个技能目录到 `.claude/skills/` 做裁剪安装。

更多场景分类见 [社区技能目录导读](/claude-code/skill-catalog/)。

### gstack（目录安装，非 Plugin）

[gstack](https://github.com/garrytan/gstack) 是 Garry Tan 开源的一套角色化斜杠命令（如 `/review`、`/qa`、`/ship`），通过克隆到个人技能目录安装，**不要**使用 `/plugin install`：

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup
```

`./setup` 会配置 Claude Code 并建议在 `CLAUDE.md` 中引用 gstack 浏览等约定。团队共享可用仓库内的 `gstack-team-init` 流程，见上游 README。

---

## 安装前自检（本站归纳）

1. **信任与透明度**：作者与仓库是否可信；Discover 里 **Will install** 是否可读；第三方重点看 `allowed-tools`。（GitHub star 仅作参考，不能代替审查。）
2. **权限与治理**：是否扩大 Bash、Edit；团队是否允许该 marketplace 与 scope。
3. **上下文成本**：安装前看 Discover 的 **Context cost**；多包共存后用 `/doctor` 查技能 listing，必要时 `skillOverrides` 折叠（见 [Skills](/claude-code/skills/#团队落地与共享)）。
4. **重复与冲突**：是否与已装 Plugin 重名或流程重叠（如多个端到端方法论包；见 [superpowers#355](https://github.com/obra/superpowers/issues/355)）。

---

## 失败模式与边界

| 症状 | 可能原因 | 下一步 |
|------|----------|--------|
| Plugin not found | 市场未添加或过期 | `/plugin marketplace update claude-plugins-official` 或重新 `marketplace add` |
| LSP Executable not found | 未装 language server | 按 Discover 文档安装 binary |
| `/` 菜单技能爆炸、描述被截断 | 装包过多 | `/doctor`；`skillOverrides`；卸载低优先级 Plugin |
| 安装成功但行为重复 | 多个方法论 Plugin 同时自动触发 | 只保留一个；折叠其余技能描述 |
| 怀疑恶意行为 | 不可信 marketplace | 卸载；团队用 Managed 限制市场源 |

**何时不必用 Plugin：**

- 只有一两个项目专用流程：直接 `.claude/skills/` 入仓更简单。
- 必须 100% 确定性的拦截：用 [Hooks](/claude-code/hooks/)，不要只靠 Skill 正文。
- 只需接一家 SaaS：有时单独 `claude mcp add` 比整包 Plugin 更透明。

**风险提醒：** Plugin 可在你的用户权限下执行任意代码。只装信任来源；`plugin install` 与 `marketplace add` 等同引入供应链，团队应 review 清单。

---

## 继续读下一章之前

1. 添加 marketplace 与 `plugin install` 分别解决什么问题？  
2. gstack 与 Superpowers 的安装路径有何本质区别？  
3. 你如何向同事解释「先看 Discover 的 Will install 再点 Install」？

自检清单：

- [ ] 用 `/plugin` 打开 Discover 并看过至少一个插件的 Context cost 与 Will install  
- [ ] 能说出 Plugin 与 Skill、MCP 各解决哪类问题  
- [ ] 知道 gstack 用目录克隆而非 marketplace install  

---

上一章：[Skills 技能](/claude-code/skills/) · 下一章：[SubAgents](/claude-code/subagents/)
