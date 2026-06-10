# EasyLife P4-05 One Synthetic Provider Test Readiness Proof

Date: 2026-05-31

Status: P4_05_READY_FOR_SEPARATELY_APPROVED_ONE_SYNTHETIC_PROVIDER_TEST

## Verdict

EasyLife is ready for a separately approved, human-run, one-call synthetic provider test of the narrow Inbox typed-capture lane.

This task did not deploy, did not edit env or secrets, did not call a provider, did not make live AI generally available, and did not change app or server code. It packages the exact one-test boundary so Spencer can later approve or decline the deploy/test step deliberately.

## Approved Test Lane

- Function: `assistantIntakeSuggestion`
- Route: `/app/easylist/add?demo=1`
- Prompt id: `intake-suggestion`
- Input class: synthetic/demo typed capture only
- Output: review-only Inbox suggestion preview or fallback/quarantine
- Save behavior: no automatic save and no hidden write
- External behavior: no email, text, calendar change, push, sync, geocoding, contact action, real memory, or external action
- Test count: exactly one provider-call attempt, then close the gate and record the result

## Current Source Evidence

- `functions/index.js` keeps `assistantIntakeSuggestion` separate from older AI endpoints.
- The server request validator allows only route, prompt id, typed capture, metadata, `liveCallRequested`, and `operatorConfirmation`.
- Provider execution remains blocked unless every gate is open:
  - `liveCallRequested: true`
  - `ASSISTANT_INTAKE_PROVIDER_ENABLED=true`
  - `ASSISTANT_INTAKE_PROVIDER_KILL_SWITCH` is not `true`
  - `operatorConfirmation: "I_APPROVE_ONE_SYNTHETIC_ASSISTANT_INTAKE_PROVIDER_TEST"`
  - `metadata.source: "operator-test"`
  - `metadata.reviewMode: "synthetic-demo"`
  - typed capture begins with `[synthetic]` or `[demo]`
- The current Inbox UI still sends `liveCallRequested: false` and omits operator confirmation by default.
- The current Inbox UI requires `Request gated suggestion` before the disabled gateway request runs.
- The current client trusts provider output only when it is server-called, accepted/quarantined, preview-only, approval-required, and explicitly no-action.

## Pre-Test Checklist

Do not proceed unless all items are true:

- Spencer separately approves the exact deploy/test prompt below.
- The tester understands this is one synthetic provider call only.
- No real private typed capture will be used.
- No provider key, ID token, secret value, or credential will be pasted into docs, screenshots, git commits, or chat.
- The Firebase project target is confirmed before deploy.
- Only `functions:assistantIntakeSuggestion` is deployed.
- The provider gate is closed immediately after the one test attempt.
- The result is written into a follow-up proof packet before any second provider call.

## Human-Run Deploy/Test Prompt

Use this prompt only if Spencer explicitly approves the one-call test. Do not run it inside normal P4 coding tasks.

```text
You are running the EasyLife P4 one synthetic provider test.

Repo:
C:\Dev\easylifehq.github.io

Mission:
Deploy and test exactly one synthetic provider-backed Inbox suggestion through assistantIntakeSuggestion, then immediately close the gate and record the result.

Hard rules:
- Run exactly one provider-call attempt, then stop.
- Use only synthetic/demo typed capture.
- Do not use Spencer's real private data.
- Do not print, paste, store, commit, screenshot, or log provider keys, Firebase ID tokens, or secret values.
- Do not deploy any function except functions:assistantIntakeSuggestion.
- Do not touch Firebase rules, auth policy, billing, DNS, package/dependency files, generated output, or unrelated functions.
- Do not broaden AI behavior, old endpoints, chat, calendar sync, email/text sending, push, geocoding, contact sync, hidden reads, hidden writes, real memory, automatic scheduling, or external actions.
- Close the provider gate immediately after the one test attempt.

Steps:
1. Read docs/codex/EASYLIFE_P4_05_SYNTHETIC_PROVIDER_TEST_READINESS_PROOF.md.
2. Run git status --short --branch and confirm there are no unexpected deploy-risk changes.
3. Confirm the Firebase project is pipeline-2f422 without printing secrets:
   npx.cmd firebase-tools@latest use
4. Confirm OPENAI_API_KEY exists as a Firebase Functions secret without accessing its value:
   npx.cmd firebase-tools@latest functions:secrets:describe OPENAI_API_KEY --project pipeline-2f422
5. Temporarily open only the assistant intake provider gate through the approved server environment mechanism for this project:
   ASSISTANT_INTAKE_PROVIDER_ENABLED=true
   ASSISTANT_INTAKE_PROVIDER_KILL_SWITCH=false
   Do not commit env files.
6. Deploy only the narrow function:
   npx.cmd firebase-tools@latest deploy --only functions:assistantIntakeSuggestion --project pipeline-2f422
7. Obtain a Firebase ID token for a signed-in EasyLife test account. Do not save or print it.
8. Send exactly one POST request to assistantIntakeSuggestion with this JSON body:
   {
     "route": "/app/easylist/add?demo=1",
     "promptId": "intake-suggestion",
     "typedCapture": "[synthetic] Remind me to draft the apartment packing checklist this weekend and ask Jordan about borrowing boxes.",
     "metadata": {
       "source": "operator-test",
       "reviewMode": "synthetic-demo",
       "clientVersion": "p4-05-one-synthetic-provider-test"
     },
     "liveCallRequested": true,
     "operatorConfirmation": "I_APPROVE_ONE_SYNTHETIC_ASSISTANT_INTAKE_PROVIDER_TEST"
   }
9. Accept only one of these outcomes:
   - provider-output preview with nothingSavedOrSent true, requiresApproval true, and no-action flags false for hiddenWrites, externalActions, savesCreated, messagesSent, calendarChanged, notificationsCreated, and realMemoryCreated
   - fallback/quarantine with no saved/actioned result
10. Immediately close the lane:
   ASSISTANT_INTAKE_PROVIDER_ENABLED=false
   or
   ASSISTANT_INTAKE_PROVIDER_KILL_SWITCH=true
11. Check logs for metadata-only posture. Do not print raw typed capture, raw provider output, ID token, or secret values into the proof.
12. Update docs/codex with a result proof before any second provider call. Include verdict, response class, no-action proof, gate-closed proof, and next recommendation.

Stop immediately if:
- a frontend provider key is required
- any secret or token appears in terminal output, logs, docs, screenshots, or commits
- the test requires real private input
- output claims anything was saved, sent, scheduled, synced, remembered, geocoded, pushed, or externally acted on
- another function or old AI endpoint must be deployed
- the response bypasses quarantine/fallback
- logs include raw private text, raw provider response, auth token, or secret value
```

## Required Result Proof After The Test

The follow-up result proof should record:

- Whether exactly one provider-call attempt happened.
- Whether the response was provider-output, fallback, or quarantine.
- Whether `nothingSavedOrSent` was true.
- Whether all no-action flags stayed false.
- Whether the provider gate was closed immediately after the test.
- Whether logs remained metadata-only.
- Whether any stop condition occurred.
- Whether P4-06 should mark the AI lane ready for checkpoint, blocked for repair, or not tested.

## Boundary Proof

- No deploy was run in P4-05.
- No provider call was made in P4-05.
- No app code was changed in P4-05.
- No server/function code was changed in P4-05.
- No Firebase rules, auth policy, billing, DNS, secrets, env files, package/dependency files, deploy config, or generated output were touched.
- No provider key or push credential was stored.
- No provider key was exposed in frontend code.
- No true push notification was sent.
- No calendar sync, geocoding/maps, email/text sending, account deletion backend, contact sync, hidden write, token storage, automatic scheduling, or external action was added.

## Next Task

Proceed to P4-06: AI lane audit/checkpoint packet. It should run source/build proof, decide whether the AI lane is ready for a separately approved one synthetic provider deploy/test or blocked, and only then unlock true push work.
