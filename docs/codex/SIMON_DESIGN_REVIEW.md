# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is finally starting to look like one product, but the marketing pages still feel too inflated, too boxed, and too pleased with their pale teal worksheet aesthetic.

## Mission Fit
The direction matches the mission better than previous rounds: shared header, repeated hero structure, product-specific previews, and consistent CTA language all support the connected personal operating system idea. The problem is that the current execution leans more "calm product brochure" than "fast professional suite"; it explains the apps clearly, but it does not yet make them feel sharp, daily, or operational enough.

## Taste Check
The typography has confidence, the product names are clear, and the hero previews are more specific than generic SaaS filler. The repeated teal-tinted panels, pill stacks, fat mobile spacing, and rounded white containers are starting to flatten the whole suite into one soft blob. Premium calm is good. Padded dentist-office calm is not the target.

## Visual Problems To Fix
- Mobile headers still consume too much first-viewport height before the actual product value appears.
- Hero previews on mobile are still oversized compared with real app UI, especially row height, card padding, and headline scale inside previews.
- The pale teal background, pale teal preview fills, pale teal pills, and pale teal borders create a low-contrast monoculture.
- Desktop pages still rely on large white boxed sections stacked vertically, which makes the page rhythm feel modular but not sophisticated.
- Product previews use rows that are clearer now, but many still read as labeled marketing mockups rather than believable working surfaces.
- Pills under the hero copy compete with the primary CTA and add clutter without enough information density.
- The visual system is consistent, but not yet differentiated enough between product functions; Calendar, List, Notes, and Workout feel related, but slightly interchangeable.

## Strongest Opportunities
- Make the hero preview feel like a compact real app surface: smaller type, tighter rows, useful status marks, and less brochure copy inside the mock.
- Reduce the number of visible pills on mobile or make them quieter metadata so the CTA and preview own the hierarchy.
- Introduce stronger section rhythm by alternating open content bands, tighter grids, and lighter dividers instead of another white card parade.
- Give each product one distinctive functional visual cue while keeping the shared shell: calendar slots, task priority, note list density, workout set logging.
- Use contrast more bravely: keep teal as the brand anchor, but let neutral ink, white space, and restrained borders do more of the work.

## Priority Fix
Fix the mobile hero density. At 390px, the first viewport still spends too much space on logo/header, oversized headline, large CTA row, chip stack, and then an inflated preview. Nami should tighten the mobile product hero system so the product preview appears sooner and reads like compact working UI, not a poster version of the UI.

## Designer Handoff
Keep the shared product shell, the direct headlines, and the product-specific preview concept. Change the mobile proportions first: reduce vertical gaps, quiet the support pills, shrink preview internals, and make row stacks feel like actual controls or records. On desktop, stop adding more boxed relief one page at a time and establish a cleaner pattern: hero card, then open band or lightly divided content, then cards only where cards represent discrete objects. The user should feel "this is a calm suite I can use every morning," not "I am scrolling through five tasteful containers."

## What Not To Do Next
- Do not add more marketing sections to compensate for weak hierarchy.
- Do not introduce another accent color just to escape the teal problem.
- Do not make the previews larger; make them more believable.
- Do not keep solving desktop card rhythm one isolated page at a time without defining the shared pattern.
- Do not ignore mobile because the automated visual report says there are no bugs.
- Do not touch backend, routing behavior, auth, dependencies, or architecture to solve a visual problem.

## Next 5 Design Tasks
- [ ] Tighten the shared mobile product hero vertical spacing so the preview begins earlier at 390px; preserve all current copy and tap targets.
- [ ] Reduce mobile hero preview internal scale for one product page: smaller preview heading, tighter row height, and less card padding; do not enlarge the preview container.
- [ ] Quiet the hero support pills on mobile by reducing visual weight or count shown above the preview; keep them readable and secondary to CTAs.
- [ ] Convert one remaining desktop lower marketing section from stacked white cards into a lighter content band with clear dividers; use existing content only.
- [ ] Add one compact functional detail to a product preview that makes it feel like working UI; no new behavior, no data fetching, no new section.

## Stop Or Continue
continue but fix visual issues first