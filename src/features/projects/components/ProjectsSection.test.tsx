import React from 'react';
import { act, cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { projects, projectsSectionContent } from '@/features/projects';
import ProjectsSection from './ProjectsSection';

beforeEach(() => {
  vi.stubGlobal('React', React);
  vi.stubGlobal('ResizeObserver', undefined);
});

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(document, 'fonts');
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('ProjectsSection progressive enhancement', () => {
  it('renders the aligned section positioning and visible project copy', () => {
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

    const featuredCard = screen
      .getByRole('heading', { name: projects[0].title })
      .closest('article');
    expect(featuredCard).not.toBeNull();
    expect(
      within(featuredCard!).getByText(projects[0].caseStudy.summary)
    ).toBeVisible();

    for (const project of projects.slice(1)) {
      const projectCard = screen
        .getByRole('heading', { name: project.title })
        .closest('article');
      expect(projectCard).not.toBeNull();
      expect(
        within(projectCard!).getByText(project.caseStudy.highlights[0])
      ).toBeVisible();
    }
  });

  it('renders compact project cards when ResizeObserver is unavailable', () => {
    render(
      <ProjectsSection
        projects={projects.slice(0, 2)}
        content={projectsSectionContent}
      />
    );

    expect(screen.getByRole('heading', { name: 'Rent N Roll' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'HEALTH' })).toBeVisible();
  });

  it('remeasures technology pills after web fonts finish loading', async () => {
    let resolveFonts: (() => void) | undefined;
    const fontsReady = new Promise<void>((resolve) => {
      resolveFonts = resolve;
    });
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { ready: fontsReady }
    });

    let fontsLoaded = false;
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
      if (this.hasAttribute('data-pill')) return fontsLoaded ? 80 : 30;
      if (this.hasAttribute('data-plus')) return 30;
      if (this.hasAttribute('data-date')) return 40;
      if (this.classList.contains('items-center') && this.classList.contains('border-t')) {
        return 600;
      }
      return 0;
    });

    render(
      <ProjectsSection
        projects={projects.slice(0, 2)}
        content={projectsSectionContent}
      />
    );

    expect(screen.queryByText('+2')).not.toBeInTheDocument();

    fontsLoaded = true;
    await act(async () => {
      resolveFonts?.();
      await fontsReady;
    });

    expect(screen.getByText('+2')).toBeVisible();
  });
});
