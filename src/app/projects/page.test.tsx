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
    expect(screen.getByText(`${projects.length} project stories`)).toBeVisible();

    const list = screen.getByRole('list', { name: 'All projects' });
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

  it('lists the featured work first and retains the rest of the catalog in order', () => {
    render(<ProjectsPage />);

    const catalog = screen.getByRole('list', { name: 'All projects' });
    const links = within(catalog).getAllByRole('link');

    expect(links.map(link => link.getAttribute('href'))).toEqual([
      '/projects/pacu',
      '/projects/pricecraft',
      '/projects/health',
      '/projects/rent-n-roll',
      '/projects/regex2nfa',
      '/projects/job-pipeline'
    ]);
  });

  it.each([
    ['PACU', 'Client contract'],
    ['PriceCraft', 'Personal product'],
    ['HEALTH', 'Health-track semifinalist'],
    ['Rent N Roll', 'Solo pre-launch marketplace'],
    ['Regex2NFA', 'Class project'],
    ['Job Pipeline', 'Automation']
  ])('shows the title and work type before the %s preview image', (title, workType) => {
    render(<ProjectsPage />);

    const link = screen.getByRole('link', {
      name: `${projectsSectionContent.ctaLabel}: ${title}`
    });
    const heading = within(link).getByRole('heading', { name: title });
    const type = within(link).getByText(workType, { selector: 'p' });
    const image = within(link).getByRole('img');

    expect(type).toBeVisible();
    expect(heading.compareDocumentPosition(image) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(type.compareDocumentPosition(image) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
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
      screen.getByRole('link', { name: 'Back to featured work' })
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
