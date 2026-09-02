import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  hasOnlyCanonicalSitemapLocations,
  isCanonicalHttpsRootRedirect,
  isCanonicalRedirect
} from './verification-url.mjs';

const sourceUrl = 'http://johnlesterescarlan.pro/';
const canonicalOrigin = 'https://johnlesterescarlan.pro';

describe('isCanonicalHttpsRootRedirect', () => {
  it('accepts only the exact canonical HTTPS root', () => {
    assert.equal(
      isCanonicalHttpsRootRedirect(
        'https://johnlesterescarlan.pro/',
        sourceUrl,
        canonicalOrigin
      ),
      true
    );
  });

  it('rejects missing, non-string, relative, and noncanonical destinations', () => {
    for (const destination of [
      undefined,
      null,
      ['https://johnlesterescarlan.pro/'],
      '/',
      'https://user@johnlesterescarlan.pro/',
      'https://user:pass@johnlesterescarlan.pro/',
      'https://johnlesterescarlan.pro/other',
      'https://johnlesterescarlan.pro/?source=http',
      'https://example.com/'
    ]) {
      assert.equal(
        isCanonicalHttpsRootRedirect(destination, sourceUrl, canonicalOrigin),
        false
      );
    }
  });

  it('requires legacy redirects to stay on the canonical origin and path', () => {
    const legacyPath = '/John_Lester_Escarlan_Resume.pdf';
    assert.equal(
      isCanonicalRedirect(
        `https://johnlesterescarlan.pro${legacyPath}`,
        'https://johnlesterescarlan.pro/project/old.pdf',
        canonicalOrigin,
        legacyPath
      ),
      true
    );
    assert.equal(
      isCanonicalRedirect(
        `https://evil.example${legacyPath}`,
        'https://johnlesterescarlan.pro/project/old.pdf',
        canonicalOrigin,
        legacyPath
      ),
      false
    );
  });

  it('accepts same-origin legacy redirects on a checked Preview', () => {
    const previewOrigin = 'https://portfolio-preview.vercel.app';
    const legacyPath = '/John_Lester_Escarlan_Resume.pdf';
    const previewSource = `${previewOrigin}/project/old.pdf`;

    for (const destination of [
      legacyPath,
      `${previewOrigin}${legacyPath}`
    ]) {
      assert.equal(
        isCanonicalRedirect(
          destination,
          previewSource,
          previewOrigin,
          legacyPath
        ),
        true
      );
    }
  });

  it('requires every sitemap location to use the canonical origin', () => {
    assert.equal(
      hasOnlyCanonicalSitemapLocations(
        `<urlset><url><loc>${canonicalOrigin}/</loc></url><url><loc>${canonicalOrigin}/projects/health</loc></url></urlset>`,
        canonicalOrigin
      ),
      true
    );
    assert.equal(
      hasOnlyCanonicalSitemapLocations(
        `<urlset><url><loc>${canonicalOrigin}/</loc></url><url><loc>https://evil.example/</loc></url></urlset>`,
        canonicalOrigin
      ),
      false
    );
    assert.equal(
      hasOnlyCanonicalSitemapLocations('<urlset />', canonicalOrigin),
      false
    );
  });
});
