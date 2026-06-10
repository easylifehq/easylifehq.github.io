# EasyLife P4-09 True Push Disabled Server Test-Send Scaffold Proof

Date: 2026-05-31

Status: P4_09_TRUE_PUSH_DISABLED_SERVER_TEST_SEND_SCAFFOLD_PROOF_COMPLETE

## Verdict

EasyLife has a proof-level disabled server test-send scaffold contract for the future one synthetic true-push lane.

No server push function was added in P4-09. This task intentionally keeps the server send path as a documented contract until Spencer separately approves the exact deploy/test gate. No deploy was run, no push was sent, no token was stored, no service-worker push handler was added, and no Firebase Messaging package or API was added.

## Current Server Baseline

Verified source:

- `functions/index.js`

Current exported HTTPS functions include AI/Gmail/project lanes, but no true-push send lane. Source sweep found no approved implementation for:

- `admin.messaging`
- `sendToDevice`
- `sendEachForMulticast`
- `webpush`
- token registration
- push subscription handling
- automatic reminder jobs

This is the desired P4-09 baseline: the future true-push server lane is specified, but not live.

## Future Disabled Function Contract

A later separately approved task may add a disabled function with a narrow name such as:

- `sendSyntheticPushTest`

The function must default to unavailable and may only proceed when all gates are true:

- Firebase Auth token verifies the signed-in user.
- Request method is `POST`.
- Request body declares `intent: "synthetic-push-test"`.
- Request body includes `livePushRequested: true`.
- Request body includes the exact operator confirmation string approved in the future P4-10 prompt.
- Server kill switch is explicitly open.
- The target device/token record belongs to the signed-in user.
- The token/device record is enabled.
- Rate limits pass: maximum 3 tests per user per day and 1 test per 60 seconds.
- The payload exactly matches the synthetic payload below.

If any gate fails, the function must return a disabled/rejected response and send no push.

## Only Allowed Synthetic Payload

The first allowed true-push payload remains:

- Title: `EasyLife push test`
- Body: `Push is connected. Nothing else was scheduled.`
- Target route: Today

The server must reject any payload containing or derived from:

- task titles
- note text
- Plan event titles or notes
- Workout details
- People names, place labels, emails, or phone numbers
- AI prompt, input, output, or suggestion text
- calendar sync data
- email/text/message content
- auth/session payloads
- secrets or provider keys

## Metadata-Only Logging Contract

Future send logs may contain only:

- user id
- token record id or opaque server-side token reference
- device label or platform hint
- request timestamp
- synthetic test status
- rejection reason
- function version
- kill-switch state

Future send logs must not contain:

- raw push token in ordinary logs
- push credentials
- private notification text beyond the fixed synthetic payload id
- task/note/Plan/Workout/People/AI/user-entered content
- auth/session payloads
- provider keys or push credentials

## Disabled Response Shape

Until the exact deploy/test prompt is approved, a future disabled server scaffold should return a response shaped like:

```json
{
  "status": "disabled",
  "sent": false,
  "reason": "push-test-gate-closed",
  "payloadKind": "synthetic-only",
  "noUserContent": true,
  "noAutomaticReminderJob": true
}
```

This response shape preserves the review-first contract without implying a send occurred.

## Kill Switch And Rollback

The future server lane must have a server-side kill switch that defaults closed. Rollback must be possible by:

- closing the kill switch
- disabling the test-send function
- disabling or deleting the user-owned token record
- leaving local browser reminders available
- recording metadata-only failure/rejection proof

There must be no retry storm, background scheduler, or automatic reminder job in the first true-push lane.

## Source Sweep Proof

P4-09 checked `functions/index.js` for push/server-send indicators. No true-push implementation was added or found in the active server file for:

- Firebase Messaging send APIs
- Web Push send APIs
- push token registration
- token storage writes
- push subscription handling
- synthetic push send handler
- automatic reminder jobs

Existing auth token handling for unrelated functions remains unrelated to push token storage.

## Boundary Proof

- No app code was changed.
- No server/function code was changed.
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

Not run. P4-09 was a docs-only disabled server contract/proof task with no app code changes.

## Next Task

Proceed to P4-10: one synthetic push test readiness proof. Produce the exact human-run deploy/test prompt for one synthetic push only. Do not deploy or send a push inside P4-10.
