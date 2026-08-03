# EasyLife P1 External Audit Gate

Date created: 2026-05-31

Status: ready to send after P1 reliability queue completion.

Zip to send: `C:\Users\codex-agent\Downloads\EasyLife_Codex_Audit_Research_Packet_20260530.zip`

Latest build proof: `npm.cmd run build` from `app-vNext` passed on 2026-05-31 after P1-09.

Use this after the P1 reliability queue is complete.

## P1 Completion Summary

- P1-01 route dead-end cleanup: `/app/plan`, `/app/workout`, People, and Today return paths now avoid blank/dead-end states.
- P1-02 Plan input reliability: Plan quick-create, event edit, and task-block edit normalize time and duration behavior.
- P1-03 Workout input reliability: Workout duration/reps/weight inputs avoid fragile spinner fields and keep delete actions separated.
- P1-04 mobile layout and sticky actions: mobile forms/actions are more reachable, and repeated full-screen loaders were replaced by inline status.
- P1-05 People clarity: People explains manual labels, avoids maps/geocoding/location claims, and surfaces upcoming follow-ups.
- P1-06 Settings trust cleanup: Settings uses local-browser reminder language, Privacy/Terms placeholders, one sign-out control, and default-off helper copy.
- P1-07 canonical visible labels: app-facing labels now prefer Today, Inbox, Notes, Plan, People, Workout, Settings, Projects, Follow-ups, and Progress.
- P1-08 capture durability: direct Inbox drafts persist/restore locally, and Notes guards rapid blank-note creation.
- P1-09 keyboard ergonomics: Quick Capture, app menu, drawers, and Plan quick-create have improved focus containment, Escape close, and focus return.

## Gate Rule

- `PASS_TO_P2`: P1 reliability is complete enough to queue supervised P2 capability gates.
- `PASS_WITH_NON_BLOCKING_NOTES`: P2 planning may begin, but non-blocking notes should be queued into P2/P3 as appropriate.
- `BLOCK_P2`: Do not begin P2. Convert only reliability blockers into a focused repair queue, rebuild, and re-audit.

## Audit Prompt

```text
You are auditing EasyLife after its P1 reliability and high-value polish sprint.

Context:
- EasyLife is a signed-in personal web app for one user.
- P0 fixed demo-blocking route safety, naming consistency, capture trust, Settings/trust copy, and basic keyboard access.
- P1 is now complete and focused on reliability and polish: Plan route/input behavior, Workout route/input behavior, mobile/sticky actions, People/context clarity, Settings trust cleanup, visible-label consistency, capture draft durability, and keyboard ergonomics.
- Latest local proof: npm.cmd run build from app-vNext passed after P1-09.

Scope:
- Review only P1 demo reliability, route behavior, mobile usability, input reliability, capture durability, Settings trust copy, canonical visible labels, People/context clarity, and keyboard ergonomics.
- Do not suggest Firebase/auth/rules/functions/billing/DNS/secrets/env/package/dependency/deploy work.
- Do not assume live AI, true push notifications, calendar sync, geocoding, email/text sending, account deletion backend, or hidden writes.

Core path to test:
Login -> Today -> Start a note -> verify write/save -> Add task to Inbox -> verify confirmation and draft safety -> View Inbox -> return to Today -> open Plan -> add/edit a block if available -> open People -> verify labels are understandable -> open Workout -> verify direct route and input behavior -> Settings Trust & Privacy.

Routes to test:
/app/hq
/app/today
/app/inbox
/app/easylist/add
/app/notes
/app/easynotes
/app/plan
/app/easycalendar/day
/app/people
/app/easycontacts
/app/workout
/app/easyworkout/dashboard
/app/easyworkout/log
/app/settings
/app/not-a-real-route

Audit questions:
1. Do Plan, Workout, People, and invalid direct routes avoid blank/dead-end states?
2. Can Plan time/block controls be used without confusing jumps, invalid times, or unclear save/edit states?
3. Can Workout inputs be edited reliably on phone and desktop without fighting spinners/default zeros?
4. Are mobile primary actions, back/menu controls, and long-form actions reachable without awkward scrolling or clipping?
5. Are People labels clear without implying live location, maps, geocoding, or automatic context?
6. Does Settings avoid overclaiming live AI, true push, calendar sync, geocoding/live location, email/text sending, account deletion, or hidden actions?
7. Are visible labels canonical enough for a demo: Today, Inbox, Notes, Plan, People, Workout, Settings, Projects, Follow-ups?
8. Are unsaved Inbox tasks and new notes protected from accidental loss or duplicate blank creation?
9. Can keyboard users activate primary controls with Enter/Space, see focus, close drawers, and return focus sensibly?
10. Is EasyLife ready to move from P1 reliability into P2 supervised capability gates, or are there remaining reliability blockers?

Return format:
- Verdict: PASS_TO_P2, PASS_WITH_NON_BLOCKING_NOTES, or BLOCK_P2.
- Reliability blockers: numbered list with route/screen, reproduction steps, expected behavior, actual behavior, and severity.
- Non-blocking notes: short bullets.
- P2/P3 candidates: only include items that do not require forbidden systems unless explicitly marked as supervised capability-gate candidates.
```

## Codex Processing Prompt After Audit

```text
You are processing the EasyLife P1 external audit result.

Repo:
C:\Dev\easylifehq.github.io

Read:
- docs/codex/EASYLIFE_P1_EXTERNAL_AUDIT_GATE.md
- docs/codex/NEXT_5_TASKS.md
- docs/codex/PHASE_STATE.md

Rules:
- Do not start P2 unless the external verdict is PASS_TO_P2 or PASS_WITH_NON_BLOCKING_NOTES.
- If BLOCK_P2, convert only reliability blockers into narrow P1 repair tasks.
- Do not touch Firebase/auth/rules/functions/billing/DNS/secrets/env/package/dependency/deploy/generated output.
- Do not assume live AI, true push notifications, calendar sync, geocoding, email/text sending, account deletion backend, or hidden writes.
- Build from app-vNext with npm.cmd run build.
- Do not deploy.

Tell me:
- verdict
- blockers, if any
- whether P2 planning is allowed
- exact next task
```
