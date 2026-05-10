# EasyLife Assistant Roadmap Execution

## Current Stage

EasyLife is between Stage 0 and Stage 1.

Stage 0 produced the assistant reset direction and the active task queue has been cleaned. The app is not ready for Stage 9 visual polish yet. The next work is Stage 1-5 product-shape execution: make the existing functionality read as one AI personal assistant.

Stage 9 visual polish is deferred. Before Stage 9, visual changes are allowed only when they directly support shell clarity, Today clarity, or a named roadmap surface becoming less separate.

## Non-Negotiable Rules

- Work from one owned surface per task.
- Every implementation task must remove, hide, or simplify one confusing element.
- No new dashboard.
- No new visible module inventory.
- No real AI/API calls until explicitly approved.
- No backend, auth, payments, Firebase rules/config, dependencies, package files, deploy config, generated output, secrets, persistence/data-shape changes, or unrelated modules.
- Build acceptance for implementation/proof tasks: `npm.cmd run build from app-vNext`.
- Proof must name changed files, removed/simplified element, route inspected, and build result.

## Stage 1: One Assistant Shell

User pain: EasyLife still exposes too many separate app surfaces before the assistant model is clear.

Owned surfaces/files:
- `app-vNext/src/components/navigation/appProducts.ts`
- `app-vNext/src/components/navigation/AppHeader.tsx`
- `app-vNext/src/features/settings/routes/SettingsPage.tsx`
- `docs/codex/NIGHTLY_REPORT.md`
- `docs/codex/MAGIC_SCORECARD.md`

What to remove/simplify:
- Remove or demote one label that makes EasyLife read as separate apps.
- Keep optional modules reachable under More/Settings without making them first-path items.

Acceptance command:
- `npm.cmd run build from app-vNext`

Proof artifact:
- `NIGHTLY_REPORT.md` and `MAGIC_SCORECARD.md` name changed files, removed/simplified label, build result, and routes inspected.

Stop conditions:
- Stop if the task requires route deletion, new routes, persistence changes, backend behavior, dependencies, package files, or files outside the target list.

## Stage 2: Today Minimal Surface

User pain: Today has useful pieces but still does not consistently answer what needs attention now.

Owned surfaces/files:
- `app-vNext/src/features/hq/routes/HQPage.tsx`
- `app-vNext/src/styles/globals.css`
- `docs/codex/NIGHTLY_REPORT.md`
- `docs/codex/MAGIC_SCORECARD.md`

What to remove/simplify:
- Remove or hide one audited first-path distraction: useful ideas, semester layer, quiet tools/modules, install card, presentation/demo language, or extra stats grids.
- Keep one assistant read, one next best move, one command/capture input, one small today strip, and one quiet deeper-context entry.

Acceptance command:
- `npm.cmd run build from app-vNext`

Proof artifact:
- `NIGHTLY_REPORT.md` and `MAGIC_SCORECARD.md` record the removed distraction, changed files, build result, and `/app/hq` inspection.

Stop conditions:
- Stop if real model access, new stored data, backend behavior, route deletion, or files outside the target list are needed.

## Stage 3: Assistant Inbox

User pain: Inbox/Capture still feels partly like a task app instead of the assistant intake and approval queue.

Owned surfaces/files:
- `app-vNext/src/features/easylist/routes/EasyListInboxPage.tsx`
- `app-vNext/src/features/hq/routes/HQPage.tsx`
- `docs/codex/NIGHTLY_REPORT.md`
- `docs/codex/MAGIC_SCORECARD.md`

What to remove/simplify:
- Remove or rewrite one task-app phrase or standalone EasyList framing.
- Reframe capture around inbox, approve, plan, remember, and follow up using existing data only.

Acceptance command:
- `npm.cmd run build from app-vNext`

Proof artifact:
- `NIGHTLY_REPORT.md` and `MAGIC_SCORECARD.md` record changed files, removed wording, build result, and Today/Capture routes inspected.

Stop conditions:
- Stop if the change requires Gmail/API/AI calls, sync, persistence changes, model provider access, backend behavior, or files outside the target list.

## Stage 4: Planning Engine

User pain: Plan should help decide what can realistically fit today, but calendar still reads too much like a separate schedule module.

Owned surfaces/files:
- `app-vNext/src/features/easycalendar/routes/EasyCalendarDayPage.tsx`
- `app-vNext/src/features/hq/routes/HQPage.tsx`
- `docs/codex/NIGHTLY_REPORT.md`
- `docs/codex/MAGIC_SCORECARD.md`

What to remove/simplify:
- Remove or rewrite one calendar-app phrase, standalone panel, or schedule label that separates Plan from the assistant.
- Add or refine one static planning affordance for light day, normal day, push day, or recovery day.

Acceptance command:
- `npm.cmd run build from app-vNext`

Proof artifact:
- `NIGHTLY_REPORT.md` and `MAGIC_SCORECARD.md` record changed files, removed/simplified element, build result, and Plan/Today routes inspected.

Stop conditions:
- Stop if the change needs stored plan modes, date logic changes, scheduling algorithms, backend behavior, or files outside the target list.

## Stage 5: Notes And Memory

User pain: Notes should feed memory and action context, but it can still feel like another separate notes app.

Owned surfaces/files:
- `app-vNext/src/features/easynotes/routes/EasyNotesPage.tsx`
- `app-vNext/src/features/hq/routes/HQPage.tsx`
- `docs/codex/NIGHTLY_REPORT.md`
- `docs/codex/MAGIC_SCORECARD.md`

What to remove/simplify:
- Remove or rewrite one notes-app phrase, module label, or standalone library framing.
- Add or refine one static notes-to-memory bridge around remember, turn into task, turn into plan, pin context, or review stale note.

Acceptance command:
- `npm.cmd run build from app-vNext`

Proof artifact:
- `NIGHTLY_REPORT.md` and `MAGIC_SCORECARD.md` record changed files, removed wording, build result, and Notes/Today routes inspected.

Stop conditions:
- Stop if the change needs new note behavior, search indexing, model access, sync, persistence changes, backend behavior, or files outside the target list.

## Proof Before Visual Polish

After Stages 1-5, run a proof packet across Today/HQ, Inbox/Capture, Plan, Notes, and More/Settings.

The proof packet must say either `READY_FOR_VISUAL_PASS` or `NOT_READY_FOR_VISUAL_PASS` and name the top three blockers. Only after that should Stage 9 visual polish begin.
