import { describe, expect, it } from 'vitest';
import { createNextConfig } from '../../../next.config';
import {
  getIndexingHeaderRules,
  NOINDEX_DIRECTIVE,
  shouldPreventIndexing
} from '@/shared/seo/indexing-policy';

describe('shouldPreventIndexing', () => {
  it.each(['deploy-preview', 'branch-deploy'])(
    'prevents indexing in the %s Netlify context',
    (context) => {
      expect(shouldPreventIndexing(context)).toBe(true);
    }
  );

  it.each(['production', 'dev', undefined, '', '   '])(
    'keeps the %s context indexable',
    (context) => {
      expect(shouldPreventIndexing(context)).toBe(false);
    }
  );

  it('fails closed for an unknown context', () => {
    expect(shouldPreventIndexing('future-preview-context')).toBe(true);
  });
});

describe('getIndexingHeaderRules', () => {
  it('returns the noindex header for preview document responses', () => {
    expect(getIndexingHeaderRules('deploy-preview')).toEqual([
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: NOINDEX_DIRECTIVE
          }
        ]
      }
    ]);
  });

  it('returns no indexing override for production', () => {
    expect(getIndexingHeaderRules('production')).toEqual([]);
  });
});

describe('next.config crawler and redirect wiring', () => {
  it('applies baseline security headers to production responses', async () => {
    await expect(createNextConfig('production').headers?.()).resolves.toContainEqual({
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "base-uri 'self'; frame-ancestors 'none'; object-src 'none'"
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), geolocation=(), microphone=()'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        }
      ]
    });
  });

  it('wires preview indexing headers into Next.js configuration', async () => {
    const rules = await createNextConfig('branch-deploy').headers?.();

    expect(rules).toHaveLength(1);
    expect(rules?.[0].headers).toContainEqual(
      getIndexingHeaderRules('branch-deploy')[0].headers[0]
    );
  });

  it('preserves the existing resume redirect unchanged', async () => {
    await expect(createNextConfig('production').redirects?.()).resolves.toEqual([
      {
        source: '/project/John_Lester_Escarlan_Resume.pdf',
        destination: '/John_Lester_Escarlan_Resume.pdf',
        permanent: true
      }
    ]);
  });
});
