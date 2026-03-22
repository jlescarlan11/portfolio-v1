// src/features/about/components/ContributionGraph.tsx
//
// SERVER COMPONENT — fetches from GitHub GraphQL API.
// Revalidates every 24h via Next.js fetch cache.
//
// Setup:
//   GITHUB_TOKEN=ghp_xxxxx          (Settings → Developer settings → Tokens → read:user scope)
//   NEXT_PUBLIC_GITHUB_USERNAME=jlescarlan11

import { Typography } from '@/shared/components/Typography';
import { ScrollableContainer } from './ScrollableContainer';

interface ContributionDay {
  date: string;
  contributionCount: number;
  weekday: number;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface GitHubContributionData {
  totalContributions: number;
  weeks: ContributionWeek[];
}

async function fetchContributions(username: string): Promise<GitHubContributionData | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn('GITHUB_TOKEN not set — contribution graph will not render.');
    return null;
  }

  const query = `
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

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, variables: { username } }),
      next: { revalidate: 86400 }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.user?.contributionsCollection?.contributionCalendar ?? null;
  } catch {
    return null;
  }
}

function getLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}

const levelOpacity: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'bg-foreground/[0.05]',
  1: 'bg-foreground/20',
  2: 'bg-foreground/40',
  3: 'bg-foreground/65',
  4: 'bg-foreground/90'
};

// Full 52 weeks = 1 year
const WEEKS_TO_SHOW = 52;

function getMonthLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', { month: 'short' });
}

interface ContributionGraphProps {
  username?: string;
}

export default async function ContributionGraph({
  username = process.env.NEXT_PUBLIC_GITHUB_USERNAME ?? 'jlescarlan11'
}: ContributionGraphProps) {
  const data = await fetchContributions(username);
  if (!data) return null;

  const weeks = data.weeks.slice(-WEEKS_TO_SHOW);

  // Month label positions — enforce minimum 4-week gap to prevent overlap
  const monthLabels: { index: number; label: string }[] = [];
  let lastMonth = '';
  let lastLabelIndex = -4;
  weeks.forEach((week, i) => {
    const firstDay = week.contributionDays[0];
    if (!firstDay) return;
    const month = getMonthLabel(firstDay.date);
    if (month !== lastMonth && i - lastLabelIndex >= 4) {
      monthLabels.push({ index: i, label: month });
      lastMonth = month;
      lastLabelIndex = i;
    }
  });

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <Typography
          variant="caption"
          as="p"
          className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/50"
        >
          GITHUB CONTRIBUTIONS
        </Typography>
        <Typography
          variant="caption"
          as="p"
          className="font-mono text-[11px] tabular-nums text-subtle-foreground"
        >
          {data.totalContributions.toLocaleString()} contributions · last year
        </Typography>
      </div>

      {/* Scrollable graph — full width, larger cells */}
      <ScrollableContainer>
        <div style={{ minWidth: `${WEEKS_TO_SHOW * 15}px` }}>

          {/* Month labels — width must equal cell(13) + gap(2) = 15px */}
          <div className="mb-1.5 flex" aria-hidden="true">
            {weeks.map((_, i) => {
              const label = monthLabels.find((m) => m.index === i);
              return (
                <div
                  key={i}
                  style={{ width: '15px', flexShrink: 0 }}
                  className="text-[9px] text-foreground/50"
                >
                  {label ? label.label : ''}
                </div>
              );
            })}
          </div>

          {/* Cell grid */}
          <div
            className="flex"
            style={{ gap: '2px' }}
            role="img"
            aria-label={`GitHub contributions for ${username} — ${data.totalContributions.toLocaleString()} in the last year`}
          >
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap: '2px' }}>
                {week.contributionDays.map((day) => {
                  const level = getLevel(day.contributionCount);
                  return (
                    <div
                      key={day.date}
                      title={`${day.contributionCount} contribution${day.contributionCount !== 1 ? 's' : ''} on ${new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                      className={`h-[13px] w-[13px] flex-shrink-0 transition-opacity duration-150 hover:opacity-60 ${levelOpacity[level]}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center justify-end gap-1.5" aria-hidden="true">
            <span className="text-[9px] text-foreground/50 mr-0.5">Less</span>
            {([0, 1, 2, 3, 4] as const).map((level) => (
              <div key={level} className={`h-[13px] w-[13px] ${levelOpacity[level]}`} />
            ))}
            <span className="text-[9px] text-foreground/50 ml-0.5">More</span>
          </div>
        </div>
      </ScrollableContainer>
    </div>
  );
}