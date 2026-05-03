# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is becoming more coherent and calmer, but it still reads too much like a polished product brochure instead of a signed-in personal operating system.

## Mission Fit
The direction supports Pack 1 better than before: shared typography, teal system color, compact preview panels, and repeated module structure make the suite feel more connected. The problem is mission hierarchy. The mission says the first protected screen should help the user know what to do next today, but the reviewed surfaces still spend too much energy explaining modules, selling features, and repeating product framing. Useful, yes. Personal operating system, not yet. It is wearing a nice blazer but still handing out flyers.

## Taste Check
The best parts are the restraint, consistent card treatment, quiet teal, strong type scale, and more concrete product language. The module previews feel practical and much less generic than earlier SaaS mush.

What is off: the pages lean heavily on oversized marketing hero composition, repeated cards, feature bands, and pill clusters. On mobile, the typography is confident but slightly heavy, and the first screen becomes a tall stack of explanation before the user reaches action. The background grid is tidy but a little too "template demo"; it does not yet feel deeply personal or lived-in.

## Visual Problems To Fix
- The top route chrome is visually loud: the header sits in its own large rounded panel, then the hero sits in another large rounded panel, so the actual product content feels buried under wrapper furniture.
- Mobile first screens are too tall before meaningful action depth; the user sees brand, headline, copy, buttons, tags, and preview before any compact "what next today" structure appears.
- The same marketing pattern repeats across EasyList, EasyCalendar, EasyNotes, and EasyWorkout, which helps consistency but also makes the suite feel like cloned landing pages instead of distinct working tools.
- CTA hierarchy is not aligned with the product mission: "Start Free" and "See Features" dominate, while daily-use actions and signed-in next steps are not the visual anchor.
- Pill tags are overused in the hero area; they create early clutter and make the page feel like it is inventorying features instead of guiding one next action.
- Desktop has too much ceremonial whitespace above the hero, especially under the header; the first screen spends premium space on air and chrome rather than product value.
- Preview cards are useful but too explanatory; they show mini feature lists rather than a sharper live state like "today", "next", "recent", or "waiting".
- Mobile preview rows have tight label/value/status spacing, especially in EasyList and EasyNotes, where small status words sit close to heavier text and feel cramped.
- The repeated "Features" section immediately below each hero reinforces brochure behavior; it should be quieter or pushed deeper unless the route is explicitly public marketing.
- Settings remains a known risk area from the recent review trail: if it still exposes too many controls in the first viewport, it breaks information staging for the suite control center.

## Strongest Opportunities
- Turn the protected HQ first screen into a true daily start surface: one next action, today context, and four compact module signals.
- Make public product pages quieter by reducing route chrome and letting the product preview carry more of the story.
- Replace feature-pill clusters with one or two purposeful secondary actions, then move the rest behind tabs, accordions, or deeper sections.
- Give each module one distinctive working preview: EasyList should feel like a live triage list, EasyCalendar like a day plan, EasyNotes like recent capture, EasyWorkout like session state.
- Tighten mobile type scale and spacing so the pages feel designed for thumb use, not merely desktop content stacked vertically.
- Add more visible active state and "today" language across app surfaces so the suite feels current, not static.

## Priority Fix
Reduce first-screen chrome and marketing repetition before adding anything else. The next pass should make the first viewport feel like a usable EasyLife start point: smaller header, quieter route controls, one dominant daily action, compact module status, and fewer feature pills. Keep the calm visual system, but stop making every route introduce itself like it just walked on stage.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: shared suite styling is clearer, but first-screen hierarchy still behaves too much like repeated marketing pages.

## Designer Handoff
Keep the current typography, restrained teal, soft panels, and concrete language. Change the hierarchy. Compress the global header, reduce repeated hero furniture, and make the first visible content answer "what should I do next today?" before it explains every module. Public pages can still sell the product, but they should feel like product-led demos, not a tour brochure. The user should feel that EasyLife is already organizing their day, not asking them to admire its feature list.

## What Not To Do Next
- Do not add more sections below the heroes; the issue is hierarchy, not content volume.
- Do not create another dashboard full of cards; one next action beats twelve equal widgets.
- Do not make the teal system louder or add decorative gradients to compensate for weak structure.
- Do not keep repeating the same hero, pill, preview, features pattern across every module without sharper product-specific state.
- Do not touch backend, auth, packages, deployment, analytics, or data logic to solve a visual staging problem.
- Do not ignore mobile; the mobile first screen is where the current marketing weight is most obvious.

## Next 5 Design Tasks
- [ ] Compress the app/site header height and visual weight on desktop and mobile without changing routes or auth behavior.
- [ ] Replace one hero pill cluster with a quieter secondary-action row, keeping no more than two visible actions in the first viewport.
- [ ] Rework the HQ first viewport to show one daily next action, today context, and compact module status before feature explanation.
- [ ] Tighten mobile preview row spacing so labels, values, and status chips do not crowd each other at narrow widths.
- [ ] Move one repeated "Features" intro band lower or behind an existing action so the page stops explaining itself twice.

## Stop Or Continue
continue but fix visual issues first