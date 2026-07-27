import type { Metadata } from 'next';
import { siteConfig } from '@/shared/site/config';

const metadataBase = new URL(siteConfig.seo.siteUrl);
const homepageUrl = new URL('/', metadataBase);
const socialImageUrl = new URL(siteConfig.seo.socialImage.path, metadataBase);

export const homepageMetadata: Metadata = {
  title: {
    default: siteConfig.seo.siteTitle,
    template: `%s | ${siteConfig.seo.titleTemplateName}`
  },
  description: siteConfig.seo.description,
  metadataBase,
  alternates: {
    canonical: homepageUrl
  },
  openGraph: {
    title: siteConfig.seo.siteTitle,
    description: siteConfig.seo.description,
    url: homepageUrl,
    siteName: siteConfig.seo.siteName,
    images: [
      {
        url: socialImageUrl,
        width: siteConfig.seo.socialImage.width,
        height: siteConfig.seo.socialImage.height,
        alt: siteConfig.seo.socialImage.alt
      }
    ],
    locale: siteConfig.seo.locale,
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.seo.siteTitle,
    description: siteConfig.seo.description,
    images: [
      {
        url: socialImageUrl,
        width: siteConfig.seo.socialImage.width,
        height: siteConfig.seo.socialImage.height,
        alt: siteConfig.seo.socialImage.alt
      }
    ]
  }
};
