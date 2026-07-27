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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseContributionDay(value: unknown): ContributionDay | null {
  if (!isRecord(value)) return null;

  const { date, contributionCount, weekday } = value;
  if (
    typeof date !== 'string' ||
    !date ||
    Number.isNaN(Date.parse(date)) ||
    typeof contributionCount !== 'number' ||
    !Number.isInteger(contributionCount) ||
    contributionCount < 0 ||
    typeof weekday !== 'number' ||
    !Number.isInteger(weekday) ||
    weekday < 0 ||
    weekday > 6
  ) {
    return null;
  }

  return {
    date,
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
    !Array.isArray(weeks)
  ) {
    throw new GitHubContributionDataError();
  }

  const parsedWeeks = weeks.map(candidate => {
    if (!isRecord(candidate) || !Array.isArray(candidate.contributionDays)) {
      throw new GitHubContributionDataError();
    }

    const contributionDays = candidate.contributionDays.map(day => {
      const parsed = parseContributionDay(day);
      if (!parsed) throw new GitHubContributionDataError();
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
  const response = await fetcher('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: CONTRIBUTION_QUERY,
      variables: { username }
    }),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new GitHubContributionDataError();
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new GitHubContributionDataError();
  }

  return parseGitHubContributionData(payload);
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
  if (!process.env.GITHUB_TOKEN?.trim()) {
    console.warn('GITHUB_TOKEN not set — contribution graph will not render.');
    return null;
  }

  try {
    return await getCachedGitHubContributionData(username);
  } catch {
    return null;
  }
}
