import Image from 'next/image';
import type {
  ProjectDecision,
  ProjectImpact,
  ProjectLearnings,
  ProjectProblem,
  ProjectRoleScope,
  ProjectSolution,
  ProjectSupportingVisual,
  ProjectVisual,
  ProjectVisualSection
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
}

interface ProjectExternalLinksProps {
  liveUrl?: string;
  githubUrl?: string;
}

interface ProjectNarrativeSectionsProps {
  problem: ProjectProblem;
  solution: ProjectSolution;
  decisions: ProjectDecision[];
  impact: ProjectImpact[];
  learnings: ProjectLearnings;
  visuals: ProjectVisual[];
}

interface ProjectSectionLabelProps {
  children: string;
  id: string;
}

interface DecisionDetailProps {
  label: string;
  value: string;
}

interface ProjectFigureProps {
  visual: ProjectSupportingVisual;
}

interface NarrativeListProps {
  items: string[];
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

export function ProjectExternalLinks({
  liveUrl,
  githubUrl
}: ProjectExternalLinksProps) {
  const safeLiveUrl = isRenderableExternalUrl(liveUrl) ? liveUrl : undefined;
  const safeGithubUrl = isRenderableExternalUrl(githubUrl)
    ? githubUrl
    : undefined;

  if (!safeLiveUrl && !safeGithubUrl) return null;

  return (
    <nav aria-label="Project links" className="mt-7 flex flex-wrap gap-4">
      {safeLiveUrl ? (
        <a
          href={safeLiveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 border border-foreground px-4 py-2 text-xs font-medium text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
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
          className={`${TYPOGRAPHY_STYLES.linkSecondary} inline-flex items-center py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground`}
        >
          GitHub
          <span aria-hidden="true"> ↗</span>
          <NewTabNotice />
        </a>
      ) : null}
    </nav>
  );
}

export function ProjectMetaStrip({
  roleScope,
  client,
  completedAt,
  technologies
}: ProjectMetaStripProps) {
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

      <ul
        className="flex min-w-0 flex-wrap gap-2 border-t border-surface pt-5"
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
    </div>
  );
}

function NarrativeList({ items }: NarrativeListProps) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            aria-hidden="true"
            className="mt-[0.75em] h-px w-3 flex-none bg-surface-strong"
          />
          <Typography
            variant="body"
            as="span"
            className="leading-relaxed text-muted-foreground"
          >
            {item}
          </Typography>
        </li>
      ))}
    </ul>
  );
}

function ProjectFigure({ visual }: ProjectFigureProps) {
  return (
    <figure className={`mt-8 border ${SURFACE.hairline} bg-surface-muted`}>
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={visual.src}
          alt={visual.alt}
          fill
          sizes="(max-width: 768px) calc(100vw - 2.5rem), 720px"
          className="object-cover"
        />
      </div>
      <Typography
        variant="body-sm"
        as="figcaption"
        className="border-t border-surface px-4 py-3 leading-relaxed text-muted-foreground"
      >
        {visual.caption}
      </Typography>
    </figure>
  );
}

function getSupportingVisuals(
  visuals: ProjectVisual[],
  section: ProjectVisualSection
): ProjectSupportingVisual[] {
  return visuals.filter(
    (visual): visual is ProjectSupportingVisual =>
      visual.kind === 'supporting' && visual.section === section
  );
}

function SupportingVisuals({
  visuals,
  section
}: {
  visuals: ProjectVisual[];
  section: ProjectVisualSection;
}) {
  const sectionVisuals = getSupportingVisuals(visuals, section);

  if (sectionVisuals.length === 0) return null;

  return (
    <div className="space-y-5">
      {sectionVisuals.map(visual => (
        <ProjectFigure key={visual.src} visual={visual} />
      ))}
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

function OutcomeList({
  title,
  items
}: {
  title: string;
  items: ProjectImpact[];
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <Typography
        variant="caption"
        as="h3"
        className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle-foreground"
      >
        {title}
      </Typography>
      <ol className="grid gap-px overflow-hidden border border-surface bg-surface-divider sm:grid-cols-2">
        {items.map((item, index) => (
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
              as="h4"
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
    </div>
  );
}

export function ProjectNarrativeSections({
  problem,
  solution,
  decisions,
  impact,
  learnings,
  visuals
}: ProjectNarrativeSectionsProps) {
  const productOutcomes = impact.filter(item => item.kind === 'product');
  const implementationEvidence = impact.filter(
    item => item.kind === 'implementation'
  );
  const learningGroups: Array<[string, string[]]> = [
    ['What I learned', learnings.lessons],
    ['What I would improve', learnings.improvements],
    ['What remains unvalidated', learnings.unvalidated]
  ];

  return (
    <>
      <FadeIn
        delay={220}
        as="section"
        id="problem"
        className="mb-14 scroll-mt-8 md:mb-18"
        aria-labelledby="problem-heading"
      >
        <ProjectSectionLabel id="problem-heading">
          Problem
        </ProjectSectionLabel>
        <dl className="space-y-5">
          {[
            ['Target user', problem.audience],
            ['Challenge', problem.challenge],
            ['Why it mattered', problem.stakes]
          ].map(([label, value]) => (
            <div
              key={label}
              className="grid gap-1 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-5"
            >
              <Typography
                variant="caption"
                as="dt"
                className="text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle-foreground"
              >
                {label}
              </Typography>
              <Typography
                variant="body"
                as="dd"
                className="leading-relaxed text-muted-foreground"
              >
                {value}
              </Typography>
            </div>
          ))}
        </dl>
        <div className="mt-7 border-l border-surface pl-5 sm:pl-7">
          <Typography
            variant="caption"
            as="h3"
            className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle-foreground"
          >
            Constraints
          </Typography>
          <NarrativeList items={problem.constraints} />
        </div>
        <SupportingVisuals visuals={visuals} section="problem" />
      </FadeIn>

      <FadeIn
        delay={280}
        as="section"
        id="solution"
        className={`mb-14 scroll-mt-8 border-t ${SURFACE.hairline} pt-10 md:mb-18`}
        aria-labelledby="solution-heading"
      >
        <ProjectSectionLabel id="solution-heading">
          Solution
        </ProjectSectionLabel>
        <Typography
          variant="body"
          as="p"
          className="mb-6 leading-relaxed text-muted-foreground"
        >
          {solution.summary}
        </Typography>
        <ol className="space-y-4">
          {solution.workflow.map((step, index) => (
            <li key={step} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
              <span
                aria-hidden="true"
                className="font-mono text-[11px] tabular-nums text-subtle-foreground"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <Typography
                variant="body"
                as="span"
                className="leading-relaxed text-muted-foreground"
              >
                {step}
              </Typography>
            </li>
          ))}
        </ol>
        <SupportingVisuals visuals={visuals} section="solution" />
      </FadeIn>

      <FadeIn
        delay={340}
        as="section"
        id="decisions"
        className={`mb-14 scroll-mt-8 border-t ${SURFACE.hairline} pt-10 md:mb-18`}
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
                <DecisionDetail label="Constraint" value={decision.constraint} />
                <DecisionDetail label="Decision" value={decision.decision} />
                <DecisionDetail label="Rationale" value={decision.rationale} />
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
        <SupportingVisuals visuals={visuals} section="decisions" />
      </FadeIn>

      <FadeIn
        delay={400}
        as="section"
        id="outcomes"
        className={`mb-14 scroll-mt-8 border-t ${SURFACE.hairline} pt-10 md:mb-18`}
        aria-labelledby="outcomes-heading"
      >
        <ProjectSectionLabel id="outcomes-heading">
          Outcomes
        </ProjectSectionLabel>
        <div className="space-y-7">
          <OutcomeList title="Product and delivery" items={productOutcomes} />
          <OutcomeList
            title="Implementation evidence"
            items={implementationEvidence}
          />
        </div>
        <SupportingVisuals visuals={visuals} section="outcomes" />
      </FadeIn>

      <FadeIn
        delay={460}
        as="section"
        id="learnings"
        className={`mb-14 scroll-mt-8 border-t ${SURFACE.hairline} pt-10 md:mb-18`}
        aria-labelledby="learnings-heading"
      >
        <ProjectSectionLabel id="learnings-heading">
          Learnings and Next Steps
        </ProjectSectionLabel>
        <div className="space-y-7">
          {learningGroups.map(([title, items]) => (
            <div key={title}>
              <Typography
                variant="caption"
                as="h3"
                className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle-foreground"
              >
                {title}
              </Typography>
              <NarrativeList items={items} />
            </div>
          ))}
        </div>
        <SupportingVisuals visuals={visuals} section="learnings" />
      </FadeIn>
    </>
  );
}
