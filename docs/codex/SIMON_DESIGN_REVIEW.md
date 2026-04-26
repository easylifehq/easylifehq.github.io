# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is starting to look like one calm suite, but the current screens still confuse "premium" with oversized type, padded cards, and the same pale green box wearing five different hats.

## Mission Fit
The direction mostly matches Pack 1 - Product Spine: shared header, repeated product page structure, consistent preview cards, and calmer spacing are moving EasyLife toward a connected personal operating system. The issue is that the spine still feels more like a polished marketing template than a lived-in product shell. It explains the apps, but it does not yet make the relationship between list, notes, calendar, workout, and settings feel inevitable.

## Taste Check
The restrained teal, soft surfaces, heavier headings, and compact preview rows are cleaner than generic startup glitter. The product copy is more grounded than before, and the UI has a quieter, more trustworthy rhythm.

What feels off: the first viewport is still too inflated, especially on mobile. The header, hero, pill group, preview panel, and feature section all compete for ceremonial importance. The repeated rounded cards make every app page feel cloned. The background grid is calmer than a full SaaS confetti wall, but it still reads like decoration trying to look like system architecture.

## Visual Problems To Fix
- Mobile pages have too much vertical dead space between the header and hero card, making the first screen feel slow before the product even speaks.
- Hero typography is still oversized on mobile; several headlines dominate the screen instead of creating a fast, useful product read.
- The preview module on mobile still feels like a second hero, not a compact glimpse of working app UI.
- Pill chips are visually heavy and take too many lines, especially on EasyList, EasyCalendar, and EasyWorkout mobile.
- The product pages share structure so literally that each app loses identity after the headline and preview labels.
- Feature cards below the hero remain too equal in weight, creating a card/card/card rhythm instead of a clear editorial hierarchy.
- The header brand block is clean but bulky on mobile; the logo, wordmark, and CTA consume too much prime height.
- The pale teal preview panels are attractive, but used everywhere they flatten the suite into one flavor.

## Strongest Opportunities
- Tighten the mobile first viewport so header, headline, action, chips, and preview feel like one composed product moment.
- Make each app preview more specific through layout texture, not more copy: calendar rows should not feel structurally identical to task rows and workout rows.
- Reduce chip prominence and let one strong product promise plus one preview carry the screen.
- Introduce subtle app-level identity through density, row structure, icon treatment, or accent placement while keeping the shared shell intact.
- Convert lower feature sections from equal cards into one lead idea plus two quieter supporting points.
- Give the protected app shell the same design discipline as the public pages, because the mission is a personal OS, not a brochure with backstage rooms.

## Priority Fix
Fix the mobile first-viewport hierarchy across the product pages. Reduce the top gap after the header, scale down mobile hero type and body copy slightly, make chips lighter, and make the preview module read as compact app evidence rather than another headline block. Nami should treat this as a CSS and layout rhythm pass, not a content rewrite.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: shared suite polish is clearer, but mobile hierarchy and repeated card structure still keep it from feeling premium.

## Designer Handoff
Next batch should be a disciplined mobile hierarchy pass, focused on first-screen rhythm and preview density. Keep the shared teal system, quiet borders, calm copy, and consistent suite navigation. Change the scale relationships: smaller mobile H1s, tighter header-to-hero spacing, lighter chips, less preview padding, and more compact row typography. The user should feel like EasyLife is fast, composed, and ready to use, not like they are scrolling through a pitch deck wearing app clothes.

## What Not To Do Next
- Do not add more sections to solve a hierarchy problem.
- Do not introduce new colors or gradients just to make the apps feel different.
- Do not redesign every product page independently and lose the suite spine.
- Do not touch backend, routing, auth, persistence, packages, or deployment scope.
- Do not keep polishing desktop while mobile carries the obvious weight problem.
- Do not add more explanatory copy; the interface needs sharper composition, not a longer monologue.
- Do not make the preview panels larger. They already had dinner.

## Next 5 Design Tasks
- [ ] Reduce mobile hero H1 and body scale on shared product marketing pages, preserving desktop layout and all existing copy meaning.
- [ ] Tighten the mobile vertical gap between the marketing header and first hero card without changing routing, header behavior, or desktop spacing.
- [ ] Make product support chips lighter on mobile by reducing padding, border weight, or font size while keeping tap targets readable.
- [ ] Compact the mobile preview panels so rows read like app UI evidence, not secondary hero content, with no behavior or data changes.
- [ ] Rework one lower feature section from three equal cards into a lead-plus-support hierarchy using existing content only.

## Stop Or Continue
continue but fix visual issues first