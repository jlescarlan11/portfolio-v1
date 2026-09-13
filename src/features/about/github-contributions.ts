import { unstable_cache } from 'next/cache';

export interface ContributionDay {
  date: string;
  contributionCount: number;
  weekday: number;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface GitHubContributionData {
  totalContributions: number;
  weeks: ContributionWeek[];
}

type Fetcher = (
  input: string | URL | Request,
  init?: RequestInit
) => Promise<Response>;

export const GITHUB_REQUEST_TIMEOUT_MS = 5_000;
const MAX_CONTRIBUTION_WEEKS = 54;
const MAX_DAYS_PER_WEEK = 7;
const GITHUB_USERNAME_PATTERN =
  /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

const CONTRIBUTION_QUERY = `
  query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              weekday
            }
          }
        }
      }
    }
  }
`;

class GitHubContributionDataError extends Error {
  constructor() {
    super('GitHub contribution data is unavailable.');
    this.name = 'GitHubContributionDataError';
  }
}

export function normalizeGitHubUsername(username: string): string | null {
  const normalized = username.trim();
  return GITHUB_USERNAME_PATTERN.test(normalized) ? normalized : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseCanonicalCalendarDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
      ? parsed
      : null
  );
}

function parseContributionDay(value: unknown): ContributionDay | null {
  if (!isRecord(value)) return null;

  const { date, contributionCount, weekday } = value;
  const parsedDate =
    typeof date === 'string' ? parseCanonicalCalendarDate(date) : null;
  if (
    !parsedDate ||
    typeof contributionCount !== 'number' ||
    !Number.isSafeInteger(contributionCount) ||
    contributionCount < 0 ||
    typeof weekday !== 'number' ||
    !Number.isInteger(weekday) ||
    weekday < 0 ||
    weekday > 6 ||
    parsedDate.getUTCDay() !== weekday
  ) {
    return null;
  }

  return {
    date: parsedDate.toISOString().slice(0, 10),
    contributionCount,
    weekday
  };
}

export function parseGitHubContributionData(
  payload: unknown
): GitHubContributionData {
  if (!isRecord(payload)) {
    throw new GitHubContributionDataError();
  }

  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    throw new GitHubContributionDataError();
  }

  const data = payload.data;
  const user = isRecord(data) ? data.user : null;
  const collection = isRecord(user) ? user.contributionsCollection : null;
  const calendar = isRecord(collection)
    ? collection.contributionCalendar
    : null;
  if (!isRecord(calendar)) {
    throw new GitHubContributionDataError();
  }

  const { totalContributions, weeks } = calendar;
  if (
    typeof totalContributions !== 'number' ||
    !Number.isSafeInteger(totalContributions) ||
    totalContributions < 0 ||
    !Array.isArray(weeks) ||
    weeks.length > MAX_CONTRIBUTION_WEEKS
  ) {
    throw new GitHubContributionDataError();
  }

  let previousDate: string | null = null;
  let parsedTotal = 0;
  const parsedWeeks = weeks.map(candidate => {
    if (
      !isRecord(candidate) ||
      !Array.isArray(candidate.contributionDays) ||
      candidate.contributionDays.length > MAX_DAYS_PER_WEEK
    ) {
      throw new GitHubContributionDataError();
    }

    let occupiedWeekdays = 0;
    const contributionDays = candidate.contributionDays.map(day => {
      const parsed = parseContributionDay(day);
      if (!parsed) {
        throw new GitHubContributionDataError();
      }

      const weekdayMask = 1 << parsed.weekday;
      if (
        (occupiedWeekdays & weekdayMask) !== 0 ||
        (previousDate !== null && parsed.date <= previousDate) ||
        parsed.contributionCount > Number.MAX_SAFE_INTEGER - parsedTotal
      ) {
        throw new GitHubContributionDataError();
      }
      occupiedWeekdays |= weekdayMask;
      previousDate = parsed.date;
      parsedTotal += parsed.contributionCount;
      return parsed;
    });
    return { contributionDays };
  });

  if (parsedTotal !== totalContributions) {
    throw new GitHubContributionDataError();
  }

  return {
    totalContributions,
    weeks: parsedWeeks
  };
}

export async function fetchGitHubContributionData(
  username: string,
  token: string,
  fetcher: Fetcher = fetch
): Promise<GitHubContributionData> {
  const normalizedUsername = normalizeGitHubUsername(username);
  const normalizedToken = token.trim();
  if (!normalizedUsername || !normalizedToken) {
    throw new GitHubContributionDataError();
  }

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, GITHUB_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetcher('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${normalizedToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: CONTRIBUTION_QUERY,
        variables: { username: normalizedUsername }
      }),
      cache: 'no-store',
      signal: abortController.signal
    });

    if (!response.ok) {
      throw new GitHubContributionDataError();
    }

    const payload = (await response.json()) as unknown;
    return parseGitHubContributionData(payload);
  } catch (error: unknown) {
    if (error instanceof GitHubContributionDataError) {
      throw error;
    }
    throw new GitHubContributionDataError();
  } finally {
    clearTimeout(timeoutId);
  }
}

// GitHub's public calendar supplies exact counts in tooltips, not data-level colors.
// Parse only dates/counts; never render or execute provider HTML.
export function parsePublicGitHubCalendar(html: string): GitHubContributionData {
  if (html.length > 2_000_000) throw new GitHubContributionDataError();
  const attribute = (tag: string, name: string): string | undefined =>
    tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`))?.[1];
  const counts = new Map<string, number>();
  for (const match of html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)) {
    const id = attribute(match[1], 'for');
    if (!id?.startsWith('contribution-day-component-')) continue;
    const count = match[2].trim().match(/^(No|\d+(?:,\d{3})*) contributions? on /)?.[1];
    if (!count || counts.has(id)) throw new GitHubContributionDataError();
    counts.set(id, count === 'No' ? 0 : Number(count.replaceAll(',', '')));
  }
  const days: ContributionDay[] = [];
  for (const match of html.matchAll(/<td\b[^>]*>/g)) {
    const date = attribute(match[0], 'data-date');
    if (!date) continue;
    const parsedDate = parseCanonicalCalendarDate(date);
    const id = attribute(match[0], 'id');
    const count = id ? counts.get(id) : undefined;
    if (!parsedDate || count === undefined) throw new GitHubContributionDataError();
    days.push({ date, contributionCount: count, weekday: parsedDate.getUTCDay() });
  }
  if (days.length < 365 || days.length > 378) throw new GitHubContributionDataError();
  days.sort((a, b) => a.date.localeCompare(b.date));
  const weeks: ContributionWeek[] = [];
  days.forEach((day, index) => {
    if (index > 0 && Date.parse(day.date) - Date.parse(days[index - 1].date) !== 86_400_000) {
      throw new GitHubContributionDataError();
    }
    if (index === 0 || day.weekday === 0) weeks.push({ contributionDays: [] });
    weeks[weeks.length - 1].contributionDays.push(day);
  });
  const heading = html.match(/<h2\b[^>]*id=["']js-contribution-activity-description["'][^>]*>([\s\S]*?)<\/h2>/)?.[1];
  const total = heading?.match(/([\d,]+)\s+contributions?\s+in the last year/);
  if (!total) throw new GitHubContributionDataError();
  return parseGitHubContributionData({ data: { user: { contributionsCollection: {
    contributionCalendar: { totalContributions: Number(total[1].replaceAll(',', '')), weeks }
  } } } });
}

export async function fetchPublicGitHubContributionData(
  username: string,
  fetcher: Fetcher = fetch
): Promise<GitHubContributionData> {
  const normalized = normalizeGitHubUsername(username);
  if (!normalized) throw new GitHubContributionDataError();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GITHUB_REQUEST_TIMEOUT_MS);
  try {
    const response = await fetcher(`https://github.com/users/${normalized}/contributions`, {
      headers: { Accept: 'text/html', 'Accept-Language': 'en-US' },
      cache: 'no-store',
      signal: controller.signal
    });
    if (!response.ok) throw new GitHubContributionDataError();
    return parsePublicGitHubCalendar(await response.text());
  } catch {
    throw new GitHubContributionDataError();
  } finally {
    clearTimeout(timeout);
  }
}

export async function loadGitHubContributionData(
  username: string,
  token?: string,
  fetcher: Fetcher = fetch
): Promise<GitHubContributionData> {
  if (token?.trim()) {
    try {
      return await fetchGitHubContributionData(username, token, fetcher);
    } catch {
      // A missing/expired token must not hide data already public on GitHub.
    }
  }
  return fetchPublicGitHubContributionData(username, fetcher);
}

const getCachedGitHubContributionData = unstable_cache(
  async (username: string): Promise<GitHubContributionData> => {
    const token = process.env.GITHUB_TOKEN?.trim();
    return loadGitHubContributionData(username, token);
  },
  ['github-contribution-calendar-v2'],
  { revalidate: 86_400 }
);

export async function getGitHubContributionData(
  username: string
): Promise<GitHubContributionData | null> {
  const normalizedUsername = normalizeGitHubUsername(username);
  if (!normalizedUsername) {
    console.warn(
      'GitHub username invalid — contribution graph will not render.'
    );
    return null;
  }

  try {
    return await getCachedGitHubContributionData(normalizedUsername);
  } catch {
    console.warn(
      'GitHub contribution data unavailable — contribution graph will not render.'
    );
    return null;
  }
}
