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
    !Number.isInteger(contributionCount) ||
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
    !Number.isInteger(totalContributions) ||
    totalContributions < 0 ||
    !Array.isArray(weeks) ||
    weeks.length > MAX_CONTRIBUTION_WEEKS
  ) {
    throw new GitHubContributionDataError();
  }

  let previousDate: string | null = null;
  const parsedWeeks = weeks.map(candidate => {
    if (
      !isRecord(candidate) ||
      !Array.isArray(candidate.contributionDays) ||
      candidate.contributionDays.length > MAX_DAYS_PER_WEEK
    ) {
      throw new GitHubContributionDataError();
    }

    const contributionDays = candidate.contributionDays.map(day => {
      const parsed = parseContributionDay(day);
      if (
        !parsed ||
        (previousDate !== null && parsed.date <= previousDate)
      ) {
        throw new GitHubContributionDataError();
      }
      previousDate = parsed.date;
      return parsed;
    });
    return { contributionDays };
  });

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
  if (!normalizedUsername) {
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
        Authorization: `bearer ${token}`,
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

const getCachedGitHubContributionData = unstable_cache(
  async (username: string): Promise<GitHubContributionData> => {
    const token = process.env.GITHUB_TOKEN?.trim();
    if (!token) throw new GitHubContributionDataError();
    return fetchGitHubContributionData(username, token);
  },
  ['github-contribution-calendar-v1'],
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

  if (!process.env.GITHUB_TOKEN?.trim()) {
    console.warn('GITHUB_TOKEN not set — contribution graph will not render.');
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
