# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is getting calmer and more coherent, but the first screen still behaves like a polite feature brochure wearing an app costume.

## Mission Fit
The direction matches the EasyLife mission in tone: quiet colors, restrained cards, consistent teal actions, and clearer product language all support a connected personal operating system. The miss is information staging. Pack 1 is about product spine, and the current screens still make the user process too many headings, chips, nav labels, preview panels, and feature teasers before the daily job becomes unmistakable.

## Taste Check
The best parts are the softened background grid, tactile card borders, consistent button styling, and more grounded copy. The visual system feels less experimental and more like one suite.

The weak part is hierarchy. Desktop pages show a large branded nav, a framed hero, a preview card, CTA buttons, chip rows, then a second "Features" intro almost immediately. Mobile is cleaner in color but heavy in stacked chrome: logo slab, hero card, oversized label, headline, CTAs, tabs/chips, preview, then another large section. It is tidy, but too eager. Restraint, please.

## Visual Problems To Fix
- The first screen has too many competing headings across `/`, `/easylist`, `/easynotes`, `/easycalendar`, and `/easyworkout`; the visual bug report found 6 headings above the fold on each desktop route.
- Route chrome repeats page identity: the nav brand says EasyLifeHQ, then the hero repeats the product name or module label, then the next section repeats the module story again.
- The nav/action bar is visually loud for demo/product routes; "Products" and "Get Started" compete with the actual product example instead of sitting quietly behind it.
- Chip rows under the hero CTAs read like feature inventory, not progressive disclosure; they add small visual weight without making the next user action clearer.
- The hero preview cards are useful, but on desktop they sometimes compete with the primary headline instead of acting as supporting evidence.
- Mobile vertical rhythm is too chunky: the logo block, hero card, large headline, buttons, chips, and preview all consume the first screen before the product gets to breathe.
- The second section begins with another large intro immediately after the hero, making the route feel like stacked explanation panels rather than a confident product surface.

## Strongest Opportunities
- Make the first viewport a single daily-start composition: one headline, one next action, one compact product proof panel.
- Turn chip rows into quieter metadata or hide them below the first screen; the user does not need a necklace of feature tags before understanding the product.
- Reduce route nav to a calm utility layer on product/demo pages, especially mobile.
- Standardize module previews so EasyList, EasyCalendar, EasyNotes, and EasyWorkout feel like siblings, not separate sales pages with matching clothes.
- Use one strong page identity per route. If the nav already brands the suite, the hero can focus on the job, not repeat the label.

## Priority Fix
Fix first-screen information staging across the main product/demo routes. Start with `/` or `/easylist`: reduce the above-the-fold heading count, remove or demote the chip row, quiet the route controls, and make one primary action plus one compact proof panel dominate. Do not add another section. Subtract until the screen says "here is what you do next" before it says "look at all our features."

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: the suite feels calmer and more related, but first-screen overload still blocks a strong product spine.

## Designer Handoff
Next batch should be a subtraction pass, not a polish pass. Keep the teal system, soft cards, practical copy, and functional preview panels. Change the first viewport hierarchy: one headline, one short support line, one primary CTA, one secondary CTA if needed, and one proof panel. Demote chips, repeated labels, and feature-section intros below the fold or behind clearer navigation. The user should feel that EasyLife knows what matters today, not that it is trying to pitch every module before breakfast.

## What Not To Do Next
- Do not add more product sections.
- Do not add more chips, badges, tabs, or preview rows to solve clarity.
- Do not make the nav more prominent.
- Do not broaden into backend, auth, routing, packages, or data behavior.
- Do not redesign every module at once.
- Do not ignore mobile; mobile is where the chrome weight becomes most obvious.
- Do not turn this into a generic SaaS dashboard with "command center" language.

## Next 5 Design Tasks
- [ ] Reduce `/` desktop first-screen heading count by demoting one repeated section intro or chip row; keep the primary hero job and primary CTA visible.
- [ ] Simplify `/easylist?visualQa=1` above the fold by removing or quieting the feature chip row; do not change task preview behavior.
- [ ] Simplify `/easycalendar?visualQa=1` above the fold by making the schedule preview support the headline instead of competing with it; keep existing labels and routes.
- [ ] Tighten `/easyworkout?visualQa=1` mobile spacing so the logo slab, hero, CTAs, and preview fit with less stacked weight; do not add new content.
- [ ] Quiet the shared product/demo route nav styling by reducing visual emphasis on secondary route controls; preserve tap targets and links.

## Stop Or Continue
continue but fix visual issues first