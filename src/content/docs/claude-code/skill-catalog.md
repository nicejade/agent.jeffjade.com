---
title: 社区技能目录导读
description: 用官方 Discover 与分类框架自行发现 Plugin 与 Skill，按场景选型而不维护全量清单。
sidebar:
  order: 18
---

*「精选三章不够，我想按场景自己找更多技能，但怕装到恶意 Plugin 或描述把上下文撑爆。」*

上一章 [编码向精选](/claude-code/skill-recommendations/) 已深度讲解 Superpowers 等三个项目。本章不列全站仓库，而是教你**如何发现、如何选型**；团队提炼模式见 [团队 Skill 实战](/claude-code/skills-team-playbook/)。

---

## 如何自己发现

| 入口 | 用途 |
|------|------|
| 会话内 `/plugin` → Discover | 浏览已添加市场里的 Plugin |
| [Discover plugins](https://code.claude.com/docs/en/discover-plugins) | 官方安装与 marketplace 说明 |
| [claude.com/plugins](https://claude.com/plugins) | 图形化浏览（条目随版本变化） |
| `/plugin marketplace add owner/repo` | 添加第三方市场 |

添加市场后安装：

```text
/plugin install <plugin-name>@<marketplace-id>
```

**选型四维（安装前自问）：**

1. **信任来源**：作者、仓库 star、是否开源可读 `SKILL.md` 与 `allowed-tools`。  
2. **权限面**：Plugin 是否扩大 Bash/Edit；团队是否允许。  
3. **描述成本**：装多个包后 `/doctor` 看技能列表 token；低优先级用 `skillOverrides` 折叠。  
4. **冲突**：是否与已装的 Superpowers、Karpathy 等重复流程或重名 Plugin（见 [superpowers#355](https://github.com/obra/superpowers/issues/355)）。

> 插件名称与市场条目随版本变化；安装前以 [官方 Discover 文档](https://code.claude.com/docs/en/discover-plugins) 为准。本站只做分类与评估框架，**不维护全量清单**。

---

## 分类导读

每类给出**何时选**与**代表项**；深度安装步骤见 [编码向精选](/claude-code/skill-recommendations/) 或官方市场页面。

### 端到端工程方法论

**何时选：** 希望默认「先澄清 → 计划 → TDD → 审查」而不是接到需求就改代码。

| 代表 | 说明 |
|------|------|
| [Superpowers](https://github.com/obra/superpowers) | `/plugin install superpowers@claude-plugins-official` |
| 官方 `claude-plugins-official` 其它工作流类 Plugin | 在 Discover 中按 “workflow” / “development” 浏览 |

本站详解：[编码向精选 · Superpowers](/claude-code/skill-recommendations/#superpowers)。

### 编码纪律与性格

**何时选：** 模型爱过度设计、顺手改无关文件、目标含糊。

| 代表 | 说明 |
|------|------|
| [Karpathy skills](https://github.com/multica-ai/andrej-karpathy-skills) | `andrej-karpathy-skills@karpathy-skills` |

本站详解：[编码向精选 · Karpathy](/claude-code/skill-recommendations/#karpathy-风格准则)。

### 前端、UI 与 UX

**何时选：** 落地页、仪表盘、设计系统、组件库风格一致。

| 代表 | 说明 |
|------|------|
| [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | `ui-ux-pro-max@ui-ux-pro-max-skill` |

本站详解：[前端向附录](/claude-code/skill-recommendations/#前端向附录ui-ux-pro-max)。

### 测试与 TDD

**何时选：** 强制先失败测试再实现；与 CI 门禁配合。

| 代表 | 说明 |
|------|------|
| Superpowers `test-driven-development` | 随 Superpowers Plugin 安装 |
| 项目内自建 `.claude/skills/run-tests/` | 写入你们测试命令与覆盖率要求 |

交叉阅读：[测试驱动与质量保障](/claude-code/tdd-quality/)。

### 调试与根因分析

**何时选：** 反复修表面症状、需要分阶段排查。

| 代表 | 说明 |
|------|------|
| Superpowers `systematic-debugging` | 四阶段根因流程 |
| 内置 `/debug` | 会话日志分析 |

交叉阅读：[调试与错误恢复](/claude-code/debug-error-recovery/)。

### 代码审查与 PR

**何时选：** 合并前一致性审查、安全与风格检查。

| 代表 | 说明 |
|------|------|
| 官方市场 **code-review** 类 Plugin | 在 Discover 搜索 “review”；安装命令以市场页为准 |
| 项目 Skill `pr-review` | 自建 checklist + `` !`gh pr diff` `` |

不必与 Superpowers `requesting-code-review` 同时自动触发过多；用 `skillOverrides` 控制可见性。

### 安全与合规

**何时选：** 密钥扫描、依赖漏洞、禁止路径。

| 代表 | 说明 |
|------|------|
| 官方 **security** 类 Plugin | Discover 搜索 “security” |
| [Hooks](/claude-code/hooks/) + `PreToolUse` | 确定性拦截，与 Skill 互补 |

交叉阅读：[安全边界与权限](/claude-code/security-permissions/)。

### 文档与变更说明

**何时选：** 写 commit message、CHANGELOG、发布说明。

| 代表 | 说明 |
|------|------|
| 内置 `/commit` 等 | 见 [Slash 命令](/claude-code/slash-commands/) |
| 自建 `summarize-changes` | 见 [Skills 示例](/claude-code/skills/#最小可验证示例总结未提交变更) |

---

## 不建议的做法

- 不经 review 批量安装十几个 Plugin，导致 `/doctor` 描述截断。  
- 在本章重复抄写 [编码向精选](/claude-code/skill-recommendations/) 已有安装长文。  
- 把应写入 [CLAUDE.md](/claude-code/claude-md/) 的一两句事实拆成十个 Skill。

---

## 继续读下一章之前

1. 添加 marketplace 与 `plugin install` 的区别是什么？  
2. 你如何向同事解释「只借 Superpowers 的 TDD 技能、不装全包」？

---

上一章：[编码向社区精选](/claude-code/skill-recommendations/) · 下一章：[团队 Skill 实战](/claude-code/skills-team-playbook/)
