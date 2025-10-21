import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WelcomeOverlay from "./components/WelcomeOverlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "John Lester Escarlan — Portfolio",
    template: "%s — John Lester Escarlan",
  },
  description: "Software Engineer crafting thoughtful, monochrome digital experiences.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://johnlester.vercel.app'),
  openGraph: {
    title: "John Lester Escarlan — Portfolio",
    description: "Software Engineer crafting thoughtful digital experiences.",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "Portfolio",
    images: [
      { url: "/hero-image.svg", width: 1200, height: 630, alt: "Hero" },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "John Lester Escarlan — Portfolio",
    description: "Software Engineer crafting thoughtful, monochrome digital experiences.",
    images: ["/hero-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Welcome overlay shown on first visit per session */}
        <WelcomeOverlay />
        <a href="#work" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:bg-black focus:text-white focus:px-3 focus:py-2 focus:border focus:border-white/20">Skip to content</a>
        {children}
        <footer className="text-[11px] tracking-[0.3em] uppercase text-white/50 pointer-events-none select-none fixed left-4 bottom-4 sm:static sm:left-auto sm:bottom-auto sm:px-6 sm:py-8">
          © John Lester Escarlan — {new Date().getFullYear()} • <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`} className="pointer-events-auto underline underline-offset-4 decoration-white/20 hover:decoration-white">{process.env.NEXT_PUBLIC_CONTACT_EMAIL}</a>
        </footer>
      </body>
    </html>
  );
}
