# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is cleaner and more coherent than before, but it still dresses a personal operating system like a product brochure with a command-center costume on top.

## Mission Fit
The direction partially matches the mission: shared typography, pale grid background, rounded panels, teal actions, and consistent module pages make the suite feel related. The problem is hierarchy. The protected first screen is supposed to help the signed-in user know what to do next today, but "One calm cockpit. Layers underneath." and the large command palette still feel like product framing before useful daily work. The public module pages are tidy, but they sell features screen after screen instead of proving the connected assistant experience.

## Taste Check
The best parts are the restraint, the muted teal system, the chunky readable type, and the concrete module demos inside the hero panels. EasyList and EasyNotes have the strongest voice because they name real user pain. The weak parts are the generic SaaS words: "command center", "cockpit", "features", "workflow", "products", "get started". The cards are competent, but the repeated brochure structure is becoming a template stamp. Mon ami, four nearly identical landing pages is not a suite spine, it is a brochure factory.

## Visual Problems To Fix
- The protected app first screen repeats "command" language in multiple places: "Today Command Center", "Command Palette", and "Type anything" create a tool-demo frame instead of a calm daily start.
- The mobile protected screen has a floating add button overlapping the command text area, which makes the primary input feel cramped and unfinished.
- The public module pages use the same stacked route chrome, hero band, feature band, and CTA pattern, so EasyList, EasyNotes, EasyCalendar, and EasyWorkout feel like duplicated marketing pages instead of connected app surfaces.
- Desktop public pages leave a large empty band between top navigation and hero content, making the actual product example arrive late.
- Mobile public pages show a large logo/header block before the product job, then another product identity label inside the hero, creating repeated page identity.
- "Start Free" and "See Features" are visually loud on every module page, competing with the real product example and pushing the suite mission toward acquisition copy.
- Pill tags under the hero headlines add visual noise without helping the user act; they read as feature inventory.
- The product pages rely heavily on white cards inside pale backgrounds, giving the app a polite but generic SaaS feeling.
- Several first viewports are too copy-heavy on mobile, especially EasyCalendar and EasyWorkout, where the product example becomes supporting evidence rather than the main event.

## Strongest Opportunities
- Turn the protected first screen into a true "Today" surface: one next action, today context, compact module status, and quiet access to the command input.
- Reduce public route chrome so module pages feel like product examples first and marketing explanations second.
- Make module examples look more like live app slices, with shared shell cues and cross-module status, instead of standalone feature cards.
- Replace generic navigation labels with suite language that matches the proposed spine: Today, Calendar, Tasks, Notes, Coach, Inbox, More.
- On mobile, prioritize one action per viewport and push secondary chips, feature cards, and explanatory copy below the first useful interaction.

## Priority Fix
The single most important design problem is the protected first screen hierarchy. It needs to stop announcing itself as a command center and start behaving like a daily assistant: lead with one clear next move, a short today status line, and compact module signals, then tuck the command palette and secondary tabs behind quieter controls. Nami should treat the floating add overlap, repeated "command" labels, and loud module-directory feeling as one repair slice.

## Magic Improvement Score
SCORE: 3; DIRECTION: flat; ACTIVE_PACK: Pack 1 - Product Spine; REASON: shared styling is coherent, but the current branch does not materially advance the shell and still lets chrome compete with daily action.

## Designer Handoff
Keep the calm palette, strong type, tactile panels, and concrete life-management examples. Change the hierarchy: make Today feel like the working app, not a demo page explaining itself. Demote command input, tabs, and feature explanation until after the user sees what needs attention. Public module pages should show believable app surfaces earlier, with less CTA noise and fewer repeated section wrappers. The result should feel like opening a trusted personal workspace, not touring four adjacent landing pages.

## What Not To Do Next
- Do not add more feature sections to the module pages.
- Do not make the command palette larger or more central on the first screen.
- Do not introduce new backend, auth, AI, account, analytics, or integration claims.
- Do not solve this with more cards, more pills, or more explanatory copy.
- Do not ignore mobile; the current overlap and vertical density are real taste problems.
- Do not start a broad visual redesign while the shell hierarchy is still unresolved.

## Next 5 Design Tasks
- [ ] Protected Today hierarchy cleanup: remove or rename repeated "command" labels, keep one next action dominant, and do not add new sections.
- [ ] Mobile command input repair: fix the floating add button overlap and preserve tap target size without changing command behavior.
- [ ] Public module header subtraction: reduce repeated logo/product identity on mobile so the module job appears sooner, with no routing changes.
- [ ] CTA quieting pass: make "Start Free" and "See Features" secondary on module pages where the product example should lead.
- [ ] Module page pattern audit: adjust one repeated feature/pill band so each module has a distinct useful first impression while keeping shared visual language.

## Stop Or Continue
continue but fix visual issues first