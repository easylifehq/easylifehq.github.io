# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is cleaner than before, but it still feels like a polished collection of modules instead of one calm daily operating spine.

## Mission Fit
The direction partially matches the mission: Notes, List, Calendar, and Workout are gaining shared polish and calmer micro-hierarchy, which supports the connected-suite goal. The miss is still the first-screen contract. Pack 1 is about product spine, and the current direction keeps improving feature surfaces while the user still needs a stronger "what should I do next today" center of gravity.

## Taste Check
The best parts are the quieter Notes work, the recent/stale memory cue, and the move toward practical daily language instead of shiny SaaS theater. That feels more personal assistant, less pitch deck.

The weaker parts are structural. The suite still leans on module presentation, stacked panels, and feature-area polish as the main design story. It is neat, but neat is not enough. A tidy toolbox is still a toolbox.

## Visual Problems To Fix
- The protected first screen still appears to compete between daily guidance and module access instead of making one next action unmistakably dominant.
- Module surfaces look more related, but the relationship is mostly style-level: cards, spacing, and copy tone, not a clear operating-system hierarchy.
- EasyNotes improvements help, but Notes now risks becoming its own mini-dashboard rather than feeding the central daily flow.
- Secondary actions are still visually loud in places where they should sit behind the primary daily job.
- Route-level identity and feature labels still feel heavier than necessary; EasyLife should not need to keep announcing each room while the user is trying to work.
- The visual QA reports show no blocking layout bugs, but the recurring review signal says the same thing: the chrome is clean, the product spine is still underpowered.
- The changed-file set includes broad app surfaces and an auth route, which is not a visual flaw by itself, but it makes this batch feel less disciplined than the mission requires.

## Strongest Opportunities
- Turn HQ into a true daily start surface: one next action, one compact today context row, and only three or four quiet module signals.
- Make Notes visibly feed Today with a restrained "capture became follow-up" pattern, rather than making Notes carry the whole workflow story.
- Reduce module chrome and repeated labels so each route feels like part of one suite, not a separate product demo.
- Use progressive disclosure harder: primary action up front, details behind rows, tabs, drawers, or existing routes.
- Create one shared first-screen rhythm across List, Notes, Calendar, and Workout: header, primary job, compact status, then detail.

## Priority Fix
Fix the HQ first-screen hierarchy before adding another module enhancement. The next task should reduce visible chrome and module-directory energy on the signed-in start surface: make the daily next action the largest, clearest object on the page; compress module status into quieter supporting signals; and move explanatory or feature-inventory content below the fold or behind existing actions.

## Magic Improvement Score
SCORE: 2; DIRECTION: flat; ACTIVE_PACK: Pack 1 - Product Spine; REASON: Notes polish improved locally, but Pack 1 is still blocked by a module-first spine instead of a daily operating start.

## Designer Handoff
Next implementer: work like an editor, not a decorator. Keep the calmer visual language, the useful Notes affordances, and the restrained copy. Change the hierarchy of the signed-in experience so HQ feels like the assistant waking up with the user: one recommended action, today's context, and compact signals from the suite. Suppress anything that reads like a feature tour, status buffet, or internal product inventory. The result should feel like "I know what to do now," not "Here are the apps I own."

## What Not To Do Next
- Do not add another section to prove the suite is connected.
- Do not make more dashboard cards until the first daily action is visually dominant.
- Do not increase color, badges, shadows, or decorative contrast to create excitement.
- Do not keep polishing individual modules while the HQ spine stays unresolved.
- Do not touch auth, backend, Firebase, package files, deployment, or data behavior.
- Do not ignore mobile; the hierarchy has to survive the narrow viewport first.

## Next 5 Design Tasks
- [ ] Tighten HQ first screen to one dominant daily next action, with no new routes, no backend changes, and no added feature inventory.
- [ ] Compress module status on HQ into a single quiet row or compact cluster, keeping labels short and avoiding stacked dashboard cards.
- [ ] Reduce repeated route identity chrome on one customer-visible app route, preserving navigation but making the working surface feel less buried.
- [ ] Make the Notes-to-action cue feed the daily flow visually without adding persistence, automation claims, or extra controls.
- [ ] Audit one mobile screenshot after the HQ hierarchy change and fix only clipped, cramped, or competing first-screen elements.

## Stop Or Continue
continue but fix visual issues first