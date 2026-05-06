# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is cleaner and more consistent, but it is still dressing like a product brochure when the mission is a calm daily operating system.

## Mission Fit
The direction partially matches the mission: the shared header, spacing, card rhythm, and teal identity are making the suite feel more connected across EasyList, EasyNotes, EasyCalendar, and EasyWorkout. The problem is priority. The inspected screens still lead with marketing-style route pages, big claims, feature chips, and "Start Free" calls instead of the signed-in user's first useful daily action. For Pack 1 - Product Spine, that is not fatal, but it is not done.

## Taste Check
The strongest taste move is restraint: soft green-gray background, rounded but not childish panels, clearer module identity, and enough whitespace to feel calmer than the old scattered-app problem. Mobile is more comfortable than before, especially on tap targets and stacked demo panels.

What is off: the hierarchy is too sales-page, too samey, and too loud. Every product route has the same oversized H1, the same pill parade, the same feature band, and the same "Start Free" rhythm. It is polished, yes, but polished like a template got a spa day. The actual personal operating system still feels behind the curtain.

## Visual Problems To Fix
- The customer-facing product routes repeat the same page identity pattern: global EasyLifeHQ header, module eyebrow, huge module headline, repeated feature intro band, then more cards. It makes each module feel like a brochure page instead of part of one living suite.
- The first viewport on product routes is dominated by marketing CTAs and feature chips, not a working daily action or connected module status.
- "Start Free" appears across signed-in product-style surfaces and competes with the app mission; it reads like acquisition chrome, not a personal operating system.
- The module pages use nearly identical hero/card compositions, so EasyList, EasyCalendar, EasyNotes, and EasyWorkout feel visually related but not behaviorally distinct.
- Mobile type is comfortable but heavy; the H1s consume too much vertical space before the user reaches the useful example state.
- Demo cards are clear but too explanatory. The right-side panels describe the concept instead of feeling like real, active product surfaces.
- Feature sections are still too prominent in the scroll. The user gets "why this exists" before enough "what should I do now."
- The automated visual report is clean, but screenshots provided are mostly route/product pages; confidence is lower on the protected HQ, Settings, and full signed-in daily start experience.

## Strongest Opportunities
- Turn the protected HQ first screen into the unmistakable product spine: one next action, today context, and compact statuses from list, notes, calendar, and workout.
- Reduce route chrome so module pages feel like app workspaces first and explanation second.
- Replace repeated feature chips with quieter module-specific actions: add task, open recent note, review next block, start workout.
- Give each module one distinctive working preview pattern while keeping shared shell, spacing, and typography.
- Make mobile first screens shorter and more decisive: title, next action, compact proof, then deeper content below.
- Reserve marketing CTAs for public surfaces; signed-in routes should feel operational, not promotional.

## Priority Fix
Fix the brochure hierarchy before adding anything else. The next batch should reduce first-viewport chrome on the main module routes and especially HQ: demote or remove repeated "Start Free," feature chips, and explanatory hero weight where the user should instead see one practical next action and compact module status. Nami should treat this as subtraction, not a new dashboard invention.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: suite consistency and mobile comfort improved, but brochure hierarchy still blocks the daily operating spine.

## Designer Handoff
Keep the soft tactile system, the teal identity, the roomy cards, and the improved mobile comfort. Change the order of importance: first screen should feel like "here is what needs attention today," not "here is a product page explaining itself." Make navigation quiet, make module actions specific, and let feature explanation move below the fold or behind existing route depth. The user should feel oriented and ready to act in five seconds, not gently pitched to.

## What Not To Do Next
- Do not add more feature sections.
- Do not add another dashboard layer to explain the current dashboard layer.
- Do not make the palette richer just to fake premium.
- Do not create more product claims or public-site copy before fixing the working app hierarchy.
- Do not touch backend, auth, Firebase, packages, deployment, analytics, or data scope.
- Do not ignore mobile just because the automated visual bug report is green.
- Do not keep repeating "Start Free" on surfaces that should feel like a signed-in app.

## Next 5 Design Tasks
- [ ] Reduce module-route first-viewport chrome: remove or demote repeated feature chips and acquisition CTAs, while preserving one clear primary action per route.
- [ ] Tighten mobile hero density on one module route: keep the H1 readable but ensure the working preview appears higher without clipped text or cramped controls.
- [ ] Make HQ's first screen show one daily next action above compact module status, with no feature inventory in the first viewport.
- [ ] Differentiate one module preview pattern from the shared template while keeping the same shell, spacing scale, and button language.
- [ ] Audit visible route labels for repetition: remove double headers, repeated intro bands, or duplicate product names where global chrome already establishes identity.

## Stop Or Continue
continue but fix visual issues first