# Design QA

Source visual truth: `/var/folders/mh/rxmkm5jd2s1d952s608rwwy40000gn/T/codex-clipboard-6a5466a4-9137-4a37-836a-9dbc7b5b76db.png`

Implementation screenshots:

- Hero separated from Impact snapshot: `/Users/johnlesterescarlan/.codex/visualizations/2026/09/02/01a0601f-67ba-7bd0-a7c1-eb58293ae47a/portfolio-impact-section/06-hero-separated-1470x655.png`
- Dedicated Impact snapshot section: `/Users/johnlesterescarlan/.codex/visualizations/2026/09/02/01a0601f-67ba-7bd0-a7c1-eb58293ae47a/portfolio-impact-section/02-impact-dedicated-section.png`
- Mobile hero separation: `/Users/johnlesterescarlan/.codex/visualizations/2026/09/02/01a0601f-67ba-7bd0-a7c1-eb58293ae47a/portfolio-impact-section/11-mobile-hero-separated-final.png`

State: dark theme, homepage at the top for the hero comparison; homepage scrolled to the standalone Impact snapshot for the focused comparison.

Viewport and density normalization:

- Source: 2940 × 1912 px. The 2940 × 1310 px webpage region was cropped from y=420 and normalized to 1470 × 655 px.
- Normalized source: `/Users/johnlesterescarlan/.codex/visualizations/2026/09/02/01a0601f-67ba-7bd0-a7c1-eb58293ae47a/portfolio-impact-section/07-reference-before-normalized.png`
- Desktop implementation: 1470 × 655 CSS px at DPR 1.
- Mobile implementation: 390 × 844 CSS px at DPR 1.

## Evidence

- Full before/after comparison: `/Users/johnlesterescarlan/.codex/visualizations/2026/09/02/01a0601f-67ba-7bd0-a7c1-eb58293ae47a/portfolio-impact-section/08-before-after-comparison.png`
- Focused section evidence: `/Users/johnlesterescarlan/.codex/visualizations/2026/09/02/01a0601f-67ba-7bd0-a7c1-eb58293ae47a/portfolio-impact-section/02-impact-dedicated-section.png`
- Mobile evidence: `/Users/johnlesterescarlan/.codex/visualizations/2026/09/02/01a0601f-67ba-7bd0-a7c1-eb58293ae47a/portfolio-impact-section/11-mobile-hero-separated-final.png`

Focused evidence was required because the requested change intentionally moves the proof content out of the initial hero viewport.

## Findings

No actionable P0, P1, or P2 differences remain.

- Information architecture: the hero now owns only the introduction, positioning, portrait, CTAs, and social links. Impact snapshot starts at the next viewport boundary as its own labeled region.
- Fonts and typography: existing Playfair, Geist, and mono label hierarchy is unchanged. Metric typography and copy wrapping remain readable in the dedicated section.
- Spacing and layout rhythm: the hero measures exactly one viewport high on desktop and mobile. The Impact snapshot begins at y=655 on desktop and y=844 on mobile, with increased vertical padding and a stronger section boundary.
- Colors and visual tokens: the established monochrome surface, grid treatment, hairlines, and theme behavior remain unchanged.
- Image quality and asset fidelity: the supplied portrait is unchanged and keeps its existing crop and corner-bracket treatment.
- Copy and content: all three evidence-backed outcomes and their source links remain unchanged.
- Responsiveness: no horizontal overflow at 390 px; body scroll width and root client width both measure 390 px.

## Primary interactions and technical checks

- Confirmed the Impact snapshot remains a labeled region with working in-page source links.
- Confirmed desktop and mobile hero-to-impact boundaries through rendered DOM measurements.
- Browser console: no application errors. One expected local-development warning reports that `GITHUB_TOKEN` is absent, so the contribution graph is not rendered locally.

## Comparison history

1. The reported state intentionally shortened the hero by 14rem, allowing Impact snapshot to populate the initial viewport.
2. The hero and its inner grid were changed to `min-h-svh`, moving Impact snapshot to the next viewport boundary.
3. The Impact snapshot received its own `#impact` section anchor, top-and-bottom boundary, expanded vertical padding, and wider editorial gap.
4. Desktop and mobile browser passes confirmed the split without overflow or lost content.

## Validation

- Unit tests: 22 passed.
- UI/integration tests: 42 files passed; 381 tests passed.
- Lint: passed.
- Typecheck: passed.
- Production build: passed.

final result: passed
