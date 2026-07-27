# Hosted AI Chat Decision

**Date:** 2026-07-27

**Status:** Provisionally selected; release blocked on the live quality gate

**Issues:** #6, #7, #8, #9, #10

## Decision

Use the existing Netlify AI Gateway with OpenAI's `gpt-5-nano` model for the
portfolio chatbot.

Netlify already hosts the production site and injects collision-free
`NETLIFY_AI_GATEWAY_KEY` and `NETLIFY_AI_GATEWAY_BASE_URL` values into its
Next.js compute runtime. This keeps credentials server-only and avoids adding
another hosting account, provider balance, or static production key.

`gpt-5-nano` is the lowest-cost supported model that also has the highest
published throughput tier among the low-cost candidates on Netlify:

| Candidate | Input / 1M tokens | Output / 1M tokens | Free-plan TPM | Decision |
| --- | ---: | ---: | ---: | --- |
| `gpt-5-nano` | $0.05 | $0.40 | 300,000 | Selected |
| `gpt-4.1-nano` | $0.10 | $0.40 | 250,000 | Higher input cost and lower throughput |
| `gemini-2.5-flash-lite` | $0.10 | $0.40 | 50,000 | Higher input cost and materially lower throughput |

Rates and model availability are provider-controlled and must be rechecked
before a future model change. “Unlimited use” is not possible; this design
instead bounds every request, rate-limits abusive clients, and exposes usage
through Netlify's gateway monitoring.

## Server-only configuration

Production and deploy previews use Netlify-injected values:

- `NETLIFY_AI_GATEWAY_KEY` — gateway credential; preferred at request time and
  never set manually.
- `NETLIFY_AI_GATEWAY_BASE_URL` — gateway endpoint; preferred at request time
  and never set manually.

Local development can receive those values through `netlify dev`, or use
`OPENAI_API_KEY` for the official OpenAI endpoint. `OPENAI_BASE_URL` is an
optional override for a different OpenAI-compatible endpoint. The server
prefers the collision-free Netlify pair so an existing provider-specific
project setting cannot bypass the gateway. None of these values may use a
`NEXT_PUBLIC_` prefix or appear in client code, logs, errors, fixtures, or
committed environment files.

The model and request budgets are application-owned constants:

- Model: `gpt-5-nano`
- Reasoning effort: `minimal` to favor latency and cost for short portfolio
  answers
- Maximum request body: 16 KiB
- Maximum message count: 12
- Maximum current user message: 2,000 Unicode characters
- Maximum estimated input context: 8,000 tokens, including the system prompt
- Token-estimation safety rule: estimate conservatively and trim complete
  oldest turns before calling the provider
- Maximum output: 256 tokens
- Provider timeout: 25 seconds
- Anonymous rate limit: 20 POST requests per IP and domain per 60 seconds
- Rate-limit retry interval: 60 seconds

Netlify begins blocking after its configured `windowLimit` is exceeded. The
deployed rule therefore uses the static platform value `19`, which the live
boundary verifier confirms as 20 allowed requests followed by a blocked request
21 for sequential traffic. Because enforcement runs on Netlify's distributed
edge, requests already in flight at the boundary can briefly overshoot the
nominal threshold before the counter converges. The live verifier races two
boundary requests, requires enforcement after propagation, waits for the
advertised retry window, and confirms that traffic is accepted again. Treat the
20-request limit as abuse protection rather than an exact account-budget
control; the gateway's account limits and the 80% usage alert remain the
authoritative cost backstops.

The 8,000-token application limit is intentionally much smaller than the model
and Netlify gateway context limits. It provides predictable cost and leaves
room for tokenizer-estimation differences.

## API contract

### Request

`POST /api/chat`

```json
{
  "messages": [
    { "role": "user", "content": "What projects has John built?" },
    { "role": "assistant", "content": "..." },
    { "role": "user", "content": "Which one used Flutter?" }
  ]
}
```

Rules:

- The request `Content-Type` must be `application/json`.
- Only `user` and `assistant` roles are accepted.
- The conversation must start with `user`, alternate roles, and end with `user`.
- The final message must be a non-empty `user` message.
- Client-supplied system messages, model IDs, token settings, and provider
  options are rejected.
- Leading and trailing whitespace is removed.
- Empty, oversized, malformed, or structurally invalid payloads never reach the
  provider.
- When context is over budget, the server removes the oldest complete
  user/assistant turn. The trusted system prompt and current user message are
  never removed.

### Streaming success

Status: `200`

Content type: `application/x-ndjson; charset=utf-8`

Each line is one JSON frame:

```json
{"type":"text-delta","delta":"John has built "}
{"type":"text-delta","delta":"several full-stack products."}
{"type":"finish","finishReason":"stop"}
```

If an error happens after streaming begins, the final frame is sanitized:

```json
{"type":"error","code":"STREAM_ERROR","message":"The AI service stopped responding. Please try again."}
```

The client must retain any already-rendered partial text, leave the generating
state, and allow another submission.

### JSON errors before streaming

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please shorten your message and try again."
  }
}
```

| Status | Code | Meaning |
| ---: | --- | --- |
| 400 | `VALIDATION_ERROR` | Invalid JSON, roles, message ordering, or empty content |
| 413 | `PAYLOAD_TOO_LARGE` | Body or current message exceeds the configured limit |
| 429 | `RATE_LIMITED` | Netlify or the upstream gateway limit was reached |
| 503 | `SERVICE_UNAVAILABLE` | Gateway configuration or provider is unavailable |
| 504 | `TIMEOUT` | The provider did not begin or finish within the timeout |

Rate-limit responses include `Retry-After: 60` when the application knows the
retry interval.

### Cancellation

The client aborts its fetch when the chat closes or unmounts. The route forwards
the request signal to the provider so cancelled browser work does not continue
consuming output tokens when the provider supports cancellation.

## Privacy-safe operational events

The application emits one structured completion event per started provider
request and one structured event for the rate-limit rewrite endpoint.

Allowed fields:

- event name
- request ID
- status
- model
- duration in milliseconds
- provider-reported input and output tokens when available
- finish reason
- error category

Forbidden fields:

- user or assistant message content
- full system prompt
- gateway credentials or authorization headers
- raw provider request/response bodies
- client IP addresses

Netlify AI Gateway remains the source of truth for account-level inference usage
and billing. Application logs supplement it with request outcomes and latency.

Operational counters are grouped by `status`: `success`, `failed`, `cancelled`,
`output_limit`, `provider_quota`, and `application_rate_limited`. Review them
alongside gateway token usage after each release and daily for the first seven
days. The owner should configure an account credit-usage notification at 80% of
the monthly budget where the current Netlify plan exposes that control; if it
does not, the same threshold is a manual release checklist item. Investigate
unexpected growth in output tokens or any sustained provider/application
rate-limit events before increasing limits.

## Quality regression corpus

The selected model must pass these cases on a deploy preview before release:

| ID | Prompt | Required behavior |
| --- | --- | --- |
| Q1 | `Tell me about John.` | Two-sentence introduction, three concise highlights, and a contact line |
| Q2 | `What are John's strongest frontend skills?` | One or two sentences grounded in the profile |
| Q3 | `Where has John worked?` | One or two sentences naming documented experience only |
| Q4 | `Which projects show mobile development experience?` | Mentions documented mobile-relevant work without inventing details |
| Q5 | `How can I contact John?` | Returns the documented email or LinkedIn contact |
| Q6 | `Can John dance?` | Says the fact is not in the profile and redirects to a relevant documented fact |
| Q7 | `Write me a recipe for pancakes.` | Uses the exact off-topic boundary response from the system prompt |

For Q1, Markdown structure must remain valid. For Q2–Q7, the answer must follow
the existing one-or-two-sentence rule. No response may claim facts absent from
the assembled profile.

## Release and rollback

- Run automated route, client, and contract tests without billable provider
  calls.
- Run Q1–Q7 against a Netlify deploy preview.
- Confirm no legacy on-device model request and no provider credential appear
  in browser network traffic or client bundles.
- Monitor Netlify AI Gateway usage after release.
- Roll back by reverting the hosted-chat change set. Do not keep the legacy
  on-device model as a runtime fallback because it restores the mobile
  performance problem this change is intended to solve.

## Sources

- Netlify AI Gateway overview and supported models:
  https://docs.netlify.com/build/ai-gateway/overview/
- Netlify AI model pricing:
  https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/pricing-for-ai-features/
- Netlify rate limiting:
  https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/
- Netlify Next.js support and response streaming:
  https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/
