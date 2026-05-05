# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
The visual system is calmer and more coherent, but the reviewed screens still feel like polished product brochures instead of the signed-in daily operating spine EasyLife is supposed to become.

## Mission Fit
The direction partially matches the mission: typography, spacing, shared cards, and teal identity are now recognizably connected across EasyList, EasyNotes, EasyCalendar, and EasyWorkout. The problem is evidence. The screenshots mostly show public/demo-style module pages with "Start Free", "See Features", nav pills, and feature sections, while the active mission is Pack 1 - Product Spine: a signed-in personal operating system where the first screen tells the user what to do next today. Without fresh HQ/Today screenshots, confidence is lower, and the visible work still over-invests in explanation instead of daily action.

## Taste Check
The good: the suite has a quiet, tactile rhythm now. The off-white surface, restrained teal, thick type, and simple preview panels feel more intentional than generic SaaS glass soup. Mobile stacking is mostly readable, and the module identities share a family resemblance.

The weak: every module page uses the same landing-page furniture - huge headline, CTA pair, chips, demo card, "Features" band - so it starts to feel like four tasteful brochures wearing the same jacket. The desktop pages have too much empty top atmosphere before the actual product example, and mobile turns the intro copy into a long scroll before use. The hierarchy is confident, but it is confidently selling the app instead of helping me use it. Very elegant lobby. Still a lobby.

## Visual Problems To Fix
- The reviewed customer-facing module routes repeat the same page identity pattern: global EasyLifeHQ header, route eyebrow, giant module headline, CTA row, chips, demo preview, then a second "Features" intro. This is too much repeated intro chrome before product substance.
- The primary CTAs "Start Free" and "See Features" dominate every module first viewport, which makes the pages read as marketing surfaces rather than connected app surfaces.
- Mobile screenshots show the demo preview pushed below a tall headline, long paragraph, buttons, and chips; the actual useful example arrives too late.
- The header is visually loud relative to the content job on mobile: logo block plus page card makes the route feel wrapped inside a shell instead of immediately useful.
- The chips under each hero look like feature inventory labels, not working controls; they add noise without helping the user act.
- Desktop hero cards are handsome but formulaic: left claim, right pale demo panel, same button pair, same following feature band. The suite feels consistent, but also templated.
- The visible routes do not prove the HQ/Today first-screen contract: one next action, today context, compact module status. That is the active pack, and it is missing from the evidence.
- The EasyWorkout mobile chip row becomes text-only navigation floating between CTA and preview, which weakens affordance clarity.
- The pale grid background is pleasant but overused; paired with many white cards, the page risks looking like a design-system sample instead of a lived-in personal assistant.

## Strongest Opportunities
- Make HQ/Today the proof surface: show the next move, today context, capture entry, and compact module status in one calm first viewport.
- Reduce public route chrome so module pages feel like real product examples first, not onboarding essays.
- Turn the right-side demo panels into more convincing mini app states with selected rows, active states, and one visible action.
- On mobile, bring the useful demo state above or immediately after the headline, and demote chips/feature inventory below it.
- Use a tighter shared route shell for product pages: same family, less theater, stronger app-first structure.
- Let each module have one signature interaction instead of the same hero-card rhythm repeated four times.

## Priority Fix
The next design batch should reduce route chrome and prove the signed-in Today spine. Specifically: capture or inspect the HQ/Today screen, then make the first viewport show one daily next action, one compact today context group, and one quiet capture/command affordance before any module inventory or explanatory copy. On public/demo module pages, demote CTA/chip clutter and move the product example higher. Pack 1 cannot keep being judged from brochure pages.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: shared visual restraint improved, but the evidence still spotlights marketing-style module pages instead of the daily operating-system spine.

## Designer Handoff
Keep the calm palette, strong type, rounded cards, and restrained teal identity. Change the page order and emphasis: the user should see what EasyLife helps them do today before they see a list of reasons the product exists. Make the HQ/Today route the canonical first impression, then make each module page feel like a working slice of that system, not a separate landing page. The result should feel like opening a competent personal assistant, not touring four very polite sales decks.

## What Not To Do Next
- Do not add more sections to the module pages.
- Do not add more chips, badges, or feature cards to explain the product harder.
- Do not redesign the whole suite in one pass.
- Do not make the HQ screen into a dashboard dump with every module control visible.
- Do not hide behind desktop polish while mobile still makes users scroll past the useful thing.
- Do not touch backend, auth, Firebase, packages, deployment, analytics, or architecture.
- Do not start Phase 5 while the current security checkpoint is RED.

## Next 5 Design Tasks
- [ ] Capture and review fresh HQ/Today desktop and 390px mobile screenshots; guardrail: documentation or screenshot evidence only unless a tiny UI repair is clearly required.
- [ ] Reduce the HQ/Today first viewport to one next action, one today context group, and one quiet capture entry; guardrail: no new data sources, no auth/backend changes, no dashboard expansion.
- [ ] Demote public module page chips below the demo preview on mobile; guardrail: preserve existing copy and behavior, change only layout/spacing.
- [ ] Make one module demo panel feel more like an active product state with a selected row or clear next action; guardrail: frontend-only static/local UI, no fake AI or persistence changes.
- [ ] Quiet the repeated "Start Free" / "See Features" CTA treatment on secondary module routes; guardrail: keep navigation available, but reduce first-viewport competition with the product example.

## Stop Or Continue
continue but fix visual issues first