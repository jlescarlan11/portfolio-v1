import { MetadataRoute } from 'next';
import { siteConfig } from '@/shared/site/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/'
    },
    sitemap: `${siteConfig.seo.siteUrl}/sitemap.xml`
  };
}
