/** Sidebar for Claude Code guide — used in astro.config and route middleware. */
export const claudeCodeSidebar = [
  {
    label: '第零部分 · 漫游前瞻',
    items: [{ label: 'Claude Code 漫游指南', link: '/claude-code-guide/' }],
  },
  {
    label: '第一部分 · 基础认知',
    items: [
      { label: 'Claude Code 是什么', link: '/claude-code-guide/what-is-claude-code/' },
      { label: '10 倍提升效率', link: '/claude-code-guide/core-advantages/' },
    ],
  },
  {
    label: '第二部分 · 快速上手',
    items: [
      { label: '安装与配置', link: '/claude-code-guide/installation-setup/' },
      { label: '基于第三方 API', link: '/claude-code-guide/third-party-api/' },
      { label: '第一个会话', link: '/claude-code-guide/first-session/' },
      { label: 'Slash 命令', link: '/claude-code-guide/slash-commands/' },
    ],
  },
  {
    label: '第三部分 · 工作原理',
    items: [
      { label: '代理循环与工具', link: '/claude-code-guide/agent-loop/' },
      { label: 'Plan Mode', link: '/claude-code-guide/plan-mode/' },
    ],
  },
  {
    label: '第四部分 · 项目记忆',
    items: [{ label: 'CLAUDE.md 的艺术', link: '/claude-code-guide/claude-md/' }],
  },
  {
    label: '第五部分 · 高级扩展',
    items: [
      { label: 'Hooks 机制', link: '/claude-code-guide/hooks/' },
      { label: 'Skills 技能', link: '/claude-code-guide/skills/' },
      { label: 'SubAgents', link: '/claude-code-guide/subagents/' },
      { label: 'MCP 协议', link: '/claude-code-guide/mcp/' },
    ],
  },
  {
    label: '第六部分 · 实战与最佳实践',
    items: [
      { label: '提示工程秘诀', link: '/claude-code-guide/prompt-engineering/' },
      { label: '完整实战工作流', link: '/claude-code-guide/complete-workflow/' },
      { label: '上下文管理与多代理', link: '/claude-code-guide/context-management/' },
      { label: '生态深度集成', link: '/claude-code-guide/ecosystem-integration/' },
    ],
  },
  {
    label: '第七部分 · 反思与进阶',
    items: [
      { label: '局限性与应对', link: '/claude-code-guide/limitations/' },
      { label: 'AI 时代的开发者', link: '/claude-code-guide/reflection/' },
    ],
  },
];
