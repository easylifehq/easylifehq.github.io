# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is cleaner and more coherent, but the evidence still shows a polished product brochure more than a protected daily operating surface.

## Mission Fit
The direction partially matches the mission: shared styling, tone, spacing, and product family cues are becoming more consistent across EasyList, EasyNotes, EasyCalendar, and EasyWorkout. The weak point is mission priority one: Pack 1 is about the product spine, and the current screenshots mostly prove public module pages, not the signed-in HQ first screen where the user should know what to do next today. Confidence is lower because the key HQ surface lacks direct screenshot proof.

## Taste Check
The best parts are the restrained palette, confident type scale, tactile panels, and clearer app-specific value props. It looks calmer than generic SaaS wallpaper.

The off part is hierarchy discipline. Every module page repeats the same formula: big brand chrome, huge hero, CTA buttons, chips, feature section. It is handsome, yes, but also a little showroom-floor. EasyLife is supposed to feel like a personal operating system, not four landing pages wearing the same blazer.

## Visual Problems To Fix
- The latest visual evidence does not show the protected HQ route, even though the changed file is `HQPage.tsx`; that makes the main design claim under-proven.
- Public module pages still lead with marketing CTAs like "Start Free" and "See Features", which competes with the working-app mission when judging EasyLife as a daily personal assistant.
- The first viewport on module pages is dominated by oversized hero cards and feature chips before the product behavior becomes tangible.
- Desktop pages have a strong repeated identity stack: global brand bar, module eyebrow, huge headline, CTA row, chip row, demo panel, then another "Features" intro band. It is orderly, but it repeats page identity instead of moving the user forward.
- Mobile pages are usable, but the hero content is tall enough that the first actionable product detail sits too low; the user gets a billboard before the workflow.
- The pale grid background and repeated white cards are consistent, but the system risks becoming visually samey across modules without stronger route-specific information hierarchy.
- The demo panels look polished, but they are mostly static proof cards; they do not yet communicate connected suite behavior strongly enough.

## Strongest Opportunities
- Show the protected HQ route directly and make it the review anchor: one next action, today context, compact module status, then quiet navigation.
- Reduce public/module route chrome so the actual product behavior appears sooner, especially on mobile.
- Convert repeated module hero structure into a tighter suite pattern: headline, one concrete workflow preview, one primary action, fewer chips.
- Make cross-module connection visible through status language, not more sections: task to calendar, note to task, workout to today.
- Keep the current tactile panel language, but give the HQ surface more authority than the marketing pages.

## Priority Fix
Prove and refine the protected HQ first viewport. The next batch should capture desktop and 390px mobile screenshots of the HQ opening route, then reduce any chrome that competes with the daily next action. The user should see "what matters today" before product explanation, module inventory, or decorative suite framing. No more designing around the brochure while the cockpit is off-camera.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: the today-first work is aimed at the right mission, but visual proof is incomplete and the visible routes still over-index on marketing chrome.

## Designer Handoff
Keep the quiet teal system, card tactility, strong type, and concrete life-management language. Change the hierarchy: the protected HQ route must become the design source of truth, with one dominant daily action and only compact signals from Tasks, Notes, Calendar, Workout, and Settings. Public/module pages can remain polished, but they should stop behaving like separate landing pages and start feeling like doors into one product. The result should feel less like "choose a feature" and more like "open EasyLife, know the day, act."

## What Not To Do Next
- Do not add more sections to the module pages.
- Do not add a bigger dashboard, more cards, or more status widgets to HQ.
- Do not solve this with new colors, gradients, mascots, or decorative motion.
- Do not start Phase 2 while the Pack 1 first-screen proof is still incomplete.
- Do not touch backend, auth, package files, routing behavior, or persistence to make the design look finished.
- Do not ignore mobile; the current mobile pages are functional but too tall before the useful proof appears.

## Next 5 Design Tasks
- [ ] Capture HQ desktop and 390px mobile screenshots after loading the protected opening route; do not change code in this task.
- [ ] On HQ only, reduce above-the-fold chrome until one daily next action is visually dominant; preserve all routes and data behavior.
- [ ] On HQ only, compress secondary module status into a compact row or panel below the primary action; avoid adding new cards.
- [ ] On one public module page, shorten the hero chip/CTA area so the workflow preview appears higher on mobile; keep copy meaning and tap targets intact.
- [ ] Review the shell/header labels for repeated identity on customer-facing routes; remove or quiet one duplicated label without changing navigation.

## Stop Or Continue
continue but fix visual issues first