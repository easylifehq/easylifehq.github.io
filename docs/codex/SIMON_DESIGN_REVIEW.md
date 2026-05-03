# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife now has a cleaner suite accent, but the current screens still sell modules harder than they help the user start the day.

## Mission Fit
The visual direction is closer to a connected personal operating system than before: shared spacing, teal accents, rounded panels, and consistent module storytelling are visible across EasyList, EasyNotes, EasyCalendar, and EasyWorkout. The miss is Pack 1's actual job. The evidence still shows public product pages and feature tours dominating the visual surface, while the mission asks for a calm daily assistant spine: one next action, today context, and compact module status. Pretty brochure, useful skeleton still underdressed.

## Taste Check
The typography is confident, the palette is restrained, and the module demos feel more related than earlier Simon notes implied. The best move is the softer product-card language: it feels calmer and less enterprise. What feels generic is the repeated SaaS landing-page structure: nav bar, giant hero, CTA buttons, pill tags, feature card row, repeat. On mobile, the huge marketing type and oversized demo panels eat the first screen, which makes EasyLife feel like a product pitch instead of a tool someone can immediately use.

## Visual Problems To Fix
- The header repeats brand identity loudly: the top shell says EasyLifeHQ, then the hero immediately announces another module name, creating stacked page identity instead of a clean product moment.
- The public module pages all use the same landing-page formula, so EasyList, EasyNotes, EasyCalendar, and EasyWorkout feel coherent but not yet deeply tailored.
- Mobile first screens are too tall and explanatory; the user sees brand, module title, headline, paragraph, CTAs, pills, and a large preview before any real working surface.
- The hero preview panels are visually useful, but their internal rows are oversized on mobile and crowd the layout instead of feeling like quick status signals.
- Feature sections arrive too early and too heavily; they extend the brochure feeling before the product has proved the daily workflow.
- The "Products" and "Get Started" route chrome is useful on desktop but too dominant relative to the actual module story.
- Latest screenshots do not include the protected HQ or Settings surfaces, so confidence is lower on whether the first-screen contract is actually fixed where it matters most.
- The branch still carries design-adjacent risk because checkpoint and Joey are RED from auth-adjacent changes; not a visual flaw, but it is hostile to trust.

## Strongest Opportunities
- Turn the protected HQ first screen into the product spine: one daily next action, one today context line, and compact status from list, notes, calendar, workout, and settings.
- Make public module pages quieter by reducing repeated chrome and moving feature inventories below the first decisive product example.
- Replace the pill-tag spray with one or two meaningful secondary actions; the rest can live lower or behind a product switcher.
- Give each module a more distinct hero preview while keeping shared system rules, so cohesion does not become sameness.
- Tighten mobile hierarchy aggressively: smaller hero type, fewer visible chips, shorter preview rows, and less first-screen explanation.
- Use Settings as the calm control-center proof point, not another surface full of explanatory panels.

## Priority Fix
Fix repeated page identity and first-viewport overload before any new polish. Nami should audit AppHeader plus the module marketing route headers and reduce duplicated brand/module/title/intro chrome so the first screen has one clear owner: either the public product pitch or the working daily assistant surface, not both yelling politely in the same room.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: product pages look more cohesive, but they still behave like feature brochures instead of a daily assistant spine.

## Designer Handoff
Keep the restrained teal system, crisp typography, and compact preview-card language. Change the hierarchy: make the first viewport less promotional and more operational, especially on mobile. Demote repeated nav labels, reduce chip clutter, shorten hero copy, and make the preview panel feel like the first useful product moment rather than an illustration beside a sales headline. The user should feel "I can start my day here," not "I am reading the deck before the meeting."

## What Not To Do Next
- Do not add more sections, proof points, feature cards, or product claims.
- Do not keep cloning the same landing-page skeleton across every module.
- Do not solve mobile density by hiding only the nav while leaving giant hero content intact.
- Do not make Settings louder or more explanatory.
- Do not touch auth, backend, Firebase, packages, deployment, analytics, or data behavior.
- Do not ignore the RED checkpoint context just because the screenshots look tidy.

## Next 5 Design Tasks
- [ ] Audit public module pages for repeated identity; remove or demote one layer of brand/module/title chrome without changing routes or behavior.
- [ ] Tighten mobile hero density on EasyList and EasyCalendar; keep one headline, one paragraph, one primary CTA, and no clipped or crowded controls.
- [ ] Reduce visible pill tags above the fold to the two most useful signals per module; move the rest lower or remove them.
- [ ] Make preview panels more compact on mobile by reducing row height and label weight while preserving readability.
- [ ] Capture fresh protected HQ and Settings screenshots after the next repair; judge them against the first-screen contract before adding new design work.

## Stop Or Continue
continue but fix visual issues first