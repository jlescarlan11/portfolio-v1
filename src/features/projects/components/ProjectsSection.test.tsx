import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { projects, projectsSectionContent } from '@/features/projects';
import ProjectsSection from './ProjectsSection';

beforeEach(() => {
  vi.stubGlobal('React', React);
  vi.stubGlobal('ResizeObserver', undefined);
});

afterEach(() => {
  cleanup();
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
});
