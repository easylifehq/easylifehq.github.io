# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is finally speaking in one product voice, but the interface still looks like a polished concept deck wearing an app costume.

## Mission Fit
The direction mostly matches the mission: connected personal operating system, calmer module language, and a clearer Today/Capture/Plan/Notes/More model. The weak point is that several surfaces still present themselves as product explanations instead of working tools. The public product pages are coherent, but the signed-in app needs more "what do I do next today" and less "here is what this module is."

## Taste Check
The restrained green, graphite type, soft panels, and consistent rounded card language feel more intentional than earlier batches. The suite is starting to look related across Calendar, List, Notes, Workout, and Settings.

What is off: the hierarchy is inflated. Huge headings, heavy cards, repeated pills, and feature-section labels make practical app surfaces feel like marketing pages. Settings in particular is too loud for a control center. The nav compression on desktop is visibly awkward, and the mobile settings page becomes a stack of oversized blocks instead of a calm setup surface. This is not broken, but it is still trying too hard.

## Visual Problems To Fix
- Settings desktop header has a compressed app nav: the brand mark crowds or overlaps the first nav item, making the shell look unfinished.
- Settings nav tap targets are too small on desktop and the brand target is too small on mobile, which makes the main suite chrome feel less trustworthy.
- Settings first screen uses oversized "Settings" hierarchy and stacked cards, so the control center feels heavier than the actual daily assistant job.
- Mobile product pages push the preview/status panel too far down after large hero copy, so the first viewport reads like a sales page before it reads like a useful module.
- Feature tags under the hero compete with the primary "Open workspace" action; they are visually cute, but they add noise before the user has done anything.
- Repeated page identity is still present in softer form: top brand "Daily Workspace / EasyLifeHQ" plus large product labels like EasyCalendar, EasyList, EasyNotes, and EasyWorkout creates a wrapper-plus-demo feeling on customer-facing routes.
- The grid background is quiet but too present across long pages; paired with many bordered cards, it can make the system feel more like a wireframe board than a finished product.
- EasyNotes emits a manifest icon warning in visual QA. It is not a taste issue, but console noise during visual review lowers confidence.

## Strongest Opportunities
- Make the protected app shell quieter and more usable: fix nav sizing first, then let Today carry the product identity.
- Reduce first-screen explanation on module pages and bring the functional preview/status content higher.
- Treat Settings as a compact control panel, not a landing page: smaller title, tighter summary cards, fewer loud containers.
- Consolidate pills and helper labels into quieter secondary metadata so the primary action wins.
- Use one shared module page rhythm across List, Notes, Calendar, and Workout: title, one useful action, compact state, then details below.

## Priority Fix
Fix the app shell/nav and Settings hierarchy before adding any new surface. The next implementer should make the Today/Capture/Plan/Notes/More navigation physically comfortable, non-overlapping, and visually quiet on desktop and mobile, then reduce the Settings first screen so it feels like a control center with one clear current state instead of a full marketing-style intro panel.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: AI Personal Assistant Stage 0 - Salvage Audit; REASON: suite voice and consistency improved, but first-screen restraint and app-shell polish are still not ready.

## Designer Handoff
Keep the tactile green/graphite direction, the calm panel language, and the Today/Capture/Plan/Notes/More model. Change the scale and staging: shrink loud headings inside the working app, make nav controls hit the 44px comfort standard without crowding, and move secondary explanation behind accordions or lower sections. The user should feel like they opened a composed personal assistant, not a brochure that keeps explaining itself.

## What Not To Do Next
- Do not add another dashboard section, status row, or assistant preview.
- Do not introduce more feature pills to solve hierarchy.
- Do not expand the AI assistant story with fake intelligence or broader claims.
- Do not redesign every module at once; fix the shell and Settings first.
- Do not ignore mobile just because desktop looks acceptable.
- Do not change backend, auth, Firebase, package files, deployment, analytics, or data behavior.

## Next 5 Design Tasks
- [ ] Fix AppHeader nav sizing on Settings so brand and Today/Capture/Plan/Notes/More never overlap; keep labels unchanged and do not touch routing.
- [ ] Increase Settings header tap targets to at least 44px high on desktop and mobile; keep the visual treatment quiet and avoid adding new buttons.
- [ ] Reduce Settings first-screen hierarchy by tightening title scale, spacing, and summary card weight; do not add new settings sections.
- [ ] Move or soften feature pills on one product page so "Open workspace" is the clear primary action; keep the existing content and route behavior.
- [ ] Repair the EasyNotes manifest icon warning if it can be fixed with asset/reference cleanup only; do not touch package files, deployment config, or app logic.

## Stop Or Continue
continue but fix visual issues first