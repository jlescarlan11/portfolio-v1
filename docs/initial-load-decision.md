# Initial-load decision

**Production observed:** 2026-09-02 Asia/Manila

**Production deployment:** `dpl_92FVFgEwi1DrKTaVQUDJeJA2f5dq`, GitHub
`main` at `04aff905292d7b95592192fc8bb956cead4d7e1c`

**Decision:** Remove the decorative `Preparing portfolio` overlay and its
readiness coordinator. Portfolio content, global controls, scrolling, and
native anchor navigation are available immediately.

## Observed production behavior

A fresh browser load of
`https://johnlesterescarlan.pro/?overlay-check=1#contact` captured the overlay
after document navigation with body scrolling locked, the global interaction
wrapper marked `aria-hidden="true"`, the viewport near the top (`scrollY: 5`),
and the contact section still 4,607 pixels below the viewport. In the next
500-millisecond observation the overlay had exited, body scrolling was restored,
and the native anchor settled with the contact section at the top of the
viewport.

The deployed source for that exact production SHA confirms that hydration
enhancement made the homepage wrapper inert and `aria-hidden` while the overlay
waited for hydration, `document.fonts.ready`, and the hero-image outcome. Its
only unconditional fail-open was the 10-second timeout. A failed image normally
uses the portrait fallback, but a pending image decode or unresolved font-ready
promise could retain the full-page gate until that timeout. Reduced motion
removed the exit animation only; it did not bypass readiness. Without
JavaScript, an inline rule hid the server-rendered overlay, which exposed the
page but left separate client-only behavior to maintain.

No performance improvement is inferred from these observations. The issue is
the avoidable availability and accessibility gate itself.

## Implemented behavior

- The homepage renders directly with no startup provider, overlay, progress
  region, inert wrapper, `aria-hidden` wrapper, or scroll lock.
- The hero image can load or fall back independently and no longer reports a
  page-readiness milestone.
- Direct hashes use native browser navigation without waiting for decorative
  state.
- Reduced-motion and screen-reader users receive the same immediately available
  document as everyone else.
- Server-rendered HTML contains the meaningful portfolio and no startup
  overlay, so the no-JavaScript path needs no special reveal rule.

Focused tests cover an unresolved font-ready promise, a direct `#contact` load,
screen-reader exposure, reduced motion, server-rendered/no-JavaScript markup,
and a hero portrait with no page-level readiness callback.
