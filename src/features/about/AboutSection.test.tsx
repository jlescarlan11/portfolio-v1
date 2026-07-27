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
});
