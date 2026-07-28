import assert from 'node:assert/strict';
import test from 'node:test';
import {
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
    ...project.caseStudy.overview,
    ...project.caseStudy.highlights
  ].join(' ');
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
    assert.ok(
      project.caseStudy.overview.length > 0 &&
        project.caseStudy.overview.every(paragraph => paragraph.trim()),
      `${project.title} should have non-empty overview paragraphs`
    );
    assert.ok(
      project.caseStudy.highlights.length > 0 &&
        project.caseStudy.highlights.every(highlight => highlight.trim()),
      `${project.title} should have non-empty highlights`
    );
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
      'JSON import and export'
    ],
    'PriceCraft copy'
  );
  assertIncludesEvery(
    priceCraft.technologies.join(' '),
    ['Supabase', 'PostgreSQL', 'Vitest'],
    'PriceCraft technologies'
  );
});

test('Job Pipeline copy preserves automation guardrails and manual review', () => {
  const jobPipeline = projects.find(project => project.slug === 'job-pipeline');
  assert.ok(jobPipeline, 'Job Pipeline should exist');

  const copy = getProjectCopy(jobPipeline);
  assertIncludesEvery(
    copy,
    [
      'three',
      'n8n workflows',
      'active and archived Google Sheets',
      'deduplication',
      'whitelists',
      'rate-aware',
      'archival',
      'manual review before sending'
    ],
    'Job Pipeline copy'
  );
  assert.doesNotMatch(copy, /auto(?:matically)?[- ]submit/i);
  assert.doesNotMatch(copy, /autonomous application submission/i);
});

test('each short description stays aligned with visible case-study positioning', () => {
  const sharedClaims: Record<string, string[]> = {
    'rent-n-roll': ['pre-launch', 'marketplace', 'PayMongo'],
    health: ['health', 'Gemini', 'offline'],
    pricecraft: ['pricing', 'offline', 'Supabase'],
    'job-pipeline': ['three', 'n8n', 'manual review']
  };

  for (const project of projects) {
    const visibleCopy = [
      project.caseStudy.summary,
      ...project.caseStudy.overview,
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
