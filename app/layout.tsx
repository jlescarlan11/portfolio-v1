import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WelcomeOverlay from "./components/WelcomeOverlay";
import Footer from "./components/Footer";

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
        <Footer />
      </body>
    </html>
  );
}
