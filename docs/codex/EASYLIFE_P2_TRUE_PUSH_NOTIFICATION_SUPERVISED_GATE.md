# EasyLife P2 True Push Notification Supervised Gate

Date prepared: 2026-05-31

Repo: `C:\Dev\easylifehq.github.io`

## Gate Status

`TRUE_PUSH_NOT_LIVE`

P2-02 is a supervised capability gate and copy/proof task only. EasyLife still uses local browser reminders through the browser `Notification` API while the app is open or installed. This task does not add Firebase Cloud Messaging, token storage, service worker push handling, server-send functions, automatic reminder jobs, deploy changes, package changes, Firebase config changes, or generated output.

## Current State

- `app-vNext/src/lib/mobile/notifications.ts` uses browser `Notification` plus local scheduling helpers.
- `app-vNext/src/lib/mobile/NotificationScheduler.tsx` schedules local reminders while the signed-in app is loaded and browser permission is granted.
- Settings says current reminders are local browser reminders, not server-delivered push.
- Settings now also says true push is not live, no push tokens are stored, no server push is sent, and no automatic reminder jobs are scheduled.

## Future Client Token Contract

A later separately approved true-push implementation must:

- request explicit user permission before token registration
- show device/platform reality, including Home Screen app requirements where relevant
- register only one user-owned device token at a time for the first test lane
- store no raw task, note, calendar, workout, People, AI, or private reminder text with token records
- allow the user to disable/remove the device token before any broader reminder behavior
- keep token registration disabled by default until the approved test lane is opened

## Future User-Owned Token Storage Contract

Future token records may contain only:

- user-owned token record id
- device label
- browser/platform hint
- enabled/disabled state
- created and updated timestamps
- last synthetic test status

Future token records must not contain:

- raw FCM token in ordinary logs
- task titles or notes
- calendar event titles or notes
- workout details
- contact names or place labels
- AI prompt/input/output text
- auth/session payloads
- secrets

## Disabled Server Test-Send Scaffold Plan

A future server-send scaffold must remain disabled until separately approved and must:

- send exactly one manually triggered synthetic message
- require signed-in user ownership of the token record
- require a server kill switch to be open
- cap tests to 3 per user per day and 1 per 60 seconds
- use metadata-only logging
- avoid frontend server secrets
- avoid automatic reminders, scheduling jobs, AI-generated reminders, email/text, calendar sync, and external actions

First allowed synthetic message:

- Title: `EasyLife push test`
- Body: `Push is connected. Nothing else was scheduled.`
- Target: `/app/today` or the canonical Today route

## Kill Switch And Rollback

Before any live test:

- server kill switch defaults off
- client UI must show push unavailable/disabled when the kill switch is closed
- token registration must be removable by the user
- failed sends must fall back to local/browser reminder copy without retry storms
- rollback must be possible by disabling the server send path and removing token records

## Explicit Non-Goals

This task does not:

- send live push
- store push tokens
- add Firebase Messaging
- add or edit Firebase Functions
- add notification service worker handling
- deploy anything
- add package dependencies
- schedule automatic reminders
- send task, note, Plan, Workout, People, or AI content through push
- add hidden writes or external actions

## Acceptance Checks

- Settings states browser reminders are local and true push is not live.
- Settings states no push tokens are stored and no server push is sent.
- Proof packet defines client token contract, token storage contract, disabled server-test-send scaffold, kill switch, and copy boundaries.
- Source proof finds no `getToken`, `firebase/messaging`, `messaging`, `sendEachForMulticast`, `sendToDevice`, or token-registration implementation in the touched app source.
- Build passes with `npm.cmd run build` from `app-vNext`.
