# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
The surfaces are cleaner than before, but EasyLife still looks like a row of polished product brochures instead of one calm personal operating system.

## Mission Fit
The visual direction partially matches the mission: it is clean, restrained, and more professional than generic SaaS clutter. But Pack 1 is Product Spine, and the current screenshots mostly show separate module landing pages with "Start Free," feature sections, and repeated explanation. That does not yet prove the signed-in user can open EasyLife and immediately know what to do next today. The school-planner work may be useful, but without a fresh HQ screenshot, confidence is lower on whether it actually strengthens the daily spine.

## Taste Check
The best parts are the quiet palette, confident typography, tactile panels, and restrained teal accent. The system has a calmer voice now, and the mock data rows feel more concrete than vague product claims.

The weak parts are hierarchy and staging. Every module gets the same oversized hero, the same CTA pair, the same chips, the same feature card parade. It is tidy, yes, but tidy like a template wearing a pressed shirt. EasyLife should feel like a working assistant, not four adjacent sales pages explaining themselves.

## Visual Problems To Fix
- The first viewport on module routes is dominated by marketing chrome: "Start Free," "See Features," product chips, and explanatory hero copy compete with the actual app/use case.
- The top navigation repeats EasyLifeHQ branding while the hero repeats the module identity immediately below, creating stacked page identity instead of one clear product frame.
- The desktop pages have a large empty band between the nav and hero, making the product feel staged rather than fast.
- The module pages all use nearly identical hero-card-feature-section structure, so EasyList, EasyNotes, EasyCalendar, and EasyWorkout feel related but not operationally connected.
- The pale grid background and nested white panels are tasteful, but they are becoming a decorative wrapper around content that should feel more immediate.
- Mobile has good spacing and no obvious overflow, but the first screen is still too much pitch before utility; users scroll through claims before seeing workflow.
- The feature sections appear too early and too loudly for a personal operating system; they read as product explanation, not daily action.
- Screenshot evidence is missing for the protected HQ school-planner surface, so the branch has not visually proven that the active Pack 1 spine improved.

## Strongest Opportunities
- Replace the module brochure first screen with a compact daily start surface: one next action, today context, and a few module status signals.
- Make route navigation quiet and persistent, then let each module open into the work itself instead of a sales hero.
- Use the strong row/card language already present in the preview panels as the real app interface, not as decorative proof inside a hero.
- Create one shared "today spine" pattern that can absorb tasks, notes, calendar, workout, and school without becoming a dashboard dump.
- Push feature explanations behind tabs, accordions, secondary sections, or route-level help so the first screen breathes and acts.

## Priority Fix
Reduce the marketing-style chrome on the main product/module routes before adding anything else. The next task should collapse the oversized hero/CTA/chip pattern into a quieter operational header and bring the daily next action or module work preview higher in the first viewport. Keep the good typography and tactile rows; remove the feeling that the app is still auditioning for its own job.

## Magic Improvement Score
SCORE: 2; DIRECTION: flat; ACTIVE_PACK: Pack 1 - Product Spine; REASON: the visuals are cleaner, but the branch still presents modules more than it operates a connected daily spine.

## Designer Handoff
Keep the restrained palette, strong type, rounded tactile panels, and concrete row-based content. Change the information order. The next batch should make EasyLife feel entered, not advertised: quiet shell, compact page identity, one primary action, today context, and module status. Product explanation should move lower or behind progressive disclosure. The user should feel, "I know what to handle next," not "I have been given a tour."

## What Not To Do Next
- Do not add another feature section, module card, or explanatory band.
- Do not make the school planner bigger until the HQ first screen proves the daily spine works.
- Do not add more nav pills or CTA buttons to solve hierarchy.
- Do not change auth, backend, Firebase, packages, routing architecture, or persistence.
- Do not ignore mobile; the mobile first viewport is where the marketing-first staging is most obvious.
- Do not mistake consistent templates for a connected suite.

## Next 5 Design Tasks
- [ ] Reduce module hero chrome on one route only: remove or quiet one CTA/chip cluster, keep behavior unchanged, and verify mobile does not overflow.
- [ ] Bring one concrete work preview higher on the selected route: use existing/mock data only and avoid adding a new section.
- [ ] Tighten the top spacing between nav and page content: adjust spacing only, no layout rewrite, and preserve desktop/mobile rhythm.
- [ ] Convert one loud feature explanation into progressive disclosure: use an existing button, tab, or lower section, with no new backend or state model.
- [ ] Capture and review the protected HQ screen after the school-planner changes: confirm it shows one daily next action before module inventory.

## Stop Or Continue
continue but fix visual issues first