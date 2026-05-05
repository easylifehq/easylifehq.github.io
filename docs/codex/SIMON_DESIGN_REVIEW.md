# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is cleaner and calmer than before, but it is still presenting its modules like a polished brochure instead of a signed-in personal operating system.

## Mission Fit
The visual direction supports calm, professional polish: the typography is strong, spacing is mostly controlled, and the module pages now feel related. But Pack 1 is Product Spine, and the current screenshots still emphasize public product explanation: big slogans, "Start Free", "See Features", feature cards, and repeated marketing sections. That does not satisfy the first-screen contract for a busy signed-in user who needs one daily next action, today context, and compact module status. The product is wearing a nice blazer to do the wrong job.

## Taste Check
The best part is the restrained teal system, large confident type, soft panels, and consistent card rhythm. It feels more intentional than generic SaaS sludge. The mobile screenshots are usable and the hierarchy is readable.

The weak part is that every module page uses the same landing-page recipe: logo bar, oversized hero, CTA buttons, pills, proof panel, then a "Features" section. It is elegant enough, but it is still marketing chrome. The app should feel like a daily workspace, not a product tour that keeps explaining itself.

## Visual Problems To Fix
- Customer-facing route chrome is too loud for the current mission: "Start Free", "See Features", "Overview", "Features", and "Workflow" compete with the actual module utility.
- The module pages repeat the same identity structure: brand header, module eyebrow, giant headline, CTA row, chips, status panel, then "Features". It makes EasyList, EasyNotes, EasyCalendar, and EasyWorkout feel templated instead of operational.
- The first viewport is dominated by slogans instead of a daily action or live working state. That violates the protected first-screen contract if this is meant to represent the app surface.
- Mobile pages remain readable, but the hero blocks are so tall that the user must scroll before seeing enough working product value.
- The pill rows add visual busyness without enough functional weight. They read as tags for a pitch deck, not controls for a personal assistant.
- The preview panels are tasteful but too illustrative. They hint at app function without giving the user a clear next action.
- "Features" sections start too early and too prominently, creating a repeated intro band after the hero. This is classic double-explanation clutter.
- The screenshots include module marketing pages, but not a fresh HQ/Today protected first-screen screenshot, so confidence is lower on whether the actual daily operating spine has improved.

## Strongest Opportunities
- Replace the marketing CTA row on app surfaces with one primary working action: add task, capture note, plan day, start workout, or review today.
- Make the module preview panel become the actual first working surface: compact list, note capture, calendar block, or workout log instead of a decorative product sample.
- Reduce each module page to one quiet page title, one action, and one compact status strip before any explanatory content.
- Create a consistent "Today connection" strip across modules so EasyList, EasyNotes, EasyCalendar, and EasyWorkout visibly belong to the same operating system.
- Push feature explanations below the first viewport or behind a quiet "About this tool" disclosure.
- Keep the typography and palette, but make the hierarchy more useful and less salesy.

## Priority Fix
The single most important fix is to remove brochure-first chrome from the module surfaces and make the first viewport operational. For each main app route, replace "Start Free", "See Features", feature pills, and the oversized pitch structure with one clear primary action, today context, and compact module status. Keep the calm visual language, but stop making the user walk through a showroom before they reach the desk.

## Magic Improvement Score
SCORE: 2; DIRECTION: flat; ACTIVE_PACK: Pack 1 - Product Spine; REASON: surfaces are cleaner, but the active pack is still blocked by marketing-style module hierarchy instead of a daily operating spine.

## Designer Handoff
Next implementer should subtract before adding. Keep the teal, soft panels, large confident type, and consistent spacing. Change the first screen behavior: module pages should open with a working state, not a sales pitch. EasyList should show capture plus today priority. EasyNotes should show quick capture plus recent notes. EasyCalendar should show the next block plus open window. EasyWorkout should show start/log workout plus recent progress. Secondary explanation can stay, but it belongs lower on the page or behind disclosure. The user should feel, "I know what to do next," not "I have been welcomed to another product page."

## What Not To Do Next
- Do not add more feature sections.
- Do not add more hero copy, pills, badges, or decorative panels.
- Do not make a bigger dashboard dump to compensate for weak first-screen focus.
- Do not change backend, auth, packages, deployment, Firebase, or persistence scope.
- Do not ignore mobile; the current mobile hierarchy is readable but too tall and brochure-heavy.
- Do not keep repeating the same product-intro structure across every module.

## Next 5 Design Tasks
- [ ] Remove marketing CTAs from one app module route and replace them with one real primary action; guardrail: no routing, auth, backend, or persistence changes.
- [ ] Convert one module hero preview into a compact working panel with today status; guardrail: use existing/mock UI data only and keep the first viewport shorter on mobile.
- [ ] Reduce one repeated "Features" intro band so it sits below the useful app content; guardrail: do not add a new section to replace it.
- [ ] Quiet the module chip row by either making chips functional controls or removing the weakest row; guardrail: no more than one route in the task.
- [ ] Capture a fresh HQ/Today screenshot and verify the first screen shows one daily next action before module navigation or product explanation; guardrail: review only if implementation is not part of the task.

## Stop Or Continue
continue but fix visual issues first