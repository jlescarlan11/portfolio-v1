import type {
  ProjectDecision,
  ProjectImpact,
  ProjectRoleScope
} from '@/features/projects/types';
import { FadeIn } from '@/shared/components/FadeIn';
import { NewTabNotice } from '@/shared/components/NewTabNotice';
import { Typography } from '@/shared/components/Typography';
import { formatMonthYear, isRenderableExternalUrl } from '@/shared/lib/project';
import { SURFACE, TYPOGRAPHY_STYLES } from '@/shared/styles/shared';

interface ProjectMetaStripProps {
  roleScope: ProjectRoleScope;
  client?: string;
  completedAt: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
}

interface ProjectEvidenceSectionsProps {
  impact: ProjectImpact[];
  decisions: ProjectDecision[];
}

interface ProjectSectionLabelProps {
  children: string;
  id: string;
}

interface DecisionDetailProps {
  label: string;
  value: string;
}

export function ProjectSectionLabel({
  children,
  id
}: ProjectSectionLabelProps) {
  return (
    <Typography
      variant="caption"
      as="h2"
      id={id}
      className="mb-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground"
    >
      {children}
    </Typography>
  );
}

export function ProjectMetaStrip({
  roleScope,
  client,
  completedAt,
  technologies,
  liveUrl,
  githubUrl
}: ProjectMetaStripProps) {
  const safeLiveUrl = isRenderableExternalUrl(liveUrl) ? liveUrl : undefined;
  const safeGithubUrl = isRenderableExternalUrl(githubUrl)
    ? githubUrl
    : undefined;
  const facts = [
    { label: 'Role', value: roleScope.role },
    { label: 'Team', value: roleScope.team },
    { label: 'Duration', value: roleScope.duration },
    { label: 'Status', value: roleScope.status },
    {
      label: 'Completed',
      value: formatMonthYear(completedAt, 'long'),
      dateTime: completedAt
    },
    { label: 'Client', value: client }
  ].filter(
    (fact): fact is {
      label: string;
      value: string;
      dateTime?: string;
    } => Boolean(fact.value)
  );

  return (
    <div className={`space-y-6 border-y ${SURFACE.hairline} py-6`}>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
        {facts.map((fact) => (
          <div key={fact.label} className="min-w-0 space-y-1">
            <Typography
              variant="caption"
              as="dt"
              className="text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle-foreground"
            >
              {fact.label}
            </Typography>
            <Typography
              variant="label"
              as="dd"
              className="break-words text-foreground"
            >
              {fact.dateTime ? (
                <time dateTime={fact.dateTime}>{fact.value}</time>
              ) : (
                fact.value
              )}
            </Typography>
          </div>
        ))}

        <div className="col-span-2 space-y-2 border-t border-surface pt-5 sm:col-span-3">
          <Typography
            variant="caption"
            as="dt"
            className="text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle-foreground"
          >
            Owned
          </Typography>
          <dd>
            <ul className="space-y-2">
              {roleScope.ownership.map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-[0.7em] h-1 w-1 flex-none bg-surface-strong"
                  />
                  <Typography
                    variant="body-sm"
                    as="span"
                    className="leading-relaxed text-muted-foreground"
                  >
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-5 border-t border-surface pt-5 sm:flex-row sm:items-end sm:justify-between">
        <ul
          className="flex min-w-0 flex-wrap gap-2"
          aria-label="Technology stack"
        >
          {technologies.map((technology) => (
            <li key={technology}>
              <Typography
                variant="caption"
                as="span"
                className={`inline-flex items-center border ${SURFACE.hairline} px-2.5 py-1 text-[11px] text-muted-foreground`}
              >
                {technology}
              </Typography>
            </li>
          ))}
        </ul>

        {safeLiveUrl || safeGithubUrl ? (
          <div className="flex flex-none flex-wrap items-center gap-4">
            {safeLiveUrl ? (
              <a
                href={safeLiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 border border-foreground px-4 py-1.5 text-xs font-medium text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                View live
                <span aria-hidden="true" className="opacity-50">
                  ↗
                </span>
                <NewTabNotice />
              </a>
            ) : null}
            {safeGithubUrl ? (
              <a
                href={safeGithubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${TYPOGRAPHY_STYLES.linkSecondary} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground`}
              >
                GitHub
                <span aria-hidden="true"> ↗</span>
                <NewTabNotice />
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DecisionDetail({ label, value }: DecisionDetailProps) {
  return (
    <div className="grid gap-1 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-4">
      <Typography
        variant="caption"
        as="dt"
        className="text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle-foreground"
      >
        {label}
      </Typography>
      <Typography
        variant="body-sm"
        as="dd"
        className="min-w-0 leading-relaxed text-muted-foreground"
      >
        {value}
      </Typography>
    </div>
  );
}

export function ProjectEvidenceSections({
  impact,
  decisions
}: ProjectEvidenceSectionsProps) {
  if (impact.length === 0 && decisions.length === 0) return null;

  return (
    <>
      {impact.length > 0 ? (
        <FadeIn
          delay={300}
          as="section"
          className={`mb-14 border-t ${SURFACE.hairline} pt-10 md:mb-18`}
          aria-labelledby="impact-heading"
        >
          <ProjectSectionLabel id="impact-heading">
            Impact
          </ProjectSectionLabel>
          <ol className="grid gap-px overflow-hidden border border-surface bg-surface-divider sm:grid-cols-2">
            {impact.map((item, index) => (
              <li
                key={`${item.value}-${item.label}`}
                className="relative min-w-0 bg-surface p-5"
              >
                <span
                  aria-hidden="true"
                  className="absolute right-4 top-4 font-mono text-[10px] tabular-nums text-foreground/20"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <Typography
                  variant="h3"
                  as="p"
                  className="break-words pr-8 font-semibold text-foreground"
                >
                  {item.value}
                </Typography>
                <Typography
                  variant="caption"
                  as="h3"
                  className="mt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle-foreground"
                >
                  {item.label}
                </Typography>
                <Typography
                  variant="body-sm"
                  as="p"
                  className="mt-4 leading-relaxed text-muted-foreground"
                >
                  {item.context}
                </Typography>
              </li>
            ))}
          </ol>
        </FadeIn>
      ) : null}

      {decisions.length > 0 ? (
        <FadeIn
          delay={380}
          as="section"
          className={`mb-14 border-t ${SURFACE.hairline} pt-10 md:mb-18`}
          aria-labelledby="decisions-heading"
        >
          <ProjectSectionLabel id="decisions-heading">
            Engineering Decisions
          </ProjectSectionLabel>
          <ol className="space-y-8">
            {decisions.map((decision, index) => (
              <li
                key={decision.title}
                className="relative border-l border-surface pl-5 sm:pl-7"
              >
                <span
                  aria-hidden="true"
                  className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center border border-surface bg-surface font-mono text-[10px] tabular-nums text-subtle-foreground"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <Typography
                  variant="h3"
                  as="h3"
                  className="mb-5 font-semibold text-foreground"
                >
                  {decision.title}
                </Typography>
                <dl className="space-y-4">
                  <DecisionDetail
                    label="Constraint"
                    value={decision.constraint}
                  />
                  <DecisionDetail label="Decision" value={decision.decision} />
                  <DecisionDetail
                    label="Rationale"
                    value={decision.rationale}
                  />
                  {decision.tradeoff ? (
                    <DecisionDetail
                      label="Trade-off"
                      value={decision.tradeoff}
                    />
                  ) : null}
                  {decision.validation ? (
                    <DecisionDetail
                      label="Validation"
                      value={decision.validation}
                    />
                  ) : null}
                </dl>
              </li>
            ))}
          </ol>
        </FadeIn>
      ) : null}
    </>
  );
}
