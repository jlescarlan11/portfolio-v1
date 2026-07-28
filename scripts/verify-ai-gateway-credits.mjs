import { pathToFileURL } from 'node:url';

export const AI_GATEWAY_CREDITS_URL =
  'https://ai-gateway.vercel.sh/v1/credits';

const CREDIT_VALUE_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;
const ZERO_CREDIT_PATTERN = /^0(?:\.0+)?$/;

export function hasAvailableAiGatewayCredit(balance) {
  return !ZERO_CREDIT_PATTERN.test(balance);
}

export async function fetchAiGatewayCredits({
  token,
  fetchImpl = fetch,
  signal = AbortSignal.timeout(15_000)
}) {
  if (!token?.trim()) {
    throw new Error(
      'AI Gateway authentication is unavailable. Pull a fresh Vercel OIDC token first.'
    );
  }

  const response = await fetchImpl(AI_GATEWAY_CREDITS_URL, {
    headers: { Authorization: `Bearer ${token.trim()}` },
    signal
  });

  if (!response.ok) {
    throw new Error(`AI Gateway credit check failed with HTTP ${response.status}.`);
  }

  const payload = await response.json();
  if (
    !payload ||
    typeof payload !== 'object' ||
    typeof payload.balance !== 'string' ||
    typeof payload.total_used !== 'string' ||
    !CREDIT_VALUE_PATTERN.test(payload.balance) ||
    !CREDIT_VALUE_PATTERN.test(payload.total_used)
  ) {
    throw new Error('AI Gateway returned an invalid credit response.');
  }

  return {
    balance: payload.balance,
    totalUsed: payload.total_used
  };
}

async function main() {
  const token =
    process.env.AI_GATEWAY_API_KEY?.trim() ||
    process.env.VERCEL_OIDC_TOKEN?.trim();
  const credits = await fetchAiGatewayCredits({ token });

  console.log(`AI Gateway credit balance: $${credits.balance}`);
  console.log(`AI Gateway lifetime usage: $${credits.totalUsed}`);

  if (!hasAvailableAiGatewayCredit(credits.balance)) {
    console.error(
      'No Gateway credit is currently available; skip live model verification.'
    );
    process.exitCode = 1;
  }
}

const isDirectExecution =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  main().catch(error => {
    console.error(
      error instanceof Error
        ? error.message
        : 'AI Gateway credit verification failed.'
    );
    process.exitCode = 1;
  });
}
