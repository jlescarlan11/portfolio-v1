import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import WelcomeOverlay from '@/shared/components/WelcomeOverlay';
import { siteConfig } from '@/shared/site/config';
import './globals.css';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.seo.siteTitle,
    template: `%s - ${siteConfig.seo.titleTemplateName}`
  },
  description: siteConfig.seo.description,
  metadataBase: new URL(siteConfig.seo.siteUrl),
  openGraph: {
    title: siteConfig.seo.siteTitle,
    description: siteConfig.seo.openGraphDescription,
    url: siteConfig.seo.siteUrl,
    siteName: siteConfig.seo.siteName,
    images: [
      {
        url: '/hero-image.svg',
        width: 1200,
        height: 630,
        alt: 'Portrait of John Lester Escarlan'
      }
    ],
    locale: siteConfig.seo.locale,
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.seo.siteTitle,
    description: siteConfig.seo.description,
    images: ['/hero-image.svg']
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <WelcomeOverlay />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:border focus:border-surface-strong focus:bg-surface focus:px-3 focus:py-2 focus:text-foreground"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
