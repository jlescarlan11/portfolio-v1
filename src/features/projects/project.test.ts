import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getNextProject,
  getProjectBySlug,
  getProjectSlugs
} from './lib/projects.ts';
import { projects, projectsSectionContent } from './data.ts';
import type { ProjectRecord } from './types.ts';
import {
  formatMonthYear,
  isRenderableExternalUrl
} from '../../shared/lib/project.ts';
import { aboutContent } from '../../features/about/content.ts';

const EXPECTED_PROJECT_SLUGS = [
  'rent-n-roll',
  'health',
  'pricecraft',
  'job-pipeline'
];

function getProjectCopy(project: ProjectRecord): string {
  return [
    project.description,
    project.caseStudy.summary,
    project.caseStudy.roleScope.role,
    project.caseStudy.roleScope.team,
    project.caseStudy.roleScope.duration,
    project.caseStudy.roleScope.status,
    ...project.caseStudy.roleScope.ownership,
    project.caseStudy.problem.audience,
    project.caseStudy.problem.challenge,
    project.caseStudy.problem.stakes,
    ...project.caseStudy.problem.constraints,
    project.caseStudy.solution.summary,
    ...project.caseStudy.solution.workflow,
    ...project.caseStudy.learnings.lessons,
    ...project.caseStudy.learnings.improvements,
    ...project.caseStudy.learnings.unvalidated,
    ...project.caseStudy.impact.flatMap(impact => [
      impact.value,
      impact.label,
      impact.context
    ]),
    ...project.caseStudy.decisions.flatMap(decision => [
      decision.title,
      decision.constraint,
      decision.decision,
      decision.rationale,
      decision.tradeoff,
      decision.validation
    ]),
    ...project.caseStudy.highlights
  ].filter((value): value is string => Boolean(value)).join(' ');
}

function assertIncludesEvery(
  actual: string,
  expected: string[],
  messagePrefix: string
): void {
  const normalizedActual = actual.toLowerCase();

  for (const value of expected) {
    assert.ok(
      normalizedActual.includes(value.toLowerCase()),
      `${messagePrefix} should include "${value}"`
    );
  }
}

test('project slugs are unique', () => {
  const slugs = getProjectSlugs();
  assert.equal(new Set(slugs).size, slugs.length);
});

test('project order and featured project remain stable', () => {
  assert.deepEqual(getProjectSlugs(), EXPECTED_PROJECT_SLUGS);
  assert.equal(projects[0].title, 'Rent N Roll');
});

test('project section presents all four engineering domains without unsupported adoption claims', () => {
  const sectionCopy = [
    projectsSectionContent.title,
    projectsSectionContent.intro
  ].join(' ');

  assertIncludesEvery(
    sectionCopy,
    ['marketplaces', 'civic tech', 'business tooling', 'AI automation'],
    'project section copy'
  );
  assert.doesNotMatch(sectionCopy, /ships? to real users/i);
});

test('all projects provide complete case-study content', () => {
  for (const project of projects) {
    assert.ok(project.slug.trim(), `${project.title} should have a slug`);
    assert.ok(project.title.trim(), `${project.slug} should have a title`);
    assert.ok(project.category.trim(), `${project.title} should have a category`);
    assert.ok(
      project.description.trim(),
      `${project.title} should have a description`
    );
    assert.ok(
      project.caseStudy.summary.trim(),
      `${project.title} should have a summary`
    );
    for (const [field, value] of Object.entries(project.caseStudy.problem)) {
      if (field === 'constraints') continue;
      assert.ok(
        typeof value === 'string' && value.trim(),
        `${project.title} should have a non-empty problem.${field}`
      );
    }
    assert.ok(
      project.caseStudy.problem.constraints.length > 0 &&
        project.caseStudy.problem.constraints.every(constraint =>
          constraint.trim()
        ),
      `${project.title} should have non-empty problem.constraints`
    );
    assert.ok(
      project.caseStudy.solution.summary.trim(),
      `${project.title} should have a non-empty solution.summary`
    );
    assert.ok(
      project.caseStudy.solution.workflow.length > 0 &&
        project.caseStudy.solution.workflow.every(step => step.trim()),
      `${project.title} should have non-empty solution.workflow`
    );
    for (const [field, entries] of Object.entries(
      project.caseStudy.learnings
    )) {
      assert.ok(
        entries.length > 0 &&
          entries.every((entry: string) => entry.trim()),
        `${project.title} should have non-empty learnings.${field}`
      );
    }
    assert.ok(
      project.caseStudy.roleScope.role.trim(),
      `${project.title} should have a role`
    );
    assert.ok(
      project.caseStudy.roleScope.ownership.length > 0 &&
        project.caseStudy.roleScope.ownership.every(item => item.trim()),
      `${project.title} should have non-empty ownership statements`
    );
    for (const [field, value] of Object.entries(project.caseStudy.roleScope)) {
      if (field === 'ownership' || value === undefined) continue;
      assert.ok(
        typeof value === 'string' && value.trim(),
        `${project.title} should not have empty role/scope fields`
      );
    }
    assert.ok(
      project.caseStudy.impact.length > 0 &&
        project.caseStudy.impact.every(
          impact =>
            ['product', 'implementation'].includes(impact.kind) &&
            impact.value.trim() &&
            impact.label.trim() &&
            impact.context.trim()
        ),
      `${project.title} should have complete impact entries`
    );
    assert.ok(
      project.caseStudy.decisions.length > 0 &&
        project.caseStudy.decisions.every(
          decision =>
            decision.title.trim() &&
            decision.constraint.trim() &&
            decision.decision.trim() &&
            decision.rationale.trim() &&
            (!decision.tradeoff || decision.tradeoff.trim()) &&
            (!decision.validation || decision.validation.trim())
        ),
      `${project.title} should have complete engineering decisions`
    );
    assert.ok(
      project.caseStudy.highlights.length > 0 &&
        project.caseStudy.highlights.every(highlight => highlight.trim()),
      `${project.title} should have non-empty highlights`
    );
    const heroVisuals = project.caseStudy.visuals.filter(
      visual => visual.kind === 'hero'
    );
    assert.equal(
      heroVisuals.length,
      1,
      `${project.title} should have exactly one hero visual`
    );
    assert.match(
      heroVisuals[0].src,
      /\.(?:jpe?g|png|webp)$/i,
      `${project.title} should use a raster hero visual`
    );
    for (const [index, visual] of project.caseStudy.visuals.entries()) {
      assert.ok(
        visual.src.trim(),
        `${project.title} should have a non-empty visuals[${index}].src`
      );
      assert.ok(
        visual.alt.trim(),
        `${project.title} should have a non-empty visuals[${index}].alt`
      );
      assert.ok(
        visual.caption.trim(),
        `${project.title} should have a non-empty visuals[${index}].caption`
      );
      if (visual.kind === 'supporting') {
        assert.ok(
          ['problem', 'solution', 'decisions', 'outcomes', 'learnings'].includes(
            visual.section
          ),
          `${project.title} should have a valid visuals[${index}].section`
        );
      }
    }
    assert.ok(
      project.technologies.length > 0 &&
        project.technologies.every(technology => technology.trim()),
      `${project.title} should have non-empty technologies`
    );
  }
});

test('getProjectBySlug returns a project for a known slug', () => {
  const firstProject = projects[0];
  assert.deepEqual(getProjectBySlug(firstProject.slug)?.title, firstProject.title);
});

test('getProjectBySlug returns undefined for an unknown slug', () => {
  assert.equal(getProjectBySlug('does-not-exist'), undefined);
});

test('getNextProject follows source order and wraps the final project', () => {
  const expectedNextProjects: Record<string, string> = {
    'rent-n-roll': 'health',
    health: 'pricecraft',
    pricecraft: 'job-pipeline',
    'job-pipeline': 'rent-n-roll'
  };

  for (const [slug, nextSlug] of Object.entries(expectedNextProjects)) {
    assert.equal(
      getNextProject(slug)?.slug,
      nextSlug,
      `${slug} should link to ${nextSlug}`
    );
  }
});

test('getNextProject returns undefined for an unknown slug', () => {
  assert.equal(getNextProject('does-not-exist'), undefined);
});

test('isRenderableExternalUrl accepts valid https urls', () => {
  assert.equal(isRenderableExternalUrl('https://example.com'), true);
});

test('isRenderableExternalUrl rejects placeholders and unsupported protocols', () => {
  assert.equal(isRenderableExternalUrl('REPLACE_WITH_URL'), false);
  assert.equal(isRenderableExternalUrl('http://example.com/demo'), false);
  assert.equal(isRenderableExternalUrl('mailto:hello@example.com'), false);
  assert.equal(isRenderableExternalUrl('javascript:alert(1)'), false);
  assert.equal(
    isRenderableExternalUrl('https://trusted.example@evil.example'),
    false
  );
  assert.equal(isRenderableExternalUrl('https://127.0.0.1/admin'), false);
  assert.equal(isRenderableExternalUrl('https://192.168.1.8/admin'), false);
  assert.equal(isRenderableExternalUrl('https://[::1]/admin'), false);
  assert.equal(isRenderableExternalUrl('https://localhost./admin'), false);
  assert.equal(isRenderableExternalUrl('https://service.local/admin'), false);
});

test('formatMonthYear formats to short and long month strings', () => {
  assert.equal(formatMonthYear('2026-03'), 'Mar 2026');
  assert.equal(formatMonthYear('2026-03', 'long'), 'March 2026');
});

test('freelance experience entry has metric-rich bullets from resume', () => {
  const freelance = aboutContent.experience.find(e => e.id === 'exp-freelance-software-engineer');
  assert.ok(freelance, 'freelance entry should exist');
  assert.ok(
    freelance.responsibilities.some(r => r.includes('12+')),
    'should mention 12+ bugs resolved'
  );
  assert.ok(
    freelance.responsibilities.some(r => r.includes('15+')),
    'should mention 15+ manual steps cut'
  );
});

test('skills include Dart and Flutter from resume', () => {
  const all = aboutContent.techCategories.flatMap(c => c.items.map(i => i.label));
  assert.ok(all.includes('Dart'), 'Dart should be in skills');
  assert.ok(all.includes('Flutter'), 'Flutter should be in skills');
});

test('Rent N Roll copy matches its resume-backed pre-launch scope', () => {
  const rentNRoll = projects.find(project => project.slug === 'rent-n-roll');
  assert.ok(rentNRoll, 'Rent N Roll should exist');

  const copy = getProjectCopy(rentNRoll);
  assertIncludesEvery(
    copy,
    [
      'pre-launch',
      'booking',
      'availability',
      'identity verification',
      'digital contracts',
      'handoff confirmation',
      'payment and deposit',
      'PayMongo',
      '24 untyped database queries',
      'typed Supabase RPC'
    ],
    'Rent N Roll copy'
  );
  assert.doesNotMatch(copy, /\bproduction\b/i);
  assert.doesNotMatch(copy, /\bcustodial escrow\b/i);
  assert.doesNotMatch(copy, /\bdispute (?:adjudication|resolution)\b/i);
  assert.equal(rentNRoll.caseStudy.roleScope.status, 'Pre-launch');
  assert.equal(rentNRoll.caseStudy.roleScope.team, 'Solo project');
  assert.ok(
    rentNRoll.caseStudy.impact.some(
      impact => impact.value === '24 queries'
    ),
    'Rent N Roll should expose the verified typed-query impact'
  );
  assertIncludesEvery(
    rentNRoll.technologies.join(' '),
    ['Supabase', 'PostgreSQL', 'PayMongo'],
    'Rent N Roll technologies'
  );
});

test('HEALTH copy uses precise safety, offline, and team claims', () => {
  const health = projects.find(project => project.slug === 'health');
  assert.ok(health, 'HEALTH should exist');

  const copy = getProjectCopy(health);
  assertIncludesEvery(
    copy,
    [
      'five-person team',
      'top 15 of 200+',
      'deterministic',
      'emergency',
      'mental-health',
      'Gemini',
      'offline',
      'SQLite',
      'synchronization when connectivity returns'
    ],
    'HEALTH copy'
  );
  assert.doesNotMatch(copy, /\b100%\b/i);
  assert.doesNotMatch(copy, /\ball core features\b/i);
  assert.equal(
    health.caseStudy.roleScope.team,
    'Five-person hackathon team'
  );
  assert.equal(
    health.caseStudy.roleScope.role,
    'Project and Technical Lead'
  );
  assert.equal(
    health.caseStudy.roleScope.status,
    'Hackathon semi-finalist; repository archived'
  );
  assert.ok(
    health.caseStudy.impact.some(
      impact =>
        impact.value === 'Top 15 / 200+' &&
        impact.context.includes('five-person team')
    ),
    'HEALTH should attribute the hackathon result to the team'
  );
  assert.ok(
    health.technologies.includes('Gemini API'),
    'HEALTH should list Gemini API'
  );
});

test('PriceCraft copy reflects its current pricing and persistence capabilities', () => {
  const priceCraft = projects.find(project => project.slug === 'pricecraft');
  assert.ok(priceCraft, 'PriceCraft should exist');

  assertIncludesEvery(
    getProjectCopy(priceCraft),
    [
      'markup',
      'profit-margin',
      'shared recipe costs',
      'product variants',
      'offline',
      'Supabase',
      'Row-Level Security',
      'guest-data migration',
      'JSON import and export',
      'installable PWA',
      'receipt',
      'OCR',
      'ingredient catalog',
      'price history',
      'user confirmation',
      '300+ tests'
    ],
    'PriceCraft copy'
  );
  assertIncludesEvery(
    [
      priceCraft.caseStudy.problem.audience,
      priceCraft.caseStudy.problem.challenge,
      priceCraft.caseStudy.problem.stakes,
      ...priceCraft.caseStudy.problem.constraints
    ].join(' '),
    [
      'small food businesses',
      'spreadsheets',
      'ingredient costs',
      'real margins',
      'shared recipe costs',
      'connectivity'
    ],
    'PriceCraft problem'
  );
  assertIncludesEvery(
    priceCraft.technologies.join(' '),
    ['Supabase', 'PostgreSQL', 'Tesseract.js', 'Vitest', 'Vite PWA'],
    'PriceCraft technologies'
  );
  assert.equal(priceCraft.completedAt, '2026-05');
  assert.equal(priceCraft.caseStudy.roleScope.team, 'Solo project');
  assert.doesNotMatch(
    getProjectCopy(priceCraft),
    /\b(?:active users?|customers?|revenue|sales|conversion rate|response time|load time)\b/i
  );
});

test('Job Pipeline copy reflects the version 2.0 architecture and manual boundary', () => {
  const jobPipeline = projects.find(project => project.slug === 'job-pipeline');
  assert.ok(jobPipeline, 'Job Pipeline should exist');

  const copy = getProjectCopy(jobPipeline);
  assertIncludesEvery(
    copy,
    [
      'seven',
      'n8n workflows',
      '22 evidence-linked',
      'Slack alerts',
      'manual review',
      'analytics',
      'recommendations',
      'archival',
      'versioned configuration',
      '89-field',
      'canonical job',
      '147 deterministic tests',
      'disabled by default',
      'never applies for a job'
    ],
    'Job Pipeline copy'
  );
  assert.doesNotMatch(copy, /auto(?:matically)?[- ]submit/i);
  assert.doesNotMatch(copy, /autonomous application submission/i);
  assert.ok(
    jobPipeline.caseStudy.impact.some(
      impact =>
        impact.value === 'Manual-only' &&
        impact.context.includes('review and submit every application')
    ),
    'Job Pipeline should preserve the manual sending boundary'
  );
  assert.equal(jobPipeline.completedAt, '2026-07');
  assert.equal(jobPipeline.caseStudy.roleScope.team, 'Solo project');
  assert.equal(
    jobPipeline.caseStudy.roleScope.status,
    'Validated; disabled by default'
  );
});

test('project evidence reuses the established live and GitHub destinations', () => {
  const expectedLinks: Record<string, ProjectRecord['links']> = {
    'rent-n-roll': {
      liveUrl: 'https://rentnroll.store'
    },
    health: {
      githubUrl: 'https://github.com/jlescarlan11/health'
    },
    pricecraft: {
      githubUrl: 'https://github.com/jlescarlan11/pricecraft',
      liveUrl: 'https://pricecraft.netlify.app/'
    },
    'job-pipeline': {
      githubUrl: 'https://github.com/jlescarlan11/Job-Pipeline'
    }
  };

  for (const project of projects) {
    assert.deepEqual(
      project.links,
      expectedLinks[project.slug],
      `${project.title} should keep its established evidence destinations`
    );
  }
});

test('each short description stays aligned with visible case-study positioning', () => {
  const sharedClaims: Record<string, string[]> = {
    'rent-n-roll': ['pre-launch', 'marketplace', 'PayMongo'],
    health: ['health', 'Gemini', 'offline'],
    pricecraft: ['pricing', 'PWA', 'receipt'],
    'job-pipeline': ['seven', 'n8n', 'manual']
  };

  for (const project of projects) {
    const visibleCopy = [
      project.caseStudy.summary,
      project.caseStudy.problem.audience,
      project.caseStudy.problem.challenge,
      project.caseStudy.problem.stakes,
      ...project.caseStudy.problem.constraints,
      project.caseStudy.solution.summary,
      ...project.caseStudy.solution.workflow,
      ...project.caseStudy.learnings.lessons,
      ...project.caseStudy.learnings.improvements,
      ...project.caseStudy.learnings.unvalidated,
      ...project.caseStudy.highlights
    ].join(' ');

    assertIncludesEvery(
      project.description,
      sharedClaims[project.slug],
      `${project.title} description`
    );
    assertIncludesEvery(
      visibleCopy,
      sharedClaims[project.slug],
      `${project.title} visible case study`
    );
  }
});

test('project outcomes distinguish delivered value from implementation evidence', () => {
  const expectedImplementationEvidence: Record<string, string[]> = {
    'rent-n-roll': ['24 queries'],
    health: [],
    pricecraft: ['300+ tests'],
    'job-pipeline': ['147 tests']
  };

  for (const project of projects) {
    const actualImplementationEvidence = project.caseStudy.impact
      .filter(impact => impact.kind === 'implementation')
      .map(impact => impact.value);

    assert.deepEqual(
      actualImplementationEvidence,
      expectedImplementationEvidence[project.slug],
      `${project.title} should classify implementation evidence explicitly`
    );
  }
});

test('Rent N Roll migrates its existing screenshots to contextual visual metadata', () => {
  const rentNRoll = projects.find(project => project.slug === 'rent-n-roll');
  assert.ok(rentNRoll, 'Rent N Roll should exist');

  assert.deepEqual(rentNRoll.caseStudy.visuals.map(visual => visual.src), [
    '/project/rent-n-roll.jpg',
    '/project/rent-n-roll-listing.jpg'
  ]);
  assert.equal(
    rentNRoll.caseStudy.visuals.filter(visual => visual.kind === 'hero').length,
    1
  );
  assert.ok(
    rentNRoll.caseStudy.visuals.some(
      visual => visual.kind === 'supporting' && visual.section === 'solution'
    ),
    'Rent N Roll should associate its listing screenshot with the solution'
  );
});
