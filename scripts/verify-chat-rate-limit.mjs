const baseUrl = process.env.CHAT_BASE_URL?.replace(/\/$/, '');
const windowLimit = 20;

if (!baseUrl) {
  console.error('Set CHAT_BASE_URL to a Netlify deploy preview or production origin.');
  process.exitCode = 1;
} else {
  const sendInvalidRequest = () =>
    fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"messages":['
    });

  const belowLimit = await Promise.all(
    Array.from({ length: windowLimit }, () => sendInvalidRequest())
  );
  const unexpected = belowLimit.find(response => response.status !== 400);

  if (unexpected) {
    console.error(
      `FAIL below-limit request returned ${unexpected.status}. Wait 60 seconds with no chat traffic, then retry.`
    );
    process.exitCode = 1;
  } else {
    // Netlify's globally distributed counter can lag completed requests
    // briefly even after every response has reached the client.
    await new Promise(resolve => setTimeout(resolve, 10_000));

    const limited = await sendInvalidRequest();
    const retryAfter = limited.headers.get('retry-after');

    if (limited.status === 429 && retryAfter === '60') {
      console.log('PASS requests 1-20 reached validation; request 21 returned 429 with Retry-After: 60.');
    } else {
      console.error(
        `FAIL request 21 returned ${limited.status} with Retry-After: ${retryAfter ?? 'missing'}.`
      );
      process.exitCode = 1;
    }
  }
}
