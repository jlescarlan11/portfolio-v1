import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CertificationsList } from './CertificationsList';

afterEach(cleanup);

describe('CertificationsList', () => {
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
