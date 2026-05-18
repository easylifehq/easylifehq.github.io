# EasyLife Stage 33 First Provider Call Operator Switch

## Verdict

The first `assistantIntakeSuggestion` provider test must stay disabled unless a human operator deliberately opens every gate for exactly one synthetic/demo Inbox capture.

## Disabled-By-Default Gates

- Server env gate: `ASSISTANT_INTAKE_PROVIDER_ENABLED` must equal `true`.
- Kill switch: `ASSISTANT_INTAKE_PROVIDER_KILL_SWITCH` must not equal `true`.
- Request flag: request body must include `liveCallRequested: true`.
- Operator confirmation: request body must include `operatorConfirmation: "I_APPROVE_ONE_SYNTHETIC_ASSISTANT_INTAKE_PROVIDER_TEST"`.
- Route: request body must include `route: "/app/easylist/add?demo=1"`.
- Prompt: request body must include `promptId: "intake-suggestion"`.
- Synthetic source: request body metadata must include `reviewMode: "synthetic-demo"` and `source: "operator-test"`.
- Synthetic text marker: `typedCapture` must start with `[synthetic]` or `[demo]`.

If any gate is missing, the function returns local fallback and does not call the provider.

## Allowed Test Input

Use only fictional synthetic/demo typed capture. Do not use raw private notes, real names, real addresses, real contact data, real calendar text, secret names, API keys, auth/session data, or private life details.

Example safe typed capture:

```text
[synthetic] Remind me to draft the apartment packing checklist this weekend and ask Jordan about borrowing boxes.
```

## Kill Switch Behavior

Set `ASSISTANT_INTAKE_PROVIDER_KILL_SWITCH=true` to block provider execution even if every other request flag is present. The function should return fallback with no provider call and preserve the "nothing saved or sent" boundary.

## Fallback Behavior

Fallback must occur when:

- live call is not requested
- server gate is disabled
- kill switch is active
- operator confirmation is missing
- typed capture is not marked synthetic/demo
- route or prompt is unsupported
- request contains forbidden context
- provider output fails validation or quarantine

Fallback means no save, send, schedule, sync, notification, calendar change, real memory, geocoding, device location, hidden write, or external action.

## Exact Manual Test Steps

Do not run this test until a separate task explicitly approves deployment and a single live provider call.

1. Confirm the function code is deployed only after review.
2. Confirm `OPENAI_API_KEY` exists as a Firebase Functions secret and is not printed.
3. Set `ASSISTANT_INTAKE_PROVIDER_ENABLED=true` in the server environment.
4. Ensure `ASSISTANT_INTAKE_PROVIDER_KILL_SWITCH` is unset or not `true`.
5. Sign in to EasyLife and obtain a Firebase auth token through the app flow.
6. Send one POST request to `assistantIntakeSuggestion` with:
   - `route: "/app/easylist/add?demo=1"`
   - `promptId: "intake-suggestion"`
   - `typedCapture` beginning with `[synthetic]` or `[demo]`
   - `metadata.source: "operator-test"`
   - `metadata.reviewMode: "synthetic-demo"`
   - `liveCallRequested: true`
   - `operatorConfirmation: "I_APPROVE_ONE_SYNTHETIC_ASSISTANT_INTAKE_PROVIDER_TEST"`
7. Verify response is either a quarantined fallback or a preview-only provider suggestion with `nothingSavedOrSent: true`.
8. Immediately set `ASSISTANT_INTAKE_PROVIDER_KILL_SWITCH=true` or turn `ASSISTANT_INTAKE_PROVIDER_ENABLED` back off.
9. Confirm no raw typed capture, raw provider response, or secret value appears in logs.
10. Record the result in the Stage 33 proof packet before any second call.

## Still Parked

General chat, real memory, email/text sending, calendar sync, notifications, geocoding, device location, broad app context, hidden writes, saved-object expansion, and real private-data testing remain out of scope.
