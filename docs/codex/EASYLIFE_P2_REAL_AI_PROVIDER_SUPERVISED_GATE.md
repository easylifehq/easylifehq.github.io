# EasyLife P2 Real AI/Provider Assistant Supervised Gate

Date prepared: 2026-05-31

Repo: `C:\Dev\easylifehq.github.io`

## Gate Status

`LIVE_AI_PROVIDER_NOT_LIVE`

EasyLife has prior readiness work for one narrow assistant provider lane, but P2 does not turn on live AI. The only approved future lane remains a separately approved, server-only, synthetic/demo Inbox typed-capture provider test.

## Reconciled Source Packets

- Stage 30 controlled live AI proof: `READY_FOR_SEPARATELY_APPROVED_FIRST_LIVE_AI_CALL`
- Stage 31 first live AI proof: `NOT_READY_FOR_ACTUAL_FIRST_LIVE_PROVIDER_CALL`
- Stage 32 narrow gateway proof: `READY_FOR_STAGE_33_FIRST_PROVIDER_CALL_IMPLEMENTATION`
- Stage 33 first provider call readiness proof: `READY_FOR_ONE_SYNTHETIC_PROVIDER_TEST_DEPLOY`

The current P2 interpretation is stricter than "AI is live":

- Stage 33 readiness does not deploy anything.
- Stage 33 readiness does not make a provider call.
- Stage 33 readiness applies only to a future one-call synthetic operator test.
- P2 does not authorize provider calls, deploys, env changes, Firebase Functions changes, token/key storage, broader chat, real memory, hidden reads, hidden writes, or external actions.

## Current Visible State

- Settings says no live AI provider is assumed.
- Settings says provider calls stay gated and cannot be enabled from Settings.
- Inbox labels the provider lane as a disabled provider test gate rather than a live assistant.
- Existing assistant previews remain review-first and preserve local fallback.
- Output remains draft/preview-only until the user uses an existing explicit save flow.

## First Future Provider Lane

Any future provider test must stay limited to:

- route: `/app/easylist/add?demo=1`
- prompt: `intake-suggestion`
- input: synthetic/demo typed capture only, or explicitly approved private-alpha typed capture
- runtime: server-only
- provider output: quarantined before display
- result: suggestion-only, editable, and review-first
- storage: no automatic save and no hidden write
- external actions: none

## Required Approval Before Any Provider Call

A later task must separately approve:

1. Provider choice.
2. Server-side secret storage mechanism.
3. Spend cap and rate limit.
4. Kill switch.
5. Metadata-only logging policy.
6. Exact route and prompt.
7. Synthetic/demo input requirement.
8. Output quarantine and local fallback.
9. Rollback plan.
10. No frontend provider keys.
11. No hidden writes, hidden reads, real memory, or external actions.

## Explicit Non-Goals For This Task

- No live AI/provider call.
- No deploy.
- No Firebase Functions implementation, rules, config, auth, billing, DNS, secret, env, or generated output changes.
- No package or dependency changes.
- No provider SDK, API key, token storage, frontend key, or server secret work.
- No broad chat, broad context ingestion, real memory, hidden reads, hidden writes, automatic saves, scheduling, sending, syncing, geocoding, notifications, calendar changes, contact sync, or external actions.

## Acceptance Checks

- Settings visibly states provider calls stay gated and Settings does not turn on live AI.
- Inbox provider lane reads as a disabled provider test gate, not a live assistant.
- Proof reconciles Stage 30 through Stage 33 into one current P2 gate.
- Source scan finds no frontend provider key, provider SDK, token storage, deploy/env/secret work, or new provider call implementation added by this gate.
- `npm.cmd run build` passes from `app-vNext`.
