/** Sidebar for Claude Code guide — used in astro.config and route middleware. */
export const claudeCodeSidebar = [
  {
    label: '第零部分 · 漫游前瞻',
    items: [{ label: 'Claude Code 漫游指南', link: '/claude-code/' }],
  },
  {
    label: '第一部分 · 基础认知',
    items: [
      { label: 'Claude Code 是什么', link: '/claude-code/what-is-claude-code/' },
      { label: '10 倍提升效率', link: '/claude-code/core-advantages/' },
    ],
  },
  {
    label: '第二部分 · 快速上手',
    items: [
      { label: '安装与配置', link: '/claude-code/installation-setup/' },
      { label: '基于第三方 API', link: '/claude-code/third-party-api/' },
      { label: '配套工具精选', link: '/claude-code/companion-tools/' },
      { label: '第一个会话', link: '/claude-code/first-session/' },
      { label: 'Slash 命令', link: '/claude-code/slash-commands/' },
      { label: '多平台运行环境全览', link: '/claude-code/platforms-overview/' },
    ],
  },
  {
    label: '第三部分 · 工作原理',
    items: [
      { label: '代理循环与工具', link: '/claude-code/agent-loop/' },
      { label: 'Plan Mode', link: '/claude-code/plan-mode/' },
    ],
  },
  {
    label: '第四部分 · 项目记忆',
    items: [
      { label: '项目记忆总览', link: '/claude-code/claude-md/' },
      { label: 'CLAUDE.md 编写与维护', link: '/claude-code/claude-md-authoring/' },
      { label: '自动记忆与 /memory', link: '/claude-code/auto-memory/' },
      { label: 'Monorepo 与多工具记忆', link: '/claude-code/memory-monorepo-ecosystem/' },
      { label: '团队记忆落地', link: '/claude-code/memory-team-playbook/' },
    ],
  },
  {
    label: '第五部分 · 高级扩展',
    items: [
      { label: 'Hooks 机制', link: '/claude-code/hooks/' },
      { label: 'Skills 技能', link: '/claude-code/skills/' },
      { label: 'Plugins 插件', link: '/claude-code/plugins/' },
      { label: 'SubAgents', link: '/claude-code/subagents/' },
      { label: 'Agent Teams 与多会话协作', link: '/claude-code/agent-teams/' },
      { label: 'MCP 协议', link: '/claude-code/mcp/' },
    ],
  },
  {
    label: '第六部分 · Skill 体系',
    items: [
      { label: '编码向社区精选', link: '/claude-code/skill-recommendations/' },
      { label: '社区技能目录导读', link: '/claude-code/skill-catalog/' },
      { label: '团队 Skill 实战', link: '/claude-code/skills-team-playbook/' },
    ],
  },
  {
    label: '第七部分 · 实战与最佳实践',
    items: [
      { label: '提示工程秘诀', link: '/claude-code/prompt-engineering/' },
      { label: '完整实战工作流', link: '/claude-code/complete-workflow/' },
      { label: '上下文管理与多代理', link: '/claude-code/context-management/' },
      { label: '生态深度集成', link: '/claude-code/ecosystem-integration/' },
      { label: 'Agent SDK 程序化调用', link: '/claude-code/agent-sdk/' },
      { label: 'CI/CD 与代码审查集成', link: '/claude-code/ci-cd-integrations/' },
      { label: '远程会话与 Channels', link: '/claude-code/remote-sessions-channels/' },
      { label: 'Chrome 与 Web UI 测试', link: '/claude-code/chrome-browser-testing/' },
    ],
  },
  {
    label: '第八部分 · 反思与进阶',
    items: [
      { label: '局限性与应对', link: '/claude-code/limitations/' },
      { label: 'AI 时代的开发者', link: '/claude-code/reflection/' },
    ],
  },
  {
    label: '第九部分 · 进阶实践',
    items: [
      { label: '/goal 与跨轮持续目标', link: '/claude-code/goal-mode/' },
      { label: 'Routines 与定时自动化', link: '/claude-code/routines-automation/' },
      { label: '调试与错误恢复', link: '/claude-code/debug-error-recovery/' },
      { label: 'Token 成本与会话经济学', link: '/claude-code/token-economics/' },
      { label: '沙箱隔离机制', link: '/claude-code/sandboxing/' },
      { label: '安全边界与权限心智', link: '/claude-code/security-permissions/' },
      { label: '测试驱动与质量保障', link: '/claude-code/tdd-quality/' },
      { label: '团队与组织级落地', link: '/claude-code/team-organization/' },
      { label: '心智模型迁移', link: '/claude-code/mental-model-migration/' },
    ],
  },
  {
    label: '第十部分 · 排障速查',
    items: [
      { label: 'CLI 与配置查阅', link: '/claude-code/cli-and-settings-reference/' },
      { label: '常见问题排查', link: '/claude-code/troubleshooting-faq/' },
    ],
  },
];
