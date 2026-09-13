import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { projects } from '@/features/projects';
import ProjectPage, {
  generateMetadata,
  ProjectHero
} from './page';

beforeEach(() => {
  vi.stubGlobal('React', React);
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn()
    }))
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('ProjectPage', () => {
  it.each(projects)('shows a concise project story for $slug', async project => {
    render(await ProjectPage({ params: Promise.resolve({ slug: project.slug }) }));
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(screen.getByText(project.caseStudy.summary)).toBeVisible();
    expect(screen.getByText(project.caseStudy.roleScope.role)).toBeVisible();
    for (const item of project.caseStudy.roleScope.ownership) expect(screen.getByText(item)).toBeVisible();
    for (const item of project.caseStudy.impact.filter(item => item.kind === 'product')) expect(screen.getByText(item.context)).toBeVisible();
    for (const visual of project.caseStudy.visuals) expect(screen.getByRole('img', { name: visual.alt })).toBeVisible();
    for (const technology of project.technologies) expect(screen.getByText(technology)).toBeVisible();
    expect(screen.queryByRole('navigation', { name: 'Case study sections' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Engineering Decisions' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to projects/ })).toHaveAttribute('href', '/projects');
    for (const [label, url] of [['Visit website', project.links.liveUrl], ['View code', project.links.githubUrl]]) {
      if (!url) continue;
      const link = screen.getByRole('link', { name: new RegExp(label!) });
      expect(link).toHaveAttribute('href', url);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it.each([
    ['rent-n-roll', 'health'],
    ['health', 'pricecraft'],
    ['pricecraft', 'regex2nfa'],
    ['regex2nfa', 'job-pipeline'],
    ['job-pipeline', 'pacu'],
    ['pacu', 'rent-n-roll']
  ])('links %s to the source-ordered next project %s', async (slug, nextSlug) => {
    const nextProject = projects.find(project => project.slug === nextSlug);
    if (!nextProject) throw new Error(`${nextSlug} fixture is missing`);
    const page = await ProjectPage({
      params: Promise.resolve({ slug })
    });

    render(page);

    const card = screen.getByText('Next project').closest('a');
    expect(card).not.toBeNull();
    expect(card).toHaveAttribute('href', `/projects/${nextSlug}`);
    expect(card).not.toHaveAttribute('target');
    expect(within(card!).getByText(nextProject.title)).toBeVisible();
    expect(
      within(card!).getByText(nextProject.caseStudy.summary)
    ).toBeVisible();
  });
});

describe('ProjectHero', () => {
  it('uses the project logo when no screenshot is available', () => {
    render(
      <ProjectHero
        fallbackSrc="/project/example.svg"
        title="Example project"
      />
    );

    expect(
      screen.getByRole('img', { name: 'Example project logo' })
    ).toBeVisible();
  });

  it('renders an accessible placeholder when no screenshot or logo is available', () => {
    render(<ProjectHero fallbackSrc="" title="Example project" />);

    expect(
      screen.getByRole('img', { name: 'Example project preview unavailable' })
    ).toBeVisible();
  });
});

describe('generateMetadata', () => {
  it.each(projects)(
    'uses the case-study summary for $slug descriptions',
    async project => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: project.slug })
      });

      expect(metadata.description).toBe(project.caseStudy.summary);
      expect(metadata.openGraph).toMatchObject({
        description: project.caseStudy.summary
      });
      expect(metadata.twitter).toMatchObject({
        description: project.caseStudy.summary
      });
    }
  );

  it.each(projects)(
    'uses the raster hero visual for $slug social metadata',
    async project => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: project.slug })
      });
      const hero = project.caseStudy.visuals.find(
        visual => visual.kind === 'hero'
      );
      if (!hero) throw new Error(`${project.title} hero fixture is missing`);

      expect(metadata.openGraph).toMatchObject({
        images: [{ url: hero.src, alt: hero.alt }]
      });
      expect(metadata.twitter).toMatchObject({
        images: [{ url: hero.src, alt: hero.alt }]
      });
    }
  );
});
