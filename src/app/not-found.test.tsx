import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import NotFound from './not-found';
import ProjectNotFound from './projects/[slug]/not-found';

beforeAll(() => {
  vi.stubGlobal('React', React);
});

afterEach(cleanup);

afterAll(() => {
  vi.unstubAllGlobals();
});

describe('NotFound', () => {
  it.each([
    ['site', NotFound],
    ['project', ProjectNotFound]
  ] as const)('provides recovery routes for a missing %s page', (_, RecoveryPage) => {
    render(<RecoveryPage />);

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'This page could not be found.'
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Browse all projects' })
    ).toHaveAttribute('href', '/projects');
    expect(screen.getByRole('link', { name: 'Return home' })).toHaveAttribute(
      'href',
      '/'
    );
  });
});
