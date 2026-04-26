# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is calmer and more coherent, but it still looks like a well-behaved template wearing a nice shirt instead of a decisive personal operating system.

## Mission Fit
The direction supports Pack 1 - Product Spine because the product pages now share clearer navigation, common spacing, calmer language, and a recognizable suite rhythm. The issue is that the visible work still leans heavily on repeated marketing-card composition, while the mission is asking for a connected signed-in operating spine where the user immediately knows what to do today.

## Taste Check
The restraint is working: the palette is quiet, type is confident, and the repeated product preview panels make the suite feel more related. The copy is more concrete than before, especially around tasks, notes, calendar, and workouts.

What feels off is the sameness. Every screen uses the same oversized hero, pill row, pale preview box, and feature-card stack. That creates consistency, yes, but also sameness without product depth. The desktop pages feel polished but generic; the mobile pages are usable but too vertically expensive. The app is still asking a user to admire the shell before it proves daily utility.

## Visual Problems To Fix
- The first mobile viewport wastes too much height before the product proof appears, especially on EasyCalendar and EasyList.
- The preview modules are too similar across products, so each app lacks a distinct functional identity.
- Pills are overused as decoration and secondary metadata; they compete with real actions.
- Feature cards repeat the same bordered-box rhythm, making the page feel assembled rather than designed.
- The desktop hero sections are visually heavy but not dense with useful product meaning.
- The top navigation feels clean, but "Products + demo" on mobile is bulky and consumes too much header attention.
- The pale green preview panels are pleasant but too soft; they need sharper hierarchy between label, core claim, and sample content.
- Several mobile preview rows have cramped label/value relationships, especially where status chips sit inline with long values.

## Strongest Opportunities
- Turn one signed-in HQ or module screen into the actual product spine: today focus, quick capture, upcoming schedule, and cross-suite status in one disciplined first viewport.
- Give each product preview one unique visual behavior instead of the same fake table: calendar grid, task queue, note list, workout log.
- Reduce decorative pills and replace them with fewer, more useful scannable status elements.
- Tighten mobile hero spacing so the user sees both the promise and the proof without a full scroll.
- Create a stronger suite hierarchy: EasyLifeHQ first, modules second, feature explanations third.
- Make supporting sections quieter and less card-heavy so the primary workspace starts to feel premium.

## Priority Fix
Fix the signed-in first-screen hierarchy next. The current branch has polished the wrapper, but Pack 1 will not feel complete until HQ behaves like the command surface for the suite: one dominant daily focus area, one obvious quick action, and one compact cross-suite status strip visible above the fold on desktop and mobile. Stop sanding marketing pages and make the product spine earn its rent.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: calmer consistency and mobile polish improved, but the experience still lacks a commanding signed-in product spine.

## Designer Handoff
Next implementer should stay inside the existing visual system and make HQ feel more like the daily home base. Keep the quiet palette, strong type, restrained borders, and suite language. Change the hierarchy: fewer equal cards, fewer decorative pills, more useful first-screen density. The user should land and feel, "I know what matters today, and I know where to go next," not "I have arrived at another pleasant product brochure."

## What Not To Do Next
- Do not add more marketing sections.
- Do not create another repeated feature-card grid.
- Do not add visual noise to compensate for weak hierarchy.
- Do not chase new product features or backend scope.
- Do not introduce new navigation patterns before tightening the existing shell.
- Do not ignore mobile; mobile is where the current vertical padding tax is most obvious.
- Do not make every module preview use the same pale panel and row list.

## Next 5 Design Tasks
- [ ] Tighten the signed-in HQ first viewport so the primary daily focus, one quick action, and one suite status strip are visible without scrolling on mobile; do not add new data or behavior.
- [ ] Reduce decorative pill usage on one core protected screen by converting secondary pills into quieter inline metadata; preserve existing labels and actions.
- [ ] Give EasyCalendar's preview or protected month surface a more calendar-native hierarchy so scheduled content reads before chrome; no date logic or routing changes.
- [ ] Give EasyList's primary action area stronger dominance over archive/history/status elements; keep the change to spacing, grouping, and hierarchy only.
- [ ] Audit one mobile product/protected screen for row label/value crowding and adjust spacing or wrapping so long text does not feel squeezed; no copy expansion.

## Stop Or Continue
continue but fix visual issues first