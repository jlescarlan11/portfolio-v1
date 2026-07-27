import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi
} from 'vitest';
import HomePage from './HomePage';

vi.mock('@/features/about/AboutSection', () => ({
  default: ({ contributionSlot }: { contributionSlot: React.ReactNode }) => (
    <section>{contributionSlot}</section>
  )
}));
vi.mock('@/features/about/components/ContributionGraph', () => ({
  default: () => null
}));
vi.mock('@/features/contact/ContactSection', () => ({
  default: () => null
}));
vi.mock('@/features/home', () => ({
  FooterSection: () => null,
  HeroSection: () => null,
  heroContent: {}
}));
vi.mock('@/features/home/components/InitialLoadExperience', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));
vi.mock('@/features/projects', () => ({
  ProjectsSection: () => null,
  projects: [],
  projectsSectionContent: {}
}));
vi.mock('@/shared/components/NavigationBar', () => ({
  default: () => null
}));

beforeAll(() => {
  vi.stubGlobal('React', React);
});

afterEach(cleanup);

afterAll(() => {
  vi.unstubAllGlobals();
});

describe('HomePage', () => {
  it('provides a focusable target for global skip navigation', () => {
    render(<HomePage />);

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');
  });
});
