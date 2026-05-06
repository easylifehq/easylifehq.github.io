# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is getting calmer and more coherent, but the visible product surfaces still sell the app before they let the user feel the daily operating system.

## Mission Fit
The direction partially matches the mission: shared header, typography, spacing, soft panels, and restrained color are moving toward one connected suite. The miss is hierarchy. Pack 1 is about Product Spine, and the screenshots still read like separate brochure pages for EasyList, EasyNotes, EasyCalendar, and EasyWorkout instead of a signed-in personal assistant surface that answers "what should I do next today?" Recent screenshots cover module demo/product pages, not the protected HQ first screen, so confidence on the actual daily start surface is lower.

## Taste Check
The best work is the calmer teal system, generous whitespace, large confident type, and consistent preview panels. It feels more adult than earlier generic SaaS noise. The problem is that every route is wearing the same marketing costume: giant headline, Start Free, See Features, feature pills, preview card, then another feature section. Chic template, wrong job. The product is supposed to reduce friction, not make the user attend a sales seminar for their own task list.

## Visual Problems To Fix
- The top chrome is visually loud for demo routes: logo block, nav links, Products button, Get Started button, then another large product hero. It makes the actual module feel buried under route furniture.
- Repeated page identity is present: the header says EasyLifeHQ, the hero eyebrow repeats the module name, the hero copy explains the product, and the next section immediately says FEATURES again. That is stacked intro material, not progressive disclosure.
- "Start Free" appears on every module surface, which makes the app feel like a public marketing funnel instead of a connected personal operating system.
- The first viewport on mobile is dominated by hero copy and CTA buttons; the practical preview sits lower, so the useful daily behavior arrives after the pitch.
- The preview cards are handsome but static and similar across products, so EasyList, EasyNotes, EasyCalendar, and EasyWorkout feel like four landing pages with swapped copy rather than one suite.
- Feature pills are competing with primary action buttons, especially on mobile where they create extra rows before the user reaches the actual example.
- Desktop sections use large cards inside broad pale backgrounds repeatedly, which risks a soft boxed-in sameness across every route.
- The screenshots do not show a clear unified "today" spine tying tasks, notes, calendar, and workouts together above module-specific explanation.

## Strongest Opportunities
- Convert module first screens from marketing heroes into compact working previews: one primary action, one current-state module card, and one quiet secondary path.
- Make the shared shell feel like the product: persistent suite navigation, current module state, and one calm action area should do more work than the headline.
- Replace repeated CTA language with in-app action language: "Add task", "Write note", "Plan block", "Start workout", depending on route context.
- Use the preview panels as real hierarchy anchors, not decorative proof points. Put them higher, make them denser, and let them carry the product story.
- Create one cross-suite daily band that appears consistently across core routes, so the user feels continuity instead of page-by-page reinvention.

## Priority Fix
Reduce marketing chrome on the module routes before adding anything else. On EasyList, EasyNotes, EasyCalendar, and EasyWorkout, the first viewport should stop leading with "Start Free", "See Features", and feature-pill explanation. Keep the strong product headline style where useful, but move the actual working preview and one module-specific action above or beside the copy so the user feels the tool immediately.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: theme restraint and suite consistency improved, but the visible surfaces still prioritize brochure hierarchy over the daily operating spine.

## Designer Handoff
Next batch should subtract. Keep the restrained teal palette, soft panels, bold type, and consistent spacing. Change the first viewport hierarchy so each core route feels like an app surface first and a product explanation second: quieter header actions, fewer repeated labels, one primary module action, and a stronger live-looking preview. The user should feel "I know what to do next" before they feel "I understand the feature list."

## What Not To Do Next
- Do not add more sections below the current heroes.
- Do not add more nav pills, badges, or explanatory labels to solve clarity.
- Do not make the theme system more expressive while the product spine is still unresolved.
- Do not turn the HQ or module pages into larger dashboards with every feature visible at once.
- Do not ignore mobile; the current mobile first viewport is already too pitch-heavy.
- Do not touch backend, auth, settings infrastructure, packages, or deployment to solve a design hierarchy problem.

## Next 5 Design Tasks
- [ ] Quiet one module route header: remove or reduce one repeated CTA or nav element on a core module route, with no behavior or routing changes.
- [ ] Promote one working preview: move the practical preview higher than secondary feature pills on one module route, preserving mobile tap comfort.
- [ ] Replace one marketing CTA pair: change "Start Free" and "See Features" on one signed-in/demo module surface to one task-specific action and one quieter secondary action.
- [ ] Reduce repeated intro language: remove one duplicated eyebrow/FEATURES/title pattern from a customer-facing route without adding a new section.
- [ ] Mobile first-viewport pass: on one core route, ensure the primary action and useful preview are visible before the feature section, with no clipped text or horizontal overflow.

## Stop Or Continue
continue but fix visual issues first