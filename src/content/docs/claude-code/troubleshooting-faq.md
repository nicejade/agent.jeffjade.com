---
title: Claude Code 常见问题排查
description: 覆盖安装报错、登录循环、API 速率限制、性能卡顿、文件搜索异常、配置失效与 IDE 集成故障，按症状分类快速定位并恢复。
sidebar:
  order: 32
---

*「claude 命令敲下去，终端只回了一行 command not found。你检查了 Node.js 版本，重装了 npm 包，问题依旧。Google 搜出来的第一条是去年九月的 Reddit 帖子，三楼的回答已经不适用了。」*

本章不是教程，是排障速查。按症状定位，每节给出最小恢复路径。遇到问题时，第一步永远是 `/doctor`。

官方参考：[Troubleshooting](https://code.claude.com/docs/en/troubleshooting)、[Error reference](https://code.claude.com/docs/en/errors)、[Troubleshoot installation and login](https://code.claude.com/docs/en/troubleshoot-install)、[Debug your configuration](https://code.claude.com/docs/en/debug-your-config)。

---

## 第一步：/doctor

在 Claude Code 内运行 `/doctor`，它会自动检查：

- 安装状态与版本
- 配置文件有效性
- MCP 服务器连接
- 上下文使用情况
- 内存文件与子代理定义大小

如果 `claude` 命令根本启动不了，在终端直接运行 `claude doctor`。

`/doctor` 能发现的问题比你手动排查快得多。养成习惯：出问题时先跑 `/doctor`，再按下面分类深入。

---

## 安装与登录问题

### command not found 或 PATH 错误

**症状**：终端运行 `claude` 提示 `command not found`，或在 Windows 上无响应。

**常见原因与恢复**：

| 原因 | 检查方法 | 恢复 |
|------|----------|------|
| npm 全局安装路径不在 PATH | `npm list -g --depth=0` 确认已安装，再 `echo $PATH` 检查 | 将 npm 全局 bin 目录加入 PATH |
| 使用了 `sudo npm install -g` | `ls -la $(which claude)` 看权限归属 | **不要**用 sudo 安装 npm 包。卸载后按官方指南重装 |
| Windows 上未安装 Git for Windows | 在 PowerShell 运行 `git --version` | 安装 [Git for Windows](https://git-scm.com/downloads/win)，Claude Code 需要其提供的 Unix 工具 |
| macOS 上未安装 Xcode Command Line Tools | `xcode-select -p` | `xcode-select --install` |

**权限错误（EACCES）**：如果安装或运行时遇到 EACCES，说明 npm 全局目录权限不正确。参考 [npm 官方权限修复指南](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)，不要用 `sudo` 绕过。

### 登录循环或 OAuth 错误

**症状**：运行 `/login` 后浏览器打开、授权成功，但终端仍提示未登录，或反复要求重新登录。

**按顺序排查**：

1. **系统时间不同步**：OAuth token 有有效期，系统时钟偏差过大会导致 token 立即被判过期。macOS 检查「系统设置 → 通用 → 日期与时间 → 自动设置」；Linux 检查 `timedatectl status`。
2. **macOS Keychain 问题**：token 存储在系统钥匙串中。运行 `security find-generic-password -s "Claude Code"` 确认条目存在，若损坏则删除后 `/logout` 再 `/login`。
3. **环境变量覆盖**：`ANTHROPIC_API_KEY` 环境变量优先级高于 `/login`。运行 `env | grep ANTHROPIC` 确认没有遗留的旧 key。IDE 终端可能从 `.env` 文件注入变量。
4. **组织策略**：如果看到 `This organization has been disabled` 或 `Your organization has disabled Claude subscription access`，联系管理员或改用 API Key 认证。
5. **API Key 无效**：如果使用 API Key 认证，运行 `claude config set apiKey sk-ant-...` 重新配置。在 [console.anthropic.com](https://console.anthropic.com) 确认 key 未被撤销。

### 网络连接失败

**症状**：TLS 错误、`Unable to connect to API`、`fetch failed`。

**按顺序排查**：

1. 在**同一终端**运行 `curl -I https://api.anthropic.com`，确认能连通（Windows PowerShell 用 `curl.exe -I` 以免调错内置 alias）。
2. 检查防火墙是否放行 `api.anthropic.com`。
3. 公司代理环境需设置 `HTTPS_PROXY` 环境变量。
4. 企业 CA 证书需设置 `NODE_EXTRA_CA_CERTS=/path/to/ca-bundle.pem`。**不要**用 `NODE_TLS_REJECT_UNAUTHORIZED=0`，这等于关闭所有 TLS 验证。
5. VPN 软件卸载后可能残留虚拟网卡或路由规则，macOS 可用 `ifconfig` 检查残留的 `utun` 接口。
6. Docker Desktop 等容器运行时可能拦截出站流量，退出后重试以排除。

---

## API 与速率限制

### 错误码速查

Claude Code 会自动重试临时性故障（最多 10 次，指数退避），你看到以下错误时说明重试已耗尽：

| 错误 | 含义 | 恢复 |
|------|------|------|
| `API Error: 500 Internal server error` | API 内部故障，与你的请求无关 | 查 [status.claude.com](https://status.claude.com)，等一分钟重试 |
| `API Error: Repeated 529 Overloaded errors` | API 全局过载，不计入你的配额 | 查状态页，用 `/model` 切到其他模型继续工作 |
| `Request timed out` | 请求超时（默认 10 分钟） | 重试；若频繁发生，检查网络，或设 `API_TIMEOUT_MS` 提高超时 |
| `Invalid API key` | API Key 错误或被撤销 | `env \| grep ANTHROPIC` 检查；在 Console 确认 key 状态 |
| `Rate limit exceeded` / `429` | 账号或 API Key 的速率配额耗尽 | 等待提示中的重置时间；用 `/usage` 查看剩余配额；降低并发 |
| `Credit balance is too low` | Console 组织预付费余额不足 | [platform.claude.com/settings/billing](https://platform.claude.com/settings/billing) 充值 |
| `Prompt is too long` | 对话加附件超出上下文窗口 | `/compact` 或 `/clear`；用 `/context` 查看占用分布 |
| `You've hit your session limit` | 订阅计划用量配额耗尽 | 等重置时间；或用 `/usage-credits` 购买额外用量 |
| `There's an issue with the selected model` | 模型名无效或无权访问 | `/model` 重新选择；用别名如 `sonnet`、`opus` 代替完整版本号 |

### 减少 token 消耗的即时措施

- `/compact`：压缩对话历史，保留关键上下文
- `/context`：查看上下文窗口占用分布，定位哪个 MCP 服务器或记忆文件最占空间
- 用 `/mcp disable <name>` 关闭不用的 MCP 服务器，其工具定义也占 token
- 将大文件读取指定行号范围，而非整文件载入
- 频率最高的 API 错里，约一半可以通过 `/compact` 避免

---

## 性能与稳定性

### 高 CPU 或内存占用

Claude Code 处理大型代码库时可能消耗较多资源。**这不是内存泄漏**——通常是上下文窗口内累积了过多文件内容和工具输出。

**恢复步骤**：

1. 定期 `/compact`，尤其在长任务的阶段性节点
2. 在重大任务之间关闭并重启 Claude Code
3. 将大型构建目录（`node_modules/`、`dist/`、`.next/`）加入 `.gitignore`，避免被文件搜索扫入上下文

如果上述措施后内存仍高，运行 `/heapdump` 生成堆快照到桌面。在 Chrome DevTools 的 Memory 面板加载 `.heapsnapshot` 文件可查看对象引用链。将快照附在 [GitHub issue](https://github.com/anthropics/claude-code/issues) 中报告。

### 自动压缩卡死（thrashing）

**症状**：出现 `Autocompact is thrashing: the context refilled to the limit...`。

这意味着压缩成功了，但某个文件或工具输出立即又填满了上下文窗口。Claude Code 停止重试以避免浪费 API 调用。

**恢复**：

1. 让 Claude **分段读取**大文件（指定行号范围或函数名），而非整文件
2. `/compact` 时加聚焦说明：`/compact keep only the plan and the diff`
3. 将大文件操作移到**子代理**中，它在独立上下文窗口运行
4. 不再需要前面对话时，用 `/clear` 清空

### 命令卡住或无响应

1. 按 `Ctrl+C` 尝试取消当前操作
2. 仍无响应则关闭终端
3. 在同一目录运行 `claude --resume` 恢复会话——**重启不丢对话**

### 预防性习惯

- 长任务每隔约 15 分钟跑一次 `/context`，关注占用跳变
- 在 statusline 中显示 `context_window.used_percentage`，见 [statusline 配置](https://code.claude.com/docs/en/statusline)
- 每次会话只聚焦一个任务域，完成后 `/clear` 再切题

---

## 搜索与文件发现问题

### @file 提及或 Agent 找不到文件

**原因**：内置 `ripgrep` 二进制无法在你的系统上运行。

**恢复**：安装系统级 `ripgrep`，然后设置环境变量。

macOS：
```bash
brew install ripgrep
```

Ubuntu/Debian：
```bash
sudo apt install ripgrep
```

Windows：
```powershell
winget install BurntSushi.ripgrep.MSVC
```

安装后，在启动 Claude Code 前设置：
```bash
export USE_BUILTIN_RIPGREP=0
```

### WSL 上搜索结果不完整

在 WSL 上跨文件系统工作时（项目在 `/mnt/c/` 而非 `/home/`），磁盘读取性能受限，搜索结果会少于预期。注意 `/doctor` 在此情况下仍显示 Search 正常。

**恢复**（按效果排序）：

1. **更精确地搜索**：限定目录或文件类型，例如「在 `auth-service` 包中搜索 JWT 验证逻辑」，而非全库扫
2. **将项目移到 Linux 文件系统**：放在 `/home/` 而非 `/mnt/c/`
3. **直接用原生 Windows 版 Claude Code**：绕过 WSL 的文件系统性能损耗

---

## 配置问题

### 设置未生效 / Hooks 未触发 / MCP 服务器未加载

这类问题通常是配置文件层级覆盖或格式错误导致。

**恢复步骤**：

1. 运行 `/doctor`，它会检查配置文件有效性和 MCP 连接状态
2. 运行 `/status`，确认当前生效的模型、账号、设置来源
3. 检查配置优先级：`.claude/settings.local.json` > `.claude/settings.json` > `~/.claude/settings.json`。局部文件会覆盖全局配置
4. 检查 JSON 语法：`python -m json.tool .claude/settings.json` 或 `cat .claude/settings.json | jq .`
5. Hook 不触发时检查脚本是否可执行（`chmod +x`）且路径正确。调试 Hook 见 [Hooks 机制](/claude-code/hooks/)
6. 确认 `ANTHROPIC_API_KEY` 等环境变量没有被 IDE 终端的 `.env` 文件覆盖——`/status` 会显示当前生效的认证源

如果完全不确定问题在哪，`claude --debug` 启动可以看到完整的配置加载日志。

### 模型不匹配

如果觉得回答质量下降但没有报错，先检查：

1. `/model`：确认当前模型是你以为的那个。先前可能无意中切到了小模型
2. `/effort`：检查推理强度，默认值因模型而异
3. `/context`：窗口是否接近满载，接近满载时会丢失早期约束
4. `/doctor`：检查是否有过大的记忆文件在吃掉上下文

回答质量出问题时，`/rewind` 回退到出错前重来，通常比在当前线程里纠正更有效——错误的尝试留在历史里会锚定后续回答。

---

## IDE 集成问题

Claude Code 的 CLI、桌面应用和 Web 版共享同一内核，所以运行时错误的表现一致。IDE 集成特有问题的排查入口：

| IDE | 排查入口 |
|-----|----------|
| VS Code 扩展无法连接或检测不到 Claude | [VS Code 集成 · 常见问题](https://code.claude.com/docs/en/vs-code#fix-common-issues) |
| JetBrains 插件或 IDE 未被检测 | [JetBrains 集成 · 排查](https://code.claude.com/docs/en/jetbrains#troubleshooting) |

通用步骤：

1. 确认网络连接正常
2. 尝试在 IDE 中开启新对话
3. 直接在终端运行 `claude`，比较终端与 IDE 内行为的差异——终端通常能给出更详细的错误信息
4. 在 IDE 终端中运行 `env | grep ANTHROPIC`，确认没有 IDE 注入的旧环境变量

---

## 快速自查表

| 症状 | 第一步 | 深入方向 |
|------|--------|----------|
| 命令找不到 / 安装报错 | 确认安装方式（不要用 sudo） | [Troubleshoot install](https://code.claude.com/docs/en/troubleshoot-install) |
| 登录循环 / 403 | 检查系统时间、Keychain、环境变量 | 本章「安装与登录」节 |
| API 5xx / 529 / 429 | 查 [status.claude.com](https://status.claude.com) | [Error reference](https://code.claude.com/docs/en/errors) |
| 设置 / Hook / MCP 不生效 | `/doctor` + `/status` | [Debug configuration](https://code.claude.com/docs/en/debug-your-config) |
| 高 CPU / 内存 / thrashing | `/compact` → `/context` → 子代理隔离 | 本章「性能与稳定性」节 |
| 文件找不到 / 搜索异常 | 安装系统 ripgrep + `USE_BUILTIN_RIPGREP=0` | 本章「搜索与文件发现」节 |
| 回答质量下降 | `/model` → `/effort` → `/context` → `/rewind` | [Error reference · 回答质量](https://code.claude.com/docs/en/errors#responses-seem-lower-quality-than-usual) |
| 不知道从哪查起 | `/doctor` | 然后回到本表 |

---

## 与相关章节的分工

| 场景 | 本章定位 | 相关章节 |
|------|----------|----------|
| 技术故障（安装、网络、API 报错、配置） | **本章**：按症状定位 + 最小恢复 | — |
| Agent 行为故障（循环打转、幻觉、上下文失真） | 本章不覆盖 | [调试与错误恢复](/claude-code/debug-error-recovery/) |
| 会话级恢复策略（/rewind、/clear、/compact） | 本章仅提及命令 | [调试与错误恢复](/claude-code/debug-error-recovery/) 详细决策树 |
| Token 消耗与成本控制 | 本章仅提及 `/compact` 和 `/context` | [Token 成本与会话经济学](/claude-code/token-economics/) |
| 安全策略与权限配置 | 本章不覆盖 | [安全边界与权限心智](/claude-code/security-permissions/) |

---

## 继续读下一章之前

试着回答：

1. 遇到任何问题时，第一步应该运行什么命令？什么情况下这个命令用不了？
2. 「再装一遍」和「用 `/doctor` 检查」分别在什么场景下是正确选择？
3. `/compact` 与 thrashing 的关系是什么——压缩成功了为什么还会 thrashing？
4. 系统 `ripgrep` 与内置 `ripgrep` 的区别在什么条件下才会表现为「找不到文件」？

自检清单：

- [ ] 用过 `/doctor`，知道它检查哪些维度
- [ ] 能从 API 报错信息中区分是配额问题、认证问题还是服务端故障
- [ ] thrashing 时知道先做分段读取还是先 `/compact`
- [ ] 配置不生效时先查 `/status` 确认当前生效的设置来源

---

回到 [Claude Code 漫游指南](/claude-code/) 按需查阅其他章节。也可从 [调试与错误恢复](/claude-code/debug-error-recovery/) 了解 Agent 行为层面的故障识别与恢复。
