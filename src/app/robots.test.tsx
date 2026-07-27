import { describe, expect, it } from 'vitest';
import robots from '@/app/robots';

describe('robots metadata route', () => {
  it('allows production crawling without advertising a missing sitemap', () => {
    const metadata = robots();

    expect(metadata).toEqual({
      rules: {
        userAgent: '*',
        allow: '/'
      }
    });
    expect(metadata).not.toHaveProperty('sitemap');
  });
});
