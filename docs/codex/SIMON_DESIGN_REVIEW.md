# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is getting cleaner at the component level, but the product still reads like a tidy module directory instead of a calm daily operating system.

## Mission Fit
The direction partially matches the mission: the notes, workout, and HQ surfaces are accumulating more useful daily cues, and the visual language is becoming more consistent. The miss is still structural. Pack 1 is about the product spine, and the first impression needs to answer "what should I do next today?" before it starts presenting modules, modes, status fragments, or product framing. Right now the suite feels improved, but not yet inevitable.

## Taste Check
The better parts are the quieter notes hierarchy, recent/stale memory cues, and the push toward shared panels and calmer daily language. Those moves feel more like a personal operating system and less like a toy dashboard.

What still feels off: the HQ/command-center framing is too loud for the mission, and some surfaces still have that demo-app habit of explaining themselves while also showing the actual tool. Darling, we do not need the app to introduce itself twice before breakfast. The product should feel self-evident through hierarchy, not through stacked labels and status boxes.

## Visual Problems To Fix
- The protected first screen still risks feeling module-first: compact app areas, capacity signals, notes, workouts, and controls compete before one daily action fully owns the viewport.
- HQ and Command Center naming creates repeated page identity pressure; if both route chrome and the page body announce the same command-center idea, the actual assistant surface feels buried.
- Some helper content appears too close to primary content instead of living behind a clear action, which weakens progressive disclosure.
- The suite has cleaner individual panels, but the hierarchy between "today", "capture", "review", and "module status" is not yet crisp enough.
- Visual QA reports no blocking bugs, but no bugs is not the same as strong design. The page can be technically clean and still strategically mushy.
- The recent recovery slices are very small, so the visible polish improved locally without changing the larger first-screen read.

## Strongest Opportunities
- Make HQ feel like a true daily start: one next action, one today context line, three compact status signals maximum.
- Reduce command-center chrome and repeated labels so the user's day, not the product's architecture, becomes the hero.
- Turn module cards into quiet status indicators with direct verbs, not mini brochures.
- Keep EasyNotes momentum by making capture and review feel connected to EasyList without showing too much internal machinery.
- Unify mobile rhythm: same order, same primary action, fewer stacked explanation bands.

## Priority Fix
Fix the HQ first-screen hierarchy before adding another feature slice. Nami should reduce route chrome, repeated "command center" identity, and secondary module noise so the first viewport has one dominant daily action, one short today context, and a restrained row of module status. The goal is not a prettier dashboard; it is a start surface that tells a busy solo operator exactly where to begin.

## Magic Improvement Score
SCORE: 2; DIRECTION: flat; ACTIVE_PACK: Pack 1 - Product Spine; REASON: local UI polish improved, but the active pack is still blocked by module-first hierarchy instead of a daily operating spine.

## Designer Handoff
Next batch should be subtraction-led. Keep the calmer panel styling, the notes review cues, and the concrete daily-language direction. Change the HQ/Command Center surface so it stops performing as a product index: demote secondary module cards, remove duplicated labels, tighten the header, and make the primary daily action visually dominant on desktop and mobile. The user should feel, "I know what to do next," not "I have entered a nicely organized control room."

## What Not To Do Next
- Do not add more sections to HQ.
- Do not add another status card, mode chip, coach panel, or explanatory wrapper before simplifying the first screen.
- Do not make the command-center idea louder with bigger headings or more nav pills.
- Do not chase visual novelty with gradients, decorative motion, or marketing-style hero treatment.
- Do not ignore mobile; stacked helper content is where this product will start feeling cramped.
- Do not touch backend, auth, Firebase, packages, deployment, or broad architecture while solving a visual hierarchy problem.

## Next 5 Design Tasks
- [ ] HQ chrome reduction: remove or demote one repeated route/page label, with no routing, auth, data, or package changes.
- [ ] HQ first action pass: make one daily next action visually dominant above module status, with no new feature logic.
- [ ] Module status trim: reduce one module card or status cluster to a compact signal plus one verb, preserving existing behavior.
- [ ] Mobile first-viewport check: tighten spacing and ordering so the primary daily action appears before secondary module detail, with no overflow.
- [ ] Notes-to-daily connection polish: keep the note action affordance quiet and place supporting explanation behind an existing action or detail state.

## Stop Or Continue
continue but fix visual issues first