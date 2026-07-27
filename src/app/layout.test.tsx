import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import RootLayout from './layout';

vi.mock('next/font/google', () => ({
  Playfair_Display: () => ({ variable: '--font-playfair' })
}));
vi.mock('geist/font/sans', () => ({
  GeistSans: { variable: '--font-geist-sans' }
}));
vi.mock('geist/font/mono', () => ({
  GeistMono: { variable: '--font-geist-mono' }
}));
vi.mock('./globals.css', () => ({}));

describe('RootLayout progressive enhancement', () => {
  it('reveals pending fade content immediately when JavaScript is disabled', () => {
    const markup = renderToStaticMarkup(
      <RootLayout>
        <main>Portfolio</main>
      </RootLayout>
    );

    expect(markup).toContain(
      '.fade-in-pending{opacity:1!important;animation:none!important}'
    );
  });
});
