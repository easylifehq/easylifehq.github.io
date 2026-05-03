# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is finally starting to look like one product, but it still walks into the room wearing too many name tags.

## Mission Fit
The current direction supports Pack 1 by making the suite visually related: shared shell, consistent cards, restrained teal accents, and calmer product language across EasyList, EasyCalendar, EasyWorkout, and the root page. But it still misses the first-screen contract. The user should immediately see the next useful daily action; instead, the first viewport often behaves like a polished marketing explainer with hero copy, tags, feature cards, and route chrome competing for attention.

## Taste Check
The best part is the restraint: the typography has weight, the palette is calm, the soft grid background gives the product a quiet workspace feel, and the module previews are more tactile than generic SaaS tiles. The suite now has a recognizable visual family.

What is off: the hierarchy is still too loud. Every page wants to headline, explain, preview, badge, and navigate at once. The oversized cards inside a wrapper page make the actual product feel buried. Mobile is better than before, but the screenshots show long stacked blocks and one blank EasyNotes mobile artifact, so confidence there is lower. Also, "Start Free" across app module pages feels like public marketing, not a signed-in personal operating system.

## Visual Problems To Fix
- The first viewport repeatedly contains too many headings: visual QA reports 6 headings above the fold on `/`, `/easylist`, `/easynotes`, `/easycalendar`, and `/easyworkout`.
- The route chrome competes with the demo content: top nav, product buttons, hero eyebrow, hero headline, tags, preview panel, and the next section are all fighting for first-screen authority.
- Customer-facing product routes feel buried inside large white wrapper panels instead of feeling like the product or example itself is the first thing the user sees.
- Page identity repeats too often: the header brand, hero eyebrow, module name, and section label create a double-introduction effect instead of a clean product spine.
- Mobile pages stack the hero, action buttons, tags, preview panel, and feature section into a long first impression before the user gets a single clear job.
- The right-side preview panels look useful, but they are visually treated almost as strongly as the primary hero, which splits attention instead of supporting one next action.
- The root page still reads more like a suite catalog than a daily assistant start surface.
- The blank EasyNotes mobile screenshot needs verification before anyone claims mobile is solid. Silence is not a layout strategy.

## Strongest Opportunities
- Turn the root protected surface into a true daily start: one next action, today context, and compact module status.
- Reduce module marketing pages to one sharp promise plus one primary action, then push feature explanation below the fold.
- Make route navigation quieter: smaller, less pill-heavy, and clearly secondary to the current page job.
- Convert tag rows into either compact metadata or hidden detail; right now they add visual noise without enough interaction value.
- Use the preview panels as evidence of the workflow, not parallel hero content.
- Establish one shared first-screen pattern across list, notes, calendar, workout, and settings so the suite feels intentional rather than assembled.

## Priority Fix
Fix the first-screen hierarchy across the main routes. Keep one dominant headline or daily action, one supporting sentence, one primary button, and one compact status or preview. Demote tags, feature inventories, secondary headings, and repeated labels below the fold or behind existing actions. This is the blocker: the product spine cannot feel calm while every page is auditioning six headings at once.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: suite cohesion is visibly better, but first-screen overload still blocks a strong personal operating system spine.

## Designer Handoff
Keep the current visual language: teal accents, soft panels, sturdy typography, and calm spacing. Now subtract. The next implementer should make the first viewport feel like a working personal assistant, not a brochure. On each primary route, reduce the top area to a single job and a single clear action, make route controls quiet, and move feature explanations lower. The result should feel faster, more confident, and less like the app is explaining its resume before helping the user.

## What Not To Do Next
- Do not add more sections to prove the product has depth.
- Do not add more badges, chips, or feature cards above the fold.
- Do not make the navigation louder to solve orientation.
- Do not start a broad redesign across every route.
- Do not touch backend, auth, settings logic, packages, deployment, or data behavior.
- Do not ignore mobile; the stacked first screen is where the clutter becomes most obvious.
- Do not replace calm hierarchy with dashboard theater.

## Next 5 Design Tasks
- [ ] Reduce the `/` first viewport to one primary daily-start message, one primary action, and compact suite status; keep existing styling and avoid adding new sections.
- [ ] On `/easylist`, demote the tag row or feature teaser below the first viewport; keep one task preview and one primary action visible.
- [ ] On `/easycalendar`, reduce competing heading levels above the fold; keep the time-block preview but make it support the headline instead of becoming a second hero.
- [ ] On `/easyworkout`, quiet the mode labels and keep the workout-start action dominant; do not add new workout controls.
- [ ] Verify `/easynotes` mobile rendering and fix any blank or invisible first-screen state; guardrail: no routing, auth, package, or data changes.

## Stop Or Continue
continue but fix visual issues first