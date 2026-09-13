import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ExperienceHistory } from '@/features/about/ExperienceSection';
import { aboutContent } from '@/features/about/content';

export const metadata: Metadata = { title: 'Experience', description: 'My work and education, from the latest chapter back.', alternates: { canonical: '/experience' } };

export default function Page(): React.JSX.Element {
  return <main id="main-content" tabIndex={-1} className="bg-surface px-6 pb-24 pt-28 md:pb-32 md:pt-32">
    <div className="mx-auto max-w-4xl">
      <header className="mb-12">
        <Link href="/#experience" className="portfolio-link mb-10"><span aria-hidden="true">←</span> Back to home</Link>
        <h1 className="h1">Experience</h1>
        <p className="mt-4 text-muted-foreground">My work and education, from the latest chapter back.</p>
      </header>
      <ExperienceHistory content={aboutContent} full />
    </div>
  </main>;
}
