# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife now has a calmer, more coherent shell, but it is still presenting module brochures where the mission asks for a working daily operating system.

## Mission Fit
The visual direction supports the mission in tone: quiet color, consistent cards, clearer typography, and a suite identity that finally looks related across EasyList, EasyNotes, EasyCalendar, and EasyWorkout. The problem is hierarchy. Pack 1 is Product Spine, and the current screenshots still lead with product-page explanation, hero claims, chips, and demo panels instead of helping a signed-in user decide what to do next today. It feels polished, but still one room away from the actual app.

## Taste Check
The restrained green, soft grid background, rounded panels, and heavier type give the product a more tactile personal-workspace feel. The copy is also more specific than generic SaaS soup, which helps.

What is off: every module page is using the same oversized brochure template. Big headline, explainer paragraph, Open EasyLife button, tags, demo panel, feature section. It is consistent, yes, but consistency is not the same as product spine. Right now the suite looks like four landing pages wearing the same jacket.

## Visual Problems To Fix
- The first viewport is dominated by marketing hero structure instead of the user's daily action, today context, and compact module status.
- The route chrome is visually loud: top nav, Products button, Get Started button, hero CTA, and tag pills all compete before the actual workflow appears.
- "Open EasyLife" repeats across module pages and reads like a public-site CTA, not a signed-in app action.
- The feature sections begin too high in the page and reinforce the brochure pattern before the user has seen enough working product surface.
- Mobile pages are readable, but the vertical scale is bloated: large hero type, large paragraph leading, large CTA, chips, and demo card make the first useful content arrive too late.
- The demo panels are attractive but too illustrative; they suggest functionality instead of becoming the working surface.
- The same page rhythm across modules makes the suite feel templated rather than intelligently tailored to list, notes, calendar, and workout workflows.
- The header identity is cleaner on mobile, but the desktop header still feels like public marketing navigation more than a personal OS shell.

## Strongest Opportunities
- Turn HQ into the real spine: one daily next action, today's context, and compact status from list, notes, calendar, and workout.
- Quiet the public-page chrome on protected/product routes so the main surface feels immediate.
- Replace repeated module hero patterns with workflow-first panels: today's tasks, recent note, next calendar opening, next workout state.
- Keep the shared visual system, but let each module's primary object lead: task row, note list, calendar block, workout session.
- Use progressive disclosure: chips and feature explanations can move below the fold or behind quieter secondary controls.
- Make mobile feel faster by reducing first-screen hero height and surfacing one real action sooner.

## Priority Fix
Fix the brochure-first hierarchy. The next design task should reduce top-of-page marketing chrome on one core route and replace it with a working daily surface: a clear "what now" action, one compact status row, and one direct module action. Do not add another section. Delete or demote repeated CTA/chip/explainer elements until the page behaves like an app.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: visual consistency improved, but the branch still leads with polished brochures instead of the daily operating system spine.

## Designer Handoff
Keep the calm palette, soft panels, strong type, and shared spacing language. Change the top hierarchy. The next implementer should take one protected/core route and make it feel less like a product page: shrink the hero, demote the CTA stack, remove repeated labels, and put the user's next useful action in the first screen. The user should feel "I know what to do now," not "I have been introduced to a feature again."

## What Not To Do Next
- Do not add more feature cards.
- Do not create another overview section.
- Do not make the header more decorative.
- Do not add dashboards, stats, or fake intelligence to compensate for weak hierarchy.
- Do not touch backend, auth, routing architecture, packages, or data behavior.
- Do not ignore mobile; the current mobile issue is not breakage, it is slow visual priority.
- Do not polish four module brochures equally before fixing the daily start surface.

## Next 5 Design Tasks
- [ ] On one core route, reduce the first-screen hero height by demoting one headline, paragraph, chip row, or CTA group; keep behavior unchanged and verify mobile still reads cleanly.
- [ ] Replace one repeated "Open EasyLife" CTA with a route-specific action label that describes the actual next step; do not change navigation logic.
- [ ] On HQ or the most central app surface, surface one daily next action above module explanation; keep it compact and avoid adding a new dashboard section.
- [ ] Move one feature/explainer block lower on the page or behind an existing secondary control; do not add new content.
- [ ] Tighten mobile spacing on one module page so the demo/work surface appears sooner; no font scaling tricks, no overflow, no new components.

## Stop Or Continue
continue but fix visual issues first