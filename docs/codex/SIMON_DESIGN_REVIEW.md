# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is getting calmer and more coherent, but the visible surfaces still behave like product brochures when the mission wants a daily personal operating system.

## Mission Fit
The shared palette, typography, card language, and module-by-module consistency now support the connected suite mission better than earlier passes. The problem is hierarchy. The screenshots show EasyList, EasyNotes, EasyCalendar, and EasyWorkout as polished marketing pages with "Start Free", "See Features", hero claims, feature blocks, and nav anchors. That may explain the product, but it does not satisfy the signed-in first-screen contract: one daily next action, today context, and compact module status. Confidence is lower because the latest screenshot set does not show the protected HQ/Today surface, which is the actual mission-critical screen.

## Taste Check
The best part is the restraint: soft green-gray background, quiet borders, chunky but readable type, and tactile preview panels. It feels more intentional than generic SaaS sludge. The suite language is also more consistent across modules.

The weak part is that every route now has the same demo-page costume: oversized hero, feature cards, pills, and marketing CTAs. It looks clean, yes, but clean like a template trying to sell me an app I am already inside. The big type is doing too much shouting for a product whose promise is calm.

## Visual Problems To Fix
- The desktop header repeats the brand identity with "EasyLifeHQ" shown as both the small label and the main label, which creates double identity before the page content starts.
- The public/demo route chrome competes with the module page: top nav, Products button, Get Started button, hero CTA buttons, and feature anchor links all stack into a sales shell instead of a working product surface.
- "Start Free" appears across internal-looking module pages, which makes the app feel like a landing site rather than a signed-in personal OS.
- The first viewport on every module is dominated by large marketing headlines, not by the user's next action or live today state.
- Mobile layouts are usable, but the hero type and summary panels are too large; the user has to scroll past pitch content before reaching useful workflow content.
- The repeated "Features" section immediately below each hero makes the pages feel structurally duplicated across modules.
- The pill rows add visual activity without enough functional weight; on mobile they read like tags, not controls.
- The preview panels are attractive, but they are static proof-of-concept cards rather than clearly actionable product UI.
- Route identity is repeated too loudly: global brand, module eyebrow, hero title, feature heading, and preview card label all say what the page is before the page lets the user do anything.
- The background grid is tasteful but a little too visible behind stacked white panels; it adds production gloss, not daily utility.

## Strongest Opportunities
- Convert the protected HQ first screen into the real product spine: one "Today" action, compact status from List/Notes/Calendar/Workout, and quiet module switching.
- Reduce marketing chrome on module routes and make them feel like app surfaces: fewer hero claims, more direct actions, tighter headers.
- Replace broad "Features" blocks with task-first panels: "Capture a task", "Review recent notes", "Plan next open block", "Start workout".
- Make mobile the discipline pass: top action visible by the first screen, fewer giant paragraphs, tighter cards, and no stacked brochure bands.
- Keep the current visual system, but make hierarchy less performative: smaller headings, stronger active states, fewer decorative chips.
- Use the preview card style for real interactive states, because that is the most premium visual language in the current work.

## Priority Fix
Reduce the route chrome and marketing hierarchy before adding anything else. The next batch should take one core surface, preferably HQ/Today or EasyList, and make the first viewport feel like a working personal assistant: compact header, one primary action, today context, and 3-4 module/status signals. Remove or quiet "Start Free", "See Features", duplicate labels, and feature-section repetition from any signed-in or app-like route. The product needs to stop introducing itself at the door every time. We have met.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: suite consistency and mobile comfort improved, but the branch still advances presentation more than the daily operating spine.

## Designer Handoff
Keep the calm palette, rounded panels, strong typography, and preview-card tactility. Change the hierarchy from brochure-first to action-first. The next implementer should shrink global and route headers, make secondary navigation quieter, and replace marketing CTAs with real app actions on protected/app-like pages. The user should feel, "I know what to do next today," not "I have entered a nicely typeset feature tour."

## What Not To Do Next
- Do not add more sections below the current pages.
- Do not add another dashboard band, future-plans dock, or module directory.
- Do not make the typography even larger to create drama.
- Do not add more pills unless they are real controls with clear state.
- Do not chase decorative polish while the first-screen job is still soft.
- Do not ignore mobile just because there are no automated blocking visual bugs.
- Do not touch backend, auth, package, Firebase, deployment, or data scope.

## Next 5 Design Tasks
- [ ] Remove duplicate brand wording in the app header; keep one clear EasyLifeHQ identity and preserve existing navigation behavior.
- [ ] On one protected/app-like route, replace "Start Free" and "See Features" with one real primary action and one quiet secondary action; do not change routing or data behavior.
- [ ] Tighten the first viewport of HQ/Today so one daily next action and compact module status appear before feature-style explanation; no new sections.
- [ ] Reduce mobile hero density on one core module by shrinking heading scale and paragraph length; keep tap targets comfortable and avoid text clipping.
- [ ] Convert one repeated "Features" block into a task-first panel with concrete actions or status; avoid adding new cards beyond the existing count.

## Stop Or Continue
continue but fix visual issues first