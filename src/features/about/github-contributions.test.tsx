import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchGitHubContributionData,
  GITHUB_REQUEST_TIMEOUT_MS,
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

afterEach(() => {
  vi.useRealTimers();
});

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
        cache: 'no-store',
        signal: expect.any(AbortSignal)
      })
    );
  });

  it('aborts a stalled GitHub request without retrying', async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn(
      async (_input: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(init.signal?.reason),
            { once: true }
          );
        })
    );

    const request = fetchGitHubContributionData(
      'jlescarlan11',
      'test-placeholder-token',
      fetcher
    );
    const rejection = expect(request).rejects.toThrow(
      'GitHub contribution data is unavailable.'
    );

    await vi.advanceTimersByTimeAsync(GITHUB_REQUEST_TIMEOUT_MS);
    await rejection;
    expect(fetcher).toHaveBeenCalledOnce();
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
