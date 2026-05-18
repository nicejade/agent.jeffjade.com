/**
 * Agent domain registry — currently scoped to Claude Code guide.
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
  slug: string;
  label: string;
  audience: string;
  goal: string;
  command: string;
  summary: string;
  outputs: string[];
  safeguards: string[];
  scores: Array<{ label: string; value: number }>;
  iconName: AgentDomainIcon;
  defaultPrompt: string;
  status: DomainStatus;
  href?: string;
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
    externalHref: 'https://code.claude.com/docs/en/overview',
  },
];

export const agentDomainsBySlug: Record<string, AgentDomain> = Object.fromEntries(
  agentDomains.map((domain) => [domain.slug, domain]),
);
