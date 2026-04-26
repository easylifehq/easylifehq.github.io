# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is calmer and more coherent, but the product still feels like a polished brochure for a suite instead of the suite itself taking command.

## Mission Fit
The direction mostly matches Pack 1 - Product Spine: shared headers, repeated product-page structure, calmer copy, and consistent preview panels are pulling the apps into one recognizable family. The miss is that the strongest visible evidence is still marketing-page consistency, not a signed-in personal operating system where tasks, notes, calendar, workouts, and settings clearly relate in daily use. The shell has manners now; it still needs authority.

## Taste Check
The typography is strong, the restrained teal direction is credible, and the product copy has more confidence than the earlier generic SaaS fog. The hero pages feel quieter and more intentional, especially on desktop.

What is off: the design is leaning too hard on rounded cards, rounded pills, rounded preview rows, and more rounded cards. It is all very polite, but a little dentist-office productivity. Mobile has better spacing than before, yet too much above-fold height is spent on chrome, badges, and oversized preview text before the user gets to utility.

## Visual Problems To Fix
- Mobile pages have a large dead vertical gap between the top header and the hero card, making the first screen feel padded instead of purposeful.
- The mobile header CTA "Products + demo" is oversized and visually competes with the product name, especially before the main message appears.
- Hero cards, preview panels, feature cards, and metadata pills all share the same rounded-border language, flattening hierarchy.
- Mobile preview panels use type that is too large for supporting UI, so the preview feels like a second hero instead of product evidence.
- Product tag rows still occupy too much visual weight on mobile; they look like controls but mostly act as labels.
- Desktop lower feature sections still read as three equal cards in several views, which weakens editorial rhythm and makes every product page feel templated.
- The background grid is calm but slightly overexposed on mobile, adding visual texture without helping navigation or comprehension.
- The visible work still favors public marketing polish over the signed-in suite spine, which is the real mission.

## Strongest Opportunities
- Make the signed-in shell the star: one clear suite header, active product state, and cross-app orientation should feel more distinctive than the marketing pages.
- Reduce pill dependency by converting noninteractive tags into quieter inline metadata or grouped text.
- Give each product preview a different information rhythm while keeping shared structure: calendar can be grid/time based, list can be queue based, notes can be document based, workout can be session based.
- Tighten mobile first screens so the product name, core promise, primary action, and preview evidence all feel intentionally staged without dead air.
- Introduce stronger section hierarchy below heroes with lead-plus-support layouts instead of equal-card democracy. Democracy is noble. Interfaces need a director.

## Priority Fix
Fix the mobile top-of-page hierarchy across the product pages: reduce the header-to-hero gap, shrink the mobile header CTA treatment, and quiet the tag rows so the H1 and preview evidence become the obvious first read. This is the fastest way to make the current direction feel less templated and more premium without changing behavior or adding scope.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: suite consistency and polish improved, but repeated rounded-card language and weak signed-in spine keep the work from feeling morning-review impressive.

## Designer Handoff
Next batch should be a restraint pass, not an invention pass. Keep the calm typography, teal accent, concise product promises, and shared page shell. Change the mobile spacing, CTA scale, pill density, and preview hierarchy so the first viewport feels edited by a human with taste. The user should feel that EasyLife is a quiet operating system they can trust, not a collection of friendly landing pages wearing the same sweater.

## What Not To Do Next
- Do not add more sections to prove the product has depth.
- Do not add more badges, chips, pills, or tiny status labels.
- Do not redesign every product page at once.
- Do not start backend, auth, routing, integrations, analytics, or package work.
- Do not chase novelty with gradients, motion, illustrations, or decorative noise.
- Do not ignore mobile; mobile is where the current hierarchy problems are easiest to see.
- Do not keep polishing marketing while the signed-in suite spine remains underdefined.

## Next 5 Design Tasks
- [ ] Reduce mobile marketing top spacing on one product page only; preserve desktop layout and keep the H1, primary CTA, and preview visible sooner.
- [ ] Replace one mobile product tag row with quieter non-pill metadata; do not remove meaning or create new copy claims.
- [ ] Resize one mobile hero preview so it reads as supporting product evidence, not a second hero; keep tap targets and text legible.
- [ ] Rework one lower feature section from three equal cards into a lead-plus-two-support rhythm; use existing content only.
- [ ] Inspect one signed-in EasyLife surface and make one visual-only shell hierarchy improvement that clarifies the active app; avoid behavior, routing, data, and persistence changes.

## Stop Or Continue
continue but fix visual issues first