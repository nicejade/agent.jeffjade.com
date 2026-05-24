---
title: CI/CD 与代码审查集成
description: 用 GitHub Actions、GitLab CI 与多代理 Code Review 把 Claude Code 纳入 PR 流程，并安全配置密钥与权限。
sidebar:
  order: 29
---

*「本地 `@claude` 能修 issue，但 GitLab 自建 runner 上怎么跑同一套审查？」*

流水线里的 Claude Code 通常走两条路：**GitHub/GitLab 官方集成**（评论触发、`claude-code-action`）或任意 CI 里的 **`claude -p`**（非交互）。二者都要最小权限 secrets、可 review 的 diff，以及入库的 [CLAUDE.md](/claude-code/claude-md/)。

机制基础见 [Agent SDK](/claude-code/agent-sdk/)（Action 基于 SDK）。组织层策略见 [生态深度集成](/claude-code/ecosystem-integration/)。

官方：[GitHub Actions](https://code.claude.com/docs/en/github-actions.md)、[GitLab CI/CD](https://code.claude.com/docs/en/gitlab-ci-cd.md)、[Code Review](https://code.claude.com/docs/en/code-review.md)、[Headless](https://code.claude.com/docs/en/headless.md)。

---

## GitHub Actions 集成

[Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions) 在 Issue/PR 评论中 `@claude` 即可触发，也可在 `pull_request` 等事件上自动跑审查。

### 能做什么

- PR/Issue 评论里实现功能、修 bug、回答问题
- 定时生成报告、同步文档
- workflow `prompt` 中调用仓库 [Skills](/claude-code/skills/)，例如 `/code-review:...`
- 与 [GitHub Code Review](https://code.claude.com/docs/en/code-review) 配合：多代理分析全库（产品与 Action 能力略有不同，以官方为准）

### 快速安装

在本地已安装 Claude Code 的仓库根：

```text
/install-github-app
```

向导配置 GitHub App 与 `ANTHROPIC_API_KEY`。需**仓库管理员**权限。仅直连 Anthropic API 时可用此快捷方式；Bedrock/Vertex 见官方 [Using with Bedrock & Vertex](https://code.claude.com/docs/en/github-actions#using-with-amazon-bedrock--google-vertex-ai)。

### 手动安装要点

1. 安装 [Claude GitHub App](https://github.com/apps/claude)，授予 Contents、Issues、Pull requests 读写
2. 仓库 Secrets 添加 `ANTHROPIC_API_KEY`
3. 复制 [examples/claude.yml](https://github.com/anthropics/claude-code-action/blob/main/examples/claude.yml) 到 `.github/workflows/`

使用 **`anthropics/claude-code-action@v1`**（非 `@beta`）。v1 用 `prompt` 替代 `direct_prompt`，CLI 参数放进 `claude_args`。

### 最小 workflow 示例

```yaml
name: Claude Code
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
jobs:
  claude:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

PR 打开时自动审查（无需评论）：

```yaml
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: "/code-review:code-review 审查本 PR 的安全与测试缺口"
          claude_args: |
            --max-turns 15
            --model claude-sonnet-4-6
```

评论示例：

```text
@claude 根据 issue 描述实现功能并补测试
@claude 修复 user dashboard 的 TypeError，跑 CI 中的测试命令
```

### 仓库侧配置

- **CLAUDE.md 入库**：Action 读取与本地一致的团队规范
- **Skills 入库**：`.claude/skills/`，workflow 须 `checkout` 后才能 `/skill-name`
- **密钥**：只用 `secrets.*`，禁止 workflow 明文 API Key
- **权限**：workflow `permissions` 最小化；App 仍需读写以推分支、开 PR

### 成本与性能

- GitHub Actions 分钟 + API Token
- 优化：评论指令要具体；`claude_args` 设 `--max-turns`；workflow 用 concurrency 限制并行

与 [完整实战工作流](/claude-code/complete-workflow/) 的分工：本地 `gh` 适合交互提交；Action 适合 PR 留痕、异步实现、定时任务。

---

## GitHub Code Review（产品能力）

[Code Review](https://code.claude.com/docs/en/code-review.md) 侧重对每个 PR 启动多代理分析，发现逻辑错误、安全与回归。可与上述 Action 组合，也可能以独立产品形态提供；部署前对照官方 Plan 与仓库设置。

---

## GitLab CI/CD

[Claude Code GitLab CI/CD](https://code.claude.com/docs/en/gitlab-ci-cd.md) 提供 GitLab 侧集成说明。自建 runner 上若无官方模板，可用 **`claude -p`** 加 CI 变量：

```yaml
claude-review:
  stage: test
  script:
    - npm install -g @anthropic-ai/claude-code
    - |
      claude -p "审查 $CI_MERGE_REQUEST_DIFF_BASE_SHA 到 HEAD 的 diff：列安全风险与测试缺口，输出 Markdown 列表" \
        --allowedTools "Read,Grep,Glob" \
        --max-turns 10
  variables:
    ANTHROPIC_API_KEY: $ANTHROPIC_API_KEY
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

发布前对照官方 GitLab 文档核对安装方式、镜像与权限。密钥只放在 GitLab CI/CD Variables， masked + protected。

---

## 非交互 `claude -p`（任意 CI）

不限 Git 托管方，任何能跑 shell 的环境：

```bash
git diff origin/main...HEAD | claude -p "列出安全风险，输出 JSON" --output-format json --allowedTools "Read,Grep"
```

| 场景 | 做法 |
|------|------|
| Pre-commit | 钩子中轻量 `claude -p`，注意延迟与成本 |
| Jenkins 等 | 同 `-p`，密钥进 CI 凭据库 |
| 批量迁移 | 循环调用，见 [Best practices · Fan out](https://code.claude.com/docs/en/best-practices#fan-out-across-files) |

**原则：** 流水线里不能指望人工点权限。必须写死验收、工具白名单与 turn 上限。

---

## 失败模式

| 症状 | 可能原因 | 下一步 |
|------|----------|--------|
| `@claude` 无响应 | App 未装、Secret 错 | Actions 日志与 App 权限 |
| Action 直接 push main | workflow 权限过大 | 限制为 PR 分支；人工合并 |
| CI 费用飙升 | 无 turn 上限、并发过多 | `claude_args`、`concurrency` |
| GitLab job 找不到 claude | 未安装 CLI | 官方 GitLab 页或全局安装步骤 |
| 审查与本地行为不一致 | 未入库 CLAUDE.md | 根目录补规范并 checkout |

---

## 决策边界

**适合 GitHub Action：** Issue/PR 驱动、团队已在 GitHub、要 `@claude` 协作留痕。

**适合 GitLab 官方集成：** 全栈在 GitLab，愿跟官方模板维护。

**适合裸 `claude -p`：** 自建 CI、只需 diff 审查、不需评论机器人。

**不适合：** secrets 写进 `CLAUDE.md`；无 review 自动合 main；与本地交互会话共用高权限 bypass。

---

## 继续读下一章之前

1. `/install-github-app` 与手动装 App 各解决什么？  
2. 为什么 CLAUDE.md 应与 workflow 一起入库？  
3. `claude -p` 在 GitLab 上至少要限制哪两类参数？

自检：

- [ ] 能说出 Action 与 `claude -p` 的选型差异  
- [ ] 看过官方 `claude.yml` 示例结构  
- [ ] 知道 secrets 不能进 workflow 明文  

---

上一章：[Agent SDK 程序化调用](/claude-code/agent-sdk/) · 下一章：[远程会话与 Channels](/claude-code/remote-sessions-channels/)
