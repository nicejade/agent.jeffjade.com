/** Sitemap entry tuning for @astrojs/sitemap serialize(). */

export type SitemapEntry = {
  url: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  lastmod?: string;
};

export function shouldIncludeInSitemap(pageUrl: string): boolean {
  return !pageUrl.includes('/pagefind/') && !pageUrl.includes('/_astro/');
}

/** Apply priority and changefreq from URL path. `site` must match astro.config `site`. */
export function applySitemapPriority(item: SitemapEntry, site: string): SitemapEntry {
  const { url } = item;
  const entry = { ...item, lastmod: item.lastmod ?? new Date().toISOString() };

  if (url === `${site}/`) {
    entry.priority = 1;
    entry.changefreq = 'weekly';
  } else if (url === `${site}/claude-code/` || url === `${site}/hermes-agent/`) {
    entry.priority = 0.9;
    entry.changefreq = 'weekly';
  } else if (url.startsWith(`${site}/claude-code/`) || url.startsWith(`${site}/hermes-agent/`)) {
    entry.priority = 0.8;
    entry.changefreq = 'monthly';
  } else {
    entry.priority = entry.priority ?? 0.6;
    entry.changefreq = entry.changefreq ?? 'monthly';
  }

  return entry;
}
