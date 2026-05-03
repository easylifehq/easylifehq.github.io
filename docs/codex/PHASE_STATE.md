# Phase State

Current Phase: repair
Audience: Spencer as the signed-in EasyLife user managing tasks, notes, calendar, workouts, and daily planning
Product Promise: EasyLife helps one person start the day, capture tasks/notes/events, and recover from mistakes without fighting the app.
Primary Action: Open the signed-in HQ or current module and take the next daily action.
Showable Moment: The protected side feels like a calm connected daily assistant instead of separate unfinished tools.
What Not To Build: Do not edit Firebase rules, auth setup, backend config, package/dependency files, generated output, secrets, deployment config, data shapes, or root deployed files.
No More Features Lock: true
Complexity Budget: Protected first viewport: one daily action, compact module status, no duplicate product chrome, no giant stacked controls, and mobile content starts high.
Before/After Judgment: Each task must make the signed-in product visibly clearer, calmer, more useful, or easier to undo than the previous inspected state.
Human Taste Note: Apple-clean, useful, obvious progress, personal assistant direction
Phase Model Policy: judgment-heavy
Parking State: ACTIVE
Evidence Required: Build output, protected visual QA or screenshot evidence, and a short before/after note.
Done Signal: Signed-in HQ and active modules feel meaningfully upgraded, mobile controls are readable, and remaining work is no longer obvious from a quick phone check.
Next Phase Criteria: Move to simplicity when the protected assistant spine is coherent and remaining tasks are mostly density, wording, or small interaction repairs.
Repair Trigger: LOOPING_QUALITY: repair active pack before fresh work
Repair Return Phase: shape
Updated At: 2026-05-03 02:57:29

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
