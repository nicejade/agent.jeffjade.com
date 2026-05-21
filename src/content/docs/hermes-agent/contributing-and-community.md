---
title: 贡献与社区
description: 弄清 Skill 与 Tool 的贡献路径、Skills Hub 发布、核心仓库 PR 规范，以及 Trajectory 与 Atropos 训练管线关系。
sidebar:
  order: 16
---

*「写了个很好用的部署脚本，直接提 PR 加进 tools/——审阅者让你改成 Skill，并说明为何不该进核心仓库。」*

读完 [从零实现类似 Agent](./build-your-own-agent/) 后，你可能想回馈社区、发布团队 Skill，或参与 [hermes-agent](https://github.com/NousResearch/hermes-agent) 开发。本章说明**贡献优先级**、Skill/Tool/插件/记忆后端的边界、Skills Hub 与 tap、PR 流程，以及 Trajectory 与 [Atropos](https://github.com/NousResearch/atropos) 在训练数据侧的衔接。依据仓库 [CONTRIBUTING.md](https://github.com/NousResearch/hermes-agent/blob/main/CONTRIBUTING.md)、[Trajectory Format](https://hermes-agent.nousresearch.com/docs/developer-guide/trajectory-format)、[Build a Hermes Plugin](https://hermes-agent.nousresearch.com/docs/guides/build-a-hermes-plugin)。

**前置**：已能编写合格 `SKILL.md`，见 [技能系统实战](./skills-in-practice/)。

## 贡献什么：官方优先级

Nous 在 CONTRIBUTING 中声明的优先顺序：

| 优先级 | 类型 | 说明 |
| --- | --- | --- |
| 1 | Bug 修复 | 崩溃、错误行为、数据丢失 |
| 2 | 跨平台兼容 | macOS、各 Linux、WSL2、原生 Windows |
| 3 | 安全加固 | 注入、路径遍历、权限提升 |
| 4 | 性能与健壮性 | 重试、降级、错误处理 |
| 5 | 新 Skill | 需**广泛**适用，见下文标准 |
| 6 | 新 Tool | **少见**；多数能力应是 Skill |
| 7 | 文档 | 修正、示例、澄清 |

先修可复现的 bug，再考虑新功能；大杂烩 PR 容易被要求拆分。

## Skill 还是 Tool：最常见分叉

**优先 Skill**，当能力可由「说明 + 现有工具」表达：

- 调用外部 CLI 或 HTTP，经 `terminal`、`web_extract` 等完成
- 不需要在 harness 内硬编码 OAuth、流式二进制、专用会话管理
- 例：arXiv 检索、git 工作流、PDF 处理、邮件 CLI

**才做 Tool**，当需要与运行时深度集成：

- API Key、鉴权流、多组件配置由 Agent 统一管理
- 必须每次精确执行的逻辑，不能依赖模型「尽力理解」
- 二进制/流式/实时事件无法只走 shell
- 例：浏览器自动化（Browserbase 会话）、TTS 编码与下发、vision 的 base64 管线

**bundled 放哪**：

| 位置 | 条件 |
| --- | --- |
| `skills/` | 随安装启用，**大多数用户**常用 |
| `optional-skills/` | 官方但非人人需要；`hermes skills browse` 标 official，`install` 无第三方警告 |
| Skills Hub / 自建 tap | 垂直、社区、组织内部流程 |

组织内专用流程：Git 仓 + `hermes skills tap add org/repo`，见 [技能系统实战](./skills-in-practice/) 的 tap 小节。

## 新记忆后端：不进主仓库

**不再接受**新的 `plugins/memory/` 目录合入核心树。新后端应发布为**独立插件**到 `~/.hermes/plugins/` 或 pip entry point，实现 `MemoryProvider` ABC（`sync_turn`、`prefetch`、`shutdown` 等）。这是对耦合与维护面的决定，不是质量门槛。

Bug 修复现有内置 provider 仍欢迎 PR。

## 其他扩展方式

| 方式 | 适用 | 入口 |
| --- | --- | --- |
| 普通插件 | 工具、hook、CLI 子命令 | `~/.hermes/plugins/`、项目 `.hermes/plugins/`、pip entry |
| Context engine 插件 | 替代默认压缩引擎 | `plugins/context_engine/`，`config.yaml` 中 `context.engine` 显式启用 |
| Skin 主题 | CLI 视觉 | `~/.hermes/skins/*.yaml` 或内置 `_BUILTIN_SKINS` |
| 文档站 | 官网修正 | 仓库 `website/` |

插件指南见官方 [Build a Hermes Plugin](https://hermes-agent.nousresearch.com/docs/guides/build-a-hermes-plugin)。

## Skills Hub：发布与安装

用户侧（复习）：

```bash
hermes skills browse
hermes skills search deploy
hermes skills install official/security/1password
hermes skills tap add myorg/hermes-skills
hermes skills install myorg/hermes-skills/oncall-playbook
```

**发布自定义 tap**（组织/registry）：

1. 在 GitHub（或兼容 registry）建仓，目录 `skills/<category>/<name>/SKILL.md`。
2. 用户执行 `hermes skills tap add <owner>/<repo>`，配置写入 `~/.hermes/.hub/taps.json`。
3. 在 [Nous Research Discord](https://discord.gg/NousResearch) 等渠道说明用途与信任边界。

社区 Skill 安装前会经 **Skills Guard** 扫描；`community` 来源可能对非 dangerous 项需 `--force`。详见官方 [Skills](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills#publishing-a-custom-skill-tap)。

### 合入核心的 Skill 标准（摘要）

审阅会按 HARDLINE 检查，贡献前自检：

1. `description` ≤ 60 字符，一句，句号结尾，无营销套话。
2. 正文引用 Hermes 原生工具名（`` `search_files` ``），勿用 `grep`/`cat` 代替已封装工具。
3. 结构含 When to Use、Procedure、Pitfalls、Verification 等；复杂 Skill 约 200 行内。
4. 辅助脚本放 `scripts/`，测试放 `tests/skills/test_<name>_skill.py`，**无 live 网络**。
5. 需要密钥时用 `required_environment_variables`，Gateway 不在聊天里收 secret。

本地验证：

```bash
hermes --toolsets skills -q "Use the <skill-name> skill to <concrete task>"
```

## 参与核心开发：环境与 PR

### 开发环境（最小路径）

```bash
git clone --recurse-submodules https://github.com/NousResearch/hermes-agent.git
cd hermes-agent
uv venv venv --python 3.11
export VIRTUAL_ENV="$(pwd)/venv"
uv pip install -e ".[all,dev]"
mkdir -p ~/.hermes/{cron,sessions,logs,memories,skills}
cp cli-config.yaml.example ~/.hermes/config.yaml
# 在 ~/.hermes/.env 配置至少一个 LLM Provider Key
hermes doctor
hermes chat -q "Hello"
```

测试与 CI 对齐：

```bash
scripts/run_tests.sh
# 或激活 venv 后：pytest tests/ -v
```

触达进程管理、终端、文件 I/O 时，PR 前可跑 `scripts/check-windows-footguns.py`（Windows 上 `os.kill(pid, 0)` 等陷阱）。

### 新增 Tool（若确有必要）

在 `tools/` 新文件内 `registry.register(...)`，并在 `toolsets.py` 把工具名加入对应列表，否则注册了也不会暴露给模型。无需改 `model_tools.py` 中央 import 列表。

### PR 流程

| 项 | 约定 |
| --- | --- |
| 分支名 | `fix/`、`feat/`、`docs/`、`test/`、`refactor/` + 描述 |
| 提交信息 | [Conventional Commits](https://www.conventionalcommits.org/)，如 `fix(gateway): ...`、`feat(skills): ...` |
| 描述内容 | 改了什么、为何、如何测、测过哪些平台 |
| 范围 | 一 PR 一事；安全相关请显式标注 |

新 PyPI 依赖需合理上下界；供应链相关改动会走 `supply-chain-audit` 等 CI 审查。

### 报 Issue

[GitHub Issues](https://github.com/NousResearch/hermes-agent/issues) 请附 OS、Python 版本、`hermes version`、完整 traceback、复现步骤。安全漏洞请**私下**报告，勿公开 issue。

## Trajectory：从会话到训练数据

Hermes 可将对话导出为 **ShareGPT 兼容 JSONL**，供调试、监督微调或 RL 管线使用。实现见 `agent/trajectory.py`、`run_agent.py` 的 `_save_trajectory`、`batch_runner.py`。

### 交互式保存

```yaml
# ~/.hermes/config.yaml
agent:
  save_trajectories: true   # 默认 false
```

或会话/启动时使用 `--save-trajectories`。结束时写入工作目录：

| 文件 | 含义 |
| --- | --- |
| `trajectory_samples.jsonl` | `completed: true` |
| `failed_trajectories.jsonl` | 失败或中断 |

每条含 `conversations`（ShareGPT 角色：`human`/`gpt`/`tool`/`system`）、`timestamp`、`model`、`completed` 等。推理内容规范为 `` 块，工具调用规范为 `<tool_call>` XML，便于 HuggingFace `load_dataset("json", ...)`。

### 批处理：`batch_runner`

官方 [Batch Processing](https://hermes-agent.nousresearch.com/docs/user-guide/features/batch-processing) 描述并行跑提示列表、checkpoint 续跑与 toolset 分布采样。仓库内 `batch_runner.py` 用多进程执行，**主要目的就是产 trajectory**。输出常带 `prompt_index`、`tool_stats`、`api_calls` 等字段；无推理内容的样本会被丢弃，避免污染训练集。具体 CLI 子命令以你安装版本的 `hermes --help` 与仓库 `batch_runner.py` 为准。

加载示例：

```python
import json
with open("trajectory_samples.jsonl") as f:
    entries = [json.loads(line) for line in f if line.strip()]
training = [e["conversations"] for e in entries if e.get("completed")]
```

详见 [Trajectory Format](https://hermes-agent.nousresearch.com/docs/developer-guide/trajectory-format)。

### 与 Atropos 的关系

[Atropos](https://github.com/NousResearch/atropos) 是 Nous 的 **RL / 轨迹采集** 框架：环境以微服务形式通过 trajectory API 与训练器交互，支持多轮工具调用、代码执行等场景。Hermes 导出的 JSONL 是**一种轨迹来源**；完整 RL 训练还需 Atropos 侧环境、奖励与训练配置，不是「开 `save_trajectories` 即等于微调完成」。

边界：本教程不展开 Atropos 训练脚本；若你做模型研究，应同时读 Atropos 仓库 README 与 Hermes trajectory 字段约定。

## 生产部署：社区实践与官方清单

没有单一「官方客户案例」文档；生产建议以 [Security](https://hermes-agent.nousresearch.com/docs/user-guide/security) 与 [消息网关](./messaging-gateway/) 为准，常见组合：

| 场景 | 实践要点 |
| --- | --- |
| 个人 VPS 助理 | allowlist 或 pairing、`docker` backend、Cron deliver 到 `/sethome` |
| 团队运维 bot | 组织 tap 分发 Skill、`command_allowlist` 定期审计 |
| 研发机 CLI | `local` + `manual` 审批，敏感仓用 Profile 隔离 |
| 训练数据生产 | `batch_runner` + 推理链完整的模型，磁盘管理 JSONL 体积 |

与 [安全、性能与最佳实践](./security-performance-best-practices/) 的 Gateway 检查清单配合使用。

## 故障模式

| 症状 | 可能原因 | 处理 |
| --- | --- | --- |
| PR 要求改成 Skill | 能力不需新 Tool | 重写为 `SKILL.md` + 现有工具 |
| memory provider PR 被拒 | 政策关闭 in-tree | 独立插件仓 |
| Hub install 被拦 | Guard 命中 | `hermes skills inspect`；审慎 `--force` |
| JSONL 为空 | 无 reasoning 被 batch 丢弃 | 换支持推理的模型或查格式 |
| Skill 合并被拒 | description 超长 | 按 HARDLINE 缩短 |

## 决策边界

- **不要为小众内部流程争 bundled**：用 tap 或 Hub，降低核心维护面。
- **不要在 Gateway 聊天里提交 PR 级密钥**：用 `hermes setup` 与 `.env`。
- **不要把 trajectory 当隐私合规手段**：JSONL 含完整对话，注意脱敏与存储权限。
- **不要假设贡献 Tool 比 Skill 更「高级」**：官方明确 Tool 应少见。

## 动手练习

1. 为你常做的一项工作写 10 行 Skill 大纲（When to Use + Procedure），判断应放 bundled、optional 还是 tap。
2. 运行 `hermes skills browse --source official`，安装一个 optional skill 并完成一次调用。
3. 阅读 CONTRIBUTING 中「Should it be a Skill or a Tool」一节，举一个你曾想过做成 Tool 但应改为 Skill 的例子。
4. 若已 clone 仓库：跑 `scripts/run_tests.sh tests/skills/ -q` 看 Skill 测试如何 mock 网络。
5. 打开 `agent/trajectory.py` 或文档，写出 ShareGPT 里 `human` 对应 API 的哪个 role。

## 苏格拉底式反思

1. 你的组织更需要私有 tap，还是向上游提交 bundled Skill？
2. Trajectory 用于改进模型还是审计 Agent 行为，所需字段是否相同？
3. 若不能合入 memory provider，独立插件的发布与版本谁维护？

## 读者自测

- [ ] 说出官方贡献优先级前三项。
- [ ] 对比 Skill 与 Tool 各一条适用条件。
- [ ] 说明为何新 memory provider 应独立发布。
- [ ] 写出 `hermes skills tap add` 与 `install` 的分工。
- [ ] 解释 `trajectory_samples.jsonl` 与 batch_runner 的关系。
- [ ] 列出一条生产 Gateway 必做安全配置。

---

下一章：[系列总结与自测](./series-summary-and-self-test/)，串联全系列能力边界与可执行验收清单。
