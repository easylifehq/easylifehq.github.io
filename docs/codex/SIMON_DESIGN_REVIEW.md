# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is finally starting to look like one calm suite, but Settings just walked in wearing a broken layout and a floating button costume.

## Mission Fit
The direction matches the mission: shared headers, calmer spacing, compact previews, and product-specific working UI cues are moving EasyLife toward a connected personal operating system. The suite now feels more intentional than experimental, especially across the marketing product pages. The problem is execution discipline: Settings has visible layout bugs, the public pages still lean too hard on repeated white card stacks, and mobile scale is not yet consistently elegant.

## Taste Check
The best work is the clearer product specificity: EasyList, EasyCalendar, EasyNotes, and EasyWorkout now have previews that feel closer to working software instead of generic feature posters. The typography is confident, the palette is quieter, and the suite shell is cleaner.

What still feels off: too many boxed panels, too much pale teal sameness, and some page sections still behave like a template got dressed up for a board meeting. Settings is the weakest visual surface right now: the desktop hero composition is awkward, the mobile type scale is oversized, and the floating add button overlaps content like it has somewhere more important to be.

## Visual Problems To Fix
- Settings desktop has a reported covered heading issue around the hero and quick-add/floating control area; this is a blocker for polish.
- Settings mobile brand/header tap target is reported as too small or awkward despite the visual button mass around it.
- Settings mobile uses oversized body copy and large vertical gaps, pushing useful controls too far down the page.
- The Settings floating add button overlaps card content on mobile, creating visual interference and reducing trust.
- Several product marketing pages still rely on large white boxed sections stacked vertically, which makes the experience feel heavier than the "calm operating system" mission.
- The pale teal grid/background treatment is still visible enough to compete with content in places.
- Hero preview cards across products are improved but still share too much visual DNA; the suite is cohesive, but the apps need a little more functional distinction.
- Desktop lower sections still have equal-card rhythm in places, flattening hierarchy and making every feature feel equally important.

## Strongest Opportunities
- Make Settings the reference surface for the logged-in suite: calm header, clean control grouping, no overlapping controls, no oversized mobile copy.
- Reduce the boxed-card habit on marketing pages by turning lower content into lighter bands, rows, and grouped editorial layouts.
- Create stronger app-specific preview details: calendar time density, list priority state, notes writing surface, workout session state.
- Normalize mobile type scale across protected pages so the app feels professional, not merely enlarged.
- Use the suite shell to create trust: consistent spacing, restrained borders, quieter backgrounds, and fewer decorative fills.
- Give primary actions a predictable placement and size, especially on mobile where floating actions currently feel aggressive.

## Priority Fix
Fix the Settings protected page first. Specifically: remove the desktop heading coverage, stop the mobile floating add button from overlapping cards, tighten the mobile hero type and vertical spacing, and make the header brand/app control feel like a deliberate navigation bar. Settings is supposed to be the suite control center; right now it is the place where the design discipline visibly breaks.

## Designer Handoff
For the next batch, stay inside the protected logged-in surfaces and repair the system before adding more polish elsewhere. Keep the current calm neutral direction, the stronger typography, and the connected-suite navigation language. Change the Settings layout so it feels like a high-trust control panel: compact hero, clean summary cards, obvious grouping, no overlapping floating controls, and mobile-first spacing that lets the user reach real settings quickly. The user should feel "this is organized and reliable," not "this page is still negotiating with itself."

## What Not To Do Next
- Do not add new sections to marketing pages to hide weak hierarchy.
- Do not introduce another accent color to solve sameness.
- Do not keep tweaking product hero copy while Settings has visible layout bugs.
- Do not enlarge mobile UI to fake accessibility; fix spacing, tap targets, and hierarchy properly.
- Do not touch backend, auth, routing behavior, package files, or deployment scope.
- Do not make a broad redesign of the suite shell; repair the specific broken surfaces.
- Do not let floating actions overlap cards or headings anywhere in the protected app.

## Next 5 Design Tasks
- [ ] Fix Settings desktop heading coverage using layout spacing or stacking only; preserve copy, behavior, routing, and existing settings data.
- [ ] Fix Settings mobile floating add button overlap so it never covers card text or controls; keep the action available without visual interference.
- [ ] Tighten Settings mobile hero typography and vertical spacing so the first real setting card appears sooner without shrinking tap targets below usability.
- [ ] Normalize the Settings header brand/app control tap area on mobile so it reads as one intentional navigation bar, not loose oversized pieces.
- [ ] Convert one remaining product marketing lower section from equal white cards into a lighter grouped band using existing content only; do not add sections or new colors.

## Stop Or Continue
continue but fix visual issues first