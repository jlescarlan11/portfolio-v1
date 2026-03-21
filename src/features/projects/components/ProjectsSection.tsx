'use client';

import Link from 'next/link';
import { useState } from 'react';
import type {
  ProjectRecord,
  ProjectsSectionContent
} from '@/features/projects/types';
import SectionFrame from '@/shared/components/SectionFrame';
import { Typography } from '@/shared/components/Typography';
import { FadeIn } from '@/shared/components/FadeIn';
import { formatMonthYear, isRenderableExternalUrl } from '@/shared/lib/project';
import { SURFACE, TYPOGRAPHY_STYLES } from '@/shared/styles/shared';

interface ProjectsSectionProps {
  projects: ProjectRecord[];
  content: ProjectsSectionContent;
}

interface FeaturedProjectCardProps {
  project: ProjectRecord;
  ctaLabel: string;
}

interface ProjectRowProps {
  project: ProjectRecord;
  index: number;
  ctaLabel: string;
}

// ─── Featured card: first project gets a full-width showcase treatment ─────────
function FeaturedProjectCard({
  project,
  ctaLabel
}: FeaturedProjectCardProps): React.JSX.Element {
  const safeLiveUrl = isRenderableExternalUrl(project.links.liveUrl)
    ? project.links.liveUrl
    : undefined;
  const safeGithubUrl = isRenderableExternalUrl(project.links.githubUrl)
    ? project.links.githubUrl
    : undefined;
  const displayDate = formatMonthYear(project.completedAt, 'long');
  const visibleTechnologies = project.technologies.slice(0, 6);
  const remainingCount = Math.max(0, project.technologies.length - visibleTechnologies.length);

  return (
    <FadeIn
      as="article"
      delay={120}
      className="group relative mb-2 border border-surface overflow-hidden transition-all duration-500 hover:border-foreground/20"
      aria-labelledby="featured-project-title"
    >
      {/* Ghost index number — large watermark behind content */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 -top-6 select-none text-[clamp(7rem,20vw,14rem)] font-black leading-none tracking-tighter text-foreground/[0.04] transition-all duration-700 group-hover:text-foreground/[0.07]"
      >
        01
      </span>

      <div className="relative z-10 p-6 sm:p-8 md:p-10">
        {/* Top row: eyebrow + date */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2">
            <span className="h-px w-6 bg-foreground/30" aria-hidden="true" />
            <Typography
              variant="caption"
              as="span"
              className="text-xs font-semibold uppercase tracking-widest text-subtle-foreground"
            >
              Featured · {project.category}
            </Typography>
          </span>
          <Typography
            variant="caption"
            as="time"
            dateTime={project.completedAt}
            className="tabular-nums text-subtle-foreground"
          >
            {displayDate}
          </Typography>
        </div>

        {/* Title */}
        <Typography
          variant="display"
          as="h3"
          id="featured-project-title"
          className="mb-4 text-[clamp(2rem,6vw,3.5rem)] font-black leading-[1.05] tracking-tight transition-colors duration-300"
        >
          {project.title}
        </Typography>

        {/* Description — first sentence only for scannability */}
        <Typography
          variant="body-lg"
          as="p"
          className="mb-6 max-w-xl text-muted-foreground"
        >
          {project.description.split(/(?<=\.)\s+/)[0]}
        </Typography>

        {/* Tech stack pills */}
        <ul
          className="mb-8 flex flex-wrap gap-2"
          aria-label={`${project.title} technology stack`}
        >
          {visibleTechnologies.map((tech) => (
            <li key={tech}>
              <Typography
                variant="caption"
                as="span"
                className={`inline-flex items-center border ${SURFACE.hairline} px-2.5 py-1 text-muted-foreground transition-all duration-300 group-hover:border-foreground/20 group-hover:text-foreground`}
              >
                {tech}
              </Typography>
            </li>
          ))}
          {remainingCount > 0 && (
            <li>
              <Typography
                variant="caption"
                as="span"
                className="inline-flex items-center px-1 py-1 text-subtle-foreground"
              >
                +{remainingCount}
              </Typography>
            </li>
          )}
        </ul>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-surface pt-6">
          <Link
            href={`/projects/${project.slug}`}
            prefetch={false}
            className="inline-flex items-center gap-2 border border-foreground px-5 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {ctaLabel}
            <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>

          {safeLiveUrl && (
            <a
              href={safeLiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={TYPOGRAPHY_STYLES.linkSecondary}
            >
              Live ↗
            </a>
          )}
          {safeGithubUrl && (
            <a
              href={safeGithubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={TYPOGRAPHY_STYLES.linkSecondary}
            >
              GitHub ↗
            </a>
          )}
        </div>
      </div>
    </FadeIn>
  );
}

// ─── Secondary row: compact numbered list for remaining projects ───────────────
function ProjectRow({
  project,
  index,
  ctaLabel
}: ProjectRowProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const visibleTechnologies = project.technologies.slice(0, 4);
  const remainingCount = Math.max(0, project.technologies.length - visibleTechnologies.length);
  const safeLiveUrl = isRenderableExternalUrl(project.links.liveUrl)
    ? project.links.liveUrl
    : undefined;
  const safeGithubUrl = isRenderableExternalUrl(project.links.githubUrl)
    ? project.links.githubUrl
    : undefined;
  const displayDate = formatMonthYear(project.completedAt, 'short');
  // Display index offset by 1 because FeaturedProjectCard takes index 0
  const displayIndex = String(index + 2).padStart(2, '0');

  return (
    <FadeIn
      as="article"
      delay={180 + index * 70}
      className="group border-b border-surface last:border-b-0"
      aria-labelledby={`project-title-${index}`}
    >
      {/* ── Collapsed header row ─────────────────────────────── */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start gap-4 py-5 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 sm:items-center sm:gap-6"
        aria-expanded={expanded}
        aria-controls={`project-body-${index}`}
      >
        {/* Ghost number */}
        <span
          aria-hidden="true"
          className="w-8 flex-shrink-0 font-mono text-xs font-semibold tabular-nums text-foreground/20 transition-colors duration-300 group-hover:text-foreground/50 sm:text-sm"
        >
          {displayIndex}
        </span>

        {/* Title + category */}
        <div className="min-w-0 flex-1">
          <div className="min-w-0">
            <Typography
              variant="h4"
              as="h3"
              id={`project-title-${index}`}
              className="mb-0.5 truncate font-semibold transition-colors duration-200"
            >
              {project.title}
            </Typography>
            <Typography
              variant="caption"
              as="p"
              className="text-subtle-foreground"
            >
              {project.category}
            </Typography>
          </div>
        </div>

        {/* Tech preview — hidden on xs, shown sm+ */}
        <ul className="hidden flex-shrink-0 flex-wrap justify-end gap-1.5 sm:flex" aria-hidden="true">
          {visibleTechnologies.map((tech) => (
            <li key={tech}>
              <span
                className={`inline-flex items-center border ${SURFACE.hairline} px-2 py-0.5 text-xs text-muted-foreground transition-colors duration-300 group-hover:border-foreground/20`}
              >
                {tech}
              </span>
            </li>
          ))}
          {remainingCount > 0 && (
            <li>
              <span className="inline-flex items-center px-1 py-0.5 text-xs text-subtle-foreground">
                +{remainingCount}
              </span>
            </li>
          )}
        </ul>

        {/* Date + expand toggle */}
        <div className="flex flex-shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-4">
          <Typography
            variant="caption"
            as="time"
            dateTime={project.completedAt}
            className="whitespace-nowrap tabular-nums text-subtle-foreground"
          >
            {displayDate}
          </Typography>
          <span
            aria-hidden="true"
            className={`text-foreground/30 transition-all duration-300 group-hover:text-foreground/60 ${expanded ? 'rotate-45' : ''}`}
          >
            +
          </span>
        </div>
      </button>

      {/* ── Expanded body ────────────────────────────────────── */}
      {/* Using inline max-height trick for smooth accordion without JS height calc */}
      <div
        id={`project-body-${index}`}
        className={`overflow-hidden transition-all duration-400 ease-in-out ${expanded ? 'max-h-[600px] pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
        aria-hidden={!expanded}
      >
        <div className="ml-12 sm:ml-14">
          {/* Tech pills for mobile (visible only below sm) */}
          <ul
            className="mb-4 flex flex-wrap gap-1.5 sm:hidden"
            aria-label={`${project.title} technology stack`}
          >
            {project.technologies.map((tech) => (
              <li key={tech}>
                <span
                  className={`inline-flex items-center border ${SURFACE.hairline} px-2 py-1 text-xs text-muted-foreground`}
                >
                  {tech}
                </span>
              </li>
            ))}
          </ul>

          {/* Description */}
          <Typography
            variant="body-sm"
            as="p"
            className="mb-5 text-muted-foreground"
          >
            {project.description}
          </Typography>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              href={`/projects/${project.slug}`}
              prefetch={false}
              className={TYPOGRAPHY_STYLES.linkPrimary}
            >
              {ctaLabel} →
            </Link>
            {(safeLiveUrl || safeGithubUrl) && (
              <span className="hidden h-3 w-px bg-surface-divider sm:block" aria-hidden="true" />
            )}
            {safeLiveUrl && (
              <a
                href={safeLiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={TYPOGRAPHY_STYLES.linkSecondary}
              >
                Live ↗
              </a>
            )}
            {safeGithubUrl && (
              <a
                href={safeGithubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={TYPOGRAPHY_STYLES.linkSecondary}
              >
                GitHub ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

// ─── Main section ──────────────────────────────────────────────────────────────
export default function ProjectsSection({
  projects,
  content
}: ProjectsSectionProps): React.JSX.Element {
  const [visible, setVisible] = useState(content.initialCount);
  const [featured, ...rest] = projects;
  const visibleRest = rest.slice(0, Math.max(0, visible - 1));
  const hasMore = visible < projects.length;

  return (
    <SectionFrame
      id="work"
      headingId="work-heading"
      eyebrow={content.eyebrow}
      title={content.title}
      intro={content.intro}
    >
      <div className="space-y-2">
        {/* Featured card — always shown if projects exist */}
        {featured && (
          <FeaturedProjectCard
            project={featured}
            ctaLabel={content.ctaLabel}
          />
        )}

        {/* Secondary rows */}
        {visibleRest.length > 0 && (
          <div className="mt-2 divide-y divide-foreground/5">
            {visibleRest.map((project, index) => (
              <ProjectRow
                key={project.slug}
                project={project}
                index={index}
                ctaLabel={content.ctaLabel}
              />
            ))}
          </div>
        )}
      </div>

      {/* Load more / count footer */}
      <div className="mt-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-surface-divider/50" />
        {hasMore ? (
          <>
            <Typography
              variant="caption"
              className="whitespace-nowrap tabular-nums text-subtle-foreground"
            >
              {visible} of {projects.length}
            </Typography>
            <button
              type="button"
              onClick={() =>
                setVisible((count) =>
                  Math.min(count + content.increment, projects.length)
                )
              }
              className={`${TYPOGRAPHY_STYLES.linkSecondary} whitespace-nowrap`}
            >
              {content.loadMoreLabel}
            </button>
          </>
        ) : (
          <Typography variant="caption" className="whitespace-nowrap text-subtle-foreground">
            All {projects.length} projects
          </Typography>
        )}
        <div className="h-px flex-1 bg-surface-divider/50" />
      </div>
    </SectionFrame>
  );
}