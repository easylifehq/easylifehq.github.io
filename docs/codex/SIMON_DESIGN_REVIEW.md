# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is cleaner and more coherent than before, but it still presents like a handsome product brochure arguing for itself instead of a calm assistant helping me act today.

## Mission Fit
The direction is broadly aligned with the mission: the suite now has a more consistent visual language, calmer labels, and stronger assistant framing across Today, Capture, Plan, Notes, and More. The problem is staging. The mission says the signed-in first screen should make the next daily action obvious, while much of the visible work still feels like product explanation, module marketing, and navigation polish around the product rather than the product doing the job.

## Taste Check
The soft notebook palette, graphite type, teal accents, restrained borders, and tactile panel treatment are the best parts. The system finally has a point of view. The typography is bold and legible, the cards feel calmer, and the repeated module hero pattern gives the suite a family resemblance.

What is off: the hierarchy is still too loud. Mobile headings are huge, sections arrive like billboards, and many screens burn the first viewport explaining what the module is instead of letting the user use it. The marketing pages look more polished than the assistant surface, which is backwards for this mission. Also, the nav chrome has become a little proud of itself. A personal operating system should not need to clear its throat this much.

## Visual Problems To Fix
- The settings mobile header stacks a large brand block above a full nav row, creating a heavy double-chrome first impression before the actual settings content starts.
- The settings route has a repeated page identity problem: top navigation, "Daily Setup", "Settings", summary cards, "Settings section", and "Appearance" all compete before the user reaches the actual control.
- Desktop settings leaves a large empty side panel labeled "Change section", which looks unfinished rather than intentionally minimal.
- The latest visual report flags small tap targets in the settings header and nav, including the brand and Today/Capture/Plan/Notes links; this is not just accessibility housekeeping, it makes the shell feel under-fitted.
- Product marketing routes for EasyList, EasyCalendar, EasyNotes, and EasyWorkout share a generic "Overview / Features / Workflow / Start" brochure structure, which weakens the personal assistant mission.
- Mobile module pages use oversized hero typography that consumes the first screen and delays the useful preview state.
- The pill clusters under hero CTAs read like feature tags, not actionable controls; they add surface noise without helping the user move faster.
- The public/product route chrome still competes with the demo content: "Daily Workspace EasyLifeHQ", nav links, Products, Get Started, module label, huge headline, CTA, and tags all arrive before any real daily workflow.
- The teal-tinted preview cards are useful, but they are visually similar across modules, so each route feels templated rather than specifically designed for the job.
- There is no fresh visible HQ screenshot in the provided latest artifacts, so confidence is lower on the actual protected assistant first screen.

## Strongest Opportunities
- Make the protected HQ screen the design source of truth: one next action, today context, compact module status, then everything else.
- Reduce mobile header height and convert module navigation into quieter progressive disclosure instead of a proud second masthead.
- Turn the module marketing pages into product demos with real first-screen examples, not feature-section essays.
- Give each core module one signature object: a task lane for Capture, a next block for Plan, a memory card for Notes, a session card for Workout.
- Standardize tap target sizing and nav density before adding more assistant language.
- Use Settings as a calm control center with fewer nested labels and fewer summary cards above the actual controls.

## Priority Fix
Fix the shell and first-screen hierarchy before doing another feature or copy pass. Specifically: reduce the app header/nav chrome, remove repeated page identity on settings and HQ-adjacent routes, and make the first viewport show one primary user action plus compact status. Nami should treat this as a subtraction task, not a new layout invention.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: AI Personal Assistant Stage 0 - Salvage Audit; REASON: the assistant direction is clearer, but visual hierarchy and first-screen discipline are still not strong enough.

## Designer Handoff
Next batch should make EasyLife feel less like a catalog of modules and more like a working personal assistant. Keep the soft notebook texture, graphite weight, teal accent, rounded panels, and calm copy. Change the amount of chrome, especially on mobile: smaller header, quieter navigation, fewer identity labels, fewer feature pills, and a more immediate daily action. The result should feel like opening a trusted workspace, not arriving at a sales deck for your own life.

## What Not To Do Next
- Do not add more homepage, product, or feature sections.
- Do not add more assistant claims unless the first screen proves the assistant behavior visually.
- Do not make another broad pass across every module.
- Do not solve this with larger cards, bigger headings, or more teal.
- Do not bury the actual app behind route wrappers, product explanations, or duplicated section intros.
- Do not ignore mobile; the current mobile hierarchy is where the mission leaks fastest.
- Do not touch backend, auth, deployment, analytics, dependencies, or product plumbing.

## Next 5 Design Tasks
- [ ] Reduce the settings mobile header height so brand and nav fit as quiet shell chrome; do not change routes, settings behavior, or auth.
- [ ] Remove one repeated settings identity layer so the first screen moves from "Settings" explanation to the active setting control faster; keep copy concrete and do not add new sections.
- [ ] Increase app header/nav tap targets to at least comfortable touch size without making the header visually heavier; verify desktop and 390px mobile.
- [ ] On one module marketing route, replace feature-tag clutter under the hero CTA with one quieter secondary action row; do not add new content below.
- [ ] Capture a fresh HQ visual QA screenshot after the shell repair and confirm the first viewport shows one next action, today context, and compact module status.

## Stop Or Continue
continue but fix visual issues first