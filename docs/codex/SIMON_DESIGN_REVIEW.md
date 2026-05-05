# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife looks cleaner and calmer, but it is still dressed like a product brochure when the mission needs a working daily operating spine.

## Mission Fit
The current direction partially matches EasyLife: the palette is restrained, the cards are consistent, and the module pages feel more related than before. But Pack 1 is Product Spine, and the visible routes still lead with large marketing headlines, "Start Free" CTAs, feature chips, and repeated explanatory sections. That misses the first-screen contract: one daily next action, today context, and compact module status. The screenshots show polish, not enough product behavior.

## Taste Check
The good: the soft green-gray environment, strong type, clean panels, and compact preview rows feel more mature than generic dashboard chaos. The restraint is welcome.

The weak: every page is now wearing the same landing-page costume. Big headline, sales CTA, pills, preview card, feature band. Repeat. Repeat. Repeat. It is tidy, but too templated. The nav and hero are doing so much announcing that the app itself enters late, like a guest waiting to be seated at its own dinner.

## Visual Problems To Fix
- The top shell repeats identity twice: icon/brand lockup plus "EasyLifeHQ", then each route repeats a huge module label and intro headline.
- The first viewport is dominated by brochure structure instead of an operational daily surface.
- "Start Free" and "Get Started" compete with module content on routes that should feel like product examples or signed-in app surfaces.
- The navigation bar is too visually loud: large wrapper, centered links, "Products" button, and primary CTA all pull attention before the actual module.
- The module pages share the same hero-card, CTA-row, pill-row, and feature-card rhythm, making the suite feel stamped out rather than intentionally connected.
- The feature sections arrive too early; they explain the product before the user sees enough real product behavior.
- Mobile is readable, but the first viewport is bloated by title, paragraph, CTA buttons, pills, and preview card before meaningful working content appears.
- Preview cards are attractive but still feel like static samples, not live daily status.
- The background grid is calm, but paired with big white wrapper panels it makes every route feel staged.
- Confidence is lower on the protected HQ first screen because the latest screenshots provided focus on module pages, while HQ is the actual Pack 1 battleground.

## Strongest Opportunities
- Turn the protected HQ surface into the product spine: one next action, one today cue, and compact module status.
- Quiet the public/demo chrome so route navigation helps without stealing the first impression.
- Replace sales CTAs on app-demo surfaces with operational actions like "Review today", "Add task", "Open notes", or "Plan next block".
- Reduce module hero scale and use a shared tool header treatment across EasyList, EasyNotes, EasyCalendar, and EasyWorkout.
- Make preview panels feel stateful: due item, next calendar block, recent note, workout readiness, or open review item.
- Tighten mobile first screens so the user reaches usable content faster.

## Priority Fix
Fix the repeated brochure shell. The next implementer should reduce the top nav weight, shrink module hero identity, and demote acquisition CTAs on product routes. The first screen should feel like "here is what to do now", not "please admire this module description."

## Magic Improvement Score
SCORE: 2; DIRECTION: flat; ACTIVE_PACK: Pack 1 - Product Spine; REASON: cleaner visuals, but the active pack is still blocked by brochure-first hierarchy.

## Designer Handoff
Keep the restrained palette, confident typography, soft panels, and calmer copy direction. Change the page hierarchy. The next batch should subtract chrome, reduce repeated identity, and bring operational status forward. Treat EasyLife like a personal assistant workspace: small brand, clear current state, one primary next action, then quiet access to deeper modules. The user should feel oriented and ready to act, not politely marketed to.

## What Not To Do Next
- Do not add another feature band.
- Do not create more hero templates.
- Do not make navigation larger to solve clarity.
- Do not add fake intelligence, dashboard drama, or broad product claims.
- Do not polish lower-page sections before fixing the first viewport.
- Do not ignore mobile vertical density.
- Do not touch backend, auth, packages, deployment, Firebase, secrets, or data systems for a visual hierarchy problem.

## Next 5 Design Tasks
- [ ] Quiet one module route nav: reduce visual weight of Products/Get Started and keep route behavior unchanged.
- [ ] Replace one "Start Free" hero CTA row with a compact operational action row; no routing, auth, or persistence changes.
- [ ] Shrink one module hero from marketing-scale headline to tool-scale page header; preserve readable mobile type.
- [ ] Move one early feature-card section below the first working preview; do not add new sections.
- [ ] Tighten one mobile first viewport so title, primary action/status, and preview appear with less scrolling; no broad layout rewrite.

## Stop Or Continue
continue but fix visual issues first