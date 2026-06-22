---
title: CLI 与配置查阅
description: 速查常用 CLI 标志、settings.json 顶层键与环境变量，发布前对照官方完整参考。
sidebar:
  order: 43
---

*「文档里散落的 `--allowedTools` 和 `ANTHROPIC_DEFAULT_SONNET_MODEL` 想在一页里对上号。」*

> **查阅章，非跟读主线。** 下表只列本系列常引用项，**不全量同步官方**。发布前对照 [CLI reference](https://code.claude.com/docs/en/cli-reference)、[Settings](https://code.claude.com/docs/en/settings)、[Environment variables](https://code.claude.com/docs/en/env-vars)。

配置优先级（高到低）：managed settings → 项目 `.claude/settings.json` → 用户 `~/.claude/settings.json` → 环境变量。见 `/status` 的 Setting sources。

---

## 常用 CLI 标志

| 标志 | 作用 |
|------|------|
| `-p` / `--print` | 非交互，执行 prompt 后退出 |
| `--output-format json` | 机器可读输出 |
| `--allowedTools` | 限制无人值守可用工具 |
| `--disallowedTools` | 额外禁止 |
| `--permission-mode` | 如 `plan`、`bypassPermissions` |
| `--dangerously-skip-permissions` | bypass，见 [安全章](/claude-code/security-permissions/) |
| `--max-turns` | 限制代理轮次 |
| `--model` | 指定模型 |
| `--continue` / `-c` | 继续最近会话 |
| `--resume` | 恢复指定会话 |
| `--remote` / `--teleport` | 与 Web 互迁，见 [远程会话](/claude-code/remote-sessions-channels/) |
| `--worktree` | 隔离 worktree 会话 |

完整列表见 [CLI reference](https://code.claude.com/docs/en/cli-reference)。

---

## `settings.json` 常用顶层键

| 键 | 作用 |
|----|------|
| `permissions.allow` / `permissions.deny` | 工具规则 |
| `permissions.disableBypassPermissionsMode` | 组织禁用 bypass |
| `hooks` | 生命周期脚本 |
| `env` | 注入环境变量 |
| `model` | 默认模型 |
| `autoUpdates` / 更新通道 | 版本更新策略 |
| `sandbox` | 沙箱相关，见 [沙箱章](/claude-code/sandboxing/) |

Managed 与项目、用户文件合并规则见 [Settings](https://code.claude.com/docs/en/settings#settings-files)。

---

## 常用环境变量

| 变量 | 作用 |
|------|------|
| `ANTHROPIC_API_KEY` | API 密钥 |
| `ANTHROPIC_BASE_URL` | 自定义网关，见 [第三方 API](/claude-code/third-party-api/) |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | `opus` / `opusplan` 解析 |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | `sonnet` / `opusplan` 解析 |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | `haiku` 解析 |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | 减少非必要出站 |
| `DISABLE_AUTOUPDATER` / `DISABLE_UPDATES` | 更新控制，见 [安装章](/claude-code/installation-setup/) |

更多 `CLAUDE_CODE_*` 见 [env-vars](https://code.claude.com/docs/en/env-vars)。

---

## 维护约定

1. 本表更新频率低于官方；发版前 spot-check 三条你正在用的 flag。
2. 团队共享配置只提交 `.claude/settings.json`，密钥用 env，不进 Git。
3. 争议默认值以 `/status` 与官方 changelog 为准。

---

上一章：[心智模型迁移](/claude-code/mental-model-migration/) · 下一章：[常见问题排查](/claude-code/troubleshooting-faq/)
