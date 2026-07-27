const baseUrl = process.env.CHAT_BASE_URL?.replace(/\/$/, '');
const windowLimit = 20;
const expectedRetrySeconds = 60;

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

  const belowLimit = [];
  for (let requestNumber = 1; requestNumber < windowLimit; requestNumber += 1) {
    belowLimit.push(await sendInvalidRequest());
  }
  const unexpected = belowLimit.find(response => response.status !== 400);

  if (unexpected) {
    console.error(
      `FAIL below-limit request returned ${unexpected.status}. Wait 60 seconds with no chat traffic, then retry.`
    );
    process.exitCode = 1;
  } else {
    // Let Netlify's globally distributed counter settle before racing the two
    // requests that straddle the configured boundary.
    await new Promise(resolve => setTimeout(resolve, 2_000));

    const boundaryResponses = await Promise.all([
      sendInvalidRequest(),
      sendInvalidRequest()
    ]);
    const statuses = boundaryResponses.map(response => response.status).sort();
    let limited = boundaryResponses.find(response => response.status === 429);

    if (statuses[0] === 400 && statuses[1] === 400) {
      // A distributed edge counter can admit requests already in flight. It
      // must still converge before another request can reach the function.
      await new Promise(resolve => setTimeout(resolve, 2_000));
      const afterPropagation = await sendInvalidRequest();
      statuses.push(afterPropagation.status);
      if (afterPropagation.status === 429) limited = afterPropagation;
    }

    const retryAfter = limited?.headers.get('retry-after');
    const boundaryConverged =
      statuses[0] === 400 &&
      statuses.at(-1) === 429 &&
      statuses.every(status => status === 400 || status === 429);

    if (
      boundaryConverged &&
      retryAfter === String(expectedRetrySeconds)
    ) {
      console.log(
        `PASS concurrent boundary handling converged to 429 with Retry-After: 60 (${statuses.join(', ')}).`
      );

      await new Promise(resolve =>
        setTimeout(resolve, (expectedRetrySeconds + 1) * 1_000)
      );
      const afterExpiry = await sendInvalidRequest();

      if (afterExpiry.status === 400) {
        console.log(
          'PASS a request reached validation after the retry window expired.'
        );
      } else {
        console.error(
          `FAIL the post-expiry request returned ${afterExpiry.status}; expected 400.`
        );
        process.exitCode = 1;
      }
    } else {
      console.error(
        `FAIL concurrent boundary requests returned ${statuses.join(', ')} with Retry-After: ${retryAfter ?? 'missing'}.`
      );
      process.exitCode = 1;
    }
  }
}
