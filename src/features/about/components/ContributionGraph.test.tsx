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
            date: '2026-08-01',
            contributionCount: 2,
            weekday: 6
          }
        ]
      }
    ]
  }))
}));

beforeAll(() => {
  vi.stubGlobal('React', React);
  vi.stubEnv('TZ', 'America/Los_Angeles');
});

afterAll(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
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
      gridRowStart: '7'
    });
  });

  it('formats contribution dates in a stable calendar timezone', async () => {
    render(await ContributionGraph({ username: 'jlescarlan11' }));

    expect(screen.getByText('Aug')).toBeInTheDocument();
    expect(
      screen.getByTitle('2 contributions on Aug 1, 2026')
    ).toBeInTheDocument();
  });
});
