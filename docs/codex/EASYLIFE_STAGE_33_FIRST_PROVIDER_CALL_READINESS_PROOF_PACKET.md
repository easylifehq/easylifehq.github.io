# EasyLife Stage 33 First Provider Call Readiness Proof Packet

Reviewed at: 2026-05-17

## Mission

Decide whether EasyLife is ready to deploy `assistantIntakeSuggestion` and run exactly one synthetic provider-backed Inbox suggestion test.

## Verdict

READY_FOR_ONE_SYNTHETIC_PROVIDER_TEST_DEPLOY

This verdict does not deploy anything and does not make a live provider call. It means the code and guardrails are ready for a separately executed, operator-controlled, one-call synthetic test.

## Build Proof

- App build: Passed with `npm.cmd run build` from `app-vNext`.
- Functions check: Passed with `npm.cmd --prefix functions run lint`.

## Provider Executor

Pass.

- `functions/index.js` defines `runAssistantIntakeProviderExecutor`.
- The executor is reachable only from `assistantIntakeSuggestion`.
- The executor uses the existing Firebase Functions secret binding `OPENAI_API_KEY` server-side only.
- The executor uses route `/app/easylist/add?demo=1`.
- The executor uses prompt `intake-suggestion`.
- The executor sends only route, prompt ID, and typed capture to the provider.
- No provider call occurs during build, lint, import, or normal disabled/fallback requests.

## Disabled-By-Default Gate

Pass.

Provider execution requires all of the following:

- `ASSISTANT_INTAKE_PROVIDER_ENABLED=true`
- `ASSISTANT_INTAKE_PROVIDER_KILL_SWITCH` is not `true`
- request body has `liveCallRequested: true`
- request body has exact `operatorConfirmation: "I_APPROVE_ONE_SYNTHETIC_ASSISTANT_INTAKE_PROVIDER_TEST"`
- request body has `route: "/app/easylist/add?demo=1"`
- request body has `promptId: "intake-suggestion"`
- request body metadata has `source: "operator-test"`
- request body metadata has `reviewMode: "synthetic-demo"`
- `typedCapture` begins with `[synthetic]` or `[demo]`

If any gate fails, the function returns fallback and does not call the provider.

## Output Quarantine

Pass.

Provider-style output is quarantined before it can return to the frontend unless it has:

- known intent: `task`, `note`, `plan`, `reminder`, `follow-up`, or `unsure`
- known confidence label
- draft/preview/needs-review state
- known destination label
- typed-capture source
- explicit approval requirement

Quarantine returns fallback for hidden-write claims, external-action claims, real-memory claims, missing source, missing destination, unsupported intent, missing approval requirement, malformed output, provider errors, and parse failures.

## No Automatic Provider Calls

Pass.

No automatic call path was found. The deployed function would still require explicit operator request body flags and server environment gates before provider execution.

## No Frontend Keys

Pass with note.

- The frontend has `VITE_ASSISTANT_INTAKE_SUGGESTION_URL`, which is a function endpoint URL, not a provider key.
- No frontend OpenAI/provider key value is required.
- `VITE_AI_PROVIDER_API_KEY` appearances are negative test fixtures or documentation references warning against browser-exposed provider secrets.

## Old AI Endpoint Expansion

Pass.

- `analyzeTaskBrainDump` remains an old task extraction helper.
- `planProjectWithAi` remains an old project planning helper.
- Stage 33 work did not route the new Inbox assistant lane through either old endpoint.
- Stage 33 work did not broaden either old endpoint.
- The one-call readiness verdict applies only to `assistantIntakeSuggestion`.

## Parked

Still parked:

- broad chat
- broad app context
- real private user data by default
- frontend provider keys
- committed secrets
- old endpoint expansion
- hidden reads
- hidden writes
- automatic saves
- email/text/call/message sending
- scheduling
- sync
- notifications
- calendar changes
- real memory
- geocoding
- device location
- external actions
- saved-object expansion
- production rollout

## Exact Manual Deploy/Test Steps

Do not run these steps inside this proof task.

1. Confirm the working tree is clean and the latest Stage 33 commits are present.
2. Confirm the Firebase project is `pipeline-2f422`:
   ```powershell
   npx.cmd firebase-tools@latest use
   ```
3. Confirm the secret exists without printing it. Use the Firebase Console secret view, or a metadata-only CLI command if available in your installed Firebase Tools version:
   ```powershell
   npx.cmd firebase-tools@latest functions:secrets:describe OPENAI_API_KEY --project pipeline-2f422
   ```
   Do not use `functions:secrets:access` during this check because it can print the secret value.
4. Add temporary server environment gates using the Firebase Functions environment method for this project. Do not commit env files.
   ```text
   ASSISTANT_INTAKE_PROVIDER_ENABLED=true
   ASSISTANT_INTAKE_PROVIDER_KILL_SWITCH=false
   ```
5. Deploy only the narrow function:
   ```powershell
   npx.cmd firebase-tools@latest deploy --only functions:assistantIntakeSuggestion --project pipeline-2f422
   ```
6. Obtain a Firebase ID token for a signed-in EasyLife test account. Do not save or commit the token.
7. Send exactly one POST request to `assistantIntakeSuggestion` with this shape:
   ```json
   {
     "route": "/app/easylist/add?demo=1",
     "promptId": "intake-suggestion",
     "typedCapture": "[synthetic] Remind me to draft the apartment packing checklist this weekend and ask Jordan about borrowing boxes.",
     "metadata": {
       "source": "operator-test",
       "reviewMode": "synthetic-demo",
       "clientVersion": "stage-33-manual-test"
     },
     "liveCallRequested": true,
     "operatorConfirmation": "I_APPROVE_ONE_SYNTHETIC_ASSISTANT_INTAKE_PROVIDER_TEST"
   }
   ```
8. Verify the response is either:
   - a preview-only provider suggestion with `nothingSavedOrSent: true`, or
   - fallback/quarantine with no provider output rendered as saved/actioned.
9. Immediately close the lane:
   ```text
   ASSISTANT_INTAKE_PROVIDER_ENABLED=false
   ```
   Or set:
   ```text
   ASSISTANT_INTAKE_PROVIDER_KILL_SWITCH=true
   ```
10. Check logs for metadata only. There should be no raw typed capture, raw provider response, auth token, or secret value.
11. Record the result in the next proof packet before any second provider call.

## Stop Conditions

Stop immediately if:

- a frontend provider key is required
- a raw API key appears in terminal output, logs, docs, commits, or screenshots
- a request requires real private text
- output claims anything was saved, sent, scheduled, synced, remembered, geocoded, or externally acted on
- `analyzeTaskBrainDump` or `planProjectWithAi` must be redeployed to run the test
- the response bypasses quarantine/fallback
- logs include raw typed capture or provider raw response

## Final Verdict

READY_FOR_ONE_SYNTHETIC_PROVIDER_TEST_DEPLOY
