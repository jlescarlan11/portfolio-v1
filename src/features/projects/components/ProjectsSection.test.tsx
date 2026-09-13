import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getHomepageProjects,
  projects,
  projectsSectionContent
} from '@/features/projects';
import ProjectsSection from './ProjectsSection';

beforeEach(() => {
  vi.stubGlobal('React', React);
  vi.stubGlobal('IntersectionObserver', undefined);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('ProjectsSection', () => {
  it('renders exactly three ranked projects with equal thumbnail cards', () => {
    render(
      <ProjectsSection
        projects={projects}
        content={projectsSectionContent}
      />
    );

    expect(
      screen.getByRole('heading', { name: projectsSectionContent.title })
    ).toBeVisible();
    expect(screen.getByText(projectsSectionContent.intro)).toBeVisible();

    const list = screen.getByRole('list', { name: 'Selected projects' });
    expect(list).toHaveAttribute('data-layout', 'homepage');
    expect(list).toHaveClass('grid-cols-1', 'md:grid-cols-3');

    const homepageProjects = getHomepageProjects();
    expect(homepageProjects).toHaveLength(3);
    for (const project of homepageProjects) {
      expect(
        within(list).getByRole('heading', { name: project.title })
      ).toBeVisible();
      expect(
        within(list).getByRole('img', {
          name: project.listing.thumbnail.alt
        })
      ).toBeVisible();
      expect(
        within(list).getByRole('link', {
          name: `${projectsSectionContent.ctaLabel}: ${project.title}`
        })
      ).toHaveAttribute('href', `/projects/${project.slug}`);
    }

    for (const project of projects.filter(
      project => project.listing.homepageRank === undefined
    )) {
      expect(
        within(list).queryByRole('heading', { name: project.title })
      ).not.toBeInTheDocument();
    }
  });

  it('links to the complete archive with a data-derived project count', () => {
    render(
      <ProjectsSection
        projects={projects}
        content={projectsSectionContent}
      />
    );

    expect(
      screen.getByRole('link', { name: `See all ${projects.length} projects` })
    ).toHaveAttribute('href', '/projects');
  });

  it('uses deterministic technology overflow without external live links', () => {
    render(
      <ProjectsSection
        projects={projects}
        content={projectsSectionContent}
      />
    );

    const rentLink = screen.getByRole('link', {
      name: `${projectsSectionContent.ctaLabel}: Rent N Roll`
    });
    expect(within(rentLink).getByText('Next.js')).toBeVisible();
    expect(within(rentLink).getByText('TypeScript')).toBeVisible();
    expect(within(rentLink).getByText('+6')).toBeVisible();
    expect(
      screen.queryByRole('link', { name: /Live site for/i })
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Rent N Roll: Pre-launch')).toBeVisible();
  });
});
