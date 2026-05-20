---
title: 团队与组织级落地
description: 划分 Managed 与项目 CLAUDE.md 的治理职责，在 PR 流程中标注 AI 贡献并保证可追溯，让新成员通过 Claude Code 快速获得项目上下文。
sidebar:
  order: 22
---

*「每个人本地的 CLAUDE.md 都不一样，PR 里看不出哪段是人写的。新人问：该信仓库里的文档，还是老员工嘴里的习惯？」*

[生态集成](/claude-code-guide/ecosystem-integration/) 散布了协作片段；本章把**组织级共识**收成一套可维护结构。官方见 [Admin setup](https://code.claude.com/docs/en/admin-setup)、[Memory](https://code.claude.com/docs/en/memory)、[Managed settings](https://code.claude.com/docs/en/managed-settings)、[Settings](https://code.claude.com/docs/en/settings)。

---

## 规范写在哪里、谁维护

Claude Code 的记忆与配置分**多层作用域**，冲突时高层优先：

| 层级 | 典型位置 | 谁维护 | 进 Git |
|------|----------|--------|--------|
| Managed policy | macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`；Linux: `/etc/claude-code/CLAUDE.md`；Windows: `C:\Program Files\ClaudeCode\CLAUDE.md` | IT / 平台 | 否，下发 |
| Managed settings | 远程、plist、注册表、文件 | 安全 / 平台 | 否 |
| 项目 CLAUDE.md | 根或 `.claude/CLAUDE.md` | 工程团队 | 是 |
| `.claude/rules/` | 路径规则 | 各模块 owner | 是 |
| `.claude/settings.json` | allow/deny、Hooks | 工程 + 安全 review | 是 |
| 用户级 | `~/.claude/CLAUDE.md`、`settings.json` | 个人 | 否 |

`/status` 可查看 Setting sources 是否含 `Enterprise managed settings (remote)` 等，见 [Configuration](https://code.claude.com/docs/en/settings)。

### 治理分工建议

| 内容 | Managed | 项目仓库 |
|------|---------|----------|
| 禁止 bypass、禁 MCP 列表 | ✓ | 补充说明 |
| 合规（PII、日志保留） | ✓ | 业务示例 |
| 构建命令、目录结构 | 可选模板 | ✓ 权威 |
| 模块约定、测试命令 | | ✓ |
| 个人快捷键、主题 | | 用户级 |

**原则：** Managed 写**不可协商**的安全与合规；项目 CLAUDE.md 写**本仓库事实**；不要把团队全部细节塞进 Managed，否则更新慢、难 fork。

### 项目 CLAUDE.md 维护节奏

1. **Onboarding：** 新人第一周缺的纠正，优先入库。  
2. **PR review：** 「Agent 本该知道」的项，开 issue 更新 CLAUDE.md。  
3. **季度瘦身：** 删过时规则，迁到 `paths` 或 [Skills](/claude-code-guide/skills/)。  

Owner 可指定为**模块 maintainer 轮值**或**平台组**，关键是 PR 有明确 reviewer，而不是「人人改、无人删」。

---

## PR 流程：透明度与可追溯性

### 提交信息

约定在 commit body 标注辅助来源，例如：

```text
feat(auth): bulk disable users

Assisted-by: Claude Code (session abc, plan approved 2026-03-15)
Tests: pnpm test --filter bulk-disable
```

不强制固定措辞，但团队应一致，便于事后审计与培训。

### PR 描述模板

```markdown
## 变更摘要
（人写，3 行内）

## Agent 参与范围
- [ ] 仅人写
- [ ] Agent 起草，人审 diff
- [ ] Agent 跑通测试，人改架构

## 验证
- [ ] CI 绿
- [ ] 人看过 security-sensitive 文件列表

## 风险文件
（如 permissions、workflow、migration）
```

### Code Review 焦点

| 文件类型 | 审查强度 |
|----------|----------|
| `src/**` 业务 | 逻辑 + 测试 |
| `.claude/settings.json`、Hooks | 等同改 CI |
| `CLAUDE.md` | 是否准确、是否过长 |
| lockfile、Dockerfile | 供应链 |

对 Agent 生成的**大 diff**，要求拆 PR 或分 commit，避免「一次合并看不清」。

### GitHub Actions 与 @claude

Issue/PR 评论触发 Agent 时，仓库 policy 应写明：禁止自动合 main、secrets 最小权限。详见 [生态集成](/claude-code-guide/ecosystem-integration/)。

---

## 新成员 Onboarding

目标：第一天就能用 Claude Code **按团队方式**工作，而不是重新踩全团队踩过的坑。

### Day 0 清单（仓库内文档可链到本章）

```markdown
## Claude Code 入职
1. 安装：见 docs/claude-code-guide/installation-setup
2. 根目录 `claude`，运行 `/doctor`
3. 阅读 CLAUDE.md 与 .claude/rules/
4. 运行 `/permissions` 确认无意外 bypass
5. 用小任务练手：只读探索 issue #123 相关文件，再 /plan
```

### 让 Agent「懂」项目

| 手段 | 作用 |
|------|------|
| `/init` + 人审 | 生成 starter CLAUDE.md |
| 链到架构 doc | `@docs/architecture.md` |
| 模块 `paths` 规则 | 进目录即加载约定 |
| 示例 PR | 「本团队合格 PR」链接 |

提示新人：

```text
先只读：用 Glob 列出 src/ 结构，Read CLAUDE.md，总结三个核心模块与测试命令。不要 Edit。
```

### 结对与模板

- 第一周：老员工程序 review **提示词**与 **CLAUDE.md 补丁**，不只 review 代码。  
- 共享 `.claude/commands/` 斜杠命令：如 `/onboard-ticket`、`/ship-checklist`。  

---

## 组织度量（可选）

平台组可跟踪：

| 指标 | 来源 |
|------|------|
| 活跃开发者 | 登录 / 分析后台 |
| 策略生效 | `/status` 抽样 |
| 成本 | Console、云账单；开发者教育用 `/usage` |
| 事件 | 误合并、secret 泄露、CI 红灯 |

指标用于改进文档与 deny 规则，而非惩罚个人使用。

---

## 继续读下一章之前

试着回答：

1. Managed CLAUDE.md 与项目 CLAUDE.md 各应写什么？  
2. 为什么改 `.claude/settings.json` 要高强度 review？  
3. PR 里如何标注 Agent 参与才利于追溯？  
4. 新人第一天应跑哪三条命令？

自检清单：

- [ ] 仓库有团队可读的 CLAUDE.md 或 `.claude/settings.json`  
- [ ] 知道 managed 策略是否在本机生效（`/status`）  
- [ ] PR 模板或约定含验证与 Agent 范围  
- [ ] 指定过 CLAUDE.md 或 rules 的维护责任人  

---

下一章：[从工具使用到心智模型迁移](/claude-code-guide/mental-model-migration/)——意图式提问、自主与干预的平衡，以及哪些思考不应外包给 AI。
