# EasyLife Stage 11 Safe Local Memory Plan

## Status

Stage 11 is approved to begin after the Stage 10 proof packet returned `READY_FOR_STAGE_11`.

Stage 11 is not real AI memory, not persistence, and not automation. It is the next local assistant-brain layer: approved suggestions can become visible unsaved draft objects so the user can review what would happen before anything actually changes.

## Mission

Turn approved assistant suggestions into safe local draft objects without hidden writes or backend changes.

The user should be able to see:

- what the assistant classified
- what the approved suggestion would become
- whether the draft is task, note/memory, plan, reminder, follow-up, or unsure
- what fields are editable before any save behavior exists
- that nothing has been saved, synced, sent, remembered, scheduled, or persisted

## User Pain

Stage 10 made the assistant's interpretation visible, but approval still ends as display state. That can feel fake because the user can approve a suggestion without seeing a concrete next object.

Stage 11 fixes that by showing an unsaved local draft preview. It must make approval feel meaningful while still protecting the no-hidden-write promise.

## Product Rule

Approval creates a local draft preview only.

It must not:

- create a task
- write a note
- schedule a calendar item
- send email
- sync external systems
- store memory
- call a model
- change backend/auth/Firebase config
- add dependencies
- touch package files
- deploy
- generate tracked output
- use secrets

## Draft Object Contract

Stage 11 draft objects should be local TypeScript values derived from the existing assistant intent suggestion.

Suggested fields:

- `id`: deterministic local draft id
- `sourceSuggestionId`: the originating suggestion id
- `sourceText`: original capture text
- `draftType`: task, note, plan, reminder, follow-up, or unsure
- `title`: editable preview title
- `body`: optional editable preview detail
- `status`: unsaved, editing, ready-to-save, dismissed
- `confidenceLabel`: copied from the suggestion
- `approvalState`: copied from the current local approval preview
- `fields`: visible editable/locked field list
- `warnings`: no-write/no-sync/no-memory warnings

The object may live in component state or be computed from local inputs. It must not be persisted.

## Stage 11 Workflow

1. Classify capture text locally.
2. Let the user preview approval state.
3. Build a local draft object when the suggestion is approved locally.
4. Render the unsaved draft preview.
5. Keep all save/persist/sync behavior out of Stage 11.
6. Prove the route still builds and the no-write copy is visible.

## Stage 11 Tasks

The active task queue is `docs/codex/NEXT_5_TASKS.md`.

The five tasks are:

1. Define local draft types and show one unsaved Inbox draft preview.
2. Add a compact local draft comparison row in Inbox.
3. Add a Today hint that points to safe unsaved draft review.
4. Add a Notes/Memory local draft affordance without real memory.
5. Run the Stage 11 proof packet and decide whether Stage 12 can introduce explicit save-draft handoff behavior.

## Acceptance Rules

Every implementation task must run:

`npm.cmd run build` from `app-vNext`

Every implementation task must record:

- changed files
- route inspected
- build result
- no-write guarantee
- what was simplified or made less misleading

## Stop Conditions

Stop immediately if a task requires:

- real model calls
- persisted draft storage
- task/note/calendar data mutation
- email sending
- calendar sync
- real memory behavior
- backend changes
- auth changes
- Firebase rules/config changes
- dependency/package changes
- deploy config
- generated output
- secrets

## Stage 12 Gate

Stage 12 may begin only after a Stage 11 proof packet says `READY_FOR_STAGE_12`.

Stage 12 should not be assumed to mean automatic saving. The likely next step is an explicit save-draft handoff where the user chooses a draft and intentionally sends it into the existing task/note/plan flow.
