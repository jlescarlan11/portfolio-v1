import { describe, expect, it } from 'vitest';
import { aboutContent } from './content';

const expectedExperienceOrder = [
  'exp-wg-monitoring-engineer',
  'exp-freelance-software-engineer',
  'exp-pharmacy-acute-care-software-engineer',
  'exp-asi-software-engineer-intern',
  'exp-bayoa-full-stack-intern'
];

function getExperienceCopy(): string {
  return aboutContent.experience
    .flatMap(item => [
      item.title,
      item.company,
      ...item.responsibilities
    ])
    .join(' ');
}

describe('about experience content', () => {
  it('lists the resume-backed roles in current-first order', () => {
    expect(aboutContent.experience.map(item => item.id)).toEqual(
      expectedExperienceOrder
    );

    const currentRoleIds = aboutContent.experience
      .filter(item => item.isCurrent)
      .map(item => item.id);

    expect(currentRoleIds).toEqual([
      'exp-wg-monitoring-engineer',
      'exp-freelance-software-engineer'
    ]);

    for (const role of aboutContent.experience.filter(item => item.isCurrent)) {
      expect(role.endDate).toBeNull();
    }

    const pharmacyRole = aboutContent.experience.find(
      item => item.id === 'exp-pharmacy-acute-care-software-engineer'
    );

    expect(pharmacyRole).toMatchObject({
      startDate: '2026-02',
      endDate: '2026-08'
    });
    expect(pharmacyRole?.isCurrent).not.toBe(true);
  });

  it('includes the supported responsibilities and measurable outcomes', () => {
    const copy = getExperienceCopy();

    for (const claim of [
      'online learning platform',
      'entitlement rules',
      '12+ production-blocking defects',
      '15+ manual steps',
      '25+ incidents across eight production services',
      'eight recovery runbooks',
      'five production features using C# and ASP.NET Core MVC',
      '800 milliseconds to 150 milliseconds'
    ]) {
      expect(copy).toContain(claim);
    }
  });

  it('does not reintroduce unsupported experience claims', () => {
    const copy = getExperienceCopy();

    for (const unsupportedClaim of [
      'thousands of daily users',
      '10+ REST API endpoints',
      "one of the Philippines' largest software firms",
      'scoping requirements directly with non-technical stakeholders',
      'traced incidents from raw logs to root cause'
    ]) {
      expect(copy.toLowerCase()).not.toContain(
        unsupportedClaim.toLowerCase()
      );
    }
  });
});
