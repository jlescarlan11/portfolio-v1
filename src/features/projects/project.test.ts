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

test('isRenderableExternalUrl accepts valid http and https urls', () => {
  assert.equal(isRenderableExternalUrl('https://example.com'), true);
  assert.equal(isRenderableExternalUrl('http://example.com/demo'), true);
});

test('isRenderableExternalUrl rejects placeholders and unsupported protocols', () => {
  assert.equal(isRenderableExternalUrl('REPLACE_WITH_URL'), false);
  assert.equal(isRenderableExternalUrl('mailto:hello@example.com'), false);
  assert.equal(isRenderableExternalUrl('javascript:alert(1)'), false);
});

test('formatMonthYear formats to short and long month strings', () => {
  assert.equal(formatMonthYear('2026-03'), 'Mar 2026');
  assert.equal(formatMonthYear('2026-03', 'long'), 'March 2026');
});
