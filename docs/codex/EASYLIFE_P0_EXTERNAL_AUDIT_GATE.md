# EasyLife P0 External Audit Gate

Date: 2026-05-31

Source packet: `C:\Users\codex-agent\Downloads\EasyLife_Codex_Audit_Research_Packet_20260530.zip`

Status: ready for external P0 audit. P0 implementation is complete; P1 must not begin until the audit returns no demo-blocking findings or the blocker list is turned into a fresh P0 repair queue.

Results ledger: record the returned verdict and findings in `docs/codex/EASYLIFE_P0_EXTERNAL_AUDIT_RESULTS.md`.

## What changed in P0

- Route safety: `/app/today`, `/app/inbox`, `/app/notes`, `/app/plan`, `/app/people`, and `/app/workout` have direct safe behavior, and invalid `/app/*` routes show a safe return path.
- Naming consistency: core demo copy uses Today, Inbox, Notes, Plan, People, Projects, Follow-ups, Workout, and Settings instead of presenting a bundle of Easy* apps.
- Today bridge: Today explains capture -> review -> plan and shows unplanned Inbox items as review-only.
- Inbox capture trust: direct Inbox capture starts with task text, hides optional details, disables empty submit, confirms save, and preserves unsaved local drafts.
- Notes capture trust: Notes opens write-first, title is optional, save state is visible, and duplicate blank notes are guarded.
- Settings trust copy: Settings explains browser reminders, no live AI assumption, no hidden sends, no calendar sync, no live location/geocoding, and account deletion boundaries.
- Keyboard access: menu, drawers, and Plan quick-create use native controls, dialog semantics, visible focus styles, Escape close behavior, and active-panel focus trapping.

## Build proof

Latest required check: `npm.cmd run build` from `app-vNext` passed on 2026-05-31.

## External audit prompt

Use this exact prompt with the external reviewer:

```text
You are auditing EasyLife after its P0 demo-blocker and trust-repair sprint.

Scope:
- Review only P0 demo readiness, route safety, naming consistency, capture trust, Settings/trust copy, and basic keyboard accessibility.
- Do not suggest Firebase/auth/rules/functions/billing/DNS/secrets/env/package/dependency/deploy work.
- Do not assume live AI, true push notifications, calendar sync, geocoding, email/text sending, or hidden writes.
- Treat EasyLife as a signed-in personal web app for one user.

Core path to test:
Login -> Today -> Start a note -> return to Notes list -> Add task to Inbox -> see confirmation -> View Inbox -> return to Today -> Settings Trust & Privacy.

Routes to test:
/app/hq
/app/today
/app/inbox
/app/easylist/add
/app/notes
/app/easynotes
/app/plan
/app/people
/app/workout
/app/settings
/app/not-a-real-route

Audit questions:
1. Does any route blank, redirect to a wrong-feeling surface, or trap the user?
2. Does the product read like one EasyLife assistant rather than a visible suite of mini-apps?
3. Can a user quickly write a note and understand whether it saved?
4. Can a user quickly add an Inbox task, see confirmation, and find it again?
5. Does Today make the capture -> review -> plan loop understandable without implying auto-scheduling?
6. Does Settings avoid overclaiming live AI, true push, external calendar sync, geocoding/live location, email/text sending, account deletion, or hidden actions?
7. Can a keyboard user Tab to the menu, open/close drawers, see focus, and activate primary buttons with standard behavior?
8. Is there any demo-blocking confusion severe enough to stop P1 from starting?

Return format:
- Verdict: PASS_TO_P1, PASS_WITH_NON_BLOCKING_NOTES, or BLOCK_P1.
- Demo blockers: numbered list with route/screen, reproduction steps, expected behavior, actual behavior, and severity.
- Non-blocking notes: short bullets.
- P1 candidates: only include reliability/polish items that do not require forbidden systems.
```

## Internal audit notes

- Source checks found the P0 proof strings for route aliases, Settings trust copy, no-live-AI copy, Inbox save confirmation, Notes save state, Today Inbox review bridge, and keyboard focus/dialog behavior.
- This is not a live external signoff. The next action is to run the prompt above with an external reviewer and record the returned findings in `docs/codex/EASYLIFE_P0_EXTERNAL_AUDIT_RESULTS.md` before starting P1.

## Gate rule

- `PASS_TO_P1` or `PASS_WITH_NON_BLOCKING_NOTES`: begin P1 with Plan block/time input reliability.
- `BLOCK_P1`: convert only the demo-blocking findings into a new P0 repair queue, then rebuild and re-audit.
