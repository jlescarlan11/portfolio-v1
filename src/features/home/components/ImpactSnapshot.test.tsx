import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
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
  it('presents three results in plain language', () => {
    render(<ImpactSnapshot {...impactSnapshotContent} />);

    const section = screen.getByRole('region', { name: impactSnapshotContent.title });
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('id', 'impact');
    expect(section).toHaveClass('border-y', 'py-16', 'md:py-24');
    expect(impactSnapshotContent.items).toHaveLength(3);

    for (const item of impactSnapshotContent.items) {
      expect(screen.getByText(item.metric)).toBeVisible();
      expect(screen.getByText(item.context)).toBeVisible();
    }
  });

  it('does not add extra source links', () => {
    render(<ImpactSnapshot {...impactSnapshotContent} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
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
