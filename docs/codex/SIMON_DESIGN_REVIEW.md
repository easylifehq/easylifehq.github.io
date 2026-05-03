# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
The suite now has a calmer shared skin, but it still looks like four polished brochure templates standing in for the actual personal operating system.

## Mission Fit
The current direction supports EasyLife's mission through consistent typography, muted color, shared cards, and calmer product language. The problem is focus: the visible evidence is mostly public product pages, not the signed-in daily start surface promised by Pack 1 and INFORMATION_STAGING.md. EasyLife should open on what matters today; these screens still open on what the product says about itself.

## Taste Check
The best parts are the restraint, the tactile green tone, the clean mock panels, and the move away from loud SaaS nonsense. The mobile layouts are readable and the module mockups give each product a concrete job.

What is off: every page uses the same giant hero formula, the same feature band, the same CTA pair, and the same pill row. It is cohesive, yes, but also too templated. The grid background and oversized rounded wrapper cards are beginning to feel like a design system audition instead of a personal assistant app. Very tidy. Slightly asleep.

## Visual Problems To Fix
- The top route chrome is too loud on customer-facing pages: the large floating header card repeats EasyLifeHQ and eats first-screen space before the product has done anything useful.
- Mobile pages show a big brand header, then another product label, then another hero title; that stacked identity makes the real page feel buried under presentation layers.
- The hero H1s are oversized across all modules, especially on mobile, pushing the useful mock panel and feature content too far down.
- "Start Free" and "See Features" dominate every product page even when the mission needs the user to understand the product job first, not stare at repeated acquisition controls.
- The feature sections repeat the same intro-card rhythm across EasyList, EasyCalendar, EasyNotes, and EasyWorkout, making the suite feel cloned rather than connected.
- The product mock panels are promising, but they are still decorative previews; they do not yet feel like the actual working app surface or daily next action.
- The pale grid background is visually gentle but slightly generic, and it competes with the app's promise of practical personal utility.
- Desktop pages have large vertical gaps between header, hero, and content; the hierarchy is clean but not efficient enough for a fast personal operating system.

## Strongest Opportunities
- Make the signed-in HQ first screen the design north star: one daily next action, today context, and compact module status should set the suite's identity.
- Reduce route chrome so product pages feel like real product surfaces, not demos inside a wrapper.
- Turn the mock panels into stronger product evidence: fewer fake rows, more believable daily state, clearer relationship between tasks, calendar, notes, and workouts.
- Give each module one distinct interaction pattern while keeping shared spacing and components, so cohesion does not become sameness.
- On mobile, compress the brand header and bring the primary product evidence into the first viewport faster.

## Priority Fix
Reduce the repeated first-screen chrome before adding anything else. Nami should make one narrow pass that compresses the public page header on mobile and desktop, quiets repeated product identity, and brings the module preview or daily-use evidence higher in the first viewport. Keep the shared visual system, but stop making the user walk through a lobby before seeing the product.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: shared suite styling is clearer, but the product spine still reads as repeated marketing pages more than a daily operating system.

## Designer Handoff
Keep the restrained palette, tactile panels, strong black typography, and concrete module language. Change the hierarchy: make navigation useful but quieter, shrink the ceremonial header space, and let the first screen show work, state, and next action sooner. The user should feel "I know what to do today" before they feel "I am reading a product page." The next batch should subtract chrome, compress vertical rhythm, and make the module previews feel connected to one personal system.

## What Not To Do Next
- Do not add more marketing sections.
- Do not invent a new visual theme or color system.
- Do not make the feature cards more decorative.
- Do not add more CTAs above the product evidence.
- Do not touch backend, auth, packages, deployment, or data behavior.
- Do not ignore mobile; mobile is where the hierarchy problem is loudest.
- Do not solve sameness by making every module wildly different.

## Next 5 Design Tasks
- [ ] Compress the public page header height on desktop and mobile; keep brand recognition, but do not let route chrome consume the first viewport.
- [ ] Remove or quiet one repeated identity layer on product pages; avoid showing brand, product label, and giant title as three competing intros.
- [ ] Move the module preview higher on mobile; guardrail: no new sections, no new features, no layout overflow.
- [ ] Tighten hero typography and spacing across product pages; guardrail: preserve readability and shared system feel.
- [ ] Make one product preview row show cross-suite connection, such as a task becoming a calendar block; guardrail: present it as UI evidence, not a fake integration claim.

## Stop Or Continue
continue but fix visual issues first