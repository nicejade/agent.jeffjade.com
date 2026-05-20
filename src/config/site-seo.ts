/** Canonical site URL and shared SEO constants (no page body copy). */
export const SITE_URL = 'https://agent.jeffjade.com';
export const SITE_NAME = '智能体漫游';
export const SITE_DEFAULT_DESCRIPTION =
  '智能体漫游：快速掌握 Claude Code、Hermes Agent 等主流 AI Agent 的实用教程、案例与最新实践。';
export const OG_IMAGE = `${SITE_URL}/og.svg`;
export const OG_IMAGE_ALT = SITE_NAME;
export const TWITTER_SITE = '@MarshalXuan';
export const GA_ID = 'G-JXTFG9M3EK';
export const LLMS_TXT_URL = `${SITE_URL}/llms.txt`;
export const SITEMAP_INDEX = '/sitemap-index.xml';

export const ROBOTS_CONTENT =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

type HeadEntry = {
  tag: 'meta' | 'link';
  attrs: Record<string, string>;
  content?: string;
};

/** Page-specific Twitter title and description (Starlight pages use Head.astro). */
export function twitterMetaHead(title: string, description: string): HeadEntry[] {
  return [
    { tag: 'meta', attrs: { name: 'twitter:title', content: title } },
    { tag: 'meta', attrs: { name: 'twitter:description', content: description } },
  ];
}

/** Extra <head> entries merged into Starlight global head and custom landing pages. */
export const globalSeoHead: HeadEntry[] = [
  {
    tag: 'meta',
    attrs: { property: 'og:locale', content: 'zh-CN' },
  },
  {
    tag: 'meta',
    attrs: { property: 'og:site_name', content: SITE_NAME },
  },
  {
    tag: 'meta',
    attrs: { property: 'og:image:width', content: '1200' },
  },
  {
    tag: 'meta',
    attrs: { property: 'og:image:height', content: '630' },
  },
  {
    tag: 'meta',
    attrs: { property: 'og:image:type', content: 'image/svg+xml' },
  },
  {
    tag: 'meta',
    attrs: { property: 'og:image:alt', content: OG_IMAGE_ALT },
  },
  {
    tag: 'meta',
    attrs: { name: 'twitter:site', content: TWITTER_SITE },
  },
  {
    tag: 'meta',
    attrs: { name: 'twitter:image', content: OG_IMAGE },
  },
  {
    tag: 'meta',
    attrs: { name: 'twitter:image:alt', content: OG_IMAGE_ALT },
  },
  {
    tag: 'link',
    attrs: { rel: 'sitemap', href: SITEMAP_INDEX },
  },
  {
    tag: 'link',
    attrs: {
      rel: 'alternate',
      type: 'text/plain',
      href: '/llms.txt',
      title: 'LLMs',
    },
  },
];
