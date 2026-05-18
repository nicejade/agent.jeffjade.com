/**
 * Agent domain registry.
 *
 * Each entry powers one tab inside the AgentLab. Add a new object here to
 * register a new domain (CodeX, OpenCode, Harness Agent, etc.). The component
 * stays untouched and every domain keeps its own isolated session state.
 */

export type DomainStatus = 'stable' | 'beta' | 'preview';

export type AgentDomainIcon =
  | 'Code2'
  | 'Network'
  | 'UserRound'
  | 'TerminalSquare'
  | 'Boxes'
  | 'Workflow'
  | 'Cpu'
  | 'Bot';

export type AgentDomain = {
  /** Stable identifier used for storage keys and routing. */
  slug: string;
  /** Display label on the tab. */
  label: string;
  /** Short tagline describing the audience. */
  audience: string;
  /** One-line description of what this domain unlocks. */
  goal: string;
  /** Reference command users can copy and try locally. */
  command: string;
  /** Two-to-three sentence narrative for the route card. */
  summary: string;
  /** Concrete outputs the domain tends to produce. */
  outputs: string[];
  /** Safety / boundary considerations. */
  safeguards: string[];
  /** Comparative scores rendered as meters. */
  scores: Array<{ label: string; value: number }>;
  /** Icon name resolved by the renderer. */
  iconName: AgentDomainIcon;
  /** Starter prompt seeded into the per-domain textarea. */
  defaultPrompt: string;
  /** Maturity badge displayed alongside the tab. */
  status: DomainStatus;
  /** Optional internal route to a deeper guide. */
  href?: string;
  /** Optional external homepage for the domain. */
  externalHref?: string;
};

export const agentDomains: AgentDomain[] = [
  {
    slug: 'claude-code',
    label: 'Claude Code',
    audience: '工程师 / 产品技术负责人',
    goal: '把想法落到仓库、测试和 PR',
    command: 'claude "审阅这个 Astro 站点的信息架构，并提交一个可运行的改进版本"',
    summary:
      '适合让 Agent 读代码、改文件、跑命令、解释权衡，并把上下文留在真实工程环境里。',
    outputs: ['差异化实现方案', '代码变更与测试结果', '可继续追问的上下文'],
    safeguards: ['先看 diff 再提交', '限制敏感路径', '为破坏性命令设置确认'],
    scores: [
      { label: '代码自治', value: 92 },
      { label: '上下文深度', value: 84 },
      { label: '交付速度', value: 88 },
    ],
    iconName: 'Code2',
    defaultPrompt:
      '帮我审阅当前仓库的信息架构，列出 3 个可落地的改进点，并标注影响范围。',
    status: 'stable',
    href: '/claude-code/',
    externalHref: 'https://docs.anthropic.com/claude/docs/claude-code',
  },
  {
    slug: 'hermes-agent',
    label: 'hermes-agent',
    audience: '自托管玩家 / 个人知识工厂',
    goal: '让 Agent 长期运行、记忆、积累技能',
    command: 'hermes chat "把我最近的 Agent 实验整理成可复用的周报模板"',
    summary:
      '适合把 Agent 当作持续的个人工作者，连接模型、工具和记忆，在服务器或本机上沉淀技能。',
    outputs: ['跨会话记忆', '技能库与工具调用', '长期任务与消息入口'],
    safeguards: ['隔离执行环境', '审计工具权限', '定期清理记忆边界'],
    scores: [
      { label: '长期记忆', value: 90 },
      { label: '部署弹性', value: 82 },
      { label: '个人化程度', value: 93 },
    ],
    iconName: 'Network',
    defaultPrompt: '把我最近一周的 Agent 实验整理成一份可复用的周报模板。',
    status: 'stable',
    href: '/hermes-agent/',
  },
  {
    slug: 'daily-agent',
    label: 'Daily Agent',
    audience: '普通人 / 独立创作者',
    goal: '把复杂生活任务拆成可执行步骤',
    command: 'agent "帮我规划一次三天旅行：预算、路线、订票清单和风险提醒"',
    summary:
      '适合从搜索、总结、规划、写作开始，让 Agent 成为可检查、可迭代的日常助手。',
    outputs: ['决策清单', '可编辑草稿', '下一步提醒'],
    safeguards: ['保留人工判断', '检查来源日期', '避免上传高敏信息'],
    scores: [
      { label: '上手成本', value: 76 },
      { label: '生活覆盖', value: 86 },
      { label: '可信校验', value: 72 },
    ],
    iconName: 'UserRound',
    defaultPrompt:
      '帮我规划一次三天的城市短途旅行，包含预算区间、路线安排、订票清单和风险提醒。',
    status: 'stable',
    href: '/playbooks/non-engineers/',
  },
  {
    slug: 'codex',
    label: 'CodeX',
    audience: 'OpenAI 终端用户 / 脚本党',
    goal: '让 GPT 直接在终端读写仓库、跑命令',
    command: 'codex "为这个项目补一份 README 与最小 CI 配置"',
    summary:
      'OpenAI Codex CLI 把 GPT 系列模型接到本地工作目录，适合需要快速验证脚本、补齐文档和探索仓库的工程师。',
    outputs: ['终端会话记录', '补丁化的文件改动', 'shell 命令清单'],
    safeguards: ['默认沙箱执行', '审阅模型建议的命令', '为敏感目录加白名单'],
    scores: [
      { label: '终端原生', value: 90 },
      { label: '模型选择', value: 86 },
      { label: '安全沙箱', value: 80 },
    ],
    iconName: 'TerminalSquare',
    defaultPrompt:
      '阅读当前仓库结构，为 README 补上"快速开始 / 目录说明 / 部署"三段内容。',
    status: 'beta',
    externalHref: 'https://github.com/openai/codex',
  },
  {
    slug: 'opencode',
    label: 'OpenCode',
    audience: '开源派 / 多模型切换者',
    goal: '在终端里组合多家模型与本地工具',
    command: 'opencode run "重构这段 Svelte 组件，让状态可扩展"',
    summary:
      'OpenCode 是开源的终端化 Agent，强调多模型适配与可插拔工具链，适合喜欢自定义工作流的开发者。',
    outputs: ['多模型对照建议', '可复用工具配置', '会话历史与回放'],
    safeguards: ['确认模型 API 出口', '为工具调用加速率限制', '区分本地/远程上下文'],
    scores: [
      { label: '模型适配', value: 88 },
      { label: '可扩展性', value: 90 },
      { label: '社区活跃', value: 84 },
    ],
    iconName: 'Boxes',
    defaultPrompt:
      '帮我用 Claude 与 GPT 两种模型，分别给出重构这段 Svelte 组件的方案对比。',
    status: 'beta',
    externalHref: 'https://opencode.ai',
  },
  {
    slug: 'harness-agent',
    label: 'Harness Agent',
    audience: 'DevOps / 平台工程团队',
    goal: '把 Agent 嵌进流水线与发布闭环',
    command: 'harness agent run "诊断最近一次失败的部署并提出修复建议"',
    summary:
      'Harness Agent 把 LLM 推理与 CI/CD、特性开关、监控告警串起来，适合把 Agent 当作平台能力提供给团队使用。',
    outputs: ['部署诊断报告', '回滚 / 修复建议', '可审计的执行轨迹'],
    safeguards: ['严格的权限矩阵', '关键步骤人工放行', '完整操作审计'],
    scores: [
      { label: '流水线集成', value: 88 },
      { label: '可审计性', value: 92 },
      { label: '团队协作', value: 85 },
    ],
    iconName: 'Workflow',
    defaultPrompt:
      '帮我诊断最近一次失败的部署，给出可能根因、修复步骤和回滚选项。',
    status: 'preview',
    externalHref: 'https://www.harness.io/products/ai-development-assistant',
  },
];

export const agentDomainsBySlug: Record<string, AgentDomain> = Object.fromEntries(
  agentDomains.map((domain) => [domain.slug, domain]),
);
