import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from './HomePage';
import { siteConfig } from '@/shared/site/config';

vi.mock('@/features/about/components/ContributionGraph', () => ({ default: () => <p>GitHub graph</p> }));
beforeEach(() => vi.stubGlobal('React', React));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('Personal portfolio journey', () => {
  it('connects all six sections and exposes every navigation destination', () => {
    const { container } = render(<HomePage />);
    const main = screen.getByRole('main');
    expect(within(main).getAllByRole('heading', { level: 2 }).map(h => h.textContent)).toEqual([
      'How I got here', 'What I’ve built and learned', 'Where I’ve grown', 'What comes next', 'Let’s connect.'
    ]);
    expect(siteConfig.navigation.header.map(item => item.name)).toEqual(['About', 'Work', 'Experience', 'Contact']);
    for (const item of siteConfig.navigation.header) {
      expect(container.querySelectorAll(`#${item.href.split('#')[1]}`)).toHaveLength(1);
    }
    expect(screen.queryByText('GitHub graph')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'GitHub Activity' })).not.toBeInTheDocument();
    expect(screen.getByText(/I started in mathematics/)).toBeVisible();
    expect(screen.getByText(/I’m continuing my Computer Science studies/)).toBeVisible();
  });

  it('lets visitors open every featured story without relying on the rotated cards', () => {
    render(<HomePage />);
    for (const [title, slug] of [['PACU', 'pacu'], ['PriceCraft', 'pricecraft'], ['HEALTH', 'health']]) {
      fireEvent.click(screen.getByRole('button', { name: `Select ${title}` }));
      expect(screen.getByRole('link', { name: 'Read the story' })).toHaveAttribute('href', `/projects/${slug}`);
      expect(screen.getByRole('button', { name: `Select ${title}` })).toHaveAttribute('aria-pressed', 'true');
    }
  });
});
