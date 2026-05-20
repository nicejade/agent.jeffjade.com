import type { APIRoute } from 'astro';
import { LLMS_TXT_URL, SITE_URL } from '../config/site-seo';

const AI_CRAWLERS = [
  'GPTBot',
  'ClaudeBot',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
  'anthropic-ai',
  'CCBot',
  'cohere-ai',
] as const;

function buildRobotsTxt(sitemapUrl: string): string {
  const aiBlocks = AI_CRAWLERS.map((agent) => `User-agent: ${agent}\nAllow: /`).join('\n\n');

  return `User-agent: *
Allow: /

Host: ${new URL(SITE_URL).host}
Sitemap: ${sitemapUrl}

# Machine-readable site summary for LLMs and agents
# ${LLMS_TXT_URL}

${aiBlocks}
`;
}

export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = new URL('sitemap-index.xml', site ?? SITE_URL).href;
  return new Response(buildRobotsTxt(sitemapUrl), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
