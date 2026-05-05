# Phase State

Current Phase: phase-4-command-layer
Audience: Spencer as the signed-in EasyLife user managing tasks, notes, calendar, workouts, and daily planning
Product Promise: EasyLife helps Spencer know what matters now, capture life quickly, turn scattered inputs into usable plans, and keep deeper tools available without visual overload.
Primary Action: Open Today, see the next best move, and capture or clear one item.
Showable Moment: EasyLife feels faster because common actions are reachable through a calm command layer.
What Not To Build: Do not edit Firebase rules, auth setup, backend config, package/dependency files, generated output, secrets, deployment config, data shapes, or root deployed files.
No More Features Lock: true
Complexity Budget: Protected first viewport: one daily action, compact today context, quiet module status, no duplicate product chrome, no giant stacked controls, and mobile content starts high.
Before/After Judgment: Each task must make the signed-in product visibly clearer, calmer, more useful, or easier to undo than the previous inspected state.
Human Taste Note: sleek, high-tech, calm, powerful, Apple/Linear/Notion-inspired, with optional fun themes later
Phase Model Policy: judgment-heavy
Parking State: ACTIVE
Evidence Required: Build output, protected visual QA or screenshot evidence, and a short before/after note.
Done Signal: The command layer supports quick add, plan my day, what am I forgetting, email-to-task entry, study-plan entry, and short time-window actions without crowding Today.
Next Phase Criteria: Move to Phase 5 Inbox Intelligence when command/capture entry points are coherent and the next work is email-derived tasks/events/follow-ups.
Repair Trigger: none
Repair Return Phase: phase-4-command-layer
Updated At: 2026-05-05 13:34:55

## Phase Order

Website loop: brief -> foundation -> shape -> simplicity -> polish -> proof -> parked

Website stage contract source: docs/codex/WEBSITE_STAGE_RULES.md when present. Use leet-website-stages.ps1 -Project EasyLife -WriteReference from the fleet control room to write or refresh it.

Analytical software loop: problem-brief -> data-contract -> formula-spec -> fixture-tests -> engine-build -> calibration -> dashboard -> scenario-tools -> analysis-proof -> parked

repair is an interrupt lane, not a normal destination. Any phase can enter repair when RED review gates, build/runtime failures, quarantine, stale/idle lock problems, or visual blockers stop safe progress. After the repair passes, return to the previous product phase.

## Phase Locks

- Brief must define audience, promise, primary action, and what not to build.
- Foundation may add missing structure and core behavior.
- Shape may reorganize pages and flows, but should avoid feature sprawl.
- Simplicity should remove, combine, shorten, hide, or demote before adding.
- Polish should refine visual/copy details without changing the core flow.
- Proof should fix blockers only.
- Parked means review-ready; do not generate new work unless a human moves the phase.
- Repair must address only the named blocker, keep No More Features Lock true, and avoid fresh feature work.
- Problem Brief defines the decision, user, outputs, and what not to predict.
- Data Contract defines CSV schemas, database tables, IDs, missing-data behavior, and snapshot/version rules.
- Formula Spec writes deterministic formulas, weights, defaults, confidence rules, and examples before coding.
- Fixture Tests creates tiny known datasets with obvious expected answers before full app work.
- Engine Build implements loaders, validators, scoring, ranking, probabilities, and exports.
- Calibration compares model outputs against history, known sanity checks, and confidence behavior.
- Dashboard builds table-first review UI only after formulas and fixtures are trustworthy.
- Scenario Tools adds what-if controls, weight changes, strategy modes, and comparison workflows.
- Analysis Proof fixes blockers only: tests, import validation, reports, deterministic outputs, and no live-data dependency.

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

