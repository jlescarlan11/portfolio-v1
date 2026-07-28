import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { projects } from '@/features/projects';
import { siteConfig } from '@/shared/site/config';
import ProjectPage, { generateMetadata } from './page';

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
    'renders the aligned case-study content for $slug',
    async (project) => {
      const page = await ProjectPage({
        params: Promise.resolve({ slug: project.slug })
      });

      render(page);

      expect(screen.getByText(project.caseStudy.summary)).toBeVisible();
      expect(screen.getByText(project.caseStudy.roleScope.role)).toBeVisible();
      for (const ownership of project.caseStudy.roleScope.ownership) {
        expect(screen.getByText(ownership)).toBeVisible();
      }
      for (const paragraph of project.caseStudy.overview) {
        expect(screen.getByText(paragraph)).toBeVisible();
      }
      for (const impact of project.caseStudy.impact) {
        expect(screen.getByText(impact.value)).toBeVisible();
        expect(screen.getByText(impact.label)).toBeVisible();
        expect(screen.getByText(impact.context)).toBeVisible();
      }
      for (const decision of project.caseStudy.decisions) {
        expect(screen.getByText(decision.title)).toBeVisible();
        expect(screen.getByText(decision.constraint)).toBeVisible();
        expect(screen.getByText(decision.decision)).toBeVisible();
        expect(screen.getByText(decision.rationale)).toBeVisible();
        if (decision.tradeoff) {
          expect(screen.getByText(decision.tradeoff)).toBeVisible();
        }
        if (decision.validation) {
          expect(screen.getByText(decision.validation)).toBeVisible();
        }
      }
      for (const highlight of project.caseStudy.highlights) {
        expect(screen.getByText(highlight)).toBeVisible();
      }
      for (const technology of project.technologies) {
        expect(screen.getByText(technology)).toBeVisible();
      }
    }
  );

  it('provides the target used by the global skip link', async () => {
    const page = await ProjectPage({
      params: Promise.resolve({ slug: 'rent-n-roll' })
    });

    render(page);

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');
  });

  it('gives case-study sections their visible labels as accessible names', async () => {
    const page = await ProjectPage({
      params: Promise.resolve({ slug: 'rent-n-roll' })
    });

    render(page);

    for (const name of [
      'Overview',
      'Impact',
      'Engineering Decisions',
      'Highlights',
      'Gallery'
    ]) {
      expect(screen.getByRole('region', { name })).toBeInTheDocument();
    }
  });

  it('exposes case-study sections in the heading outline', async () => {
    const page = await ProjectPage({
      params: Promise.resolve({ slug: 'rent-n-roll' })
    });

    render(page);

    for (const name of [
      'Overview',
      'Impact',
      'Engineering Decisions',
      'Highlights',
      'Gallery'
    ]) {
      expect(
        screen.getByRole('heading', { level: 2, name })
      ).toBeInTheDocument();
    }
  });

  it('orders evidence between the overview and the established sections', async () => {
    const page = await ProjectPage({
      params: Promise.resolve({ slug: 'rent-n-roll' })
    });

    render(page);

    const headings = [
      'Overview',
      'Impact',
      'Engineering Decisions',
      'Highlights',
      'Gallery'
    ].map((name) => screen.getByRole('heading', { level: 2, name }));

    for (let index = 0; index < headings.length - 1; index += 1) {
      expect(
        headings[index].compareDocumentPosition(headings[index + 1]) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    }
  });

  it('announces that project destinations open in a new tab', async () => {
    const livePage = await ProjectPage({
      params: Promise.resolve({ slug: 'rent-n-roll' })
    });
    const { unmount } = render(livePage);

    expect(
      screen.getByRole('link', {
        name: 'View live (opens in new tab)'
      })
    ).toMatchObject({
      target: '_blank',
      rel: 'noopener noreferrer'
    });

    unmount();
    const sourcePage = await ProjectPage({
      params: Promise.resolve({ slug: 'health' })
    });
    render(sourcePage);

    expect(
      screen.getByRole('link', {
        name: 'GitHub (opens in new tab)'
      })
    ).toMatchObject({
      target: '_blank',
      rel: 'noopener noreferrer'
    });
  });

  it('renders each established project destination exactly once', async () => {
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
  });
});

describe('generateMetadata', () => {
  it.each(projects)(
    'uses the aligned summary for $slug descriptions',
    async (project) => {
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

  it.each(['health', 'job-pipeline'])(
    'uses the raster fallback for %s instead of missing or SVG artwork',
    async (slug) => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug })
      });
      const expectedImage = {
        url: siteConfig.seo.socialImage.path,
        alt: siteConfig.seo.socialImage.alt
      };

      expect(metadata.openGraph).toMatchObject({
        images: [expectedImage]
      });
      expect(metadata.twitter).toMatchObject({
        images: [expectedImage]
      });
    }
  );
});
