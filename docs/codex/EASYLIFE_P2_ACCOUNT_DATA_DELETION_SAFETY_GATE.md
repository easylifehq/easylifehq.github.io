# EasyLife P2 Account And Data Deletion Safety Gate

Date prepared: 2026-05-31

Repo: `C:\Dev\easylifehq.github.io`

## Gate Status

`DELETION_BACKEND_NOT_APPROVED`

P2-01 is a safety gate and UI proof only. EasyLife does not currently offer self-serve account deletion, does not run a backend deletion action from Settings, and does not change Firebase auth, rules, functions, billing, DNS, secrets, env, package, dependency, deploy, or generated output in this task.

## Current Safe User Path

1. Open Settings.
2. Open Trust & Privacy or Data.
3. Download the full JSON export.
4. Copy the data summary if useful.
5. Review the Account section, which states deletion is not self-serve yet.

The available action is export and review. There is no delete button, no hidden archive, no silent purge, no account deletion backend, and no auth deletion call.

## UI Proof

- Trust & Privacy says Data export is export-first and that EasyLife has no self-serve delete button or backend deletion action in the demo.
- Data export and health adds an Account deletion status action and states that the screen only exports and summarizes data.
- Account says `Not self-serve yet`, links back to export tools, and says no delete button or backend deletion action runs there.
- Account also shows a blocked deletion gate with the required future backend approval conditions.

## Required Future Approval Before Real Deletion

A real deletion implementation must be separately approved and must include:

- identity re-check before deletion
- export-first confirmation
- exact collection and auth scope
- rollback or recovery policy
- audit log policy that avoids raw private payloads
- proof that auth and stored user records are handled together
- disabled-by-default or staged rollout posture
- external audit before broad use

## Explicit Non-Goals

This task does not:

- delete accounts
- delete auth users
- delete Firestore records
- add Firebase rules or functions
- add callable functions or backend endpoints
- add package dependencies
- deploy anything
- hide, archive, or silently mutate user data
- create a self-serve deletion flow

## Acceptance Checks

- Settings has visible export-first account deletion copy.
- Settings has no self-serve delete account button.
- The only account action remains sign out plus export navigation.
- Source proof found no new auth deletion call.
- Build passes with `npm.cmd run build` from `app-vNext`.
