import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { projects, projectsSectionContent } from '@/features/projects';
import { FadeIn } from '@/shared/components/FadeIn';
import { Typography } from '@/shared/components/Typography';
import { siteConfig } from '@/shared/site/config';

const pageTitle = 'All Projects';
const pageDescription =
  'Browse John Lester Escarlan’s complete collection of product, client, visualization, and automation case studies.';
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

const previews: Record<string, string> = {
  'rent-n-roll': 'Camera rentals, from discovery to return.',
  health: 'Offline health records and guided care for Naga City residents.',
  pricecraft: 'Recipe costing and selling prices for small food businesses.',
  regex2nfa: 'Turn regular expressions into interactive, animated automata.',
  'job-pipeline': 'An automated workflow for tracking job opportunities.',
  pacu: 'Learning and subscription tools for pharmacy professionals.',
};

export default function ProjectsPage(): React.JSX.Element {
  return (
    <main id="main-content" tabIndex={-1} className="bg-surface px-6 pb-24 pt-28 md:pb-32 md:pt-32">
      <div className="mx-auto max-w-3xl">
        <FadeIn as="header" className="mb-14">
          <Link href="/#work" prefetch={false} className="portfolio-link mb-10">
            <span aria-hidden="true">←</span> Back to projects
          </Link>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <Typography variant="h1" as="h1">All projects</Typography>
            <span className="text-muted-foreground">{projects.length} case studies</span>
          </div>
          <p className="mt-4 text-muted-foreground">A selection of products, client work, and experiments.</p>
        </FadeIn>

        <ul aria-label="All projects" data-layout="archive" className="grid grid-cols-1 gap-16 md:gap-20">
          {projects.map(project => (
            <li key={project.slug}>
              <Link href={`/projects/${project.slug}`} aria-label={`${projectsSectionContent.ctaLabel}: ${project.title}`} className="group block rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-foreground">
                <article>
                  <div className={`relative aspect-video overflow-hidden rounded-xl border border-surface ${project.listing.thumbnail.fit === 'contain' ? 'bg-white' : 'bg-surface-muted'}`}>
                    <Image src={project.listing.thumbnail.src} alt={project.listing.thumbnail.alt} fill
                      sizes="(max-width: 816px) calc(100vw - 48px), 768px"
                      style={{ objectPosition: project.listing.thumbnail.objectPosition ?? 'center' }}
                      className={`${project.listing.thumbnail.fit === 'contain' ? 'object-contain' : 'object-cover'} transition-transform duration-500 motion-safe:group-hover:scale-[1.02] motion-reduce:transition-none`} />
                  </div>
                  <div className="mt-6 flex items-center justify-between gap-4">
                    <h3 className="font-medium">{project.title}</h3>
                    <span aria-hidden="true" className="text-muted-foreground transition-transform motion-safe:group-hover:translate-x-1">↗</span>
                  </div>
                  <p className="mt-2 text-muted-foreground">{previews[project.slug] ?? project.description}</p>
                  <ul aria-label={`${project.title} capabilities`} className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                    {project.listing.capabilities.map(capability => <li key={capability}>{capability}</li>)}
                  </ul>
                </article>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
