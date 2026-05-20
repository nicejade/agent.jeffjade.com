import type { StarlightRouteData } from '@astrojs/starlight/route-data';
import { SITE_NAME, SITE_URL } from '../config/site-seo';

type JsonLd = Record<string, unknown>;

const TRACK_LABELS: Record<string, string> = {
  'claude-code': 'Claude Code',
  'hermes-agent': 'Hermes Agent',
};

export function canonicalFromHead(head: StarlightRouteData['head']): string | undefined {
  const link = head.find(
    (entry) => entry.tag === 'link' && entry.attrs?.rel === 'canonical' && entry.attrs.href,
  );
  return typeof link?.attrs?.href === 'string' ? link.attrs.href : undefined;
}

export function buildWebSiteSchema(description: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'zh-CN',
    description,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    about: [
      { '@type': 'Thing', name: 'Claude Code', url: `${SITE_URL}/claude-code/` },
      { '@type': 'Thing', name: 'Hermes Agent', url: `${SITE_URL}/hermes-agent/` },
    ],
  };
}

export function buildCollectionPageSchema(input: {
  name: string;
  url: string;
  description: string;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.name,
    url: input.url,
    description: input.description,
    inLanguage: 'zh-CN',
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function buildWebPageSchema(input: {
  name: string;
  url: string;
  description: string;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: input.name,
    url: input.url,
    inLanguage: 'zh-CN',
    description: input.description,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function buildTechArticleSchema(route: StarlightRouteData, canonical: string): JsonLd {
  const description = route.entry.data.description;
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: route.entry.data.title,
    description,
    url: canonical,
    inLanguage: route.lang,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical,
    },
  };
}

export function buildBreadcrumbSchema(route: StarlightRouteData, canonical: string): JsonLd {
  const segments = route.id.split('/').filter(Boolean);
  const items: Array<{ '@type': 'ListItem'; position: number; name: string; item?: string }> = [
    {
      '@type': 'ListItem',
      position: 1,
      name: SITE_NAME,
      item: `${SITE_URL}/`,
    },
  ];

  if (segments.length > 0) {
    const track = segments[0];
    const trackLabel = TRACK_LABELS[track] ?? track;
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: trackLabel,
      item: `${SITE_URL}/${track}/`,
    });
  }

  if (segments.length > 1 || route.id.endsWith('/index')) {
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: route.entry.data.title,
      item: canonical,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

export function buildArticleGraph(route: StarlightRouteData, canonical: string): JsonLd[] {
  return [buildTechArticleSchema(route, canonical), buildBreadcrumbSchema(route, canonical)];
}
