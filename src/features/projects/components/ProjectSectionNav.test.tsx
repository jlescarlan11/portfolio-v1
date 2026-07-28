import React from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectSectionNav } from './ProjectSectionNav';

const sectionNames = [
  ['problem', 'Problem'],
  ['solution', 'Solution'],
  ['decisions', 'Engineering Decisions'],
  ['outcomes', 'Outcomes'],
  ['learnings', 'Learnings']
] as const;

function SectionFixtures() {
  return (
    <>
      {sectionNames.map(([id]) => (
        <section id={id} key={id} />
      ))}
      <ProjectSectionNav />
    </>
  );
}

beforeEach(() => {
  vi.stubGlobal('React', React);
  window.history.replaceState(null, '', '/projects/example');
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('ProjectSectionNav', () => {
  it('keeps every hash destination available and one current link without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    render(<SectionFixtures />);

    for (const [id, label] of sectionNames) {
      expect(screen.getByRole('link', { name: label })).toHaveAttribute(
        'href',
        `#${id}`
      );
    }
    expect(screen.getAllByRole('link')).toHaveLength(sectionNames.length);
    expect(
      screen.getAllByRole('link').filter(link =>
        link.hasAttribute('aria-current')
      )
    ).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Problem' })).toHaveAttribute(
      'aria-current',
      'location'
    );
  });

  it('uses direct hashes and link activation without hiding native anchor behavior', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    window.history.replaceState(null, '', '/projects/example#outcomes');
    render(<SectionFixtures />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Outcomes' })).toHaveAttribute(
        'aria-current',
        'location'
      );
    });

    fireEvent.click(screen.getByRole('link', { name: 'Learnings' }));
    expect(screen.getByRole('link', { name: 'Learnings' })).toHaveAttribute(
      'aria-current',
      'location'
    );
  });

  it('updates the accessible current state from observed section geometry', async () => {
    let observerCallback: IntersectionObserverCallback | undefined;
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn().mockImplementation(callback => {
        observerCallback = callback;
        return { observe, disconnect, unobserve: vi.fn() };
      })
    );
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn().mockImplementation(callback =>
        window.setTimeout(() => callback(0), 0)
      )
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const tops: Record<string, number> = {
      problem: -400,
      solution: 100,
      decisions: 500,
      outcomes: 900,
      learnings: 1300
    };
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function getBoundingClientRect(this: HTMLElement) {
        return {
          bottom: 0,
          height: 0,
          left: 0,
          right: 0,
          top: tops[this.id] ?? 0,
          width: 0,
          x: 0,
          y: 0,
          toJSON: () => ({})
        };
      }
    );

    render(<SectionFixtures />);
    expect(observe).toHaveBeenCalledTimes(sectionNames.length);
    expect(observerCallback).toBeTypeOf('function');

    observerCallback?.([], {} as IntersectionObserver);
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Solution' })).toHaveAttribute(
        'aria-current',
        'location'
      );
    });

    tops.solution = -500;
    tops.decisions = -200;
    tops.outcomes = 80;
    observerCallback?.([], {} as IntersectionObserver);
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Outcomes' })).toHaveAttribute(
        'aria-current',
        'location'
      );
    });
    expect(
      screen.getAllByRole('link').filter(link =>
        link.hasAttribute('aria-current')
      )
    ).toHaveLength(1);
  });
});
