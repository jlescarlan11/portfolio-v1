import { describe, expect, it } from 'vitest';
import { homepageMetadata } from '@/shared/seo/homepage-metadata';
import { PRODUCTION_SITE_URL, siteConfig } from '@/shared/site/config';

const CANONICAL_URL = `${PRODUCTION_SITE_URL}/`;

describe('homepageMetadata', () => {
  it('uses the approved title, description, and canonical URL', () => {
    expect(homepageMetadata.title).toEqual({
      default: siteConfig.seo.siteTitle,
      template: `%s | ${siteConfig.seo.titleTemplateName}`
    });
    expect(homepageMetadata.description).toBe(siteConfig.seo.description);
    expect(homepageMetadata.metadataBase?.toString()).toBe(CANONICAL_URL);
    expect(homepageMetadata.alternates?.canonical?.toString()).toBe(
      CANONICAL_URL
    );
  });

  it('keeps Open Graph metadata consistent with the canonical homepage', () => {
    expect(homepageMetadata.openGraph).toMatchObject({
      title: siteConfig.seo.siteTitle,
      description: siteConfig.seo.description,
      url: new URL(CANONICAL_URL),
      siteName: siteConfig.seo.siteName,
      locale: siteConfig.seo.locale,
      type: 'website',
      images: [
        {
          url: new URL(`${PRODUCTION_SITE_URL}/hero-image.jpg`),
          width: 1080,
          height: 1080,
          alt: 'Portrait of John Lester Escarlan'
        }
      ]
    });
  });

  it('keeps Twitter metadata and its image consistent with Open Graph', () => {
    expect(homepageMetadata.twitter).toMatchObject({
      card: 'summary_large_image',
      title: siteConfig.seo.siteTitle,
      description: siteConfig.seo.description,
      images: [
        {
          url: new URL(`${PRODUCTION_SITE_URL}/hero-image.jpg`),
          width: 1080,
          height: 1080,
          alt: 'Portrait of John Lester Escarlan'
        }
      ]
    });
  });
});
