# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is finally starting to behave like one calm suite, but the first screens still talk too much and make the user sort through page furniture before they feel the daily assistant.

## Mission Fit
The current direction matches the mission in fragments: shared navigation, calmer module surfaces, and more restrained language are moving EasyLife toward a connected personal operating system. The miss is information staging. Pack 1 is Product Spine, and the spine is still soft because HQ, Settings, and the module first screens expose too many headings, controls, and explanatory layers before the user gets one clear daily next action.

## Taste Check
The stronger work is the subtraction: less brochure noise, slightly quieter navigation, and more consistent module polish. That is the right taste lane for EasyLife: practical, tactile, not trying to be a startup landing page in a blazer.

What still feels off is the dashboard instinct. Six headings above the fold on multiple app routes is not "productive"; it is a committee meeting. Settings is the worst offender with 203 words and 12 controls above the fold, which makes the control center feel like paperwork instead of calm command.

## Visual Problems To Fix
- Settings overloads the first viewport with too many words and too many controls, directly violating the information-staging contract.
- The root, EasyList, EasyNotes, EasyCalendar, and EasyWorkout screens each show too many competing headings above the fold, so the visual hierarchy becomes a stack of section intros instead of one daily job.
- The product still has repeated page identity behavior: app shell, route title, module intro, and local panels all restate where the user is instead of getting them into the task.
- Route chrome is quieter than before, but it still competes with the actual working surface on customer-facing and protected routes.
- Module cards are visually related now, but several first screens still read as inventories of available features rather than a staged assistant workflow.
- Mobile confidence is not yet proven enough from the summary; screenshots exist, but the recurring desktop heading overload suggests mobile likely inherits cramped hierarchy unless deliberately checked.

## Strongest Opportunities
- Make HQ the unmistakable daily start: one next action, today context, and compact module status, no feature catalog energy.
- Turn Settings into a quiet control center by grouping secondary controls behind fewer visible sections.
- Standardize module first screens around a single top hierarchy pattern: title, one useful next action, compact status, then details below.
- Reduce repeated labels and intro copy across AppHeader and route headers so navigation feels like infrastructure, not a second product page.
- Use progressive disclosure more aggressively: detail rows, metadata, and helper explanations should appear after the user chooses a module or opens a panel.

## Priority Fix
Fix the first-screen hierarchy across the protected app, starting with Settings and then the repeated six-heading pattern on root and core module routes. The next task should not add sections, previews, or copy polish; it should remove or demote visible headings, helper text, and secondary controls until the first viewport has one dominant daily job, one obvious action, and only compact status signals. This is the Product Spine blocker.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: visible cohesion improved, but first-screen overload and repeated chrome still prevent a strong personal operating system spine.

## Designer Handoff
For the next batch, act like an editor, not a decorator. Keep the current calm visual system, shared nav direction, and module relationships. Change the first-screen structure: reduce headings, compress or hide secondary controls, and make the top of each protected route answer "what should I do next today?" before it explains the module. The user should feel guided, not briefed.

## What Not To Do Next
- Do not add another dashboard section to solve a hierarchy problem.
- Do not create more chips, pills, badges, or status labels above the fold.
- Do not broaden into backend, auth, integrations, packages, or architecture.
- Do not polish marketing pages while the protected first screen still feels overloaded.
- Do not treat copy cleanup as a substitute for visual staging.
- Do not ignore mobile; every reduced first screen needs a 390px check.

## Next 5 Design Tasks
- [ ] Settings first-screen reduction: reduce above-the-fold controls and helper copy so Settings opens as a calm control center with one primary settings group visible; do not change settings behavior or add new options.
- [ ] Root HQ hierarchy pass: reduce competing headings above the fold and make one daily next action visually dominant; preserve existing routes and data.
- [ ] EasyList first-screen staging: demote one repeated heading or secondary status group so the next task action reads first; no logic or persistence changes.
- [ ] EasyNotes first-screen staging: make capture or recent review the first readable job and move metadata/detail language lower; keep editor behavior unchanged.
- [ ] EasyCalendar first-screen staging: reduce competing headings in the planning view so today or the next calendar decision leads; do not touch recurrence or calendar data behavior.

## Stop Or Continue
continue but fix visual issues first