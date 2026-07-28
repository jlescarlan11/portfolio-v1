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
      for (const paragraph of project.caseStudy.overview) {
        expect(screen.getByText(paragraph)).toBeVisible();
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

    for (const name of ['Overview', 'Highlights', 'Gallery']) {
      expect(screen.getByRole('region', { name })).toBeInTheDocument();
    }
  });

  it('exposes case-study sections in the heading outline', async () => {
    const page = await ProjectPage({
      params: Promise.resolve({ slug: 'rent-n-roll' })
    });

    render(page);

    for (const name of ['Overview', 'Highlights', 'Gallery']) {
      expect(
        screen.getByRole('heading', { level: 2, name })
      ).toBeInTheDocument();
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
