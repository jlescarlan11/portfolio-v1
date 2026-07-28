import React from 'react';
import {
  cleanup,
  render,
  screen,
  within
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ProjectEvidenceSections,
  ProjectMetaStrip
} from './ProjectCaseStudySections';

beforeEach(() => {
  vi.stubGlobal('React', React);
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn()
    }))
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('ProjectMetaStrip', () => {
  it('renders required ownership details without empty optional facts or links', () => {
    render(
      <ProjectMetaStrip
        roleScope={{
          role: 'Platform Engineer',
          ownership: ['Owned the typed integration boundary.']
        }}
        completedAt="2026-07"
        technologies={['TypeScript']}
        liveUrl="javascript:alert(1)"
      />
    );

    expect(screen.getByText('Role')).toBeVisible();
    expect(screen.getByText('Platform Engineer')).toBeVisible();
    expect(screen.getByText('Owned')).toBeVisible();
    expect(
      screen.getByText('Owned the typed integration boundary.')
    ).toBeVisible();
    expect(screen.getByText('July 2026')).toBeVisible();
    expect(screen.getByText('TypeScript')).toBeVisible();
    for (const optionalLabel of ['Team', 'Duration', 'Status', 'Client']) {
      expect(screen.queryByText(optionalLabel)).not.toBeInTheDocument();
    }
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders populated optional facts and secure evidence links', () => {
    render(
      <ProjectMetaStrip
        roleScope={{
          role: 'Product Engineer',
          ownership: ['Owned delivery.'],
          team: 'Three-person team',
          duration: 'Six weeks',
          status: 'Released'
        }}
        client="Example client"
        completedAt="2026-07"
        technologies={['TypeScript']}
        liveUrl="https://example.com"
        githubUrl="https://github.com/example/project"
      />
    );

    for (const value of [
      'Three-person team',
      'Six weeks',
      'Released',
      'Example client'
    ]) {
      expect(screen.getByText(value)).toBeVisible();
    }
    for (const link of screen.getAllByRole('link')) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link.className).toContain('focus-visible:outline');
    }
  });
});

describe('ProjectEvidenceSections', () => {
  it('omits empty evidence sections', () => {
    const { container } = render(
      <ProjectEvidenceSections impact={[]} decisions={[]} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('omits an empty sibling section without hiding populated evidence', () => {
    render(
      <ProjectEvidenceSections
        impact={[
          {
            kind: 'product',
            value: 'One result',
            label: 'Verified outcome',
            context: 'The supported context.'
          }
        ]}
        decisions={[]}
      />
    );

    expect(screen.getByRole('region', { name: 'Impact' })).toBeVisible();
    expect(
      screen.queryByRole('region', { name: 'Engineering Decisions' })
    ).not.toBeInTheDocument();
  });

  it('renders impact and decision evidence in source order with optional details', () => {
    render(
      <ProjectEvidenceSections
        impact={[
          {
            kind: 'product',
            value: 'First value',
            label: 'First label',
            context: 'First context'
          },
          {
            kind: 'implementation',
            value: 'Second value',
            label: 'Second label',
            context: 'Second context'
          }
        ]}
        decisions={[
          {
            title: 'Typed boundary',
            constraint: 'The contract was ambiguous.',
            decision: 'Introduce an explicit type boundary.',
            rationale: 'Keep both sides aligned.',
            tradeoff: 'Requires deliberate schema updates.',
            validation: 'The contract test passes.'
          }
        ]}
      />
    );

    const impactRegion = screen.getByRole('region', { name: 'Impact' });
    const impactItems = within(impactRegion).getAllByRole('listitem');
    expect(impactItems).toHaveLength(2);
    expect(impactItems[0]).toHaveTextContent(
      'First valueFirst labelFirst context'
    );
    expect(impactItems[1]).toHaveTextContent(
      'Second valueSecond labelSecond context'
    );

    const decisionsRegion = screen.getByRole('region', {
      name: 'Engineering Decisions'
    });
    expect(
      within(decisionsRegion).getByRole('heading', {
        level: 3,
        name: 'Typed boundary'
      })
    ).toBeVisible();
    for (const label of [
      'Constraint',
      'Decision',
      'Rationale',
      'Trade-off',
      'Validation'
    ]) {
      expect(
        within(decisionsRegion).getByText(label, { selector: 'dt' })
      ).toBeVisible();
    }
    for (const decorativeIndex of screen.getAllByText('01')) {
      expect(decorativeIndex).toHaveAttribute('aria-hidden', 'true');
    }
  });
});
