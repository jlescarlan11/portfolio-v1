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
    <section id="about">About{contributionSlot}</section>
  )
}));
vi.mock('@/features/about/components/ContributionGraph', () => ({
  default: () => null
}));
vi.mock('@/features/contact/ContactSection', () => ({
  default: () => <section id="contact">Contact</section>
}));
vi.mock('@/features/home/components/FooterSection', () => ({
  default: () => <footer>Footer</footer>
}));
vi.mock('@/features/home/components/HeroSection', () => ({
  default: () => <section id="home">Home</section>
}));
vi.mock('@/features/home/components/ImpactSnapshot', () => ({
  default: () => <section>Impact</section>
}));
vi.mock('@/features/projects', () => ({
  ProjectsSection: () => <section id="work">Work</section>,
  projects: [],
  projectsSectionContent: {}
}));
vi.mock('@/shared/components/NavigationBar', () => ({
  default: () => null
}));

beforeAll(() => {
  vi.stubGlobal('React', React);
});

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(document, 'fonts');
  window.history.replaceState(null, '', '/');
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe('HomePage', () => {
  it('provides a focusable target for global skip navigation', () => {
    render(<HomePage />);

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');
  });

  it('keeps direct-anchor content exposed when font readiness never resolves', () => {
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { ready: new Promise<FontFaceSet>(() => undefined) }
    });
    window.history.replaceState(null, '', '/#contact');

    render(<HomePage />);

    const main = screen.getByRole('main');
    expect(main).not.toHaveAttribute('inert');
    expect(main).not.toHaveAttribute('aria-hidden');
    expect(document.getElementById('contact')).toHaveTextContent('Contact');
    expect(screen.queryByText('Preparing portfolio')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('does not add a screen-reader loading region when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));

    render(<HomePage />);

    expect(screen.getByRole('main')).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
