import { describe, expect, it, vi } from 'vitest';
import {
  fetchGitHubContributionData,
  parseGitHubContributionData
} from './github-contributions';

const validCalendar = {
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
};

describe('GitHub contribution data', () => {
  it('requests once without using the raw response as a Next.js cache entry', async () => {
    const fetcher = vi.fn(async () =>
      Response.json({
        data: {
          user: {
            contributionsCollection: {
              contributionCalendar: validCalendar
            }
          }
        }
      })
    );

    await expect(
      fetchGitHubContributionData(
        'jlescarlan11',
        'test-placeholder-token',
        fetcher
      )
    ).resolves.toEqual(validCalendar);

    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher).toHaveBeenCalledWith(
      'https://api.github.com/graphql',
      expect.objectContaining({
        method: 'POST',
        cache: 'no-store'
      })
    );
  });

  it('rejects HTTP-200 GraphQL errors before validated data can be cached', () => {
    expect(() =>
      parseGitHubContributionData({
        errors: [{ type: 'RATE_LIMITED', message: 'provider detail' }],
        data: { user: null }
      })
    ).toThrow('GitHub contribution data is unavailable.');
  });

  it.each([
    null,
    {},
    { data: { user: null } },
    {
      data: {
        user: {
          contributionsCollection: {
            contributionCalendar: {
              totalContributions: 1,
              weeks: [
                {
                  contributionDays: [
                    {
                      ...validCalendar.weeks[0].contributionDays[0],
                      weekday: 9
                    }
                  ]
                }
              ]
            }
          }
        }
      }
    }
  ])('rejects malformed calendar payload %#', payload => {
    expect(() => parseGitHubContributionData(payload)).toThrow(
      'GitHub contribution data is unavailable.'
    );
  });
});
