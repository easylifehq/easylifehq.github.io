# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is becoming calmer and more coherent, but it still reads like a polished collection of product surfaces rather than a decisive signed-in personal operating system.

## Mission Fit
The current direction supports the mission: shared spacing, quieter chrome, better mobile density, and recent EasyCalendar workflow repairs all move toward a connected, practical suite. The miss is emphasis. Pack 1 is Product Spine, and too much proof still appears to be coming from marketing polish and individual module refinement instead of a first-screen signed-in HQ that immediately says: here is your day, here is what matters, here is where each module fits.

## Taste Check
The best work is the restraint: calmer panels, less decorative chip noise, more compact mobile hierarchy, and practical workflow fixes like reversible Plan My Day and custom weekday recurrence. That is real product taste, not brochure theater.

The weaker work is still hierarchy. The suite has been sanded down, but the top-level product spine is not yet sharp enough. Repeated tiny HQ compression passes suggest the screen is fighting its own structure. When a design needs five rounds to say "start here," the layout is whispering into a pillow.

## Visual Problems To Fix
- The signed-in HQ still does not appear to have a single dominant daily command center that clearly outranks module summaries.
- Module status rows may be calmer, but they risk becoming visually equal-weight metadata instead of a clear suite map.
- Marketing and protected surfaces appear more consistent than meaningfully connected; consistency is not the same as orchestration.
- EasyCalendar feature improvements add useful behavior, but the surrounding form/drawer experience now needs a visual pass so recurrence controls do not feel bolted on.
- The branch touches many UI surfaces, so small style decisions in `globals.css` may be carrying too much product identity without enough screen-specific intent.
- Mobile density has improved, but the core challenge remains first-viewport priority: primary action, current state, next useful status, then everything else.

## Strongest Opportunities
- Make HQ the unmistakable product spine: one compact daily-focus surface, then a tight suite status strip that links List, Notes, Calendar, Workout, and Settings as parts of one system.
- Turn module statuses into a recognizable shared pattern with consistent title, state, next action, and subdued metadata.
- Give EasyCalendar's new planning and repeat controls a calmer interaction hierarchy: preview, confirm, undo, and recurrence should feel like one composed planning tool.
- Use less decorative emphasis and more operational emphasis: current state, next action, completion, scheduled time, and capture points.
- Preserve the quiet visual language, but add one stronger structural gesture so the app feels designed, not merely cleaned.

## Priority Fix
Fix the signed-in HQ first screen as the product spine. The next design task should not add another card, section, or marketing proof point. It should clarify the first viewport into three levels: primary daily action at the top, compact cross-module status immediately below, and secondary context only after that. The result should make a busy user understand the whole suite in five seconds without scrolling or decoding equal-weight panels.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: useful workflow and polish progress, but the active pack still lacks a visually decisive signed-in suite spine.

## Designer Handoff
For the next batch, stay inside protected product surfaces and treat HQ like the operating table for the whole suite. Keep the calmer tone, compact spacing, restrained panels, and practical workflow language. Change the hierarchy: make the daily-start area visually dominant, make module statuses feel like one connected strip or stack, and reduce any secondary chrome that competes above the fold. The user should feel less like they opened five cleaned-up apps and more like they opened one calm control room for the day.

## What Not To Do Next
- Do not add more marketing sections or hero polish to prove Pack 1.
- Do not add new modules, new data, or new backend-shaped product promises.
- Do not keep nibbling at padding if the real issue is structural hierarchy.
- Do not make every card quieter until nothing has priority.
- Do not ignore the EasyCalendar form/drawer polish after adding recurrence complexity.
- Do not start Pack 2 until HQ can carry the suite story on its own.

## Next 5 Design Tasks
- [ ] Refine the signed-in HQ first viewport so the primary daily action is visually dominant and two module statuses appear below it without adding new sections or behavior.
- [ ] Standardize the module status treatment on HQ into one compact pattern with consistent title, state, next action, and metadata; do not change routing or data.
- [ ] Polish the EasyCalendar event composer layout so event fields, deadline controls, and custom recurrence read in a clean top-to-bottom order on desktop and mobile.
- [ ] Review mobile HQ at 390px and remove one source of above-the-fold competition, with no new copy blocks and no desktop redesign.
- [ ] Audit shared panel/chip styling touched in `globals.css` and reduce any over-weight decorative treatments that make secondary context compete with primary actions.

## Stop Or Continue
continue but fix visual issues first