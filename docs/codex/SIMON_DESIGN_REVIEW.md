# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is starting to sound like a personal assistant suite, but visually it still behaves like a collection of polished module pages with small chrome and hierarchy debts nibbling at the calm.

## Mission Fit
The current direction mostly matches the mission: Today, Capture, Plan, and Notes are being pulled toward one assistant loop instead of separate utilities. That is the right move. The miss is discipline: the active pack says Stage 0 salvage audit, but the branch is already changing app surfaces, so the work feels useful but slightly ahead of its own operating contract. The product needs one clearer daily start surface and quieter module navigation before more assistant language is added.

## Taste Check
The better parts are the move toward "capture -> plan -> remember" language, the calmer Notes-as-memory framing, and the attempt to make Calendar feel like a day plan rather than a dense calendar product. That is current, useful, and closer to a personal operating system.

What still feels off: the shell is not yet elegant enough to carry the concept. Small tap targets in Settings navigation make the suite feel less premium, and repeated route chrome risks turning the app into a tour of labels instead of a tool. The assistant idea is promising; the visual system is still wearing a conference badge.

## Visual Problems To Fix
- Settings navigation has multiple undersized tap targets on desktop and mobile, including Today, Capture, Plan, and Notes links. A personal operating system cannot have fussy primary navigation.
- The site brand target is also reported too small, which weakens the header as a reliable suite anchor.
- Module routes still risk feeling like destination pages with their own identities rather than one connected assistant surface.
- The first-screen hierarchy is improved in language, but the product still needs stricter progressive disclosure: one daily next action first, then compact module status, then deeper controls.
- The branch has many touched surfaces for a Stage 0 active pack, which creates a visible design governance problem: the product is being shaped before the audit stage is cleanly closed.
- Calendar and Notes improvements appear narrow and sane, but the screenshots/report evidence still does not prove the whole shell has achieved one calm visual rhythm across desktop and mobile.
- Settings is becoming the obvious weak link because navigation quality issues appear there first. That is not the room where the walls should wobble.

## Strongest Opportunities
- Make the protected app shell feel like one object: consistent nav height, target size, active state, spacing, and page header rhythm across Today, Capture, Plan, Notes, Workout, and Settings.
- Reduce route chrome before adding content. Let Today be the assistant start, and let module pages support it with concise, task-specific surfaces.
- Treat Settings as a suite control center, not an afterthought. Cleaner navigation there will make the whole product feel more credible.
- Push the assistant loop visually, not only verbally: Capture, Plan, and Remember should share repeated layout patterns, not just related copy.
- Use mobile as the taste test. If the primary nav feels tiny or cramped on mobile, the product is not calm yet.

## Priority Fix
Fix the shared app navigation target sizing and shell rhythm first, especially on Settings. Make every primary nav item meet comfortable touch dimensions without making the header louder, preserve the current route structure, and keep the active state quiet but unmistakable. This is the single highest-leverage repair because it improves trust, mobile comfort, suite cohesion, and visual polish without inventing new product scope.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: AI Personal Assistant Stage 0 - Salvage Audit; REASON: assistant language is clearer, but shell polish and pack discipline are still not strong enough.

## Designer Handoff
Next implementer: do a restraint pass on the shared shell, not a new feature pass. Keep the assistant loop language that now connects Today, Capture, Plan, and Notes. Keep the calmer Notes and Calendar direction. Change the navigation ergonomics, header spacing, and route chrome so the app feels like one composed product rather than a sequence of repaired screens. The user should feel, within five seconds, "I know what to do next today, and everything else is nearby but not shouting."

## What Not To Do Next
- Do not add another assistant panel, dashboard card, or feature inventory.
- Do not add more product explanation to compensate for weak hierarchy.
- Do not broaden the Calendar or HQ work again; the previous quarantine pattern already warned you.
- Do not touch backend, auth, AI integrations, persistence, package files, or deployment.
- Do not ignore mobile tap comfort because the desktop looks acceptable.
- Do not make the header taller and louder just to satisfy tap targets; solve it with proportion, padding, and rhythm.

## Next 5 Design Tasks
- [ ] Increase shared app nav hit areas to comfortable desktop and mobile sizes while keeping the header visually quiet; do not change routes, auth, data, or copy scope.
- [ ] Review Settings first viewport and reduce any duplicated header or route-label chrome; keep Settings as a control center, not a brochure.
- [ ] Align active nav styling across Today, Capture, Plan, Notes, Workout, and Settings with one restrained pattern; no new colors or decorative treatments.
- [ ] Inspect Today, Capture, Plan, and Notes mobile screenshots for cramped controls or stacked chrome; fix only one visible spacing issue per route.
- [ ] Update the design/report docs to reconcile the active Stage 0 label with the app-surface work already completed; keep it factual and short.

## Stop Or Continue
continue but fix visual issues first