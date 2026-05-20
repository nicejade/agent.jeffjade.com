/** Canonical site URL and shared SEO constants (no page body copy). */
export const SITE_URL = 'https://agent.jeffjade.com';
export const SITE_NAME = '智能体漫游';
export const OG_IMAGE = `${SITE_URL}/og.svg`;
export const OG_IMAGE_ALT = SITE_NAME;
export const TWITTER_SITE = '@MarshalXuan';
export const GA_ID = 'G-JXTFG9M3EK';
export const LLMS_TXT_URL = `${SITE_URL}/llms.txt`;

/** Extra <head> entries merged into Starlight global head. */
export const globalSeoHead = [
  {
    tag: 'meta' as const,
    attrs: { property: 'og:image:width', content: '1200' },
  },
  {
    tag: 'meta' as const,
    attrs: { property: 'og:image:height', content: '630' },
  },
  {
    tag: 'meta' as const,
    attrs: { property: 'og:image:type', content: 'image/svg+xml' },
  },
  {
    tag: 'meta' as const,
    attrs: { property: 'og:image:alt', content: OG_IMAGE_ALT },
  },
  {
    tag: 'meta' as const,
    attrs: { name: 'twitter:site', content: TWITTER_SITE },
  },
  {
    tag: 'meta' as const,
    attrs: { name: 'twitter:image', content: OG_IMAGE },
  },
  {
    tag: 'meta' as const,
    attrs: { name: 'twitter:image:alt', content: OG_IMAGE_ALT },
  },
  {
    tag: 'link' as const,
    attrs: {
      rel: 'alternate',
      type: 'text/plain',
      href: '/llms.txt',
      title: 'LLMs',
    },
  },
];
