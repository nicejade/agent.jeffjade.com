import { defineConfig, passthroughImageService } from 'astro/config';
import starlight from '@astrojs/starlight';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import starlightThemeRapide from 'starlight-theme-rapide';
import { claudeCodeSidebar } from './src/config/claude-code-sidebar.ts';
import { hermesAgentSidebar } from './src/config/hermes-agent-sidebar.ts';
import { applySitemapPriority, shouldIncludeInSitemap } from './src/config/sitemap-priority.ts';
import {
  globalSeoHead,
  GA_ID,
  OG_IMAGE,
  ROBOTS_CONTENT,
  SITE_DEFAULT_DESCRIPTION,
  SITE_URL,
} from './src/config/site-seo.ts';
import { tableWrapIntegration } from './src/integrations/table-wrap.ts';

const site = SITE_URL;

const claudeCodeSlugs = [
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

const claudeCodeGuideLegacyRedirects = {
  '/claude-code-guide/': '/claude-code/',
  ...Object.fromEntries(
    claudeCodeSlugs.map((slug) => [`/claude-code-guide/${slug}/`, `/claude-code/${slug}/`]),
  ),
};

const claudeCodeRedirects = claudeCodeGuideLegacyRedirects;

const hermesAgentGuideSlugs = [
  'what-is-hermes-agent',
  'installation-setup',
  'first-conversation',
  'memory-learning-skills',
  'configuration-personalization',
  'tools-system',
  'messaging-gateway',
  'skills-in-practice',
  'advanced-features',
  'security-performance-best-practices',
  'architecture-deep-dive',
  'build-your-own-agent',
  'contributing-and-community',
  'series-summary-and-self-test',
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
  trailingSlash: 'always',
  image: {
    service: passthroughImageService(),
  },
  redirects: { ...claudeCodeRedirects, ...hermesAgentRedirects },
  sitemap: {
    filter: (page) => shouldIncludeInSitemap(page),
    serialize: (item) => applySitemapPriority({ ...item }, site),
  },
  integrations: [
    svelte(),
    starlight({
      plugins: [starlightThemeRapide()],
      title: '智能体漫游',
      description: SITE_DEFAULT_DESCRIPTION,
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
        Head: './src/components/starlight/Head.astro',
        Footer: './src/components/Footer.astro',
        Sidebar: './src/components/Sidebar.astro',
      },
      customCss: ['./src/styles/global.css'],
      sidebar: [...claudeCodeSidebar, ...hermesAgentSidebar],
      head: [
        {
          tag: 'meta',
          attrs: { name: 'robots', content: ROBOTS_CONTENT },
        },
        {
          tag: 'meta',
          attrs: { name: 'theme-color', content: '#f5f5f7' },
        },
        {
          tag: 'meta',
          attrs: { property: 'og:image', content: OG_IMAGE },
        },
        {
          tag: 'meta',
          attrs: { name: 'twitter:card', content: 'summary_large_image' },
        },
        {
          tag: 'link',
          attrs: { rel: 'manifest', href: '/site.webmanifest' },
        },
        ...globalSeoHead,
        {
          tag: 'script',
          attrs: {
            async: true,
            src: `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`,
          },
        },
        {
          tag: 'script',
          content: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA_ID}');`,
        },
      ],
    }),
    tableWrapIntegration(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
