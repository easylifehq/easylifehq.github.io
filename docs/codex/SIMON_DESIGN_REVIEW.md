# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is getting calmer and more coherent, but the visible proof still looks too much like a tasteful product brochure and not enough like the signed-in personal operating system.

## Mission Fit
The direction supports the EasyLife mission in palette, restraint, and shared module language. The recent HQ changes move toward the right first-screen contract by saying "Choose today's next move" and moving fast capture earlier. That is good product instinct. But Pack 1 is Product Spine, and the screenshots still mostly show public/module marketing routes, not the protected HQ surface where the user should immediately know what to do today. Confidence is lower because the mission-critical screen is still under-proven visually.

## Taste Check
The best part is the calmer system: softened teal, quieter grid, cleaner cards, less candy color, and more grounded copy. EasyList, EasyNotes, EasyCalendar, and EasyWorkout now feel like relatives from the same house.

The weak part is hierarchy. The public routes are still performing too hard: oversized H1s, big CTA pairs, chips, preview cards, and feature bands all arrive before the product feels truly useful. On mobile, the first screen is basically a very polite billboard. Chic, yes. Efficient, no.

## Visual Problems To Fix
- The latest screenshot set does not include the protected HQ first screen, so the active Product Spine pack cannot be visually accepted yet.
- The top route chrome is still too loud on desktop: logo block, centered nav, "Products," and "Get Started" compete with the module content.
- Mobile starts with a large standalone brand header, then another large module identity band, which creates stacked identity chrome before the actual product surface.
- The desktop pages have a large dead zone between the nav and the hero card, making the layout feel staged instead of immediate.
- Mobile H1s are still too large for a daily utility product; they delay the preview and make the screen feel promotional.
- The feature chips above the preview read as decorative product badges, not useful navigation or progressive disclosure.
- The public module pages share the same template too literally, so the suite feels consistent but slightly mass-produced.
- The working UI previews are buried inside hero cards instead of leading as evidence of the actual app experience.
- "Start Free" and "See Features" dominate multiple first viewports, which keeps the product acquisition-led when the mission asks for daily use.
- No blocking visual bugs were reported, but "no bugs" is not the same as "good hierarchy." Let us not confuse the absence of smoke with dinner.

## Strongest Opportunities
- Prove HQ directly with desktop and 390px mobile screenshots focused on the first viewport.
- Make the HQ first screen unmistakably about one next move, today context, and compact module status.
- Quiet the public route nav so it supports the page instead of announcing itself.
- Shrink mobile hero type and reduce CTA/chip weight so previews arrive sooner.
- Make module previews feel more like live working surfaces and less like samples inside a sales deck.
- Keep the current color restraint and softened surfaces; the taste direction is better.
- Use progressive disclosure harder: primary action first, module detail second, feature explanation later.

## Priority Fix
The next design repair must prove and tighten the protected HQ first screen. Capture HQ on desktop and 390px mobile, then make one narrow hierarchy pass if needed: one daily next action and today context must sit above module inventory, capture shortcuts, feature language, or decorative chrome. Do not polish another public module route until HQ visually earns the Product Spine pack.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: calmer styling and stronger daily language help, but HQ visual proof is still missing and public route chrome remains too promotional.

## Designer Handoff
Stay in subtraction mode. Keep the pale grid, restrained teal, white panels, compact rows, and grounded copy. Change the hierarchy: HQ first, one next move first, module status second, everything else quieter. On public/module pages, reduce nav weight, shrink mobile hero scale, and let the preview behave like the product proof. The user should feel "I know what to do next today," not "I have arrived at a beautifully behaved feature catalog."

## What Not To Do Next
- Do not add new sections.
- Do not keep polishing public module pages while HQ remains visually unproven.
- Do not add more chips, badges, or feature labels above the fold.
- Do not make the nav more decorative.
- Do not introduce a new palette, illustration style, or motion layer.
- Do not turn HQ into a dashboard dump.
- Do not ignore mobile first-viewport density.
- Do not touch backend, auth behavior, packages, deployment, persistence, or architecture.

## Next 5 Design Tasks
- [ ] Capture protected HQ desktop and 390px mobile first viewport; guardrail: evidence only, no implementation.
- [ ] Make one HQ-only hierarchy repair so today's next move and today context appear before capture shortcuts; guardrail: no data, routing, auth, or persistence changes.
- [ ] Reduce one public route's top chrome weight by tightening nav spacing and quieting secondary actions; guardrail: preserve every existing link.
- [ ] Shrink mobile hero type on one module page so the working preview appears sooner; guardrail: no new content and no hidden primary CTA.
- [ ] Move or restyle one decorative chip row into quieter secondary metadata; guardrail: keep labels understandable and avoid adding new controls.

## Stop Or Continue
continue but fix visual issues first