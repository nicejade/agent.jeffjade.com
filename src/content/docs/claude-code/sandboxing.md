---
title: 沙箱隔离机制
description: 理解沙箱 Bash 的文件系统与网络隔离，选对内置沙箱、dev container 或 VM 并做可验证实验。
sidebar:
  order: 37
---

*「开了 allow 列表，Agent 仍可能用 curl 出站——沙箱和 deny 到底差在哪？」*

[权限规则](/claude-code/security-permissions/) 决定**模型能否调用**某工具；**沙箱**在操作系统层限制 Bash **进程**能访问的路径与网络，即使用脚本绕过 Read 也可能写不进系统目录。官方：[Sandboxing](https://code.claude.com/docs/en/sandboxing)、[Sandbox environments](https://code.claude.com/docs/en/sandbox-environments)。

---

## 三层防线如何叠加

| 层 | 机制 | 挡什么 |
|----|------|--------|
| permission modes | default / plan / bypass | 是否弹窗批准 |
| allow / deny | 工具参数模式 | 是否允许 `Edit(.env*)` |
| **沙箱** | OS 隔离 | 进程能否 touch `/etc`、能否任意出站 |

`deny WebFetch` **不能**代替网络沙箱：若允许 Bash，`curl` 仍可能出站。高敏感环境应开沙箱网络域白名单。

---

## 启用沙箱 Bash

- 交互：输入 `/sandbox` 切换沙箱模式（见 [Commands](https://code.claude.com/docs/en/commands)）。
- 配置：`.claude/settings.json` 或 managed settings 中沙箱相关项，以 [Sandboxing](https://code.claude.com/docs/en/sandboxing) 为准。
- 与 [代理循环](/claude-code/agent-loop/) 中 Bash 工具的关系：沙箱包裹的是 **Bash 执行环境**，不是 Read/Grep 本身。

---

## 环境选型

| 环境 | 隔离强度 | 适用 |
|------|----------|------|
| 内置沙箱 Bash | 中 | 日常降低误删、限出站 |
| [Dev container](https://code.claude.com/docs/en/devcontainer) | 高 | 团队一致、不可信仓库 |
| Docker / VM | 高 | CI、生产旁路 |
| 裸机 + bypass | 低 | **仅**实验，不推荐 |

详见 [Sandbox environments](https://code.claude.com/docs/en/sandbox-environments) 对照表。

---

## 可验证实验

在**非生产**仓库开启沙箱后，让 Claude 执行：

```bash
# 预期：被拒绝或无法写入沙箱外路径（以你环境输出为准）
touch /etc/claude-sandbox-test 2>&1 || true
curl -sI https://example.com 2>&1 | head -3
```

观察 Bash 输出与权限提示。若仍能写入系统路径，说明沙箱未生效或规则过宽，查 `/status` 与官方配置。

---

## 与 security 章分工

- [安全边界](/claude-code/security-permissions/)：权限心智、bypass、deny 设计、人类必审操作。
- **本章**：OS 层隔离、网络域、容器选型。

企业策略在 managed settings 强制沙箱时，开发者用 `/status` 确认 `Enterprise managed settings` 已加载。

---

## 失败模式

| 现象 | 可能原因 | 下一步 |
|------|----------|--------|
| 沙箱内测试不过 | 路径映射与宿主机不同 | 在 CLAUDE.md 写容器内命令 |
| 仍能 curl | 网络未限制 | 配网络域白名单 |
| 性能慢 | 容器层开销 | 仅敏感任务开沙箱 |
| 误以为只读安全 | 沙箱内仍可删项目文件 | 配 deny + Git |

---

## 决策边界

**开沙箱：** 不可信输入、多开发者共用机、要限出站。

**只配 deny：** 信任环境、主要防误操作。

**dev container：** 团队要一致 Node/Java 版本且要强隔离。

---

## 继续读下一章之前

1. 沙箱与 `deny WebFetch` 差在哪？  
2. 为何 bypass 在宿主机仍危险？  
3. 你仓库适合内置沙箱还是 devcontainer？

自检：

- [ ] 试过 `/sandbox` 或 settings 开启  
- [ ] 跑过一节可验证实验  
- [ ] 知道去哪查网络域配置  

---

上一章：[Token 成本与会话经济学](/claude-code/token-economics/) · 下一章：[安全边界与权限心智](/claude-code/security-permissions/)
