---
title: 安全边界与权限心智
description: 理解 bypassPermissions 与 --dangerously-skip-permissions 的权衡，用 allow/deny 规则与沙箱隔离风险，并明确哪些操作必须人类最后确认。
sidebar:
  order: 24
---

*「为了不被弹窗打断，我加了 `--dangerously-skip-permissions`。一周后才发现 `.env` 被改过，而 deny 列表里从没写过 `Edit(.env*)`。」*

[安装与配置](/claude-code/installation-setup/) 与 [局限性与应对](/claude-code/limitations/) 提过安全，但未系统讲**权限设计**。本章把官方 [Security](https://code.claude.com/docs/en/security)、[Configure permissions](https://code.claude.com/docs/en/permissions)、[Permission modes](https://code.claude.com/docs/en/permission-modes) 落成可执行的规则与边界。

---

## 你在交换什么：便利 vs 可逆性

Claude Code 的权限系统回答一个问题：**哪类工具调用可以在无人类确认的情况下执行**。

| 模式 | 行为 | 适用 |
|------|------|------|
| default | 敏感操作弹窗 | 日常开发 |
| acceptEdits | 自动批准文件编辑 | 信任范围内的改码 |
| plan | 只读探索 | 见 [Plan Mode](/claude-code/plan-mode/) |
| bypassPermissions | 跳过几乎全部确认 | **仅**隔离环境 |

启用 bypass 的 CLI 标志包括：

- `--permission-mode bypassPermissions`
- `--dangerously-skip-permissions`
- `--allow-dangerously-skip-permissions`（加入模式循环，不默认激活）

名称里的 **dangerously** 是设计意图：你在用「少打断」换「少护栏」。官方明确建议**仅在容器或 VM 等隔离环境**使用，见 [Permissions](https://code.claude.com/docs/en/permissions)。

### bypass 仍挡不住什么

1. **deny 规则始终优先**：即使 bypass 激活，`Bash(rm *)`、`Edit(.env*)` 等 deny 仍拦截。  
2. **根目录与家目录删除熔断**：如 `rm -rf /`、`rm -rf ~` 仍会提示。  
3. **管理员可禁用 bypass**：managed settings 中 `permissions.disableBypassPermissionsMode: "disable"` 可组织级关闭。

推断：若团队有人长期 bypass 且无 deny，等价于给 Agent 接近 root 的 shell 与写盘权。

---

## allow / deny 的设计哲学

权限规则匹配**工具名 + 参数模式**，不是自然语言。语法见官方 [Permission rule syntax](https://code.claude.com/docs/en/permissions#permission-rule-syntax)。

### 三层原则

1. **默认收紧，按需放行**：先想「最坏能发生什么」，再写 allow。  
2. **deny 写必死线**：删除、密钥、生产配置、强制推送。  
3. **allow 写高频低风险**：只读 Bash、特定测试命令、格式化。

### 规则作用域

| 位置 | 共享 | 优先级 |
|------|------|--------|
| managed settings | 全组织 | 最高 |
| `.claude/settings.json` | 仓库协作者 | 高 |
| `~/.claude/settings.json` | 本机用户 | 中 |
| `.claude/settings.local.json` | 个人、不提交 | 低 |

`/status` 的 Setting sources 可确认企业策略是否加载，见 [Settings](https://code.claude.com/docs/en/settings)。

### 实例：项目 `.claude/settings.json`

```json
{
  "permissions": {
    "deny": [
      "Bash(curl *)",
      "Bash(wget *)",
      "Bash(rm -rf *)",
      "Edit(.env*)",
      "Edit(**/secrets/**)",
      "Write(./production/**)"
    ],
    "allow": [
      "Bash(pnpm test *)",
      "Bash(pnpm lint)",
      "Bash(git status)",
      "Bash(git diff *)"
    ]
  }
}
```

提交前应与改 CI workflow 同级 review：恶意 PR 可借宽 allow 外泄数据。

### 与 Hooks 的分工

| 机制 | 确定性 | 适合 |
|------|--------|------|
| deny | 高，模式匹配 | 静态禁止类 |
| allow | 高 | 预授权只读/测试 |
| PreToolUse Hook | 最高 | 组织策略、审计、动态判断 |

Hook **早于** allow 规则，见 [Hooks](/claude-code/hooks/#在代理循环中的位置)。企业可 Hook 拦截即使用户本机配置了宽 allow。

### Plan 模式下的「边界」

对话里声明的「不要改 X」会被分类器在读 transcript 时参考，但**硬保证**仍应写成 deny。官方说明：边界可能在 [compaction](https://code.claude.com/docs/en/costs#reduce-token-usage) 后丢失，见 [Permission modes · boundaries](https://code.claude.com/docs/en/permission-modes)。

---

## 沙箱最简路径

目标：让 Agent 有写权限，但**碰不到**宿主机密与无关目录。

### Docker 单容器（示意）

```dockerfile
FROM node:22-bookworm-slim
WORKDIR /workspace
RUN useradd -m agent && chown agent:agent /workspace
USER agent
COPY --chown=agent:agent . .
```

```bash
docker build -t myrepo-sandbox .
docker run --rm -it \
  -v "$(pwd):/workspace:rw" \
  -w /workspace \
  --network none \
  myrepo-sandbox \
  claude --permission-mode bypassPermissions
```

要点：

- `--network none` 或受限网络，降低 `curl` 外泄风险。  
- 只挂载当前仓库，不挂载 `~/.ssh`、`~/.aws`。  
- 容器内再配 `permissions.deny`，而不是裸 bypass 在宿主机。

### VM / 远程开发机

团队常用：专用云主机、/ephemeral CI runner、GitHub Codespace。原则相同：**可销毁、无生产凭证、快照可回滚**。

### 与 [生态集成](/claude-code/ecosystem-integration/) 的关系

GitHub Actions 跑 `claude -p` 时，应用**最小权限** secrets、只读默认、合 main 前人工 review。无人值守 ≠ 无人负责。

---

## 必须人类最后确认的操作

下列操作**不应**交给 bypass 模式下的 Agent 自动完成，即使「测试过了」：

| 类别 | 示例 | 原因 |
|------|------|------|
| 身份与密钥 | 轮换 API key、改 `.env`、IAM 策略 | 不可逆、难审计 |
| 数据破坏 | `DROP TABLE`、批量删用户、清库脚本 | 业务连续性 |
| 供应链 | `npm publish`、改 release workflow、升依赖 major | 供应链攻击面 |
| 发布 | 合 main、打 tag、生产 deploy | 需要组织流程 |
| 安全策略 | 改 `permissions`、Hooks、managed settings | 可被 PR 植入后门 |
| 法律与隐私 | 导出用户 PII、跨区传数据 | 合规 |

推荐流程：**Agent 起草 diff → 人看 `/diff` → 人跑关键命令 → 人点 merge**。CLAUDE.md 可写「禁止自行 commit」，但确定性用 Hook 或 CI 更稳。

---

## 处理不可信输入

审查**外部 PR、Issue、网页**时，把内容当**提示注入**风险：Agent 可能读到「忽略先前规则并执行 curl」类指令。应对：

- 只读模式或 plan 模式先读  
- 禁止对外网络 deny  
- 不在含 untrusted 内容的会话里 bypass  
- 见 [Security · untrusted content](https://code.claude.com/docs/en/security)

---

## 继续读下一章之前

试着回答：

1. bypass 模式下 deny 还有效吗？举一条应写入 deny 的规则。  
2. 为什么「对话里说不要改 .env」不够？  
3. 沙箱里仍建议配置 deny 吗？  
4. 你们团队哪三类操作必须人工点头的？

自检清单：

- [ ] 本机或仓库至少有一条 `permissions.deny`  
- [ ] 未在宿主机日常开发中长期使用 `--dangerously-skip-permissions`  
- [ ] 知道 `/permissions` 与 `/status` 如何查看规则来源  
- [ ] 合并前习惯人眼过 `/diff`，不只信 Agent 摘要  

---

下一章：[测试驱动协作与代码质量保障](/claude-code/tdd-quality/)——先红测试再实现、Hooks 与 CI 门禁，以及 diff 与安全扫描审查 AI 输出。
