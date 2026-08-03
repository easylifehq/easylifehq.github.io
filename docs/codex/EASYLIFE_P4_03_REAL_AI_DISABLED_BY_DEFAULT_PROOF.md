# EasyLife P4-03 Real AI Disabled-By-Default Proof

Date: 2026-05-31

Status: P4_03_COMPLETE_DISABLED_BY_DEFAULT_READY_FOR_REVIEW_UI

## Verdict

The Inbox AI/provider lane is tighter and remains disabled by default.

This task did not deploy, did not edit secrets or env files, did not make a provider call, and did not turn on live AI. It tightened the client-side request and response contract for the existing `assistantIntakeSuggestion` lane so P4 can continue toward a review-first Inbox UI without accidentally enabling provider execution.

## What Changed

- The browser request now explicitly sends `liveCallRequested: false` by default when it contacts the `assistantIntakeSuggestion` endpoint.
- The browser request still sends only the endpoint URL, Firebase auth token, allowed route, prompt ID, visible typed capture, metadata, and the disabled live-call flag.
- `operatorConfirmation` remains omitted unless a later exact synthetic deploy/test approval supplies it.
- The metadata type can now represent the later synthetic operator-test shape, but the current Inbox UI continues to use the non-operator lane.
- The client response envelope now accepts a future `provider-output` preview only when it still proves:
  - provider was called by the server executor, not the browser,
  - request and sanitizer were accepted,
  - validation and quarantine accepted or downgraded the output,
  - output is preview-only,
  - approval is required,
  - nothing was saved or sent,
  - hidden writes, external actions, sends, calendar changes, notifications, and real memory are all false.
- Inbox copy now says `Provider test remains disabled` instead of `First live call remains disabled`.
- Runtime proof fixtures now cover the trusted provider-output envelope and the explicit disabled request flag.

## Files Changed

- `app-vNext/src/features/assistant/serverGateway/firstLiveProviderCallHarness.ts`
- `app-vNext/src/features/assistant/serverGateway/firstLiveProviderCallHarness.test.ts`
- `app-vNext/src/features/easylist/routes/EasyListInboxPage.tsx`
- `docs/codex/EASYLIFE_P4_03_REAL_AI_DISABLED_BY_DEFAULT_PROOF.md`
- `docs/codex/NEXT_5_TASKS.md`
- `docs/codex/NIGHTLY_REPORT.md`
- `docs/codex/MAGIC_SCORECARD.md`

## Build Proof

- Command: `npm.cmd run build`
- Directory: `app-vNext`
- Result: passed
- Notes: TypeScript project build and Vite production build completed successfully.

## Acceptance Checks

- Confirmed P4-03 was the next incomplete P4 task.
- Read P4 state, P3.5 final handoff, and P4-02 server-call audit.
- Confirmed the AI lane still precedes true push work.
- Confirmed app source sends `liveCallRequested: false` from the Inbox provider gate.
- Confirmed app source does not send `operatorConfirmation` by default.
- Confirmed the frontend uses `VITE_ASSISTANT_INTAKE_SUGGESTION_URL` only as an endpoint URL, not a provider key.
- Confirmed trusted provider-output handling requires review-only/no-action flags.
- Confirmed no server/function code, Firebase rules/auth policy, billing, DNS, secrets, env files, package/dependency files, deploy config, or generated output were edited.
- Confirmed no deploy and no provider call happened.

## Remaining P4-04 Work

P4-04 should make the Inbox UI clearer and more deliberate:

- The user should explicitly request/review one suggestion.
- The disabled/fallback states should remain visible.
- The UI should not auto-save, auto-schedule, send, sync, remember, or perform external actions.
- Any local save must remain on existing explicit user-approved save paths.

## Boundary Proof

- No deploy was run.
- No provider call was made.
- No provider key or push credential was stored.
- No provider key was exposed in frontend code.
- No live AI was enabled.
- No true push notification was sent.
- No Firebase rules, auth policy, billing, DNS, secrets, env files, package/dependency files, deploy config, or generated output were touched.
- No calendar sync, geocoding/maps, email/text sending, account deletion backend, contact sync, hidden write, token storage, automatic scheduling, or external action was added.
