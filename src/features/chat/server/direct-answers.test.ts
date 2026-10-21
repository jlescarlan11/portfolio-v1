import { describe, expect, it } from 'vitest';
import { getDirectPortfolioAnswer } from './direct-answers';

describe('education and overview answers', () => {
  it.each([
    'What is John studying now, and where?',
    "What's John's education?",
    'Where does John study?',
    'What are you studying?'
  ])('answers %s with only the current degree and school', question => {
    const answer = getDirectPortfolioAnswer(question);
    expect(answer).toBe('John is pursuing a Bachelor of Science in Computer Science at the University of the Philippines Cebu.');
    expect(answer).not.toMatch(/graduated|completed|\n|reach him|gmail/i);
  });

  it.each(['Tell me about John.', 'Who is John?', 'Give me an overview of John.'])('formats %s consistently and compactly', question => {
    const answer = getDirectPortfolioAnswer(question);
    expect(answer).toBeDefined();
    const [introduction] = answer!.split('\n\n');
    expect(introduction.match(/[.!?](?=\s|$)/g)).toHaveLength(2);
    expect(answer!.match(/^- /gm)).toHaveLength(3);
    expect(answer!.trim().split(/\s+/).length).toBeLessThanOrEqual(80);
    expect(answer).toContain('mathematics');
    expect(answer).toContain('Computer Science at UP Cebu');
    expect(answer).toContain('**Project stories:** PACU, PriceCraft, HEALTH');
    expect(answer!.split('\n').at(-1)).toBe('Reach him at jlescarlan11@gmail.com or [LinkedIn](https://www.linkedin.com/in/john-lester-escarlan/)');
  });

  it.each([
    'Did John graduate in mathematics?',
    'What did John learn in his Computer Science classes?',
    'Tell me about John and his PACU contribution.'
  ])('preserves detailed questions for the model: %s', question => {
    expect(getDirectPortfolioAnswer(question)).toBeUndefined();
  });
});
