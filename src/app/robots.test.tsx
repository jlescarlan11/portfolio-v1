import { describe, expect, it } from 'vitest';
import robots from '@/app/robots';
import { PRODUCTION_SITE_URL } from '@/shared/site/config';

describe('robots metadata route', () => {
  it('allows production crawling and advertises the sitemap', () => {
    const metadata = robots();

    expect(metadata).toEqual({
      rules: {
        userAgent: '*',
        allow: '/'
      },
      sitemap: `${PRODUCTION_SITE_URL}/sitemap.xml`
    });
  });
});
