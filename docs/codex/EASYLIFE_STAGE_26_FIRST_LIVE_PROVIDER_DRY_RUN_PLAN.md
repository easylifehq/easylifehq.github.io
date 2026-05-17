# EasyLife Stage 26 First Live Provider Dry Run Plan

Date: 2026-05-17
Status: STAGE_26_PLAN_READY

## Mission

Run the first real model-provider dry run for EasyLife without turning the product into a broad live AI assistant.

Stage 26 is allowed because Stage 25 reached:

```text
READY_FOR_STAGE_26_FIRST_LIVE_PROVIDER_DRY_RUN
```

This stage is still a guarded dry run, not a public feature launch.

## First Behavior

Only one live-provider behavior is in scope:

```text
Inbox typed-capture suggestion
```

Route:

```text
/app/easylist/add?demo=1
```

Input:

```text
synthetic/demo typed capture only
```

Prompt ID:

```text
intake-suggestion
```

## Non-Negotiable Boundaries

- Provider key must be server-side only.
- No frontend API keys.
- No real user data.
- No hidden reads.
- No hidden writes.
- No automatic saves.
- No email, text, call, or message sending.
- No scheduling.
- No syncing.
- No notifications.
- No calendar changes.
- No real memory.
- No geocoding.
- No device location.
- No external actions.
- No saved-object expansion.

## Server-Side Secret Rule

The existing `pipeline-2f422` key is Firebase web configuration, not an AI provider secret.

The `VITE_TASK_ANALYZER_URL` placeholder is browser-exposed because it uses a `VITE_` name.

Stage 26 must not put provider keys in:

- frontend source
- `VITE_` env vars
- docs
- fixtures
- logs
- screenshots
- commits
- browser bundles
- generated assets

The provider key must be referenced only as a server-side secret placeholder until the approved server runtime is configured:

```text
SERVER_AI_PROVIDER_API_KEY
```

No actual secret value should be printed, committed, or pasted into a prompt.

## Required Architecture

Stage 26 must follow the Stage 23 architecture decision:

```text
browser -> server gateway -> provider -> server validator -> browser
```

The browser may:

- collect synthetic typed capture
- create a bounded Stage 20 context packet
- call the EasyLife gateway
- render validated draft/preview/fallback output
- keep local fallback usable

The browser must not:

- hold provider keys
- choose arbitrary prompts
- send broad app context
- call the provider directly
- render unvalidated provider output
- mutate data because of provider output

The server gateway must:

- validate request envelope
- validate route and surface
- enforce prompt allowlist
- enforce rate limit and spend cap
- enforce kill switch
- choose the reviewed prompt
- call provider only after validation
- validate output before return
- log metadata only
- return fallback on any failure

## Context And Prompt Rules

Use Stage 20 context packets only:

```text
stage-20-context-v1
```

Use Stage 20 prompt registry only:

```text
stage-20-prompts-v1
```

Allowed prompt ID:

```text
intake-suggestion
```

Forbidden prompt shape:

```text
ask AI anything
send full app context
summarize my life
act on my behalf
remember this
schedule this
send this
sync this
```

## Output Validation

Every provider response must pass Stage 20 output validation before the browser can render it:

```text
validateAssistantModelOutput
```

Allowed render states:

- Draft
- Preview
- Needs review
- Fallback

Rejected or downgraded output includes:

- automatic saving claims
- sending claims
- scheduling claims
- syncing claims
- real memory claims
- geocoding claims
- device-location claims
- hidden-read claims
- hidden-write claims
- external-action claims
- missing source attribution
- missing confirmation requirement

## Logging Policy

Default logging must be metadata-only.

Allowed log fields:

- request ID
- route
- prompt ID
- schema version
- fallback reason
- validation result
- latency bucket
- token estimate bucket
- rate-limit bucket

Forbidden logs:

- raw typed capture
- note bodies
- task notes
- contact names
- place labels
- full context packets
- provider raw responses
- provider secrets
- auth/session payloads

## Rate Limit And Spend Cap

Stage 26 must define conservative runtime limits before a live call:

- daily cap per user
- short-window throttle
- context/token limit
- timeout
- no automatic background retry
- circuit breaker
- spend warning threshold
- hard stop spend cap

Failures must return local fallback.

## Kill Switch

The gateway must have a server-side disable path.

When disabled:

- no provider call occurs
- typed capture is preserved
- deterministic local fallback remains available
- no queued replay happens
- no background retry happens

## Rollback Plan

Rollback is:

1. Disable provider calls with the server-side switch.
2. Keep local deterministic fallback.
3. Keep existing manual task save and note/context save paths unchanged.
4. Do not replay old requests.
5. Do not preserve provider raw responses.

## Failure Conditions

Stop Stage 26 immediately if:

- a provider key appears in frontend code
- a provider key appears in docs, logs, screenshots, or commits
- the browser calls the provider directly
- real user data is used in the dry run
- output validation is bypassed
- raw typed capture is logged by default
- the model output claims hidden action
- the gateway cannot be disabled
- spend/rate limits are unclear
- fallback does not work
- any task tries to add broad chat, real memory, external actions, notifications, calendar sync, geocoding, device location, or saved-object expansion

## Stage 26 Tasks

Stage 26 should run in exactly five bounded tasks:

1. Final provider and server-secret confirmation.
2. Server-only dry-run gateway implementation.
3. Provider response validation and fallback hardening.
4. Inbox dry-run UI wiring with synthetic/demo input only.
5. Stage 26 proof packet.

## Blunt Product Posture

Stage 26 is the first time a real provider may be contacted, but the product should still say the restrained truth:

```text
Live provider dry run. Synthetic input. Validated suggestion. Nothing saved or sent.
```

Do not market this as a fully live AI assistant yet.
