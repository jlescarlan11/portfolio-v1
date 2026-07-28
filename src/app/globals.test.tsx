import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const stylesheet = readFileSync(
  join(process.cwd(), 'src/app/globals.css'),
  'utf8'
);

describe('reduced-motion styles', () => {
  it('reveals pending content without exposing every intentionally transparent control', () => {
    const reducedMotionBlock = stylesheet.match(
      /@media \(prefers-reduced-motion: reduce\) \{([\s\S]+)\}\s*$/
    )?.[1];

    expect(reducedMotionBlock).toContain('.fade-in-pending');
    expect(reducedMotionBlock).not.toMatch(/(?:^|,)\s*\.opacity-0\b/m);
  });
});

describe('project case-study layout styles', () => {
  it('uses a 680–720px desktop story column and limits sticky behavior to tall viewports', () => {
    expect(stylesheet).toContain(
      'grid-template-columns: minmax(220px, 280px) minmax(680px, 720px);'
    );
    expect(stylesheet).toContain(
      '@media (min-width: 72rem) and (min-height: 62rem)'
    );
    expect(stylesheet).toMatch(
      /\.project-case-study-rail\s*\{\s*position: sticky;\s*top: 2rem;/
    );
  });
});
