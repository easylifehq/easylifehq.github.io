# Phase State

Current Phase: stage-0-ai-personal-assistant-reset
Audience: Spencer as the signed-in EasyLife user managing tasks, notes, calendar, workouts, and daily planning
Product Promise: EasyLife becomes one clean AI personal assistant, not a visible bundle of separate mini-apps.
Primary Action: Decide what belongs on the first screen, what gets hidden, and what should be removed before coding resumes.
Showable Moment: The fleet has a precise Stage 1 implementation packet that simplifies the product instead of adding dashboard clutter.
What Not To Build: Do not edit Firebase rules, auth setup, backend config, package/dependency files, generated output, secrets, deployment config, data shapes, or root deployed files.
No More Features Lock: true
Complexity Budget: Stage 0 is docs/planning only. Stage 1 may touch one owned surface per task and every UI task must remove, hide, or simplify at least one confusing element.
Before/After Judgment: Each task must make EasyLife feel more like one assistant and less like a dashboard or app launcher.
Human Taste Note: keep the useful theme mood, but the real goal is sleek, high-tech, calm, powerful, Apple/Linear/Notion-inspired, and much less visually crowded.
Phase Model Policy: judgment-heavy
Parking State: ACTIVE_REBUILD_PLANNING
Evidence Required: AI_PERSONAL_ASSISTANT_REBUILD_PLAN, Stage 0 audit, target IA, reset decision, and a Stage 1 implementation packet.
Done Signal: Stage 0 docs exist, name exact routes/files, identify what to remove or hide, and seed exactly three Stage 1 simplification tasks.
Next Phase Criteria: Move to Stage 1 only after docs-only Stage 0 is committed cleanly.
Repair Trigger: any task tries to add visible modules, dashboard cards, broad visual polish, or feature sprawl before Stage 0 decisions are complete.
Repair Return Phase: stage-0-ai-personal-assistant-reset
Updated At: 2026-05-05 23:12:32

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










