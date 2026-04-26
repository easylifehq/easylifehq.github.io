# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is getting calmer and more coherent, but it still reads too much like a polite stack of rounded cards instead of one confident personal operating system.

## Mission Fit
The direction matches Pack 1 - Product Spine: shared navigation, calmer marketing hierarchy, more consistent product previews, and safer visual polish all support the suite mission. The problem is that many changes are micro-adjustments to density and pills, while the larger product spine still lacks a strong signed-in first-screen hierarchy that says "start here, this is your day, these apps belong together."

## Taste Check
The restrained tone, reduced mobile badge pressure, and quieter preview treatments are moving in the right direction. The suite is less noisy than before, and the marketing pages seem more disciplined. Still, the visual language is over-dependent on soft cards, chips, bordered panels, and equal-weight modules. It is clean, yes, but clean can still be timid. Right now the product is wearing a nice shirt and forgetting to stand up straight.

## Visual Problems To Fix
- Signed-in surfaces still appear too interchangeable across List, Notes, Calendar, and Workout.
- Rounded card language is repeated too often, making primary, secondary, and tertiary content feel similar.
- Mobile hierarchy has improved but still risks preview/content competition above the fold.
- The product spine is not yet obvious enough from the first authenticated view.
- Some improvements are visually subtle enough that the branch can feel like polish without a clear step-change.
- Shared styles have broad impact, so small changes need stricter screenshot comparison across all main routes.
- Marketing previews still need more app-specific structure, not just lighter pills or smaller badges.

## Strongest Opportunities
- Give the signed-in home or shared shell a stronger "today" composition that connects tasks, notes, calendar, and workouts in one scan.
- Replace one repeated card grid with a more editorial operational layout: one dominant working panel, two quiet supporting panels, and clear next action.
- Create distinct preview identities for each product page using layout rhythm, not new colors or decorative assets.
- Tighten mobile first viewport rules so brand, H1, CTA, and preview never compete for equal importance.
- Make Settings feel more like the control center for the suite, with grouped sections that feel deliberate instead of administratively stacked.

## Priority Fix
Fix the signed-in product spine, not another marketing badge. Choose one authenticated surface, preferably the shared HQ or dashboard, and make it immediately communicate "this is your EasyLife operating system" through hierarchy: one dominant today panel, clear cross-app signals, quieter secondary modules, and fewer equal card blocks. Keep the behavior unchanged, but make the first scan feel owned.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: shared polish and mobile density improved, but the core suite spine still lacks a memorable signed-in hierarchy.

## Designer Handoff
Next batch should stop shaving pixels off marketing pills and make one logged-in screen visibly stronger. Keep the calm palette, restrained copy, and small safe scope. Change the composition: reduce equal-weight card grids, establish one primary daily panel, and use supporting modules as quiet context instead of competing boxes. The result should feel like opening a useful personal command surface, not browsing a component library with good manners.

## What Not To Do Next
- Do not add more marketing sections.
- Do not introduce new decorative gradients, blobs, or loud accent colors.
- Do not keep making tiny badge-density fixes while the signed-in spine stays generic.
- Do not broaden into backend, auth, settings behavior, data models, or routing changes.
- Do not make every app preview larger to prove personality.
- Do not ignore mobile after desktop looks acceptable.
- Do not solve hierarchy by adding more borders.

## Next 5 Design Tasks
- [ ] Rework one authenticated dashboard/HQ section into a primary "today" panel plus quieter supporting modules, preserving all existing data and behavior.
- [ ] Audit one signed-in route for repeated card/chip treatments and remove or flatten one nonessential container without reducing clarity.
- [ ] Give EasyNotes or EasyWorkout one app-specific layout cue in its signed-in surface using spacing, grouping, or label hierarchy only.
- [ ] Check the main mobile authenticated viewport at 390px and reduce one cramped control or competing header treatment while keeping tap targets intact.
- [ ] Review shared `globals.css` changes against List, Notes, Calendar, Workout, and Settings screenshots to confirm one polish rule is helping all routes and not just one page.

## Stop Or Continue
continue but fix visual issues first