import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from './content';

describe('buildSystemPrompt', () => {
  it("includes John's full name", () => {
    expect(buildSystemPrompt()).toContain('John Lester Escarlan');
  });

  it('includes contact email', () => {
    expect(buildSystemPrompt()).toContain('jlescarlan11@gmail.com');
  });

  it('includes at least one project title', () => {
    expect(buildSystemPrompt()).toContain('FireCheck');
  });

  it('includes at least one skill', () => {
    expect(buildSystemPrompt()).toContain('TypeScript');
  });
});
