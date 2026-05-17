# EasyLife Stage 32 Narrow Gateway Proof Packet

Reviewed: 2026-05-17

## Verdict

READY_FOR_STAGE_33_FIRST_PROVIDER_CALL_IMPLEMENTATION

## Mission

Prove whether the new `assistantIntakeSuggestion` gateway scaffold is ready for a separately approved live provider implementation.

## Build Proof

- App build: passed with `npm.cmd run build` from `app-vNext`.
- Functions check: passed with `npm.cmd --prefix functions run lint`.
- Deploy: not run.
- Live AI call: not run.

## Function Proof

- `functions/index.js` exports `assistantIntakeSuggestion`.
- `assistantIntakeSuggestion` is a separate Firebase Function from `analyzeTaskBrainDump` and `planProjectWithAi`.
- The new function accepts POST only.
- The new function requires verified Firebase auth before accepting a request.
- The accepted route is exactly `/app/easylist/add?demo=1`.
- The accepted prompt is exactly `intake-suggestion`.
- The accepted body keys are limited to `route`, `promptId`, `typedCapture`, and bounded safe `metadata`.
- The response envelope is `stage-32-assistant-intake-response-v1`.

## Fallback Proof

`assistantIntakeSuggestion` currently returns disabled/fallback only:

- `providerState: not-called`
- `providerCallAttempted: false`
- `fallbackState: local-disabled`
- `validationState: not-run`
- `quarantineState: not-run`
- `suggestion: null`
- `nothingSavedOrSent: true`
- `hiddenWrites: false`
- `externalActions: false`

No response can be interpreted as saved output.

## Provider Proof

- `assistantIntakeSuggestion` attaches the existing Firebase Functions secret `OPENAI_API_KEY`, but does not call `openAiApiKey.value()`.
- `assistantIntakeSuggestion` does not call OpenAI.
- Existing broader AI endpoints still exist:
  - `analyzeTaskBrainDump`
  - `planProjectWithAi`
- Those old endpoints were not modified, redeployed, expanded, or wired into the new Inbox gateway lane.

## Frontend Proof

- Inbox can optionally call `assistantIntakeSuggestion` only through `VITE_ASSISTANT_INTAKE_SUGGESTION_URL`.
- `VITE_ASSISTANT_INTAKE_SUGGESTION_URL` is a function URL only, not a provider key.
- No frontend OpenAI/provider key variable was added.
- The client keeps local fallback if the endpoint is missing.
- The client requires a Firebase auth token before calling a configured endpoint.
- The client sends only:
  - `route`
  - `promptId`
  - `typedCapture`
  - safe `metadata`
- The client does not use `analyzeTaskBrainDump`.
- Malformed or failed server responses normalize into local fallback.

## No-Secret Proof

Search findings:

- No `VITE_` OpenAI/provider key variable was found.
- No frontend provider secret was added.
- `VITE_AI_PROVIDER_API_KEY` appearances are negative test fixtures that prove `VITE_` provider secrets are rejected.
- Existing public Firebase web config remains public Firebase config, not an AI provider secret.

## Blunt Judgment

The narrow gateway is ready for Stage 33 because the server doorway now exists, is auth-protected, accepts only the approved Inbox typed-capture lane, returns a stable fallback envelope, and is wired to the UI behind an optional endpoint URL.

This does not mean EasyLife has live AI yet. It means the next stage can implement the first provider call inside `assistantIntakeSuggestion` without touching the broader old AI endpoints.

## Stage 33 Boundary

Stage 33 may implement one server-side provider call for:

- route: `/app/easylist/add?demo=1`
- prompt: `intake-suggestion`
- behavior: Inbox typed-capture suggestion only
- input: synthetic/demo or explicitly approved private-alpha typed capture only

Stage 33 must not add broad chat, real memory, email/text sending, calendar sync, notifications, geocoding, device location, hidden writes, saved-object expansion, frontend provider keys, provider SDKs unless explicitly required by the server implementation, package changes unless separately approved, deploy config changes, or old endpoint expansion.

## Verdict

READY_FOR_STAGE_33_FIRST_PROVIDER_CALL_IMPLEMENTATION
