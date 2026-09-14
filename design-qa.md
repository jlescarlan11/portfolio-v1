# Portfolio implementation QA — September 12, 2026

Source visual truth: `/Users/johnlesterescarlan/.codex/generated_images/01a084a9-36b4-79e3-88ba-a824a85b58fb/exec-8eb944bb-3e42-4980-bc12-fa48311e24d1.png`.

Implementation: http://localhost:3101/ (production build), plus `/projects` and all six case-study routes.

Evidence directory: `/Users/johnlesterescarlan/.codex/visualizations/2026/09/09/01a084a9-36b4-79e3-88ba-a824a85b58fb/implementation-qa/`.

## Comparison setup

The source is a 751×2094 concept image, not a browser capture with a known CSS density. Desktop checks use a 1280×800 CSS viewport and 1280×800 PNGs; mobile uses 390×844, tablet 768×1024. No artificial pixel-perfect equivalence is claimed across those widths. The approved 16px/24px and 400/500 typography requirements take precedence over raster text measurements.

The source and rendered section captures were presented together in one comparison input. Overall composition was reviewed across hero, experience, projects, activity, and footer captures; readable focused views were used for typography, controls, certificate cards, and the project deck. Browser full-page stitching produced duplicated bands and unused canvas, so those malformed captures are excluded from the evidence and conclusions.

## Comparison history

1. Initial desktop/mobile review found overly long project preview copy and excessively faint footer text (P2). Short summaries now describe each project and contribution, with full evidence retained in case studies; footer uses the shared muted text token. Compare `projects-before.png` with `final-projects.png`, and `final-footer.png` with the source.
2. Dark archive review found a white caption overriding black text on a pale status badge (P2). Removed that caption color override. `archive-tablet.png` documents the earlier state; `final-archive-dark.png` shows legible black status text. Computed badge color is `rgb(0, 0, 0)`.
3. Mobile assistant controls were enlarged from 24px to 44px and the input now permits shrinking within the dialog. `final-mobile-chat.png` shows the revised controls; Escape restores focus to the chat launcher.
4. The right decorative project title was obscured by the active card (P2). Added inner padding to the right preview. Final comparison evidence: `final-projects.png` (updated after the final build).

## Final visual findings

- Poppins is used throughout. Browser-computed homepage and case-study text sizes are exactly 16px and 24px; weights are 400 and 500.
- Floating navigation, combined hero/about, grouped experience/stack/certifications, manual card deck, and footer follow the selected structure. No sidebar; archive and case-study reading remain one column.
- Major sections have generous whitespace, while stack and certifications remain adjacent. Internal experience rows and cards retain borders; the footer retains its divider.
- All authored colors remain achromatic. Original image files are preserved and rendered grayscale.
- The real portrait is deliberately retained instead of the altered face in the generated concept. Its original white background remains visible in dark mode.
- All three credentials retain their actual destinations and issuer names; no certification dates are displayed.
- No actionable P0/P1/P2 visual issues remain after the final comparison.

## Verified interactions and checks

- Experience disclosure reveals all five roles, responsibilities, education, achievements, and background; stack disclosure reveals all categories.
- Carousel next/previous controls wrap through all six projects, with one active case-study link and a live position announcement. Mobile displays one card without decorative side cards.
- Archive contains all six projects. All six case-study routes, archive, homepage, résumé PDF, certificate PDF, robots, and sitemap return HTTP 200.
- Case-study anchors scroll to the correct sections with navigation clearance. Email/social/résumé destinations match existing public configuration.
- Mobile, tablet, and desktop checks found no horizontal page overflow. Light/dark theme switching persists across navigation.
- Assistant opens, accepts a prompt, renders the recoverable service error, and closes with focus restored. Escape dismissal also verified. Streaming/cancellation contracts remain covered by the existing automated tests.
- Browser error log check returned no console errors on the reviewed pages.
- `pnpm lint`, `pnpm typecheck`, and `pnpm build` pass. Full suite: 26 Node tests plus 397 Vitest tests pass. Relevant tests were rerun after final carousel/control changes (4 + 16 tests passed).
- Node 25 requires `NODE_OPTIONS=--no-experimental-webstorage pnpm test` here so experimental Node storage does not shadow jsdom Storage. No theme assertions were removed. One parallel test run timed out under local filesystem load; sequential rerun passed.
- Reduced-motion behavior and keyboard/focus contracts pass existing tests. A separate browser reduced-motion emulation and screen-reader-device audit were not performed.

## Environment limitations

`GITHUB_TOKEN` is absent locally. The real contribution integration remains in place and shows a GitHub link instead of fabricated activity. The live populated graph was not verified in this environment.

The assistant request fails closed at the existing application rate limiter in this local production environment. Its sanitized error and retry UI work; a successful live streamed response was not verified. No backend or deployment settings were changed.

No deployment was performed.

Final result: passed

## Project preview refinement

The later approved revision replaces the carousel with three static, linked previews
(Rent N Roll, PriceCraft, and PACU). The primary card contains only status, title,
a short description, and the case-study action. Role, contribution details, the
secondary live-preview action, arrows, and counter are removed from this section.
All six complete case studies remain in the archive. Mobile retains the fanned
composition with clipped side cards; keyboard focus brings each side card forward.
This revision supersedes the carousel-specific observations above.

Refinement source: `/var/folders/mh/rxmkm5jd2s1d952s608rwwy40000gn/T/codex-clipboard-91b06309-05af-4db7-853f-f37215d95ffa.png` (704×826).
Compared together with `simplified-mobile.png` (390×844) and
`simplified-desktop.png` (1280×800) in the evidence directory. The mobile
composition keeps the front card and cropped, tilted side cards; shorter content
reduces card height intentionally. No horizontal overflow. All three links are
accessible; keyboard focus brings the PriceCraft card entirely into view at
x=40–350 on the 390px viewport. No carousel controls remain. Production build
(including lint/types) and four focused tests pass. Refinement result: passed.

## Side-card selection refinement

Side previews now act as buttons: selecting either side makes that project the
center card and updates its case-study link. Status badges are removed from the
preview. The detailed case studies retain factual project status. A focused test
verifies selection from both sides, all three destinations, focus transfer, and
the absence of badges and arrow controls. This supersedes the static-preview
interaction described above.

Side-card runtime verification: at 390×844, tapping the exposed right edge selects
PACU; tapping the left selects Rent N Roll. Keyboard Tab + Enter selects
PriceCraft. Each action updates the center case-study destination. Status badges
are absent. The focused test and production build (including lint/types) pass.

## Thumbnail refinement

Added existing grayscale thumbnails above project titles: Rent N Roll and
PriceCraft screenshots, PACU's existing logo. Original assets remain unchanged.
`thumbnail-mobile.png` (390×844) and `thumbnail-desktop.png` (1280×800), in the
evidence directory, show the resulting layouts. All three images load, mobile
has no horizontal overflow, and tapping a side thumbnail selects its project.
The image and case-study destination update together. Four focused tests and
the production build (including lint/types) pass. Result: passed.

## GitHub activity fix

The missing-token limitation above is resolved. GraphQL remains the preferred
source when a token exists; otherwise, or when that request fails, the server
reads GitHub's public calendar directly. Dates, exact tooltip counts, continuity,
and the reported total must agree before the result is cached for 24 hours.
No credentials or third-party proxy are needed for this fallback. Invalid markup
still produces the safe unavailable state. The full returned year is displayed
instead of truncating the chart to 52 weeks while keeping a larger total.

Production runtime rendered 371 real daily entries and 11,256 contributions at
verification time. Evidence: `github-fixed.png` in the evidence directory,
1280×800, dark theme. Browser error log was empty. All 40 contribution tests
and the production build (including lint/types) pass.

## Mobile hero order

The stacked hero now places the portrait above the introduction at widths of
760px and below. Desktop keeps its existing side-by-side composition. This
supersedes the earlier mobile text-first screenshots.

Verified at 390×844: portrait begins at y=112, introduction at y=464; no
horizontal overflow. Screenshot: `/tmp/portfolio-qa/portrait-first-mobile.png`.
Production build, lint, and type validation pass.

## Certification issuer logos

Replaced the generic document glyphs with the official Matsuo–Iwasawa Laboratory
mark and the Amazon/Google brand icons from the existing React Icons dependency.
All are monochrome in 48px containers; issuer names and verification links remain.
Asset provenance is recorded in `public/issuers/README.md`. The two existing
experience/credential tests pass.

Issuer logos verified in the browser at 1280×800 in dark mode. All three marks
are visible with consistent sizing and contrast. Screenshot: `/tmp/issuer-logos.png`.
Production build (including lint and type checks) passes.

### Transparent pixel portrait — September 12
- Replaced hero photo reference with `public/hero-pixel.png`, derived locally from the original photo with user approval. Removed edge-connected white background, cleaned the edge, converted to grayscale and sampled to a 160px grid with nearest-neighbor enlargement. Original photo retained.
- PNG has real alpha transparency; 960px asset is 42KB. Disabled image optimization for this portrait and used pixelated rendering to retain the texture.
- Verified loaded portrait in local browser; no white rectangle. Production build passed; 10 hero/profile component tests passed.

### Fine dither portrait refinement — September 12
- Replaced the coarse 160px portrait with `public/hero-dither.png`, processed from the full-resolution original. Six grayscale levels with fine ordered dithering match the supplied dotted reference while retaining facial detail.
- Retained real alpha transparency and removed CSS pixelated scaling. Original photo and earlier variant remain available.

### Education integrated into experience — September 12
- Education and employment share compact experience rows sorted by start date, newest first. Current Computer Science study is visible in the three-entry preview.
- Full history reveals all roles, both education entries, responsibilities, and academic achievements. Removed the separate Education & background heading and repeated intro.
- Production build and both Experience disclosure tests passed, including current education visibility and academic achievement retention.

### Concise project detail pages — September 12
- Simplified all six project detail pages to title/summary, visuals, direct website/code links, My contribution, Outcome and Stack, followed by the next project.
- Removed the duplicate snapshot, section navigation, repeated contact/resume links, long problem/solution breakdown, engineering decision matrix, implementation-stat cards and learning lists from the rendered page. Preserved source content and SEO metadata.
- Kept screenshot captions, descriptive alt text, external-link notices and safe URL filtering. All 26 project-page tests pass across the six projects.

### Archive styling refinement — September 12
- Replaced the archive's dense shared cards with one-column image-first entries at a comfortable 768px maximum width. Added generous spacing, rounded thumbnails, concise descriptions and plain capability labels.
- Removed status/date overlays, technology-count chips, repeated archive labels, card footer buttons and the enclosing border. Every entry remains a single accessible case-study link; all six routes and SEO metadata remain intact.
- All four archive tests passed.

### Dedicated detail pages — September 12
- Homepage links now open /experience, /stack and /certifications instead of expanding content in place. Shared server-rendered components preserve all roles, education, technologies, credentials and verification URLs.
- Added page titles, canonical URLs, sitemap entries and return links to the relevant homepage section.
- Production build and six targeted tests passed. Browser clicks verified all three destinations and their Back to home links; history renders seven entries and certifications renders three credentials.

---

# Portfolio refinement QA — September 14, 2026

## Comparison target

- Source visual truth:
  - `/var/folders/mh/rxmkm5jd2s1d952s608rwwy40000gn/T/codex-clipboard-65f4e4a3-c2d1-4235-a91e-63b08ea8911d.png`
  - `/var/folders/mh/rxmkm5jd2s1d952s608rwwy40000gn/T/codex-clipboard-f8274e65-6074-4271-b156-574e08f5fca5.png`
  - `/var/folders/mh/rxmkm5jd2s1d952s608rwwy40000gn/T/codex-clipboard-2d6ad296-dfe1-4a96-b23e-1892ad267a45.png`
- Implementation screenshots:
  - `/tmp/portfolio-design-qa-hero.png`
  - `/tmp/portfolio-design-qa-experience.png`
  - `/tmp/portfolio-design-qa-github.png`
  - `/tmp/portfolio-design-qa-mobile.png`
- Desktop viewport: 1440 x 900 CSS px, light theme.
- Mobile viewport: 390 x 844 CSS px, responsive check.
- Source pixels: 2940 x 1912, 2940 x 1912, and 2276 x 786. The source includes browser and OS chrome, so comparisons used page-content regions.
- Implementation pixels: 1440 x 900 desktop and 390 x 844 mobile. The browser reported devicePixelRatio 2; its screenshot surface normalized files to CSS-pixel dimensions.
- State: homepage at the About, Experience, and GitHub Activity anchors. Light theme matched the source; dark-theme mobile was also checked.

## Full-view and focused comparison evidence

- Existing Poppins typography, monochrome tokens, navigation, content order, and imagery remain consistent.
- Hero comparison: the portrait is now 400 x 400 CSS px in the 1040px desktop container and 280px wide on mobile. Its asset, crop, grayscale treatment, transparency, and right alignment remain intact.
- Experience comparison: the completed role shows only its date range. The homepage preview reads `MAIN STACK`, while the dedicated `/stack` page retains `Stack`.
- GitHub comparison: the graph is 795px wide inside a 1040px scroller. Measured left and right spaces are both 122.5px; narrow viewports retain horizontal overflow.
- Mobile comparison: the 280px portrait fits the single-column composition without clipping.

## Required fidelity surfaces

- Fonts and typography: unchanged; hierarchy, size, weight, tracking, wrapping, and line height remain consistent.
- Spacing and layout rhythm: passed. Portrait scale and graph alignment improve balance without changing the section rhythm.
- Colors and visual tokens: unchanged and checked in light and dark themes.
- Image quality and asset fidelity: the existing portrait asset and treatment are preserved; no generated or replacement asset was introduced.
- Copy and content: passed. `Completed` is removed, the homepage label is `Main stack`, and `/stack` remains `Stack`.

## Findings

- No actionable P0, P1, or P2 mismatches remain for the requested refinements.

## Comparison history

- Initial implementation comparison found no P0/P1/P2 issues, so no correction loop was required.

## Verification

- Browser check found no console errors.
- Changed-component tests: 17 passed.
- TypeScript and ESLint passed.
- Full suite: all 403 tests passed with the repository's documented `NODE_OPTIONS=--no-experimental-webstorage` compatibility setting.

final result: passed
