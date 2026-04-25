# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is cleaner and more disciplined, but the marketing pages still feel like one competent template wearing five name tags.

## Mission Fit
The direction matches the mission in structure: shared navigation, common page rhythm, calmer cards, and more concrete product previews all move EasyLife toward a connected personal operating system. The miss is product identity. The suite feels related, but EasyList, EasyNotes, EasyCalendar, and EasyWorkout still borrow too much of the same visual language, so the connection reads as template repetition instead of an intentional operating system.

## Taste Check
The best parts are the restrained palette, clearer CTAs, more specific preview rows, and the recent reduction in background and pill noise. The pages are no longer screaming startup template at full volume.

The weaker parts are hierarchy and originality. Mobile still spends too much first-viewport height on header chrome, large hero copy, chips, and preview framing before the product feels usable. The pale teal preview treatment remains overused, and the lower sections still lean on boxed card rhythm. It is polished, but not yet sharp.

## Visual Problems To Fix
- Mobile headers are oversized relative to the viewport, especially the large brand block plus "Products + demo" pill.
- The gap between the header and hero card is still too tall on mobile, creating dead air before the user gets value.
- Hero cards on mobile carry too much vertical padding, making the first viewport feel slower than the product promise.
- Support pill rows still wrap into chunky secondary blocks and compete with CTAs.
- Preview panels still look like decorative marketing modules instead of compact working software, especially EasyNotes.
- EasyNotes preview headline is far too large and reads like a second hero inside the hero.
- The pale teal preview background, teal labels, teal borders, and teal pills still create a monoculture.
- Desktop product pages remain visually competent but predictable: hero, preview card, feature card row, repeat.
- Lower feature sections still use too many equal-weight boxes, flattening hierarchy.
- Product previews have better live cues, but the page system does not yet show enough cross-suite relationship beyond labels and handoff words.
- The mobile screenshots show no blocking visual bugs, but they do show a persistent density problem.

## Strongest Opportunities
- Make each product preview structurally distinct: task stack for EasyList, writing surface for EasyNotes, time rail for EasyCalendar, workout set log for EasyWorkout.
- Compress mobile hero rhythm so the promise, primary CTA, and credible preview all appear sooner.
- Treat teal as a functional accent for state and action, not as the default atmosphere.
- Replace one more equal-card lower section with a lead idea plus supporting details.
- Make preview typography feel like app UI: smaller labels, tighter rows, less billboard copy.
- Add small cross-suite moments in previews, such as "send to calendar", "queue in EasyList", or "today focus", without adding behavior.
- Give the public pages one stronger suite-level cue so the user understands these are connected tools, not separate brochures.

## Priority Fix
Fix mobile hierarchy before adding anything else. Nami should reduce the header-to-hero gap, trim hero padding, quiet the support pills, and scale preview typography down so the first mobile viewport feels like a fast product entry point instead of a polite brochure stack. Do this with CSS and existing content only.

## Designer Handoff
Keep the calm shell, clean CTAs, strong product headlines, and shared navigation. Change the density and hierarchy: mobile should feel faster, previews should feel like compact software, and lower sections should stop presenting every idea as an equal card. Keep the suite consistency, but give each product one unmistakable visual behavior. The user should feel "this all belongs together, and each tool knows exactly what job it owns."

## What Not To Do Next
- Do not add another marketing section to compensate for weak hierarchy.
- Do not make preview cards taller, glowier, or more decorative.
- Do not introduce a new loud color system just because teal is overused.
- Do not solve product identity with more copy.
- Do not add animation or illustration as frosting over layout problems.
- Do not touch backend, auth, routing behavior, persistence, packages, or deployment.
- Do not ignore desktop, but mobile is the current pressure point.
- Do not broaden the branch with another large shared visual pass.

## Next 5 Design Tasks
- [ ] Mobile header economy pass: reduce mobile public-page header height or internal spacing while preserving brand recognition, links, and tap targets.
- [ ] Mobile hero padding pass: tighten top and bottom padding inside one public product hero at 390px without deleting content or changing desktop layout.
- [ ] EasyNotes preview scale repair: reduce the EasyNotes hero preview heading and body scale so it reads as app UI, not a second hero.
- [ ] Teal restraint pass: replace one remaining pale-teal preview fill, border, or chip treatment with an existing neutral style without adding new colors.
- [ ] Lower-section hierarchy pass: convert one remaining equal-card feature row into a lead-detail layout using existing copy only and no new sections.

## Stop Or Continue
continue but fix visual issues first