import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

const site = 'https://agent.jeffjade.com';
const gaId = 'G-JXTFG9M3EK';

export default defineConfig({
  site,
  integrations: [
    svelte(),
    starlight({
      title: '智能体漫游',
      description:
        '面向工程师、创造者与普通人的 Agent 实践地图，探索 Claude Code、hermes-agent、工作流设计、SEO 与 AEO。',
      favicon: '/favicon.svg',
      titleDelimiter: '·',
      lastUpdated: false,
      locales: {
        root: {
          label: '简体中文',
          lang: 'zh-CN',
        },
      },
      customCss: ['./src/styles/global.css'],
      sidebar: [
        {
          label: '探索起点',
          items: [
            { label: '为什么 Agent', link: '/get-started/' },
            { label: '普通人的入口', link: '/playbooks/non-engineers/' },
          ],
        },
        {
          label: '工具图谱',
          items: [
            { label: 'Claude Code', link: '/claude-code/' },
            { label: 'hermes-agent', link: '/hermes-agent/' },
          ],
        },
        {
          label: '方法与增长',
          items: [
            { label: 'Agent OS 模式', link: '/patterns/agent-os/' },
            { label: 'SEO 与 AEO', link: '/seo-aeo/' },
          ],
        },
      ],
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
          content: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`,
        },
      ],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
