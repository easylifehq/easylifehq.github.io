# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is calmer and more coherent, but it still looks too much like a matched set of marketing cards and not enough like a signed-in personal operating system.

## Mission Fit
The direction supports Pack 1 - Product Spine in tone, consistency, and product clarity, especially across EasyList, EasyCalendar, EasyNotes, and EasyWorkout marketing surfaces. The problem is proof: the latest screenshots mostly show public product pages, while the mission asks for a connected professional operating system. Confidence is lower because the latest visual evidence does not clearly show the signed-in HQ spine that should be carrying this pack.

## Taste Check
The restrained green, soft grid, compact preview panels, and plain-spoken product copy are moving in the right direction. The suite now feels quieter and less random. But the repeated hero formula is getting too obedient: eyebrow, giant headline, two buttons, pill row, pale preview card, feature cards. Chic once, dealership brochure by the fourth page. Mobile typography is bold and readable, but the vertical spacing is still too expensive for a product promising speed.

## Visual Problems To Fix
- The mobile header consumes too much first-viewport height before the user sees product value.
- Product pages share the same layout so tightly that each app loses distinctive function and personality.
- The preview cards are useful, but they feel like decorative mockups more than live workflow proof.
- Mobile hero headlines are very large, creating long scroll before the user sees meaningful UI.
- Pill rows add visual weight without enough interaction value, especially on mobile.
- The desktop pages have strong alignment, but the center feels boxed and static because every surface is a rounded panel.
- Latest evidence under-represents the signed-in HQ screen, which is the actual Pack 1 battleground.
- Feature cards are clean but generic; they explain instead of making the workflow feel immediately usable.

## Strongest Opportunities
- Make signed-in HQ the visual anchor: daily focus first, then compact module status, then clear routes into List, Notes, Calendar, Workout, and Settings.
- Replace some marketing-style proof cards with tighter product-state previews that feel operational, not ornamental.
- Reduce mobile hero padding and scale so the first viewport shows action plus proof, not just brand and headline.
- Give each product a functional visual cue: calendar grid density, list completion state, note capture surface, workout logging rhythm.
- Use consistent shell language and navigation treatment across signed-in routes so EasyLife feels like one suite, not sibling landing pages.

## Priority Fix
Show the signed-in product spine in the first viewport and make it unmistakably more important than the public marketing system. Nami should focus the next batch on HQ or a protected app shell screenshot path: tighten the top chrome, surface today's primary action, and show two or three module statuses in a compact, scan-friendly layout on both desktop and 390px mobile. No new sections, no backend scope, no clever feature expansion.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: suite consistency and workflow polish improved, but the evidence still leans marketing-page polish over signed-in operating-system hierarchy.

## Designer Handoff
Keep the calm palette, sturdy typography, plain language, and reduced clutter. Change the emphasis: fewer repeated landing-page structures, more signed-in utility surfaces that show what the user does next. The next implementer should make EasyLife feel like a daily cockpit, not a product catalog. The user should feel, within one glance, "I know what matters today and where each life area lives."

## What Not To Do Next
- Do not add more marketing sections.
- Do not create another giant hero pass.
- Do not add decorative cards just to fill space.
- Do not broaden into backend, auth, routing, or persistence.
- Do not keep polishing product pages while the signed-in HQ remains under-proven.
- Do not ignore mobile height; this product lives or dies by first-screen usefulness.
- Do not invent new product claims to compensate for weak hierarchy.

## Next 5 Design Tasks
- [ ] Capture and review signed-in HQ desktop and 390px mobile screenshots before the next design task; guardrail: no app code changes in this task.
- [ ] Tighten signed-in HQ first viewport so daily focus and at least two module statuses appear without scrolling on 390px mobile; guardrail: no new sections or data model changes.
- [ ] Convert one decorative HQ or app-shell card treatment into compact operational rows; guardrail: preserve existing content and behavior.
- [ ] Reduce mobile header and hero vertical waste on one product page as a pattern test; guardrail: do not change desktop layout beyond necessary responsive CSS.
- [ ] Make one product preview feel more live by emphasizing state, action, and outcome over labels; guardrail: use existing mock content only.

## Stop Or Continue
continue but fix visual issues first