# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is cleaner and more coherent, but it still looks more like a polished product brochure than the calm personal operating system the mission is asking for.

## Mission Fit
The current direction supports suite consistency: shared header, repeated card language, consistent teal accent, restrained borders, and similar module hero structures make EasyList, EasyNotes, EasyCalendar, and EasyWorkout feel related. The problem is mission priority. Pack 1 is "Product Spine", and the visible evidence is still dominated by public feature-page framing: big marketing headlines, feature chips, Start Free buttons, and secondary explainer sections. That is not yet the signed-in daily start point promised by the mission. It is handsome enough, but it is still explaining EasyLife instead of helping someone run their day.

## Taste Check
The good: the palette is calm, the typography has weight, the product cards feel cleaner than generic SaaS vapor, and the module-specific examples are concrete. The mobile screenshots show real improvement in tap comfort and vertical stacking. EasyList has the strongest attitude; "Clear the annoying stuff" has bite and feels human.

The weak: the system is overusing the same hero-card formula everywhere, so the suite begins to feel templated. The first viewport keeps serving headline, CTA, chips, and feature preview before any working daily flow appears. The top chrome on desktop is tidy, but on mobile it collapses into a large brand slab that consumes premium space without giving the user a next action. Chic, but still standing in the doorway.

## Visual Problems To Fix
- The visible routes repeat the same page identity pattern: brand header, module eyebrow, massive module headline, CTA buttons, chips, preview card, then another "Features" intro. It creates stacked intro bands instead of a working product surface.
- Customer-facing route chrome is too loud for Pack 1. The header plus hero plus feature section makes the real product feel buried under presentation.
- Mobile first viewport spends too much height on brand identity and marketing explanation before the user sees the useful object or action.
- The module pages look visually related, but also too identical. Calendar, List, Notes, and Workout all use the same display rhythm, which helps consistency but weakens product specificity.
- The pill rows are starting to feel decorative. On mobile they create extra scanning work without clearly acting like controls.
- The preview cards are useful, but they sit inside brochure heroes instead of behaving like live product starts. They read as mockups, not usable surfaces.
- Desktop whitespace above the hero is excessive. The page opens with a polite pause where the product should be asserting purpose.
- The repeated "Start Free" CTA on every module page is marketing-first and competes with the personal operating system mission.

## Strongest Opportunities
- Turn the protected HQ into the spine: one clear daily next action, today context, and compact module signals before any feature pitch.
- Reduce public route chrome so the module example becomes the hero, not the supporting art.
- Make each core module feel specific through layout behavior: list as triage, notes as writing, calendar as time blocks, workout as session flow.
- Replace decorative chips with quieter segmented controls, tabs, or hidden detail where they actually change the view.
- Give mobile a stronger app-first hierarchy: brand small, action high, preview/live content above explanation.
- Use one shared shell, but vary the internal composition enough that the suite feels connected, not cloned.

## Priority Fix
Fix the brochure-first hierarchy. The next pass should reduce repeated intro chrome on the core routes and make the first viewport show the working object earlier: today's task list, current note cue, calendar block, workout session, or HQ next action. Keep the shared visual language, but stop making every page perform the same marketing monologue before it becomes useful.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: shared polish and mobile comfort improved, but the branch still foregrounds marketing structure over the daily operating spine.

## Designer Handoff
Keep the calm palette, heavy-but-friendly type, rounded panels, and concrete life-management language. Change the hierarchy: compress the header, demote repeated CTAs, remove decorative feature chips where they are not functional, and pull the useful module preview higher. The user should feel, "I can start my day here," not "I am being sold a suite of apps." Make the route navigation useful but quiet, and let the product surface carry the confidence.

## What Not To Do Next
- Do not add more feature sections.
- Do not add another dashboard band, product promise block, or explanatory wrapper.
- Do not make the palette louder to create excitement.
- Do not solve this with more icons, badges, chips, or decorative cards.
- Do not touch backend, auth, packages, deployment, or architecture.
- Do not ignore mobile; mobile is where the current hierarchy tax is most obvious.
- Do not keep repeating the same hero formula across every module.

## Next 5 Design Tasks
- [ ] Compress the mobile brand header on core module routes so it preserves identity without pushing the primary content down; keep tap targets comfortable and do not change routing.
- [ ] On one core module page, remove or demote non-functional feature chips from the first viewport; preserve the copy elsewhere only if it remains useful.
- [ ] Refactor one module hero so the product preview appears before secondary explanation on mobile; do not add new sections.
- [ ] Reduce repeated CTA prominence across module pages by making "Start Free" quieter where the route is already inside the product shell; do not touch auth behavior.
- [ ] Give one module a more specific layout rhythm tied to its job, such as task triage or calendar blocks, while preserving shared spacing and tokens.

## Stop Or Continue
continue but fix visual issues first