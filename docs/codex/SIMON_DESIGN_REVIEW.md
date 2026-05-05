# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
The pages are calmer and more coherent, but the branch is still proving the marketing shell harder than the actual daily operating system.

## Mission Fit
The current direction partially matches EasyLife: the typography, green system color, card rhythm, and grounded copy make the modules feel related. But Pack 1 is about the product spine and protected first screen, and the available screenshots mostly show public product pages. That means the most important mission question remains under-proven: does the signed-in user immediately know what to do today?

## Taste Check
The best parts are the restraint, the softer background grid, the tactile preview panels, and the copy moving away from generic SaaS fog. EasyList and EasyNotes especially feel closer to a practical personal tool. The weaker part is repetition: every product route has the same big hero, same chips, same CTA pair, same preview-card formula. It is tidy, yes, but tidy can still be a showroom. The app needs to feel used, not merely described.

## Visual Problems To Fix
- The provided screenshots do not show the protected HQ opening surface, so confidence is lower on the core Pack 1 claim.
- Public product routes still lead with large marketing heroes instead of proving the connected daily system.
- The top nav has strong route chrome with "Products" and "Get Started" competing with each page's primary demo content.
- The first viewport repeats identity in multiple layers: global EasyLifeHQ brand, product eyebrow, product headline, CTA band, chips, and preview label. Very organized. Also very "I made a product page template."
- Mobile pages are readable, but the hero plus CTA plus chips plus preview consumes too much vertical space before the user reaches substance.
- The preview cards are handsome but too similar across modules, which makes EasyList, EasyNotes, EasyCalendar, and EasyWorkout feel like variants of the same landing-page block rather than working surfaces.
- Desktop hierarchy is clean, but the hero H1s are oversized relative to the practical nature of the product.
- "Start Free" appears repeatedly across module pages and pulls the experience toward acquisition instead of daily use.

## Strongest Opportunities
- Show the protected Today/HQ surface in the visual evidence and make that the design anchor for Pack 1.
- Reduce public-route chrome so each module demo feels like the product itself, not a brochure wrapped around a demo.
- Turn the preview panels into more app-like snapshots with active state, next action, and linked module status.
- Make mobile first screens more decisive: one headline, one action, one compact proof panel, then let the rest unfold.
- Give each core module a slightly more specific layout signature while preserving shared tokens and spacing.

## Priority Fix
The next design fix is proof and subtraction: capture and judge the protected HQ first screen, then reduce any chrome that delays the daily next action. The opening surface must show one next best move, today context, and compact module status before navigation furniture, product explanation, or repeated labels. If the user sees a pitch before a useful next step, Pack 1 is not done.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: calmer module styling helps, but HQ proof is missing and the visible routes still behave too much like marketing templates.

## Designer Handoff
Keep the restrained palette, softened cards, heavier type confidence, and practical copy. Change the hierarchy: make the protected Today surface the hero of the product, not another page in the rotation. Quiet the route controls, reduce duplicate labels, and let each module preview feel like a real working state with one clear action. The user should feel, "I know what needs attention now," not "I understand the feature matrix."

## What Not To Do Next
- Do not add more sections to the product pages.
- Do not make the public routes louder to compensate for missing HQ evidence.
- Do not add more chips, badges, or explanatory labels.
- Do not invent new dashboards or broad module redesigns.
- Do not ignore mobile vertical density.
- Do not touch backend, auth, package files, deployment, Firebase, or data persistence.

## Next 5 Design Tasks
- [ ] Capture protected HQ desktop and mobile screenshots and compare them against the Information Staging first-screen contract; no code changes in this task.
- [ ] Remove one repeated identity or intro label from the protected HQ first viewport; keep the daily next action visually dominant.
- [ ] Quiet one public-route chrome element that competes with module content; preserve navigation utility and do not add new sections.
- [ ] Tighten mobile first-viewport spacing on one core route so CTA, chips, and preview do not crowd the actual module proof.
- [ ] Make one module preview more app-like by emphasizing active state and next action; do not change data behavior or add backend claims.

## Stop Or Continue
continue but fix visual issues first