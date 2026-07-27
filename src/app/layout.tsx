import type { Metadata } from 'next';
import { Playfair_Display } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import React from 'react';
import { ChatBubble } from '@/features/chat';
import { homepageMetadata } from '@/shared/seo/homepage-metadata';
import './globals.css';

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '600', '700', '900']
});

export const metadata: Metadata = homepageMetadata;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <noscript>
          <style>
            {'.fade-in-pending{opacity:1!important;animation:none!important}'}
          </style>
        </noscript>
        {/* Inline script runs synchronously before paint — prevents flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.documentElement;try{var s=localStorage.getItem('theme');var t=(s==='dark'||s==='light')?s:window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';d.setAttribute('data-theme',t);}catch(e){}try{window.__portfolioInitialPath=window.location.pathname;d.setAttribute('data-initial-path',window.__portfolioInitialPath);}catch(e){}})();`
          }}
        />
      </head>
      <body
        className={`${playfairDisplay.variable} ${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <div data-initial-load-global>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:border focus:border-surface-strong focus:bg-surface focus:px-3 focus:py-2 focus:text-foreground"
          >
            Skip to main content
          </a>
          <ChatBubble />
        </div>
        {children}
      </body>
    </html>
  );
}
