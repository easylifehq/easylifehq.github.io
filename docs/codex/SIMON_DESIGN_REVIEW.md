# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is cleaner and more coherent, but it still looks like a disciplined template wearing five product names instead of one decisive personal workspace.

## Mission Fit
The direction supports Pack 1 - Product Spine: navigation, product language, spacing, and module framing are more consistent across EasyList, EasyNotes, EasyCalendar, and EasyWorkout. The mission is only partially fulfilled because the visible screenshots still emphasize marketing/product hero pages more than the signed-in operating spine, and the suite does not yet make "where do I start today?" feel inevitable.

## Taste Check
The restrained teal, soft grid, strong typography, and quieter copy are moving in the right direction. The product now feels calmer and less startup-confetti.

What is off: too many rounded panels, pills, bordered samples, and repeated two-column hero formulas. The hierarchy is tidy, but not sharp. The cards behave like a committee. Premium personal software needs a stronger lead surface, fewer decorative containers, and more useful information density above the fold.

## Visual Problems To Fix
- The product pages repeat the same hero-card plus demo-card layout so aggressively that modules feel reskinned, not meaningfully distinct.
- Mobile screenshots show oversized typography and tall card stacks that push functional proof far below the first viewport.
- Pills and bordered chips compete with primary CTAs; they add texture but not much decision value.
- Demo panels use the same soft aqua treatment everywhere, making the suite feel monochrome and slightly sleepy.
- The nav/header is polished but generic; it does not yet communicate a logged-in daily workspace or product spine.
- The main screenshots available are mostly marketing/product views, so confidence is lower on the protected HQ hierarchy repair.

## Strongest Opportunities
- Make HQ the unmistakable product spine: one dominant daily-focus area, one clear next action, and compact cross-module status below it.
- Reduce chrome by turning secondary cards into quieter rows, dividers, or inline summaries.
- Give each core module one signature visual behavior while keeping shared spacing and typography.
- Tighten mobile first screens so the user sees action, not just brand, copy, chips, and a sample card.
- Use content hierarchy instead of container hierarchy: fewer boxes, stronger headings, clearer primary data.

## Priority Fix
Fix the signed-in HQ first screen before adding any more polish elsewhere. It needs to read as the suite cockpit in the first viewport: today, next action, waiting items, schedule pressure, and quick capture should have an obvious order. Quiet the secondary panels, reduce pill/card noise, and make the main workspace feel like the place a user begins the day, not another attractive brochure section.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: consistency and calm improved, but the product spine still lacks a commanding signed-in first screen.

## Designer Handoff
Keep the current quiet palette, rounded restraint, and concrete daily-life language. Change the hierarchy: stop giving every module the same hero-demo treatment, and make the protected HQ page the visual authority for the suite. The next batch should remove one layer of decorative chrome, compress mobile vertical rhythm, and make daily-use information appear sooner. The user should feel "I know what to do next" before they feel "this is nicely branded."

## What Not To Do Next
- Do not add more marketing sections.
- Do not create more pills, badges, or bordered mini-cards to solve hierarchy.
- Do not broaden into backend, auth, routing, package, or architecture work.
- Do not redesign every module at once.
- Do not ignore mobile vertical bloat.
- Do not keep polishing product pages while the signed-in HQ spine remains under-proven.

## Next 5 Design Tasks
- [ ] HQ above-fold hierarchy pass: make the primary daily-focus area visually dominant and keep supporting module summaries secondary; do not change behavior, data, routing, or persistence.
- [ ] HQ mobile compression pass: reduce vertical padding and secondary chrome so the first viewport shows the main action plus at least one useful suite status; avoid new content.
- [ ] EasyCalendar protected surface cleanup: remove or quiet one repeated card/pill treatment so scheduled content reads before decoration; no date logic or interaction changes.
- [ ] EasyList protected dashboard hierarchy pass: make capture/today/priority order clearer with spacing and weight only; do not alter task data or actions.
- [ ] Shared product-page restraint pass: reduce repeated chip density or demo-card emphasis on one marketing page while preserving the established visual system.

## Stop Or Continue
continue but fix visual issues first