# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is cleaner and calmer, but the branch is still polishing a product-page costume when Pack 1 needs a signed-in operating-system spine.

## Mission Fit
The direction supports the mission in tone: restrained colors, consistent cards, clearer hierarchy, and less decorative chrome across modules. But the active pack is Product Spine, and the strongest visual evidence still shows marketing/product pages rather than the protected HQ experience where the suite should prove itself. The design is advancing consistency, not yet decisiveness.

## Taste Check
The best parts are the quiet teal system, large confident type, reduced chip clutter, and preview panels that make each module feel related. It feels calmer than generic SaaS confetti, which is good.

The weak part is sameness. EasyList, EasyNotes, EasyCalendar, and EasyWorkout all use nearly identical hero-card formulas: eyebrow, giant headline, two buttons, chips, pale preview box, feature cards. That is tidy, but it starts to feel like a template parade. The suite needs one commanding signed-in first screen, not four tasteful brochures standing in formation.

## Visual Problems To Fix
- Mobile hero pages still begin with too much header and atmospheric grid space before the actual product value appears.
- The product preview cards are visually handsome but oversized on mobile, pushing useful feature context too far down.
- The module pages share the same layout rhythm so closely that each product identity feels lightly re-skinned rather than purpose-built.
- CTA treatment is consistent, but "Start Free" dominates every product page even when the mission is about daily utility and connected workflow.
- Pill rows still occupy premium mobile space and read as marketing tags, not operational navigation or state.
- The latest screenshots do not show the protected HQ signed-in spine, so confidence is lower on whether the active work pack has actually landed visually.
- Desktop pages have good breathing room, but the large white cards and repeated feature grids make the experience feel more catalog than operating system.

## Strongest Opportunities
- Make the signed-in HQ first screen the hero of the product: today focus, next action, and compact module statuses should feel like the place to start.
- Replace repeated product-page hero formulas with module-specific proof surfaces: calendar should feel temporal, notes should feel writable, list should feel actionable, workout should feel session-ready.
- Use fewer chips and more useful state: counts, due timing, current plan, recent capture, open window, next workout.
- Tighten mobile first viewports so a user sees action plus product proof without needing a generous thumb-scroll tax.
- Introduce a stronger suite-level navigation/status pattern so moving between modules feels like one system, not a set of neighboring pages.
- Preserve the calm palette and typography, but vary layout density and preview structure per module so the brand feels alive.

## Priority Fix
Fix the protected HQ first viewport next. The first signed-in screen should lead with a compact daily-start area, one clear primary action, and two or three module status rows visible without scrolling on 390px mobile. Reduce any secondary hero chrome, marketing-like badges, decorative chips, and oversized spacing that delays the user's first useful action.

## Magic Improvement Score
SCORE: 3; DIRECTION: flat; ACTIVE_PACK: Pack 1 - Product Spine; REASON: consistency improved, but latest evidence still proves marketing polish more than a signed-in product spine.

## Designer Handoff
Keep the quiet teal system, confident typography, and low-noise card language. Change the emphasis: stop spending the next pass on product-page hero polish and make the protected HQ feel like the suite's cockpit. The user should open EasyLife and immediately know what matters today, where to capture something, and how list, notes, calendar, and workout relate. Make the first screen denser, more useful, and less brochure-like while preserving the calm, professional tone.

## What Not To Do Next
- Do not add more marketing sections.
- Do not create another large hero variation with the same chip-and-preview formula.
- Do not add visual noise to make the pages feel "designed."
- Do not start backend, auth, routing, analytics, package, or architecture work.
- Do not ignore mobile density; mobile is where the current hierarchy gets expensive.
- Do not keep polishing module pages if HQ still fails to read as the product spine.
- Do not broaden the branch with another multi-surface sweep.

## Next 5 Design Tasks
- [ ] On protected HQ only, compress the top spacing so the daily focus action and at least two module statuses are visible in the first 390px mobile viewport; do not add new content or change behavior.
- [ ] Replace one decorative HQ pill/chip treatment with quieter inline status metadata; preserve existing labels and data sources.
- [ ] On protected HQ desktop, strengthen the primary daily-start panel so it is clearly dominant over secondary module context; avoid new cards inside cards.
- [ ] Audit the protected HQ mobile screenshot after changes and remove any clipped, wrapped, or crowded labels; keep touch targets comfortable.
- [ ] Make one small suite-navigation polish pass only if HQ remains visually stable; keep the change limited to spacing, active state, or label hierarchy.

## Stop Or Continue
continue but fix visual issues first