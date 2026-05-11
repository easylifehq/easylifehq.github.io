# EasyLife Stage 12 Explicit Save-Draft Handoff Plan

## Stage Verdict

Stage 12 may begin because Stage 11 Safe Local Memory ended with `READY_FOR_STAGE_12`.

## Mission

Give the user an explicit, reviewable handoff from an unsaved local draft into an existing EasyLife flow. The assistant may show what the handoff would look like, but the user must deliberately choose it and nothing may be saved automatically.

## User Pain

Stage 11 made draft previews visible, but the next step is still fuzzy. A user can see a task, memory, plan, reminder, or follow-up draft, but they cannot yet see the exact handoff that would be reviewed before anything real happens.

## Approval-First Rules

- The user must explicitly choose a handoff.
- Handoff previews must remain local and review-only.
- No automatic saving.
- No hidden writes.
- No real AI/model calls unless explicitly approved later.
- No email sending, notifications, calendar sync, backend changes, Firebase rules/config, dependencies, package files, deploy config, generated output, or secrets.
- Every implementation task must pass `npm.cmd run build from app-vNext`.

## Handoff Targets

### Existing Task Row Draft

- Surface: Inbox/Capture.
- Goal: show how the selected unsaved task draft would map into visible task-row fields.
- Boundary: do not call `addTask`, change task data shape, or mutate EasyList state.
- Proof: `/app/easylist/add?demo=1` shows one explicit task handoff preview and no-save wording.

### Note/Memory Draft

- Surface: Notes/Memory.
- Goal: show how a memory draft would map into note title/body/context review fields.
- Boundary: do not call `addNote`, write memory, index search, or mutate EasyNotes state.
- Proof: `/app/easynotes?demo=1` shows one explicit note handoff preview and no-real-memory wording.

### Plan/Day Draft

- Surface: Plan day.
- Goal: show how a plan draft would be reviewed against day capacity, duration, and mode.
- Boundary: do not create events, mutate task blocks, change date logic, or add scheduling algorithms.
- Proof: `/app/easycalendar/day?demo=1` shows one local plan handoff preview and no-schedule wording.

### Reminder Draft

- Surface: Inbox/Capture.
- Goal: show reminder handoff as a review draft only.
- Boundary: do not create notifications, calendar events, background reminders, or sync.
- Proof: reminder copy explicitly says no notification or schedule was created.

### Follow-Up Draft

- Surface: Inbox/Capture.
- Goal: show follow-up handoff as a review draft only.
- Boundary: do not send email, text, message, or create external communication.
- Proof: follow-up copy explicitly says no message was sent or queued.

## Stage 12 Task Order

1. Task-row handoff preview in Inbox.
2. Note/memory handoff preview in Notes.
3. Plan/day handoff preview in Plan.
4. Reminder/follow-up handoff preview in Inbox.
5. Stage 12 proof packet.

## Stop Conditions

Stop if a task requires persistence, automatic saving, real AI/model calls, notification APIs, email sending, calendar sync, backend changes, Firebase rules/config, dependencies, package files, deploy config, generated output, secrets, or files outside the declared task scope.

## Stage 13 Gate

Stage 13 may only begin if the Stage 12 proof packet returns `READY_FOR_STAGE_13`. Stage 13 would be the first phase allowed to propose a real user-approved save path, starting with the narrowest and safest target.
