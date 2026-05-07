# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife now has a calmer, more coherent product-marketing skin, but the actual assistant-first app surface is still not visually proven, which is the whole assignment.

## Mission Fit
The direction partially matches the mission: the pages feel more connected, restrained, and professional across EasyList, EasyNotes, EasyCalendar, and EasyWorkout. The teal identity, shared card language, and repeated layout system are doing useful suite work. But the mission is a connected personal operating system with a clear daily start point, and the inspected screenshots mostly show marketing product pages, not the signed-in Today/HQ assistant surface. Confidence is lower because the latest screenshots do not show `/app/hq` or the protected first screen contract directly.

## Taste Check
The best thing here is consistency. The product pages finally look like siblings: same typographic rhythm, same soft green-gray environment, same tactile preview panel, same compact chips. It is cleaner than the earlier scattered-app feeling.

The weak part is that it still leans too much into brochure structure: big hero, feature band, repeated "Open EasyLife", product labels, and large chrome before the user sees useful daily work. The mobile pages are polished enough, but oversized type and big stacked panels make everything feel a little inflated, like the app is explaining itself in a lobby instead of helping someone get through the day. Pleasant, yes. Assistant-grade, not yet.

## Visual Problems To Fix
- The customer-facing pages have repeated identity: the top shell says "Daily Workspace EasyLifeHQ", then the page repeats EasyLife product names and another "Open EasyLife" CTA. The product is announcing itself twice before doing anything useful.
- On desktop, the gap between the header and hero is too large, creating dead air that weakens the first read.
- On mobile, the top EasyLifeHQ header is visually loud and consumes too much vertical space before the actual product content appears.
- The hero pattern is nearly identical across products, which helps consistency but risks making each module feel like a template swap instead of a distinct daily tool.
- The feature sections start too soon and too loudly below the hero, especially on mobile; they compete with the primary story instead of receding behind progressive disclosure.
- The teal action button has good weight, but "Open EasyLife" repeats everywhere and feels generic rather than context-aware.
- The preview cards are useful, but some mobile rows feel cramped, with labels, values, and status pills squeezed into one horizontal strip.
- The app-first mission is not evidenced in the screenshots: there is no visible proof that Today shows one next action, today context, and compact module status.

## Strongest Opportunities
- Make the signed-in Today/HQ surface the showpiece: one next action, one capture affordance, and three quiet module signals.
- Reduce route chrome so the product page or app surface starts faster, especially on mobile.
- Replace generic CTAs with module-specific actions like "Plan today", "Capture a task", "Start a note", or "Log workout".
- Give each module one distinctive functional preview while preserving the shared EasyLife frame.
- Push feature inventories lower or behind tabs/details so the first screen feels like a working product, not a sales explainer.

## Priority Fix
Fix the first-screen hierarchy around the assistant promise. The next batch should visually inspect and simplify `/app/hq`, not another marketing page: remove one loud module-directory or feature-inventory block from the first viewport, make one recommended next move dominant, keep capture close by, and compress secondary module status into quiet signals. Until that exists on screen, EasyLife is still wearing a nice jacket over an unclear job.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: AI Personal Assistant Stage 0 - Salvage Audit; REASON: suite consistency improved, but the active assistant-first surface is still not visually proven.

## Designer Handoff
Keep the restrained green-gray system, the bold but simple typography, and the tactile preview language. Change the hierarchy: less header mass, less repeated identity, fewer feature blocks above the fold, and more direct daily action. The next implementer should treat EasyLife like a personal assistant cockpit, not a product brochure. The user should feel, "I know what to do next," before they feel, "I understand every module."

## What Not To Do Next
- Do not add another marketing section to explain the suite.
- Do not make the product pages more decorative; the issue is hierarchy, not ornament.
- Do not expand the dashboard into more cards, stats, or module tiles.
- Do not use bigger type to manufacture confidence.
- Do not ignore mobile; the current chrome already eats too much first-screen space.
- Do not touch backend, auth, routing behavior, packages, or persistence to solve a visual hierarchy problem.

## Next 5 Design Tasks
- [ ] Inspect `/app/hq` desktop and mobile screenshots and confirm whether the first viewport shows one next action, today context, and compact module status; do not change code in this task.
- [ ] Reduce one loud first-viewport HQ block so Today reads as an assistant start surface, with no new sections and no route changes.
- [ ] Replace one repeated generic "Open EasyLife" CTA on a product page with a context-specific action label, keeping behavior unchanged.
- [ ] Tighten the mobile top shell spacing so the actual page content appears sooner, without changing navigation structure.
- [ ] Review mobile preview rows for cramped labels and status pills; adjust spacing or wrapping only, with no new data or logic.

## Stop Or Continue
continue but fix visual issues first