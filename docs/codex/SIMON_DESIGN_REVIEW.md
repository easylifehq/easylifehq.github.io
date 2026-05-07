# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is becoming visually coherent, but it still behaves too much like a polished product brochure and not enough like a daily assistant workspace.

## Mission Fit
The direction mostly matches the mission: calm palette, shared shell, consistent cards, and clearer product grouping are moving EasyLife toward one connected personal operating system. The miss is the first-screen contract. The visible evidence still over-indexes on marketing/product explanation and module pages, while the signed-in "what should I do next today?" surface is not visually proven enough.

## Taste Check
The restrained green-gray system, chunky type, soft paper surfaces, and consistent product cards feel current and more premium than the earlier scattered suite. The best parts have a tactile notebook quality.

The weak part is hierarchy discipline. Several screens still introduce themselves like landing pages: huge headline, explanatory copy, CTA, feature chips, then more feature cards. It is handsome, but it is a demo talking about the app instead of the app doing the job. The settings screen has the opposite problem: it is functional, but the header/nav treatment is too loud and cramped, especially on mobile.

## Visual Problems To Fix
- The public product pages repeat page identity through the global brand, route nav, hero eyebrow, huge module title, CTA, chips, and then another "Features" band. That is too much ceremony before the product earns it.
- The top nav shows "Products" as both a main nav item and a button, creating duplicated route chrome on the root page. One Products affordance is enough; two is beige conference signage.
- Product detail pages use the same hero formula across EasyList, EasyCalendar, EasyNotes, and EasyWorkout, which creates suite consistency but also makes every module feel template-stamped.
- The first viewport on module pages is still CTA-led instead of task-led: "Open workspace" is prominent, but the actual next action is simulated in a side panel rather than becoming the center of the experience.
- Settings desktop header is visually awkward: the logo overlaps/competes with the nav cluster, and the More button dominates the shell.
- Settings mobile nav is oversized and cramped at the same time: large text, fat pills, tight horizontal fit, and small-target warnings in the visual report.
- Settings page stacks large cards inside a broad wrapper, making the control center feel heavier than the amount of actual settings content.
- The grid background is now recognizable, but on multiple screens it starts to feel like a default texture rather than a refined product environment.
- Mobile typography on product pages is large and readable, but vertical rhythm is too inflated; the user gets a lot of headline before they get enough usable product.

## Strongest Opportunities
- Make the signed-in Today surface the design proof: one daily read, one capture prompt, one recommended move, and compact module status above everything else.
- Turn product-module hero side panels into more functional previews: less brochure copy, more believable state, clearer action.
- Reduce route chrome: quieter nav, fewer duplicate labels, fewer chips, fewer repeated section intros.
- Give each module one distinguishing visual behavior while keeping the shared shell: tasks can feel like an inbox, calendar like time blocks, notes like writing, workout like a session logger.
- Tighten mobile spacing so the app feels designed for phone use, not merely stacked.

## Priority Fix
Fix the shell/header and first-screen hierarchy before adding or polishing more sections. The next pass should reduce duplicated nav chrome, increase tap targets, and make Today/Capture/Plan/Notes feel like the primary assistant path while More becomes quiet secondary access. Do this as subtraction: fewer labels, fewer pills, less wrapper weight, and one unmistakable daily next action.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: AI Personal Assistant Stage 0 - Salvage Audit; REASON: suite consistency is better, but the assistant-first product surface is still not visually proven.

## Designer Handoff
Keep the calm notebook palette, strong type, and shared card language. Change the hierarchy: stop letting every route introduce itself like a landing page. The next implementer should make navigation quieter, make tap targets comfortably usable, remove duplicated Products/section identity, and pull the actual daily action forward. The user should feel, "I know what to do next," not "I understand the product architecture."

## What Not To Do Next
- Do not add another section to explain the assistant.
- Do not add more chips, badges, or feature cards.
- Do not make the Today page a bigger dashboard.
- Do not introduce fake AI promises or backend-facing language.
- Do not redesign all modules at once.
- Do not ignore mobile just because desktop looks tidy.
- Do not polish marketing pages before the signed-in first screen is convincing.

## Next 5 Design Tasks
- [ ] Fix the app shell tap targets on Settings desktop and mobile; keep nav visually quiet and do not change routes or auth behavior.
- [ ] Remove one duplicated Products/nav affordance from the public shell; preserve access but reduce repeated route chrome.
- [ ] Tighten the Settings first screen spacing; reduce wrapper weight and keep only the current setting summary plus one clear section control above the fold.
- [ ] Review one product detail page and replace one brochure-style block with a more functional module preview; keep the shared visual system intact.
- [ ] Capture a fresh Today/HQ screenshot and judge it against the first-screen contract before starting new assistant surfaces.

## Stop Or Continue
continue but fix visual issues first