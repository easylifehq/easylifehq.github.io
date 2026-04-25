# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is finally starting to look like one product, but the marketing shell is still wearing too much padding and too many pills like it got dressed in a component library.

## Mission Fit
The direction fits the mission: the product pages now share a calmer system language, the previews are more specific, and the suite feels more connected across EasyList, EasyNotes, EasyCalendar, and EasyWorkout. The problem is not concept anymore. The problem is discipline: hierarchy, density, and first-viewport rhythm still need a firmer hand, especially on mobile.

## Taste Check
The teal accent, quiet grid, restrained cards, and operational preview panels are moving EasyLife toward a professional personal operating system. The best parts feel calm, practical, and product-aware.

What still feels off: the layout is too box-dependent, the mobile hero has oversized typography and generous gaps, and the support pills are still louder than their value. The desktop pages are cleaner, but the repeated white-card rhythm risks feeling like polite SaaS wallpaper.

## Visual Problems To Fix
- Mobile header consumes too much first-viewport height for the utility it provides.
- There is a large empty grid gap between the mobile header and hero card.
- Mobile hero headlines are heavy enough to dominate the page before the product value lands.
- Support pills wrap into bulky stacks and compete with the primary CTA.
- Hero preview cards on mobile feel too large and start too late, forcing the actual product proof below the fold.
- Desktop section rhythm still reads as stacked panels rather than a composed product page.
- The shared product previews are improved, but the row styling still feels more like mock data than lived-in interface.
- Card borders and pale teal fills are used so often that contrast and hierarchy flatten.

## Strongest Opportunities
- Tighten mobile first-view rhythm so the user sees headline, CTA, and a hint of product proof without scrolling a novella.
- Make the hero preview feel more like a real EasyLife surface: denser rows, clearer status contrast, and fewer decorative containers.
- Reduce pill prominence by treating them as quiet metadata, not secondary CTAs.
- Break the desktop "card, card, card" rhythm with one more open, editorial product section using the existing content.
- Strengthen suite identity through repeated functional patterns, not repeated rounded boxes.

## Priority Fix
Fix mobile first-viewport density across the shared product marketing shell. The header, grid gap, hero padding, tag stack, and preview card together make the mobile page feel slower than the product promise. Nami should make one focused mobile pass that reduces vertical dead space, lowers tag visual weight, and brings the product preview higher without changing copy, routing, or behavior.

## Designer Handoff
Keep the calm teal system, the operational preview concept, and the shared product-page structure. Change the density and hierarchy: mobile should feel like a sharp product page, not a padded brochure. Reduce top whitespace, compress support tags, make CTAs remain obvious, and let the preview appear earlier as proof. Desktop should keep its polished shell but needs less boxed repetition below the hero. The user should feel "this is organized and ready to use," not "this is a nice template."

## What Not To Do Next
- Do not add more sections to solve a rhythm problem.
- Do not add more colors, gradients, badges, or decorative UI.
- Do not redesign the whole marketing system.
- Do not touch backend, auth, routing behavior, packages, or deployment.
- Do not ignore mobile because the desktop screenshots look acceptable.
- Do not make every product page share the exact same preview pattern.
- Do not make the pills bigger, brighter, or more numerous.

## Next 5 Design Tasks
- [ ] Mobile product shell density pass: reduce header-to-hero whitespace and hero vertical padding at 390px while preserving tap targets and existing copy.
- [ ] Hero tag hierarchy pass: make support pills visually quieter across product pages without adding colors or changing CTA styling.
- [ ] Mobile preview lift pass: bring the hero preview higher on one product page by tightening surrounding spacing, not by deleting content.
- [ ] Desktop boxed-rhythm pass: adjust one below-hero product section so it feels less like another white card while preserving the shared shell.
- [ ] Product preview realism pass: refine one hero preview row stack with clearer status hierarchy and denser spacing, using static existing content only.

## Stop Or Continue
continue but fix visual issues first