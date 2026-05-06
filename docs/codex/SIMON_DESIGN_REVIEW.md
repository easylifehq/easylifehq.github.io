# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife now has a calmer house style, but the core routes still open like polite product brochures instead of a signed-in personal operating system.

## Mission Fit
The visual direction supports the mission in atmosphere: restrained palette, consistent type, tidy cards, and connected module language. But Pack 1 is not fully landing because the first visible experience is still explaining EasyList, EasyNotes, EasyCalendar, and EasyWorkout instead of helping the user decide what to do next today. The mission says "personal operating system"; the screens currently say "landing pages for modules." Chic enough, but still wearing the name tag at its own dinner party.

## Taste Check
The best work is the restraint: soft grid background, teal accent, compact product cards, and consistent module framing make the suite feel more coherent than before. The mobile layouts are readable and not obviously broken. The tone is calmer and less fake-enterprise.

What feels off is the repeated marketing pattern. Every route has the same hero, the same "Start Free" and "See Features" actions, the same feature chips, and then another feature section below. That is generic SaaS choreography. For a signed-in productivity suite, it creates the wrong hierarchy: explanation first, work second. The oversized H1s also make useful app surfaces feel buried under presentation.

## Visual Problems To Fix
- The top route chrome and hero repeat the same product identity: EasyLifeHQ in the header, module name in the hero, then another feature intro below. This is repeated page identity, and it makes the real product feel one layer too deep.
- "Start Free" appears on module pages that should behave like working app routes. It reads like a public acquisition CTA, not a daily operating surface.
- The first viewport is dominated by marketing copy and feature proof cards instead of one daily next action, today context, and compact module status.
- Desktop hero cards are polished but too large; the user sees a pitch before they see a tool.
- Mobile stacks preserve readability, but the first screen becomes a long brochure column: title, pitch, CTAs, tags, demo card, then features.
- Feature chips add visual noise without changing behavior. They are decorative labels pretending to be controls.
- The secondary "Features" bands repeat the hero message too soon, especially on EasyList and EasyCalendar.
- The suite visual system is consistent, but the individual modules are not yet distinct as working surfaces. They differ mostly by headline and demo list.

## Strongest Opportunities
- Convert the protected HQ and module first screens from brochure heroes into daily start panels: one next action, today's status, and a small route-specific working preview.
- Quiet the route navigation so it supports movement without competing with the product surface.
- Replace feature chips with real, quiet secondary actions or remove them from first viewport.
- Shrink module H1s and let task rows, note rows, calendar blocks, or workout logging states carry the hierarchy.
- Make each module feel operational: EasyList should show today's task flow, EasyNotes should show recent capture, EasyCalendar should show today's schedule pressure, EasyWorkout should show session state.
- Preserve the current palette and card language; the issue is not styling anymore, it is staging.

## Priority Fix
The single most important fix is to reduce the marketing wrapper on protected module routes. Remove or demote "Start Free", "See Features", feature chips, and oversized hero treatment from signed-in app surfaces, then replace that first viewport with one compact working state for the module plus a clear next action. Nami should treat this as a hierarchy repair, not a redesign.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: suite consistency and restraint improved, but the active pack still needs working daily surfaces instead of repeated module brochures.

## Designer Handoff
Keep the soft background, teal accent, rounded panels, and consistent suite shell. Change the first-screen composition: make protected routes feel like tools already in use, not product pages selling themselves. Use smaller headings, fewer explanatory bands, and real module states above the fold. The user should feel, "I know what to do next," not "I have learned what this feature might do."

## What Not To Do Next
- Do not add more sections below the hero to explain the product harder.
- Do not add new dashboards, charts, or feature inventories.
- Do not make the theme system louder to compensate for weak hierarchy.
- Do not touch backend, auth, packages, deployment, or data behavior.
- Do not ignore mobile; the current mobile issue is scroll burden, not broken rendering.
- Do not keep "Start Free" as a primary action on working app routes.
- Do not solve this with more copy. The layout needs subtraction.

## Next 5 Design Tasks
- [ ] On one protected module route, remove acquisition-style CTAs from the first viewport and replace them with one working next-action button; do not change routing or data behavior.
- [ ] Reduce one module hero H1 scale and tighten vertical spacing so the module preview appears earlier; preserve existing visual tokens.
- [ ] Remove or demote feature chips on one route unless they perform a real action; do not add new controls.
- [ ] Collapse the repeated "Features" intro on one route into a lower-priority section below the working preview; keep copy short.
- [ ] On mobile, verify the repaired route shows module identity, one next action, and useful status before the second card; no clipped text or horizontal overflow.

## Stop Or Continue
continue but fix visual issues first