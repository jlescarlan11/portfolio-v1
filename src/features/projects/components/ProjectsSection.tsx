import Image from 'next/image';
import Link from 'next/link';
import SectionFrame from '@/shared/components/SectionFrame';
import { Typography } from '@/shared/components/Typography';
import { FadeIn } from '@/shared/components/FadeIn';
import { formatMonthYear, isRenderableExternalUrl } from '@/shared/lib/project';
import { SURFACE, TYPOGRAPHY_STYLES } from '@/shared/styles/shared';
import { selectHomepageProjects } from '@/features/projects/lib/projects';
import type { ProjectRecord, ProjectsSectionContent } from '@/features/projects/types';

interface ProjectsSectionProps {
  projects: ProjectRecord[];
  content: ProjectsSectionContent;
}

interface ProjectCardProps {
  project: ProjectRecord;
  ctaLabel: string;
  imageSizes: string;
}

interface ProjectGridProps {
  projects: ProjectRecord[];
  ctaLabel: string;
  layout?: 'homepage' | 'archive';
  className?: string;
  ariaLabel?: string;
}

function ProjectStatus({ title, status }: { title: string; status: string }) {
  return (
    <span
      aria-label={`${title}: ${status}`}
      className="absolute left-3 top-3 inline-flex items-center gap-1.5 border border-black/10 bg-white/90 px-2 py-1 text-black backdrop-blur-sm"
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full motion-safe:animate-ping bg-black opacity-20" />
        <span className="relative inline-flex h-1.5 w-1.5 bg-black/70" />
      </span>
      <span className="text-base font-normal uppercase tracking-[0.14em]">{status}</span>
    </span>
  );
}

function ProjectCard({ project, ctaLabel, imageSizes }: ProjectCardProps) {
  const {
    slug,
    title,
    listing,
    technologies,
    completedAt,
    links,
    caseStudy
  } = project;
  const titleId = `project-card-title-${slug}`;
  const capabilityLabels = new Set(
    listing.capabilities.map(capability => capability.toLowerCase())
  );
  const distinctTechnologies = technologies.filter(
    technology => !capabilityLabels.has(technology.toLowerCase())
  );
  const visibleTechnologies = distinctTechnologies.slice(0, 2);
  const hiddenTechnologyCount = Math.max(
    0,
    distinctTechnologies.length - visibleTechnologies.length
  );
  const outcome = caseStudy.highlights[0] ?? caseStudy.summary;
  const isContainedThumbnail = listing.thumbnail.fit === 'contain';

  return (
    <Link
      href={`/projects/${slug}`}
      aria-label={`${ctaLabel}: ${title}`}
      className="group block h-full rounded-xl overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
    >
      <article
        aria-labelledby={titleId}
        className="flex h-full flex-col bg-surface transition-colors duration-200 group-hover:bg-surface-tint"
      >
        <div
          className={`relative aspect-video w-full overflow-hidden border-b ${SURFACE.hairline} ${
            isContainedThumbnail ? 'bg-white' : 'bg-surface-muted'
          }`}
        >
          <Image
            src={listing.thumbnail.src}
            alt={listing.thumbnail.alt}
            fill
            sizes={imageSizes}
            style={{ objectPosition: listing.thumbnail.objectPosition ?? 'center' }}
            className={`${
              isContainedThumbnail ? 'object-contain' : 'object-cover'
            } transition-transform duration-500 motion-safe:group-hover:scale-[1.02] motion-reduce:transition-none`}
          />
          {isRenderableExternalUrl(links.liveUrl) ? (
            <ProjectStatus title={title} status={caseStudy.roleScope.status ?? "Public preview"} />
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <ul
              aria-label={`${title} capabilities`}
              className="flex flex-wrap gap-1.5"
            >
              {listing.capabilities.map(capability => (
                <li key={capability}>
                  <span
                    className={`caption inline-block border ${SURFACE.hairline} px-2 py-0.5 uppercase tracking-[0.1em] text-subtle-foreground`}
                  >
                    {capability}
                  </span>
                </li>
              ))}
            </ul>
            <time
              dateTime={completedAt}
              className="caption shrink-0 whitespace-nowrap font-sans tabular-nums text-subtle-foreground/70"
            >
              {formatMonthYear(completedAt, 'short')}
            </time>
          </div>

          <Typography
            variant="h4"
            as="h3"
            id={titleId}
            className="mb-3 leading-snug text-foreground"
          >
            {title}
          </Typography>

          <Typography
            variant="body-sm"
            as="p"
            className="mb-6 line-clamp-3 text-muted-foreground"
          >
            {outcome}
          </Typography>

          <footer
            className={`mt-auto flex flex-wrap items-end justify-between gap-4 border-t pt-4 ${SURFACE.hairline}`}
          >
            <ul
              aria-label={`${title} technology stack`}
              className="flex flex-wrap gap-1.5"
            >
              {visibleTechnologies.map(technology => (
                <li key={technology}>
                  <span
                    className={`caption whitespace-nowrap border px-2 py-0.5 font-sans ${SURFACE.hairline} text-subtle-foreground`}
                  >
                    {technology}
                  </span>
                </li>
              ))}
              {hiddenTechnologyCount > 0 ? (
                <li>
                  <span
                    className={`caption whitespace-nowrap border px-2 py-0.5 font-sans ${SURFACE.hairline} text-subtle-foreground`}
                  >
                    +{hiddenTechnologyCount}
                  </span>
                </li>
              ) : null}
            </ul>

            <span className={`${TYPOGRAPHY_STYLES.linkPrimary} inline-flex items-center gap-2`}>
              {ctaLabel}
              <span
                aria-hidden="true"
                className="transition-transform duration-200 motion-safe:group-hover:translate-x-1 motion-reduce:transition-none"
              >
                →
              </span>
            </span>
          </footer>
        </div>
      </article>
    </Link>
  );
}

export function ProjectGrid({
  projects,
  ctaLabel,
  layout = 'archive',
  className = '',
  ariaLabel = 'Projects'
}: ProjectGridProps) {
  if (projects.length === 0) return null;

  const gridColumns =
    layout === 'homepage'
      ? 'grid-cols-1 md:grid-cols-3'
      : 'grid-cols-1';
  const imageSizes =
    layout === 'homepage'
      ? '(max-width: 767px) calc(100vw - 3rem), (max-width: 1280px) 33vw, 320px'
      : '(max-width: 639px) calc(100vw - 2.5rem), (max-width: 1023px) 50vw, 384px';

  return (
    <ul
      aria-label={ariaLabel}
      data-layout={layout}
      className={`grid gap-8 ${gridColumns} ${className}`}
    >
      {projects.map((project, index) => (
        <FadeIn
          as="li"
          key={project.slug}
          delay={index * 80 + 80}
          className="h-full"
        >
          <ProjectCard
            project={project}
            ctaLabel={ctaLabel}
            imageSizes={imageSizes}
          />
        </FadeIn>
      ))}
    </ul>
  );
}

export default function ProjectsSection({ projects, content }: ProjectsSectionProps) {
  if (!projects || projects.length === 0) return null;

  const homepageProjects = selectHomepageProjects(projects);
  const hasMoreProjects = projects.length > homepageProjects.length;

  return (
    <SectionFrame
      id="work"
      headingId="work-heading"
      eyebrow={content.eyebrow}
      title={content.title}
      intro={content.intro}
      showTopBorder
    >
      <div className={`border ${SURFACE.hairline}`}>
        <ProjectGrid
          projects={homepageProjects}
          ctaLabel={content.ctaLabel}
          layout="homepage"
          ariaLabel="Selected projects"
        />

        {hasMoreProjects ? (
          <div
            className={`flex justify-center border-t bg-surface px-5 py-4 ${SURFACE.hairline}`}
          >
            <Link
              href="/projects"
              className={`${TYPOGRAPHY_STYLES.linkPrimary} inline-flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground`}
            >
              See all {projects.length} projects
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : null}
      </div>
    </SectionFrame>
  );
}
