# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is becoming calmer and more coherent, but the interface still feels too much like a polished feature catalog and not enough like a daily assistant.

## Mission Fit
The direction broadly matches the mission: shared shell, suite language, and module-to-module naming are moving toward one connected personal operating system. The problem is hierarchy. The first-screen contract says one daily next action, today context, and compact module status; the current evidence still over-indexes on product explanation, large route chrome, and repeated cards before the user feels guided.

## Taste Check
The best part is the restrained soft-notebook visual system: pale grid, graphite text, deep teal action color, and consistent rounded panels feel current without screaming startup template. The copy is more concrete than before, especially around Capture, Plan, and Notes.

What is off: the pages are still too brochure-shaped. Huge headlines, feature chips, preview panels, and repeated "Open workspace" CTAs make the suite feel marketed rather than operated. Settings also exposes the weakest shell behavior: the navigation is visually loud, cramped in places, and in the desktop screenshot the brand/nav treatment looks squeezed enough to feel accidental. That is not personal operating system energy; that is "demo page wearing app clothes."

## Visual Problems To Fix
- The desktop Settings header has cramped navigation and a visually messy brand/nav area; the EL mark and first nav item feel too close, and automated QA also flags multiple small tap targets.
- Mobile Settings makes the route nav too dominant: Today, Capture, Plan, Notes, and the oversized More button compete with the Settings content instead of acting like quiet app chrome.
- Product pages repeat the same landing-page structure across EasyList, EasyCalendar, EasyNotes, and EasyWorkout: giant headline, helper copy, CTA, chips, preview card, feature section. Consistency is good; sameness is not a product point of view.
- The first viewport on module pages shows too many explanatory elements at once: CTA, pills, preview rows, and feature setup all fight for attention.
- The preview cards look clean, but they are doing marketing explanation rather than showing a true working assistant state.
- Mobile typography is bold and readable, but the vertical scale is too inflated; the user has to scroll through brand explanation before reaching useful structure.
- The feature chips are visually repeated and low-value; they read like tags from a SaaS template, not assistant controls.
- Settings cards are clear but over-bordered; nearly every element is boxed, which flattens hierarchy and makes the page feel assembled from panels.
- The screenshots do not include a fresh Today/HQ first-screen view, so confidence is lower on the most important assistant-first judgment.

## Strongest Opportunities
- Make the app shell quieter and more confidently reusable: larger tap targets, less pill weight, calmer More treatment, and no cramped brand collision.
- Turn Today into the visual source of truth: one assistant read, one capture command, one next move, and compact status from the modules.
- Replace product-page sameness with product-specific working moments: Capture should look like an intake lane, Plan like a day timeline, Notes like a writing surface, Workout like a live logging surface.
- Use progressive disclosure harder: chips and feature explanations should move below the first useful state or become secondary controls.
- Reduce border density in Settings and let spacing, section labels, and one primary panel carry the hierarchy.

## Priority Fix
Fix the app shell chrome before adding another assistant feature. Specifically, repair the Settings/header navigation so every route target meets tap-size expectations, the brand does not visually collide with nav, and More becomes a quiet secondary affordance instead of a large competing button. This is the visible foundation for the suite; if the shell feels cramped, every module inherits the anxiety.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: AI Personal Assistant Stage 0 - Salvage Audit; REASON: suite tone is cleaner, but shell hierarchy and assistant-first evidence are still not strong enough.

## Designer Handoff
Next batch should be a reduction pass, not an invention pass. Keep the soft notebook palette, strong typography, and concrete life-management language. Change the shell spacing, tap targets, and More treatment so navigation feels dependable and quiet on desktop and mobile. Then make the first visible content feel more like "here is what to do next" and less like "here are all the reasons this module exists." The user should feel oriented in a calm working app, not welcomed to a product tour.

## What Not To Do Next
- Do not add more sections to the product pages.
- Do not add another dashboard, assistant panel, or feature inventory.
- Do not make the teal heavier or introduce more accent colors to solve hierarchy.
- Do not polish copy while leaving the route chrome cramped.
- Do not ignore mobile; the mobile screenshots show the scale problem most clearly.
- Do not touch backend, auth, persistence, packages, deployment, or product architecture.

## Next 5 Design Tasks
- [ ] Repair app header tap targets on Settings and shared app routes; keep route count unchanged and verify desktop and mobile targets are at least 44px tall.
- [ ] Reduce the mobile More button visual weight; preserve the route behavior, but make it read as secondary chrome beside Today, Capture, Plan, and Notes.
- [ ] Remove or quiet one row of feature chips from a module first viewport; keep one primary CTA and one product-specific preview state visible.
- [ ] Convert one module preview card from marketing proof into a more working-state example; keep copy local/static and avoid new data behavior.
- [ ] Simplify Settings panel borders by reducing one nested box layer; preserve all existing settings content and controls.

## Stop Or Continue
continue but fix visual issues first