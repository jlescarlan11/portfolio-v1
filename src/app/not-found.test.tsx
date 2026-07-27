import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import NotFound from './not-found';

beforeAll(() => {
  vi.stubGlobal('React', React);
});

afterEach(cleanup);

afterAll(() => {
  vi.unstubAllGlobals();
});

describe('NotFound', () => {
  it('provides stale links with visible recovery routes', () => {
    render(<NotFound />);

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'This page could not be found.'
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Browse selected work' })
    ).toHaveAttribute('href', '/#work');
    expect(screen.getByRole('link', { name: 'Return home' })).toHaveAttribute(
      'href',
      '/'
    );
  });
});
