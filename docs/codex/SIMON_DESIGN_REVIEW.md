# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife now has a calmer visual skin, but the product still presents as four polished brochures instead of one daily operating system.

## Mission Fit
The direction partially matches the mission: typography, spacing, muted color, and repeated module cards make the suite feel more related than before. But Pack 1 is about the product spine, and the screenshots still show separate product pages with "Start Free", "See Features", feature sections, and demo panels. That is not the signed-in daily assistant first screen. The current design explains EasyLife instead of helping the user act today.

## Taste Check
The best parts are the restrained palette, confident type scale, clean card rhythm, and practical examples like "Renew registration" and "Call dentist before noon." It feels calmer and less toy-like.

The weak part is hierarchy discipline. Every route uses the same marketing skeleton: logo bar, huge module headline, CTA buttons, chips, feature block, then more explanation. It is handsome enough, but it is still brochureware wearing a productivity costume. Mobile is especially bloated: the header, hero, chips, and demo panel consume too much height before anything resembling a working app appears.

## Visual Problems To Fix
- The first viewport is dominated by public marketing CTAs like "Start Free" and "See Features", which conflicts with the protected first-screen contract.
- Each module repeats the same page identity pattern: top brand chrome, module eyebrow, giant title, intro copy, CTA row, chips, demo card, then a "Features" section. The repetition makes the suite feel templated, not intelligently connected.
- Mobile routes bury the useful content under oversized hero typography and large vertical gaps; the user gets a sales page before a daily tool.
- The desktop pages use large wrapper cards around each route, which makes the actual product surface feel staged instead of usable.
- The feature chips are visually loud for secondary information and compete with the primary action area.
- The module demo panels are good, but they sit beside or below marketing copy instead of becoming the main product experience.
- The top navigation is useful on desktop, but on customer-facing/product demo routes it still feels like route chrome competing with the page. Keep it quieter.
- The pages look visually related, but they do not yet communicate one connected system; Calendar, List, Notes, and Workout still behave like isolated landing pages.

## Strongest Opportunities
- Replace the first screen with a true "Today" start surface: one next action, today context, compact module status, and quiet navigation into Tasks, Notes, Calendar, Coach, Inbox, and More.
- Promote the demo panels into working surfaces instead of decorative proof blocks.
- Collapse feature chips and feature explanations behind quieter detail affordances.
- Use one shared suite shell with module status summaries rather than repeated module landing-page intros.
- Make mobile feel like a fast assistant: compact header, immediate daily action, then module shortcuts.

## Priority Fix
Fix the first-screen hierarchy before anything else. The next slice should remove marketing-first chrome from the protected app surface and convert the top viewport into a daily assistant start: one clear next action, date/context, and compact statuses for the core modules. Keep routes reachable, keep the existing visual language, but stop making the user walk through a product brochure to reach their life.

## Magic Improvement Score
SCORE: 2; DIRECTION: flat; ACTIVE_PACK: Pack 1 - Product Spine; REASON: screenshots are cleaner, but this branch does not materially advance the daily product spine.

## Designer Handoff
Nami should take a subtraction pass, not a decoration pass. Keep the muted palette, strong type, rounded panels, and concrete task examples. Change the first viewport from "module marketing page" to "daily operating surface": reduce hero scale, demote CTA buttons, quiet the chips, and make the product sample the primary content. The user should feel, "I know what to do next," not "I am being pitched four apps."

## What Not To Do Next
- Do not add more sections below the fold.
- Do not invent new modules or backend-backed features.
- Do not add more chips, badges, or explanatory cards.
- Do not start a broad visual-system redesign.
- Do not polish the marketing pages while the protected daily start remains unresolved.
- Do not ignore mobile; it is where the current hierarchy gets most indulgent.

## Next 5 Design Tasks
- [ ] Convert one protected first screen section into a compact Today start surface with one next action, date context, and no marketing CTA language.
- [ ] Reduce mobile hero height on one module route by demoting the giant title, tightening spacing, and keeping tap targets usable.
- [ ] Move one row of feature chips behind a quieter secondary affordance or lower-priority area without removing route access.
- [ ] Reframe one module demo panel as primary usable content, not a supporting marketing visual, while preserving existing behavior.
- [ ] Audit one shared route header for repeated page identity and remove any duplicate title, intro, or wrapper chrome that buries the product.

## Stop Or Continue
continue but fix visual issues first