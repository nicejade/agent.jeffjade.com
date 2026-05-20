---
title: 配置与个性化
description: 掌握 config.yaml 与 .env 的分工、SOUL.md 与 AGENTS.md 的边界，以及 Profile 隔离多套 Agent 状态。
sidebar:
  order: 5
---

*「同一台机器上想跑「写代码的 Hermes」和「只回 Telegram 的个人助理」，却共用了同一份 MEMORY.md 和 bot token——Profile 就是为这种隔离准备的。」*

前几章你已能对话、理解记忆与 Skill。本章把**静态配置**与**人格/项目上下文**讲清楚：`~/.hermes/` 里哪些文件管什么、改完何时生效，以及如何用 Profile 避免多套用途互相污染。依据官方 [Configuration](https://hermes-agent.nousresearch.com/docs/user-guide/configuration)、[Personality](https://hermes-agent.nousresearch.com/docs/user-guide/features/personality)、[Context Files](https://hermes-agent.nousresearch.com/docs/user-guide/features/context-files)、[Profiles](https://hermes-agent.nousresearch.com/docs/user-guide/profiles)。

## `~/.hermes/` 目录：一张地图

| 路径 | 用途 | 典型内容 |
| --- | --- | --- |
| `config.yaml` | 非密钥设置 | 模型、terminal backend、toolsets、审批模式、压缩阈值 |
| `.env` | 密钥与敏感项 | API Key、bot token、SSH 密码、`SUDO_PASSWORD` |
| `auth.json` | OAuth 凭据 | Nous Portal 等 |
| `SOUL.md` | 全局人格与语气 | 身份槽位 #1，系统提示最前 |
| `memories/` | 声明式记忆 | `MEMORY.md`、`USER.md` |
| `skills/` | Agent 创建与安装的 Skill | `SKILL.md` 树 |
| `sessions/` | 会话持久化 | Gateway 与 CLI 会话库 |
| `cron/` | 定时任务 | 自然语言定义的 job |
| `logs/` | 日志 | 敏感信息会脱敏 |

默认 Profile 的 `HERMES_HOME` 就是 `~/.hermes`。额外 Profile 落在 `~/.hermes/profiles/<name>/`，结构相同。

## 配置优先级：谁覆盖谁

官方解析顺序（高到低）：

1. **CLI 参数**：如 `hermes chat --model anthropic/claude-sonnet-4`
2. **`config.yaml`**：非密钥的主配置
3. **`.env`**：环境变量；密钥必须放这里
4. **内置默认值**

经验法则：**密钥进 `.env`，其余进 `config.yaml`**。`hermes config set` 会自动路由：API Key 写入 `.env`，其它键写入 `config.yaml`。

`config.yaml` 支持 `${VAR_NAME}` 引用环境变量；未定义的变量会原样保留占位符。

```bash
hermes config              # 查看当前配置
hermes config edit         # 用编辑器打开 config.yaml
hermes config set KEY VAL  # 设置单项
hermes config check        # 升级后检查缺失项
hermes config migrate      # 交互式补全新选项
```

## `config.yaml` 里常改什么

不必背全表，先掌握与日常体验相关的块：

| 配置块 | 作用 | 示例 |
| --- | --- | --- |
| `model` / `providers` | 主模型与 Provider | 见 [Configuring Models](https://hermes-agent.nousresearch.com/docs/user-guide/configuring-models) |
| `terminal` | 命令执行后端 | `backend: docker`、`cwd`、`timeout` |
| `memory` | 记忆开关与字符上限 | `memory_char_limit`、`user_char_limit` |
| `approvals` | 危险命令审批 | `mode: manual \| smart \| off` |
| `compression` | 上下文压缩 | `threshold`、`target_ratio` |
| `auxiliary` | 辅助模型 | vision、compression、approval 分类器等 |
| `agent.personalities` | 自定义 `/personality` 预设 | 命名 persona 片段 |
| `mcp_servers` | MCP 服务列表 | 见工具系统章 |

辅助模型可在 `hermes model` 流程里配置；`approval` 在 `approvals.mode: smart` 时用于风险分类。

## `.env`：只放秘密与部署变量

典型条目：

- 各 Provider 的 `OPENROUTER_API_KEY`、`ANTHROPIC_API_KEY` 等
- Gateway：`TELEGRAM_BOT_TOKEN`、`DISCORD_BOT_TOKEN`、`*_ALLOWED_USERS`
- 远程终端：`TERMINAL_SSH_HOST`、`TERMINAL_SSH_USER`、`TERMINAL_SSH_KEY`
- 可选：`SUDO_PASSWORD`、`MESSAGING_CWD`、`TERMINAL_CWD`

不要把 `.env` 提交到 Git。导出 Profile 时，分发包通常**不包含**你本机的 `.env` 与记忆，需在目标机器重新配置。

## SOUL.md：全局身份，不是项目手册

`SOUL.md` 位于 `HERMES_HOME/SOUL.md`（默认 `~/.hermes/SOUL.md`），**不会**从当前工作目录自动发现。

机制要点：

- 占据系统提示 **slot #1**，有内容时替换内置默认身份
- 首次安装若文件不存在，Hermes 会种子一份默认 `SOUL.md`；**已有文件不会被覆盖**
- 经 prompt-injection 扫描与长度截断后**原文注入**，无额外包装
- 空文件或读失败时回退内置身份

适合写入：语气、直接程度、如何处理不确定、风格禁忌。

不适合写入：仓库路径、端口、一次性任务步骤（应放 `AGENTS.md` 或 Skill）。

```markdown
# Personality
你是务实的资深工程师，优先清晰与可验证结论。
## Style
- 先给结论再展开
- 对明显坏主意直接说明理由
## What to avoid
- 空泛恭维与堆砌 buzzword
```

### `/personality` 与会话级覆盖

`SOUL.md` 是**持久基线**；`/personality concise` 等是**当前会话的叠加**，适合临时切换教学模式或创意脑暴，不必改磁盘上的 `SOUL.md`。

可在 `config.yaml` 的 `agent.personalities` 下定义自定义名，例如 `codereviewer`，再用 `/personality codereviewer` 调用。

## AGENTS.md 与项目上下文优先级

项目侧上下文**每种类型只加载一种**（先匹配者优先）：

`.hermes.md` / `HERMES.md` → `AGENTS.md` → `CLAUDE.md` → `.cursorrules`

`SOUL.md` **独立加载**，与上表并行。

| 文件 | 发现方式 | 上限（约） |
| --- | --- | --- |
| 启动时 CWD 的项目文件 | 上述优先级 | 20,000 字符，头尾截断 |
| 子目录 `AGENTS.md` 等 | 工具访问路径时渐进注入 | 8,000 字符/文件 |

子目录发现的好处：系统提示前缀稳定，利于 Prompt Caching；进入 `frontend/` 时才注入 `frontend/AGENTS.md`。

所有项目上下文文件会经**注入扫描**；命中威胁模式会整块拒绝并显示 `[BLOCKED: ...]`。共享仓库里的 `AGENTS.md` 仍需人工审阅，扫描不能替代信任边界。

### 与 MEMORY.md 的分工

| 维度 | SOUL.md / AGENTS.md | MEMORY.md / USER.md |
| --- | --- | --- |
| 谁维护 | 你手写 | Agent 用 `memory` 工具 |
| 何时进提示 | 会话启动（+ 子目录渐进） | frozen snapshot 注入 |
| 适合 | 稳定规范与人格 | 精炼事实与偏好 |

上一章强调：mid-session 的 `memory` add 不会更新当前 frozen 块；**当场就要生效的约束**应写进用户消息或 `AGENTS.md`，不要只依赖 memory。

## Profile：多套 Agent，不是沙箱

Profile = 独立的 `HERMES_HOME`，各有自己的 `config.yaml`、`.env`、`SOUL.md`、sessions、skills、Gateway 状态。

```bash
hermes profile create coder          # 新建；自动有 coder 命令别名
hermes profile create work --clone     # 复制当前 profile 的 config、.env、SOUL.md
hermes profile create backup --clone-all  # 含记忆与会话的完整快照
hermes profile use work                # 粘性默认，之后裸 hermes 指向 work
hermes -p coder chat                   # 单次指定 profile
coder gateway start                    # 该 profile 独立 Gateway 进程
```

### Profile 不是什么

- **不是文件系统沙箱**：`local` backend 下 Agent 仍拥有你用户账号的权限；隔离的是 Hermes **状态目录**，不是整个磁盘。
- **不等于工作区**：终端起始目录由 `terminal.cwd` 控制；`cwd: "."` 在 local 上表示**启动 Hermes 时的目录**，不是 profile 目录。
- **不能删 default**：`~/.hermes` 即默认 profile；彻底卸载用 `hermes uninstall`。

若要让某 profile 默认在某项目下开工，在该 profile 的 `config.yaml` 写**绝对路径**：

```yaml
terminal:
  backend: local
  cwd: /absolute/path/to/my-project
```

### Gateway 与 token 锁

每个 profile 有独立 `.env` 与 Gateway 进程。两个 profile 若误用同一 bot token，后启动的 Gateway 会被**明确拒绝**，避免双实例抢同一机器人。

生产上可为不同用途配置不同 `TELEGRAM_ALLOWED_USERS` 或 pairing 策略。

### 导出、分发与更新

```bash
hermes profile export coder -o coder-backup.tar.gz
hermes profile import coder-backup.tar.gz --name restored
hermes profile install github.com/you/research-bot --alias
hermes update   # 代码一次更新，bundled skills 同步到各 profile
```

`hermes update` 共享代码目录，用户改过的 Skill 不会被覆盖。

## 最小配置路径（建议顺序）

1. `hermes model` 配好主模型与 Provider。
2. `hermes config check`，必要时 `hermes config migrate`。
3. 编辑 `~/.hermes/SOUL.md` 定语气；在项目根写 `AGENTS.md` 定架构与禁忌。
4. 需要第二套用途时再 `hermes profile create <name> --clone` 并改该 profile 的 `.env` 与 `SOUL.md`。
5. 远程或不可信任务前设 `terminal.backend: docker`（工具系统章展开）。

## 故障模式

| 现象 | 可能原因 | 处理 |
| --- | --- | --- |
| 改了 SOUL 但语气仍旧 | 旧会话未重建 | `/new` 或新开 `hermes` |
| 项目规范未生效 | 优先级被 `.hermes.md` 等覆盖 | 检查仓库根目录有哪些上下文文件 |
| `AGENTS.md` 显示 BLOCKED | 触发注入扫描规则 | 删掉可疑句式；勿在共享仓留恶意模板 |
| Profile 下命令跑错目录 | 未设 `terminal.cwd` | 在 profile 的 config 写绝对 `cwd` |
| Gateway 起不来 | 与另一 profile token 冲突 | `hermes profile list` 看占用；改 token |
| `config set` 写错文件 | Key 被识别为密钥 | 查 `.env` 与 `config.yaml` 各一份 |
| 辅助功能很慢 | auxiliary 模型未配 | `hermes model` 里配置 vision/compression 等 |

## 决策边界

- **不要把整份团队手册塞进 SOUL.md**：全局身份应保持跨项目稳定；项目细节进 `AGENTS.md` 或 Skill。
- **不要用 Profile 代替 Docker/SSH 隔离**：多 profile 仍可在同一用户下读写敏感路径；不可信执行应用容器 backend。
- **不要默认 `approvals.mode: off`**：等同长期 YOLO，仅适合已隔离的自动化环境。
- **不要在未备份时 `profile delete`**：会删该 profile 全部 sessions 与记忆；先用 `export`。
- **不要指望 `cwd: "."` 在多项目间自动切换**：CLI 与 Gateway 对 cwd 的默认不同，显式配置更可靠。

## 动手练习

1. 运行 `hermes config`，确认 `model` 与 `terminal.backend` 与预期一致。
2. 在 `SOUL.md` 加一条可观察的风格规则（如「列表优先用表格」），`/new` 后开新会话验证。
3. 在当前 Git 仓库根创建简短 `AGENTS.md`，让 Agent 列出「项目用的包管理器」并核对是否遵循。
4. `hermes profile create lab --clone`，修改 `~/.hermes/profiles/lab/SOUL.md` 一行，用 `hermes -p lab chat -q "用一句话介绍你自己"` 对比 default。
5. `hermes profile list`，记下各 profile 的 HERMES_HOME 路径。

## 苏格拉底式反思

1. 你的「个人助理」与「工作 coding agent」是否应共享 `USER.md`？若不应，该用 clone 还是 blank profile？
2. 哪些指令必须写进 `AGENTS.md` 才能在**同一会话内**立即约束行为，而不能只写 memory？
3. Gateway 跑在 VPS、你在笔记本 CLI 操作时，两边的 `terminal.cwd` 各是什么？

## 读者自测

- [ ] 说出 config 优先级四层与密钥存放位置。
- [ ] 区分 SOUL.md、AGENTS.md、MEMORY.md 的职责。
- [ ] 解释项目上下文「一种类型只加载一份」的优先级链。
- [ ] 用 `hermes profile create` 与 `-p` 各完成一次指定 profile 的对话。
- [ ] 说明 Profile 隔离什么、不隔离什么。

---

下一章：[工具系统](./tools-system/)，展开 Toolsets、`hermes tools`、终端执行环境与审批、MCP 扩展。
