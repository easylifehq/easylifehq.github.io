# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
The branch is cleaner and more coherent than before, but it is still presenting EasyLife like a polished brochure rack instead of proving the daily operating-system spine.

## Mission Fit
The direction partially matches the mission: the module pages now share a calm visual language, restrained palette, strong type, and consistent cards. That supports "one suite." But Pack 1 is Product Spine, and the screenshots mostly show public/product explanation pages for EasyCalendar, EasyList, EasyNotes, and EasyWorkout, not the signed-in daily start surface. The mission says the first screen should help the user understand what to do next today; current evidence still says "here are four product pages." Very tidy, very polite, still dodging the main job.

## Taste Check
The best taste move is restraint: the soft green-gray background, compact preview panels, and confident black headline type feel calmer than generic SaaS confetti. The product has a recognizable tone now.

The weak part is hierarchy discipline. Every route uses the same oversized hero formula, the same "Start Free / See Features" CTA rhythm, the same pill stack, and the same feature band. It looks consistent, yes, but also templated. The interface is wearing a nice suit to explain itself instead of letting the actual product work.

## Visual Problems To Fix
- The module pages repeat page identity too much: EasyLifeHQ appears in the top chrome, then again as brand text, then each module gets a giant eyebrow and hero. It feels like route chrome plus demo page chrome fighting for oxygen.
- The first viewport is still dominated by marketing explanation and CTAs, not a signed-in daily next action. That violates the Information Staging contract for the working app surface.
- "Start Free" appears across app/module surfaces and makes the product feel like acquisition marketing rather than a personal operating system the user is already inside.
- Desktop layouts are clean but over-carded: large white hero card, preview card, feature card, and repeated mini cards create a box-in-box presentation instead of a lived-in workspace.
- Mobile type is too large in several hero sections, especially body copy; the screens feel readable but heavy, with too much vertical scrolling before utility appears.
- The preview panels are useful, but they are still static product props. They do not yet feel like actionable module status or a connected Today flow.
- EasyWorkout's mobile tag row loses the pill styling seen elsewhere and reads like loose tab text, which weakens system consistency.
- EasyList's tone is sharper and more human than the others, but "annoying stuff" plus "Start Free" creates a weird mix of premium personal tool and landing-page hustle.

## Strongest Opportunities
- Convert the protected HQ first screen into the evidence piece: one next action, today context, and compact module status should be visually unmistakable.
- Replace public-page CTAs on signed-in/module demo surfaces with quieter app actions like "Open Today," "Add task," "Capture note," or "Review queue."
- Let each module inherit a shared shell but vary the working preview enough to show its real job, not just a matching marketing template.
- Reduce hero scale on mobile and bring the preview/work surface higher so utility arrives before the second screen.
- Use one connected status strip across modules: tasks due, notes captured, calendar windows, workout state. That would make the suite feel connected instead of merely branded.

## Priority Fix
Fix the product spine before adding another surface: the first signed-in/HQ screen needs to visually prove "what should I do next today" with one dominant daily action, compact today context, and quiet module status. Strip acquisition-style CTAs and repeated explanatory chrome from app-facing routes, then make the working preview/action area arrive above the fold on mobile. Nami should treat this as subtraction and hierarchy repair, not a new dashboard feature.

## Magic Improvement Score
SCORE: 2; DIRECTION: flat; ACTIVE_PACK: Pack 1 - Product Spine; REASON: visual consistency improved, but the evidence still shows polished module marketing instead of the daily operating spine.

## Designer Handoff
Keep the palette, the heavier headline confidence, the soft preview panels, and the calmer card language. Change the screen priority. The next batch should make EasyLife feel already in use: Today first, one clear action, then compact signals from List, Notes, Calendar, and Workout. Product explanation should step back behind route navigation or secondary sections. The user should feel "I know what to do next," not "I have read four tasteful brochures."

## What Not To Do Next
- Do not add more feature sections to make the modules feel richer.
- Do not add new marketing copy to explain the suite.
- Do not make a bigger dashboard with every module control visible at once.
- Do not introduce more decorative cards, badges, or pill rows.
- Do not change backend, auth, data models, routing architecture, packages, or deployment.
- Do not ignore mobile; the current mobile layouts are readable but too vertically expensive.

## Next 5 Design Tasks
- [ ] Replace signed-in/module "Start Free" style CTAs with app-appropriate actions, with no auth, routing, backend, or package changes.
- [ ] Reduce mobile hero typography and spacing on one module page so the preview/action surface appears earlier, without changing content structure.
- [ ] Tighten the EasyLifeHQ header on module pages by removing repeated brand/title noise, while preserving navigation and current routes.
- [ ] Make one HQ/Today section show a single dominant next action plus compact module status, using existing/mock data only and no new systems.
- [ ] Normalize the module preview/tag styling across EasyList, EasyNotes, EasyCalendar, and EasyWorkout, with special attention to EasyWorkout mobile.

## Stop Or Continue
continue but fix visual issues first