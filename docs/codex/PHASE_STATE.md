# Phase State

Current Phase: stage-11-safe-local-memory
Audience: Spencer as the signed-in EasyLife user managing tasks, notes, calendar, workouts, and daily planning
Product Promise: EasyLife becomes one clean AI personal assistant, not a visible bundle of separate mini-apps.
Primary Action: Turn approved assistant suggestions into visible unsaved local draft previews before any real save behavior exists.
Showable Moment: EasyLife opens as one assistant path with Today, Inbox, Plan, Notes, and More instead of a visible app suite.
What Not To Build: Do not edit Firebase rules, auth setup, backend config, package/dependency files, generated output, secrets, deployment config, data shapes, or root deployed files.
No More Features Lock: true
Complexity Budget: Stage 11 tasks must add one safe local draft behavior at a time and must not add autonomous actions, hidden writes, real memory, or persistence.
Before/After Judgment: Each assistant brain task must make EasyLife more useful without pretending to have real AI, real memory, external sync, or hidden automation.
Human Taste Note: keep the useful theme mood, but the real goal is sleek, high-tech, calm, powerful, Apple/Linear/Notion-inspired, and much less visually crowded.
Phase Model Policy: judgment-heavy
Parking State: READY_FOR_STAGE_11
Evidence Required: build proof, five-route review notes, CHECKPOINT_REVIEW, SIMON_DESIGN_REVIEW, ROBIN_COPY_REVIEW, NIGHTLY_REPORT, MAGIC_SCORECARD.
Done Signal: Stage 1-5 implementation tasks passed build and the five review routes render reliably with `?demo=1`.
Next Phase Criteria: Stage 10 proof now says READY_FOR_STAGE_11. Stage 11 Safe Local Memory may begin using the prepared local draft tasks in NEXT_5_TASKS.md.
Repair Trigger: build failure, route review regression, auth preview regression, or visual polish expanding into new feature work.
Repair Return Phase: stage-11-safe-local-memory
Updated At: 2026-05-11 - Stage 10 assistant brain proof passed; Stage 11 safe local memory approved.

## Assistant Brain Gate

The real assistant brain comes after visual polish, not before it. Stage 10 is now approved because the visual proof packet confirmed the shell is credible enough for human review.

Stage 10 source: docs/codex/EASYLIFE_STAGE_10_ASSISTANT_BRAIN_PLAN.md

First Stage 10 behavior: approval-first intake classification. The assistant may suggest task, note, plan, reminder, follow-up, or unsure intent, but it must not create hidden writes, sync external systems, send email, alter calendars, or imply real memory until those contracts exist.

Completed Stage 10 queue: approval-first intent contract, visible Inbox suggestion card, local approval preview states, Today local intent language, and this proof packet.

## Safe Local Memory Gate

Stage 10 proof result: READY_FOR_STAGE_11.

Stage 11 source: docs/codex/EASYLIFE_STAGE_11_SAFE_LOCAL_MEMORY_PLAN.md

Prepared Stage 11 queue: docs/codex/NEXT_5_TASKS.md contains exactly five safe local memory tasks.

Stage 11 may create visible unsaved draft previews from approved local suggestions. The assistant may show what a suggestion would become, but it must not write to tasks, notes, calendar, memory, email, sync, backend, Firebase config, dependencies, generated output, deploy config, or secrets.

## Phase Order

Website loop: brief -> foundation -> shape -> simplicity -> polish -> proof -> parked

Website stage contract source: docs/codex/WEBSITE_STAGE_RULES.md when present. Use fleet-website-stages.ps1 -Project EasyLife -WriteReference from the fleet control room to write or refresh it.

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
- Visual polish is deferred until Stage 9; pre-Stage-9 visual changes are allowed only when they support shell clarity or Today clarity.
- Track whether each task makes the product clearer, simpler, more useful, or more beautiful.
- Keep one sentence product promise visible to the planner.
- Respect complexity budgets for sections, CTAs, choices, and visible copy.
- Protect the showable moment.
- Honor human taste notes.
- Use stronger judgment for Shape, Simplicity, and Polish.
- Park review-ready ships instead of continuing to generate improvements.
