# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is getting calmer and more coherent, but the branch is still proving the shell around the product more than the product moment itself.

## Mission Fit
The direction matches the mission better than the previous batch: the protected Today/HQ surface now has a clearer next-best-move idea, compact context, and a quieter capture entry. That is the correct spine for a personal operating system. The problem is proof and hierarchy: the active work pack is Product Spine, but the freshest screenshot set mostly shows module routes, not the protected HQ first screen where the mission is supposed to land.

## Taste Check
The improved rhythm sounds more restrained: smaller context, capture as a secondary action, and mobile comfort are all pointing away from dashboard sludge. Good. The risk is that EasyLife still carries too much "demo page" posture across visible routes, with module pages feeling like separately styled product samples instead of one working suite. Calm is not the same as generic. Right now the taste is improving, but it still needs a stronger, more unmistakable daily-assistant center.

## Visual Problems To Fix
- The latest visual evidence does not clearly include the protected HQ/Today first screen, even though that is the active Pack 1 surface. Design confidence is lower because the most important screen is not the screen being shown.
- Core module routes still appear to carry their own page identity instead of deferring to one suite shell; this risks the user feeling like they are jumping between demos rather than moving through one product.
- Route-level intro/header treatment still needs restraint. If a module title, shell label, and demo/page intro stack together, that is double-header clutter and it breaks the personal operating-system illusion.
- The first-screen contract is improved in copy, but visually it still needs a stricter hierarchy: one next move first, then context, then capture, then module status. Anything else is noise wearing a cardigan.
- Mobile repairs are promising, but the design needs proof that the 390px first viewport shows the next move and capture without forcing the user through a dashboard inventory.

## Strongest Opportunities
- Make HQ/Today the visual anchor of the suite: one prominent daily action, one compact context row, one quiet capture affordance, and only then module status.
- Reduce module route chrome so EasyList, EasyNotes, EasyCalendar, and EasyWorkout feel like rooms in the same house, not four leased office suites.
- Standardize first-row hierarchy across core routes: compact route title, primary working area, secondary controls tucked into tabs/buttons/detail panels.
- Use fewer panels with stronger ordering instead of more cards with equal weight.
- Capture should feel fast and available, but not become the hero. The hero is "what should I do next today."

## Priority Fix
Fix the protected HQ/Today first viewport proof next. The next design task should capture and inspect HQ desktop and 390px mobile, then tighten the visible order so the user sees one daily next action first, a short today context second, and quick capture as a clear but subordinate action. Do not add sections. Do not add explanation. Prove the spine on the screen that matters.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: Today/HQ hierarchy is moving in the right direction, but visual proof of the active spine is still incomplete and module routes still feel too standalone.

## Designer Handoff
Next implementer: stay on Pack 1 and treat HQ/Today like the front desk of the whole product. Keep the calmer tokens, the compact context, and the secondary capture direction. Change the first viewport so it has a decisive reading order: daily action, today context, capture, module status. Suppress any repeated route labels, explanatory wrappers, or page-intro bands that compete with the real workflow. The user should feel, within three seconds, "I know what matters today and where to put the next thing."

## What Not To Do Next
- Do not add another dashboard section to solve hierarchy.
- Do not make capture larger than the next-best-move card.
- Do not polish secondary module pages before visually proving HQ/Today.
- Do not add product-marketing language inside the signed-in app.
- Do not use more cards to create structure; use spacing, order, and disclosure.
- Do not ignore mobile just because the automated visual report is green.

## Next 5 Design Tasks
- [ ] Capture fresh HQ/Today desktop and 390px mobile screenshots; guardrail: no app behavior changes, evidence only.
- [ ] Remove or quiet one repeated HQ/route label if the shell and page both name the same thing; guardrail: no routing or auth edits.
- [ ] Tighten the HQ first viewport order to next move, context, capture, module status; guardrail: no new sections or new data sources.
- [ ] Reduce one module route intro/header band so it feels subordinate to the shared suite shell; guardrail: preserve all existing controls.
- [ ] Verify mobile HQ has no cramped tap targets, clipped text, or forced dashboard dump above the fold; guardrail: CSS/layout only.

## Stop Or Continue
continue but fix visual issues first