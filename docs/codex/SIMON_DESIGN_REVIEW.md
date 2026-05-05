# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is cleaner and more coherent than before, but the screenshots still read like polished module brochures instead of one calm personal operating system.

## Mission Fit
The shared typography, pale grid background, teal action language, and consistent card rhythm support the "connected suite" mission. The problem is that Pack 1 is supposed to prove the product spine: a signed-in daily start point with one next action, today context, and compact module status. The current visual evidence mostly shows public-style route pages for EasyCalendar, EasyList, EasyNotes, and EasyWorkout, with "Start Free", "See Features", product nav, and feature sections. That explains the suite; it does not yet feel like living inside the suite.

## Taste Check
The restrained palette, chunky type, quiet teal, and practical demo cards are the best parts. The pages feel more tactile and less random, and the copy has some human bite. But the layout is still too template-driven: hero card, right-side preview, pill list, feature block, repeat. The route pages are wearing the same outfit to every dinner. Premium products have system logic, not just matching landing pages.

## Visual Problems To Fix
- The latest screenshots do not include the protected HQ first screen, so confidence is lower on whether Pack 1 is actually solved.
- Customer-facing route chrome is too loud: desktop shows a full top nav with "Products" and "Get Started", then the route hero repeats the app identity again.
- Mobile has a repeated identity stack: a large EasyLifeHQ header card sits above another oversized route hero card, making the actual module content feel buried.
- "Start Free" and "See Features" dominate every module route, which makes the product feel like a marketing site even when the mission asks for a daily operating surface.
- The hero structure repeats across modules so strongly that EasyCalendar, EasyList, EasyNotes, and EasyWorkout feel like themed brochures rather than connected tools with distinct jobs.
- Feature sections arrive too early and too heavily; the first scroll is still explanation-first instead of action-first.
- Several mobile routes use very large body copy and oversized cards, which gives comfort but costs scan speed. Calm does not mean everything needs to sit in first class.
- The preview cards are attractive but mostly static proof panels; they do not yet behave like compact module status inside a larger daily spine.
- The background grid is tasteful enough, but repeated large white cards over it create a wrapper-on-wrapper feeling.

## Strongest Opportunities
- Make HQ the visual anchor: one daily action, one today context line, compact status from List, Notes, Calendar, and Workout, then quiet module navigation.
- Reduce public-route chrome on module pages so each page feels like a real product surface, not a duplicated product explainer.
- Turn the right-side hero previews into a shared "status strip" language that can also appear inside HQ.
- Use progressive disclosure harder: feature explanations should sit behind tabs, accordions, or lower-page detail, not compete with first-screen action.
- Give each module one distinct working interaction above the fold: List approval queue, Calendar open window, Notes quick capture, Workout gym mode.

## Priority Fix
Fix the repeated marketing chrome before adding anything else. On mobile and desktop, reduce the top wrapper and route hero competition so the user sees the actual EasyLife surface first: daily HQ action or the module's primary working state, then secondary navigation, then explanation. Remove or quiet repeated identity, repeated CTAs, and feature-section gravity. Nami should treat this as a chrome subtraction task, not a new section task.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: shared visual polish improved, but evidence still sells modules instead of proving the daily operating-system spine.

## Designer Handoff
Next batch should make EasyLife feel less like a suite brochure and more like a signed-in assistant. Keep the typography, teal action color, soft panels, and practical copy. Change the hierarchy: HQ first, one next move first, compact module status second, route explanation last. On module pages, strip the duplicated header energy, quiet "Start Free" style CTAs where they are not the main job, and let the working artifact carry the page. The user should feel, "I know what to do next," not "I am being toured through features."

## What Not To Do Next
- Do not add more feature cards or another explanatory section.
- Do not invent a bigger dashboard to compensate for weak hierarchy.
- Do not make the palette busier; the issue is structure, not decoration.
- Do not expand backend, auth, integrations, or Gmail automation.
- Do not ignore mobile, where the duplicated header and hero stack are most obvious.
- Do not polish more module brochures until the HQ spine is visibly proven.

## Next 5 Design Tasks
- [ ] Reduce mobile route chrome: keep one compact EasyLife identity area and remove any duplicated title/header energy above the primary module content; no routing or auth changes.
- [ ] Make HQ the screenshot target: verify the protected first screen shows one daily next action, today context, and compact module status before any feature inventory; no new systems.
- [ ] Quiet repeated CTAs on module routes: demote "Start Free" and "See Features" when they compete with the module's working preview; preserve existing navigation behavior.
- [ ] Convert one module hero preview into a reusable compact status pattern that could live inside HQ; keep copy short and avoid adding new data sources.
- [ ] Tighten mobile type scale and card spacing on one module page so the first viewport shows more useful state without clipped text or cramped controls.

## Stop Or Continue
continue but fix visual issues first