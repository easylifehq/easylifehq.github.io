# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is finally speaking with one voice, but it is still wearing too many rounded white boxes like a nervous startup deck.

## Mission Fit
The direction mostly matches the mission: the product pages now feel connected, calm, and professional, with shared header behavior, consistent preview language, and clearer app identities across EasyList, EasyNotes, EasyCalendar, and EasyWorkout. The best progress is the unified suite shell and the working-UI previews, which make the apps feel related instead of randomly themed. The weak spot is still hierarchy density: mobile hero cards and preview panels compete for attention, and the page structure can feel like stacked containers rather than a confident operating system.

## Taste Check
The typography has presence, the restrained green-teal system feels more mature than generic blue SaaS, and the previews now communicate real product moments instead of empty marketing decoration. The product copy is sharper and more specific.

What is off: the repeated large white cards, pill clusters, thick rounded preview boxes, and pale teal fills are becoming a house style by accident. Desktop looks orderly but a bit too boxed-in. Mobile is usable, but the preview panels are too large and loud, almost like second hero sections. The grid background is calmer now, but still risks making the whole product feel like a template with good copy pasted into it.

## Visual Problems To Fix
- Mobile hero spacing still leaves a very large decorative gap between the header and the main product card.
- Preview panels on mobile are oversized relative to the hero text and should feel like compact app UI, not a second billboard.
- Support pills wrap into bulky clusters and steal vertical space from the actual product story.
- Desktop pages rely too heavily on white bordered cards stacked inside a pale background, which flattens the hierarchy.
- The product preview rows are more realistic than before, but several still use the same two-column label/value rhythm, making apps feel interchangeable.
- Button sizing is strong on desktop but heavy on mobile, especially when paired with chips and large preview panels.
- The header feels clean, but the mobile "Products + demo" button is visually dominant enough to compete with the page title.
- The palette is calmer, but the pale teal treatment is still overused across cards, pills, preview headers, and backgrounds.

## Strongest Opportunities
- Make each product preview more function-specific: calendar should feel scheduled, notes should feel written, tasks should feel actionable, workout should feel logged.
- Reduce card-on-card visual weight by turning some lower sections into open bands with tighter content groups.
- Give mobile a stricter vertical economy: smaller chips, tighter CTA rhythm, and preview panels that arrive sooner without shouting.
- Use one premium suite-level pattern across protected app pages: consistent page header, compact summary panel, and restrained action area.
- Add more contrast between marketing surfaces and working app surfaces so the public pages sell the product while the app itself feels operational.

## Priority Fix
Fix mobile preview scale and hierarchy next. The mobile pages are not broken, but the preview cards are too big, too rounded, and too typographically loud, so they read like another marketing block instead of a glimpse of the app. Nami should tighten preview padding, reduce preview heading/body scale, shrink row text where needed, and keep the preview visibly below the hero story without making it feel like a separate hero.

## Designer Handoff
Keep the current calm suite direction, the strong product headlines, the unified header, and the idea of static working-UI previews. Change the proportions: mobile needs smaller preview typography, slimmer chips, less vertical breathing room between header and hero, and preview rows that feel closer to real software. Desktop should keep the wide confident layout, but soften the "three cards in a lunch tray" effect by making lower sections feel more editorial and less boxed. The result should feel like a professional personal operating system: composed, useful, quick to scan, and quietly premium.

## What Not To Do Next
- Do not add more sections to solve hierarchy problems.
- Do not add more accent colors or decorative gradients.
- Do not make the preview panels larger or more illustrated.
- Do not chase novelty before fixing mobile density.
- Do not change backend, auth, routing behavior, payments, analytics, deployment, or package scope.
- Do not ignore protected app surfaces while polishing only marketing pages.
- Do not keep adding pills as a substitute for real product differentiation.

## Next 5 Design Tasks
- [ ] Mobile preview scale pass: reduce typography and padding inside one product hero preview at 390px, preserving copy, links, tap targets, and desktop layout.
- [ ] Mobile chip economy pass: tighten one product page support-pill cluster so it uses less vertical space without deleting content or changing meaning.
- [ ] Product differentiation pass: adjust one preview row set so its labels and values feel specific to that product workflow, using static content only.
- [ ] Lower-section card relief pass: convert one desktop lower marketing section from equal card/card/card weight into a lighter grouped layout with existing content only.
- [ ] Protected suite rhythm pass: inspect one logged-in app page and align its header or primary panel spacing with the calmer shared EasyLife system, with no behavior changes.

## Stop Or Continue
continue but fix visual issues first