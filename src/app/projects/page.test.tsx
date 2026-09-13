import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { projects, projectsSectionContent } from '@/features/projects';
import ProjectsPage, { metadata } from './page';

beforeEach(() => {
  vi.stubGlobal('React', React);
  vi.stubGlobal('IntersectionObserver', undefined);
});

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(document, 'fonts');
  vi.unstubAllGlobals();
});

describe('ProjectsPage', () => {
  it('renders every project as a case-study link', () => {
    render(<ProjectsPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'All projects' })
    ).toBeVisible();
    expect(screen.getByText(`${projects.length} case studies`)).toBeVisible();

    const list = screen.getByRole('list', { name: 'All projects' });
    expect(list).toHaveAttribute('data-layout', 'archive');
    expect(list).toHaveClass(
      'grid-cols-1'
    );

    const headings = within(list).getAllByRole('heading', { level: 3 });
    expect(headings.map(heading => heading.textContent)).toEqual(
      projects.map(project => project.title)
    );

    for (const project of projects) {
      expect(
        within(list).getByRole('heading', { name: project.title })
      ).toBeVisible();
      expect(
        within(list).getByRole('link', {
          name: `${projectsSectionContent.ctaLabel}: ${project.title}`
        })
      ).toHaveAttribute('href', `/projects/${project.slug}`);
      expect(
        within(list).getByRole('img', {
          name: project.listing.thumbnail.alt
        })
      ).toBeVisible();
    }
  });

  it('keeps PACU capability scope visible in the archive', () => {
    render(<ProjectsPage />);

    const pacuLink = screen.getByRole('link', {
      name: `${projectsSectionContent.ctaLabel}: PACU`
    });
    expect(within(pacuLink).getByText('WordPress')).toBeVisible();
    expect(within(pacuLink).getByText('Airtable')).toBeVisible();
    expect(within(pacuLink).getByText('Web Development')).toBeVisible();
  });

  it('keeps the skip-link target and return path available', () => {
    render(<ProjectsPage />);

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');
    expect(
      screen.getByRole('link', { name: 'Back to projects' })
    ).toHaveAttribute('href', '/#work');
  });

  it('publishes route-specific metadata', () => {
    expect(metadata.title).toBe('All Projects');
    expect(metadata.alternates).toMatchObject({
      canonical: expect.stringMatching(/\/projects$/)
    });
    expect(metadata.openGraph).toMatchObject({
      url: expect.stringMatching(/\/projects$/)
    });
  });
});
