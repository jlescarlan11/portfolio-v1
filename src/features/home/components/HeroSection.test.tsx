import React from 'react';
import {
  cleanup,
  render,
  screen
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { heroContent } from '@/features/home/content';
import HeroSection from './HeroSection';

vi.mock('./ProfileImage', () => ({
  default: ({
    alt,
    src
  }: {
    alt: string;
    src: string;
  }) => (
    <div role="img" aria-label={alt} data-src={src} />
  )
}));

vi.mock('./SocialLinks', () => ({
  default: () => <nav aria-label="Social links" />
}));

describe('HeroSection', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
      }))
    );
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: undefined
    });
  });

  afterEach(() => {
    cleanup();
    Reflect.deleteProperty(document, 'fonts');
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders the portrait without making its load state a content gate', () => {
    render(<HeroSection {...heroContent} />);

    const portrait = screen.getByRole('img', {
      name: heroContent.profileImage.alt
    });
    expect(portrait).toBeInTheDocument();
    expect(portrait).toHaveAttribute('data-src', '/hero-image.jpg');
  });

  it('presents a concise introduction and a direct hiring path', () => {
    const { container } = render(<HeroSection {...heroContent} />);

    expect(container.querySelector('#home')).toHaveClass('min-h-svh');
    expect(container.querySelector('#home > div.relative.z-10')).toHaveClass('min-h-svh');

    expect(screen.getByText(heroContent.tagline)).toBeVisible();
    expect(
      screen.queryByText(/recent work includes 12\+ production-blocking fixes/i)
    ).not.toBeInTheDocument();

    for (const removedService of [
      'Full-stack product delivery',
      'Production debugging and reliability',
      'Workflow automation and integrations'
    ]) {
      expect(screen.queryByText(removedService)).not.toBeInTheDocument();
    }

    expect(
      screen.getByRole('link', { name: /discuss a project/i })
    ).toHaveAttribute('href', '#contact');
    expect(heroContent.primaryCta.label).toBe('Discuss a project');
    expect(
      screen.getByRole('link', { name: /review case studies/i })
    ).toHaveAttribute('href', '#work');
  });
});
