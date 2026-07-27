import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProfileStructuredData from '@/features/home/components/ProfileStructuredData';
import {
  createProfilePageSchema,
  serializeJsonLd
} from '@/features/home/profile-schema';

const CANONICAL_URL = 'https://johnlesterescarlan.pro/';

beforeEach(() => {
  vi.stubGlobal('React', React);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createProfilePageSchema', () => {
  it('describes the visible homepage profile with only confirmed social profiles', () => {
    expect(createProfilePageSchema()).toEqual({
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      url: CANONICAL_URL,
      mainEntity: {
        '@type': 'Person',
        name: 'John Lester Escarlan',
        url: CANONICAL_URL,
        jobTitle: 'Full-Stack Software Engineer',
        sameAs: [
          'https://github.com/jlescarlan11',
          'https://www.linkedin.com/in/john-lester-escarlan/'
        ]
      }
    });
  });

  it('omits unsupported optional properties instead of emitting empty values', () => {
    const schema = createProfilePageSchema();

    expect(schema).not.toHaveProperty('description');
    expect(schema.mainEntity).not.toHaveProperty('email');
    expect(schema.mainEntity).not.toHaveProperty('address');
    expect(JSON.stringify(schema)).not.toMatch(/:(null|""|undefined)/);
  });
});

describe('serializeJsonLd', () => {
  it('produces valid JSON without allowing an injected closing script tag', () => {
    const hostileValue = '</script><script>alert("injected")</script>';
    const serialized = serializeJsonLd({ name: hostileValue });

    expect(serialized.toLowerCase()).not.toContain('</script');
    expect(JSON.parse(serialized)).toEqual({ name: hostileValue });
  });

  it('rejects values that JSON cannot serialize', () => {
    expect(() => serializeJsonLd(undefined)).toThrow(
      'JSON-LD value must be JSON-serializable.'
    );
  });
});

describe('ProfileStructuredData', () => {
  it('renders exactly one valid profile JSON-LD script', () => {
    const container = document.createElement('div');
    container.innerHTML = renderToStaticMarkup(ProfileStructuredData());
    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]'
    );

    expect(scripts).toHaveLength(1);
    expect(JSON.parse(scripts[0].textContent ?? '')).toEqual(
      createProfilePageSchema()
    );
  });
});
