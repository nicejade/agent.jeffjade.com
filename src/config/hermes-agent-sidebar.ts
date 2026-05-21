/** Sidebar for Hermes Agent guide — merged in astro.config with Claude Code guide. */
export const hermesAgentSidebar = [
  {
    label: 'Hermes Agent · 入门',
    items: [
      { label: 'Hermes Agent 漫游指南', link: '/hermes-agent/' },
      { label: '认识 Hermes Agent', link: '/hermes-agent/what-is-hermes-agent/' },
      { label: '安装与环境准备', link: '/hermes-agent/installation-setup/' },
      { label: '第一次对话', link: '/hermes-agent/first-conversation/' },
    ],
  },
  {
    label: 'Hermes Agent · 核心机制',
    items: [
      { label: '记忆、学习与 Skill', link: '/hermes-agent/memory-learning-skills/' },
      { label: '配置与个性化', link: '/hermes-agent/configuration-personalization/' },
      { label: '工具系统', link: '/hermes-agent/tools-system/' },
    ],
  },
  {
    label: 'Hermes Agent · 实战',
    items: [
      { label: '消息网关', link: '/hermes-agent/messaging-gateway/' },
      { label: '技能系统实战', link: '/hermes-agent/skills-in-practice/' },
      { label: '事件钩子（Event Hooks）', link: '/hermes-agent/event-hooks/' },
      { label: 'Kanban 多 Agent 看板', link: '/hermes-agent/kanban-multi-agent-board/' },
      { label: '高级特性', link: '/hermes-agent/advanced-features/' },
    ],
  },
  {
    label: 'Hermes Agent · 进阶',
    items: [
      { label: '安全、性能与最佳实践', link: '/hermes-agent/security-performance-best-practices/' },
      { label: '插件系统（Plugins）', link: '/hermes-agent/plugins-system/' },
      { label: '架构拆解', link: '/hermes-agent/architecture-deep-dive/' },
      { label: '从零实现类似 Agent', link: '/hermes-agent/build-your-own-agent/' },
      { label: '贡献与社区', link: '/hermes-agent/contributing-and-community/' },
      { label: '系列总结与自测', link: '/hermes-agent/series-summary-and-self-test/' },
    ],
  },
];
