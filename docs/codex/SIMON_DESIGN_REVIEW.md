# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is getting calmer and more cohesive, but the evidence still reads more like polished product brochure than signed-in personal operating system.

## Mission Fit
The direction partially matches the mission: shared typography, soft panels, teal accents, and repeated module-summary cards make the suite feel related. The problem is Pack 1 is Product Spine, and the current visual proof is mostly marketing surfaces, not the protected HQ or signed-in navigation where the operating-system promise actually lives. It is wearing a nice suit to the wrong meeting.

## Taste Check
The quiet palette, large confident headlines, restrained borders, and simple module proof cards feel more premium than earlier generic SaaS clutter. The copy is more concrete and the pages have a recognizable EasyLife visual language.

What is off: the layout leans too hard on the same hero formula everywhere. Big headline, pills, two CTAs, mint proof card, feature cards. Repeat it eight times and it stops feeling like a system; it feels like a template with good shoes. The mobile pages are readable, but oversized type and stacked cards make the first viewport feel heavy instead of fast.

## Visual Problems To Fix
- The latest screenshots mostly show marketing pages, so confidence is lower on whether the signed-in HQ spine actually improved.
- Mobile marketing pages have too much vertical dead space between the header and the hero card, delaying the useful content.
- The mobile header collapses to "Products + demo," which does not reinforce the connected suite or current module hierarchy.
- Hero layouts repeat the same structure across EasyList, EasyCalendar, EasyNotes, and EasyWorkout, making distinct products feel interchangeable.
- The mint proof cards are visually pleasant but too dominant on mobile; they compete with the main headline instead of supporting it.
- The chip rows are inconsistent: some wrap elegantly, some become loose, and EasyWorkout mobile loses the pill treatment entirely.
- Several proof-card rows are cramped on mobile, especially when labels, values, and badges share one line.
- The palette is drifting into a one-note teal-and-ice system; calm, yes, but a little dentist waiting room.
- Desktop pages still feel like stacked cards on a grid background instead of a confident product surface with hierarchy.
- Primary CTAs repeat generic marketing language like "Start Free" and "See Features" instead of helping the user understand the daily workflow.

## Strongest Opportunities
- Prove Pack 1 with protected HQ screenshots: show the daily start area, active module state, and connected module summaries above the fold.
- Make the signed-in AppHeader feel like a working suite control, not a marketing nav translated into app chrome.
- Compress mobile first viewports so the user sees the module purpose, one action, and proof of connected context without scrolling past ceremony.
- Give each module one distinctive functional visual moment while keeping shared spacing, type, and controls consistent.
- Add more neutral surfaces and sharper contrast so teal becomes an accent, not the whole wardrobe.
- Replace decorative proof rows with real-feeling daily states: today, next, waiting, recent, ready, overdue, logged.

## Priority Fix
The next design fix should be the signed-in first viewport proof, not another marketing polish pass. Capture and refine the protected HQ/AppHeader mobile and desktop views so the first screen clearly says: here is today, here is the next action, here is how List, Calendar, Notes, Workout, and Settings relate. Keep the layout compact, avoid new sections, and make active module state unmistakable.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: calmer shared styling improved, but the active signed-in product spine is still under-proven.

## Designer Handoff
For the next batch, stay inside the protected app shell and HQ surface. Keep the quiet typography, soft borders, direct daily-life language, and restrained color system. Change the hierarchy: fewer large cards, less repeated marketing composition, more compact working context. The user should feel like they opened a useful daily cockpit, not a brochure explaining why the cockpit might be useful someday.

## What Not To Do Next
- Do not add more marketing sections.
- Do not create another hero-card variant.
- Do not add decorative gradients, blobs, or extra visual noise.
- Do not broaden into backend, auth, payments, analytics, or data-model work.
- Do not chase novelty before proving the signed-in suite spine.
- Do not ignore mobile spacing; that is where the current heaviness is most obvious.
- Do not solve this with more copy. The hierarchy has to carry the mission.

## Next 5 Design Tasks
- [ ] Capture protected HQ desktop and 390px mobile screenshots; do not change code in this task, only verify the actual signed-in first viewport.
- [ ] Tighten the signed-in HQ first viewport so one daily action and two module statuses appear above the fold on 390px mobile; do not add new sections.
- [ ] Refine AppHeader active-module styling so the current area reads instantly on desktop and mobile; preserve existing routes and labels.
- [ ] Reduce mobile proof-card weight on one product page by tightening type scale, row spacing, and badge alignment; keep content unchanged.
- [ ] Normalize chip wrapping across EasyList, EasyCalendar, EasyNotes, and EasyWorkout; do not introduce new colors or new component patterns.

## Stop Or Continue
continue but fix visual issues first