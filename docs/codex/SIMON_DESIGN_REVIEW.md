# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife now has a calmer, more coherent visual language, but it still looks like a polished product tour before it feels like a working personal assistant.

## Mission Fit
The direction supports the connected-suite mission better than before: shared header rhythm, consistent teal accents, repeated card language, and clearer module naming make EasyList, EasyCalendar, EasyNotes, and EasyWorkout feel related. The miss is mission priority: the active pack is "AI Personal Assistant Stage 0 - Salvage Audit", but the visible work still spends too much energy on public product-page explanation instead of proving the signed-in first screen contract: one daily next action, today context, and compact module status. Pretty brochure discipline is not the same as assistant discipline. Close, but not there.

## Taste Check
The best part is the restraint: the off-white grid, dark graphite type, teal controls, and rounded but not cartoonish panels feel calmer and more intentional than generic SaaS confetti. The product cards have a quiet tactile quality, and the copy is less bloated than earlier suite language.

What is off: the pages still over-index on huge marketing headlines, feature bands, and repeated "Open workspace" moments. The hierarchy is handsome, but too loud for a personal operating system. On mobile, the typography gets billboard-sized, the stacked hero/panel flow is heavy, and the app starts to feel like a pitch deck squeezed into a phone. The nav is better, but settings still exposes a chunky route bar with small tap-target warnings, which is a very inelegant combination: visually big, technically still too small. Mon dieu.

## Visual Problems To Fix
- Public product routes repeat the same structure across modules: logo/header, giant module headline, "Open workspace", chips, demo panel, then feature cards. It is consistent, but now it risks feeling templated instead of product-specific.
- The customer-facing module pages make the marketing hero dominate the first viewport; the actual workspace/action is still one click away and visually secondary.
- Mobile module pages have oversized headline and body type that push the demo panel too far down, so the user sees a pitch before seeing useful product state.
- The hero demo panels look clean but read as static marketing evidence, not as a living assistant surface with "what should I do next" priority.
- Settings mobile has loud route chrome at the top while the visual QA report flags nav links as small tap targets; the shell is occupying premium space without meeting touch comfort.
- Settings first screen is too blocky: "Signed in", "Theme", and "Opens to" are large cards with low information density, making setup feel heavier than it needs to be.
- The manifest icon warning on EasyCalendar is not a design-layout bug, but it damages polish during visual QA and should be cleared.
- The background grid is elegant in moderation, but across every page it starts to become a wallpaper system rather than a product surface. The design needs more content-led variation.
- Header/menu chrome is cleaner than before, but the "Products" and "Get Started" controls on public pages still compete with module-specific primary action.

## Strongest Opportunities
- Make the protected Today/HQ surface the hero of the product direction: one assistant read, one next move, one capture affordance, and compact module signals.
- Reduce public product pages from feature catalogs into quick proof pages: show the module doing one concrete job first, then disclose features below.
- Give each module one distinct operational artifact: EasyList gets an inbox queue, EasyCalendar gets an open-window schedule, EasyNotes gets a writing surface, EasyWorkout gets a live session card.
- Tighten mobile type scale and vertical rhythm so the first viewport contains product state, not just slogan and CTA.
- Quiet the route chrome on internal screens and make tap targets meet comfort standards without making the nav visually heavier.

## Priority Fix
Fix the first-screen hierarchy on the signed-in Today/HQ surface before adding or polishing more module marketing pages. The next task should not add a new section. It should reduce the first viewport to a real assistant command surface: today's read, one recommended next move, one capture/input action, and compact statuses for List, Calendar, Notes, and Workout. Anything that reads like feature inventory, internal build language, broad product promise, or secondary module browsing should move below the fold or behind an existing action.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: AI Personal Assistant Stage 0 - Salvage Audit; REASON: visual consistency improved, but the assistant-first daily surface is still not proven.

## Designer Handoff
Keep the graphite/teal palette, soft paper surfaces, restrained borders, and suite-wide navigation direction. Change the hierarchy: EasyLife must stop introducing itself like a startup homepage and start behaving like a calm daily assistant. The next implementer should make the first working screen feel immediate, useful, and specific: "here is today, here is the next thing, here is where to capture the loose thought." Public module pages can remain polished, but they should become quieter proof pages, not the center of gravity. The user should feel less sold to and more gently handled.

## What Not To Do Next
- Do not add more feature sections to the product pages.
- Do not make a bigger dashboard with more cards, stats, modules, or claims.
- Do not introduce fake AI language, backend promises, or assistant magic the product cannot evidence.
- Do not keep polishing marketing pages while Today/HQ still lacks a clearly proven daily action surface.
- Do not ignore mobile; the current scale is elegant on desktop and heavy on phone.
- Do not solve tap-target warnings by making the nav visually louder.
- Do not touch auth, Firebase, backend, package files, deployment, or data models.

## Next 5 Design Tasks
- [ ] Tighten the protected Today/HQ first viewport to one assistant read, one recommended next move, one capture action, and compact module status; do not add new data, routes, or backend behavior.
- [ ] Reduce mobile hero typography on EasyList, EasyCalendar, EasyNotes, and EasyWorkout so the demo/state panel appears sooner; preserve the current visual system and do not add sections.
- [ ] Repair the settings shell tap targets to meet comfortable touch sizing while keeping the nav visually quiet; do not change routing or settings behavior.
- [ ] Simplify the Settings first card stack by reducing oversized summary cards or merging low-value setup facts; keep the existing settings content and avoid new controls.
- [ ] Clear the EasyCalendar manifest icon visual QA warning without touching deployment config, package files, or generated output.

## Stop Or Continue
continue but fix visual issues first