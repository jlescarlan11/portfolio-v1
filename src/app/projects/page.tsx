import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getHomepageProjects, projects, projectsSectionContent } from '@/features/projects';
import { healthHackathonResult } from '@/features/projects/stories';
import { FadeIn } from '@/shared/components/FadeIn';
import { Typography } from '@/shared/components/Typography';
import { siteConfig } from '@/shared/site/config';

const pageTitle = 'All Projects';
const pageDescription =
  'Browse John Lester Escarlan’s complete collection of project stories, from client work to personal products and prototypes.';
const pageUrl = `${siteConfig.seo.siteUrl}/projects`;

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: pageUrl
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: pageUrl,
    siteName: siteConfig.seo.siteName,
    images: [
      {
        url: siteConfig.seo.socialImage.path,
        alt: siteConfig.seo.socialImage.alt
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
    images: [siteConfig.seo.socialImage.path]
  }
};

const catalogProjects = [
  ...getHomepageProjects(),
  ...projects.filter(project => project.listing.homepageRank === undefined)
];

const previews: Partial<Record<string, { workType: string; contribution: string }>> = {
  pacu: {
    workType: 'Client contract',
    contribution: 'I fixed course progress that could go over 100%, prevented duplicate certificate records, and made it safer to move content into production.'
  },
  pricecraft: {
    workType: 'Personal product',
    contribution: 'I built a tool for small food businesses to price recipes and check the prices it reads from receipts before updating ingredient costs.'
  },
  health: {
    workType: healthHackathonResult,
    contribution: 'I led a five-person team building a prototype for Naga City with offline health records and safety checks that run before AI triage.'
  },
  'rent-n-roll': {
    workType: 'Solo pre-launch marketplace',
    contribution: 'I built the camera rental flow from finding available gear through booking, payment, and return.'
  },
  regex2nfa: {
    workType: 'Class project',
    contribution: 'I redesigned the workspace so students can see how a regular expression turns into a state machine and follow the simulation step by step.'
  },
  'job-pipeline': {
    workType: 'Automation',
    contribution: 'I built a workflow that filters out repeat job listings and drafts applications for me to review and send.'
  }
};

export default function ProjectsPage(): React.JSX.Element {
  return (
    <main id="main-content" tabIndex={-1} className="bg-surface px-6 pb-24 pt-28 md:pb-32 md:pt-32">
      <div className="mx-auto max-w-5xl">
        <FadeIn as="header" className="mb-14">
          <Link href="/#work" prefetch={false} className="portfolio-link mb-10">
            <span aria-hidden="true">←</span> Back to featured work
          </Link>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <Typography variant="h1" as="h1">All projects</Typography>
            <Typography variant="caption">{catalogProjects.length} project stories</Typography>
          </div>
          <Typography variant="body-lg" className="mt-4">
            Client work, side projects, and prototypes. Here’s what I built or helped fix.
          </Typography>
        </FadeIn>

        <ul aria-label="All projects" data-layout="archive" className="grid grid-cols-1 gap-y-12 md:grid-cols-2 md:gap-x-12 md:gap-y-16">
          {catalogProjects.map(project => {
            const preview = previews[project.slug];
            const thumbnail = project.listing.thumbnail;

            return (
              <li key={project.slug}>
                <Link
                  href={`/projects/${project.slug}`}
                  aria-label={`${projectsSectionContent.ctaLabel}: ${project.title}`}
                  className="group block h-full rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-foreground"
                >
                  <article className="flex h-full flex-col gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <Typography variant="h3" as="h2">{project.title}</Typography>
                        <span aria-hidden="true" className="text-muted-foreground transition-transform motion-safe:group-hover:translate-x-1">↗</span>
                      </div>
                      <Typography variant="caption" as="p">{preview?.workType ?? project.category}</Typography>
                      <Typography variant="body" className="mt-2">
                        {preview?.contribution ?? project.description}
                      </Typography>
                    </div>
                    <div className={`relative aspect-video overflow-hidden rounded-xl border border-surface ${thumbnail.fit === 'contain' ? 'bg-white' : 'bg-surface-muted'}`}>
                      <Image
                        src={thumbnail.src}
                        alt={thumbnail.alt}
                        fill
                        sizes="(min-width: 1072px) 488px, (min-width: 768px) calc(50vw - 48px), calc(100vw - 48px)"
                        style={{ objectPosition: thumbnail.objectPosition ?? 'center' }}
                        className={`${thumbnail.fit === 'contain' ? 'object-contain' : 'object-cover'} transition-transform duration-500 motion-safe:group-hover:scale-[1.02] motion-reduce:transition-none`}
                      />
                    </div>
                    <ul aria-label={`${project.title} capabilities`} className="caption flex flex-wrap gap-x-4 gap-y-1">
                      {project.listing.capabilities.map(capability => <li key={capability}>{capability}</li>)}
                    </ul>
                  </article>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
