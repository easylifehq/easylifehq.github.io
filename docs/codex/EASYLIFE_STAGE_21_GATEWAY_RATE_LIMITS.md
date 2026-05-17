# EasyLife Stage 21 Gateway Rate Limits And Spend Controls

Created At: 2026-05-17

Verdict: `GATEWAY_RATE_LIMITS_READY`

## Mission

Define cost, abuse, retry, timeout, and disable-switch controls before any model provider is connected.

This is a planning contract only. It does not add provider SDKs, live calls, backend implementation, monitoring services, dependencies, package files, deploy config, generated output, API keys, secrets, hidden reads, hidden writes, or external actions.

## First Gateway Scope

These controls apply first to the planned server-only endpoint:

`POST /api/assistant/intake-suggestion`

Allowed prompt ID:

`intake-suggestion`

Allowed behavior:

`Inbox typed-capture suggestion`

The gateway may return only a validated draft, preview, needs-review state, or local fallback. It must not save, send, sync, schedule, remember, geocode, notify, archive, delete, mutate data, or start background work.

## Default Failure Rule

All gateway failures return local fallback.

Fallback must preserve:

- typed capture text in the browser
- deterministic local classifier
- local draft preview
- manual task save path
- manual note/context save path
- calm copy such as `Live AI is unavailable. Local suggestions still work.`

Failures must not trigger automatic background retries, repeated provider calls, silent queued work, hidden writes, hidden reads, or external actions.

## Per-User Daily Request Cap

The gateway must enforce a daily per-user cap before any provider call.

Planning target for the first behavior:

- default cap: 25 model-backed Inbox suggestion requests per user per day
- soft warning threshold: 20 requests per user per day
- hard cap behavior: skip provider call and return local fallback
- cap key: opaque internal user/account identifier or privacy-safe hash
- forbidden cap keys: user email, display name, contact name, place label, typed capture text, note content, task note, or auth/session payload

The daily cap is intentionally small because the first model-backed behavior is suggestion-only and should prove value before higher usage is allowed.

## Short-Window Throttle

The gateway must enforce a short-window throttle to stop rapid loops, accidental double-submits, or abuse.

Planning target:

- no more than 5 model-backed requests per user per 5 minutes
- no more than 2 model-backed requests per user per 30 seconds
- duplicate request protection for repeated identical request IDs
- throttle behavior: skip provider call and return local fallback

The throttle must not store raw typed capture to detect duplicates. It may use request IDs, timestamp buckets, opaque account identifiers, and non-content metadata.

## Per-Surface Cap

The first model-backed behavior is Inbox only.

Required first-surface cap:

- `surface` must be `inbox`
- `promptId` must be `intake-suggestion`
- route must be `/app/easylist/add` or the approved Inbox route ID
- all other surfaces return fallback or unsupported-prompt error before provider call

Today, Plan, Notes, Contacts, Settings, and Command may keep local assistant behavior, but they are not approved for model-backed calls in this task.

## Token And Context Limits

The gateway must reject or fallback before provider call if the request exceeds limits.

Planning targets:

- maximum context packet source count: 3
- allowed source types: `current-route`, `typed-capture`, and optional `demo-fixture`
- maximum typed capture length: 500 characters
- maximum prompt plus input estimate: small first-behavior budget
- maximum provider output tokens: one compact suggestion only
- forbidden context: broad app export, full context packet beyond allowed sources, notes library, task database, contact list, exact addresses, device location, email/calendar sync payloads, payment/billing data, secrets, auth/session payloads, or real personal data in fixtures

If context is too large, the browser should keep local deterministic behavior and show a calm fallback message.

## Timeout Behavior

The gateway must use short timeouts so the app stays responsive.

Planning target:

- provider request timeout: 8 seconds
- gateway total timeout: 10 seconds
- browser should render local fallback if timeout is reached
- timed-out requests must not continue invisible background work that later mutates UI or data
- timeout logs must be metadata-only

Timeout copy should be direct:

`Live AI took too long. Local suggestions still work.`

## Retry Policy

Default retry policy:

- no automatic background retries
- no retry after validation failure
- no retry after forbidden context
- no retry after rate limit or budget cap
- no retry after user dismisses fallback
- at most one immediate server-side retry only for a clearly transient provider transport failure, and only before any response is sent

If the one allowed transient retry also fails, return local fallback.

The user may explicitly try again from the UI in a later approved implementation, but the system must not quietly loop.

## Circuit Breaker

The gateway must include a circuit breaker before live provider work is allowed.

Open the circuit when any of these conditions happen:

- repeated provider timeouts
- repeated provider errors
- validation rejection spike
- spend budget threshold crossed
- logging/privacy policy cannot be honored
- output validator is unavailable
- provider returns unsafe or malformed output repeatedly

Circuit-open behavior:

- skip provider calls
- return local fallback
- record metadata-only circuit state
- do not queue requests for later replay
- require explicit operator/developer action to close after investigation

## Kill Switch / Disable Switch

The gateway must have a server-side disable switch before live provider calls are enabled.

Required behavior:

- disable all provider calls immediately
- keep local deterministic assistant behavior available
- return stable `ai-disabled` fallback state
- avoid touching user data
- avoid background retries
- avoid queued replay after re-enable
- expose no secrets or provider details to the browser

The disable switch must be server-side. The browser can display availability, but it must not control provider secrets or bypass server controls.

## Spend Budget Alert Expectations

Spend controls must exist before any provider is connected.

Planning expectations:

- daily spend ceiling for the first model-backed behavior
- monthly spend ceiling for the whole gateway
- warning threshold before hard cap
- hard cap that returns local fallback before provider call
- metadata-only usage counters
- no raw payloads in spend logs
- no automatic paid-provider retries after budget errors
- clear operator alert path before budget exhaustion becomes a surprise

First behavior spend should be treated as an experiment. If usage or cost grows, the gateway must prove value before caps are raised.

## Error And Fallback Mapping

Required mapping:

| Condition | Provider call allowed? | User-facing result |
| --- | --- | --- |
| daily cap reached | no | local fallback |
| short-window throttle hit | no | local fallback |
| context too large | no | local fallback |
| unsupported prompt/surface | no | local fallback or unsupported state |
| forbidden context | no | local fallback |
| provider timeout | maybe once for transient transport only | local fallback |
| provider error | maybe once for transient transport only | local fallback |
| validation rejected | no retry | local fallback |
| circuit open | no | local fallback |
| kill switch active | no | `ai-disabled` fallback |
| spend cap reached | no | local fallback |

Every error path must preserve the typed capture locally and avoid hidden writes.

## Stop Conditions

Stop implementation if:

- provider calls can happen without per-user daily caps
- provider calls can happen without short-window throttles
- context limits are not enforced before provider call
- timeout behavior allows invisible long-running work
- retry behavior creates background loops
- validation failures trigger retries
- spend budget caps cannot fail closed
- kill switch cannot immediately stop provider calls
- fallback blocks manual capture, task save, note save, or Today review
- controls require hidden reads, hidden writes, external actions, secrets in frontend, raw payload logs, or new dependencies

## Done Signal

Stage 21 Task 3 is done when EasyLife has:

- per-user daily request cap rules
- short-window throttle rules
- per-surface cap rules
- token/context limit rules
- timeout behavior
- retry policy
- circuit breaker rules
- kill switch / disable switch rules
- spend budget alert expectations
- fallback-first error mapping
- proof that no provider, backend, dependency, secret, or live AI path was added

## Blunt Verdict

The future gateway may spend money only inside tight, explicit limits.

When controls trip, EasyLife should fall back locally instead of trying harder in the background.
