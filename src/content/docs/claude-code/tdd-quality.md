---
title: 测试驱动协作与代码质量保障
description: 用 TDD 约束 Claude Code 先写失败测试再实现，以 Hooks 与 CI 为 AI 输出设质量门禁，并用 diff、覆盖率与安全扫描做合并前审查。
sidebar:
  order: 40
---

*「Agent 说测试全绿了。上线后才发现断言只检查了 mock 返回值，真实鉴权路径从未执行。」*

[完整实战工作流](/claude-code/complete-workflow/) 覆盖端到端顺序；本章回答：**生成代码之后，你如何证明可以上生产**。方法可验证：本地命令、CI 日志、diff 行数、扫描报告。

---

## 核心顺序：先验收，再实现

默认「先写代码再补测试」会把**弱验收**埋进上下文，Agent 会围绕已写实现编测试，容易 over-mock、漏边界。

|TDD 阶段|你的动作|Agent 动作|
|------|--------|----------|
| 红|明确行为与失败断言|只写/改测试，运行，**必须看到失败**|
| 绿|批准实现范围|最小实现使测试通过|
| 重构|要求不改行为|去重、命名，测试仍绿|

### 可复制的提示模板

**阶段 1 · 只写红测试：**

```text
为「批量禁用用户」写集成测试：覆盖权限不足、确认弹窗、审计日志字段。
只改 tests/ 下文件，不要改 src/。
运行 pnpm test --filter bulk-disable，把失败输出贴出来。在测试通过前不要写实现。
```

**阶段 2 · 最小实现：**

```text
现在实现 src/services/userBulk.ts 使刚才的测试通过。
禁止扩大范围到 middleware 以外；改完只跑同一 filter。
```

**阶段 3 · 审查：**

```text
新开只读审查：列出测试未覆盖的分支与 over-mock 风险。不要改文件。
```

与 [Plan Mode](/claude-code/plan-mode/) 配合：大功能在计划里写「测试文件列表 + 必须先红的用例名」。

---

## 把验证写进 CLAUDE.md 与 Hooks

### CLAUDE.md：命令与门禁

```markdown
## 验证（合并前必须）
- 单元: `pnpm test`
- 集成: `pnpm test:integration`
- Lint: `pnpm lint`
- 禁止：为通过测试删除断言或 skip 整个 describe
```

### Hooks：到点必跑

[Hooks](/claude-code/hooks/) 在 `PostToolUse` 对 `Edit`/`Write` 触发格式化或测试子集：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "pnpm exec prettier --write \"$CLAUDE_FILE_PATHS\""
          }
        ]
      }
    ]
  }
}
```

Stop 事件可跑完整 `pnpm test` 并在失败时 `exit 2` 阻止会话结束。注意：全量测试耗时大，可只对 `src/` 路径 matcher。

Hook 是**确定性**门禁；CLAUDE.md 是**软约束**。

---

## CI 与 AI 输出的质量门禁

| 层级 | 机制 | 抓什么 |
|------|------|--------|
| 本地 | pre-commit、Hook | 风格、快测 |
| PR | GitHub Actions | 全测、lint、类型检查 |
| PR | 覆盖率阈值 | 新代码无测试 |
| PR | 安全扫描 | SAST、依赖 audit、secret scan |

### Actions 示意（需按仓库调整）

```yaml
name: ci
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
      - run: pnpm lint
```

[生态集成](/claude-code/ecosystem-integration/) 中的 `@claude`、本地 `claude -p` 适合**起草** PR，**合并权**仍应留在 CI 绿 + 人审之后。

### 覆盖率：防「数字游戏」

要求 Agent 提交覆盖率报告路径，并人工看**关键路径**是否被 integration 覆盖，而不只看总百分比。提示示例：

```text
改 auth 模块后运行 pnpm test --coverage，列出 auth.ts 未覆盖行号，并补一个 integration case。
```

---

## 审查 AI 生成代码：diff 优先

### 1. 结构化 diff 审查

```text
/diff
```

或 `git diff --stat` + 分文件看。关注：

- 是否改了 CLAUDE.md 禁止的路径  
- 是否引入新依赖（`package.json` / lockfile）  
- 是否动 migration、CI、权限配置  

### 2. Writer / Reviewer 分离

实现会话与审查会话分开，见 [提示工程 · 双会话](/claude-code/prompt-engineering/#writer--reviewer-双会话)。审查提示只给 diff 与测试输出，不给「我花了很大力气实现」的叙事。

### 3. 安全扫描

| 工具类型 | 目的 |
|----------|------|
| `git secrets` / gitleaks | 密钥误提交 |
| `npm audit` / osv-scanner | 依赖 CVE |
| Semgrep / CodeQL | 常见漏洞模式 |

可让 Agent **只读**跑扫描并解释 findings，修复仍由你批准。

### 4. 行为 vs 语法

| 通过 | 不够 |
|------|------|
| `tsc --noEmit` | 业务规则是否正确 |
| 单元测试绿 | 集成路径是否走到 |
| lint 无 warning | 并发与权限边界 |

[局限性与应对](/claude-code/limitations/#幻觉与看起来对) 中的「测试绿但行为错」应用本章流程挡在 merge 前。

---

## 与 SubAgents 的分工

| 任务 | 建议 |
|------|------|
| 全库找测试范例 | 探索子代理 |
| 写红测试 + 实现 | 主会话，顺序严格 |
| 跑 10 分钟 E2E | 子代理，主会话只收 pass/fail |

避免主会话吞 E2E 全文日志，见 [上下文管理](/claude-code/context-management/)。

---

## 继续读下一章之前

试着回答：

1. 为什么先红测试能降低 over-mock？  
2. Hook 与 CLAUDE.md 在门禁上的差异？  
3. 「测试绿」仍应拒绝 merge 的两种情形？  
4. 审查会话为什么要与实现会话分离？

自检清单：

- [ ] 至少一次用「先测试后实现」走完小功能  
- [ ] PR 上 CI 在 Agent 改动后仍必须通过  
- [ ] 合并前看过 `/diff` 或 `git diff`  
- [ ] 知道团队用的 secret/依赖扫描命令  

---

下一章：[团队与组织级落地](/claude-code/team-organization/)——Managed CLAUDE.md 治理、PR 透明度与新成员 onboarding。
