# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is finally starting to look like one calm product, but the first screens still talk too much and make the personal operating system feel buried under its own interface furniture.

## Mission Fit
The direction matches the mission in broad shape: shared shell work, calmer route patterns, and repeated suite language are moving EasyLife toward a connected personal operating system. The miss is information staging. The protected first screen is supposed to make today's next action obvious, but the current evidence still shows too many headings, too many controls, and too much route-level explanation competing before the user knows what to do next.

## Taste Check
The improved cohesion is real: the suite appears more related, quieter, and less like separate experiments stitched together. That is the right lane for EasyLife.

What still feels off is the dashboard instinct. Six headings above the fold across core routes is not calm, it is a committee meeting. Settings on mobile exposing 13 controls above the fold is especially rough: useful settings should feel controlled, not spilled. The product needs more restraint, stronger hierarchy, and fewer equal-weight panels trying to prove they belong.

## Visual Problems To Fix
- The first screen still has too many competing headings on `/`, `/easylist`, `/easynotes`, `/easycalendar`, and `/easyworkout`, which weakens the daily-start hierarchy.
- `/settings` on mobile exposes 13 interactive controls above the fold, making the control center feel busy before it feels trustworthy.
- Core app routes still lean toward module overview density instead of one clear daily job followed by secondary actions.
- The route chrome is calmer than before, but it still risks repeating the page identity instead of letting the actual product surface lead.
- The design still overuses first-screen summary panels as proof of usefulness; the user should feel guided, not briefed by five departments.
- Mobile staging remains the weak point: controls and headings appear before the layout has earned that much user attention.

## Strongest Opportunities
- Turn HQ into a true daily start surface: one next action, today context, then compact module signals.
- Reduce each module first screen to a primary action plus a small status strip; move detail into tabs, rows, drawers, or lower-page content.
- Make Settings feel like a suite control center by grouping controls into fewer visible sections with quieter secondary actions.
- Establish a tighter shared page header pattern: one title, one sentence max, one primary action, then content.
- Use visual weight more aggressively: fewer equal cards, clearer primary panel, smaller secondary modules.

## Priority Fix
Fix information staging on the first screen before adding anything else. Start with `/settings` mobile because 13 above-fold controls is the loudest evidence, then apply the same discipline to the core routes: one primary job, one obvious next action, compact status, and everything else demoted below the fold or behind existing controls. The next batch should subtract visible competition, not invent another panel.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: suite cohesion improved, but first-screen overload still blocks a strong product spine.

## Designer Handoff
Keep the calmer shared visual language and the suite-level navigation direction. Change the first-screen hierarchy: make each route feel like it knows the user's immediate job, then reveal the rest progressively. Settings should become quieter and more grouped, not more explanatory. The result should feel like opening a personal assistant that already knows what matters today, not a control room asking the user to scan every switch.

## What Not To Do Next
- Do not add more dashboard sections to prove the suite is connected.
- Do not solve this with new colors, gradients, icons, or decorative polish.
- Do not add more route intro copy; reduce and sharpen what is already there.
- Do not expand backend, auth, settings behavior, or data scope.
- Do not ignore mobile; mobile is where the hierarchy problem becomes obvious.
- Do not treat low visual bug severity as permission to keep the clutter.

## Next 5 Design Tasks
- [ ] Reduce `/settings?visualQa=1` mobile above-fold controls to the primary setting action plus compact grouped entry points; do not change settings behavior.
- [ ] Simplify the HQ first screen to one daily next action, today context, and compact module status; do not add new modules or claims.
- [ ] On `/easylist?visualQa=1`, remove or demote one competing above-fold heading so the main list action owns the first viewport.
- [ ] On `/easynotes?visualQa=1`, compress secondary note/library detail below the first-screen primary capture or review action.
- [ ] On `/easycalendar?visualQa=1`, reduce above-fold heading competition and keep the next scheduled block or planning action visually dominant.

## Stop Or Continue
continue but fix visual issues first