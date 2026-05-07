# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is cleaner and more coherent, but it still behaves like a polished module brochure instead of the calm daily assistant it is supposed to become.

## Mission Fit
The visual direction supports "connected, clean, professional" better than before: shared headers, consistent cards, teal accents, and common module page structure are doing useful work. The miss is mission-critical: the screenshots still lead with individual products and feature explanations, not one signed-in daily start point with a next action, today context, and compact module status. For EasyLife, "suite consistency" is not enough; the product promise is a personal operating system, and right now the first impression is still "here are our apps."

## Taste Check
The best part is the restraint. The palette is quiet, the typography has confidence, the module cards feel related, and the copy is less vaporous than the usual productivity fog machine. The large headlines have presence, and the right-side status panels are useful visual anchors.

The weaker part is hierarchy discipline. The pages are too proud of explaining themselves. The desktop top gap, oversized page panels, pill clusters, feature sections, and repeated marketing nav make the product feel like a landing page system wearing an app costume. Mobile is usable, but heavy: too much headline, too much intro, too many chips, then the actual product signal arrives late.

## Visual Problems To Fix
- Desktop has an oversized empty band between the header and the hero card, which makes the first viewport feel staged instead of immediate.
- The route chrome is too loud for a product demo: "Overview", "Features", "Workflow/Planning", "Start", "Products", and "Get Started" compete with the main module story.
- The customer-facing module pages repeat identity too many times: global brand header, module eyebrow, giant product headline, feature band, and chip row all restate what screen the user is on.
- The first viewport still prioritizes product explanation over the primary job; a user sees pitch copy before a real "what should I do next today" surface.
- Mobile stacks hero copy, CTA, chips, and preview into a long promotional block; the preview panel is not high enough in the hierarchy.
- The pill chips read like feature tags, not controls. Some look tappable but do not establish a clear next action.
- The hero cards are visually handsome but too similar across modules, which makes EasyList, EasyNotes, EasyCalendar, and EasyWorkout feel templated rather than personally useful.
- The "Open EasyLife" CTA repeats on every module page without adapting to the module context, so it feels generic where it should feel intentional.
- Feature sections arrive too early and too large; they reinforce a brochure model when the mission asks for progressive disclosure.
- The current screenshots do not show blocking visual bugs, but visual bug automation is being generous. Taste is not a lint rule, thank God.

## Strongest Opportunities
- Collapse the first screen into a true assistant start: one next action, today's date/context, and three compact status signals from tasks, calendar, notes, and workout.
- Make module navigation feel like secondary access inside one product, not the primary mental model.
- Replace generic feature chips with contextual actions: "Capture task", "Plan today", "Open recent note", "Start workout".
- Reduce marketing chrome on app-adjacent routes so the actual product example carries the page.
- Give each module one distinctive utility moment in the preview instead of repeating the same card-and-rows composition.
- Tighten mobile first screens so the useful preview appears without a long scroll through positioning copy.

## Priority Fix
Fix the first-screen hierarchy before adding any new sections. The next visual pass should reduce chrome and convert the HQ/primary entry surface from module-first explanation into a day-first assistant surface: one clear next action, compact today context, and quiet module status. The goal is not another prettier landing page; it is a screen that makes the user feel EasyLife is already helping them run the day.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: AI Personal Assistant Stage 0 - Salvage Audit; REASON: suite pages look more consistent, but the assistant-first surface is still not visible.

## Designer Handoff
Keep the current restraint, typography confidence, soft panel treatment, and teal identity. Change the hierarchy: demote route nav, remove repeated feature-label clutter, and make the first viewport operational. The next implementer should make EasyLife feel like a quiet personal assistant already in motion, not a catalog of tools asking to be understood. Secondary module detail can stay, but it belongs behind navigation, tabs, or lower sections after the daily start has earned attention.

## What Not To Do Next
- Do not add more feature sections.
- Do not make the hero bigger.
- Do not add more chips, badges, or product labels.
- Do not turn the assistant direction into AI promise copy.
- Do not expand backend, auth, settings, integrations, or data scope.
- Do not solve this with a new visual theme; solve it with hierarchy.
- Do not ignore mobile just because the desktop looks orderly.

## Next 5 Design Tasks
- [ ] Reduce top route chrome on product/demo pages; keep navigation useful but visually quieter, with no new sections or route changes.
- [ ] Replace the HQ first viewport with one daily next action plus compact today context; keep module status secondary and avoid feature inventory copy.
- [ ] Convert module hero chip rows into fewer contextual actions; maximum three visible actions per module and no vague feature-tag styling.
- [ ] Tighten mobile first-screen spacing so the primary preview/status panel appears earlier without clipping text or shrinking tap targets.
- [ ] Audit repeated identity labels across header, hero, and feature bands; remove one duplicated label layer per customer-facing route without changing behavior.

## Stop Or Continue
continue but fix visual issues first