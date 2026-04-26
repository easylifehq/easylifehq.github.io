# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is calmer and more coherent than before, but it still treats every product page like a padded showroom display instead of a fast personal operating system.

## Mission Fit
The branch is advancing Pack 1 - Product Spine in the right direction: the shared header, product page rhythm, preview panels, and app-specific cues are making EasyLife feel more like one suite. The mission is not fully landed because the visual system still over-explains itself. The user should feel "I can run my day here"; too often the screen still says "please admire this card stack."

## Taste Check
The best work is the restraint: soft teal surfaces, cleaner buttons, quieter borders, improved mobile header density, and previews that are beginning to show actual app behavior. EasyNotes now has more identity, and EasyList feels more compact than the earlier bloated preview.

What still feels off is scale discipline. Mobile H1s are too loud, chip groups are still heavy, and preview panels often compete with the hero instead of supporting it. Desktop looks composed, but also very templated: headline left, mint preview right, three feature cards below, repeat until the suite runs out of aliases.

## Visual Problems To Fix
- Mobile pages still have a large blank vertical band between the header and the hero card, delaying the product read.
- Mobile hero headlines are oversized relative to the viewport, especially EasyCalendar and EasyList.
- The hero card, chip group, preview panel, and lower feature section all use similar rounded-card language, so hierarchy gets mushy.
- Support chips still wrap into chunky clusters and steal attention from the primary action.
- Preview panels use the same pale teal treatment across apps, which helps suite consistency but weakens product identity.
- EasyNotes mobile preview is more specific now, but its large preview headline still reads like another marketing headline.
- Desktop lower feature sections remain too equal: three similar cards in a row gives brochure energy, not operating-system confidence.
- The background grid is controlled, but combined with all the cards it still feels like decoration rather than product structure.

## Strongest Opportunities
- Tighten the mobile first viewport so the header, hero, actions, chips, and preview feel like one sharp composition.
- Make previews smaller and denser on mobile, with app-specific row structure doing the identity work.
- Reduce chip weight so they read as supporting metadata, not navigation pretending to be jewelry.
- Convert one lower feature section into a lead-plus-support layout to break the repeated card grid.
- Bring the protected app screens into the same product-spine polish, because the mission is won after login, not in the brochure.

## Priority Fix
Fix mobile first-screen hierarchy across the product marketing pages. Reduce the top gap after the header, slightly reduce mobile H1/body scale, lighten chips, and compress preview panel padding so the first viewport feels fast and useful. Keep the shared suite shell and existing copy meaning; this is a rhythm and density repair, not a redesign.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: header density and preview identity improved, but the mobile hierarchy and repeated card system still keep the spine from feeling premium.

## Designer Handoff
Next implementer should stay on Pack 1 and do a narrow mobile composition pass. Keep the teal system, shared navigation, rounded panel language, and grounded product copy. Change the scale relationships: less top air, smaller mobile hero type, lighter chips, denser previews, and one lower section with clearer hierarchy. The result should feel like opening a calm tool you can use immediately, not touring a very polite template.

## What Not To Do Next
- Do not add new marketing sections.
- Do not add more copy to explain the product.
- Do not introduce a new color system to fake app identity.
- Do not make the preview panels bigger.
- Do not keep polishing desktop while mobile carries the obvious hierarchy problem.
- Do not touch backend, auth, routing behavior, packages, deployment, or data scope.
- Do not redesign every app page independently and lose the suite spine.

## Next 5 Design Tasks
- [ ] Reduce mobile top spacing between the marketing header and hero card, preserving desktop spacing and all routing behavior.
- [ ] Lower mobile hero H1 and body text scale on shared product marketing pages, with no copy rewrite and no desktop regression.
- [ ] Lighten product support chips on mobile by reducing visual weight while keeping readable labels and comfortable tap spacing.
- [ ] Compress mobile preview panel padding and row typography so previews read as app evidence, not second heroes.
- [ ] Rework one lower feature section from three equal cards into one lead point plus two quieter supports using existing content only.

## Stop Or Continue
continue but fix visual issues first