# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is calmer and more coherent than before, but the first screen still behaves like a polite feature dump wearing a nice sweater.

## Mission Fit
The direction matches the EasyLife mission in broad terms: shared navigation, calmer module surfaces, and more consistent language are pushing toward one connected personal operating system. The miss is information staging. Pack 1 is about the product spine, and the current first-screen pattern still asks the user to parse too many headings, panels, and module signals before it gives them one clear thing to do today.

## Taste Check
The restrained product tone, quieter module framing, and suite-wide polish are the strongest taste signals. The app is starting to feel less like disconnected experiments and more like a professional personal workspace.

What still feels off: too many page surfaces are trying to be helpful at once. Six headings above the fold across the protected routes is not calm hierarchy; it is dashboard anxiety in a cardigan. The repeated shell/header/page intro pattern also risks making each route feel buried under its own explanation instead of immediately usable.

## Visual Problems To Fix
- The protected first screens expose too many competing headings above the fold on `/`, `/easylist`, `/easynotes`, `/easycalendar`, and `/easyworkout`.
- The app shell, route title, and module intro still stack into repeated page identity in places, making the actual working surface feel one layer too deep.
- Primary daily action hierarchy is not dominant enough; compact module status competes with the main job instead of supporting it.
- Desktop layouts are cleaner than before, but the first viewport still reads as a collection of panels rather than a guided daily start.
- Mobile confidence is decent but not complete; the same information density that feels merely busy on desktop can become cramped and heavy on a phone.
- Some recent changes touch sensitive or broad areas outside pure visual polish, which weakens trust in the design loop even when the visible result improves.

## Strongest Opportunities
- Turn HQ into the unmistakable daily start: one next action, today's context, and only a few quiet module signals.
- Demote secondary module summaries into a compact rail, tabs, or below-fold section so the first viewport has a single visual center.
- Make route chrome quieter: the app should know where the user is without announcing it three times.
- Standardize one page-header pattern across EasyList, EasyNotes, EasyCalendar, EasyWorkout, and Settings.
- Use density deliberately: fewer visible cards, stronger labels, and clearer active states will feel more premium than adding more helpful blocks.

## Priority Fix
Fix first-screen hierarchy before any new polish. On the protected HQ route, reduce above-the-fold headings to one primary page idea plus one clear next action, then demote module summaries and helper context below the fold or behind existing navigation/actions. Nami should treat this as subtraction, not redesign: remove repeated intro language, compress status cards, and make the daily action visually own the first viewport.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: suite cohesion is better, but first-screen overload still blocks the product spine.

## Designer Handoff
Next batch should be a hierarchy cleanup, not another feature or broad cohesion pass. Keep the calmer shared shell, restrained color, and more professional module tone. Change the first viewport so it feels like a personal assistant opening to today's next move: one primary action, one date/context cue, and a small number of supporting module signals. The user should feel guided, not briefed by committee.

## What Not To Do Next
- Do not add more sections to explain the suite.
- Do not add another dashboard row, metric strip, or module inventory.
- Do not make the header louder to solve navigation clarity.
- Do not polish five routes at once; fix one first-screen pattern cleanly.
- Do not touch backend, auth, Firebase, package files, deployment, or data behavior.
- Do not ignore mobile; the hierarchy repair must hold at phone width.

## Next 5 Design Tasks
- [ ] HQ first-screen hierarchy pass: reduce above-the-fold headings to one dominant page idea and one next action; do not add new cards or routes.
- [ ] App header quieting pass: remove or demote one repeated route label where the shell and page title duplicate each other; preserve navigation behavior.
- [ ] EasyList first viewport staging: keep the main task action dominant and move secondary summaries below the first screen; no logic or data changes.
- [ ] EasyCalendar first viewport staging: make today's schedule context primary and compress helper/status panels; maintain existing controls.
- [ ] Mobile density check for the repaired route: verify no cramped controls, clipped labels, or stacked heading clutter at 390px width; adjust spacing only.

## Stop Or Continue
continue but fix visual issues first