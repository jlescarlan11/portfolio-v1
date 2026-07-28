import { heroContent, type HeroContent } from '@/features/home/content';
import { isRenderableExternalUrl } from '@/shared/lib/project';
import { siteConfig } from '@/shared/site/config';

interface PersonSchema {
  '@type': 'Person';
  name: string;
  url: string;
  jobTitle: string;
  sameAs: string[];
}

export interface ProfilePageSchema {
  '@context': 'https://schema.org';
  '@type': 'ProfilePage';
  url: string;
  mainEntity: PersonSchema;
}

const CONFIRMED_PROFILE_PLATFORMS = new Set(['GitHub', 'LinkedIn']);

export function createProfilePageSchema(
  content: HeroContent = heroContent
): ProfilePageSchema {
  const homepageUrl = new URL('/', siteConfig.seo.siteUrl).toString();
  const sameAs = content.socialLinks
    .filter(
      ({ platform, url }) =>
        CONFIRMED_PROFILE_PLATFORMS.has(platform) &&
        isRenderableExternalUrl(url)
    )
    .map(({ url }) => url.trim());

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: homepageUrl,
    mainEntity: {
      '@type': 'Person',
      name: content.name,
      url: homepageUrl,
      jobTitle: content.role,
      sameAs
    }
  };
}

export function serializeJsonLd(value: unknown): string {
  const serialized = JSON.stringify(value);

  if (serialized === undefined) {
    throw new TypeError('JSON-LD value must be JSON-serializable.');
  }

  return serialized.replace(/</g, '\\u003c');
}
