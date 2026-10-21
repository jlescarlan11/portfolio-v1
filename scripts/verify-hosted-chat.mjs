const baseUrl = process.env.CHAT_BASE_URL?.replace(/\/$/, '');
const requestSpacingMs = 21_000;

if (!baseUrl) {
  console.error('Set CHAT_BASE_URL to a Vercel Preview or production origin.');
  process.exitCode = 1;
} else {
  const sentenceCount = value =>
    value.match(/[.!?](?=\s|$)/g)?.length ?? 0;
  const hasOneOrTwoSentences = value => {
    const count = sentenceCount(value);
    return count >= 1 && count <= 2;
  };
  const isShortAnswer = value =>
    hasOneOrTwoSentences(value) && !/[\r\n]/.test(value) &&
    value.trim().split(/\s+/).length <= 45;

  const cases = [
    {
      id: 'Q1',
      prompt: 'Tell me about John.',
      validate: answer => {
        const firstBullet = answer.search(/^\s*[-*]\s+/m);
        const introduction = firstBullet >= 0 ? answer.slice(0, firstBullet) : '';
        return (
          sentenceCount(introduction) === 2 &&
          (answer.match(/^\s*[-*]\s+/gm)?.length ?? 0) === 3 &&
          /jlescarlan11@gmail\.com|linkedin\.com\/in\/john-lester-escarlan/i.test(answer)
        );
      }
    },
    {
      id: 'Q2',
      prompt: "What are John's strongest frontend skills?",
      validate: answer =>
        hasOneOrTwoSentences(answer) &&
        /react|next\.?js|flutter|react native/i.test(answer)
    },
    {
      id: 'Q3',
      prompt: 'Where has John worked?',
      validate: answer =>
        isShortAnswer(answer) &&
        ['Upwork', "Wind's Gate", 'Bayoa', 'Alliance Software', 'Pharmacy & Acute Care University']
          .every(company => answer.includes(company)) &&
        !/full[\s-]*time|part[\s-]*time/i.test(answer)
    },
    {
      id: 'Q4',
      prompt: 'Which projects show mobile development experience?',
      validate: answer =>
        isShortAnswer(answer) && /health/i.test(answer) &&
        /react native/i.test(answer) && /expo/i.test(answer) &&
        !/rent\s*n\s*roll/i.test(answer)
    },
    {
      id: 'Q5',
      prompt: 'How can I contact John?',
      validate: answer =>
        hasOneOrTwoSentences(answer) &&
        /jlescarlan11@gmail\.com|linkedin\.com\/in\/john-lester-escarlan/i.test(answer)
    },
    {
      id: 'Q8',
      prompt: 'What is PriceCraft?',
      validate: answer => isShortAnswer(answer) &&
        /pricing|selling prices/i.test(answer) && /food businesses/i.test(answer) &&
        !/typescript|supabase|tesseract|vitest|tailwind/i.test(answer)
    },
    {
      id: 'Q9',
      prompt: 'Has Rent N Roll launched, and how many customers does it have?',
      validate: answer => isShortAnswer(answer) && /pre[\s-]*launch/i.test(answer) &&
        /not (?:been )?verified|unverified|unknown/i.test(answer) &&
        !/no customers|zero customers|0 customers/i.test(answer)
    },
    {
      id: 'Q6',
      prompt: 'Can John dance?',
      validate: answer =>
        hasOneOrTwoSentences(answer) &&
        /not in (?:his|the) profile|only have info on john['’]s professional background/i.test(
          answer
        ) &&
        /developer|engineer|react|node|flutter|project|skill|experience/i.test(
          answer
        )
    },
    {
      id: 'Q7',
      prompt: 'Write me a recipe for pancakes.',
      validate: answer =>
        answer.trim() ===
        "I only have info on John's professional background — try asking about his skills, experience, or projects."
    }
  ];

  const readAnswer = async (response, startedAt) => {
    if (!response.ok || !response.body) {
      throw new Error(`HTTP ${response.status}`);
    }
    if (!response.headers.get('content-type')?.includes('application/x-ndjson')) {
      throw new Error('Unexpected response content type.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let pending = '';
    let answer = '';
    let finished = false;
    let firstTokenAt;

    while (true) {
      const { done, value } = await reader.read();
      pending += decoder.decode(value, { stream: !done });
      const lines = pending.split('\n');
      pending = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.trim()) continue;
        const event = JSON.parse(line);
        if (event.type === 'text-delta') {
          if (finished || typeof event.delta !== 'string') {
            throw new Error('Invalid text frame.');
          }
          if (event.delta && firstTokenAt === undefined) {
            firstTokenAt = performance.now();
          }
          answer += event.delta;
        }
        if (event.type === 'finish') {
          if (finished) throw new Error('Duplicate finish frame.');
          finished = true;
        }
        if (event.type === 'error') throw new Error(event.message);
        if (
          event.type !== 'text-delta' &&
          event.type !== 'finish' &&
          event.type !== 'error'
        ) {
          throw new Error('Unknown stream frame.');
        }
      }

      if (done) break;
    }

    if (!finished) throw new Error('Stream ended without a finish frame.');
    return {
      answer,
      firstTokenMs:
        firstTokenAt === undefined ? undefined : Math.round(firstTokenAt - startedAt),
      totalMs: Math.round(performance.now() - startedAt)
    };
  };

  let failed = false;
  for (const [caseIndex, testCase] of cases.entries()) {
    if (caseIndex > 0) {
      await new Promise(resolve => setTimeout(resolve, requestSpacingMs));
    }

    try {
      const startedAt = performance.now();
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: testCase.prompt }]
        }),
        signal: AbortSignal.timeout(35_000)
      });
      const measurement = await readAnswer(response, startedAt);
      const { answer } = measurement;
      const passed = testCase.validate(answer);
      const timing =
        measurement.firstTokenMs === undefined
          ? `total=${measurement.totalMs}ms`
          : `ttft=${measurement.firstTokenMs}ms total=${measurement.totalMs}ms`;
      console.log(
        `${passed ? 'PASS' : 'FAIL'} ${testCase.id} [${timing}]: ${answer}`
      );
      failed ||= !passed;
    } catch (error) {
      failed = true;
      console.error(
        `FAIL ${testCase.id}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  if (failed) process.exitCode = 1;
}
