import { describe, expect, it } from 'vitest';
import {
  PRODUCTION_SITE_URL,
  resolveSiteUrl,
  siteConfig
} from '@/shared/site/config';

describe('resolveSiteUrl', () => {
  it('uses the production fallback when the environment value is missing or malformed', () => {
    expect(resolveSiteUrl()).toBe(PRODUCTION_SITE_URL);
    expect(resolveSiteUrl('')).toBe(PRODUCTION_SITE_URL);
    expect(resolveSiteUrl('not a URL')).toBe(PRODUCTION_SITE_URL);
  });

  it('normalizes a valid HTTPS URL to a slash-free origin', () => {
    expect(
      resolveSiteUrl('  https://portfolio.example.com/path/?preview=1#work  ')
    ).toBe('https://portfolio.example.com');
    expect(resolveSiteUrl('https://portfolio.example.com./work')).toBe(
      'https://portfolio.example.com'
    );
  });

  it.each([
    'ftp://johnlesterescarlan.pro',
    'http://portfolio.example.com:8080',
    'https://user:password@johnlesterescarlan.pro',
    'http://localhost:3000',
    'https://localhost.',
    'http://127.0.0.1:3000',
    'http://[::1]:3000',
    'https://10.0.0.8',
    'https://[fd00::8]',
    'https://johnlester.vercel.app',
    'https://portfolio-git-feature-team.vercel.app',
    'https://portfolio.netlify.app',
    'https://deploy-preview-15--portfolio.netlify.app',
    'https://feature-seo--portfolio.netlify.app'
  ])('rejects unsafe canonical origin %s', (value) => {
    expect(resolveSiteUrl(value)).toBe(PRODUCTION_SITE_URL);
  });
});

describe('siteConfig SEO defaults', () => {
  it('exports the approved production copy and square portrait metadata', () => {
    expect(siteConfig.seo).toMatchObject({
      siteTitle: 'John Lester Escarlan | Full-Stack Software Engineer',
      description:
        'Portfolio of John Lester Escarlan, a full-stack software engineer building reliable web products, marketplaces, and AI automation workflows.',
      siteName: 'John Lester Escarlan',
      siteUrl: PRODUCTION_SITE_URL,
      socialImage: {
        path: '/hero-image.jpg',
        width: 1080,
        height: 1080,
        alt: 'Portrait of John Lester Escarlan'
      }
    });
  });
});
