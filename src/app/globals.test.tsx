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
