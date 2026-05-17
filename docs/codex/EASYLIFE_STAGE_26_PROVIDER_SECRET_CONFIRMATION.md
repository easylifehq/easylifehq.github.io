# EasyLife Stage 26 Provider And Server-Secret Confirmation

Date: 2026-05-17
Status: CONFIRMED_WITH_PLACEHOLDER_PROVIDER

## Mission

Create the final confirmation note before any live provider implementation begins.

This confirmation does not add live AI calls, provider SDKs, backend implementation, dependencies, deploy config, generated output, secrets, or real user data.

## Provider Choice

Provider is confirmed only as a placeholder for Stage 26:

```text
APPROVED_MODEL_PROVIDER=TBD_SERVER_SIDE_PROVIDER
```

Meaning:

- the next implementation may create a server-shaped seam for the provider path
- the implementation must not hard-code a provider in browser code
- the implementation must not add a provider SDK unless a later task explicitly approves it
- the first live call must remain blocked if the actual provider and server runtime are not configured safely

## Server-Side Secret Placeholder

The only approved placeholder name is:

```text
SERVER_AI_PROVIDER_API_KEY
```

No actual key value may be:

- printed
- pasted into a prompt
- committed
- stored in frontend source
- stored in `VITE_` variables
- stored in docs
- stored in fixtures
- stored in logs
- stored in screenshots
- stored in generated browser bundles

## Existing Key Clarification

The existing `pipeline-2f422` value is Firebase web configuration.

File:

```text
app-vNext/src/lib/firebase/config.ts
```

It is not an AI provider key.

It must not be reused as:

- `SERVER_AI_PROVIDER_API_KEY`
- a model provider token
- a provider endpoint secret
- proof that AI secret storage is ready

## Browser-Exposed Environment Clarification

Any `VITE_` variable is browser-exposed.

The existing example:

```text
VITE_TASK_ANALYZER_URL
```

may represent a public endpoint URL only. It must never contain an AI provider key or provider secret.

## First Route

Only this route is approved for the Stage 26 dry run:

```text
/app/easylist/add?demo=1
```

## First Prompt

Only this prompt ID is approved:

```text
intake-suggestion
```

## First Behavior

Only this behavior is approved:

```text
Inbox typed-capture suggestion
```

The suggestion must stay:

- draft/preview only
- approval-first
- validation-gated
- fallback-safe
- no hidden writes
- no external actions

## Input Rule

Only synthetic/demo typed capture may be used.

Do not use:

- real user data
- private notes
- real tasks
- real contact names
- real place labels
- email content
- calendar content
- auth/session payloads
- full app context

## Spend Cap

Default Stage 26 dry-run cap:

```text
maximum_provider_requests: 5
maximum_total_spend: 1.00 USD
```

If the provider/runtime cannot enforce this cap, stop before making a live provider call.

## Rate Limit

Default Stage 26 dry-run rate limit:

```text
per_user_daily_cap: 10 synthetic requests
short_window_throttle: 1 request per 60 seconds
timeout: 15 seconds
automatic_retries: disabled
```

If rate limiting is unavailable or unclear, return local fallback instead of calling the provider.

## Metadata-Only Logging Rule

Allowed metadata:

- request ID
- route
- prompt ID
- schema version
- fallback reason
- validation result
- latency bucket
- token estimate bucket
- rate-limit bucket
- provider-call attempted boolean

Forbidden logs:

- raw typed capture
- real user content
- note bodies
- task notes
- contact names
- place labels
- full context packets
- provider raw responses
- provider secrets
- auth/session payloads

## Fallback Behavior

Fallback must preserve:

- typed capture text in the visible UI
- deterministic local classifier output
- unsaved local draft preview
- existing manual task save behavior
- existing manual note/context save behavior

Fallback must not:

- retry in the background
- queue replay
- save anything
- send anything
- schedule anything
- sync anything
- create notifications
- change calendar data
- create real memory
- use device location
- geocode
- call external services

## Rollback Plan

Rollback is:

1. Disable provider calls at the server-side gateway or runtime switch.
2. Confirm no provider call occurs.
3. Keep local deterministic fallback available.
4. Keep existing manual task and note/context save paths unchanged.
5. Do not replay old requests.
6. Do not preserve provider raw responses.
7. Verify Inbox still renders a safe fallback state.

## Stop Conditions

Stop before implementation if:

- the real provider is unclear
- server-side secret storage is unclear
- the key would need to live in frontend code
- a `VITE_` key is proposed for provider secret storage
- spend cap cannot be enforced
- rate limit cannot be enforced
- logging cannot stay metadata-only
- fallback cannot preserve typed capture
- the task asks for real user data
- the task asks for broad chat
- the task asks for hidden reads or hidden writes
- the task asks for saving, sending, scheduling, syncing, notifications, calendar changes, real memory, geocoding, device location, external actions, or saved-object expansion

## Confirmation

Stage 26 Task 1 is confirmed with a placeholder provider and server-only secret placeholder.

The next task may implement a disabled-by-default server-shaped dry-run gateway seam only if it keeps the provider unconfigured and returns local fallback until a safe server-side provider runtime exists.
