import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { projects } from '@/features/projects';
import ProjectPage, {
  generateMetadata,
  ProjectHero
} from './page';

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

describe('ProjectPage', () => {
  it.each(projects)('shows a concise project story for $slug', async project => {
    render(await ProjectPage({ params: Promise.resolve({ slug: project.slug }) }));
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(screen.getByText(project.caseStudy.summary)).toBeVisible();
    expect(screen.getByText(project.caseStudy.roleScope.role)).toBeVisible();
    for (const item of project.caseStudy.roleScope.ownership) expect(screen.getByText(item)).toBeVisible();
    expect(screen.getByText(project.caseStudy.problem.challenge)).toBeVisible();
    for (const item of project.caseStudy.decisions) expect(screen.getByText(item.decision)).toBeVisible();
    for (const lesson of project.caseStudy.learnings.lessons) expect(screen.getByText(lesson)).toBeVisible();
    for (const item of project.caseStudy.impact) expect(screen.getByText(item.context)).toBeVisible();
    for (const visual of project.caseStudy.visuals) expect(screen.getByRole('img', { name: visual.alt })).toBeVisible();
    for (const technology of project.technologies) expect(screen.getByText(technology)).toBeVisible();
    expect(screen.queryByRole('navigation', { name: 'Case study sections' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Engineering Decisions' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to projects/ })).toHaveAttribute('href', '/projects');
    for (const url of [project.links.liveUrl, project.links.githubUrl]) {
      if (!url) continue;
      const link = screen.getAllByRole('link').find(link => link.getAttribute('href') === url);
      expect(link).toBeDefined();
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it.each([
    ['rent-n-roll', 'Full-Stack Engineer', 'Solo project'],
    ['health', 'Project and Technical Lead', 'Five-person hackathon team'],
    ['pricecraft', 'Full-Stack Engineer', 'Solo project'],
    ['regex2nfa', 'Frontend Engineer and Product Designer', 'Four-person class project'],
    ['job-pipeline', 'Workflow Automation Engineer', 'Solo project']
  ])('introduces the role and team before the %s screenshot', async (slug, role, team) => {
    render(await ProjectPage({ params: Promise.resolve({ slug }) }));

    const header = screen.getByRole('heading', { level: 1 }).closest('header')!;
    expect(within(header).getByText(role)).toBeVisible();
    expect(within(header).getByText(team)).toBeVisible();
    expect(header.compareDocumentPosition(screen.getAllByRole('img')[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('puts PriceCraft’s calculator and source links in the opening with separate descriptions', async () => {
    render(await ProjectPage({ params: Promise.resolve({ slug: 'pricecraft' }) }));

    const opening = within(screen.getByRole('heading', { level: 1 }).closest('header')!);
    const calculator = opening.getByRole('link', { name: /Try the calculator/ });
    const source = opening.getByRole('link', { name: /View source/ });
    expect(calculator).toHaveAttribute('href', 'https://pricecraft.netlify.app/');
    expect(calculator).toHaveAccessibleDescription(/without signing in/i);
    expect(source).toHaveAccessibleDescription(/tests/i);
  });

  it('shows the HEALTH team’s semifinalist result before the screenshot', async () => {
    render(await ProjectPage({ params: Promise.resolve({ slug: 'health' }) }));

    const opening = within(screen.getByRole('heading', { level: 1 }).closest('header')!);
    expect(opening.getByText(/Team CTRL\+H.*Health-track semifinalist/)).toBeVisible();
    const announcement = opening.getByRole('link', { name: /View semifinalist announcement/ });
    expect(announcement).toHaveAttribute('href', 'https://www.facebook.com/photo/?fbid=122119673397051230&set=pcb.122119673733051230');
    expect(announcement).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('includes the overlap and retry checks in the Job Pipeline decision they support', async () => {
    render(await ProjectPage({ params: Promise.resolve({ slug: 'job-pipeline' }) }));

    const decisions = screen.getByRole('region', { name: 'The choices behind the work' });
    expect(within(decisions).getByText(/Tests cover duplicate listings, stale claims, and overlapping reviews/)).toBeVisible();
  });

  it('introduces the PACU contract and progress fix before the hero image', async () => {
    render(await ProjectPage({ params: Promise.resolve({ slug: 'pacu' }) }));

    const header = screen.getByRole('heading', { name: 'PACU', level: 1 }).closest('header')!;
    const hero = screen.getByRole('img', { name: /Orange PACU wordmark/ });

    expect(within(header).getByText('Software Engineer (Contract)')).toBeVisible();
    expect(within(header).getByText('February–August 2026')).toBeVisible();
    expect(within(header).getByText(/At Pharmacy & Acute Care University, I fixed .* go past 100%/)).toBeVisible();
    expect(within(header).getByText(/duplicate certificate records.*undo a content release/)).toBeVisible();
    expect(header.compareDocumentPosition(hero) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('explains what the public PACU link shows and keeps it separate from the fixes', async () => {
    render(await ProjectPage({ params: Promise.resolve({ slug: 'pacu' }) }));

    const link = screen.getByRole('link', { name: /Public PACU site/ });

    expect(link).toHaveAccessibleDescription(/browse courses.*progress and certificate records are behind sign-in.*internal tool/i);
  });

  it('shows the scope of the PACU fixes and the certificate test result', async () => {
    render(await ProjectPage({ params: Promise.resolve({ slug: 'pacu' }) }));

    expect(screen.getByText(/I made five code paths use the same completion check/)).toBeVisible();
    expect(screen.getByText(/The certificate change passed 51 tests/)).toBeVisible();
    expect(screen.getByText(/prevent duplicate records/)).toBeVisible();
    expect(screen.getByText(/roll back a content release/)).toBeVisible();
  });

  it.each([
    ['rent-n-roll', 'health'],
    ['health', 'pricecraft'],
    ['pricecraft', 'regex2nfa'],
    ['regex2nfa', 'job-pipeline'],
    ['job-pipeline', 'pacu'],
    ['pacu', 'rent-n-roll']
  ])('links %s to the source-ordered next project %s', async (slug, nextSlug) => {
    const nextProject = projects.find(project => project.slug === nextSlug);
    if (!nextProject) throw new Error(`${nextSlug} fixture is missing`);
    const page = await ProjectPage({
      params: Promise.resolve({ slug })
    });

    render(page);

    const card = screen.getByText('Next project').closest('a');
    expect(card).not.toBeNull();
    expect(card).toHaveAttribute('href', `/projects/${nextSlug}`);
    expect(card).not.toHaveAttribute('target');
    expect(within(card!).getByText(nextProject.title)).toBeVisible();
    expect(
      within(card!).getByText(nextProject.caseStudy.summary)
    ).toBeVisible();
  });
});

describe('ProjectHero', () => {
  it('uses the project logo when no screenshot is available', () => {
    render(
      <ProjectHero
        fallbackSrc="/project/example.svg"
        title="Example project"
      />
    );

    expect(
      screen.getByRole('img', { name: 'Example project logo' })
    ).toBeVisible();
  });

  it('renders an accessible placeholder when no screenshot or logo is available', () => {
    render(<ProjectHero fallbackSrc="" title="Example project" />);

    expect(
      screen.getByRole('img', { name: 'Example project preview unavailable' })
    ).toBeVisible();
  });
});

describe('generateMetadata', () => {
  it.each(projects)(
    'uses the case-study summary for $slug descriptions',
    async project => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: project.slug })
      });

      expect(metadata.description).toBe(project.caseStudy.summary);
      expect(metadata.openGraph).toMatchObject({
        description: project.caseStudy.summary
      });
      expect(metadata.twitter).toMatchObject({
        description: project.caseStudy.summary
      });
    }
  );

  it.each(projects)(
    'uses the raster hero visual for $slug social metadata',
    async project => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: project.slug })
      });
      const hero = project.caseStudy.visuals.find(
        visual => visual.kind === 'hero'
      );
      if (!hero) throw new Error(`${project.title} hero fixture is missing`);

      expect(metadata.openGraph).toMatchObject({
        images: [{ url: hero.src, alt: hero.alt }]
      });
      expect(metadata.twitter).toMatchObject({
        images: [{ url: hero.src, alt: hero.alt }]
      });
    }
  );
});
