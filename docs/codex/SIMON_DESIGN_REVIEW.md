# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife looks calmer and more coherent, but it still spends too much first-screen energy explaining the suite instead of behaving like the user's daily operating surface.

## Mission Fit
The branch supports Pack 1 by tightening the shared visual language: teal accents, soft notebook panels, consistent module cards, and mobile-friendly stacking now feel like one family. The problem is hierarchy. The mission asks for a connected personal operating system where the user quickly sees what matters today, while the current screenshots still lead with brochure pages, product CTAs, feature pills, and repeated identity. Confidence is lower on the protected HQ route because the latest screenshot set does not include it, but the inspected public/product and Settings surfaces still show the same pattern: polish improved, operating spine not yet dominant.

## Taste Check
The best parts are the restrained palette, tactile panels, readable mobile spacing, and consistent rhythm across EasyList, EasyNotes, EasyCalendar, and EasyWorkout. The theme work helped; Candy restraint and Soft Notebook clarity are doing their job.

What feels off is the template behavior. Big hero, CTA pair, pill row, preview card, then features. Repeat. Repeat. Repeat. It is clean, yes, but clean like a showroom kitchen nobody has cooked in. Settings is also visually legible, but on mobile the header and status cards are so large that the real control surface arrives too late.

## Visual Problems To Fix
- The first viewport on product/module routes is still a marketing hero, not a working daily surface.
- Repeated page identity is visible: top header says EasyLifeHQ, hero eyebrow repeats EasyLifeHQ or the module name, and the next section introduces the product again.
- The desktop root nav repeats "Products" as both a center nav item and a right-side button, creating loud route chrome before the product content.
- "Get Started", "Start Free", "See Features", and feature pills compete with the actual module previews.
- The module pages are too structurally identical; consistency has become cloning.
- Mobile pages are readable but too vertically ceremonial: large header, large hero copy, CTA pair, pill row, preview card, then finally substance.
- Settings mobile has oversized summary cards above the real controls, pushing "Theme mode" and section controls too far down.
- The right-side preview cards look polished but staged; they often read as fake proof cards instead of live status or immediate action.
- The background grid is calm in isolation, but across every route it starts to feel like a house style applied everywhere instead of a purposeful product atmosphere.
- Feature sections arrive too early and too loudly for Pack 1; they explain the product before the user feels the product.

## Strongest Opportunities
- Turn one primary route into a true daily start surface: one next action, today context, compact module status.
- Quiet the shared route chrome so navigation is present but not competing for hero-level attention.
- Replace feature pills with state chips only when they communicate something useful now.
- Make each module's first screen do its own job: capture task, start note, find open time, begin workout.
- Compress Settings mobile so the current section and first editable control appear sooner.
- Use preview cards as operational status panels rather than decorative demos.
- Preserve the calm theme system while making hierarchy sharper and less promotional.

## Priority Fix
Fix the brochure-first hierarchy on one high-traffic route before adding anything else. Remove or demote the CTA pair and feature-pill row from the first viewport, then replace that space with one operational primary action, a short today/status line, and a compact panel that feels like live product state. This should be a local visual/hierarchy repair, not a routing, backend, or architecture task.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: theme restraint and suite consistency improved, but the visible first screens still prioritize product explanation over daily operating flow.

## Designer Handoff
Keep the teal system, soft panels, readable type, and generous mobile tap comfort. Change the first-screen composition: less product pitch, more daily utility. Navigation should become quiet utility chrome; module pages should open with a concrete user job and one status panel, then let feature explanation sit lower or behind secondary actions. The user should feel "I know what to do next today" before they feel "I understand this product line."

## What Not To Do Next
- Do not add more feature sections.
- Do not do another theme pass before fixing hierarchy.
- Do not add more pills, badges, or proof rows.
- Do not make every module use the same hero formula.
- Do not expand backend, auth, routing, package, deployment, or data scope.
- Do not ignore mobile just because there are no automated visual bugs.
- Do not bury the working app behind more product explanation.

## Next 5 Design Tasks
- [ ] On one primary module route, remove the "Start Free" and "See Features" CTA pair from the first viewport; replace with one operational action and do not alter routing or auth.
- [ ] Demote the feature-pill row on that same route; keep no more than two chips, and only if they communicate current state or immediate use.
- [ ] Convert the module preview card into a compact status panel with no more than four rows and one clearly marked current/selected state.
- [ ] Reduce repeated identity above the fold by keeping only one product/module label; do not add replacement marketing copy.
- [ ] Recheck the repaired route on mobile and ensure the primary action plus first status panel appears before the first major scroll break.

## Stop Or Continue
continue but fix visual issues first