# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is cleaner and more coherent than before, but it still presents as a set of polished product brochures instead of one calm personal assistant surface.

## Mission Fit
The direction partially matches the mission: the shared typography, teal accent, rounded panels, and repeated card language make the suite feel more unified. But the mission is not "make each module a handsome landing page." The protected first screen is supposed to help the signed-in user know what to do next today, and the latest visual evidence mostly shows marketing/product routes with big explanatory heroes, feature cards, and fake preview rows. That is adjacent to the mission, not the mission.

Confidence is lower on the actual assistant-first HQ because the recent screenshots do not include `/app/hq`; they show EasyList, EasyCalendar, EasyNotes, and EasyWorkout marketing/demo surfaces.

## Taste Check
The good: the system has a calmer visual voice now. The palette is restrained, the type feels confident, the cards have decent air, and the product pages no longer look like random experiments stitched together in a hallway.

The weak: the design is still too page-template obvious. Every product route uses the same hero-card, chips, CTA, preview-panel, feature-section rhythm, which makes the suite feel professionally repetitive but not intelligent. It is giving "SaaS brochure factory with better manners." The hierarchy is loud where it should be useful: big headlines, big cards, big empty header space, and not enough direct evidence of the actual daily operating system.

## Visual Problems To Fix
- The customer-facing module routes repeat the same page identity pattern: top EasyLifeHQ header, then a large module hero card, then another "Features" intro band. It is not a double header by exact text, but it creates stacked route chrome before the user sees much product substance.
- Mobile first screens are too consumed by brand/header chrome and oversized hero copy. On EasyCalendar and EasyWorkout, the user spends the first viewport reading the pitch instead of seeing a useful working surface.
- The module pages still feel separate: EasyList, EasyCalendar, EasyNotes, and EasyWorkout each get their own oversized identity moment instead of being clearly subordinate to one assistant system.
- "Open EasyLife" is repeated as a generic CTA across modules. It does not express the specific daily action the product wants the user to take.
- The preview panels look tidy but artificial: rows like "Class locked," "Start push day," and "Recent notes first" are useful hints, but they read as static marketing props rather than live assistant context.
- The background grid and soft card stack are clean, but overused. It makes every route feel like the same showroom with a new sign on the door.
- Chips under the hero add visual clutter on mobile, especially where they wrap into multiple lines before the preview panel.
- The desktop layouts leave a very large quiet band between header and hero. Calm is good; unused vertical ceremony is not.

## Strongest Opportunities
- Make `/app/hq` the visual proof of the product: one next action, today context, compact module status, and quiet secondary navigation.
- Turn the marketing product pages from big brochures into concise product teasers that lead to the actual assistant surface faster.
- Replace repeated generic CTAs with task-specific actions: "Review today," "Capture a task," "Open notes," "Plan the next block."
- Use the preview panels to show connected-suite behavior, not isolated module demos: task becomes calendar block, note becomes action, workout affects capacity.
- Reduce mobile hero scale and chip clutter so the first screen feels usable, not merely readable.
- Make "More" and optional modules visually quieter so Today, Inbox, Plan, and Notes become the real spine.

## Priority Fix
The single most important problem is that EasyLife still lacks visible proof of an assistant-first daily start surface. The next batch should focus on `/app/hq`: simplify the first viewport to one recommended next move, one compact today context block, and a small connected module status row. Hide feature inventory, secondary modules, setup language, and extra stats below the fold or behind existing navigation. Until that surface is visually proven, the product will keep looking like a suite of apps wearing matching uniforms.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: AI Personal Assistant Stage 0 - Salvage Audit; REASON: visual consistency improved, but the assistant-first daily surface is still not proven in the inspected product.

## Designer Handoff
Keep the current restraint: teal accent, off-white surface, strong black typography, tactile rounded panels, and the plainspoken copy direction. Change the hierarchy. The next implementer should stop adding explanation and start staging action: first screen equals "what do I do now," second layer equals module switching, deeper layer equals details. On mobile, reduce hero ceremony and make the first useful decision visible faster. The user should feel like EasyLife is quietly waiting with the next step, not auditioning four separate apps for funding.

## What Not To Do Next
- Do not add more sections to the product pages.
- Do not create another broad dashboard or feature inventory.
- Do not make the marketing routes louder to compensate for the weak assistant surface.
- Do not add fake AI promises, backend claims, automation theater, or "smart" language that the product cannot prove.
- Do not ignore mobile; the current mobile hierarchy is where the product feels most padded.
- Do not redesign every module at once. Fix the spine first.

## Next 5 Design Tasks
- [ ] Capture fresh desktop and mobile screenshots of `/app/hq`; guardrail: do not judge the assistant reset from marketing product pages alone.
- [ ] Simplify the `/app/hq` first viewport to one next action, today context, and compact module status; guardrail: no new routes, no backend behavior, no auth changes.
- [ ] Remove or collapse one visible HQ feature-inventory block below the fold; guardrail: preserve access through existing navigation or detail sections.
- [ ] Replace generic "Open EasyLife" style CTAs on one product route with a more specific action label; guardrail: change copy only, not routing.
- [ ] Tighten one mobile product hero by reducing chip or header clutter before the preview panel; guardrail: no new sections, no decorative additions.

## Stop Or Continue
continue but fix visual issues first