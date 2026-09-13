import { describe, expect, it, vi } from 'vitest';
import { loadGitHubContributionData, parsePublicGitHubCalendar } from './github-contributions';

function calendar(): string {
  let total = 0;
  const cells = Array.from({ length: 365 }, (_, index) => {
    const date = new Date(Date.UTC(2025, 8, 13) + index * 86_400_000).toISOString().slice(0, 10);
    const count = index % 3;
    total += count;
    const id = `contribution-day-component-${index}`;
    return `<td data-date="${date}" id="${id}"></td><tool-tip for="${id}">${count || 'No'} contribution${count === 1 ? '' : 's'} on a date.</tool-tip>`;
  }).reverse().join('');
  return `<h2 id="js-contribution-activity-description">${total} contributions in the last year</h2>${cells}`;
}

describe('Public GitHub calendar fallback', () => {
  it('reads exact tooltip counts, orders dates, and groups Sunday-based weeks', () => {
    const data = parsePublicGitHubCalendar(calendar());
    const days = data.weeks.flatMap(week => week.contributionDays);
    expect(days).toHaveLength(365);
    expect(days[0]).toEqual({ date: '2025-09-13', contributionCount: 0, weekday: 6 });
    expect(data.weeks[1].contributionDays[0].weekday).toBe(0);
    expect(data.totalContributions).toBe(days.reduce((sum, day) => sum + day.contributionCount, 0));
  });

  it.each([
    '<html>Sign in required</html>',
    calendar().replace('No contributions on a date.', 'Unknown activity'),
    calendar().replace('364 contributions in the last year', '999 contributions in the last year'),
    calendar().replace('data-date="2025-09-13"', 'data-date="2025-09-14"')
  ])('rejects missing or inconsistent calendar markup', html => {
    expect(() => parsePublicGitHubCalendar(html)).toThrow('GitHub contribution data is unavailable.');
  });

  it('fetches public data without authorization when no token is configured', async () => {
    const fetcher = vi.fn(async () => new Response(calendar()));
    const data = await loadGitHubContributionData('jlescarlan11', undefined, fetcher);
    expect(data.weeks.length).toBeGreaterThan(50);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher).toHaveBeenCalledWith('https://github.com/users/jlescarlan11/contributions', expect.objectContaining({
      headers: { Accept: 'text/html', 'Accept-Language': 'en-US' }, cache: 'no-store'
    }));
  });

  it('falls back when GraphQL rejects an expired token', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response('', { status: 401 }))
      .mockResolvedValueOnce(new Response(calendar()));
    await expect(loadGitHubContributionData('jlescarlan11', 'test-token', fetcher)).resolves.toHaveProperty('weeks');
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls[1][1].headers).not.toHaveProperty('Authorization');
  });

  it('sanitizes upstream errors and rejects invalid usernames before fetching', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('private provider details'));
    await expect(loadGitHubContributionData('john', undefined, fetcher)).rejects.toThrow('GitHub contribution data is unavailable.');
    fetcher.mockClear();
    await expect(loadGitHubContributionData('../invalid', undefined, fetcher)).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
