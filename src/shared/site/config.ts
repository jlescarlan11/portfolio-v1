export interface NavItem {
  name: string;
  href: string;
}

export interface SeoConfig {
  siteTitle: string;
  titleTemplateName: string;
  description: string;
  siteName: string;
  siteUrl: string;
  locale: string;
  socialImage: {
    path: string;
    width: number;
    height: number;
    alt: string;
  };
}

export interface OverlayContent {
  title: string;
  eyebrow: string;
  loadingLabel: string;
  progressLabel: string;
}

export const PRODUCTION_SITE_URL = 'https://johnlesterescarlan.pro';

const UNSAFE_CANONICAL_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '[::1]',
  'johnlester.vercel.app'
]);

function isNetlifyPreviewHostname(hostname: string): boolean {
  return hostname.endsWith('.netlify.app') && hostname.includes('--');
}

export function resolveSiteUrl(value?: string): string {
  const candidate = value?.trim();

  if (!candidate) {
    return PRODUCTION_SITE_URL;
  }

  try {
    const url = new URL(candidate);
    const isWebUrl = url.protocol === 'http:' || url.protocol === 'https:';
    const hasCredentials = Boolean(url.username || url.password);
    const isUnsafeHost =
      UNSAFE_CANONICAL_HOSTS.has(url.hostname) ||
      isNetlifyPreviewHostname(url.hostname);

    if (!isWebUrl || hasCredentials || isUnsafeHost) {
      return PRODUCTION_SITE_URL;
    }

    return url.origin;
  } catch {
    return PRODUCTION_SITE_URL;
  }
}

export const siteConfig = {
  seo: {
    siteTitle: 'John Lester Escarlan | Full-Stack Software Engineer',
    titleTemplateName: 'John Lester Escarlan',
    description:
      'Portfolio of John Lester Escarlan, a full-stack software engineer building reliable web products, marketplaces, and AI automation workflows.',
    siteName: 'John Lester Escarlan',
    siteUrl: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
    locale: 'en_US',
    socialImage: {
      path: '/hero-image.svg',
      width: 1080,
      height: 1080,
      alt: 'Portrait of John Lester Escarlan'
    }
  } satisfies SeoConfig,
  navigation: {
    header: [
      { name: 'Work', href: '/#work' },
      { name: 'About', href: '/#about' },
      { name: 'Contact', href: '/#contact' }
    ] satisfies NavItem[],
    footer: [
      { name: 'Home', href: '/#home' },
      { name: 'Work', href: '/#work' },
      { name: 'About', href: '/#about' },
      { name: 'Contact', href: '/#contact' }
    ] satisfies NavItem[]
  },
  footer: {
    copyrightName: 'John Lester Escarlan'
  },
  overlay: {
    title: 'John Lester Escarlan',
    eyebrow: 'Portfolio',
    loadingLabel: 'Preparing portfolio',
    progressLabel: 'Portfolio startup progress'
  } satisfies OverlayContent
} as const;
