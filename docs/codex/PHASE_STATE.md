# Phase State

Current Phase: shape
Audience: Spencer as the signed-in EasyLife user managing tasks, notes, calendar, workouts, and daily planning
Product Promise: EasyLife helps one person start the day, capture tasks/notes/events, and recover from mistakes without fighting the app.
Primary Action: Open the signed-in HQ or current module and take the next daily action.
Showable Moment: The protected side feels like a calm connected daily assistant instead of separate unfinished tools.
What Not To Build: Do not edit Firebase rules, auth setup, backend config, package/dependency files, generated output, secrets, deployment config, data shapes, or root deployed files.
No More Features Lock: false
Complexity Budget: Protected first viewport: one daily action, compact module status, no duplicate product chrome, no giant stacked controls, and mobile content starts high.
Before/After Judgment: Each task must make the signed-in product visibly clearer, calmer, more useful, or easier to undo than the previous inspected state.
Human Taste Note: Apple-clean, useful, obvious progress, personal assistant direction
Phase Model Policy: judgment-heavy
Parking State: ACTIVE
Evidence Required: Build output, protected visual QA or screenshot evidence, and a short before/after note.
Done Signal: Signed-in HQ and active modules feel meaningfully upgraded, mobile controls are readable, and remaining work is no longer obvious from a quick phone check.
Next Phase Criteria: Move to simplicity when the protected assistant spine is coherent and remaining tasks are mostly density, wording, or small interaction repairs.
Updated At: 2026-04-28 18:02:31

## Phase Order

brief -> foundation -> shape -> simplicity -> polish -> proof -> parked

## Phase Locks

- Brief must define audience, promise, primary action, and what not to build.
- Foundation may add missing structure and core behavior.
- Shape may reorganize pages and flows, but should avoid feature sprawl.
- Simplicity should remove, combine, shorten, hide, or demote before adding.
- Polish should refine visual/copy details without changing the core flow.
- Proof should fix blockers only.
- Parked means review-ready; do not generate new work unless a human moves the phase.

## Upgrade Rules

- One primary action above the fold.
- No more features after Foundation unless a human moves the phase backward.
- Track whether each task makes the product clearer, simpler, more useful, or more beautiful.
- Keep one sentence product promise visible to the planner.
- Respect complexity budgets for sections, CTAs, choices, and visible copy.
- Protect the showable moment.
- Honor human taste notes.
- Use stronger judgment for Shape, Simplicity, and Polish.
- Park review-ready ships instead of continuing to generate improvements.
