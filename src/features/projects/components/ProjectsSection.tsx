'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import SectionFrame from '@/shared/components/SectionFrame';
import { Typography } from '@/shared/components/Typography';
import { FadeIn } from '@/shared/components/FadeIn';
import { formatMonthYear, isRenderableExternalUrl } from '@/shared/lib/project';
import { SURFACE, TYPOGRAPHY_STYLES } from '@/shared/styles/shared';
import type { ProjectRecord, ProjectsSectionContent } from '@/features/projects/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectsSectionProps {
  projects: ProjectRecord[];
  content: ProjectsSectionContent;
}

// ─── LiveBadge ────────────────────────────────────────────────────────────────

interface LiveBadgeProps {
  url: string;
  projectTitle: string;
}

function LiveBadge({ url, projectTitle }: LiveBadgeProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Live site for ${projectTitle} (opens in new tab)`}
      className="inline-flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping bg-foreground opacity-20" />
        <span className="relative inline-flex h-1.5 w-1.5 bg-foreground/70" />
      </span>
      <span className="caption uppercase tracking-[0.14em] text-foreground">Live</span>
    </a>
  );
}

// ─── CategoryPill ─────────────────────────────────────────────────────────────

interface CategoryPillProps {
  category: string;
}

function CategoryPill({ category }: CategoryPillProps) {
  const label = category.split(' / ')[0];
  return (
    <span className={`inline-block border ${SURFACE.hairline} px-2 py-0.5`}>
      <span className="caption uppercase tracking-[0.12em] text-subtle-foreground">{label}</span>
    </span>
  );
}

// ─── CaseFileCard (featured / full-width) ─────────────────────────────────────

interface CaseFileCardProps {
  project: ProjectRecord;
  ctaLabel: string;
}

function CaseFileCard({ project, ctaLabel }: CaseFileCardProps) {
  const { slug, title, category, technologies, completedAt, links, caseStudy } = project;
  const hasLive = isRenderableExternalUrl(links.liveUrl);

  return (
    <FadeIn
      as="article"
      delay={80}
      aria-labelledby="case-file-featured-title"
      className="pl-5 pr-6 pt-5 pb-5 bg-surface"
    >
      {/* Header row */}
      <header className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="caption font-mono tabular-nums text-subtle-foreground tracking-[0.14em]">
              No.&nbsp;01
            </span>
            {hasLive && <LiveBadge url={links.liveUrl!} projectTitle={title} />}
          </div>
          <Typography
            variant="h3"
            as="h3"
            id="case-file-featured-title"
            className="text-foreground leading-tight"
          >
            {title}
          </Typography>
        </div>

        <div className="text-right space-y-1 shrink-0">
          <p className="caption text-subtle-foreground uppercase tracking-[0.12em]">
            {category.split(' / ')[1] ?? category}
          </p>
          <p className="caption font-mono tabular-nums text-subtle-foreground">
            {formatMonthYear(completedAt, 'short')}
          </p>
        </div>
      </header>

      {/* Pull-quote */}
      <blockquote className="border-l border-foreground/40 pl-4 mb-5" aria-label="Project summary">
        <p className="body text-muted-foreground">{caseStudy.summary}</p>
      </blockquote>

      {/* Highlights */}
      {caseStudy.highlights.length > 0 && (
        <ul className="grid grid-cols-1 gap-y-2 mb-6" aria-label="Project highlights">
          {caseStudy.highlights.map((h) => (
            <li key={h} className="flex items-start gap-2">
              <span className="mt-[0.5em] w-1.5 h-px bg-foreground/40 shrink-0" aria-hidden="true" />
              <span className="body-sm text-muted-foreground">{h}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Footer: tech stack + CTA */}
      <footer className={`flex flex-wrap items-center justify-between gap-4 pt-4 border-t ${SURFACE.hairline}`}>
        <ul className="flex flex-wrap gap-1.5" aria-label={`${title} technology stack`}>
          {technologies.map((tech) => (
            <li key={tech}>
              <span className={`caption font-mono px-2 py-0.5 border ${SURFACE.hairline} text-subtle-foreground whitespace-nowrap`}>
                {tech}
              </span>
            </li>
          ))}
        </ul>
        <nav aria-label={`Links for ${title}`}>
          <Link
            href={`/projects/${slug}`}
            className={TYPOGRAPHY_STYLES.linkPrimary}
            aria-label={`${ctaLabel}: ${title}`}
          >
            {ctaLabel} →
          </Link>
        </nav>
      </footer>
    </FadeIn>
  );
}

// ─── DossierTile (compact grid card) ──────────────────────────────────────────

interface DossierTileProps {
  project: ProjectRecord;
  tileIndex: number;
  ctaLabel: string;
}

function DossierTile({ project, tileIndex, ctaLabel }: DossierTileProps) {
  const { slug, title, category, technologies, completedAt, links, caseStudy } = project;
  const fileNumber = String(tileIndex + 1).padStart(2, '0');
  const hasLive = isRenderableExternalUrl(links.liveUrl);
  const delay = tileIndex * 80 + 80;

  const measureRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(technologies.length);

  useLayoutEffect(() => {
    const measure = measureRef.current;
    const row = rowRef.current;
    if (!measure || !row) return;

    const recalc = () => {
      const rowWidth = row.offsetWidth;
      const gap = 6; // gap-1.5

      const pillEls = Array.from(measure.querySelectorAll<HTMLElement>('[data-pill]'));
      const plusEl = measure.querySelector<HTMLElement>('[data-plus]');
      const dateEl = measure.querySelector<HTMLElement>('[data-date]');

      if (!pillEls.length) return;

      const pillWidths = pillEls.map((el) => el.offsetWidth);
      const plusWidth = plusEl?.offsetWidth ?? 36;
      const dateWidth = (dateEl?.offsetWidth ?? 0) + gap;

      let available = rowWidth - dateWidth;
      let fit = 0;

      for (let i = 0; i < pillWidths.length; i++) {
        const isLast = i === pillWidths.length - 1;
        const pillCost = pillWidths[i] + gap;
        const plusCost = isLast ? 0 : plusWidth + gap;

        if (available < pillCost + plusCost) break;
        available -= pillCost;
        fit++;
        if (isLast) break;
      }

      setVisibleCount(Math.max(1, fit));
    };

    recalc();
    if (typeof ResizeObserver !== 'function') {
      return;
    }

    const observer = new ResizeObserver(recalc);
    observer.observe(row);
    return () => observer.disconnect();
  }, [technologies]);

  const overflowCount = technologies.length - visibleCount;
  const pillClass = `caption font-mono px-2 py-0.5 border ${SURFACE.hairline} text-subtle-foreground whitespace-nowrap`;

  return (
    <FadeIn
      as="article"
      delay={delay}
      aria-labelledby={`dossier-tile-title-${tileIndex}`}
      className="relative flex flex-col bg-surface h-full"
    >
      <div className="px-4 pt-4 pb-0">
        <CategoryPill category={category} />
      </div>

      <div className="flex flex-col flex-1 px-4 pt-3 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <span className="caption font-mono tabular-nums text-subtle-foreground/60 tracking-[0.12em]">
            No.&nbsp;{fileNumber}
          </span>
          {hasLive && <LiveBadge url={links.liveUrl!} projectTitle={title} />}
        </div>

        <Typography
          variant="h4"
          as="h3"
          id={`dossier-tile-title-${tileIndex}`}
          className="text-foreground leading-snug mb-3"
        >
          {title}
        </Typography>

        <p className="body-sm text-muted-foreground flex-1 mb-4">
          {caseStudy.highlights[0] ?? caseStudy.summary}
        </p>

        {/* Hidden measurement layer — all pills rendered at full width for sampling */}
        <div className="h-0 overflow-hidden" aria-hidden="true">
          <div ref={measureRef} className="flex gap-1.5">
            {technologies.map((tech) => (
              <span key={tech} data-pill className={pillClass}>{tech}</span>
            ))}
            <span data-plus className={pillClass}>+99</span>
            <span data-date className="caption font-mono tabular-nums whitespace-nowrap">
              {formatMonthYear(completedAt, 'short')}
            </span>
          </div>
        </div>

        <div ref={rowRef} className={`flex items-center gap-1.5 mb-4 pt-3 border-t ${SURFACE.hairline}`}>
          {technologies.slice(0, visibleCount).map((tech) => (
            <span key={tech} className={pillClass}>{tech}</span>
          ))}
          {overflowCount > 0 && (
            <span className={pillClass}>+{overflowCount}</span>
          )}
          <span className="ml-auto caption font-mono tabular-nums text-subtle-foreground/60 shrink-0 whitespace-nowrap">
            {formatMonthYear(completedAt, 'short')}
          </span>
        </div>

        <nav aria-label={`Links for ${title}`}>
          <Link
            href={`/projects/${slug}`}
            className={TYPOGRAPHY_STYLES.linkPrimary}
            aria-label={`${ctaLabel}: ${title}`}
          >
            {ctaLabel} →
          </Link>
        </nav>
      </div>
    </FadeIn>
  );
}

// ─── Main section ──────────────────────────────────────────────────────────────

export default function ProjectsSection({ projects, content }: ProjectsSectionProps) {
  if (!projects || projects.length === 0) return null;

  const [featured, ...rest] = projects;

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
        {featured && (
          <CaseFileCard project={featured} ctaLabel={content.ctaLabel} />
        )}

        {rest.length > 0 && (
          <div
            className={`border-t ${SURFACE.hairline} bg-surface-strong grid grid-cols-1 md:grid-cols-3 gap-px`}
            role="list"
            aria-label="Additional projects"
          >
            {rest.map((project, i) => (
              <div key={project.slug} role="listitem">
                <DossierTile
                  project={project}
                  tileIndex={i + 1}
                  ctaLabel={content.ctaLabel}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionFrame>
  );
}
