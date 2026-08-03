# EasyLife P4-06 AI Lane Audit Checkpoint

Date: 2026-05-31

Status: P4_06_AI_LANE_CHECKPOINT_COMPLETE_TRUE_PUSH_AUDIT_UNLOCKED

## Verdict

The narrow Inbox AI/provider lane is checkpointed and remains boxed.

EasyLife is ready to keep the P4-05 prompt available for a separately approved, human-run, one-call synthetic `assistantIntakeSuggestion` provider test. No provider call was made in this checkpoint, and no deploy was run.

P4 may now proceed to the true push lane only as disabled audit/contract work. This does not approve token storage, service-worker push handling, Firebase Messaging setup, server push sends, automatic reminder jobs, deploy work, package/dependency changes, or user-content push payloads.

## AI Lane Scope Verified

- Surface: Inbox typed capture only.
- Function: `assistantIntakeSuggestion`.
- Route: `/app/easylist/add?demo=1`.
- Prompt id: `intake-suggestion`.
- First test input class: synthetic/demo typed capture only.
- Output: review-only preview or fallback/quarantine.
- Save behavior: no auto-save and no hidden write.
- External behavior: no email, text, calendar, push, sync, geocoding, contact action, real memory, automatic scheduling, or external action.

## Source Proof

### Client Request Boundary

Verified source:

- `app-vNext/src/features/easylist/routes/EasyListInboxPage.tsx`
- `app-vNext/src/features/assistant/serverGateway/firstLiveProviderCallHarness.ts`

Findings:

- The current Inbox UI requires `Request gated suggestion` before the disabled gateway request runs.
- The current browser request sends `liveCallRequested: false`.
- The current browser request omits `operatorConfirmation` by default.
- The current browser request sends an endpoint URL only, not a provider key.
- Provider-output is trusted only when the server envelope proves server-called, accepted/quarantined, preview-only, approval-required, `nothingSavedOrSent: true`, and no-action flags.

### Server Gate Boundary

Verified source:

- `functions/index.js`

Findings:

- `assistantIntakeSuggestion` remains separate from older AI endpoints.
- Request body keys are limited to route, prompt id, typed capture, metadata, `liveCallRequested`, and `operatorConfirmation`.
- Provider execution remains blocked unless:
  - `liveCallRequested: true`
  - `ASSISTANT_INTAKE_PROVIDER_ENABLED=true`
  - `ASSISTANT_INTAKE_PROVIDER_KILL_SWITCH` is not `true`
  - `operatorConfirmation: "I_APPROVE_ONE_SYNTHETIC_ASSISTANT_INTAKE_PROVIDER_TEST"`
  - `metadata.source: "operator-test"`
  - `metadata.reviewMode: "synthetic-demo"`
  - typed capture begins with `[synthetic]` or `[demo]`
- Provider output is quarantined/rejected for hidden-write claims, external-action claims, real-memory claims, unsupported intent, malformed output, missing destination/source, missing approval requirement, parse failures, or provider errors.

### Secret And Frontend Key Boundary

Findings:

- `functions/index.js` references `OPENAI_API_KEY` through Firebase Functions secret binding.
- The audited frontend path uses `VITE_ASSISTANT_INTAKE_SUGGESTION_URL` as an endpoint URL only.
- `VITE_AI_PROVIDER_API_KEY` occurrences in the app source are negative tests or docs proving browser-exposed provider keys are forbidden.
- No provider key was stored or exposed by P4-06.

## Build And Syntax Proof

- App build command: `npm.cmd run build`
- App build directory: `app-vNext`
- App build result: passed
- Functions syntax command: `npm.cmd --prefix functions run lint`
- Functions syntax result: passed (`node --check index.js`)

## Checkpoint Decision

`AI_LANE_READY_FOR_SEPARATELY_APPROVED_ONE_SYNTHETIC_PROVIDER_TEST`

This means:

- The P4-05 one-call prompt remains the approved test packet.
- The test still requires separate explicit Spencer approval.
- The test must still deploy only `functions:assistantIntakeSuggestion`.
- The test must still use synthetic/demo input only.
- The test must still close the provider gate immediately after one provider-call attempt.
- The test must still write a result proof before any second call.

This does not mean:

- live AI is generally available
- the browser may store or use provider keys
- real private payloads are approved by default
- old AI endpoints may expand
- broad chat, hidden reads, hidden writes, external actions, calendar sync, email/text, true push, contact sync, geocoding, real memory, or automatic scheduling may start

## True Push Unlock

`TRUE_PUSH_DISABLED_AUDIT_LANE_UNLOCKED`

P4-07 may now begin, but only as a disabled capability and permission audit. P4-07 must not send push, store tokens, add Firebase Messaging, add service-worker push handling, add package/dependency changes, deploy, create reminder jobs, or send user-content payloads.

## Boundary Proof

- No deploy was run.
- No provider call was made.
- No app code was changed.
- No server/function code was changed.
- No Firebase rules, auth policy, billing, DNS, secrets, env files, package/dependency files, deploy config, or tracked generated output were touched.
- No provider key or push credential was stored.
- No provider key was exposed in frontend code.
- No true push notification was sent.
- No calendar sync, geocoding/maps, email/text sending, account deletion backend, contact sync, hidden write, token storage, automatic scheduling, or external action was added.

## Next Task

Proceed to P4-07: true push capability and permission audit. Keep true push disabled and do not store tokens.
