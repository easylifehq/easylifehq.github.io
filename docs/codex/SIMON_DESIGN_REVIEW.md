# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward a calmer suite, but the current evidence still reads more like careful cleanup than a fully resolved personal operating system.

## Mission Fit
The direction matches the mission: shared polish, consistent spacing, better hierarchy, and safer mobile behavior all support the goal of one connected professional suite. The issue is confidence. The visible review is mostly root-page screenshots plus reports, so I can see safety and intent, but not enough cross-app proof that EasyList, EasyNotes, EasyCalendar, EasyWorkout, and Settings now feel like one premium system instead of related rooms in the same office park.

## Taste Check
The best part is the discipline: small changes, passed builds, clean scope, and no forbidden backend cosplay. That is exactly the right product hygiene for this mission. The weak part is that repeated shared CSS polishing can easily become visual spackle: nicer surfaces, but not necessarily stronger hierarchy. The mobile tap-target issue on the site brand is small, but it is also the kind of detail a premium product does not miss.

## Visual Problems To Fix
- Mobile header brand link is too short vertically for comfortable tapping, reported at 356x34px on `a.site-brand`.
- The visual QA evidence is too root-page heavy; app-level screenshots are needed before claiming suite-level polish.
- Repeated `globals.css` edits increase the chance of quiet regressions in cards, buttons, spacing, and mobile wrapping across the suite.
- The current design progress appears incremental but not yet decisively unified around a clear suite shell hierarchy.
- Theme and accent work risks becoming decorative if it is not anchored to scanability, status, and daily workflow clarity.
- Settings is moving toward a control center, but it needs a stronger information hierarchy than "polished panels with helper text."

## Strongest Opportunities
- Establish one unmistakable suite rhythm: same page header structure, same section spacing, same card density, same empty-state voice.
- Make mobile feel intentionally designed, not merely compressed from desktop.
- Use app-specific accents only as navigation and state cues, not as decoration looking for a job.
- Tighten the root/header touch behavior first; small interaction misses weaken trust fast.
- Add app-level visual QA screenshots for the five core areas before more aesthetic passes.

## Priority Fix
Fix the mobile suite shell/header interaction and spacing first, starting with the `a.site-brand` tap target. Make the brand area feel deliberate on mobile: at least 44px tall, aligned cleanly with the nav/header rhythm, no cramped text, no accidental vertical squeeze. This is small, reviewable, and it protects the first impression.

## Designer Handoff
Keep the current calm, professional direction and the small-batch discipline. Change the next batch from "make it more premium" to "prove the suite system": inspect one core app page at a time on desktop and mobile, then normalize header rhythm, card density, button scale, and empty-state hierarchy. Do not add more sections or louder visuals. The result should feel like the user opened one connected operating system with different tools inside it, not five polished tabs wearing similar jackets.

## What Not To Do Next
- Do not add more theme personality before fixing mobile shell ergonomics.
- Do not keep making broad `globals.css` changes without app-level screenshot checks.
- Do not add new dashboard sections to create a sense of progress.
- Do not chase Apple-like gloss if the hierarchy still needs work.
- Do not ignore mobile because the bug count is low.
- Do not touch backend, auth, routing, persistence, dependencies, or architecture.

## Next 5 Design Tasks
- [ ] Fix the mobile `a.site-brand` tap target to meet comfortable touch sizing, keeping layout and routing behavior unchanged.
- [ ] Capture and review desktop/mobile screenshots for EasyList, EasyNotes, EasyCalendar, EasyWorkout, and Settings before further shared CSS polish.
- [ ] Normalize one core app page header to the suite pattern, changing only spacing, copy hierarchy, or visual rhythm.
- [ ] Audit one card-heavy page for overcrowded metadata and reduce visual noise without removing existing content or behavior.
- [ ] Improve one mobile app page where controls or cards feel cramped, with no changes to data, routing, auth, or dependencies.

## Stop Or Continue
continue but fix visual issues first