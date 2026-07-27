import { afterEach, describe, expect, it, vi } from 'vitest';

const DEFAULT_EMAIL = 'jlescarlan11@gmail.com';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('contact identity consistency', () => {
  it('uses the configured email in every user-facing contact workflow', async () => {
    const configuredEmail = 'portfolio-contact@example.com';
    vi.stubEnv('NEXT_PUBLIC_CONTACT_EMAIL', configuredEmail);
    vi.resetModules();

    const [{ contactContent }, { heroContent }, { buildSystemPrompt }] =
      await Promise.all([
        import('./content'),
        import('../home/content'),
        import('../chat/content')
      ]);

    const emailLink = heroContent.socialLinks.find(
      ({ platform }) => platform === 'Email'
    );
    const systemPrompt = buildSystemPrompt();

    expect(contactContent.email).toBe(configuredEmail);
    expect(emailLink?.url).toBe(`mailto:${configuredEmail}`);
    expect(systemPrompt).toContain(configuredEmail);
    expect(systemPrompt).not.toContain(DEFAULT_EMAIL);
  });

  it.each([
    ['   ', DEFAULT_EMAIL],
    ['not-an-email', DEFAULT_EMAIL],
    [' owner@example.com ', 'owner@example.com']
  ])(
    'normalizes configured email %j to %j',
    async (configuredEmail, expectedEmail) => {
      vi.stubEnv('NEXT_PUBLIC_CONTACT_EMAIL', configuredEmail);
      vi.resetModules();

      const { contactContent } = await import('./content');

      expect(contactContent.email).toBe(expectedEmail);
    }
  );
});
