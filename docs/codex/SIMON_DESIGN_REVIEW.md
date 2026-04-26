# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is calmer and more coherent, but it still feels like a polished set of product brochures trying to become a signed-in personal workspace.

## Mission Fit
The current direction mostly matches Pack 1 - Product Spine: shared navigation, consistent product language, and calmer module previews are moving toward one connected suite. The weakness is that the visible evidence is still heavily marketing-led, while the mission needs the signed-in HQ and core apps to feel like the actual spine. Screenshots are present, but confidence is lower because the latest visual evidence mostly shows marketing/product pages, not the protected daily workspace.

## Taste Check
The restrained teal, soft panels, and direct task/calendar/notes/workout copy feel more intentional than earlier generic SaaS language. The hierarchy is cleaner, and the suite now has a recognizable visual family.

What feels off: the pages are too template-repeated, the card-and-pill vocabulary is overused, and mobile has too much ceremonial whitespace before the useful content. The palette is also flirting with one-note mint office decor. Chic, but a little dental.

## Visual Problems To Fix
- Mobile pages have a large dead zone between the header and hero card, delaying the actual product message.
- The same bordered hero-card pattern repeats across products, making EasyList, EasyNotes, EasyCalendar, and EasyWorkout feel interchangeable.
- Pills are still too prominent on mobile and compete with primary actions.
- Several hero headings are oversized for mobile, creating heavy line stacks before the user reaches useful proof.
- The right-side desktop preview panels are polished but still read like mockups, not an integrated workspace system.
- The mobile header "Products + demo" button is visually heavy and pulls attention from the product page content.
- The suite relies too much on pale teal panels, soft borders, and rounded chips; it needs sharper contrast in information structure, not more chrome.

## Strongest Opportunities
- Make the signed-in HQ first screen the real proof: one strong daily action, one connected suite status row, and less decorative framing.
- Create clearer module-specific silhouettes so List, Notes, Calendar, and Workout feel related but not cloned.
- Reduce mobile hero height by tightening top spacing, chip rows, and preview panel padding.
- Turn repeated marketing preview cards into more product-like surfaces: denser rows, clearer active states, fewer theatrical labels.
- Use one shared suite navigation treatment across marketing and protected screens, but let protected screens feel more operational and less pitchy.

## Priority Fix
Fix the mobile first-screen density and hierarchy across the product spine. The next pass should remove the dead air above hero content, reduce chip weight, and make the first viewport show a primary action plus one concrete product proof without forcing the user to scroll through a brochure stack.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: the suite is calmer and more consistent, but the signed-in product spine still lacks a decisive first-screen hierarchy.

## Designer Handoff
Keep the calm visual system, the direct language, and the restrained border treatment. Change the hierarchy: mobile should get to useful proof faster, desktop should feel less like matching landing pages, and protected screens should look like the place where life gets managed. The user should feel, within one glance, "this is where I start today", not "this is a well-behaved product tour."

## What Not To Do Next
- Do not add more marketing sections.
- Do not add more pills to prove the suite is connected.
- Do not introduce new colors as decoration instead of fixing hierarchy.
- Do not touch backend, auth, routing, persistence, dependencies, deployment, or package files.
- Do not broaden into every screen at once; repair one visible spine surface at a time.
- Do not ignore mobile just because automated visual inspection found no blocking bugs.

## Next 5 Design Tasks
- [ ] Tighten mobile product-page hero spacing so the first viewport shows the headline, primary action, and at least one proof surface; do not add new content or routes.
- [ ] Quiet one repeated pill row treatment on a core product page by converting it to lighter inline metadata; preserve copy meaning and behavior.
- [ ] Give one protected signed-in page a more operational first-screen layout with clearer primary action dominance; no data, routing, or auth changes.
- [ ] Reduce nested card weight in one preview/workspace panel so rows feel like usable product state instead of decorative mock data.
- [ ] Add one module-specific visual distinction to EasyNotes, EasyCalendar, or EasyWorkout using existing components and CSS only; avoid new feature scope.

## Stop Or Continue
continue but fix visual issues first