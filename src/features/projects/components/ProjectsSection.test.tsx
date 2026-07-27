import React from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
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

    expect(screen.queryByText('+1')).not.toBeInTheDocument();

    fontsLoaded = true;
    await act(async () => {
      resolveFonts?.();
      await fontsReady;
    });

    expect(screen.getByText('+1')).toBeVisible();
  });
});
