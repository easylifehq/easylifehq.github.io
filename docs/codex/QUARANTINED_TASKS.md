# Quarantined Fleet Tasks


## 2026-05-07 12:01:44

- Batch: 1
- Task index: 1
- Task: User pain: the previous task was quarantined before implementation because implementation guardrails failed, so the ship needs one small visible repair with tighter scope before another broad pass. Skill: debugging-and-error-recovery. Target: app-vNext/src/features/hq/routes/HQPage.tsx, app-vNext/src/styles/globals.css, docs/codex/NIGHTLY_REPORT.md, docs/codex/MAGIC_SCORECARD.md. Change: make exactly one narrow safe slice that fixes the guardrail issue by reducing a visible Today UI, interaction, or copy area; prefer deleting awkward complexity over adding new systems. First screen: keep the Today command surface dominant and move any repaired detail/helper content behind the existing clear action. Remove/simplify: one repeated label, one oversized chrome area, one vague phrase, or one confusing interaction in the Today surface only. Guardrails: no backend, no auth, no payments, no Firebase rules/config, no package/dependency files, no generated output, no deployment config, no secrets, and no unrelated files. Acceptance: npm.cmd run build from app-vNext. Proof: NIGHTLY_REPORT.md and MAGIC_SCORECARD.md explain the repair result, files changed, and build result. Stop if: the repair needs backend, secrets, dependency, deployment, or files outside declared scope. Check: run the acceptance command and confirm Today has one clearer visible outcome without expanding scope. [class:bugfix risk:low mode:single impact:visible surface:app scope:app-vNext/src/features/hq/routes/HQPage.tsx,app-vNext/src/styles/globals.css,docs/codex/ accept:npm.cmd run build]
- Reason: Review reported an unresolved P1/P2 finding.
- Files restored before continuing:
- app-vNext/src/features/hq/routes/HQPage.tsx
- app-vNext/src/styles/globals.css
- docs/codex/RUNTIME_VERIFICATION.md
- Next step: Nami should avoid repeating this exact task until a human reviews the failure.

## 2026-05-07 13:01:26

- Batch: 1
- Task index: 1
- Task: User pain: the previous task was quarantined before implementation because Review reported an unresolved P1/P2 finding., so the ship needs one small visible repair instead of another broad pass. Skill: debugging-and-error-recovery. Target: app-vNext/src/features/hq/routes/HQPage.tsx/. Change: make exactly one narrow safe slice that improves a visible UI, interaction, or copy area; prefer deleting awkward complexity over adding new systems. First screen: keep the current primary screen job dominant and move any repaired detail/helper content behind the existing clear action. Remove/simplify: one repeated label, one oversized chrome area, one vague phrase, or one confusing interaction in the current surface only. Guardrails: no backend, no auth, no payments, no Firebase rules/config, no package/dependency files, no generated output, no deployment config, no secrets, and no unrelated files. Acceptance: npm.cmd run build. Proof: NIGHTLY_REPORT.md and MAGIC_SCORECARD.md explain the repair result. Stop if: the repair needs backend, secrets, dependency, deployment, or files outside declared scope. Check: run the acceptance command and confirm the changed screen has one clearer visible outcome without expanding scope. [class:bugfix risk:low mode:single impact:visible surface:mixed scope:app-vNext/src/features/hq/routes/HQPage.tsx,app-vNext/src/styles/globals.css,docs/codex accept:npm.cmd run build]
- Reason: Implementation guardrails failed.
- Files restored before continuing:
- app-vNext/src/features/hq/routes/HQPage.tsx
- docs/codex/MAGIC_SCORECARD.md
- Next step: Nami should avoid repeating this exact task until a human reviews the failure.

## 2026-05-07 15:03:39

- Batch: 1
- Task index: 1
- Task: User pain: the previous task was quarantined before implementation because implementation guardrails failed, so the ship needs one small visible repair with tighter scope before another broad pass. Skill: debugging-and-error-recovery. Target: app-vNext/src/features/hq/routes/HQPage.tsx, app-vNext/src/styles/globals.css, docs/codex/NIGHTLY_REPORT.md, docs/codex/MAGIC_SCORECARD.md. Change: make exactly one narrow safe slice that fixes the guardrail issue by reducing a visible Today UI, interaction, or copy area; prefer deleting awkward complexity over adding new systems. First screen: keep the Today command surface dominant and move any repaired detail/helper content behind the existing clear action. Remove/simplify: one repeated label, one oversized chrome area, one vague phrase, or one confusing interaction in the Today surface only. Guardrails: no backend, no auth, no payments, no Firebase rules/config, no package/dependency files, no generated output, no deployment config, no secrets, and no unrelated files. Acceptance: npm.cmd run build from app-vNext. Proof: NIGHTLY_REPORT.md and MAGIC_SCORECARD.md explain the repair result, files changed, and build result. Stop if: the repair needs backend, secrets, dependency, deployment, or files outside declared scope. Check: run the acceptance command and confirm Today has one clearer visible outcome without expanding scope. [class:bugfix risk:low mode:single impact:visible surface:app scope:app-vNext/src/features/hq/routes/HQPage.tsx,app-vNext/src/styles/globals.css,docs/codex/ accept:npm.cmd run build]
- Reason: Implementation guardrails failed.
- Files restored before continuing:
- app-vNext/src/features/hq/routes/HQPage.tsx
- app-vNext/src/styles/globals.css
- docs/codex/MAGIC_SCORECARD.md
- Next step: Nami should avoid repeating this exact task until a human reviews the failure.

## 2026-05-07 15:56:52

- Batch: 2
- Task index: 1
- Task: User pain: Plan/Calendar should operate like an assistant day timeline, not a dense calendar module. Skill: frontend-ui-engineering. Target: app-vNext/src/features/easycalendar/routes/EasyCalendarDayPage.tsx, app-vNext/src/styles/globals.css, docs/codex/NIGHTLY_REPORT.md. Change: make one small visible reduction in the day plan route so next block, open room, or schedule triage language feels sharper and more assistant-led. First screen: Plan supports Today and keeps the day's next action clear. Remove/simplify: one repeated label, cramped control, or explanatory phrase. Guardrails: frontend-only; preserve calendar data shapes, recurrence behavior, routes, backend, auth, payments, Firebase rules/config, dependencies, package files, generated output, deployment config, secrets, and unrelated modules. Acceptance: npm.cmd run build from app-vNext. Proof: NIGHTLY_REPORT.md names the route, simplification, changed files, and build result. Stop if: the change requires calendar model or persistence changes. Check: Plan tells the user what is next without adding a new dashboard. [class:design risk:medium mode:single impact:visible surface:app scope:app-vNext/src/features/easycalendar/routes/EasyCalendarDayPage.tsx,app-vNext/src/styles/,docs/codex/ accept:npm.cmd run build]
- Reason: Large Phase 3 task requires a concrete slice plan before implementation.
- Files restored before continuing:
- None
- Next step: Nami should avoid repeating this exact task until a human reviews the failure.

## 2026-05-07 16:05:10

- Batch: 5
- Task index: 1
- Task: User pain: More should feel like optional powers under the assistant, not a junk drawer of apps. Skill: frontend-ui-engineering. Target: app-vNext/src/components/navigation/ProductsMenu.tsx, app-vNext/src/components/navigation/appProducts.ts, app-vNext/src/styles/globals.css, docs/codex/NIGHTLY_REPORT.md. Change: make one grouping/copy/style reduction so workout, projects, pipeline/jobs, contacts, statistics, school, and fun/drinks stay secondary. First screen: Today, Capture, Plan, Notes, and More remain the core model. Remove/simplify: one optional module label, group description, or menu treatment that makes optional modules feel primary. Guardrails: frontend-only; no route deletion, settings schema changes, backend, auth, payments, dependencies, package files, generated output, deployment config, secrets, or unrelated modules. Acceptance: npm.cmd run build from app-vNext. Proof: NIGHTLY_REPORT.md names the optional-module change, build result, and desktop/mobile menu inspected. Stop if: the change requires deleting routes or changing stored settings. Check: More is discoverable but not competing with Today. [class:design risk:medium mode:single impact:visible surface:app scope:app-vNext/src/components/navigation/ProductsMenu.tsx,app-vNext/src/components/navigation/appProducts.ts,app-vNext/src/styles/,docs/codex/ accept:npm.cmd run build]
- Reason: Large Phase 3 task requires a concrete slice plan before implementation.
- Files restored before continuing:
- None
- Next step: Nami should avoid repeating this exact task until a human reviews the failure.
