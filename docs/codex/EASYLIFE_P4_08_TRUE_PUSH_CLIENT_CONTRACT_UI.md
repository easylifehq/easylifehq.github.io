# EasyLife P4-08 True Push Client Contract And Consent UI

Date: 2026-05-31

Status: P4_08_TRUE_PUSH_CLIENT_CONTRACT_UI_COMPLETE

## Verdict

EasyLife now shows a clearer disabled true-push client contract in Settings without enabling true push.

P4-08 changed only the Settings notification surface and proof docs. It did not add Firebase Messaging, request or store a push token, add service-worker push handling, send push, deploy, create automatic reminder jobs, expose push credentials, or change package/dependency files.

## User-Facing Contract Added

Settings > Browser reminders now states:

- true push is still not live
- EasyLife is not storing push tokens
- EasyLife is not sending server push
- EasyLife is not scheduling automatic reminder jobs
- device registration is disabled
- no push token is requested or stored
- no Firebase Messaging call happens from the Settings screen
- token storage needs separate approval plus a remove-this-device path
- permission remains user-initiated
- true push registration remains locked until a later exact deploy/test approval

The first future synthetic push remains limited to:

- Title: `EasyLife push test`
- Body: `Push is connected. Nothing else was scheduled.`
- No task, note, Plan, Workout, People, AI, or private reminder content

## Graceful States

The Settings notification area now distinguishes:

- `default`: permission still needs a user action
- `granted`: local browser reminder permission is ready
- `denied`: browser reminders are blocked and the user must change browser/site settings
- `unsupported`: EasyLife still works normally, but local web reminders are unavailable on that device/browser

True push readiness is displayed separately from local browser reminder permission so the app does not imply server push is available just because local reminders are allowed.

## Disabled Controls

Two visible disabled controls were added:

- `Register push device`
- `Send synthetic push`

Both remain disabled and explain that they require later P4 approvals. They do not call any handler, request any token, write any device record, or send any push.

## Source Proof

Changed source:

- `app-vNext/src/features/settings/routes/SettingsPage.tsx`

Verified unchanged boundaries:

- local browser reminder permission still uses the existing user-action `Allow browser reminders` button
- local test reminder still requires granted browser permission and enabled local reminder settings
- true push has no enabled action path
- no token registration helper was added
- no service-worker push listener was added
- no server push function was added
- no Firebase Messaging import was added

## Boundary Proof

- No deploy was run.
- No push notification was sent.
- No token was requested.
- No token was stored.
- No Firebase Messaging implementation was added.
- No service-worker push handler was added.
- No server push function was added.
- No automatic reminder job was added.
- No Firebase rules, auth policy, billing, DNS, secrets, env files, package/dependency files, deploy config, or tracked generated output were touched.
- No provider key or push credential was stored.
- No calendar sync, geocoding/maps, email/text sending, account deletion backend, contact sync, hidden write, automatic scheduling, or external action was added.

## Build

`npm.cmd run build` from `app-vNext` passed.

## Next Task

Proceed to P4-09: true push disabled server-test-send scaffold proof. Keep it disabled, proof-first, synthetic-only, metadata-only, and no deploy.
