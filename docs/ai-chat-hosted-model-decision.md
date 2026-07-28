# Hosted AI Chat Decision

**Date:** 2026-07-27

**Updated:** 2026-07-28

**Status:** Groq selected; Preview release verification awaits a server
credential and the unpublished Firewall rule

**Issues:** #6, #7, #8, #9, #10, #24, #25

## Decision

Use Groq's Free plan directly through the official `@ai-sdk/groq` adapter with
the `openai/gpt-oss-20b` model. Do not use Vercel AI Gateway for the current
chatbot because activating its advertised credit requires a card on the Vercel
team, while Groq requires a payment method only when upgrading from Free to
Developer.

The route depends on a provider-neutral `HostedChatProvider` interface. Groq is
the default registered adapter. Provider selection, credential validation, and
model construction stay inside the server provider registry; the browser,
`POST /api/chat`, streaming frames, validation, cancellation, rate limiting,
and telemetry contract do not depend on Groq.

Adding another provider later requires:

1. an adapter implementing `HostedChatProvider`;
2. registration under a unique server-only provider ID;
3. provider-specific credential and model configuration; and
4. regression and hosted quality verification.

No provider name, model ID, credential, token budget, or reasoning setting is
accepted from a browser request. An unknown `HOSTED_CHAT_PROVIDER` value fails
closed with the existing sanitized service-unavailable response.

“Completely free” means operating within Groq's current Free-plan allowance; it
does not mean unlimited or guaranteed inference. No payment method, Developer
upgrade, automatic purchase, or paid fallback is part of this decision.

## Server-only configuration

Required:

```env
GROQ_API_KEY=<secret>
```

Optional:

```env
HOSTED_CHAT_PROVIDER=groq
```

Groq is the default when `HOSTED_CHAT_PROVIDER` is unset. Store
`GROQ_API_KEY` as a sensitive Vercel environment variable in Preview and
Production:

```bash
vercel env add GROQ_API_KEY production,preview --sensitive
```

Enter the value through the hidden CLI prompt or the Vercel dashboard. The key
must never use a `NEXT_PUBLIC_` prefix or appear in browser code, committed
environment files, fixtures, screenshots, error messages, or telemetry.
Vercel does not permit sensitive variables in the Development environment; use
the gitignored `.env.local` file for local development instead.
`VERCEL_OIDC_TOKEN`, `AI_GATEWAY_API_KEY`, `OPENAI_API_KEY`,
`OPENAI_BASE_URL`, and the former Netlify AI variables are not credential
fallbacks.

## Model and application limits

- Provider: Groq
- Model: `openai/gpt-oss-20b`
- Reasoning effort: `minimal`, mapped by the Groq AI SDK adapter to `low`
- Maximum request body: 16 KiB
- Maximum message count: 12
- Maximum current user message: 2,000 Unicode characters
- Maximum estimated input context: 8,000 tokens, including the system prompt
- Maximum output: 256 tokens
- SDK retries: 0
- Provider timeout: 24 seconds
- Anonymous application rate limit: 20 POST requests per Vercel-derived client
  IP per 60-second fixed window
- Application rate-limit retry interval: 60 seconds

The token estimator trims complete oldest turns before provider invocation. The
trusted system prompt and current user message are never removed.

As of 2026-07-28, Groq publishes these base Free-plan limits for
`openai/gpt-oss-20b`: 30 requests per minute, 1,000 requests per day, 8,000
tokens per minute, and 200,000 tokens per day. Rate limits apply at the Groq
organization level, and the exact Limits page for the account is authoritative.
Any one limit may be reached before the application request counter.

An upstream 429 is mapped to the established sanitized application 429 response.
When Groq provides `Retry-After`, the server forwards a bounded value. Free-plan
exhaustion must not affect static portfolio pages.

## Distributed abuse protection

The Vercel App Router endpoint calls `checkRateLimit('portfolio-chat')` from
`@vercel/firewall` before request parsing, validation, or provider inference.
Application code does not accept or construct a caller-provided key; the SDK
uses Vercel's normalized connection-IP signal for its default anonymous key.
Vercel owns the counter outside the function process.

The corresponding WAF rule is a fixed window of 20 requests per 60 seconds. The
rule is currently staged as a valid, log-only draft:

- Rule: `Portfolio chat SDK rate limit`
- Rate-limit ID: `portfolio-chat`
- Algorithm: fixed window
- Limit: 20 requests / 60 seconds
- Key: IP
- Exceeded action: log during staging; change to rate-limit only after Preview
  validation

The SDK counter is distributed across function instances within a Vercel
region. Vercel documents the counters as regional, so a client routed through
multiple regions can receive a separate allowance in each region. This is
low-latency regional abuse protection, not an exact global billing cap.

Requests 1 through 20 in one regional window can proceed to validation. Request
21 receives the established application 429 response once the rule is enforcing.
After the fixed window expires, the next request can proceed again. A limited
request never reaches request validation or the provider adapter. If the rule is
missing, Vercel returns an unexpected result, or the rate-limit service cannot
be reached, the route returns a sanitized 503 and does not call Groq.

The application never persists or emits the raw client IP. It records only the
existing `application_rate_limited` event for a 429 or a sanitized failed event
when enforcement is unavailable.

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
- Client-supplied system messages, provider IDs, model IDs, token settings, and
  provider options are rejected.
- Leading and trailing whitespace is removed.
- Empty, oversized, malformed, or structurally invalid payloads never reach the
  provider.

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

The client retains already-rendered partial text, leaves the generating state,
and allows another submission.

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
| 429 | `RATE_LIMITED` | Application or Groq Free-plan limit was reached |
| 503 | `SERVICE_UNAVAILABLE` | Provider or abuse-protection configuration is unavailable |
| 504 | `TIMEOUT` | The provider did not begin or finish within the timeout |

Application rate-limit responses include `Retry-After: 60`.

### Cancellation

The client aborts its fetch when the chat closes or unmounts. The route forwards
the request signal to the provider so cancelled browser work does not continue
consuming output tokens when the provider supports cancellation.

## Privacy-safe operational events

Allowed fields:

- event name
- request ID
- status
- provider-qualified model identifier
- duration in milliseconds
- provider-reported input and output token counts when available
- finish reason
- error category

Forbidden fields:

- user or assistant message content
- full system prompt
- Groq or other provider credentials and authorization headers
- raw provider request/response bodies
- client IP addresses or rate-limit keys

Groq Console is the source of truth for provider usage and organization limits.
Vercel Firewall is the source of truth for application rate-limit traffic.
Application events supplement them with sanitized outcomes only.

Groq states that inference input and output are not retained by default, except
temporarily for reliability troubleshooting or abuse investigation, and offers
Zero Data Retention controls. This application does not send browser search,
batch, fine-tuning, or other stateful feature requests.

## Quality regression corpus

The selected provider and model must pass these cases on a Vercel Preview before
release:

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

1. Add `GROQ_API_KEY` to Preview and Production as a sensitive server-only
   variable, and use `.env.local` for local development. Do not upgrade the
   Groq organization from Free.
2. Publish the staged Firewall rule in log-only mode and verify that Preview
   chat requests match the `portfolio-chat` rule.
3. Change the rule's exceeded action to rate-limit in Preview scope, publish it,
   and run:

   ```bash
   CHAT_BASE_URL=https://<preview-host> pnpm verify:chat:rate-limit
   ```

   The verifier sends only malformed bodies, so it does not intentionally
   invoke the model.
4. Run `CHAT_BASE_URL=https://<preview-host> pnpm verify:chat` once, inspect
   sanitized application events, and confirm the Groq account remains within
   its current Free-plan limits.
5. Only after those gates pass, change the Firewall rule to production
   enforcement and complete the domain cutover.

Roll back inference by restoring the previous Vercel deployment or selecting a
tested registered adapter through `HOSTED_CHAT_PROVIDER`. Never set an
unregistered value, expose a provider key to the browser, or enable a paid
fallback implicitly.

## Sources

- Groq Free-plan rate limits:
  https://console.groq.com/docs/rate-limits
- Groq billing and tier upgrades:
  https://console.groq.com/docs/billing-faqs
- Groq `openai/gpt-oss-20b` model:
  https://console.groq.com/docs/model/openai/gpt-oss-20b
- Groq data controls:
  https://console.groq.com/docs/your-data
- AI SDK Groq provider:
  https://ai-sdk.dev/providers/ai-sdk-providers/groq
- Vercel Firewall Rate Limiting SDK:
  https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting-sdk
- Vercel Firewall staging guidance:
  https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules
