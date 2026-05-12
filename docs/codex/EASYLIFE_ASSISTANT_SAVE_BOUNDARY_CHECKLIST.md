# EasyLife Assistant Save-Boundary Checklist

Use this checklist before any assistant-save task. It does not approve new saved object types, external actions, model calls, or real memory.

## Approved Save Lanes

- Task save path: allowed only through Inbox after final explicit confirmation. The receipt must say what task was saved and what was not created.
- Note/context save path: allowed only through Notes after final explicit confirmation. Do not call it real memory. The receipt must show the note/context title and group.
- Plans: preview-only unless a later approved stage creates a separate final-confirmed plan save path.
- Reminders: preview-only. Do not schedule notifications.
- Follow-ups: preview-only. Do not send email, text, calls, messages, or external communication.

## Hard Boundaries

- No hidden writes. Any real save must be visible, final-confirmed, and use an existing local EasyLife flow.
- No email, text, call, message, or follow-up sending.
- No notification scheduling.
- No calendar sync or external calendar writes.
- No model calls, AI service calls, generated automation, or background intelligence.
- No real memory claims. Use note/context language unless a future approved memory system exists.
- No backend, auth, Firebase rules/config, dependency, package, deploy config, generated output, or secret changes.

## Demo Review Mode

- Use local demo review routes with `?demo=1`.
- Demo review mode must not be treated as proof of external integrations, background work, or production auth changes.
- If a task changes save behavior, verify demo mode still makes the boundary visible and honest.

## Required Route Proof

- Today: `/app/hq?demo=1`
- Inbox: `/app/easylist/add?demo=1`
- Plan: `/app/easycalendar/day?demo=1`
- Notes: `/app/easynotes?demo=1`
- Settings/More: `/app/settings?demo=1`

## Pre-Commit Check

- `npm.cmd run build` from `app-vNext` must pass.
- `docs/codex/NIGHTLY_REPORT.md` must record changed files, route proof, and save-boundary impact.
- `docs/codex/MAGIC_SCORECARD.md` must record whether the task preserved task-only, note/context-only, and preview-only boundaries.
