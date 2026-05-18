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
            {
              label: 'Claude Code 完全指南',
              link: '/claude-code/',
              collapsed: true,
              items: [
                { label: '1. Claude Code 是什么', link: '/claude-code/01-what-is-claude-code/' },
                { label: '2. 10 倍提升效率', link: '/claude-code/02-core-advantages/' },
                { label: '3. 安装与配置', link: '/claude-code/03-installation-setup/' },
                { label: '4. 第一个会话', link: '/claude-code/04-first-session/' },
                { label: '5. 代理循环与工具', link: '/claude-code/05-agent-loop/' },
                { label: '6. Plan Mode', link: '/claude-code/06-plan-mode/' },
                { label: '7. CLAUDE.md 的艺术', link: '/claude-code/07-claude-md/' },
                { label: '8. Hooks 机制', link: '/claude-code/08-hooks/' },
                { label: '9. Skills 技能', link: '/claude-code/09-skills/' },
                { label: '10. SubAgents', link: '/claude-code/10-subagents/' },
                { label: '11. MCP 万能接口', link: '/claude-code/11-mcp/' },
                { label: '12. 提示工程秘诀', link: '/claude-code/12-prompt-engineering/' },
                { label: '13. 完整实战工作流', link: '/claude-code/13-complete-workflow/' },
                { label: '14. 生态深度集成', link: '/claude-code/14-ecosystem-integration/' },
                { label: '15. 局限性与应对', link: '/claude-code/15-limitations/' },
                { label: '16. AI 时代的开发者', link: '/claude-code/16-reflection/' },
              ],
            },
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
