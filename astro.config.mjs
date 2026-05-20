import { defineConfig, passthroughImageService } from 'astro/config';
import starlight from '@astrojs/starlight';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import starlightThemeRapide from 'starlight-theme-rapide';
import { claudeCodeSidebar } from './src/config/claude-code-sidebar.ts';
import { hermesAgentSidebar } from './src/config/hermes-agent-sidebar.ts';
import { tableWrapIntegration } from './src/integrations/table-wrap.ts';

const site = 'https://agent.jeffjade.com';
const gaId = 'G-JXTFG9M3EK';

const claudeCodeGuideSlugs = [
  'what-is-claude-code',
  'core-advantages',
  'installation-setup',
  'third-party-api',
  'first-session',
  'slash-commands',
  'agent-loop',
  'plan-mode',
  'claude-md',
  'hooks',
  'skills',
  'subagents',
  'context-management',
  'mcp',
  'prompt-engineering',
  'complete-workflow',
  'ecosystem-integration',
  'limitations',
  'reflection',
  'debug-error-recovery',
  'token-economics',
  'security-permissions',
  'tdd-quality',
  'team-organization',
  'mental-model-migration',
];

const claudeCodeLegacyNumberedRedirects = {
  '/claude-code/01-what-is-claude-code': '/claude-code-guide/what-is-claude-code',
  '/claude-code/02-core-advantages': '/claude-code-guide/core-advantages',
  '/claude-code/03-installation-setup': '/claude-code-guide/installation-setup',
  '/claude-code/04-first-session': '/claude-code-guide/first-session',
  '/claude-code/05-agent-loop': '/claude-code-guide/agent-loop',
  '/claude-code/06-plan-mode': '/claude-code-guide/plan-mode',
  '/claude-code/07-claude-md': '/claude-code-guide/claude-md',
  '/claude-code/08-hooks': '/claude-code-guide/hooks',
  '/claude-code/09-skills': '/claude-code-guide/skills',
  '/claude-code/10-subagents': '/claude-code-guide/subagents',
  '/claude-code/11-context-management': '/claude-code-guide/context-management',
  '/claude-code/11-mcp': '/claude-code-guide/mcp',
  '/claude-code/12-prompt-engineering': '/claude-code-guide/prompt-engineering',
  '/claude-code/13-complete-workflow': '/claude-code-guide/complete-workflow',
  '/claude-code/14-ecosystem-integration': '/claude-code-guide/ecosystem-integration',
  '/claude-code/15-limitations': '/claude-code-guide/limitations',
  '/claude-code/16-reflection': '/claude-code-guide/reflection',
};

const claudeCodeSlugRedirects = Object.fromEntries(
  claudeCodeGuideSlugs.map((slug) => [
    `/claude-code/${slug}/`,
    `/claude-code-guide/${slug}/`,
  ]),
);

const claudeCodeRedirects = {
  ...claudeCodeLegacyNumberedRedirects,
  ...claudeCodeSlugRedirects,
};

const hermesAgentGuideSlugs = [
  'what-is-hermes-agent',
  'installation-setup',
  'first-conversation',
  'memory-learning-skills',
];

const hermesAgentRedirects = Object.fromEntries([
  ['/hermes-agent-guide/', '/hermes-agent/'],
  ...hermesAgentGuideSlugs.map((slug) => [
    `/hermes-agent-guide/${slug}/`,
    `/hermes-agent/${slug}/`,
  ]),
]);

export default defineConfig({
  site,
  image: {
    service: passthroughImageService(),
  },
  redirects: { ...claudeCodeRedirects, ...hermesAgentRedirects },
  integrations: [
    svelte(),
    starlight({
      plugins: [starlightThemeRapide()],
      title: '智能体漫游',
      description:
        '智能体漫游：快速掌握 Claude Code 等主流 AI Agent 的实用教程、案例与最新实践。',
      favicon: '/favicon.svg',
      titleDelimiter: '·',
      lastUpdated: false,
      locales: {
        root: {
          label: '简体中文',
          lang: 'zh-CN',
        },
      },
      social: [
        { icon: 'external', label: '晚晴幽草轩', href: 'https://www.jeffjade.com/' },
				{ icon: 'mastodon', label: 'Mastodon', href: 'https://mastodon.social/@nicejade' },
				{ icon: 'telegram', label: 'Telegram', href: 'https://t.me/nicejade' },
				{ icon: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@MarshalXuan' },
				{ icon: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/nice.jade.yang' },
				{ icon: 'x.com', label: 'X', href: 'https://x.com/MarshalXuan' },
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/nicejade/agent.jeffjade.com' },
      ],
      components: {
				Footer: './src/components/Footer.astro',
      },
      customCss: ['./src/styles/global.css'],
      sidebar: [...claudeCodeSidebar, ...hermesAgentSidebar],
      head: [
        {
          tag: 'meta',
          attrs: { name: 'theme-color', content: '#f5f5f7' },
        },
        {
          tag: 'meta',
          attrs: { property: 'og:image', content: `${site}/og.svg` },
        },
        {
          tag: 'meta',
          attrs: { name: 'twitter:card', content: 'summary_large_image' },
        },
        {
          tag: 'link',
          attrs: { rel: 'manifest', href: '/site.webmanifest' },
        },
        {
          tag: 'script',
          attrs: {
            async: true,
            src: `https://www.googletagmanager.com/gtag/js?id=${gaId}`,
          },
        },
        {
          tag: 'script',
          content: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${gaId}');`,
        },
      ],
    }),
    tableWrapIntegration(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
