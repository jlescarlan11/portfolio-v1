import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import { getProjectSlugs } from '@/features/projects';
import { PRODUCTION_SITE_URL } from '@/shared/site/config';

describe('sitemap metadata route', () => {
  it('lists the homepage and every project exactly once', () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toEqual([
      PRODUCTION_SITE_URL,
      ...getProjectSlugs().map(
        (slug) => `${PRODUCTION_SITE_URL}/projects/${slug}`
      )
    ]);
    expect(new Set(urls).size).toBe(urls.length);
  });
});
