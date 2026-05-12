# EasyLife Human Review Packet

Stage 15 verdict: `READY_FOR_HUMAN_REVIEW`.

Use this packet to review EasyLife as one AI personal assistant after the saved task/note loop was simplified and proven. Do not treat this as approval to start Stage 16 or add external actions.

## Start Review Server

From `C:\Dev\easylifehq.github.io\app-vNext`:

```powershell
npm.cmd run dev -- --host 127.0.0.1 --port 4231
```

Use dev mode for review because `?demo=1` is intentionally dev-only. Production preview can redirect protected routes to login.

## Review URLs

- Today: `http://127.0.0.1:4231/app/hq?demo=1`
- Inbox: `http://127.0.0.1:4231/app/easylist/add?demo=1`
- Plan: `http://127.0.0.1:4231/app/easycalendar/day?demo=1`
- Notes: `http://127.0.0.1:4231/app/easynotes?demo=1`
- Settings: `http://127.0.0.1:4231/app/settings?demo=1`

## Flows To Test

### Task Save Path

1. Open Inbox.
2. Choose `Task draft`.
3. Click `Preview draft`.
4. Click `Preview task-only save row`.
5. Click `Confirm and save task`.
6. Confirm the receipt says what was saved and that no note, plan, reminder, follow-up, email, calendar item, notification, sync, or memory was created.

Expected: the task path is explicit, understandable, and task-only.

### Note/Context Save Path

1. Open Notes.
2. Click `Preview note save path`.
3. Click `Confirm and save note`.
4. Confirm the receipt shows the note/context title and group.
5. Confirm the receipt says no task, plan, reminder, follow-up, email, notification, calendar item, sync, model call, or real memory was created.

Expected: the note path feels like safe context capture, not real AI memory.

### Preview-Only Boundaries

- Open Plan and verify plan handoff remains a preview. It must not schedule or save anything.
- In Inbox, review reminder and follow-up draft language. They must not schedule notifications, send messages, or save automatically.
- Verify Today mentions the safe lanes without showing saved task or note data.

Expected: plans, reminders, and follow-ups stay preview-only.

## Five Review Questions

1. Does Today feel like the assistant command surface you would actually start from?
2. Is the Inbox task save flow clear enough, or does it feel too ceremonial?
3. Does Notes feel useful as context without pretending to be real AI memory?
4. Are the safety boundaries reassuring, or are they cluttering the product?
5. What is the one thing that would make you trust EasyLife more before Stage 16?

## Must Stay Parked

- saved plans
- reminders
- follow-ups
- email/text/call/message sending
- notifications
- calendar sync
- model calls
- real memory
- backend/auth/Firebase config/dependency/package/deploy/generated/secret changes

## Review Outcome

After review, choose one:

- `KEEP_POLISHING_BEFORE_STAGE_16`
- `READY_TO_PLAN_STAGE_16`
- `NOT_READY_FIX_TRUST_OR_CLARITY`

Capture the reason before creating any new implementation tasks.
