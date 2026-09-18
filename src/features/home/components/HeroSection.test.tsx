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
    expect(portrait).toHaveAttribute('data-src', '/hero-dither.png');
  });

  it('presents a concise introduction and a direct hiring path', () => {
    const { container } = render(<HeroSection {...heroContent} />);

    expect(container.querySelector('#about')).toBeInTheDocument();
    expect(screen.getByText(/I study Computer Science/)).toBeVisible();
    expect(
      screen.getByRole('link', { name: heroContent.primaryCta.label })
    ).toHaveAttribute('href', '#contact');
    expect(screen.getByRole('link', { name: 'Résumé' })).toHaveAttribute('href', '/John_Lester_Escarlan_Resume.pdf');
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/jlescarlan11');
    expect(screen.queryByRole('button', { name: /copy email/i })).not.toBeInTheDocument();
  });
});
