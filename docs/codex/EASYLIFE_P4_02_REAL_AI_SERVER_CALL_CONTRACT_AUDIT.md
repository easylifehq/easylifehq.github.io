# EasyLife P4-02 Real AI Server-Call Contract Audit

Date: 2026-05-31

Status: P4_02_COMPLETE_READY_FOR_DISABLED_BY_DEFAULT_PROOF

## Verdict

The narrow Inbox AI/provider lane is small enough to continue into P4-03, but P4-03 should be a contract-tightening proof, not a deploy or live provider test.

The minimum server lane is the existing `assistantIntakeSuggestion` function in `functions/index.js`. It already has a separate route/prompt/body validator, auth check, disabled-by-default provider gate, operator confirmation phrase, synthetic/demo capture requirement, local fallback, provider output quarantine, metadata-only logs, and a trusted response envelope that says nothing was saved or sent.

No frontend provider key path was found in the audited app source. The browser-side path uses `VITE_ASSISTANT_INTAKE_SUGGESTION_URL` only as an HTTPS endpoint URL and sends a Firebase ID token plus the visible typed capture. Provider secrets remain a server-only concern and must not move into app code, docs, env files, screenshots, logs, fixtures, or commits.

## Audited Source

- `functions/index.js`
- `app-vNext/src/features/easylist/routes/EasyListInboxPage.tsx`
- `app-vNext/src/features/assistant/serverGateway/liveAiEnvironment.ts`
- `app-vNext/src/features/assistant/serverGateway/providerRequestSanitizer.ts`
- `app-vNext/src/features/assistant/serverGateway/firstLiveProviderCallHarness.ts`
- `app-vNext/src/features/assistant/serverGateway/liveProviderSecretBoundary.ts`

## Minimum Source Files For P4-03

P4-03 should prefer these files only:

- `functions/index.js` for the disabled-by-default function contract and provider executor boundary.
- `app-vNext/src/features/assistant/serverGateway/firstLiveProviderCallHarness.ts` only if the client response envelope needs to trust the approved provider-output shape.
- `app-vNext/src/features/easylist/routes/EasyListInboxPage.tsx` only if the visible Inbox gate needs to show/send the disabled/synthetic request flags consistently.
- `docs/codex/*` proof files for the implementation record.

Files that should stay untouched in P4-03:

- Firebase rules, auth policy, billing, DNS, secrets, env files, package/dependency files, deploy config, and generated output.
- Old broad AI endpoints such as task brain-dump analysis or project planning.
- Any push notification, calendar, geocoding/maps, email/text, contact sync, account deletion, hidden write, token storage, automatic scheduling, or external-action code.

## Current Contract Strengths

- Function boundary: `assistantIntakeSuggestion` is separate from broader historical AI endpoints.
- Method and auth: the function accepts `POST`, handles `OPTIONS`, and verifies the Firebase bearer token before request handling.
- Route/prompt lock: accepted route is `/app/easylist/add?demo=1`; accepted prompt is `intake-suggestion`.
- Body lock: allowed body keys are `route`, `promptId`, `typedCapture`, `metadata`, `liveCallRequested`, and `operatorConfirmation`.
- Broad-context rejection: nested keys matching secrets, auth, sessions, provider keys, notes, contacts, calendar, address/location, email, phone, Firestore, billing, payment, medical, and similar private context are rejected.
- Capture safety: provider-key-shaped text, `VITE_` secret names, exact addresses, and coordinates are rejected before provider execution.
- Provider gate: the executor is blocked unless `liveCallRequested` is true, the kill switch is inactive, the server gate is enabled, operator confirmation matches the exact phrase, and the capture is synthetic/demo confirmed.
- Fallback behavior: every blocked/rejected path returns a local-disabled fallback with `providerState: "not-called"`, `providerCallAttempted: false`, and `nothingSavedOrSent: true`.
- Output trust: provider output must pass shape, intent, confidence, destination, source, confirmation, hidden-write, external-action, and real-memory checks before display.
- Logging posture: function logs record metadata such as route, prompt, length, state, and rejection reason; raw typed capture and provider secret values are not logged in the audited path.

## P4-03 Reconciliation Items

1. The browser client request currently sends route, prompt, typed capture, and metadata only. It does not send `liveCallRequested` or `operatorConfirmation`, so the real provider executor stays blocked. That is safe today; P4-03 should either keep this deliberately disabled or add an explicit disabled/test-only UI contract without enabling live calls.
2. The server synthetic check expects metadata `reviewMode: "synthetic-demo"` and `source: "operator-test"`, while the current browser metadata uses `reviewMode: "demo"` or `private-alpha` and `source: "inbox-assistant-lane"`. P4-03 should reconcile this contract for the later one synthetic deploy/test prompt, without approving real private payloads by default.
3. The client response normalizer currently trusts only `providerState: "not-called"` and `providerCallAttempted: false`. A successful `provider-output` envelope would normalize to fallback unless the client contract is updated. P4-03 should add/confirm a trusted provider-output envelope shape before any real provider test.
4. The docs and frontend use older labels like "first live call" and "live-provider dry-run" in some proof surfaces. P4-03 should keep visible copy clear: this is one separately approved synthetic provider test lane, not general live AI.

## P4-03 Implementation Checklist

Before editing code:

1. Confirm the next task is still P4-03 and the AI lane remains before push.
2. Keep the implementation disabled by default.
3. Do not edit env/secrets/deploy/package/dependency/Firebase rules/auth files.
4. Do not deploy or make a provider call.
5. Do not broaden beyond Inbox typed capture at `/app/easylist/add?demo=1` and prompt `intake-suggestion`.

If code changes are needed:

1. Tighten only the `assistantIntakeSuggestion` contract and/or client envelope contract.
2. Preserve all fallback responses with `nothingSavedOrSent: true`, `hiddenWrites: false`, and `externalActions: false`.
3. Preserve the local fallback path when the endpoint is missing, auth is missing, gate is disabled, kill switch is active, operator confirmation is missing, capture is not synthetic/demo, provider fails, or output is quarantined.
4. Keep provider input to the visible typed capture plus route/prompt metadata only.
5. Keep logs metadata-only; never log raw provider secrets or raw private payloads.
6. Accept provider-output in the client only if the envelope still proves no hidden writes, no sends, no calendar changes, no notifications, no real memory, and approval required.
7. Keep user save behavior on existing explicit local save paths only.
8. Run `npm.cmd run build` from `app-vNext` if app code changes.

## Boundary Proof

- No code changed in this audit.
- No Firebase rules, auth policy, billing, DNS, secrets, env files, package/dependency files, deploy config, or generated output were touched.
- No deploy was run.
- No provider call was made.
- No frontend provider key path was added or found in the audited lane.
- No push notification, calendar sync, geocoding/maps, email/text sending, contact sync, account deletion backend, hidden write, token storage, automatic scheduling, or external action was added.
