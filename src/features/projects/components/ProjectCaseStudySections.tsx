import Image from 'next/image';
import type {
  ProjectDecision,
  ProjectEvidence,
  ProjectImpact,
  ProjectLearnings,
  ProjectLinks,
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
import { SURFACE } from '@/shared/styles/shared';

interface ProjectMetaStripProps {
  roleScope: ProjectRoleScope;
  client?: string;
  completedAt: string;
  technologies: string[];
}

interface ProjectEvidenceLinksProps {
  evidence: ProjectEvidence[];
  links: ProjectLinks;
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

const evidenceLabels: Record<ProjectEvidence['kind'], string> = {
  'live-product': 'Live product',
  'public-repository': 'Public repository'
};

export function ProjectEvidenceLinks({
  evidence,
  links
}: ProjectEvidenceLinksProps) {
  const safeEvidence = evidence.flatMap(item => {
    const url = item.kind === 'live-product'
      ? links.liveUrl
      : links.githubUrl;
    return isRenderableExternalUrl(url) ? [{ ...item, url }] : [];
  });

  if (safeEvidence.length === 0) return null;

  return (
    <section
      aria-labelledby="public-evidence-heading"
      className={`mb-10 border-y ${SURFACE.hairline} py-7 md:mb-12`}
    >
      <div className="mb-5 max-w-2xl space-y-2">
        <Typography variant="h3" as="h2" id="public-evidence-heading">
          Public evidence
        </Typography>
        <Typography variant="body-sm" as="p" className="text-muted-foreground">
          These reviewed public sources support the adjacent build claims; they
          do not imply adoption or unmeasured outcomes.
        </Typography>
      </div>
      <ul className="grid gap-px overflow-hidden border border-surface bg-surface-divider sm:grid-cols-2">
        {safeEvidence.map(item => (
          <li key={`${item.kind}-${item.url}`} className="min-w-0 bg-surface">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full min-h-11 flex-col p-5 transition-colors duration-200 hover:bg-surface-tint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foreground"
            >
              <Typography variant="label" as="span" className="text-foreground">
                {evidenceLabels[item.kind]}
                <span aria-hidden="true" className="ml-1 opacity-50">↗</span>
                <NewTabNotice />
              </Typography>
              <Typography
                variant="body-sm"
                as="span"
                className="mt-2 leading-relaxed text-muted-foreground group-hover:text-foreground"
              >
                {item.description}
              </Typography>
            </a>
          </li>
        ))}
      </ul>
    </section>
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
    <div className={`space-y-5 border-y ${SURFACE.hairline} py-5`}>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className={`min-w-0 space-y-1 ${fact.label === 'Status' ? 'col-span-2' : ''}`}
          >
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

        <div className="col-span-2 space-y-2 border-t border-surface pt-4">
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
        className="flex min-w-0 flex-wrap gap-2 border-t border-surface pt-4"
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
        <span className="mb-1 block font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle-foreground">
          Source: {visual.sourceLabel}
        </span>
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
