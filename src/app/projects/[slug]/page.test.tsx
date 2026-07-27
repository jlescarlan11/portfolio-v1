import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProjectPage from './page';

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
  it('provides the target used by the global skip link', async () => {
    const page = await ProjectPage({
      params: Promise.resolve({ slug: 'rent-n-roll' })
    });

    render(page);

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
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
});
