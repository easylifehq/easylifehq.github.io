# Quarantined Fleet Tasks


## 2026-05-07 11:50:33

- Batch: 1
- Task index: 1
- Task: User pain: the previous task was quarantined before implementation because Review reported an unresolved P1/P2 finding, so the ship needs one small visible repair instead of another broad pass. Skill: debugging-and-error-recovery. Target: app-vNext/src/features/hq/routes/HQPage.tsx, app-vNext/src/styles/globals.css, docs/codex/NIGHTLY_REPORT.md, docs/codex/MAGIC_SCORECARD.md. Change: make exactly one narrow safe slice that improves a visible UI, interaction, or copy area; prefer deleting awkward complexity over adding new systems. First screen: keep the current primary Today command surface dominant and move any repaired detail/helper content behind the existing clear action. Remove/simplify: one repeated label, one oversized chrome area, one vague phrase, or one confusing interaction in the current surface only. Guardrails: no backend, no auth, no payments, no Firebase rules/config, no package/dependency files, no generated output, no deployment config, no secrets, and no unrelated files. Acceptance: npm.cmd run build from app-vNext. Proof: NIGHTLY_REPORT.md and MAGIC_SCORECARD.md explain the repair result. Stop if: the repair needs backend, secrets, dependency, deployment, or files outside declared scope. Check: run the acceptance command and confirm the changed screen has one clearer visible outcome without expanding scope. [class:bugfix risk:low mode:single impact:visible surface:app scope:app-vNext/src/features/hq/routes/HQPage.tsx,app-vNext/src/styles/globals.css,docs/codex/ accept:npm.cmd run build]
- Reason: Implementation guardrails failed.
- Files restored before continuing:
- app-vNext/src/features/hq/routes/HQPage.tsx
- docs/codex/MAGIC_SCORECARD.md
- Next step: Nami should avoid repeating this exact task until a human reviews the failure.
