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
  it('wires preview headers into Next.js configuration', async () => {
    await expect(createNextConfig('branch-deploy').headers?.()).resolves.toEqual(
      getIndexingHeaderRules('branch-deploy')
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
