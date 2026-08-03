# EasyLife P4-10 One Synthetic Push Test Readiness Proof

Date: 2026-05-31

Status: P4_10_READY_FOR_SEPARATELY_APPROVED_ONE_SYNTHETIC_PUSH_IMPLEMENTATION_DEPLOY_TEST

## Verdict

EasyLife is ready for a separately approved, human-run, one synthetic true-push implementation/deploy/test gate.

EasyLife is not ready to send true push from the current repo without that separate approval because the current source intentionally has no Firebase Messaging client registration, no user-owned token storage, no service-worker push handler, and no server push send function. That is the correct P4-10 safety posture.

P4-10 did not deploy, did not send a push, did not request or store a token, did not add service-worker push handling, did not add Firebase Messaging, did not edit server/function code, did not edit package/dependency files, and did not touch secrets or env files.

## Approved Future Test Lane

The only future push lane approved by this readiness packet is:

- Test count: exactly one synthetic push attempt
- Target: Spencer-owned signed-in test account and one explicitly registered test device
- Payload title: `EasyLife push test`
- Payload body: `Push is connected. Nothing else was scheduled.`
- Target route: Today
- Content class: fixed synthetic payload only
- Logging: metadata-only
- Scheduling: none
- Retry behavior: none unless manually re-approved after result proof
- Rollback: close kill switch, disable send path, remove/disable test token record

This packet does not approve user-content push payloads, reminder jobs, private task/note/Plan/Workout/People/AI content, automatic scheduling, broad notifications, or production rollout.

## Current Source Evidence

Verified source:

- `functions/index.js`
- `app-vNext/public/sw.js`
- `app-vNext/src`
- `docs/codex/EASYLIFE_P4_08_TRUE_PUSH_CLIENT_CONTRACT_UI.md`
- `docs/codex/EASYLIFE_P4_09_TRUE_PUSH_DISABLED_SERVER_TEST_SEND_SCAFFOLD_PROOF.md`

Current proof:

- Settings shows true push as disabled and not live.
- Settings has disabled `Register push device` and `Send synthetic push` controls.
- `/sw.js` remains cache/fetch only.
- `functions/index.js` has no true-push send function.
- No Firebase Messaging token registration was found.
- No token storage path was found.
- No push subscription handling was found.
- No automatic reminder job was found.

## Pre-Test Approval Checklist

Do not proceed with the future prompt unless every item is true:

- Spencer explicitly approves the exact prompt below in a separate turn.
- Spencer accepts that the future task may need narrow app code, service-worker code, server/function code, and deploy steps limited to the one synthetic test lane.
- Spencer explicitly approves any exact package/dependency change if the existing installed Firebase dependencies are insufficient.
- No Firebase rules, auth policy, billing, DNS, unrelated secrets, unrelated env files, unrelated deploy config, or unrelated functions are touched.
- No push credential, VAPID key, FCM token, auth token, or secret value is printed, pasted into docs, committed, screenshotted, or sent in chat.
- The test device belongs to the signed-in user.
- The first payload is exactly the fixed synthetic payload.
- The send lane is closed immediately after exactly one attempt.
- A result proof is written before any second attempt.

## Human-Run Implementation/Deploy/Test Prompt

Use this prompt only if Spencer explicitly approves the one synthetic push implementation/deploy/test gate. Do not run it inside ordinary P4 coding tasks.

```text
You are running the EasyLife P4 one synthetic true-push implementation/deploy/test gate.

Repo:
C:\Dev\easylifehq.github.io

Mission:
Implement only the minimum disabled-by-default true-push lane needed to register one Spencer-owned test device and send exactly one synthetic push. Deploy/test exactly one synthetic push attempt, immediately close the lane, and record proof.

Source of truth:
- docs/codex/NEXT_5_TASKS.md
- docs/codex/PHASE_STATE.md
- docs/codex/EASYLIFE_P4_08_TRUE_PUSH_CLIENT_CONTRACT_UI.md
- docs/codex/EASYLIFE_P4_09_TRUE_PUSH_DISABLED_SERVER_TEST_SEND_SCAFFOLD_PROOF.md
- docs/codex/EASYLIFE_P4_10_ONE_SYNTHETIC_PUSH_TEST_READINESS_PROOF.md

Hard rules:
- Run exactly one synthetic push attempt, then stop.
- Use only this payload:
  - title: EasyLife push test
  - body: Push is connected. Nothing else was scheduled.
  - target route: Today
- Do not send task, note, Plan, Workout, People, AI, email/text, calendar, location, or private reminder content.
- Do not add automatic reminder jobs.
- Do not add broad notification scheduling.
- Do not print, paste, store in docs, commit, screenshot, or chat any push credential, VAPID key, FCM token, Firebase ID token, provider key, secret value, or raw token.
- Do not touch Firebase rules, auth policy, billing, DNS, unrelated env/secrets, unrelated deploy config, unrelated functions, or unrelated generated output.
- Do not implement calendar sync, geocoding/maps, email/text sending, account deletion backend, contact sync, hidden writes, automatic scheduling, or external actions.
- Keep all new push controls disabled by default unless the explicit test gate is open.
- Close the push gate immediately after the one test attempt.

Steps:
1. Read the source-of-truth docs above.
2. Run git status --short --branch and identify only the files needed for the one synthetic push lane.
3. Verify whether existing dependencies already support Firebase Messaging/Web Push. If a package/dependency change is required, stop and ask Spencer for exact approval before editing package/dependency files.
4. Implement the smallest disabled-by-default client registration lane:
   - permission requested only by visible user action
   - one user-owned test device only
   - no token printed in console or docs
   - token storage contains no task/note/Plan/Workout/People/AI/private content
   - user can disable/remove the test device
5. Implement the smallest service-worker push handler needed for the fixed synthetic payload only:
   - no user-content payload rendering
   - no broad reminder handling
   - notification click opens Today
6. Implement the smallest disabled-by-default server send lane, using the P4-09 contract:
   - function name may be sendSyntheticPushTest
   - requires verified Firebase Auth
   - requires user-owned enabled token record
   - requires intent: synthetic-push-test
   - requires livePushRequested: true
   - requires exact operator confirmation: I_APPROVE_ONE_SYNTHETIC_EASYLIFE_PUSH_TEST
   - requires server kill switch open
   - rate limit: maximum 3 tests per user per day and 1 per 60 seconds
   - metadata-only logging
   - fixed synthetic payload only
7. Run the relevant build and syntax checks:
   - npm.cmd run build from app-vNext
   - functions syntax/lint check if function code changed
8. Deploy only the exact approved push test function and any required app/service-worker build/deploy steps approved by Spencer. Do not deploy unrelated functions or rules.
9. Register exactly one Spencer-owned test device through the visible client action. Do not print or record the raw token.
10. Send exactly one synthetic push attempt through the approved server lane.
11. Accept only one of these outcomes:
    - one push received with title EasyLife push test and body Push is connected. Nothing else was scheduled.
    - disabled/rejected/fallback result with no push sent
12. Immediately close the server kill switch and disable the test send lane.
13. Remove or disable the test token record unless Spencer explicitly asks to keep it for one more inspected test.
14. Update docs/codex with a result proof before any second attempt. Include verdict, exact files changed, build result, deploy scope, one-attempt proof, token redaction proof, payload proof, metadata-only logging proof, gate-closed proof, and rollback proof.

Stop immediately if:
- the test requires real private content
- the payload contains anything beyond the fixed synthetic title/body/Today target
- a raw token, credential, secret, Firebase ID token, or provider key appears in output, logs, docs, screenshots, commits, or chat
- more than one push attempt would be needed
- an automatic reminder job is required
- package/dependency edits are needed without Spencer's exact approval
- Firebase rules/auth policy/billing/DNS/unrelated secrets/unrelated env files must be changed
- unrelated functions or old AI endpoints must be deployed
- logs include raw private text, raw token, auth token, or secret value
- the send path cannot be closed immediately after the attempt
```

## Required Result Proof After The Future Test

The future result proof must record:

- whether exactly one push attempt happened
- whether the response was sent, disabled, rejected, or failed
- whether the received notification exactly matched the fixed synthetic payload
- whether any user-content payload was absent
- whether the raw token and credentials stayed out of logs/docs/screenshots/chat/commits
- whether the token record was removed or disabled after the test
- whether the server kill switch was closed immediately
- whether logs stayed metadata-only
- whether any stop condition occurred
- whether P4 should end, repair, or prepare a later broader notification lane

## Boundary Proof

- No deploy was run in P4-10.
- No push notification was sent in P4-10.
- No token was requested in P4-10.
- No token was stored in P4-10.
- No app code was changed in P4-10.
- No service-worker push handler was added in P4-10.
- No server/function code was changed in P4-10.
- No Firebase Messaging implementation was added in P4-10.
- No package/dependency files were changed in P4-10.
- No Firebase rules, auth policy, billing, DNS, secrets, env files, deploy config, or tracked generated output were touched.
- No provider key or push credential was stored.
- No calendar sync, geocoding/maps, email/text sending, account deletion backend, contact sync, hidden write, automatic scheduling, or external action was added.

## Build

Not run. P4-10 was a docs-only readiness packet with no app code changes.

## Next Task

Proceed to P4-11: final P4 capability handoff and audit prompt.
