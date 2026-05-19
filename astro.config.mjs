import { defineConfig, passthroughImageService } from 'astro/config';
import starlight from '@astrojs/starlight';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import starlightThemeRapide from 'starlight-theme-rapide';
import { claudeCodeSidebar } from './src/config/claude-code-sidebar.ts';
import { tableWrapIntegration } from './src/integrations/table-wrap.ts';

const site = 'https://agent.jeffjade.com';
const gaId = 'G-JXTFG9M3EK';

const claudeCodeRedirects = {
  '/claude-code/01-what-is-claude-code': '/claude-code/what-is-claude-code',
  '/claude-code/02-core-advantages': '/claude-code/core-advantages',
  '/claude-code/03-installation-setup': '/claude-code/installation-setup',
  '/claude-code/04-first-session': '/claude-code/first-session',
  '/claude-code/05-agent-loop': '/claude-code/agent-loop',
  '/claude-code/06-plan-mode': '/claude-code/plan-mode',
  '/claude-code/07-claude-md': '/claude-code/claude-md',
  '/claude-code/08-hooks': '/claude-code/hooks',
  '/claude-code/09-skills': '/claude-code/skills',
  '/claude-code/10-subagents': '/claude-code/subagents',
  '/claude-code/11-context-management': '/claude-code/context-management',
  '/claude-code/11-mcp': '/claude-code/mcp',
  '/claude-code/12-prompt-engineering': '/claude-code/prompt-engineering',
  '/claude-code/13-complete-workflow': '/claude-code/complete-workflow',
  '/claude-code/14-ecosystem-integration': '/claude-code/ecosystem-integration',
  '/claude-code/15-limitations': '/claude-code/limitations',
  '/claude-code/16-reflection': '/claude-code/reflection',
};

export default defineConfig({
  site,
  image: {
    service: passthroughImageService(),
  },
  redirects: claudeCodeRedirects,
  integrations: [
    svelte(),
    starlight({
      plugins: [starlightThemeRapide()],
      title: '智能体漫游',
      description:
        '从基础认知到高级扩展，18 章系统掌握 Claude Code——高权限、本地上下文感知的 Agentic Coding 工具。',
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
      sidebar: claudeCodeSidebar,
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
