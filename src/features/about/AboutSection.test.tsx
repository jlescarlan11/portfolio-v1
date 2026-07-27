import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { cleanup, render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import AboutSection from './AboutSection';
import { aboutContent } from './content';

beforeAll(() => {
  vi.stubGlobal('React', React);
});

afterEach(() => {
  cleanup();
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe('AboutSection progressive enhancement', () => {
  it('does not ship timeline content hidden behind JavaScript-only visibility', () => {
    const markup = renderToStaticMarkup(<AboutSection content={aboutContent} />);

    expect(markup).toContain(aboutContent.experience[0].title);
    expect(markup).not.toContain('opacity-0');
  });

  it('gives each visible subsection its label as an accessible name', () => {
    render(<AboutSection content={aboutContent} />);

    for (const name of ['Skills', 'Credentials', 'Experience', 'Education']) {
      expect(screen.getByRole('region', { name })).toBeInTheDocument();
    }
  });

  it('nests subsection and timeline headings without skipping a level', () => {
    render(<AboutSection content={aboutContent} />);

    for (const name of ['Skills', 'Credentials', 'Experience', 'Education']) {
      expect(
        screen.getByRole('heading', { level: 3, name })
      ).toBeInTheDocument();
    }
    expect(
      screen.getByRole('heading', {
        level: 4,
        name: aboutContent.experience[0].title
      })
    ).toBeInTheDocument();
    for (const { category } of aboutContent.techCategories) {
      const heading = screen.getByRole('heading', {
        level: 4,
        name: category
      });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('text-subtle-foreground');
      expect(heading).not.toHaveClass('text-foreground/25');
    }
  });

  it('renders declared skills even when they have no bespoke icon', () => {
    const markup = renderToStaticMarkup(<AboutSection content={aboutContent} />);

    for (const skill of ['C', 'C++', 'SQL', 'Riverpod', 'Drift', 'Vitest']) {
      expect(markup).toContain(`>${skill}<`);
    }
  });

  it('announces that certification links open in a new tab', () => {
    render(<AboutSection content={aboutContent} />);

    for (const certification of aboutContent.certifications) {
      expect(
        screen.getByRole('link', {
          name: `${certification.name} (opens in new tab)`
        })
      ).toMatchObject({
        target: '_blank',
        rel: 'noopener noreferrer'
      });
    }
  });
});
