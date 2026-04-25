# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is finally speaking one visual language, but right now it is a very loud calm product, which is a contradiction worth fixing.

## Mission Fit
The direction mostly matches the mission: the shared shell, repeated product framing, consistent cards, and suite language make EasyLife feel more connected than a pile of apps. The problem is that the current hierarchy is still too marketing-heavy and inflated for a professional personal operating system. It looks polished at first glance, but it does not yet feel fast, quiet, or daily-use dense enough.

## Taste Check
The soft mint surface, restrained borders, consistent product cards, and confident typography give the suite a more premium baseline. The pages no longer feel random.

The weak spot is scale discipline. Headings, pills, buttons, and vertical spacing are oversized, especially on mobile. The grid background is tasteful in moderation, but paired with giant cards and huge tags it starts to feel like a product launch page wearing productivity software perfume. Better, but still too staged.

## Visual Problems To Fix
- Mobile hero spacing is too tall before the actual content appears, creating a slow first impression.
- Mobile tags are oversized and visually compete with the primary actions.
- Desktop hero cards are clean but too uniform across products, making the suite feel templated instead of intelligently connected.
- The right-side product panel has too much empty vertical space on desktop and reads decorative before it reads useful.
- The background grid is elegant but slightly over-present; it should support the product, not announce itself.
- Product pages still privilege slogan copy over actual daily workflow clarity.
- Settings has repeated `/settings` route console warnings in desktop and mobile visual QA, which undermines trust even if the visible surface is not broken.
- Confidence is lower for Settings visual quality because the supplied visual evidence is mostly product-page screenshots, not a clear Settings UI screenshot.

## Strongest Opportunities
- Make the shared suite shell feel quieter and more operational by reducing hero height, chip scale, and card padding on mobile.
- Introduce one compact "daily operating system" section pattern that shows cross-app usefulness instead of more generic feature cards.
- Give each product page a slightly sharper functional artifact: task triage for EasyList, week density for EasyCalendar, writing surface for EasyNotes, logging surface for EasyWorkout.
- Tighten the desktop hero panel so it feels like a live product preview, not a brochure insert.
- Use Settings as the control-center proof point: calm groups, crisp labels, no route warnings, no drama.

## Priority Fix
Fix the mobile hierarchy first. Reduce the hero card padding, shrink the pill/tag treatment, tighten the gap between header and content, and make the primary action area feel compact enough for a daily-use product. The current mobile screen looks polished but oversized; the user should feel speed, not ceremony.

## Designer Handoff
Keep the current mint-and-ink direction, the clean card borders, the confident type, and the suite-wide consistency. Change the density. Mobile needs smaller chips, shorter vertical rhythm, and less empty hero theater. Desktop needs the right-side product panel to carry more useful product meaning or become visually quieter. Do not add new sections to compensate. Make what exists sharper, leaner, and more obviously useful. The result should feel like opening a calm professional command center, not scrolling through a tasteful pitch deck.

## What Not To Do Next
- Do not add more feature sections before fixing scale and density.
- Do not make the palette louder to create personality; the issue is hierarchy, not color.
- Do not add decorative gradients, blobs, or illustration filler.
- Do not start backend, auth, routing, payments, analytics, or deployment work.
- Do not ignore mobile because desktop looks acceptable.
- Do not keep duplicating the same hero/card formula without product-specific usefulness.
- Do not treat the `/settings` console warning as harmless polish debt.

## Next 5 Design Tasks
- [ ] Tighten mobile hero spacing on one product page: reduce top/bottom padding and inter-section gaps without changing copy, routing, or behavior.
- [ ] Resize mobile feature chips: make tags smaller, easier to scan, and less dominant than primary actions; verify no wrapping overlap.
- [ ] Refine one desktop product info panel: reduce empty space and make the content read more like useful product context, not a decorative brochure card.
- [ ] Fix the `/settings` route console warning found in visual QA without touching auth, backend, Firebase, dependencies, or unrelated routing behavior.
- [ ] Audit the shared background grid strength: make one narrow CSS adjustment so it feels quieter on mobile while preserving the current suite identity.

## Stop Or Continue
continue but fix visual issues first