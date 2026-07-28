'use client';

import { useEffect, useState } from 'react';
import { Typography } from '@/shared/components/Typography';

const sections = [
  { id: 'problem', label: 'Problem' },
  { id: 'solution', label: 'Solution' },
  { id: 'decisions', label: 'Engineering Decisions' },
  { id: 'outcomes', label: 'Outcomes' },
  { id: 'learnings', label: 'Learnings' }
] as const;

type ProjectSectionId = (typeof sections)[number]['id'];

const sectionIds = new Set<ProjectSectionId>(
  sections.map(section => section.id)
);

function getHashSection(): ProjectSectionId | undefined {
  if (typeof window === 'undefined') return undefined;

  try {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    return sectionIds.has(hash as ProjectSectionId)
      ? (hash as ProjectSectionId)
      : undefined;
  } catch {
    return undefined;
  }
}

export function ProjectSectionNav(): React.JSX.Element {
  const [activeSection, setActiveSection] =
    useState<ProjectSectionId>('problem');

  useEffect(() => {
    const elements = sections
      .map(section => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));
    if (elements.length === 0) return;

    let animationFrameId: number | undefined;

    const syncFromGeometry = (): void => {
      const marker = Math.min(window.innerHeight * 0.35, 280);
      let nextSection = elements[0].id as ProjectSectionId;

      for (const element of elements) {
        if (element.getBoundingClientRect().top > marker) break;
        nextSection = element.id as ProjectSectionId;
      }

      const scrollHeight = document.documentElement.scrollHeight;
      const documentEnd =
        scrollHeight > window.innerHeight &&
        window.scrollY + window.innerHeight >= scrollHeight - 2;
      if (documentEnd) {
        nextSection = elements[elements.length - 1].id as ProjectSectionId;
      }

      setActiveSection(nextSection);
    };

    const scheduleGeometrySync = (): void => {
      if (animationFrameId !== undefined) return;
      if (typeof window.requestAnimationFrame !== 'function') {
        syncFromGeometry();
        return;
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = undefined;
        syncFromGeometry();
      });
    };

    const syncFromLocation = (): void => {
      const hashSection = getHashSection();
      if (hashSection) setActiveSection(hashSection);
      else if (typeof IntersectionObserver !== 'undefined') {
        scheduleGeometrySync();
      }
    };

    syncFromLocation();
    window.addEventListener('hashchange', syncFromLocation);
    window.addEventListener('popstate', syncFromLocation);

    if (typeof IntersectionObserver === 'undefined') {
      return () => {
        window.removeEventListener('hashchange', syncFromLocation);
        window.removeEventListener('popstate', syncFromLocation);
        if (
          animationFrameId !== undefined &&
          typeof window.cancelAnimationFrame === 'function'
        ) {
          window.cancelAnimationFrame(animationFrameId);
        }
      };
    }

    const observer = new IntersectionObserver(scheduleGeometrySync, {
      rootMargin: '-20% 0px -65% 0px',
      threshold: [0, 0.01, 0.5]
    });
    for (const element of elements) observer.observe(element);
    window.addEventListener('resize', scheduleGeometrySync);
    window.addEventListener('load', scheduleGeometrySync);

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(scheduleGeometrySync);
    for (const element of elements) resizeObserver?.observe(element);

    scheduleGeometrySync();
    return () => {
      observer.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener('hashchange', syncFromLocation);
      window.removeEventListener('popstate', syncFromLocation);
      window.removeEventListener('resize', scheduleGeometrySync);
      window.removeEventListener('load', scheduleGeometrySync);
      if (
        animationFrameId !== undefined &&
        typeof window.cancelAnimationFrame === 'function'
      ) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <nav aria-label="Case study sections" className="border-t border-surface pt-5">
      <Typography
        variant="caption"
        as="p"
        className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle-foreground"
      >
        On this page
      </Typography>
      <ol className="space-y-1">
        {sections.map((section, index) => {
          const isActive = activeSection === section.id;

          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={isActive ? 'location' : undefined}
                onClick={() => setActiveSection(section.id)}
                className={[
                  'group grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2 border-l border-transparent px-2 py-1.5',
                  'text-muted-foreground transition-colors hover:text-foreground',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground',
                  isActive
                    ? 'border-surface-strong bg-surface-tint text-foreground'
                    : ''
                ].join(' ')}
              >
                <span
                  aria-hidden="true"
                  className="font-mono text-[10px] tabular-nums text-subtle-foreground"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <Typography
                  variant="body-sm"
                  as="span"
                  className="leading-5 text-current"
                >
                  {section.label}
                </Typography>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
