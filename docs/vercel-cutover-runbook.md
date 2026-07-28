# Vercel Production Cutover Runbook

**Domain:** `johnlesterescarlan.pro`

**Recorded:** 2026-07-28 19:55 Asia/Manila

**Status:** Prepared, not cut over. Public DNS still routes the site to Netlify.

**Issues:** #23, #24, #25, #26, #27

## Execution boundary

This runbook records the reversible preparation completed for issue #26. It
does not authorize a deployment, DNS edit, Firewall publication, plan change,
credit purchase, or Netlify removal.

Do not change public DNS until all pre-cutover gates pass. In particular, a
valid chat request must stream through Vercel AI Gateway and the Vercel
Firewall rule must reject request 21 in Preview. At the time this runbook was
recorded, Gateway inference was blocked because the Vercel team did not have
the card prerequisite for its advertised free credit, and the Firewall rule
was staged but unpublished.

## Systems and identifiers

| Item | Recorded value |
| --- | --- |
| GitHub repository | `jlescarlan11/portfolio-v1` |
| Production branch | `main` |
| Vercel team | `lester-s-projects4` |
| Vercel team ID | `team_3Iehh9kIbX87EbfdCncg6m8m` |
| Vercel project | `portfolio-v1` |
| Vercel project ID | `prj_YYPIv3jtsAVYzm48E85eROfPyiz8` |
| Vercel fallback domain | `portfolio-v1-bice-ten.vercel.app` |
| Netlify team | `bisag-unsa` |
| Netlify site | `johnlesterescarlan` |
| Netlify site ID | `d48dccbf-69ff-4c42-8d14-ccad4f0ac12c` |
| Netlify fallback domain | `johnlesterescarlan.netlify.app` |
| Netlify DNS zone ID | `6a677dc5301eb45e7261b7ff` |

## Complete pre-cutover DNS inventory

The authoritative Netlify DNS API returned exactly these three zone records:

| Hostname | Type | Value | TTL | Managed | Record ID |
| --- | --- | --- | ---: | --- | --- |
| `johnlesterescarlan.pro` | `NETLIFY` | `johnlesterescarlan.netlify.app` | 3600 | yes | `6a677dc6a074130008840002` |
| `www.johnlesterescarlan.pro` | `NETLIFY` | `johnlesterescarlan.netlify.app` | 3600 | yes | `6a677dc7a074130008840003` |
| `johnlesterescarlan.pro` | `TXT` | `google-site-verification=TJ89KNqESqrlNGMqegSfeVfp7uNer0sZkk5th3CB5Xs` | 3600 | no | `6a6785e0d0fc1d9bc9830a10` |

No MX, CAA, AAAA, SRV, or additional TXT records were returned. Preserve the
Google verification TXT record through cutover and rollback.

Authoritative nameservers remain:

- `dns1.p03.nsone.net`
- `dns2.p03.nsone.net`
- `dns3.p03.nsone.net`
- `dns4.p03.nsone.net`

Do not change nameservers. Record-level changes are sufficient.

The public baseline at the recorded time was:

- Apex A: `52.74.6.109`, `13.215.239.219` with a 120-second observed TTL.
  Netlify uses geographically variable answers, so other resolvers may report
  different Netlify IPs.
- Apex AAAA: no answer.
- `www`: no public CNAME; Netlify returned flattened A answers.
- SOA: `dns1.p01.nsone.net. domains+netlify.netlify.com. 1785167301 43200 7200 1209600 3600`.

## Prepared Vercel domain configuration

Both domains are assigned to the existing Vercel project:

- `johnlesterescarlan.pro` is the primary apex domain.
- `www.johnlesterescarlan.pro` has a Vercel project-level `308` redirect to
  `johnlesterescarlan.pro`. Vercel preserves the request path.

Vercel reported these project-specific, rank-one recommended DNS records on
2026-07-28:

| Host | Type | Value |
| --- | --- | --- |
| `@` | `A` | `216.198.79.1` |
| `@` | `A` | `64.29.17.1` |
| `www` | `CNAME` | `6f94bd328a9cf7eb.vercel-dns-017.com.` |

Vercel also reported generic rank-two fallback values of apex
`A 76.76.21.21` and `www CNAME cname.vercel-dns.com.`. The high-level
`vercel domains inspect` output may display that generic address even when the
domain-config API has a project-specific rank-one recommendation. Use the
rank-one API values, not the generic CLI fallback.

Re-read the project-specific requirements immediately before cutover:

```bash
vercel api \
  '/v6/domains/johnlesterescarlan.pro/config?teamId=team_3Iehh9kIbX87EbfdCncg6m8m'
vercel api \
  '/v6/domains/www.johnlesterescarlan.pro/config?teamId=team_3Iehh9kIbX87EbfdCncg6m8m'
```

For the apex, use the first `recommendedIPv4` entry. For `www`, use the first
`recommendedCNAME` entry. If either rank-one value differs from the recorded
table, stop and update this runbook before editing DNS. Use
`vercel domains inspect` separately to review attachment, verification, and
certificate state.

## Pre-cutover gates

All boxes must be checked in the same release window:

- [ ] The intended `main` commit has a Ready Vercel Production deployment.
- [ ] A Ready Vercel Preview for the candidate branch passes lint, type-check,
  tests, and build.
- [ ] `CUTOVER_BASE_URL=https://<preview-host> pnpm verify:cutover` passes,
  including the Preview `noindex, nofollow` check.
- [ ] The staged `portfolio-chat` Firewall rule is published in log-only mode
  and shown to match only the intended chat requests.
- [ ] The Firewall rule is changed to enforce the 20-request/60-second fixed
  window and `CHAT_BASE_URL=https://<preview-host>
  pnpm verify:chat:rate-limit` passes.
- [ ] Vercel AI Gateway account prerequisites are satisfied without enabling
  automatic top-up or a paid fallback.
- [ ] `pnpm verify:ai-gateway:credits` reports an available balance without
  making a model request.
- [ ] `CHAT_BASE_URL=https://<preview-host> pnpm verify:chat` passes all seven
  quality cases and Gateway usage remains within the intended free allowance.
- [ ] Static pages still return normally when Gateway inference is unavailable.
- [ ] The candidate shows PACU ending in August 2026, the approved project
  descriptions, current resume, canonical metadata, and security headers.
- [ ] A second maintainer or explicit owner review confirms the DNS changes and
  rollback values below.

Verify the candidate deployment is sourced from the intended commit:

```bash
vercel inspect https://<candidate-deployment>.vercel.app \
  --scope lester-s-projects4
git rev-parse origin/main
```

The deployment Git SHA shown by Vercel must equal `origin/main`.

## Cutover procedure

1. Record the fresh timestamp, Vercel-reported DNS requirements, intended Git
   SHA, Ready deployment URL, and verifier output in the release record.
2. Keep the Netlify site active. Do not delete the site, custom-domain history,
   or fallback domain.
3. In the existing Netlify DNS zone, remove only these managed web-routing
   records:
   - apex `NETLIFY → johnlesterescarlan.netlify.app`
   - `www NETLIFY → johnlesterescarlan.netlify.app`
4. Add the fresh project-specific Vercel records. If they are unchanged from
   preparation, add both apex A records and the `www` CNAME listed above.
5. Confirm the Google verification TXT record is still present. Do not edit the
   nameservers or any unrelated record.
6. Query the authoritative nameservers, then at least two public resolvers:

   ```bash
   dig @dns1.p03.nsone.net johnlesterescarlan.pro A
   dig @dns1.p03.nsone.net www.johnlesterescarlan.pro CNAME
   dig @1.1.1.1 johnlesterescarlan.pro A
   dig @8.8.8.8 johnlesterescarlan.pro A
   dig @1.1.1.1 www.johnlesterescarlan.pro CNAME
   dig @8.8.8.8 www.johnlesterescarlan.pro CNAME
   ```

7. Wait for Vercel to report valid configuration and a valid certificate for
   both domains.
8. Run the non-AI production checks:

   ```bash
   CUTOVER_BASE_URL=https://johnlesterescarlan.pro pnpm verify:cutover
   ```

9. Run the hosted chat corpus once, then allow the rate-limit window to clear
   before running the boundary verifier:

   ```bash
   CHAT_BASE_URL=https://johnlesterescarlan.pro pnpm verify:chat
   CHAT_BASE_URL=https://johnlesterescarlan.pro pnpm verify:chat:rate-limit
   ```

10. Manually verify desktop and mobile navigation, external links, chat
    streaming, chat cancellation, the graceful chat-unavailable state, and a
    representative project page.
11. Re-run `vercel inspect` for the custom domain and confirm the served
    Production deployment SHA equals the intended `main` SHA.
12. Keep Netlify available through the agreed observation window. Issue #27's
    Netlify runtime deletion must not merge until the cutover and rollback
    window are explicitly accepted.

## Automated checks

`pnpm verify:cutover` is read-only. It checks:

- apex HTTP 200 and Vercel serving headers
- HTTP-to-HTTPS and path-preserving `www` redirects
- CSP, Permissions Policy, Referrer Policy, HSTS, content-type protection, and
  frame denial
- production indexing and optional Preview no-index behavior
- canonical, social-image, JSON-LD, robots, and sitemap origins
- current and legacy resume paths
- PACU August 2026 and approved project-copy markers
- a representative project route

It intentionally does not invoke the model, consume AI credits, mutate
Firewall counters, prove a deployment Git SHA, or edit DNS.

## Rollback triggers

Roll back if any critical check remains unresolved after the controlled
cutover window, including:

- certificate failure or redirect loop
- apex, `www`, resume, or representative project route unavailable
- missing security headers or production `noindex`
- stale portfolio/resume content or wrong deployed commit
- chat cannot stream after its pre-cutover gate passed
- Firewall enforcement is absent or affects unrelated traffic

An AI quota failure that returns the documented sanitized unavailable state
does not require a static-site rollback by itself. The static portfolio must
remain available.

## DNS rollback

1. Do not delete the Vercel deployment or project; first restore web routing.
2. In Netlify, reassign both custom domains to site
   `d48dccbf-69ff-4c42-8d14-ccad4f0ac12c`. This recreates the two managed
   records below:
   - `johnlesterescarlan.pro NETLIFY johnlesterescarlan.netlify.app`
   - `www.johnlesterescarlan.pro NETLIFY johnlesterescarlan.netlify.app`
3. Remove only the Vercel apex A and `www` CNAME records added during cutover.
4. Confirm the Google verification TXT record and four existing nameservers
   are unchanged.
5. Query the authoritative and public resolvers until they again return
   Netlify routing.
6. Verify the recorded baseline:
   - apex HTTPS returns 200 from Netlify
   - apex HTTP redirects to HTTPS
   - `www/<path>` redirects to the same apex path
   - the resume, robots, content, metadata, and security headers remain valid
7. Record the rollback time, reason, DNS answers, HTTP output, and serving
   deployment. Leave the Vercel domains attached for investigation unless
   their configuration itself causes the failure.

## Recorded Netlify HTTP baseline

At 2026-07-28 19:55 Asia/Manila:

- `https://johnlesterescarlan.pro/` returned HTTP 200 with `Server: Netlify`.
- `http://johnlesterescarlan.pro/` returned 301 to the HTTPS apex.
- `https://www.johnlesterescarlan.pro/projects` returned 301 to
  `https://johnlesterescarlan.pro/projects`, preserving the path.
- CSP, Permissions Policy, Referrer Policy, HSTS,
  `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY` were present.
- `/robots.txt` returned the canonical sitemap.
- `/John_Lester_Escarlan_Resume.pdf` returned HTTP 200 as `application/pdf`.

The `/projects` baseline URL returned 404 after the correct path-preserving
redirect because this application has individual `/projects/<slug>` routes,
not a `/projects` index. This is expected and is why the verifier uses
`/projects/rent-n-roll`.
