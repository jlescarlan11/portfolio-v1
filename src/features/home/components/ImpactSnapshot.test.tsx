import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { aboutContent } from '@/features/about/content';
import { impactSnapshotContent } from '@/features/home/content';
import ImpactSnapshot from './ImpactSnapshot';

beforeAll(() => {
  vi.stubGlobal('React', React);
});

afterEach(cleanup);

afterAll(() => {
  vi.unstubAllGlobals();
});

describe('ImpactSnapshot', () => {
  it('presents three contextualized, experience-backed outcomes', () => {
    render(<ImpactSnapshot {...impactSnapshotContent} />);

    const section = screen.getByRole('region', { name: impactSnapshotContent.title });
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('id', 'impact');
    expect(section).toHaveClass('border-y', 'py-16', 'md:py-24');
    expect(impactSnapshotContent.items).toHaveLength(3);

    for (const item of impactSnapshotContent.items) {
      expect(screen.getByText(item.metric)).toBeVisible();
      expect(screen.getByText(item.context)).toBeVisible();

      const sourceExperience = aboutContent.experience.find(
        ({ id }) => id === item.sourceExperienceId
      );
      expect(sourceExperience).toBeDefined();

      const sourceCopy = sourceExperience?.responsibilities.join(' ') ?? '';
      const expectedSourceFragments: Record<string, string[]> = {
        '25+ incidents': ['25+ incidents', 'eight production services'],
        '12+ blockers': [
          '12+ production-blocking defects',
          'less than 24 hours'
        ],
        '15+ release steps': [
          '15+ manual steps',
          'four engineering hours per week'
        ]
      };
      for (const fragment of expectedSourceFragments[item.metric] ?? []) {
        expect(sourceCopy).toContain(fragment);
      }
    }
  });

  it('uses accessible in-page source links with full-size touch targets', () => {
    render(<ImpactSnapshot {...impactSnapshotContent} />);

    for (const item of impactSnapshotContent.items) {
      const link = screen.getByRole('link', { name: item.sourceLabel });
      expect(link).toHaveAttribute('href', item.sourceHref);
      expect(link).toHaveClass('min-h-11');
    }
  });

  it('uses a single-column mobile list and a three-column desktop layout without motion-gated content', () => {
    const { container } = render(
      <ImpactSnapshot {...impactSnapshotContent} />
    );

    const outcomes = container.querySelector('dl');
    expect(outcomes).toHaveClass('grid-cols-1', 'sm:grid-cols-3');
    expect(container.innerHTML).not.toMatch(/animate-|fade-in|opacity-0/);
  });
});
