import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchGitHubContributionData,
  GITHUB_REQUEST_TIMEOUT_MS,
  getGitHubContributionData,
  parseGitHubContributionData
} from './github-contributions';

const cacheMocks = vi.hoisted(() => ({
  read: vi.fn()
}));

vi.mock('next/cache', () => ({
  unstable_cache: vi.fn(() => cacheMocks.read)
}));

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
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  cacheMocks.read.mockReset();
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

  it('rejects an invalid username before issuing a direct provider request', async () => {
    const fetcher = vi.fn();

    await expect(
      fetchGitHubContributionData(
        'invalid--login',
        'test-placeholder-token',
        fetcher
      )
    ).rejects.toThrow('GitHub contribution data is unavailable.');

    expect(fetcher).not.toHaveBeenCalled();
  });

  it('rejects HTTP-200 GraphQL errors before validated data can be cached', () => {
    expect(() =>
      parseGitHubContributionData({
        errors: [{ type: 'RATE_LIMITED', message: 'provider detail' }],
        data: { user: null }
      })
    ).toThrow('GitHub contribution data is unavailable.');
  });

  it('rejects contribution calendars larger than one year', () => {
    const oversizedCalendar = {
      ...validCalendar,
      weeks: Array.from(
        { length: 55 },
        () => validCalendar.weeks[0]
      )
    };

    expect(() =>
      parseGitHubContributionData({
        data: {
          user: {
            contributionsCollection: {
              contributionCalendar: oversizedCalendar
            }
          }
        }
      })
    ).toThrow('GitHub contribution data is unavailable.');
  });

  it('rejects contribution weeks with more than seven days', () => {
    expect(() =>
      parseGitHubContributionData({
        data: {
          user: {
            contributionsCollection: {
              contributionCalendar: {
                ...validCalendar,
                weeks: [{
                  contributionDays: Array.from(
                    { length: 8 },
                    () => validCalendar.weeks[0].contributionDays[0]
                  )
                }]
              }
            }
          }
        }
      })
    ).toThrow('GitHub contribution data is unavailable.');
  });

  it('logs a sanitized warning when cached contribution data is unavailable', async () => {
    const sensitive = 'SENSITIVE_GITHUB_PROVIDER_DETAIL';
    vi.stubEnv('GITHUB_TOKEN', 'test-placeholder-token');
    cacheMocks.read.mockRejectedValueOnce(new Error(sensitive));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await expect(
      getGitHubContributionData('jlescarlan11')
    ).resolves.toBeNull();

    expect(warn).toHaveBeenCalledWith(
      'GitHub contribution data unavailable — contribution graph will not render.'
    );
    expect(JSON.stringify(warn.mock.calls)).not.toContain(sensitive);
  });

  it.each(['', '   ', '-invalid', 'invalid--login', 'a'.repeat(40)])(
    'rejects invalid username %j before creating a cache entry',
    async username => {
      vi.stubEnv('GITHUB_TOKEN', 'test-placeholder-token');
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

      await expect(getGitHubContributionData(username)).resolves.toBeNull();

      expect(cacheMocks.read).not.toHaveBeenCalled();
      expect(warn).toHaveBeenCalledWith(
        'GitHub username invalid — contribution graph will not render.'
      );
    }
  );

  it('uses a canonical username for the cache key', async () => {
    vi.stubEnv('GITHUB_TOKEN', 'test-placeholder-token');
    cacheMocks.read.mockResolvedValueOnce(validCalendar);

    await expect(
      getGitHubContributionData('  jlescarlan11  ')
    ).resolves.toEqual(validCalendar);

    expect(cacheMocks.read).toHaveBeenCalledWith('jlescarlan11');
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
