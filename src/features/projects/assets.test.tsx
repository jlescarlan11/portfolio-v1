import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { heroContent } from '@/features/home/content';
import { projects } from './data';

describe('portfolio media assets', () => {
  it('resolves every active local media reference beneath public', () => {
    const mediaPaths = [
      heroContent.profileImage.src,
      ...projects.flatMap(project => [
        ...(project.logo ? [project.logo] : []),
        ...project.caseStudy.visuals.map(visual => visual.src)
      ])
    ];

    for (const mediaPath of new Set(mediaPaths)) {
      expect(
        existsSync(`public${mediaPath}`),
        `${mediaPath} should resolve beneath public`
      ).toBe(true);
    }
  });
});
