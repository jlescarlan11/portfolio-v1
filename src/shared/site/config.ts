import {
  isIpLiteralHostname,
  isLocalHostname
} from '@/shared/lib/project';

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

export const PRODUCTION_SITE_URL = 'https://johnlesterescarlan.pro';

const MANAGED_DEPLOYMENT_HOSTS = ['vercel.app', 'netlify.app'];

function isManagedDeploymentHostname(hostname: string): boolean {
  return MANAGED_DEPLOYMENT_HOSTS.some(
    managedHost =>
      hostname === managedHost || hostname.endsWith(`.${managedHost}`)
  );
}

export function resolveSiteUrl(value?: string): string {
  const candidate = value?.trim();

  if (!candidate) {
    return PRODUCTION_SITE_URL;
  }

  try {
    const url = new URL(candidate);
    if (url.hostname.endsWith('.')) {
      url.hostname = url.hostname.slice(0, -1);
    }
    const isSecureWebUrl = url.protocol === 'https:';
    const hasCredentials = Boolean(url.username || url.password);
    const isUnsafeHost =
      isLocalHostname(url.hostname) ||
      isIpLiteralHostname(url.hostname) ||
      isManagedDeploymentHostname(url.hostname);

    if (!isSecureWebUrl || hasCredentials || isUnsafeHost) {
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
      'I’m John, a full-stack software engineer in Cebu City with a background in mathematics. Explore my journey, client work, personal projects, and what I’m learning.',
    siteName: 'John Lester Escarlan',
    siteUrl: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
    locale: 'en_US',
    socialImage: {
      path: '/hero-image.jpg',
      width: 1080,
      height: 1080,
      alt: 'Portrait of John Lester Escarlan'
    }
  } satisfies SeoConfig,
  navigation: {
    header: [
      { name: 'About', href: '/#about' },
      { name: 'Work', href: '/#work' },
      { name: 'Experience', href: '/#experience' },
      { name: 'Contact', href: '/#contact' }
    ] satisfies NavItem[],
    footer: [
      { name: 'About', href: '/#about' },
      { name: 'Work', href: '/#work' },
      { name: 'Experience', href: '/#experience' },
      { name: 'Contact', href: '/#contact' }
    ] satisfies NavItem[]
  },
  footer: {
    copyrightName: 'John Lester Escarlan'
  }
} as const;
