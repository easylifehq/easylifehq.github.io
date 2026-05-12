# EasyLife Stage 17 Anti-Annoyance Plan

## Mission

Stage 17 is a repair phase. The goal is not to add more EasyLife features. The goal is to remove the five things most likely to make a human reviewer feel like the assistant is still proof scaffolding instead of a useful, slick personal assistant.

Stage 17 should make EasyLife feel calmer, more direct, and less defensive while preserving the approval-first task/note boundaries already built.

## Annoyance Findings

1. Today has the right structure, but the command row is too wordy and proof-like.
2. Contacts / People + Places is useful, but the page is bloated and still feels partly like a CRM dashboard.
3. Future map preview feels like filler because no real map exists yet.
4. Notes overclaims "Memory" while also saying the app does not create real memory.
5. Settings still carries old EasyLife surface sprawl, including Soft Notebook as the default-feeling identity and optional modules competing with assistant controls.

## Stage 17 Rules

- Remove, shorten, collapse, hide, or demote before adding.
- No new feature surfaces beyond consolidation, copy repair, and visual trust cleanup.
- Keep Today, Inbox, Plan, Notes, More as the primary mental model.
- Preserve task save and note/context save behavior.
- Keep plans, reminders, follow-ups, external sending, notifications, calendar sync, model calls, real memory, maps, geocoding, exact addresses, and device location parked.
- Do not change backend/auth/Firebase rules/config, dependencies, package files, deploy config, generated output, or secrets.

## Task 1: Today Command Surface Anti-Annoyance

User pain: Today technically answers what needs attention, but the command row feels like a proof packet because it exposes a long example chain and repeated save-boundary text.

Skill/workflow: frontend-ui-engineering, copy-review-and-quality.

Target files: `app-vNext/src/features/hq/routes/HQPage.tsx`, `app-vNext/src/features/hq/assistantCommandHints.ts`, `app-vNext/src/styles/globals.css`, `docs/codex/NIGHTLY_REPORT.md`, `docs/codex/SIMON_DESIGN_REVIEW.md`, `docs/codex/MAGIC_SCORECARD.md`.

Change: tighten the Today first viewport so the command/capture affordance reads as one compact assistant input rather than a long policy/example block.

First screen rule: keep one assistant read, one next move, one compact command/capture affordance, and one small today strip dominant above the fold.

Remove/simplify requirement: shorten or remove the long command-row example chain and compress repeated save-lane warnings into one calm line or move them below the first viewport.

Guardrails: no new dashboard sections, no persistence changes, no routing changes, no backend/auth/Firebase/dependencies/package/deploy/generated/secrets.

Acceptance command: `npm.cmd run build` from `app-vNext`.

Proof artifact: `SIMON_DESIGN_REVIEW.md` records whether Today feels less wordy, less fake, and more command-surface-like.

Stop condition: stop if the fix requires changing saved task/note behavior, adding cross-route state, or hiding the primary next move.

Metadata: `[class:implementation risk:medium mode:single impact:visible surface:today-command-surface scope:app-vNext/src/features/hq/routes/HQPage.tsx,app-vNext/src/features/hq/assistantCommandHints.ts,app-vNext/src/styles/globals.css,docs/codex/NIGHTLY_REPORT.md,docs/codex/SIMON_DESIGN_REVIEW.md,docs/codex/MAGIC_SCORECARD.md accept:npm.cmd_run_build_from_app-vNext]`

## Task 2: Contacts People + Places Consolidation

User pain: People + Places is useful, but Contacts has too many stacked sections, stats, focus strips, and repeated cards, so it feels like a bloated CRM dashboard.

Skill/workflow: frontend-ui-engineering, code-simplification.

Target files: `app-vNext/src/features/easycontacts/routes/EasyContactsPage.tsx`, `app-vNext/src/styles/globals.css`, `docs/codex/NIGHTLY_REPORT.md`, `docs/codex/SIMON_DESIGN_REVIEW.md`, `docs/codex/MAGIC_SCORECARD.md`.

Change: consolidate the Contacts first screen around who needs attention, where people are, and who is near a place.

First screen rule: the first Contacts viewport must prioritize people/place memory, not contact metrics or CRM management.

Remove/simplify requirement: remove or demote at least one clutter source from the stats grid, duplicate focus strips, repeated place-memory labels, repeated people cards, or CRM-like company/follow-up emphasis.

Guardrails: preserve place memory fields and existing contact behavior; fictional/demo data only; no exact addresses, map API, geocoding, device location, backend/auth/Firebase config, dependencies, package files, deploy config, generated output, or secrets.

Acceptance command: `npm.cmd run build` from `app-vNext`.

Proof artifact: `SIMON_DESIGN_REVIEW.md` records whether Contacts feels more like people/place memory and less like a CRM dashboard.

Stop condition: stop if consolidation requires data shape changes, exact addresses, external data, or removing the user's ability to add/open contacts.

Metadata: `[class:implementation risk:medium mode:single impact:visible surface:contacts-people-places scope:app-vNext/src/features/easycontacts/routes/EasyContactsPage.tsx,app-vNext/src/styles/globals.css,docs/codex/NIGHTLY_REPORT.md,docs/codex/SIMON_DESIGN_REVIEW.md,docs/codex/MAGIC_SCORECARD.md accept:npm.cmd_run_build_from_app-vNext]`

## Task 3: Remove Future Map Filler

User pain: The Future map preview section teases a map before one exists, which can make the current People + Places work feel fake.

Skill/workflow: frontend-ui-engineering, copy-review-and-quality.

Target files: `app-vNext/src/features/easycontacts/routes/EasyContactsPage.tsx`, `app-vNext/src/styles/globals.css`, `docs/codex/NIGHTLY_REPORT.md`, `docs/codex/ROBIN_COPY_REVIEW.md`, `docs/codex/MAGIC_SCORECARD.md`.

Change: remove, hide, or heavily demote the Future map preview and make People by place plus Visiting somewhere? carry the current value.

First screen rule: Contacts should not promise a visual map before the current saved-label place review works well.

Remove/simplify requirement: remove or demote the Future map preview section and any copy that feels like placeholder map scaffolding.

Guardrails: current feature uses saved/freeform place labels only; no real map, map API, geocoding, exact addresses, device location, backend/auth/Firebase config, dependencies, package files, deploy config, generated output, or secrets.

Acceptance command: `npm.cmd run build` from `app-vNext`.

Proof artifact: `ROBIN_COPY_REVIEW.md` records whether the page no longer feels like it is promising a feature it does not have.

Stop condition: stop if the change requires adding map behavior, coordinates, a map dependency, or external location lookup.

Metadata: `[class:implementation risk:low mode:single impact:visible surface:contacts-map-boundary scope:app-vNext/src/features/easycontacts/routes/EasyContactsPage.tsx,app-vNext/src/styles/globals.css,docs/codex/NIGHTLY_REPORT.md,docs/codex/ROBIN_COPY_REVIEW.md,docs/codex/MAGIC_SCORECARD.md accept:npm.cmd_run_build_from_app-vNext]`

## Task 4: Honest Notes/Memory Language Repair

User pain: Notes says Memory and Remember while also warning that no real memory exists, which makes the assistant feel contradictory.

Skill/workflow: copy-review-and-quality, frontend-ui-engineering.

Target files: `app-vNext/src/features/easynotes/routes/EasyNotesLibraryPage.tsx`, `app-vNext/src/features/assistant/localDraftTypes.ts`, `app-vNext/src/features/assistant/localDraftBuilder.ts`, `app-vNext/src/components/navigation/AppHeader.tsx`, `app-vNext/src/styles/globals.css`, `docs/codex/NIGHTLY_REPORT.md`, `docs/codex/ROBIN_COPY_REVIEW.md`, `docs/codex/MAGIC_SCORECARD.md`.

Change: make Notes read as saved context for the assistant without overclaiming real AI memory.

First screen rule: Notes should open as a quiet context surface tied to Today, not a fake memory engine.

Remove/simplify requirement: replace or soften visible "Memory" and "Remember something" language where it implies real AI memory; prefer Notes, saved context, keep context, context draft, or pin for review.

Guardrails: preserve note save behavior; keep no-real-memory boundaries but reduce defensive repetition; no model calls, real memory, sync, backend/auth/Firebase/dependencies/package/deploy/generated/secrets.

Acceptance command: `npm.cmd run build` from `app-vNext`.

Proof artifact: `ROBIN_COPY_REVIEW.md` records whether the copy feels honest and less contradictory.

Stop condition: stop if the repair requires renaming routes, changing persistence, or implying model-backed memory.

Metadata: `[class:implementation risk:medium mode:single impact:visible surface:notes-context-language scope:app-vNext/src/features/easynotes/routes/EasyNotesLibraryPage.tsx,app-vNext/src/features/assistant/localDraftTypes.ts,app-vNext/src/features/assistant/localDraftBuilder.ts,app-vNext/src/components/navigation/AppHeader.tsx,app-vNext/src/styles/globals.css,docs/codex/NIGHTLY_REPORT.md,docs/codex/ROBIN_COPY_REVIEW.md,docs/codex/MAGIC_SCORECARD.md accept:npm.cmd_run_build_from_app-vNext]`

## Task 5: Settings Slick Assistant Cleanup

User pain: Settings still feels like old EasyLife module sprawl because Soft Notebook, optional modules, and app-suite controls compete with the assistant control-panel job.

Skill/workflow: frontend-ui-engineering, code-simplification.

Target files: `app-vNext/src/features/settings/routes/SettingsPage.tsx`, `app-vNext/src/components/navigation/appProducts.ts`, `app-vNext/src/styles/globals.css`, `docs/codex/NIGHTLY_REPORT.md`, `docs/codex/SIMON_DESIGN_REVIEW.md`, `docs/codex/MAGIC_SCORECARD.md`.

Change: make Settings feel more like a slick assistant control panel and less like old app-suite configuration.

First screen rule: Settings should lead with assistant controls and visual tone, not optional module inventory.

Remove/simplify requirement: remove or demote Soft Notebook as the default-feeling visual identity and simplify one settings chrome element or section that makes the page feel like a module inventory.

Guardrails: keep Today, Inbox, Plan, Notes, More as the primary model; optional modules remain reachable under More; do not delete routes or settings behavior; no backend/auth/Firebase/dependencies/package/deploy/generated/secrets.

Acceptance command: `npm.cmd run build` from `app-vNext`.

Proof artifact: `SIMON_DESIGN_REVIEW.md` records whether Settings feels less like old EasyLife and more like assistant controls.

Stop condition: stop if the cleanup requires removing user settings, changing auth, touching package/deploy files, or hiding required account/data controls.

Metadata: `[class:implementation risk:medium mode:single impact:visible surface:settings-assistant-controls scope:app-vNext/src/features/settings/routes/SettingsPage.tsx,app-vNext/src/components/navigation/appProducts.ts,app-vNext/src/styles/globals.css,docs/codex/NIGHTLY_REPORT.md,docs/codex/SIMON_DESIGN_REVIEW.md,docs/codex/MAGIC_SCORECARD.md accept:npm.cmd_run_build_from_app-vNext]`

## Proof Gate

After the five Stage 17 tasks, create a proof packet that inspects Today, Inbox, Plan, Notes, Contacts, and Settings. The proof must name the remaining annoyances honestly and end with one of:

- `READY_FOR_HUMAN_REVIEW`
- `NEEDS_ONE_MORE_ANTI_ANNOYANCE_PASS`
- `NOT_READY_FOR_HUMAN_REVIEW`

