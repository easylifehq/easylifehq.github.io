# Simon Design Review

## Verdict
RED

## One-Sentence Read
The surfaces are cleaner than before, but EasyLife is still behaving like a polished marketing brochure while one core product area, Settings, is literally a blank wall.

## Mission Fit
The direction partially matches the mission: the teal system, repeated card language, softened surfaces, and shared page rhythm are starting to make EasyLife feel like one suite. But the mission is a connected personal operating system, not four product landing pages with matching hero copy. The visible screenshots sell EasyList, EasyNotes, EasyCalendar, and EasyWorkout instead of showing the user what needs attention, what is scheduled, what was captured, and what to do next. Settings is the worst miss: the current inspected `/settings` view renders blank with route warnings, so the "control center for the suite" is absent.

## Taste Check
The best part is the restraint: typography is bold, spacing is calmer, the muted mint surface system has a recognizable identity, and the desktop hero/cards feel composed. The chips and panels are consistent enough to suggest a real design system.

The weak part is hierarchy discipline. Everything is oversized, padded, and slogan-heavy. On mobile, the hero card turns into a long promotional scroll with huge chips and massive empty top space; it feels expensive for the first 500 pixels and then starts billing the user rent. The product pages have taste, but they do not yet have enough utility. Settings being blank takes the whole suite from "premium in progress" to "not trustworthy yet."

## Visual Problems To Fix
- `/settings` renders as an empty pale screen in both desktop and mobile screenshots, with console warnings that no route matched `/settings`.
- The mobile header area leaves a very large empty band before content, making the first usable content feel pushed too far down.
- Mobile chips are too large and too pillowy; they compete with primary actions and create a toy-like rhythm.
- Product pages rely on nearly identical hero structures, so EasyList, EasyNotes, EasyCalendar, and EasyWorkout feel like themed landing pages rather than operational tools.
- Desktop hero H1s are oversized enough that they dominate the page at the expense of actual app usefulness.
- The right-side desktop feature panel repeats "EasyLifeHQ product" across pages, which reads like placeholder label design, not premium product language.
- The mint background grid is pleasant but too visible across all product pages; it risks becoming the personality instead of supporting the work.
- Feature cards below the fold are clean but generic: uppercase eyebrow, bold heading, paragraph, repeat. Very SaaS showroom. Very "we bought the template and watered it."

## Strongest Opportunities
- Turn the top product surfaces from marketing into command surfaces: show today, next, recent, open loops, or a small live preview instead of only selling the concept.
- Give each app one signature visual behavior while keeping shared shell rules: calendar can show time density, list can show triage lanes, notes can show writing focus, workout can show set logging.
- Make Settings visibly feel like the suite control center with grouped panels, theme preview, personalization controls, and clear "applies across EasyLife" language.
- Tighten mobile vertical rhythm so the first screen gives the user identity, purpose, and one useful action without making them scroll through a billboard.
- Reduce chip dominance and use smaller metadata treatments so primary actions and actual content regain authority.

## Priority Fix
Fix the missing Settings experience first. A connected personal operating system cannot ship a blank control center, and visual QA already has hard evidence on desktop and mobile. Nami should make the existing Settings route render the intended SettingsPage at the inspected path, then verify the page has a real header, grouped settings panels, no console route warning, and a usable mobile first screen. No new settings behavior. No auth. No persistence changes. Just make the control center exist and look composed.

## Designer Handoff
Next batch should be repair-first, not expansion. Keep the current mint/teal identity, restrained borders, soft panels, and shared typography because there is a recognizable suite language forming. Change the surfaces that feel like promotional landing pages: reduce the hero weight, make chips smaller and more metadata-like, and introduce one practical preview or dashboard-like content block per app so the user feels "I can run my day here," not "I am being pitched software." Settings must come back as a calm control center with clear grouping and tighter mobile spacing. The result should feel useful within five seconds, not merely handsome.

## What Not To Do Next
- Do not add more sections below these pages; the problem is usefulness and hierarchy, not page length.
- Do not add more decorative gradients, glow, grid, or chip treatments to make the design feel "premium."
- Do not start a broad app redesign while `/settings` is blank.
- Do not make the mobile experience taller and more dramatic; make it denser, clearer, and faster.
- Do not touch backend, auth, persistence, packages, deployment, or secrets.
- Do not solve the route warning by hiding the warning while leaving the page visually empty.

## Next 5 Design Tasks
- [ ] Fix `/settings` visual QA so the inspected Settings path renders the existing Settings page on desktop and mobile, with no route warning and no auth, persistence, backend, dependency, or broad routing rewrite.
- [ ] Tighten mobile top spacing across the product surfaces so content begins sooner while preserving the current brand header and avoiding overlap or wrapping.
- [ ] Reduce mobile chip size and spacing on one product page first, using smaller metadata styling while keeping tap targets and text legibility intact.
- [ ] Replace the repeated "EasyLifeHQ product" label in one hero side panel with app-specific suite language that feels intentional and not placeholder-like.
- [ ] Convert one below-fold feature-card row into a more practical preview-style section, keeping behavior unchanged and avoiding new data, routing, or architecture work.

## Stop Or Continue
continue but fix visual issues first