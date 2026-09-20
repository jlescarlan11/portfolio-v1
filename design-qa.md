**Design QA**

- Source visual truth: `/var/folders/mh/rxmkm5jd2s1d952s608rwwy40000gn/T/codex-clipboard-7f7ce1dc-c7e2-4056-bcda-351df584bba1.png` (focused contact-control crop), with the earlier full-page redesign reference retained as composition context
- Implementation screenshots: `qa-contact-desktop.png`, `qa-chat-desktop.png`, `qa-contact-mobile.png`, `qa-chat-mobile.png`
- Desktop viewport: 1470 × 956 CSS px at device scale factor 1
- Mobile viewport: 390 × 844 CSS px at device scale factor 1
- Source pixels: 1204 × 460 focused crop; implementation was inspected at native 1470 × 956 CSS px and with a focused control comparison
- Implementation pixels: 1470 × 956 desktop and 390 × 844 mobile
- State: light theme, contact section at its top scroll position; chatbot checked closed and open

**Full-view comparison evidence**

The focused source crop and the refreshed desktop implementation were opened together. The requested content change is present without shifting the contact container, two CTA proportions, secondary links, footer boundary, launcher label, or bottom-right assistant trigger. The implementation screenshot contains the development-only Next.js indicator at bottom left; it is not included in production.

**Focused region comparison evidence**

- Contact controls: the 256 × 92 px primary CTA, 312 × 92 px booking CTA, 12 px inter-card gap, 12 px corner radius, vertically centered booking label, icon placement, and secondary-action baseline were checked at native CSS scale. “20 minutes” is absent visually and from the accessible link name.
- Chat launcher: the bordered uppercase label, dismiss control, 44 × 44 launcher, and icon treatment were checked against the reference.
- Open chatbot: no open-state source was supplied, so it was checked for consistency with the updated system: rounded monochrome surfaces, Poppins typography, hairline borders, restrained status treatment, and matching iconography. The outer panel uses a 16 px radius and nested controls use 12 px.
- Mobile: contact controls stack at full width and the modal uses equal 24 px side gutters without horizontal overflow.

**Findings**

- No actionable P0, P1, or P2 differences remain.
- Typography: Poppins family, 400/500 optical hierarchy, uppercase tracking, wrapping, and line height match the existing redesign system.
- Spacing and layout: desktop alignment and section/footer rhythm match the normalized source; mobile stacking remains readable and touch-safe.
- Colors and tokens: the implementation uses the existing foreground/background and surface-border tokens in light and dark themes.
- Image and icon fidelity: no raster assets are required in this section. All arrows, external-link marks, close/send controls, focus frame, status dot, and robot mark use the installed Remix Icon set.
- Copy and content: “20 minutes” was removed from the booking CTA and its content model as requested. All other contact and chat copy remains unchanged.

**Comparison history**

1. Initial pass found the booking label wrapping on desktop and an extra inner focus outline in the chatbot input. Desktop CTA padding was tightened and the input now relies on the containing focus border.
2. Mobile pass found asymmetric modal gutters caused by the old 320 px maximum width. The cap was removed so the dialog uses the intended `100vw - 3rem` width with equal gutters.
3. Post-fix desktop and mobile captures show no remaining P0/P1/P2 issues. Browser console errors: none.
4. User follow-up identified the remaining square corners. Contact cards and chatbot surfaces were updated to a consistent 12/16 px radius system, then recaptured on desktop and mobile with no overflow or clipping.
5. User follow-up removed the redundant “20 minutes” line. The booking label was vertically centered, desktop and mobile evidence was recaptured, and the accessible link name was verified without the duration.

**Primary interactions tested**

- Open chat from the launcher.
- Focus and enter text in the chat input.
- Close the modal with Escape and restore the launcher.
- Confirm background content becomes inert while the dialog is open through the component test suite.

**Implementation checklist**

- [x] Match contact composition and CTA proportions.
- [x] Carry the redesign language into closed and open chatbot states.
- [x] Preserve keyboard focus, modal semantics, retry, streaming, and reduced-motion behavior.
- [x] Verify desktop and mobile layouts in the browser.
- [x] Check browser console errors.

**Follow-up polish**

- None required for the supplied reference.

final result: passed
