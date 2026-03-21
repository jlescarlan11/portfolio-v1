export interface NavItem {
  name: string;
  href: string;
}

export interface SeoConfig {
  siteTitle: string;
  titleTemplateName: string;
  description: string;
  openGraphDescription: string;
  siteName: string;
  siteUrl: string;
  locale: string;
}

export interface OverlayContent {
  title: string;
  ariaLabel: string;
  loadingLabel: string;
}

export const siteConfig = {
  seo: {
    siteTitle: 'John Lester Escarlan - Portfolio',
    titleTemplateName: 'John Lester Escarlan',
    description:
      'Full-Stack Software Engineer building reliable web and mobile systems.',
    openGraphDescription:
      'Full-Stack Software Engineer building reliable web and mobile systems.',
    siteName: 'Portfolio',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://johnlester.vercel.app',
    locale: 'en_US'
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
    ariaLabel: 'Welcome',
    loadingLabel: 'Loading'
  } satisfies OverlayContent
} as const;
