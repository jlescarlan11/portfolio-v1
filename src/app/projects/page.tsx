import type { Metadata } from 'next';
import Link from 'next/link';
import { ProjectDossierGrid, projects, projectsSectionContent } from '@/features/projects';
import { FadeIn } from '@/shared/components/FadeIn';
import { Typography } from '@/shared/components/Typography';
import { siteConfig } from '@/shared/site/config';
import { SURFACE } from '@/shared/styles/shared';

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

export default function ProjectsPage(): React.JSX.Element {
  const projectCards = projects.map(project => ({
    slug: project.slug,
    title: project.title,
    category: project.category,
    technologies: project.technologies,
    completedAt: project.completedAt,
    links: project.links,
    caseStudy: {
      summary: project.caseStudy.summary,
      highlights: project.caseStudy.highlights
    }
  }));

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="bg-surface px-5 pb-24 pt-12 sm:px-8 md:px-12 md:pb-32 md:pt-20"
    >
      <div className="mx-auto max-w-6xl">
        <FadeIn as="header" className="mb-10 md:mb-12">
          <div className="mb-12 flex items-center justify-between border-b border-surface pb-6">
            <Link
              href="/#work"
              prefetch={false}
              className="group flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.15em] text-foreground transition-colors hover:text-muted-foreground"
            >
              <span
                aria-hidden="true"
                className="transition-transform group-hover:-translate-x-1"
              >
                ←
              </span>
              Back to selected work
            </Link>
            <Typography
              variant="caption"
              as="span"
              className="font-mono text-[11px] text-subtle-foreground"
            >
              {projects.length} case studies
            </Typography>
          </div>

          <div className="max-w-3xl">
            <Typography
              variant="caption"
              as="p"
              className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground"
            >
              Project archive
            </Typography>
            <Typography variant="h1" as="h1" className="text-foreground">
              All projects
            </Typography>
            <Typography
              variant="body"
              as="p"
              className="mt-5 max-w-2xl leading-relaxed text-muted-foreground"
            >
              Every case study, from client platforms and product builds to
              educational tools and tested automation.
            </Typography>
          </div>
        </FadeIn>

        <ProjectDossierGrid
          projects={projectCards}
          ctaLabel={projectsSectionContent.ctaLabel}
          className={`border ${SURFACE.hairline}`}
          ariaLabel="All projects"
        />
      </div>
    </main>
  );
}
