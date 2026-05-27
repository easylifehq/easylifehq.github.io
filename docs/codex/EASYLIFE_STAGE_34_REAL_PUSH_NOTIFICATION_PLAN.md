# EasyLife Stage 34 Real Push Notification Plan

Date: 2026-05-27

## Verdict

`STAGE_34_REAL_PUSH_NOTIFICATION_GATE_READY`

EasyLife can start a real push-notification stage, but it should not jump straight from local browser timers to live push delivery. The current app has notification settings and local `Notification` timers. Stage 34 should add the server-backed push path carefully: permission, token registration, token storage, server send contract, kill switch, and one synthetic/manual test.

AI assistant work stays parked at `READY_FOR_ONE_SYNTHETIC_PROVIDER_TEST_DEPLOY`. This stage is about notifications only.

## Current State

- `app-vNext/src/lib/mobile/notifications.ts` uses the browser Notification API and local timers.
- `app-vNext/src/lib/mobile/NotificationScheduler.tsx` schedules reminders while the app is loaded and permission is granted.
- `app-vNext/src/features/settings/routes/SettingsPage.tsx` exposes permission and test-notification controls.
- `sw.js` exists for offline/install shell behavior, but it does not handle FCM background messages.
- `functions/index.js` already uses Firebase Functions and Admin SDK, so a future send function can use server-side Firebase Admin Messaging without a frontend secret.

## Product Goal

Make EasyLife capable of true push notifications that can reach the user when the app is not actively open, starting with one safe test lane.

The first real push behavior must be:

- manually triggered
- signed-in user only
- one device/token chosen by that user
- one synthetic test notification
- metadata-only logging
- disabled by default
- reversible with a kill switch

## Architecture Choice

Use Firebase Cloud Messaging for web push, with:

- client-side permission + token registration in the installed/web app
- Firestore token records owned by the signed-in user
- server-side Firebase Function for sending test push messages
- Firebase Admin SDK on the server only
- a `firebase-messaging-sw.js` or equivalent service worker path for background receipt
- no frontend provider/server secret

This matches the existing Firebase stack and avoids introducing a separate notification vendor.

## Important Mobile Reality

For iPhone testing, Web Push is available to Home Screen web apps on iOS/iPadOS 16.4 or later. Normal Safari tabs are not the same as installed Home Screen web apps for this use case. EasyLife should explain this in Settings before asking the user to debug missing pushes.

## What Stage 34 Must Not Do

- Do not send push notifications automatically.
- Do not create reminder push jobs yet.
- Do not send workout reminders yet.
- Do not add AI-generated reminders.
- Do not send email/text/calendar notifications.
- Do not store raw task, note, workout, calendar, or contact text in token metadata.
- Do not log FCM tokens, raw payloads, auth/session payloads, or personal data.
- Do not deploy without a separate explicit deploy/test prompt.
- Do not expose server secrets or private keys in frontend code.
- Do not expand old AI endpoints.

## First Allowed Test

Route: `/app/settings?section=notifications`

Behavior: register this device for push, then send exactly one synthetic test push:

Title: `EasyLife push test`

Body: `Push is connected. Nothing else was scheduled.`

Click target: `/app/hq`

No task, calendar, workout, note, contact, AI, or reminder payload should be used in the first test.

## Safety Controls

- Push disabled by default.
- Server kill switch required.
- Per-user test cap: 3 test pushes per day.
- Short-window throttle: 1 test push per 60 seconds.
- Token records store device label, browser hint, created/updated timestamps, enabled state, and last test status only.
- Token records must not store raw user content.
- Server logs only metadata: user id hash or uid, token record id, result class, error class, and timestamp.
- Delete/disable device token action must be available before broader reminders.

## Stage 34 Task Queue

Stage 34 is ready to break into exactly five bounded tasks in `docs/codex/NEXT_5_TASKS.md`.

## Sources Checked

- Firebase Cloud Messaging Web setup requires web push support, a service worker path, and `getToken` with a Web Push certificate/VAPID public key.
- Firebase server sending should run from a trusted server environment with Admin SDK messaging.
- Apple Web Push works for Safari/macOS and Home Screen web apps on iOS/iPadOS 16.4 or later.

## Exit Criteria

Stage 34 exits only when EasyLife has a proof packet ending with one of:

- `READY_FOR_STAGE_35_ONE_SYNTHETIC_PUSH_TEST_DEPLOY`
- `NOT_READY_FOR_PUSH_TEST`

Stage 35, if ready, must still require a separate explicit deploy/test prompt.
