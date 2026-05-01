# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
The branch is calmer and more coherent than before, but EasyLife still looks too much like a polished brochure wrapped around an app instead of one daily operating surface.

## Mission Fit
The direction partially matches the mission: the module pages now share a visual language, clearer copy, and a more restrained teal system, which helps the suite feel connected. The miss is Pack 1: the signed-in product spine is still not dominant enough. The first screens keep explaining modules with large marketing cards, repeated labels, and feature bands before proving the daily assistant job.

## Taste Check
The best parts are the quieter colors, tactile rounded panels, stronger module previews, and less frantic copy. EasyList, EasyCalendar, EasyNotes, and EasyWorkout now feel like siblings.

The weak parts are the oversized hero typography, pill overload, repeated identity chrome, and too many card containers stacked like a product tour. The interface has taste, but it is still wearing its pitch deck jacket indoors.

## Visual Problems To Fix
- The customer-facing module routes repeat page identity: top nav says EasyLifeHQ, the hero repeats EasyLifeHQ or the module name, then the preview card repeats the module again. This creates double-header energy.
- Mobile module pages have a heavy header slab followed immediately by a heavy hero slab, so the actual product example feels buried under wrapper chrome.
- The first viewport on marketing/module pages exposes too many headings and label systems at once: eyebrow, giant title, CTAs, chips, preview card heading, preview rows, then a feature section.
- Settings desktop violates the staging contract: the first screen shows too many controls and cards before one clear daily setup action wins.
- Settings mobile stacks large cards with large type, making the page feel like a scroll of configuration blocks rather than a calm control center.
- Product chips are visually loud for secondary information; they compete with primary action and preview content.
- The hero typography is too large on mobile for a utility product. It feels dramatic instead of fast.
- Preview cards are helpful, but their labels sometimes read as internal product taxonomy rather than immediate user outcomes.

## Strongest Opportunities
- Make the signed-in HQ and Settings first screens behave like the real product spine: one next action, today context, compact module status, then quiet navigation.
- Reduce route chrome across public module pages so the product name, promise, action, and preview are the only first-screen priorities.
- Convert feature-chip rows into quieter metadata or hide some behind progressive disclosure.
- Establish one shared page shell rule: one page title, one primary action, one compact status preview, no repeated identity label.
- Tighten mobile type scale so the product feels like a tool people use daily, not a billboard.

## Priority Fix
Reduce repeated chrome and heading overload before adding anything else. Start with one visible route family and enforce a single identity layer: keep the top navigation, keep one page title, keep the primary CTA, but demote or remove duplicate module pills, secondary chip rows, and repeated preview labels that restate the same thing. Nami should turn this into a small subtraction task, not a redesign.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: module surfaces are calmer and more related, but repeated chrome and first-screen overload still block the product spine.

## Designer Handoff
Next batch should be a subtraction pass. Keep the teal identity, the tactile cards, the useful preview rows, and the calmer copy. Change the hierarchy: one title per screen, fewer chips, quieter nav, smaller mobile hero type, and Settings staged around one daily setup action before deeper controls. The user should feel "I know what to do next," not "I am being shown every feature in the suite."

## What Not To Do Next
- Do not add more sections to solve clarity; the problem is too much first-screen material already.
- Do not make the cards more decorative; the hierarchy needs discipline, not more styling.
- Do not broaden into backend, auth, settings behavior, data, or package work.
- Do not keep polishing copy while leaving repeated route chrome intact.
- Do not ignore mobile; the mobile screens are where the wrapper problem becomes most obvious.

## Next 5 Design Tasks
- [ ] Reduce repeated identity on one public module route: keep top nav and one hero title, remove or demote duplicate module pills and repeated labels; no route, behavior, or dependency changes.
- [ ] Repair Settings first-screen staging: make one daily setup action dominant and move secondary setup cards lower; keep existing controls and data behavior unchanged.
- [ ] Tighten mobile hero scale on module pages: reduce oversized heading/body rhythm while preserving readability and 44px tap targets.
- [ ] Quiet feature-chip rows across one route: keep only the two most useful chips or restyle them as low-emphasis metadata; do not add new copy claims.
- [ ] Recheck visual screenshots for repeated headers and heading count after the subtraction pass; only accept if the first viewport has one clear primary job.

## Stop Or Continue
continue but fix visual issues first