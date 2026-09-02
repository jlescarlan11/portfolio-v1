import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CertificationsList } from './CertificationsList';

afterEach(cleanup);

describe('CertificationsList', () => {
  it('renders a safe portfolio certificate path as a link', () => {
    render(
      <CertificationsList
        certifications={[
          {
            name: 'Local credential',
            issuer: 'Example issuer',
            year: '2026',
            url: '/certificates/local-credential.pdf'
          }
        ]}
        initialVisibleCount={1}
      />
    );

    expect(
      screen.getByRole('link', {
        name: 'Local credential (opens in new tab)'
      })
    ).toHaveAttribute('href', '/certificates/local-credential.pdf');
  });

  it('does not render unsupported certification URLs as links', () => {
    render(
      <CertificationsList
        certifications={[
          {
            name: 'Unsafe credential',
            issuer: 'Example issuer',
            year: '2026',
            url: 'javascript:alert(1)'
          }
        ]}
        initialVisibleCount={1}
      />
    );

    expect(screen.getByText('Unsafe credential')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Unsafe credential/ })
    ).not.toBeInTheDocument();
  });
});
