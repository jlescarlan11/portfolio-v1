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
  it.each(projects)(
    'renders the structured case-study content for $slug',
    async project => {
      const page = await ProjectPage({
        params: Promise.resolve({ slug: project.slug })
      });

      render(page);

      expect(screen.getByText(project.caseStudy.summary)).toBeVisible();
      expect(screen.getByText(project.caseStudy.roleScope.role)).toBeVisible();
      expect(screen.getByText(project.caseStudy.problem.audience)).toBeVisible();
      expect(screen.getByText(project.caseStudy.problem.challenge)).toBeVisible();
      expect(screen.getByText(project.caseStudy.problem.stakes)).toBeVisible();
      expect(screen.getByText(project.caseStudy.solution.summary)).toBeVisible();

      for (const ownership of project.caseStudy.roleScope.ownership) {
        expect(screen.getByText(ownership)).toBeVisible();
      }
      for (const step of project.caseStudy.solution.workflow) {
        expect(screen.getByText(step)).toBeVisible();
      }
      for (const outcome of project.caseStudy.impact) {
        expect(screen.getByText(outcome.value)).toBeVisible();
        expect(screen.getByText(outcome.label)).toBeVisible();
        expect(screen.getByText(outcome.context)).toBeVisible();
      }
      for (const decision of project.caseStudy.decisions) {
        expect(screen.getByText(decision.title)).toBeVisible();
        expect(screen.getByText(decision.constraint)).toBeVisible();
        expect(screen.getByText(decision.decision)).toBeVisible();
        expect(screen.getByText(decision.rationale)).toBeVisible();
      }
      for (const learning of [
        ...project.caseStudy.learnings.lessons,
        ...project.caseStudy.learnings.improvements,
        ...project.caseStudy.learnings.unvalidated
      ]) {
        expect(screen.getByText(learning)).toBeVisible();
      }
      for (const technology of project.technologies) {
        expect(screen.getByText(technology)).toBeVisible();
      }
      for (const visual of project.caseStudy.visuals) {
        expect(screen.getByRole('img', { name: visual.alt })).toBeVisible();
        expect(screen.getByText(visual.caption)).toBeVisible();
      }
    }
  );

  it('preserves the skip-link target and top portfolio return link', async () => {
    const page = await ProjectPage({
      params: Promise.resolve({ slug: 'rent-n-roll' })
    });

    render(page);

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');
    expect(
      screen.getAllByRole('link', { name: /Back to selected work/ })[0]
    ).toHaveAttribute('href', '/#work');
  });

  it('exposes the required case-study section names in order and removes legacy headings', async () => {
    const page = await ProjectPage({
      params: Promise.resolve({ slug: 'rent-n-roll' })
    });

    render(page);

    const headings = [
      'Problem',
      'Solution',
      'Engineering Decisions',
      'Outcomes',
      'Learnings and Next Steps'
    ].map(name => screen.getByRole('heading', { level: 2, name }));

    for (let index = 0; index < headings.length - 1; index += 1) {
      expect(
        headings[index].compareDocumentPosition(headings[index + 1]) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    }

    for (const legacyHeading of ['Overview', 'Impact', 'Highlights', 'Gallery']) {
      expect(
        screen.queryByRole('heading', { name: legacyHeading })
      ).not.toBeInTheDocument();
    }
  });

  it('keeps product outcomes separate from implementation statistics', async () => {
    const page = await ProjectPage({
      params: Promise.resolve({ slug: 'pricecraft' })
    });

    render(page);

    const productGroup = screen
      .getByRole('heading', { name: 'Product and delivery' })
      .closest('div');
    const implementationGroup = screen
      .getByRole('heading', { name: 'Implementation evidence' })
      .closest('div');
    expect(productGroup).not.toBeNull();
    expect(implementationGroup).not.toBeNull();
    expect(within(productGroup!).getByText('Receipt to catalog')).toBeVisible();
    expect(within(productGroup!).queryByText('300+ tests')).not.toBeInTheDocument();
    expect(
      within(implementationGroup!).getByText('300+ tests')
    ).toBeVisible();
  });

  it('renders one hero visual and associates supporting visuals with their narrative section', async () => {
    const rent = projects.find(project => project.slug === 'rent-n-roll');
    if (!rent) throw new Error('Rent N Roll fixture is missing');

    const page = await ProjectPage({
      params: Promise.resolve({ slug: rent.slug })
    });

    render(page);

    const hero = rent.caseStudy.visuals.find(visual => visual.kind === 'hero');
    const supporting = rent.caseStudy.visuals.find(
      visual => visual.kind === 'supporting'
    );
    if (!hero || !supporting) throw new Error('Expected visual fixtures');

    expect(screen.getAllByRole('img', { name: hero.alt })).toHaveLength(1);
    const solution = screen.getByRole('region', { name: 'Solution' });
    expect(
      within(solution).getByRole('img', { name: supporting.alt })
    ).toBeVisible();
    expect(within(solution).getByText(supporting.caption)).toBeVisible();
  });

  it('announces external destinations and renders each one exactly once', async () => {
    const page = await ProjectPage({
      params: Promise.resolve({ slug: 'pricecraft' })
    });

    render(page);

    expect(
      screen.getAllByRole('link', {
        name: 'View live (opens in new tab)'
      })
    ).toHaveLength(1);
    expect(
      screen.getAllByRole('link', {
        name: 'GitHub (opens in new tab)'
      })
    ).toHaveLength(1);
    for (const link of screen.getAllByRole('link', {
      name: /opens in new tab/
    })) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
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
