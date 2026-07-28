import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, CHAT_SYSTEM_PROMPT } from './content';

describe('buildSystemPrompt', () => {
  it('exposes one cached prompt matching the canonical builder', () => {
    expect(CHAT_SYSTEM_PROMPT).toBe(buildSystemPrompt());
  });

  it("includes John's full name", () => {
    expect(buildSystemPrompt()).toContain('John Lester Escarlan');
  });

  it('includes contact email', () => {
    expect(buildSystemPrompt()).toContain('jlescarlan11@gmail.com');
  });

  it('includes at least one project title', () => {
    expect(buildSystemPrompt()).toContain('Rent N Roll');
  });

  it('grounds project-specific answers with each project technology list', () => {
    expect(buildSystemPrompt()).toContain(
      'HEALTH (Mobile Application / Civic Tech; technologies: TypeScript, React Native, Expo'
    );
  });

  it('includes at least one skill', () => {
    expect(buildSystemPrompt()).toContain('TypeScript');
  });

  it('includes the current resume-backed roles and dates', () => {
    const prompt = buildSystemPrompt();

    expect(prompt).toContain(
      'Software Engineer (Contract) at Pharmacy & Acute Care University — Remote (2026-02–2026-08)'
    );
    expect(prompt).toContain(
      "Software Monitoring Engineer at Wind's Gate Philippines — Cebu City (2025-06–Present)"
    );
    expect(prompt).toContain(
      '"Where has John worked?" → John has worked at Pharmacy & Acute Care University'
    );
  });

  it('places the strict output contract after the profile data', () => {
    const prompt = buildSystemPrompt();

    expect(prompt.indexOf('OUTPUT CONTRACT')).toBeGreaterThan(
      prompt.indexOf('PROFILE:')
    );
    expect(prompt).toContain(
      'For every specific question, write exactly one complete sentence'
    );
  });

  it('pins the unrelated-request refusal to the verified release copy', () => {
    expect(buildSystemPrompt()).toContain(
      `"Write me a recipe for pancakes." → I only have info on John's professional background — try asking about his skills, experience, or projects.`
    );
  });
});
