import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AI_GATEWAY_CREDITS_URL,
  fetchAiGatewayCredits,
  hasAvailableAiGatewayCredit
} from './verify-ai-gateway-credits.mjs';

test('reads the credit balance without exposing the bearer token', async () => {
  const calls = [];
  const credits = await fetchAiGatewayCredits({
    token: 'test-placeholder-oidc-token',
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return Response.json({ balance: '5.00', total_used: '0.125' });
    }
  });

  assert.deepEqual(credits, { balance: '5.00', totalUsed: '0.125' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, AI_GATEWAY_CREDITS_URL);
  assert.equal(
    calls[0].init.headers.Authorization,
    'Bearer test-placeholder-oidc-token'
  );
  assert.ok(calls[0].init.signal instanceof AbortSignal);
});

test('fails before the request when Gateway authentication is missing', async () => {
  let called = false;

  await assert.rejects(
    fetchAiGatewayCredits({
      token: ' ',
      fetchImpl: async () => {
        called = true;
        return Response.json({});
      }
    }),
    /authentication is unavailable/
  );
  assert.equal(called, false);
});

test('sanitizes non-successful Gateway responses', async () => {
  await assert.rejects(
    fetchAiGatewayCredits({
      token: 'test-placeholder-oidc-token',
      fetchImpl: async () =>
        new Response('provider-secret-response', { status: 403 })
    }),
    error => {
      assert.equal(error.message, 'AI Gateway credit check failed with HTTP 403.');
      assert.doesNotMatch(error.message, /provider-secret-response|oidc-token/);
      return true;
    }
  );
});

test('rejects malformed or negative credit values', async () => {
  for (const payload of [
    {},
    { balance: -1, total_used: '0' },
    { balance: '-1', total_used: '0' },
    { balance: '0', total_used: 'NaN' }
  ]) {
    await assert.rejects(
      fetchAiGatewayCredits({
        token: 'test-placeholder-oidc-token',
        fetchImpl: async () => Response.json(payload)
      }),
      /invalid credit response/
    );
  }
});

test('recognizes every zero balance representation as unavailable', () => {
  for (const balance of ['0', '0.0', '0.00', '0.000000']) {
    assert.equal(hasAvailableAiGatewayCredit(balance), false);
  }

  for (const balance of ['0.01', '1', '5.00']) {
    assert.equal(hasAvailableAiGatewayCredit(balance), true);
  }
});
