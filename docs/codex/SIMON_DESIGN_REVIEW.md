# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is finally starting to look like one suite, but it still leans too hard on oversized cards, pill clutter, and polite SaaS sameness when the mission wants a calm personal operating system.

## Mission Fit
The direction mostly matches Pack 1 - Product Spine: shared headers, repeated product framing, consistent mint-tinted surfaces, and cleaner hierarchy are pulling the apps into one family. The problem is that the family resemblance is still mostly visual styling, not a strong operating-system spine. The screenshots show public product pages more clearly than signed-in daily workflows, so confidence on the protected suite experience is lower.

## Taste Check
The best parts are the restrained palette, strong type weight, calm spacing, and better product-specific promises. EasyNotes and EasyWorkout now feel more distinct than before, and the preview panels are useful enough to signal real product behavior.

The weak parts are the heavy rounded-card system, repeated pill rows, and oversized mobile hero rhythm. Too many surfaces say "nice template" before they say "daily command center." The product is wearing a good coat, but it is still standing in the lobby asking where the restaurant is.

## Visual Problems To Fix
- Mobile pages waste too much first-viewport height before the actual product preview becomes useful.
- The header and hero card both use large rounded containers, creating card-on-card visual heaviness.
- Pill rows compete with the headline and CTA instead of acting as quiet supporting metadata.
- Preview panels repeat the same rounded capsule header treatment across products, making apps feel more interchangeable than they should.
- Desktop marketing sections still rely on equal-width feature cards, which weakens hierarchy and makes scanning feel generic.
- The mint background grid is calm, but it risks becoming wallpaper because every module sits on similar pale panels.
- CTAs are readable, but their scale on mobile feels chunky relative to the rest of the hierarchy.
- Product identity is improving, but the suite navigation still does not yet feel like the central spine of a personal OS.

## Strongest Opportunities
- Turn the first signed-in view into the real product spine: a compact today-oriented shell that links tasks, notes, calendar, workouts, and settings with clear current state.
- Replace repeated pill rows with one quieter metadata line or compact segmented treatment where the content truly needs comparison.
- Give each product preview one distinct structural motif: calendar time rows, list queue, notes editor, workout session log, settings control groups.
- Reduce mobile hero vertical padding so the headline, CTA, and preview all work together above the fold.
- Make lower sections use lead-plus-support hierarchy instead of three equal cards everywhere.
- Introduce more precise active states in navigation so moving between modules feels deliberate, not just routed.

## Priority Fix
Fix the mobile first-viewport hierarchy across the product pages. Keep the current copy and shared shell, but reduce the stacked hero/card/pill bulk so the product name, promise, primary action, and preview are visible as one composed system. The goal is not smaller for its own sake; the goal is faster comprehension and less "giant brochure card" energy.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: suite consistency is clearer, but repeated card and pill language still keeps Pack 1 from feeling premium or memorable.

## Designer Handoff
Next batch should stay focused on Pack 1 and clean the product spine, not invent new surfaces. Keep the restrained palette, strong typography, concise product promises, and useful mock previews. Change the mobile rhythm: less vertical padding, fewer competing pill treatments, quieter secondary metadata, and stronger preview specificity per product. The user should feel that EasyLife is a connected daily operating system they can enter quickly, not a set of attractive landing pages asking for more scroll.

## What Not To Do Next
- Do not add more sections to compensate for weak hierarchy.
- Do not introduce new colors, gradients, illustrations, or decorative noise.
- Do not redesign every product page in one broad sweep.
- Do not touch backend, auth, persistence, routing, packages, deployment, or architecture.
- Do not keep polishing copy while ignoring mobile composition.
- Do not make the previews larger unless the surrounding hero bulk is reduced first.
- Do not add more pills. The pills have had enough attention.

## Next 5 Design Tasks
- [ ] On one mobile product marketing page, reduce first-viewport vertical bulk by tightening hero padding and spacing only; preserve copy, CTAs, routing, and desktop layout.
- [ ] Replace one nonessential mobile pill row with quieter plain-text metadata or a shorter inline treatment; do not add new content or behavior.
- [ ] Adjust one product preview header so it uses product-specific structure instead of the same capsule title treatment; keep existing mock data and visual tokens.
- [ ] Convert one lower marketing section from three equal cards into a lead-plus-support layout; reuse existing copy and avoid new sections.
- [ ] Inspect one signed-in suite screen screenshot and identify the smallest visible shell/navigation hierarchy fix; limit implementation scope to spacing, labels, or active-state polish.

## Stop Or Continue
continue but fix visual issues first