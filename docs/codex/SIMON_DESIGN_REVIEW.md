# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife looks calmer and more coherent than before, but the evidence still shows a brochure-first product wrapper when the mission is a daily personal operating system.

## Mission Fit
The direction partially matches the mission: shared typography, teal accents, softer surfaces, and consistent module language are starting to make EasyLife feel like one suite. The problem is that the visible proof is mostly EasyList, EasyNotes, EasyCalendar, and EasyWorkout as public product pages, not the protected daily HQ surface. Pack 1 is about the product spine, and the current screenshots do not yet prove that a signed-in user can land, see today, and know the next move.

## Taste Check
The best work is the restraint: the palette is quieter, the cards are less toy-like, and the module previews have enough tactile detail to feel usable. The typography has personality without going full novelty.

What still feels off is the repeated SaaS showroom framing: top nav, big hero cards, "Start Free", "See Features", pill lists, then another feature band. It is clean, yes, but also a little too "template founder weekend." EasyLife needs to feel like the app has a job, not like each route is auditioning for a launch page.

## Visual Problems To Fix
- The customer-facing module pages repeat the same identity structure: EasyLifeHQ header, module eyebrow, hero headline, CTA pair, pills, demo card, then "Features." That repetition makes the pages feel manufactured instead of like distinct parts of one operating system.
- The visible routes still lead with marketing chrome instead of working-app intent. "Start Free" and "See Features" dominate screenshots that should be proving product utility.
- Mobile first view is readable but vertically heavy. Huge headings, large body copy, CTAs, pills, and the demo preview stack before the user sees much substance.
- The top mobile header is oversized for what it does. It consumes premium first-screen space while offering only brand identity.
- Desktop layouts have a large dead band between the nav and hero content. It creates showroom spacing instead of fast personal-assistant pacing.
- The module demo cards are useful, but their internal rows are visually loud on mobile. Labels and values compete at the same weight, especially in EasyList and EasyWorkout.
- The repeated "Features" section lands too soon and too loudly. It turns each module into a feature pitch instead of letting the product example carry the page.
- HQ first-screen screenshots are missing, so confidence is lower on whether the active Pack 1 spine is actually working.

## Strongest Opportunities
- Make the protected HQ route the main proof point: one daily next action, today context, and compact module status above any module inventory.
- Reduce marketing CTAs on module pages and let the module preview become the hero action.
- Turn repeated feature bands into quieter supporting sections or tabs so the first screen breathes.
- Tighten mobile scale: keep the strong headline style, but reduce vertical stacking and make the preview visible earlier.
- Create a more connected suite signal by showing cross-module continuity: a task becoming a calendar block, a note becoming an EasyList draft, a workout session becoming today status.

## Priority Fix
The single most important design problem is the mismatch between Pack 1 and the visible proof: the branch is still showing polished module marketing pages while the mission requires a protected daily start surface. Next, inspect and repair HQ first. The first viewport must show one clear next action, today's context, and compact statuses for List, Notes, Calendar, and Workout before any product explanation or directory behavior. Until that is visible, the spine is a rumor in a nice sweater.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: calmer visual tokens and module consistency are real progress, but the active HQ spine is still under-proven and the visible routes remain too marketing-led.

## Designer Handoff
Keep the current restrained palette, rounded surfaces, strong black headings, and teal action color. Change the hierarchy: make EasyLife feel like a signed-in assistant first and a product brochure second. On HQ, compress the shell, place one daily action at the top, show today context immediately, and make module status cards small, scannable, and clearly connected. On public/module pages, quiet the route chrome and reduce repeated CTA/pill/feature scaffolding so the product example feels like the page, not an illustration inside the page. The user should feel "I know what to do next today," not "I have reached the feature tour."

## What Not To Do Next
- Do not add more sections to the module pages.
- Do not add new dashboards, charts, or decorative cards to make the app feel bigger.
- Do not keep polishing public route marketing while HQ first-screen proof is missing.
- Do not solve this with more copy. The issue is hierarchy and staging.
- Do not touch backend, auth behavior, Firebase, packages, deployment, or data architecture.
- Do not ignore mobile just because the automated visual report is green.

## Next 5 Design Tasks
- [ ] Inspect the protected HQ desktop and 390px mobile first viewport; make one small UI-only adjustment so one daily next action appears before module inventory or explanatory copy.
- [ ] Reduce the HQ header or top spacing on mobile by one narrow CSS/layout pass; guardrail: no route, auth, data, or persistence changes.
- [ ] On one module page, replace the loud CTA-first hero emphasis with a quieter product-preview-first hierarchy; guardrail: preserve existing links and behavior.
- [ ] Normalize demo-card row hierarchy on mobile so labels are secondary and values are primary; guardrail: apply to one component or one route only.
- [ ] Remove or collapse one repeated "Features" intro band from a visible route; guardrail: no new section, no new feature claims, no broad redesign.

## Stop Or Continue
continue but fix visual issues first