import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { heroContent } from '@/features/home/content';
import SocialLinks from './SocialLinks';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('SocialLinks', () => {
  it('announces new-tab behavior only for external destinations', () => {
    vi.stubGlobal('React', React);
    render(<SocialLinks links={heroContent.socialLinks} />);

    for (const link of heroContent.socialLinks) {
      const isExternal = link.url.startsWith('http');
      const accessibleName = isExternal
        ? `${link.label} (opens in new tab)`
        : link.label;
      const element = screen.getByRole('link', { name: accessibleName });

      if (isExternal) {
        expect(element).toMatchObject({
          target: '_blank',
          rel: 'noopener noreferrer'
        });
      } else {
        expect(element).not.toHaveAttribute('target');
      }
    }
  });

  it('does not render unsupported social URLs as links', () => {
    render(
      <SocialLinks
        links={[
          {
            platform: 'GitHub',
            url: 'javascript:alert(1)',
            label: 'Unsafe social profile'
          }
        ]}
      />
    );

    expect(
      screen.queryByRole('link', { name: 'Unsafe social profile' })
    ).not.toBeInTheDocument();
  });
});
