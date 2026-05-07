# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is cleaner and more coherent, but it still presents like a polished product brochure before it proves the daily assistant surface exists.

## Mission Fit
The direction partially matches the mission: shared headers, product cards, teal accents, and calmer copy are making the suite feel more unified. The problem is that the visible evidence is still mostly product-page framing for EasyList, EasyCalendar, EasyNotes, and EasyWorkout, not the signed-in daily operating surface promised by the mission. The assistant reset is visible in navigation labels, but the screenshots do not yet show a first screen that says, "Here is what matters today, do this next."

## Taste Check
The best work is the restraint: soft green-gray background, sharp black type, simple cards, compact product previews, and direct copy all feel more adult than generic SaaS candy. The typography has presence, and the product pages finally sound less like feature inventory.

The weak part is hierarchy discipline. Every module gets a huge marketing hero, oversized headline, pill cluster, preview panel, feature section, and CTA. It is handsome, but repeated too evenly. A personal operating system should not make every module enter wearing the same keynote blazer.

## Visual Problems To Fix
- The product pages repeat the same page structure across modules so aggressively that EasyList, EasyCalendar, EasyNotes, and EasyWorkout feel templated instead of specifically useful.
- The customer-facing product pages still dominate the visual evidence; the protected first-screen assistant contract is not proven in screenshots, so confidence is lower on whether the actual app now starts with one daily next action.
- The top marketing header competes with the product hero: logo block, nav links, Products button, and Get Started all read loud before the user sees the product example.
- Mobile hero typography is oversized for a utility product; it creates impact, but it pushes the actual preview and daily usefulness too far down.
- The pill rows under the primary CTA look like feature tags but do not carry enough action hierarchy; they add texture more than utility.
- Preview panels are attractive but too static: they hint at state, yet they do not clearly establish what the user should do next.
- "Open EasyLife" repeats as a generic CTA across product pages, making every module feel equally primary instead of supporting one assistant spine.
- The suite still leans into separate branded modules, even after the navigation reset; optional modules are quieter, but not yet visually subordinate to Today.

## Strongest Opportunities
- Make the signed-in HQ/Today route the hero of the product, not another module page: one next action, today context, and compact status.
- Reduce marketing chrome on product routes so the actual product example feels first, not wrapped in a brochure shell.
- Turn module previews into connected status cards that point back to Today, Inbox, Plan, Notes, and More.
- Use one assistant-first CTA language pattern: "Start today", "Capture something", "Plan the next block", not generic "Open EasyLife" everywhere.
- Tighten mobile first screens by reducing headline scale and moving useful preview content higher.

## Priority Fix
Fix the first-screen proof problem. The next design task should make the protected Today/HQ surface visibly assistant-first: one clear daily next action at the top, compact context underneath, and quieter module access below. Do not add sections. Do not make another dashboard buffet. The screen needs to feel like a calm personal assistant saying, "Start here."

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: AI Personal Assistant Stage 0 - Salvage Audit; REASON: navigation and visual consistency improved, but the assistant-first daily surface is still not visually proven.

## Designer Handoff
Keep the tactile calm: the muted background, strong black type, restrained teal, compact cards, and concrete copy are worth preserving. Change the hierarchy. The next implementer should make Today the visual center of gravity and push module browsing into secondary navigation or a quieter More pattern. Product pages can stay polished, but the working app must stop behaving like a directory of apps and start behaving like a daily start point. The user should feel less "Which app do I open?" and more "I know what to do next."

## What Not To Do Next
- Do not add more product sections to explain the assistant concept.
- Do not make a larger dashboard with every module status visible at once.
- Do not keep polishing marketing pages while the signed-in first screen remains unproven.
- Do not add visual noise, gradients, icons, or decorative panels to fake progress.
- Do not touch backend, auth, package files, integrations, or architecture.
- Do not ignore mobile; the current mobile hierarchy is readable but too tall before utility appears.

## Next 5 Design Tasks
- [ ] Reduce the signed-in Today/HQ first viewport to one primary next action, one short today context line, and no more than three compact module signals.
- [ ] Quiet the app header on protected routes by making secondary navigation visually lighter than the current active daily surface.
- [ ] Replace repeated "Open EasyLife" CTA language on one product route with a more specific action tied to that module, without changing routing.
- [ ] Tighten one mobile hero screen by reducing headline scale and moving the preview/status panel higher, with no new content.
- [ ] Audit one module page for repeated product-page structure and remove or demote one redundant intro, tag row, or feature block.

## Stop Or Continue
continue but fix visual issues first