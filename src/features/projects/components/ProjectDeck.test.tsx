import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { projects } from '../data';
import ProjectDeck from './ProjectDeck';

afterEach(cleanup);
describe('Featured project previews', () => {
  it('centers either side card and updates the case-study link without status badges', () => {
    const featured = ['rent-n-roll', 'pacu', 'pricecraft'].map(slug => projects.find(project => project.slug === slug)!);
    render(<ProjectDeck projects={featured} />);
    expect(screen.getByRole('link', { name: 'Read case study' })).toHaveAttribute('href', '/projects/rent-n-roll');
    for (const slug of ['pricecraft', 'pacu', 'rent-n-roll']) {
      const project = featured.find(item => item.slug === slug)!;
      fireEvent.click(screen.getByRole('button', { name: `Show ${project.title}` }));
      expect(screen.getByRole('heading', { name: project.title })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Read case study' })).toHaveAttribute('href', `/projects/${slug}`);
      expect(screen.getByRole('article', { name: project.title })).toHaveFocus();
      expect(screen.getByRole('img', { name: project.listing.thumbnail.alt.replace(/^Orange /, '') })).toBeInTheDocument();
    }
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'All projects' })).toHaveAttribute('href', '/projects');
    expect(screen.queryByText('Pre-launch')).not.toBeInTheDocument();
    expect(screen.queryByText('My contribution')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next project' })).not.toBeInTheDocument();
  });
});
