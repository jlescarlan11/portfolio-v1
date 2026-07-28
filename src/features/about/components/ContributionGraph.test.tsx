import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi
} from 'vitest';
import ContributionGraph from './ContributionGraph';

vi.mock('../github-contributions', () => ({
  getGitHubContributionData: vi.fn(async () => ({
    totalContributions: 7,
    weeks: [
      {
        contributionDays: [
          {
            date: '2026-07-28',
            contributionCount: 2,
            weekday: 2
          }
        ]
      }
    ]
  }))
}));

beforeAll(() => {
  vi.stubGlobal('React', React);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  cleanup();
});

describe('ContributionGraph', () => {
  it('keeps the visible graph title readable in both themes', async () => {
    render(await ContributionGraph({ username: 'jlescarlan11' }));

    const title = screen.getByText('GITHUB CONTRIBUTIONS');
    expect(title).toHaveClass('text-subtle-foreground');
    expect(title).not.toHaveClass('text-foreground/50');
  });

  it('positions partial-week days in their calendar row', async () => {
    render(await ContributionGraph({ username: 'jlescarlan11' }));

    expect(screen.getByTitle(/^2 contributions on/)).toHaveStyle({
      gridRowStart: '3'
    });
  });
});
