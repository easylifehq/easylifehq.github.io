# EasyLife P4-07 True Push Capability And Permission Audit

Date: 2026-05-31

Status: P4_07_TRUE_PUSH_AUDIT_COMPLETE_READY_FOR_DISABLED_CLIENT_CONTRACT

## Verdict

EasyLife is ready to continue into a disabled true-push client contract and consent UI task.

Current reminders are still local browser reminders. True push is not live. P4-07 did not send push, store push tokens, add Firebase Messaging, edit service-worker push handling, add server-send code, deploy, change package/dependency files, or create automatic reminder jobs.

## Current Reminder Posture

Verified source:

- `app-vNext/src/lib/mobile/notifications.ts`
- `app-vNext/src/lib/mobile/NotificationScheduler.tsx`
- `app-vNext/src/lib/mobile/notificationPreview.ts`
- `app-vNext/src/features/settings/routes/SettingsPage.tsx`
- `app-vNext/src/lib/firestore/settings.ts`

Findings:

- EasyLife currently uses the browser `Notification` API.
- Permission is requested only through the Settings action `Allow browser reminders`.
- A local test reminder uses `new Notification(...)` only after permission is granted.
- Scheduled reminders are created with in-browser `window.setTimeout` while the signed-in app is loaded.
- Reminder categories are local settings for task deadlines, Plan blocks, daily planning, workouts, and quiet hours.
- Fired local reminder IDs are stored in local browser storage under `easylife-fired-reminders-v1`.
- Settings copy already says these are local browser reminders and not server-delivered push.
- Settings copy already says EasyLife is not storing push tokens, sending server push, or scheduling automatic reminder jobs.

## Service Worker Posture

Verified source:

- `app-vNext/src/main.tsx`
- `app-vNext/public/sw.js`

Findings:

- The app registers `/sw.js` only in production when `serviceWorker` exists.
- The current service worker handles install, activate, and fetch caching.
- The current service worker does not handle `push`.
- The current service worker does not handle `notificationclick`.
- The current service worker does not call `showNotification`.
- The current service worker has no Firebase Messaging setup.

## True Push Source Sweep

Searched app source, app public assets, and `functions/index.js` for true-push/token/server-send indicators.

No implementation was found for:

- `firebase/messaging`
- `getMessaging`
- `getToken`
- `onMessage`
- Firebase Messaging `isSupported`
- `admin.messaging`
- `sendToDevice`
- `sendEachForMulticast`
- `webpush`
- `pushManager`
- `PushSubscription`
- VAPID key usage
- FCM token registration
- service-worker `push` listener
- service-worker `notificationclick` listener

## Token Contract Needs

P4-08 should prepare a disabled client contract for true push with these constraints:

- request permission only after a visible user action
- keep token registration disabled until a later exact approval
- store no token in P4-08 unless separately approved
- store no task, note, Plan, Workout, People, AI, or private reminder text with token metadata
- show unsupported, denied, default, and granted states clearly
- show that local browser reminders remain available when true push is unavailable
- require user-owned device language before any future token record exists
- require a reversible “remove this device” concept before real token storage is approved

## Future Token Record Shape

A later separately approved token-storage task may define records like:

- token record id
- user id / owner id
- device label
- browser/platform hint
- enabled/disabled state
- created and updated timestamps
- last synthetic test status
- token fingerprint or opaque server reference

Future token records must not contain:

- raw private notification payloads
- task titles
- note text
- Plan event titles
- Workout details
- People names/place labels
- AI prompt, input, or output text
- auth/session payloads
- secrets

## First Synthetic Push Boundary

The first true-push test remains future work and must still be separately approved. It should be:

- one manual synthetic test only
- no automatic reminder job
- no user-content payload
- no task/note/Plan/Workout/People/AI content
- no broad notification scheduler
- no deploy unless Spencer approves the exact prompt
- no push send until P4-10 or a later exact deploy/test gate

Allowed first synthetic content remains:

- Title: `EasyLife push test`
- Body: `Push is connected. Nothing else was scheduled.`
- Target: Today

## Risks And Decisions For P4-08

- Browser/iOS support is uneven, so UI must gracefully explain unsupported, denied, and Home Screen realities.
- Existing local browser reminders use potentially private task/event titles. True push must not reuse those payloads for the first synthetic lane.
- Current service worker is cache-only. Adding push handling must wait for the disabled contract/scaffold task and must stay off by default.
- Token storage is still not approved. P4-08 should focus on consent/copy/disabled contract, not persistence.
- Package/dependency changes are still locked. P4-08 must not add Firebase Messaging packages.

## Boundary Proof

- No deploy was run.
- No push notification was sent.
- No token was stored.
- No Firebase Messaging implementation was added.
- No service-worker push handler was added.
- No server push function was added.
- No automatic reminder job was added.
- No app code was changed.
- No server/function code was changed.
- No Firebase rules, auth policy, billing, DNS, secrets, env files, package/dependency files, deploy config, or tracked generated output were touched.
- No provider key or push credential was stored.
- No calendar sync, geocoding/maps, email/text sending, account deletion backend, contact sync, hidden write, token storage, automatic scheduling, or external action was added.

## Next Task

Proceed to P4-08: true push client contract and consent UI. Keep true push disabled, request permission only by user action, add no token storage, send no push, and preserve graceful unsupported/denied states.
