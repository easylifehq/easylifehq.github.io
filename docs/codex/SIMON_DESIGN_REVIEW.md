# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is calmer and more coherent than before, but the first screen still behaves like a polite feature brochure instead of a decisive personal operating system.

## Mission Fit
The direction is aligned with Pack 1 - Product Spine: shared navigation, repeated card language, consistent teal accents, and restrained product copy are starting to make the suite feel like one product. The miss is information staging. EasyLife promises a calm daily start point, but the current first screen still asks the user to parse too many headings, products, badges, and explanatory panels before one obvious "do this next" moment lands.

## Taste Check
The typography has weight, the palette is quiet, and the cards feel more tactile than generic SaaS sludge. The product pages now have a consistent visual system: large editorial headlines, soft mint surfaces, compact status rows, and rounded action buttons.

What is off: the page is over-carded, the hero area is still explaining itself too much, and the first screen feels like it is trying to win a product strategy meeting instead of helping a busy person start their day. The background grid is subtle enough, but paired with stacked white panels it risks looking like a template with manners.

## Visual Problems To Fix
- The root first screen has too many competing headings above the fold; the visual bug report counts 6, and that is too many for a calm staged layout.
- The public route repeats identity too often: top logo, hero eyebrow, hero title, and immediate "The EasyLifeHQ suite" band all announce the same product before the user gets a sharper first action.
- The top route chrome is still visually loud for a product demo: the nav bar, active "Products" button, and "Get Started" button compete with the hero instead of quietly supporting it.
- The hero card plus secondary preview card creates a nested demo feeling; the real product idea is visible, but it is buried inside a framed presentation layer.
- Mobile pages stack the hero, badges, preview card, and next section into a long scroll before the product has one crisp job; the hierarchy is legible but heavy.
- Badge rows are useful but too prominent on mobile, acting like extra navigation pills when they should read as supporting proof.
- Product page sections use the same card rhythm too repeatedly, so EasyList, EasyCalendar, EasyNotes, and EasyWorkout feel related but also a bit samey.
- Some status rows inside preview panels are cramped on mobile; labels, values, and small pills fight for the same horizontal line.

## Strongest Opportunities
- Turn the protected HQ first screen into a true daily start surface: one next action, today context, and compact module status, with everything else demoted.
- Make route navigation quieter on public pages so the product story feels premium instead of wrapped in demo controls.
- Use one stronger first-screen composition across the suite: primary action at left, compact live status at right on desktop, single-column action-first on mobile.
- Reduce repeated labels and eyebrow text; EasyLife does not need to keep introducing itself at every band like it forgot its own name.
- Let module cards differ by job, not decoration: tasks should feel actionable, notes should feel writable, calendar should feel temporal, workout should feel fast and physical.

## Priority Fix
Fix the root first-screen information staging. Nami should reduce the above-the-fold heading count and make the primary daily job dominant: one main headline, one next action, one compact today/status panel, and quiet secondary navigation. Demote product-suite explanation, feature inventory, and repeated identity labels below the first screen or behind existing actions. This is the blocker between "nice product pages" and "actual personal operating system."

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: suite cohesion is better, but first-screen overload still blocks the Pack 1 product spine.

## Designer Handoff
Keep the current visual language: bold type, calm teal, soft panels, compact proof rows, and practical copy. Change the staging. The next batch should subtract before it adds: quiet the route chrome, remove repeated identity, collapse secondary proof into fewer signals, and make the first viewport answer "what should I do next today?" without asking the user to tour the suite first. The result should feel like opening a focused assistant, not walking into a well-designed trade show booth.

## What Not To Do Next
- Do not add another product section, feature band, or explanatory block.
- Do not make the dashboard more impressive by increasing density.
- Do not introduce new colors, decorative gradients, or louder illustrations to compensate for weak hierarchy.
- Do not touch backend, auth, Firebase, packages, deployment, or data behavior.
- Do not ignore mobile; the current hierarchy becomes more exhausting there.
- Do not solve this with copy alone. The issue is visual priority, not just phrasing.

## Next 5 Design Tasks
- [ ] Root first-screen staging: reduce above-the-fold headings to one primary headline plus one compact supporting panel; guardrail: do not add new sections or change routing.
- [ ] Public route chrome pass: make nav pills and secondary actions quieter so the hero owns the first viewport; guardrail: preserve existing destinations and labels where possible.
- [ ] Hero identity cleanup: remove repeated EasyLifeHQ eyebrow/title duplication on the root route; guardrail: keep brand visible once in the header and once in the main story.
- [ ] Mobile badge simplification: limit hero badges to the strongest two or three signals and wrap them without crowding action buttons; guardrail: no new mobile-only content.
- [ ] Preview row polish: tighten mobile status rows so labels, values, and pills do not compete horizontally; guardrail: keep the same data and no logic changes.

## Stop Or Continue
continue but fix visual issues first