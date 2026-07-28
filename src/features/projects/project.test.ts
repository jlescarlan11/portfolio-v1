import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getProjectBySlug,
  getProjectSlugs
} from './lib/projects.ts';
import { projects } from './data.ts';
import {
  formatMonthYear,
  isRenderableExternalUrl
} from '../../shared/lib/project.ts';
import { aboutContent } from '../../features/about/content.ts';

test('project slugs are unique', () => {
  const slugs = getProjectSlugs();
  assert.equal(new Set(slugs).size, slugs.length);
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

test('rent-n-roll is the first (featured) project in the array', () => {
  assert.equal(projects[0].slug, 'rent-n-roll');
  assert.equal(projects[0].title, 'Rent N Roll');
  assert.ok(
    projects[0].technologies.includes('Supabase'),
    'Rent N Roll should list Supabase as a technology'
  );
});

test('HEALTH description references AI triage', () => {
  const health = projects.find(p => p.slug === 'health');
  assert.ok(health, 'health project should exist');
  assert.ok(
    health.description.toLowerCase().includes('ai'),
    'HEALTH description should mention AI triage'
  );
});

test('PriceCraft description mentions edge cases', () => {
  const pricecraft = projects.find(p => p.slug === 'pricecraft');
  assert.ok(pricecraft, 'pricecraft should exist');
  assert.ok(
    pricecraft.description.includes('edge-case'),
    'PriceCraft description should mention edge cases'
  );
});
