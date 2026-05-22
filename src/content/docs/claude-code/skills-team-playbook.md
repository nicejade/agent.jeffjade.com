---
title: 团队 Skill 实战
description: 从 Superpowers 等社区包提炼六条可迁移模式，用练习与决策表落地团队自己的 SKILL.md 与组织 Plugin。
sidebar:
  order: 20
---

*「社区包装了一堆流程，我们真正需要的是团队自己的 PR 检查单和发布步骤，能进 Git、能 code review。」*

本章是 **第六部分 · Skill 体系** 的终点：社区包是**教材**，不是长期依赖。读完应能写出并入仓的 `.claude/skills/`，并判断何时用 Hook 代替 Skill。

前置： [Skills 机制与编写](/claude-code/skills/) → 建议 [编码向精选](/claude-code/skill-recommendations/) 与 [目录导读](/claude-code/skill-catalog/)。

---

## 六条可迁移模式

### 1. 技能链优于单块长提示

Superpowers 把「需求到合并」拆成 brainstorming → plan → execute → review → finish，每步独立 `description`。

**团队检查项：** 是否能把你们最长的粘贴提示拆成 2～4 个小技能，而不是一个 `/do-everything`？

### 2. `description` 写「时机」，不写口号

社区技能写清**做什么 + 用户什么措辞下启用**。

**团队检查项：** `description` 是否包含同事真实会说的话，例如「发 PR」「review diff」「上线 staging」？

### 3. 有副作用的流程默认仅手动

部署、合并主干等多用 `disable-model-invocation: true` 或步骤里要求人确认。

**团队检查项：** `/deploy`、生产迁移类是否禁止模型自动启动？

### 4. 长参考放附属文件

规则进 `reference.md` 或 `scripts/`，正文只写何时读取。

**团队检查项：** 单文件 `SKILL.md` 是否超过 200 行？若是，是否应拆分？

### 5. Plugin 分发成熟技能

内部流程稳定后打包组织 Plugin，与 Managed settings 一起治理。

**团队检查项：** 是否有版本号与谁可安装的记录？是否 review `allowed-tools`？

### 6. 用 Meta 技能统一质量

Superpowers 的 `writing-skills` 把「如何写技能」本身做成技能。

**团队检查项：** 是否指定一人维护「团队 Skill 风格」模板供他人复制？

---

## 练习

### 练习 1：从 writing-skills 到你们的一条流程

1. 打开 [superpowers/skills/writing-skills/SKILL.md](https://github.com/obra/superpowers/tree/main/skills/writing-skills)。  
2. 选出团队**最常粘贴**的一段提示（如 PR 描述、发布检查）。  
3. 在仓库创建 `.claude/skills/<name>/SKILL.md`，含 `description` 与 5～10 步正文。  
4. `/` 与一句自然语言各触发一次。

### 练习 2：改写 description

为「发 PR」技能写 `description`，只含同事真实说法，不用「专业」「高效」等空泛词。让队友念一句应能触发。

### 练习 3：部署类仅手动

复制 [Skills 任务型示例](/claude-code/skills/#两类内容参考型与任务型) 为模板，为 staging 部署加 `disable-model-invocation: true`，正文第一步写「向负责人确认环境」。

---

## Skill 与 Hook 分工

| 需求 | 首选 | 原因 |
|------|------|------|
| Edit 后必须跑 formatter | [Hook](/claude-code/hooks/) `PostToolUse` | 与模型记忆无关 |
| 禁止 `rm -rf` 某路径 | Hook `PreToolUse` exit 2 | 硬拦截 |
| PR 审查 checklist | Skill | 步骤多、需懒加载 |
| 探索陌生模块并写报告 | [SubAgent](/claude-code/subagents/) + Skill `context: fork` | 隔离上下文 |
| 每会话都知道的测试命令 | [CLAUDE.md](/claude-code/claude-md/) | 启动即加载 |

---

## 组织 Plugin 与治理

1. 在内部仓库 `skills/` 目录维护 `SKILL.md` 树。  
2. 按官方 [Plugins](https://code.claude.com/docs/en/plugins) 打包并发布到团队 marketplace。  
3. `plugin install` 写入项目或 Managed 推荐列表；新人 onboarding 文档只链 marketplace 名与版本。  
4. 与 [团队与组织级落地](/claude-code/team-organization/) 中的 PR review、Managed CLAUDE.md 对齐。

---

## 第六部分总结自检（对应学习目标）

- [ ] 能独立写一个含 `description` 的项目 Skill 并提交 PR  
- [ ] 能说明何时只借社区包中的一个技能、不装全包  
- [ ] 能根据上表在 Skill 与 Hook 之间做选择  
- [ ] 完成至少一个练习并记录触发话术  

---

## 继续读下一章之前

社区包是否应提交到你们生产仓库的 `.claude/skills/`？默认**否**：先个人或试点项目验证，再团队 Plugin 锁定版本。

---

上一章：[社区技能目录导读](/claude-code/skill-catalog/) · 下一章：[上下文管理与多代理架构](/claude-code/context-management/)
