import React from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  InitialLoadProvider,
  useInitialLoad
} from '@/shared/loading';
import { heroContent } from '@/features/home/content';
import HeroSection from './HeroSection';

vi.mock('./ProfileImage', () => ({
  default: ({
    alt,
    src,
    onSettled
  }: {
    alt: string;
    src: string;
    onSettled?: (outcome: 'loaded') => void;
  }) => (
    <button data-src={src} onClick={() => onSettled?.('loaded')}>
      Settle {alt}
    </button>
  )
}));

vi.mock('./SocialLinks', () => ({
  default: () => <nav aria-label="Social links" />
}));

function ReadinessProbe(): React.JSX.Element {
  const { status, completedCount } = useInitialLoad();
  return <output>{status}:{completedCount}</output>;
}

describe('HeroSection initial-load integration', () => {
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

  it('settles the hero-image milestone from the portrait callback', () => {
    render(
      <InitialLoadProvider>
        <ReadinessProbe />
        <HeroSection {...heroContent} />
      </InitialLoadProvider>
    );

    expect(screen.getByText('loading:2')).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', {
        name: `Settle ${heroContent.profileImage.alt}`
      })
    );
    expect(screen.getByText('ready:3')).toBeInTheDocument();
  });

  it('renders without readiness reporting outside the initial-load coordinator', () => {
    render(<HeroSection {...heroContent} />);

    const portrait = screen.getByRole('button', {
      name: `Settle ${heroContent.profileImage.alt}`
    });
    expect(portrait).toBeInTheDocument();
    expect(portrait).toHaveAttribute('data-src', '/hero-image.jpg');
  });
});
