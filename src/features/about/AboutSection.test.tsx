import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import AboutSection from './AboutSection';
import { aboutContent } from './content';

beforeAll(() => {
  vi.stubGlobal('React', React);
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
});
