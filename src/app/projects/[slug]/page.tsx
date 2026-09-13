import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getNextProject,
  getProjectBySlug,
  getProjectSlugs
} from '@/features/projects';
import { isRenderableExternalUrl } from '@/shared/lib/project';
import { NewTabNotice } from '@/shared/components/NewTabNotice';
import type { ProjectHeroVisual } from '@/features/projects/types';
import { FadeIn } from '@/shared/components/FadeIn';
import { Typography } from '@/shared/components/Typography';
import { siteConfig } from '@/shared/site/config';
import { SURFACE } from '@/shared/styles/shared';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

interface ProjectHeroProps {
  visual?: ProjectHeroVisual;
  fallbackSrc: string;
  title: string;
}

interface NextProjectCardProps {
  category: string;
  slug: string;
  summary: string;
  title: string;
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return getProjectSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({
  params
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};

  const heroVisual = project.caseStudy.visuals.find(
    (visual): visual is ProjectHeroVisual => visual.kind === 'hero'
  );
  const socialImage = heroVisual
    ? { url: heroVisual.src, alt: heroVisual.alt }
    : {
        url: siteConfig.seo.socialImage.path,
        alt: siteConfig.seo.socialImage.alt
      };

  return {
    title: project.title,
    description: project.caseStudy.summary,
    openGraph: {
      title: project.title,
      description: project.caseStudy.summary,
      url: `${siteConfig.seo.siteUrl}/projects/${project.slug}`,
      siteName: siteConfig.seo.siteName,
      images: [socialImage]
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.caseStudy.summary,
      images: [socialImage]
    }
  };
}

export function ProjectHero({ visual, fallbackSrc, title }: ProjectHeroProps) {
  if (visual) {
    return (
      <figure className={`border ${SURFACE.hairline} bg-surface-muted`}>
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={visual.src}
            alt={visual.alt}
            fill
            sizes="(max-width: 768px) calc(100vw - 2.5rem), 1152px"
            className="object-cover transition-transform duration-700 hover:scale-[1.02]"
            priority
          />
        </div>
        <Typography
          variant="body-sm"
          as="figcaption"
          className="border-t border-surface px-4 py-3 leading-relaxed text-muted-foreground"
        >
          {visual.caption}
        </Typography>
      </figure>
    );
  }

  if (fallbackSrc) {
    return (
      <div
        className={`relative flex aspect-video w-full items-center justify-center overflow-hidden border ${SURFACE.hairline} bg-surface-tint`}
      >
        <div
          className="surface-grid-mask absolute inset-0 opacity-50"
          aria-hidden="true"
        />
        <div className="relative z-10 flex items-center justify-center px-12 py-16">
          <Image
            src={fallbackSrc}
            alt={`${title} logo`}
            width={280}
            height={140}
            className="max-h-28 w-auto object-contain opacity-80"
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`${title} preview unavailable`}
      className={`relative flex aspect-video w-full items-center justify-center overflow-hidden border ${SURFACE.hairline} bg-surface-tint`}
    >
      <div
        className="surface-grid-mask absolute inset-0 opacity-50"
        aria-hidden="true"
      />
      <span
        aria-hidden="true"
        className="relative z-10 select-none font-medium leading-none tracking-tighter text-foreground/[0.06]"
      >
        {title}
      </span>
    </div>
  );
}

function NextProjectCard({
  category,
  slug,
  summary,
  title
}: NextProjectCardProps) {
  return (
    <Link
      href={`/projects/${slug}`}
      className={`group block border ${SURFACE.hairline} bg-surface-muted p-6 transition-colors hover:bg-surface-tint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground sm:p-8`}
    >
      <div className="mb-8 flex items-center justify-between gap-4">
        <Typography
          variant="caption"
          as="span"
          className="text-base font-medium uppercase tracking-[0.12em] text-subtle-foreground"
        >
          Next project
        </Typography>
        <span
          aria-hidden="true"
          className="text-base text-muted-foreground transition-transform duration-200 group-hover:translate-x-1"
        >
          →
        </span>
      </div>
      <Typography
        variant="caption"
        as="span"
        className="text-base uppercase tracking-[0.1em] text-subtle-foreground"
      >
        {category}
      </Typography>
      <Typography
        variant="h2"
        as="span"
        className="mt-2 block font-medium text-foreground"
      >
        {title}
      </Typography>
      <Typography
        variant="body"
        as="span"
        className="mt-3 block max-w-2xl leading-relaxed text-muted-foreground"
      >
        {summary}
      </Typography>
    </Link>
  );
}

export default async function ProjectPage({
  params
}: ProjectPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const heroVisual = project.caseStudy.visuals.find(
    (visual): visual is ProjectHeroVisual => visual.kind === 'hero'
  );
  const nextProject = getNextProject(project.slug);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="bg-surface px-5 pb-24 pt-28 sm:px-8 md:px-12 md:pb-32 md:pt-32"
    >
      <article className="mx-auto max-w-4xl">
        <FadeIn as="header" className="mb-10 md:mb-12">
          <div className="mb-12 flex items-center justify-between border-b border-surface pb-6">
            <Link
              href="/projects"
              prefetch={false}
              className="group flex items-center gap-2 text-base font-medium uppercase tracking-[0.15em] text-foreground transition-colors hover:text-muted-foreground"
            >
              <span
                aria-hidden="true"
                className="transition-transform group-hover:-translate-x-1"
              >
                ←
              </span>
              Back to projects
            </Link>
          </div>

          <div className="max-w-[720px]">
            <div className="mb-5 flex items-center gap-3">
              <span
                className="h-px w-5 bg-foreground/25"
                aria-hidden="true"
              />
              <Typography
                variant="caption"
                as="p"
                className="text-base font-medium uppercase tracking-[0.12em] text-subtle-foreground"
              >
                {project.category}
              </Typography>
            </div>

            <Typography
              variant="display"
              as="h1"
              className="mb-4 font-medium leading-[1.02] tracking-tight"
            >
              {project.title}
            </Typography>

            <Typography
              variant="body-lg"
              as="p"
              className="max-w-2xl leading-relaxed text-muted-foreground"
            >
              {project.caseStudy.summary}
            </Typography>
          </div>
        </FadeIn>

        <FadeIn delay={80} className="mb-8 md:mb-10">
          <ProjectHero
            visual={heroVisual}
            fallbackSrc={project.logo}
            title={project.title}
          />
        </FadeIn>

        <div className="mb-14 flex flex-wrap gap-6" aria-label="Project links">
          {[
            { label: 'Visit website', url: project.links.liveUrl },
            { label: 'View code', url: project.links.githubUrl },
          ].filter(link => isRenderableExternalUrl(link.url)).map(link => (
            <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="portfolio-link">
              {link.label} <span aria-hidden="true">↗</span><NewTabNotice />
            </a>
          ))}
        </div>

        <section aria-labelledby="contribution-heading" className="mb-14 space-y-5">
          <h2 id="contribution-heading" className="h2">My contribution</h2>
          <p>{project.caseStudy.roleScope.role}</p>
          <ul className="list-disc space-y-3 pl-5 text-muted-foreground">
            {project.caseStudy.roleScope.ownership.map(item => <li key={item}>{item}</li>)}
          </ul>
        </section>

        {project.caseStudy.visuals.filter(visual => visual.kind === 'supporting').map(visual => (
          <div key={visual.src} className="mb-14">
            <ProjectHero visual={{ ...visual, kind: 'hero' }} fallbackSrc="" title={project.title} />
          </div>
        ))}

        <section aria-labelledby="outcome-heading" className="mb-14 space-y-5">
          <h2 id="outcome-heading" className="h2">Outcome</h2>
          {project.caseStudy.impact.filter(item => item.kind === 'product').map(item => (
            <p key={item.label} className="text-muted-foreground">{item.context}</p>
          ))}
        </section>

        <section aria-labelledby="stack-heading" className="mb-16 space-y-5">
          <h2 id="stack-heading" className="h2">Stack</h2>
          <ul className="flex flex-wrap gap-2" aria-label="Technology stack">
            {project.technologies.map(technology => <li className="stack-chip" key={technology}>{technology}</li>)}
          </ul>
        </section>

        {nextProject ? (
          <FadeIn
            delay={540}
            as="footer"
            className={`border-t ${SURFACE.hairline} pt-10`}
          >
            <NextProjectCard
              category={nextProject.category}
              slug={nextProject.slug}
              summary={nextProject.caseStudy.summary}
              title={nextProject.title}
            />
          </FadeIn>
        ) : null}
      </article>
    </main>
  );
}
