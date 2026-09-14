import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ExperienceSection from './ExperienceSection';
import HistoryPage from '@/app/experience/page';
import StackPage from '@/app/stack/page';
import CertificatesPage from '@/app/certifications/page';
import { aboutContent } from './content';
afterEach(cleanup);
describe('Experience disclosure', () => {
  it('links homepage previews to dedicated detail pages', () => {
    render(<ExperienceSection content={aboutContent} />);
    expect(screen.getByText('Bachelor of Science in Computer Science')).toBeVisible();
    expect(screen.queryByText('Completed')).not.toBeInTheDocument();
    expect(screen.queryByText('Bayoa Analytics')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Main stack' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Full history' })).toHaveAttribute('href', '/experience');
    expect(screen.getByRole('link', { name: 'View all' })).toHaveAttribute('href', '/stack');
    expect(screen.getByRole('link', { name: 'All certifications' })).toHaveAttribute('href', '/certifications');
  });
  it('preserves all employment and education on the history page', () => {
    render(<HistoryPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Experience' })).toBeVisible();
    expect(screen.getByText('Bayoa Analytics')).toBeVisible();
    for (const item of aboutContent.education) for (const achievement of item.achievements ?? []) expect(screen.getByText(achievement)).toBeVisible();
    for (const item of aboutContent.experience) for (const responsibility of item.responsibilities) expect(screen.getByText(responsibility)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/#experience');
  });
  it('shows every technology on the stack page', () => {
    render(<StackPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Stack' })).toBeVisible();
    for (const category of aboutContent.techCategories) for (const item of category.items) expect(screen.getAllByText(item.label).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/#experience');
  });
  it('shows all verification links on the certifications page', () => {
    render(<CertificatesPage />);
    expect(screen.getAllByRole('link', { name: /Verify|View certificate/ })).toHaveLength(aboutContent.certifications.length);
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/#certifications');
  });
  it('keeps all actual certificate links without displaying their dates', () => {
    render(<ExperienceSection content={aboutContent} />);
    expect(screen.getByRole('link', { name: 'View certificate' })).toHaveAttribute('href', aboutContent.certifications[0].url);
    expect(screen.getAllByRole('link', { name: 'Verify' })).toHaveLength(2);
    expect(screen.queryByText('April 2026')).not.toBeInTheDocument();
  });
});
