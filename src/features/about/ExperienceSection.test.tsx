import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
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
    expect(screen.queryByText('Bachelor of Science in Computer Science')).not.toBeInTheDocument();
    expect(screen.queryByText('Completed')).not.toBeInTheDocument();
    expect(screen.getByText('Bayoa Analytics')).toBeVisible();
    expect(screen.getByText('Upwork')).toBeVisible();
    expect(screen.getByRole('link', { name: 'View full experience' })).toHaveAttribute('href', '/experience');
    expect(screen.getByRole('link', { name: 'Tools I use' })).toHaveAttribute('href', '/stack');
    expect(screen.getByRole('link', { name: 'Certifications' })).toHaveAttribute('href', '/certifications');
  });
  it('preserves all employment and education on the history page', () => {
    render(<HistoryPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Experience' })).toBeVisible();
    const work = within(screen.getByRole('region', { name: 'Work experience' }));
    const education = within(screen.getByRole('region', { name: 'Education' }));
    expect(work.getAllByRole('heading', { level: 3 }).map(heading => heading.textContent)).toEqual([
      'Software Engineer (Contract)',
      'Software Monitoring Engineer',
      'Software Engineer Intern',
      'Freelance Software Engineer',
      'Full-Stack Developer Intern'
    ]);
    expect(work.getByText(/through Upwork/)).toBeVisible();
    expect(education.getByRole('heading', { name: 'Mathematics studies', level: 3 })).toBeVisible();
    expect(education.getByText('Aug 2027')).toHaveAttribute('datetime', '2027-08');
    for (const item of aboutContent.education) for (const achievement of item.achievements ?? []) expect(education.getByText(achievement)).toBeVisible();
    for (const item of aboutContent.experience) for (const responsibility of item.responsibilities) expect(work.getByText(responsibility)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/#experience');
  });
  it('leads with the core stack and links to projects that use it', () => {
    render(<StackPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Stack' })).toBeVisible();
    const core = within(screen.getByRole('region', { name: 'Core stack' }));
    expect(core.getAllByRole('listitem').map(item => item.textContent)).toEqual([
      'React', 'TypeScript', 'Node.js', 'PostgreSQL'
    ]);
    for (const [name, href] of [
      ['PACU', '/projects/pacu'],
      ['PriceCraft', '/projects/pricecraft'],
      ['HEALTH', '/projects/health']
    ]) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
    }
    for (const category of aboutContent.techCategories) for (const item of category.items) expect(screen.getAllByText(item.label).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/#experience');
  });
  it('distinguishes the certificate PDF from Coursera verification links', () => {
    render(<CertificatesPage />);
    expect(screen.getByRole('heading', { level: 2, name: 'GCI World April 2026' })).toBeVisible();
    expect(screen.getByText('31 August 2026')).toHaveAttribute('datetime', '2026-08-31');
    expect(screen.getByRole('link', { name: /View certificate \(PDF\).*GCI World/ }))
      .toHaveAttribute('href', '/certificates/gci-world-april-2026.pdf');
    expect(screen.getByRole('link', { name: /Verify on Coursera.*Amazon Junior Software Developer/ }))
      .toHaveAttribute('href', 'https://www.coursera.org/account/accomplishments/specialization/PLMC59Z3XNB9');
    expect(screen.getByRole('link', { name: /Verify on Coursera.*Agile Project Management/ }))
      .toHaveAttribute('href', 'https://www.coursera.org/account/accomplishments/verify/QYUV5C56WQCV');
    expect(screen.getAllByText('2025')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/#certifications');
  });
});
