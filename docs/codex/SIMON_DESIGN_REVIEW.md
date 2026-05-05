# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is getting calmer, but the visible proof still reads more like a tidy product brochure than a signed-in personal operating system.

## Mission Fit
The direction mostly matches the mission: quieter surfaces, better restraint, and more consistent module language are all useful for a connected suite. The problem is proof. The screenshots show EasyList, EasyNotes, EasyCalendar, and EasyWorkout as customer-facing product pages, while the active Pack 1 mission is the protected Today/HQ spine. Without fresh HQ screenshots, confidence is lower, and the branch still feels like it is polishing the brochure around the product instead of proving the daily start surface.

## Taste Check
The good: the typography is confident, the teal accent is restrained, cards have enough air, and the module demos feel cleaner than generic SaaS confetti. The page has a quiet productivity-app tone, which is right for EasyLife.

The off: the whole system is still over-carded, over-labeled, and too eager to explain itself. The top nav, product pills, big hero card, feature band, and demo panel all compete for identity. It is not chaos, but it is wearing too many name tags.

## Visual Problems To Fix
- The visible routes repeat page identity: global EasyLifeHQ brand, module eyebrow, hero headline, CTA pair, feature band, and demo card all restate what the page is before the user sees much functional value.
- The route chrome is too loud for a product demo surface: the header card, nav links, Products button, and Get Started button visually compete with the module page.
- Mobile first screens are heavy: the brand header plus oversized hero means the user spends too much of the first viewport reading marketing hierarchy instead of seeing the product behavior.
- The module pages feel too standalone; EasyList, EasyNotes, EasyCalendar, and EasyWorkout share style, but they do not yet feel connected through one daily operating spine.
- The feature sections use repeated white cards inside large white panels, which creates a nested-card showroom effect.
- The background grid adds texture, but paired with multiple bordered cards it starts to feel like template polish rather than a calm working app.
- The screenshots do not include the protected HQ/Today route even though the recent work targeted it, so the central Pack 1 design question is not visually proven.
- CTA hierarchy is still marketing-first: "Start Free" and "See Features" dominate module pages more than "what can I do next today?"
- Some pill tags are visually busy on mobile, especially when they wrap into multiple rows before the demo panel.
- The demo panels are useful, but they sit as illustrations of features rather than connected status signals from a suite.

## Strongest Opportunities
- Put the protected Today/HQ first screen back at the center of Pack 1 evidence: one next move, today context, compact module status, and quiet capture.
- Reduce customer-facing module chrome so the actual product example appears faster, especially on mobile.
- Create a stronger suite spine by showing how modules relate: task becomes calendar block, note becomes action, workout sits as a daily routine signal.
- Use fewer, sharper panels instead of repeating card grids; the product will feel more premium when it stops explaining every obvious thing.
- Make route navigation quieter and more utilitarian, especially on demo pages where the module experience should lead.
- Keep the current restraint, type scale, and tactile softness, but subtract repeated labels and redundant feature copy.

## Priority Fix
The single most important design problem is missing visual proof of the protected Today/HQ spine. The next design batch should capture and judge the signed-in first screen directly, then reduce any chrome that prevents one next action, today context, and compact module status from owning the first viewport at desktop and 390px mobile. No more polishing the lobby while the apartment is uninspected.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: calmer module styling and Today-focused work help, but HQ proof is missing and visible routes remain too marketing-led.

## Designer Handoff
Next implementer: treat EasyLife as a working personal assistant, not a product brochure. Keep the calm teal system, confident type, soft borders, and concise module demos. Change the hierarchy so the signed-in Today surface is the hero of the product: one daily next move first, compact supporting signals second, capture available but not dominant, and module navigation quiet. On public/module pages, reduce repeated identity and heavy route controls so the demo content appears sooner. The user should feel, "I know what to do next," not "I have been given a tour of features."

## What Not To Do Next
- Do not add more sections to the module pages.
- Do not add new dashboard widgets before the Today/HQ first screen is visually proven.
- Do not make the background more decorative.
- Do not add more pills, badges, or status chips to solve hierarchy.
- Do not broaden into backend, auth, persistence, package, deployment, or architecture work.
- Do not ignore mobile; the current mobile pages are readable but still too tall before usefulness appears.
- Do not confuse public product explanation with the signed-in operating surface.

## Next 5 Design Tasks
- [ ] Capture fresh desktop and 390px mobile screenshots of the protected Today/HQ route; do not change code in this task, and verify the first viewport shows one next action before module inventory.
- [ ] Reduce Today/HQ first-viewport chrome by one visible layer; preserve existing behavior and keep capture secondary to the next best move.
- [ ] On one module page, remove one repeated identity or intro element so the product demo appears earlier; do not add new copy or sections.
- [ ] Tighten mobile spacing for the module hero/demo stack at 390px; keep buttons tappable and avoid introducing new breakpoints unless already patterned.
- [ ] Replace one nested-card feature band with a flatter layout treatment; keep the same content and prove the page feels less buried.

## Stop Or Continue
continue but fix visual issues first