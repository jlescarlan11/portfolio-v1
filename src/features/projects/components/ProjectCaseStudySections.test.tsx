import React from 'react';
import {
  cleanup,
  render,
  screen,
  within
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ProjectExternalLinks,
  ProjectMetaStrip,
  ProjectNarrativeSections
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

describe('ProjectExternalLinks', () => {
  it('renders only safe destinations as secure new-tab links', () => {
    render(
      <ProjectExternalLinks
        liveUrl="javascript:alert(1)"
        githubUrl="https://github.com/example/project"
      />
    );

    expect(
      screen.queryByRole('link', { name: /View live/ })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'GitHub (opens in new tab)'
      })
    ).toMatchObject({
      target: '_blank',
      rel: 'noopener noreferrer'
    });
  });

  it('omits the link group when neither destination is renderable', () => {
    const { container } = render(
      <ProjectExternalLinks liveUrl="REPLACE_WITH_URL" />
    );

    expect(container).toBeEmptyDOMElement();
  });
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
      />
    );

    expect(screen.getByText('Platform Engineer')).toBeVisible();
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

  it('renders every populated optional project fact', () => {
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
  });
});

describe('ProjectNarrativeSections', () => {
  it('renders the problem-first sequence, decision evidence, outcomes, learnings, and contextual visual', () => {
    render(
      <ProjectNarrativeSections
        problem={{
          audience: 'Operators',
          challenge: 'Records were fragmented.',
          stakes: 'Decisions were delayed.',
          constraints: ['Connectivity was unreliable.']
        }}
        solution={{
          summary: 'One workflow coordinates the records.',
          workflow: ['Capture the record.', 'Review the result.']
        }}
        decisions={[
          {
            title: 'Typed boundary',
            constraint: 'The contract was ambiguous.',
            decision: 'Introduce an explicit type boundary.',
            rationale: 'Keep both sides aligned.',
            tradeoff: 'Schema changes must be deliberate.',
            validation: 'The contract test passes.'
          }
        ]}
        impact={[
          {
            kind: 'product',
            value: 'One workflow',
            label: 'Delivered value',
            context: 'Operators can complete the supported flow.'
          },
          {
            kind: 'implementation',
            value: '40 tests',
            label: 'Regression evidence',
            context: 'The workflow has deterministic coverage.'
          }
        ]}
        learnings={{
          lessons: ['Boundaries should be explicit.'],
          improvements: ['Broaden field validation.'],
          unvalidated: ['Adoption is not measured.']
        }}
        visuals={[
          {
            kind: 'supporting',
            section: 'solution',
            src: '/project/example.jpg',
            alt: 'Workflow review screen',
            caption: 'The review screen keeps the decision in context.'
          }
        ]}
      />
    );

    const headingNames = [
      'Problem',
      'Solution',
      'Engineering Decisions',
      'Outcomes',
      'Learnings and Next Steps'
    ];
    const headings = headingNames.map(name =>
      screen.getByRole('heading', { level: 2, name })
    );

    for (let index = 0; index < headings.length - 1; index += 1) {
      expect(
        headings[index].compareDocumentPosition(headings[index + 1]) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    }

    for (const name of headingNames) {
      expect(screen.getByRole('region', { name })).toBeVisible();
    }

    const productGroup = screen
      .getByRole('heading', { level: 3, name: 'Product and delivery' })
      .closest('div');
    const implementationGroup = screen
      .getByRole('heading', { level: 3, name: 'Implementation evidence' })
      .closest('div');
    expect(productGroup).not.toBeNull();
    expect(implementationGroup).not.toBeNull();
    expect(within(productGroup!).getByText('One workflow')).toBeVisible();
    expect(within(productGroup!).queryByText('40 tests')).not.toBeInTheDocument();
    expect(
      within(implementationGroup!).getByText('40 tests')
    ).toBeVisible();

    const decisions = screen.getByRole('region', {
      name: 'Engineering Decisions'
    });
    for (const label of [
      'Constraint',
      'Decision',
      'Rationale',
      'Trade-off',
      'Validation'
    ]) {
      expect(within(decisions).getByText(label, { selector: 'dt' })).toBeVisible();
    }

    expect(
      screen.getByRole('img', { name: 'Workflow review screen' })
    ).toBeVisible();
    expect(
      screen.getByText('The review screen keeps the decision in context.')
    ).toBeVisible();
  });
});
