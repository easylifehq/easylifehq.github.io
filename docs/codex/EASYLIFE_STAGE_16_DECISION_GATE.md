# EasyLife Stage 16 Decision Gate

Stage 16 is not approved yet. Choose it only after human review notes exist.

## Current State

- Stage 15 verdict: `READY_FOR_HUMAN_REVIEW`
- Current phase: `human-review-ready`
- Active implementation queue: parked
- Required input before Stage 16: filled review notes in `docs/codex/EASYLIFE_HUMAN_REVIEW_NOTES.md` or an explicit bounded mission update

## Possible Stage 16 Directions

### Visual Trust Polish

Use when review says the product is useful but still feels visually weak, crowded, soft, or not technical enough.

Evidence required:
- Specific surfaces named by review notes.
- At least one clutter source to remove per task.
- Confirmation that no new assistant behavior is needed first.

### Task Save Real-User QA

Use when review trusts the task path in demo mode but wants proof with a real signed-in user.

Evidence required:
- A real-user QA plan that names the account/state to inspect.
- A rollback or no-op safety plan.
- Confirmation that existing task save behavior is unchanged unless a bug is found.

### Note/Context Real-User QA

Use when review trusts the note/context path in demo mode but wants proof with a real signed-in user.

Evidence required:
- A real-user QA plan for note/context save behavior.
- Confirmation that the copy still avoids real-memory claims.
- A clear pass/fail checklist for saved note title, context group, and receipt.

### Assistant Brain Expansion

Use only when review says the current task/note loop is trustworthy enough to support the next local assistant behavior.

Evidence required:
- Exact behavior to add.
- A no-hidden-write contract.
- Confirmation that any new behavior remains local, approval-first, and reversible.
- No model calls unless explicitly approved in a separate mission.

### Plan / Reminder / Follow-Up Preview Hardening

Use when review says plan, reminder, or follow-up previews are confusing but should still remain preview-only.

Evidence required:
- Which preview lane is confusing.
- Whether the fix is copy, layout, or local state.
- Confirmation that no scheduling, notification, message sending, or saved plan behavior is being added.

## Parked Unless Separately Approved

- external actions
- email/text/call/message sending
- notifications
- calendar sync
- model calls
- real memory
- hidden writes
- saved plans
- saved reminders
- saved follow-ups
- backend/auth/Firebase config/dependency/package/deploy/generated/secret changes

## Decision Rules

- If review says the product is useful but embarrassing visually, choose `visual trust polish`.
- If review says the save loop is trustworthy but unproven with real data, choose task or note/context real-user QA.
- If review says task/note save is clear and useful, choose assistant brain expansion only if the next behavior can be local and approval-first.
- If review says parked lanes are confusing, choose preview hardening before adding any new saved object type.
- If review is mixed or vague, do not create Stage 16 implementation tasks. Ask for sharper review notes.

## Stage 16 Task Creation Rules

When Stage 16 is chosen, create exactly five Task Contract V2 tasks in `NEXT_5_TASKS.md`.

Every task must include:
- user pain
- skill/workflow
- target files
- change
- first-screen rule if UI-facing
- remove/simplify requirement
- guardrails
- acceptance command
- proof artifact
- stop condition
- class/risk/mode/impact/surface/scope metadata

No Stage 16 task may approve external actions, model calls, real memory, calendar sync, notification scheduling, or hidden writes unless a separate human-approved mission explicitly changes the parked list.
