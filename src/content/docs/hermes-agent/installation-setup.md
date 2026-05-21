---
title: 安装与环境准备
description: 在 Linux、macOS、WSL、Termux 或 Windows 上安装 Hermes Agent，用 hermes doctor 自检，并处理常见安装故障。
sidebar:
  order: 2
---

*「文档写 curl 一行装好，终端却报 command not found。问题多半不在 Hermes，而在 PATH 或 Shell 未 reload。」*

本章目标很具体：在你的机器上得到可执行的 `hermes` 命令，并用 `hermes doctor` 确认依赖与配置没有阻塞项。**先不要**急着配置 Telegram 或大量 Skill；官方 [Quickstart](https://hermes-agent.nousresearch.com/docs/getting-started/quickstart) 也建议：**先完成一轮正常对话，再叠 Gateway 等能力**。

## 安装前：你需要准备什么

| 维度 | 要求 |
| --- | --- |
| **Python** | 3.11+。git 安装器会通过 `uv` 自动准备；pip 安装需本机已有合格 Python |
| **Git** | git 安装路径必需。安装器用其克隆仓库；仅需 `git --version` 能运行 |
| **网络** | 安装阶段需拉取 PyPI、GitHub 或安装脚本依赖 |
| **磁盘** | 为用户级安装预留数百 MB 级空间（含可选 Chromium 等） |

安装器会按需安装 **Node.js 22**、**ripgrep**、**ffmpeg** 等，用于浏览器自动化、快速搜文件与音频处理。一般**不必**手动逐个安装，除非你在受限环境选择跳过某些步骤。

## 安装方式怎么选

| 方式 | 适用 | 特点 |
| --- | --- | --- |
| **一键脚本（git，跟踪 main）** | Linux、macOS、WSL2、Android Termux | 克隆到 `~/.hermes/hermes-agent/`，`~/.local/bin/hermes` |
| **pip** | 已有 Python 工具链、CI | `pip install hermes-agent`，版本跟 PyPI 标签 |
| **Windows PowerShell 脚本** | 原生 Windows（早期 beta） | 数据在 `%LOCALAPPDATA%\hermes\` |
| **手动克隆** | 贡献者、指定分支 | 见官方 Contributing 中的 Development Setup |
| **Nix / NixOS** | 声明式环境 | 见官方 [Nix Setup](https://hermes-agent.nousresearch.com/docs/getting-started/nix-setup) |

以下命令以官方 [Installation](https://hermes-agent.nousresearch.com/docs/getting-started/installation) 为准；若你阅读时文档已更新，以官网为准。

### Linux / macOS / WSL2

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

安装结束后**重新加载 Shell**：

```bash
source ~/.zshrc
# 或 source ~/.bashrc
```

验证：

```bash
hermes --version
hermes doctor
```

### pip（最简单，但不一定最新）

```bash
pip install hermes-agent
hermes postinstall
```

`postinstall` 会安装 Node、浏览器相关依赖等，并引导基础配置。PyPI 版本对应**发布标签**，不一定包含 GitHub `main` 上每一天的提交。需要最前沿功能时用 git 安装器。

### Android Termux

在 Termux 中执行与 Linux 相同的 curl 命令；安装器会检测 Termux 并走专用依赖路径。限制与推荐组合见官方 [Termux guide](https://hermes-agent.nousresearch.com/docs/getting-started/termux)。

### Windows

**更稳妥**：安装 WSL2，在 WSL 内使用 Linux 一键脚本。

**原生 Windows（早期 beta）**：PowerShell 中执行：

```powershell
iex (irm https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.ps1)
```

安装后**新开** PowerShell 窗口，再运行 `hermes doctor`。用户数据在 `%LOCALAPPDATA%\hermes\`，与 WSL 下的 `~/.hermes/` 分离，二者可并存。

也可使用官方 **Hermes Desktop** 图形安装器：首次启动会调用同一套 `install.ps1`，与 CLI 共用数据目录。详见 [Installation](https://hermes-agent.nousresearch.com/docs/getting-started/installation) 与 [Windows Native](https://hermes-agent.nousresearch.com/docs/user-guide/windows-native)。

## 安装器实际做了什么

理解目录布局，后面排查会快很多。

| 安装方式 | 代码位置 | `hermes` 命令 | 用户数据 |
| --- | --- | --- | --- |
| git 安装器（普通用户） | `~/.hermes/hermes-agent/` | `~/.local/bin/hermes` | `~/.hermes/` |
| pip | site-packages | `~/.local/bin/hermes` 等 | `~/.hermes/` |
| root 模式 git 安装 | `/usr/local/lib/hermes-agent/` 等 | `/usr/local/bin/hermes` | 各用户仍可有 `~/.hermes/` |

`~/.hermes/` 下常见内容：`config.yaml`、`.env`（密钥）、`memories/`、`skills/`、`state.db`、网关状态等。多实例用 **Profile**：`hermes -p 名称` 指向不同的 `HERMES_HOME`。

## 安装后必做：`hermes doctor`

`hermes doctor` 汇总环境、安装来源、缺失依赖与配置问题，并给出修复建议。安装后第一次请完整跑一遍：

```bash
hermes doctor
```

若仅有「未配置 API Key」类提示，在安装阶段属正常；下一章会通过 `hermes model` 或 `hermes setup` 配置 Provider。若出现 **Python 模块找不到**、**调用了错误的 hermes 二进制**，常见原因是 PATH 指向了源码目录里的脚本而非 venv 里的 `hermes`，doctor 输出里通常会点明安装方式。

其它有用命令：

```bash
hermes setup          # 交互式全量配置向导
hermes config check   # 检查 config.yaml
hermes config migrate # 升级后迁移旧配置
hermes update         # 按检测到的安装方式提示更新命令
```

`hermes update` 会根据安装布局（pip、git、Homebrew、Nix 等）打印匹配的更新方式，无需手设环境变量。

## `hermes postinstall` 何时需要

- **pip 安装**：建议安装后执行一次 `hermes postinstall`。
- **git 一键脚本**：安装流程已包含依赖，一般不必再跑，除非 doctor 提示缺 Node、浏览器或 ripgrep。

postinstall 可能触发 Playwright 安装 Chromium。在无 `sudo` 的服务器账号上，系统库可能需要管理员单独执行 `npx playwright install-deps chromium`，安装器会打印对应提示。

## 无 sudo 的服务器账号

在仅能登录、不能 sudo 的部署账号上：

1. 管理员在系统层安装 Chromium 依赖（Debian/Ubuntu 示例）：

```bash
sudo npx playwright install-deps chromium
```

2. 服务用户执行常规安装脚本；若无 sudo，安装器跳过 `--with-deps`，把 Chromium 装进用户目录。

3. 确保 `~/.local/bin` 在该用户的 `PATH` 中，或请管理员 symlink 到 `/usr/local/bin/hermes`。

不需要浏览器自动化时，可跳过浏览器相关步骤：

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash -s -- --skip-browser
```

## 常见故障模式

| 现象 | 可能原因 | 建议操作 |
| --- | --- | --- |
| `hermes: command not found` | PATH 未含 `~/.local/bin` | reload shell；把 `export PATH="$HOME/.local/bin:$PATH"` 写入 profile |
| `ModuleNotFoundError: dotenv` 等 | 用系统 Python 直接跑仓库内脚本 | 使用 venv 内 launcher：`~/.hermes/hermes-agent/venv/bin/hermes` |
| doctor 报 API key 缺失 | 尚未配置 Provider | 下一章运行 `hermes model`；或 `hermes config set OPENROUTER_API_KEY ...` |
| 更新后配置异常 | 旧版 config 字段变更 | `hermes config check` 然后 `hermes config migrate` |
| 浏览器工具不可用 | 跳过安装或系统库缺失 | 按 doctor 提示补 Chromium；或 `--skip-browser` 后接受无浏览器能力 |
| Windows 编码异常 | 控制台代码页 | 文档提到可设 `HERMES_DISABLE_WINDOWS_UTF8=1` 做对比排查 |

恢复顺序与 Quickstart 一致，适合「装上了但不对劲」时逐项排除：

```text
hermes doctor → hermes model → hermes setup → hermes sessions list
```

## 决策边界

- **不要在 doctor 仍报阻塞错误时配置 Gateway**：网关只会放大配置问题，先保证本机 `hermes` 能进入交互。
- **不要混用 root 与用户级安装而不理清 PATH**：容易出现权限错乱的 `~/.hermes` 文件。
- **不要在生产服务器默认使用 local 终端后端**：安装章只解决「能跑起来」；执行隔离在后续「工具系统」「安全」章节配置。

## 动手练习

1. 执行安装命令后运行 `hermes --version`，并对照 [PyPI hermes-agent](https://pypi.org/project/hermes-agent/) 当前 release 标签是否一致。
2. 运行 `hermes doctor`，对每一条 warning 判断：属于「尚未配置 Provider」还是「必须立刻修复」。
3. 故意在新终端不 source profile 执行 `hermes`，复现 `command not found`，再修复 PATH。

## 苏格拉底式反思

1. 你更倾向 pip 还是 git 安装？权衡的是「稳定版本」还是「跟进 main」？
2. 若 doctor 通过但你还不能聊天，下一步应查模型配置还是网络代理？
3. 若 Hermes 跑在远程 VPS 而你在本地聊天，数据与命令实际落在哪台机器？

## 读者自测

- [ ] 说出 `~/.hermes/` 与 `~/.hermes/hermes-agent/` 分别大致存什么。
- [ ] 解释为何安装后必须 reload shell 或开新终端。
- [ ] 能根据现象在表中匹配至少两种故障与处理。

---

下一章：[第一次对话](./first-conversation/)，配置 `hermes model`、启动 CLI 或 TUI，并完成可验证的首轮对话与 `hermes --continue` 恢复。
