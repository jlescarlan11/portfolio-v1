# Hosted AI Chat Decision

**Date:** 2026-07-27

**Pricing and limits rechecked:** 2026-07-28

**Status:** Selected; live release verification is blocked by account setup and
an unpublished Firewall rule

**Issues:** #6, #7, #8, #9, #10, #24, #25

## Decision

Use Vercel AI Gateway with OpenAI's `openai/gpt-5-nano` model for the portfolio
chatbot. The server uses Vercel deployment OIDC rather than an OpenAI key or a
provider-compatible base URL.

The model is intentionally the low-cost option already approved for this
portfolio. At the current published list price of $0.05 per million input
tokens and $0.40 per million output tokens, the application ceilings of 8,000
estimated input tokens and 256 output tokens represent approximately $0.0005024
in model usage per worst-case request before future pricing changes. Actual
provider tokenization and normal requests can differ.

Vercel currently advertises $5 in monthly AI Gateway credit. A live OIDC request
from this project reached the Gateway but returned HTTP 403 because Vercel
requires a valid card on the team before enabling that credit. No card, paid
credit, or automatic top-up was added as part of this migration. Until the owner
chooses to satisfy that account prerequisite, the public API must continue to
fail with its sanitized service-unavailable contract.

“Unlimited free use” is not a supported guarantee. The design instead bounds
each request, rate-limits abusive clients before inference, keeps automatic
top-up disabled, and fails closed when either authentication or abuse
protection is unavailable.

## Server-only configuration

Vercel deployments automatically inject a short-lived `VERCEL_OIDC_TOKEN`.
The AI SDK reads it through the default Vercel AI Gateway provider path; the
application does not copy the token into provider options, logs, responses, or
browser code.

For local development:

```bash
vercel link --yes --scope lester-s-projects4 --project portfolio-v1
vercel env pull .env.local --yes
```

The pulled OIDC token is short-lived and must be refreshed when it expires. An
`AI_GATEWAY_API_KEY` is also accepted for an explicitly configured server-only
local workflow, but it is not required on Vercel. Neither credential may use a
`NEXT_PUBLIC_` prefix or appear in fixtures, committed environment files,
screenshots, errors, or telemetry. `OPENAI_API_KEY`, `OPENAI_BASE_URL`, and the
former Netlify Gateway variables are not accepted as fallbacks.

The model and request budgets are application-owned constants:

- Model: `openai/gpt-5-nano`
- Reasoning effort: `minimal`
- Text verbosity: `low`
- Maximum request body: 16 KiB
- Maximum message count: 12
- Maximum current user message: 2,000 Unicode characters
- Maximum estimated input context: 8,000 tokens, including the system prompt
- Maximum output: 256 tokens
- SDK retries: 0
- Provider timeout: 24 seconds
- Anonymous rate limit: 20 POST requests per Vercel-derived client IP per
  60-second fixed window
- Rate-limit retry interval: 60 seconds

The token estimator trims complete oldest turns before provider invocation. The
trusted system prompt and current user message are never removed.

## Distributed abuse protection

The Vercel App Router endpoint calls `checkRateLimit('portfolio-chat')` from
`@vercel/firewall` before request parsing, validation, or AI Gateway.
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
multiple regions can receive a separate allowance in each region. This is an
explicit consistency tradeoff: low-latency regional abuse protection, not an
exact global billing cap. The behavior must not be described as globally exact.

Requests 1 through 20 in one regional window can proceed to validation. Request
21 receives the established application 429 response once the rule is enforcing.
After the fixed window expires, the next request can proceed again. A limited
request never reaches request validation or the provider adapter. If the rule is
missing, Vercel returns an unexpected result, or the rate-limit service cannot
be reached, the route returns a sanitized 503 and does not call AI Gateway.

The Hobby plan includes one WAF rate-limit rule and the first 1,000,000 allowed
requests per month under Vercel's published limits. This implementation does
not purchase additional usage or change the project plan.

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
- Client-supplied system messages, model IDs, token settings, and provider
  options are rejected.
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
| 429 | `RATE_LIMITED` | Application or upstream Gateway limit was reached |
| 503 | `SERVICE_UNAVAILABLE` | Gateway or abuse-protection configuration is unavailable |
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
- model identifier
- duration in milliseconds
- provider-reported input and output token counts when available
- finish reason
- error category

Forbidden fields:

- user or assistant message content
- full system prompt
- Gateway credentials or authorization headers
- raw provider request/response bodies
- client IP addresses or rate-limit keys

Vercel AI Gateway is the source of truth for inference usage. Vercel Firewall is
the source of truth for rate-limit traffic. Application events supplement them
with sanitized outcomes only.

## Quality regression corpus

The selected model must pass these cases on a Vercel Preview before release:

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

1. Publish the staged Firewall rule in log-only mode and verify that Preview
   chat requests match the `portfolio-chat` rule.
2. Change the rule's exceeded action to rate-limit in Preview scope, publish it,
   and run:

   ```bash
   CHAT_BASE_URL=https://<preview-host> pnpm verify:chat:rate-limit
   ```

   The verifier sends only malformed bodies, so it does not intentionally
   invoke the model.
3. Review Firewall traffic and confirm the rule does not match unrelated paths
   or methods.
4. After the owner has enabled the free Gateway credit, run
   `pnpm verify:chat` against Preview and inspect sanitized application events
   plus Gateway usage.
5. Only after those gates pass, change the rule to production enforcement and
   complete the domain cutover.

Rollback the limiter by returning the Firewall rule to log-only or disabling
it. Roll back inference by restoring the previous Vercel deployment. Do not
restore a provider-specific key fallback or enable a paid model fallback.

## Sources

- Vercel AI Gateway:
  https://vercel.com/docs/ai-gateway
- Vercel `gpt-5-nano` model:
  https://vercel.com/ai-gateway/models/gpt-5-nano
- Vercel OIDC:
  https://vercel.com/docs/oidc
- Vercel Firewall Rate Limiting SDK:
  https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting-sdk
- Vercel WAF rate-limit limits and pricing:
  https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting
- Vercel Firewall staging guidance:
  https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules
