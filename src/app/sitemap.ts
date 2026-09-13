import type { MetadataRoute } from 'next';
import { getProjectSlugs } from '@/features/projects';
import { siteConfig } from '@/shared/site/config';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.seo.siteUrl,
      changeFrequency: 'monthly',
      priority: 1
    },
    {
      url: `${siteConfig.seo.siteUrl}/projects`,
      changeFrequency: 'monthly',
      priority: 0.9
    },
    ...['experience', 'stack', 'certifications'].map(path => ({
      url: `${siteConfig.seo.siteUrl}/${path}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7
    })),
    ...getProjectSlugs().map((slug) => ({
      url: `${siteConfig.seo.siteUrl}/projects/${slug}`,
      changeFrequency: 'yearly' as const,
      priority: 0.8
    }))
  ];
}
