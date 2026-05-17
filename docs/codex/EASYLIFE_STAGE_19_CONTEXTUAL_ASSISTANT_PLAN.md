# EasyLife Stage 19 Contextual Assistant Plan

## Mission

Make EasyLife feel more like a real assistant by using existing local app context more intelligently, without model calls, hidden writes, backend work, or fake memory.

Stage 19 should not chase more features. It should make the current assistant loop feel smarter because it reads the shape of what is already visible: tasks, capture input, day capacity, saved notes/context, and people/place labels.

## Guardrails

- No model calls.
- No hidden writes.
- No saved plans, reminders, or follow-ups.
- No email/text/call/message sending.
- No notifications.
- No calendar sync.
- No maps, geocoding, exact addresses, or device location.
- No backend/auth/Firebase config changes.
- No dependencies, package files, deploy config, generated output, secrets, or real personal data.
- No fake memory claims.

## Stage 19 Tasks

1. Today context synthesis.
2. Inbox source clarity.
3. Plan capacity/readiness.
4. Notes/context recall hints.
5. Contacts/People + Places tie-in.

Each task owns one product surface and must remove or shorten one visible clutter source if it adds context copy.

## Acceptance

- `docs/codex/NEXT_5_TASKS.md` contains exactly five bounded Task Contract V2 tasks.
- Every implementation task includes `npm.cmd run build from app-vNext`.
- The Stage 19 packet keeps EasyLife in the approval-first lane.
- Stage 19 does not approve external actions, model calls, real memory, calendar sync, notifications, map work, or hidden writes.

## Done Signal

Stage 19 is ready to run when the five tasks are present, bounded, and build validation passes after this docs packet is created.
