import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from './HomePage';
import { siteConfig } from '@/shared/site/config';

vi.mock('@/features/about/components/ContributionGraph', () => ({ default: () => <p>GitHub graph</p> }));
beforeEach(() => vi.stubGlobal('React', React));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('Personal portfolio journey', () => {
  it('puts selected work before the bio and keeps section anchors available', () => {
    const { container } = render(<HomePage />);
    const main = screen.getByRole('main');
    expect(within(main).getAllByRole('heading', { level: 2 }).map(h => h.textContent)).toEqual([
      'Selected work', 'How I got here', 'Experience', 'Let’s connect.'
    ]);
    expect(siteConfig.navigation.header.map(item => item.name)).toEqual(['About', 'Work', 'Experience', 'Contact']);
    for (const item of siteConfig.navigation.header) {
      expect(container.querySelectorAll(`#${item.href.split('#')[1]}`)).toHaveLength(1);
    }
    expect(screen.queryByText('GitHub graph')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'GitHub Activity' })).not.toBeInTheDocument();
    expect(screen.getByText(/I started in mathematics/)).toBeVisible();
    for (const id of ['journey', 'projects', 'focus']) {
      expect(container.querySelectorAll(`#${id}`)).toHaveLength(1);
    }
    expect(screen.getByText(/I’m open to engineering roles and freelance projects/)).toBeVisible();
  });

  it('lets visitors open every featured story without relying on the rotated cards', () => {
    render(<HomePage />);
    expect(screen.getByRole('radio', { name: 'PACU' })).toBeChecked();
    expect(screen.getByRole('link', { name: /HEALTH.*Hackathon semifinalist.*Top 15 of 200\+ teams/ }))
      .toHaveAttribute('href', '/projects/health');
    for (const [title, slug] of [['PACU', 'pacu'], ['PriceCraft', 'pricecraft'], ['HEALTH', 'health']]) {
      const option = screen.getByRole('radio', { name: title });
      option.focus();
      fireEvent.click(option);
      const caseStudy = screen.getByRole('link', { name: `Read the ${title} case study` });
      expect(caseStudy).toHaveAttribute('href', `/projects/${slug}`);
      expect(option.compareDocumentPosition(caseStudy) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(option).toBeChecked();
      expect(option).toHaveFocus();
    }
  });
});
