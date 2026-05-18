---
title: Claude Code 的安装、登录与环境配置
description: 从零开始完成 Claude Code 的 CLI 安装、API 配置、IDE 集成，以及 Node.js 环境准备的全流程指南。
sidebar:
  order: 3
---

*“装个 CLI 工具能有多复杂？npm install -g 不就完事了？”*

如果你这么想，你可能会踩中 Claude Code 安装中最常见的坑。Claude Code 的安装方式直接影响后续的自动更新、权限管理、会话恢复等功能是否能正常工作。

本章从环境准备到安装验证，带你走完从零到可用的每一步——并且告诉你哪些捷径坚决不能走。

## 系统要求

在安装之前，确认你的环境满足以下最低要求：

| 维度 | 要求 |
|------|------|
| **操作系统** | macOS 13.0+ / Windows 10 1809+ / Ubuntu 20.04+ / Debian 10+ / Alpine 3.19+ |
| **运行时** | Node.js 18+（仅在 npm 安装方式下需要） |
| **内存** | 4 GB+ RAM |
| **架构** | x64 或 ARM64 |
| **网络** | 需要互联网连接，且需位于 [Anthropic 支持的国家/地区](https://www.anthropic.com/supported-countries) |
| **Shell** | Bash / Zsh / PowerShell / CMD。Windows 原生环境下推荐安装 [Git for Windows](https://git-scm.com/downloads/win) |

### Node.js 环境管理（推荐用 nvm）

如果你需要通过 npm 安装，Node.js 18+ 是硬性要求。但即使你使用推荐的原生安装方式，维护一个干净的 Node.js 环境对后续开发也有好处。

推荐使用 nvm（Node Version Manager）管理 Node.js 版本：

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# 安装并使用 Node.js LTS
nvm install --lts
nvm use --lts

# 验证
node --version
npm --version
```

## 安装 Claude Code CLI

Claude Code 提供多种安装方式。**推荐顺序如下**：

### 方式一：原生安装脚本（强烈推荐）

这是官方首推的安装方式，由安装脚本自动检测平台并下载对应二进制文件，安装后自动在后台静默更新。

**macOS / Linux / WSL：**

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows PowerShell：**

```powershell
irm https://claude.ai/install.ps1 | iex
```

**Windows CMD：**

```batch
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

原生安装的优势：
- 不需要 Node.js 运行时——安装的是独立的原生二进制文件
- 自动在后台静默更新，始终保持最新版本
- 无权限问题，文件安装在用户目录下（`~/.local/bin/claude`）
- 支持 `claude update` 手动强制更新

### 方式二：Homebrew（macOS）

```bash
brew install --cask claude-code
```

Homebrew 提供两个 cask：
- `claude-code`：跟踪 stable 发布通道（约延迟一周，跳过有重大回归的版本）
- `claude-code@latest`：跟踪 latest 通道，第一时间获取新版本

> **注意**：Homebrew 安装默认不会自动更新。运行 `brew upgrade claude-code` 手动更新，或设置 `CLAUDE_CODE_PACKAGE_MANAGER_AUTO_UPDATE=1` 环境变量让 Claude Code 在后台自动执行升级。

### 方式三：WinGet（Windows）

```powershell
winget install Anthropic.ClaudeCode
```

同样不自动更新，手动升级命令：

```powershell
winget upgrade Anthropic.ClaudeCode
```

### Linux 包管理器

Claude Code 还提供 apt、dnf、apk 仓库签名包：

**apt（Debian / Ubuntu）：**

```bash
sudo install -d -m 0755 /etc/apt/keyrings
sudo curl -fsSL https://downloads.claude.ai/keys/claude-code.asc \
  -o /etc/apt/keyrings/claude-code.asc
echo "deb [signed-by=/etc/apt/keyrings/claude-code.asc] https://downloads.claude.ai/claude-code/apt/stable stable main" \
  | sudo tee /etc/apt/sources.list.d/claude-code.list
sudo apt update
sudo apt install claude-code
```

**dnf（Fedora / RHEL）：**

```bash
sudo tee /etc/yum.repos.d/claude-code.repo <<'EOF'
[claude-code]
name=Claude Code
baseurl=https://downloads.claude.ai/claude-code/rpm/stable
enabled=1
gpgcheck=1
gpgkey=https://downloads.claude.ai/keys/claude-code.asc
EOF
sudo dnf install claude-code
```

### 为什么不推荐 `npm install -g`

你可能会想：*“我是个前端开发者，npm 是我的默认包管理器，直接 `npm install -g @anthropic-ai/claude-code` 不是最自然的选择吗？”*

这个直觉是错的。以下是具体原因：

**1. 官方已将其标记为不推荐的安装方式。**

Claude Code 的 npm 包本质上只是一个壳——它通过可选依赖拉取对应平台的原生二进制文件，然后在 postinstall 脚本中做符号链接。你安装的 `claude` 命令最终运行的还是那个原生二进制，和 Node.js 没有任何关系。既然如此，为什么还要多一个中间层？

**2. `sudo` 权限问题——这是最大的坑。**

在 macOS 和大多数 Linux 发行版上，全局 npm 安装默认需要 `sudo`：

```bash
# 这样做会带来一系列权限问题
sudo npm install -g @anthropic-ai/claude-code
```

用 `sudo` 安装后，`~/.claude/` 目录（Claude Code 存储会话状态、配置、Memory 的路径）可能出现权限错乱。最直接的后果是：

- **Resume 功能失效**：会话恢复依赖对 `~/.claude/` 的读写权限。如果部分文件的所有者是 root，`claude` 以普通用户运行时无法写入，导致会话无法恢复。
- **自动更新失败**：更新进程以普通用户权限运行，无法覆盖 root 所有的二进制文件。
- **Hooks 和 Skills 无法正常写入**：这些功能需要在 `~/.claude/` 下创建和修改文件。

> 官方文档明确警告：**Do NOT use `sudo npm install -g` as this can lead to permission issues and security risks.**

如果你确实必须使用 npm（比如在 CI 环境中），正确的做法是配置 npm 的全局安装路径到用户目录，避免使用 `sudo`：

```bash
# 创建一个用户级的全局安装目录
mkdir -p ~/.npm-global

# 配置 npm 使用这个目录
npm config set prefix '~/.npm-global'

# 添加到 PATH（写入 .zshrc 或 .bashrc）
export PATH=~/.npm-global/bin:$PATH

# 现在可以不加 sudo 了
npm install -g @anthropic-ai/claude-code
```

即便如此，npm 安装方式仍然不如原生安装便捷——你不会获得自动后台更新。

### 安装特定版本

如果你需要固定某个版本（比如在企业环境中统一版本），原生安装脚本支持指定版本号：

```bash
# 安装指定版本
curl -fsSL https://claude.ai/install.sh | bash -s 2.1.89

# 安装 stable 通道
curl -fsSL https://claude.ai/install.sh | bash -s stable
```

## 验证安装

安装完成后，运行以下命令确认 Claude Code 可用：

```bash
claude --version
```

如果输出类似 `2.x.x` 的版本号，说明安装成功。

如果提示 `command not found`，检查 `~/.local/bin` 是否在 PATH 中（原生安装）或重新打开终端（Homebrew / npm）。运行 `claude doctor` 可以获得更详细的安装诊断信息：

```bash
claude doctor
```

## 认证与登录

Claude Code 需要 Pro、Max、Team、Enterprise 或 Console 账户才能使用。免费的 claude.ai 计划不包含 Claude Code 访问权限。

### 浏览器登录（推荐）

在终端中运行 `claude`，按提示在浏览器中完成 OAuth 登录：

```bash
claude
```

首次运行时会自动打开浏览器跳转到 Anthropic 的授权页面，授权后终端自动获取令牌（token）并持久化存储在 `~/.claude/` 中。

### 通过 API 密钥登录

如果你需要更细粒度的认证控制（比如使用第三方模型提供商），可以用环境变量或配置设置 API 密钥。

**方式 A：导出环境变量**

```bash
export ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
```

写入 shell 配置文件（`~/.zshrc` 或 `~/.bashrc`）以持久化：

```bash
echo 'export ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx' >> ~/.zshrc
source ~/.zshrc
```

**方式 B：通过 `/config` 或 settings.json 设置**

在 Claude Code 会话中运行：

```
/config
```

或者在 `~/.claude/settings.json` 中添加：

```json
{
  "env": {
    "ANTHROPIC_API_KEY": "sk-ant-api03-xxxxxxxxxxxxx"
  }
}
```

### 使用第三方模型提供商

Claude Code 支持接入第三方 API 提供商，包括 Amazon Bedrock、Google Vertex AI 和 Microsoft Foundry。配置方式参见各平台的官方文档。

### 多账号切换

Claude Code 的认证状态绑定在 `~/.claude/` 目录中。如果你需要切换账号：

```bash
# 登出当前账号
claude logout

# 重新登录
claude
```

或者使用环境变量为不同项目配置不同的 API 密钥——在项目的 `.claude/settings.json` 中设置 `ANTHROPIC_API_KEY` 会覆盖全局配置。

## 更新管理

### 自动更新（原生安装默认）

原生安装的 Claude Code 默认在后台自动更新——启动时检查，运行中定期检查，更新在后台下载，下次启动生效。对大多数用户来说，这是最省心的方式。

### 手动更新

```
claude update
```

### 切换更新通道

Claude Code 有两个更新通道：

- `latest`（默认）：第一时间获取新版本
- `stable`：约延迟一周，跳过有重大回归的版本

通过 `/config` → **Auto-update channel** 切换，或直接在 `settings.json` 中设置：

```json
{
  "autoUpdatesChannel": "stable"
}
```

### 禁用自动更新

在企业分发场景中，你可能需要固定版本并禁用自动更新：

```json
{
  "env": {
    "DISABLE_AUTOUPDATER": "1"
  }
}
```

`DISABLE_AUTOUPDATER` 只禁用后台自动检查，`claude update` 仍然可用。如果需要完全阻止所有更新路径（包括手动），使用 `DISABLE_UPDATES`。

## IDE 集成

Claude Code 是终端原生的，但它提供了多个 IDE 插件来增强开发体验。

### VS Code 插件

在 VS Code 插件市场搜索 "Claude Code" 安装官方插件。安装后：

- 终端中的 `claude` 和 VS Code 共享同一个 `~/.claude/` 状态目录
- 插件提供侧边栏 UI，可在图形界面中管理会话

### Claude Code Desktop

如果你更喜欢图形界面而不是终端，Claude Code 提供了桌面应用：

- [macOS 下载](https://claude.ai/api/desktop/darwin/universal/dmg/latest/redirect)
- Windows 从 [claude.com/download](https://claude.com/download) 下载

桌面版和 CLI 共享同一套状态文件，你可以在终端和桌面应用之间来回切换。

### JetBrains 插件

JetBrains 插件目前仍在发展中，功能覆盖不如 VS Code 插件完善。如果你是 JetBrains 用户，建议先通过终端直接使用 CLI，或关注 [官方更新动态](https://code.claude.com/docs/en/overview)。

### 终端内使用的最佳实践

对于终端 + 编辑器分离的工作流（NeoVim / Emacs / tmux），Claude Code 天然融入你的环境：

- 在 tmux 中使用分屏：左侧编辑器，右侧 `claude` 会话
- 配置 shell alias 一键启动：`alias cc='claude'`
- 使用 `claude --print` 直接在终端输出而不进入交互模式（适合脚本化使用）

## 卸载

卸载方式取决于你用的安装方式：

| 安装方式 | 卸载命令 |
|---------|---------|
| **原生安装（macOS / Linux）** | `rm -f ~/.local/bin/claude && rm -rf ~/.local/share/claude` |
| **原生安装（Windows）** | `Remove-Item -Path "$env:USERPROFILE\.local\bin\claude.exe" -Force` |
| **Homebrew** | `brew uninstall --cask claude-code` |
| **WinGet** | `winget uninstall Anthropic.ClaudeCode` |
| **npm** | `npm uninstall -g @anthropic-ai/claude-code` |

完全删除配置和缓存（谨慎操作，这将删除所有设置、会话历史和 Memory）：

```bash
rm -rf ~/.claude
rm -f ~/.claude.json
```

---

下一章：[基于第三方 API 使用 Claude Code](/claude-code/third-party-api/)，如果你所在地区无法直接访问 Anthropic API，或想用 OpenRouter、DeepSeek 等第三方接入——这一章给你答案。
