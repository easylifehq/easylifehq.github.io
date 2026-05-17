# EasyLife Stage 21 Gateway Privacy And Logging Rules

Created At: 2026-05-17

Verdict: `GATEWAY_PRIVACY_LOGGING_READY`

## Mission

Define privacy, logging, redaction, and retention rules before any server AI gateway exists.

This is a planning contract only. It does not add backend services, logging services, analytics, dependencies, package files, provider SDKs, API keys, secrets, deploy config, generated output, live model calls, or real personal data.

## First Gateway Scope

These rules apply first to the planned server-only endpoint:

`POST /api/assistant/intake-suggestion`

Allowed prompt ID:

`intake-suggestion`

Allowed behavior:

`Inbox typed-capture suggestion`

The gateway may return only a validated draft, preview, needs-review state, or fallback. It must not save, send, sync, schedule, remember, geocode, notify, archive, delete, or mutate anything.

## Default Rule

Gateway logs are metadata-only by default.

The log should prove that a request happened, whether it was accepted, how it failed, and whether fallback was used. The log should not preserve the user's typed content, notes, tasks, contacts, places, full prompts, provider output, session payloads, or context packet.

If a future implementation cannot debug safely without storing raw user payloads by default, the implementation is not ready.

## Allowed Metadata Logs

Allowed fields for normal operational logs:

- `requestId`
- timestamp
- gateway contract version
- endpoint name, such as `POST /api/assistant/intake-suggestion`
- prompt ID, such as `intake-suggestion`
- surface, such as `inbox`
- non-sensitive route ID, such as `inbox`
- context source types only, such as `current-route` and `typed-capture`
- context source count
- typed capture length bucket, such as `1-80`, `81-240`, `241-500`, or `over-limit`
- token estimate bucket
- latency bucket
- validation state, such as `accepted`, `downgraded`, or `rejected`
- fallback state and fallback reason
- stable error code
- rate-limit bucket or throttle result
- abstract provider/model class only after a provider is approved, never raw provider payloads

Example allowed metadata log:

```json
{
  "requestId": "assistant-request-123",
  "timestamp": "2026-05-17T14:35:00.000Z",
  "gatewayVersion": "stage-21-gateway-request-v1",
  "endpoint": "POST /api/assistant/intake-suggestion",
  "promptId": "intake-suggestion",
  "surface": "inbox",
  "routeId": "inbox",
  "sourceTypes": ["current-route", "typed-capture"],
  "sourceCount": 2,
  "typedCaptureLengthBucket": "81-240",
  "tokenEstimateBucket": "small",
  "latencyBucket": "under-2s",
  "validationState": "accepted",
  "fallbackReason": null,
  "errorCode": null,
  "rateLimitState": "allowed"
}
```

## Forbidden Logs By Default

The gateway must not log these by default:

- raw typed capture
- note bodies
- task notes
- contact names
- contact place labels
- exact addresses
- device location
- latitude or longitude
- map or geocoding payloads
- provider raw responses
- provider raw request payloads
- prompt-completed text
- full prompts containing user content
- full context packets
- source values from context packets
- secrets
- API keys
- environment variable values
- auth/session payloads
- cookies
- tokens
- raw Firebase users
- email inbox data
- calendar sync data
- emails, texts, calls, or message bodies
- payment or billing data
- medical, legal, government ID, SSN, or sensitive identity data
- real personal data in fixtures, docs, reports, or GitHub status output

Forbidden example:

```json
{
  "rawTypedCapture": "Reply to Maya about where she moved",
  "contactPlaceLabel": "Portland, OR",
  "providerRawResponse": "..."
}
```

That log shape is not allowed.

## Redaction Rules

Redaction is a backup, not the default storage strategy. The safer default is to avoid logging user payload fields at all.

Required redaction rules:

- Replace typed capture with a length bucket and source type.
- Replace note bodies with source type, not content.
- Replace task notes with source type, not content.
- Replace contact names and place labels with source type, not value.
- Replace auth/session references with an opaque request ID.
- Use a hashed or opaque account identifier only if rate limits require it.
- Never log user email, display name, phone number, contact name, or exact place label as the rate-limit key.
- Redact obvious secret patterns before any error object is logged.
- Log error class and failed rule name, not the failed raw payload.
- Log provider failure category, not provider raw response.
- Prefer reproducible synthetic fixtures over captured user data.

Truncation is not enough for user content. A shortened typed capture, note body, or provider output is still raw payload and remains forbidden by default.

## Retention Expectations

Retention should be short-lived and operational.

Planning targets:

- Raw payload retention: `0 days` by default because raw payloads are not stored.
- Operational metadata logs: keep only as long as needed for abuse control, reliability, and cost review.
- Debug metadata: expire quickly after the active investigation.
- Aggregate counters for cost/rate analysis may live longer only if they contain no user content and no reversible personal data.

The first gateway must not create a long-term personal-data log trail.

## Debugging Opt-In Rules

Debugging raw payload capture is off by default.

If a future issue truly needs deeper debugging, it must use a separate opt-in process:

- explicit developer/user-approved scope
- time-limited window
- narrow prompt ID or request class
- redaction before storage
- no production default
- no secrets, auth/session payloads, tokens, cookies, provider raw responses, or full context packets
- no contact names, place labels, raw typed capture, note bodies, or task notes unless a future privacy review explicitly approves a safer temporary method
- cleanup step after investigation
- documented reason in a review packet

Preferred debugging path:

1. Reproduce with synthetic fixture.
2. Log metadata and validator rule names.
3. Add a targeted test case.
4. Use local fallback while the issue is unresolved.

## Privacy Review Checks

Every future gateway implementation or change must answer these checks before merge:

- Does the request use the Stage 20 context packet contract?
- Is the prompt ID exactly allowed for this endpoint?
- Are context source types limited to the approved first behavior?
- Does normal logging contain metadata only?
- Are raw typed capture, note bodies, task notes, contact names/place labels, provider raw responses, secrets, auth/session payloads, and full context packets excluded?
- Are validation failures logged by rule/error class rather than raw output?
- Does fallback preserve the user's typed text locally without sending it to logs?
- Are provider secrets server-only?
- Can rate limiting work without logging names, emails, contact names, or place labels?
- Are debugging logs opt-in, time-limited, redacted, and cleaned up?
- Are reports and GitHub status free of personal data?
- Does the gateway fail closed if the logging policy cannot be honored?

## Stop Conditions

Stop implementation if:

- useful debugging requires default raw payload retention
- production logs need raw typed capture
- production logs need note bodies, task notes, contact names, or place labels
- provider raw responses must be stored by default
- secrets or auth/session payloads would appear in logs
- full context packets would be retained
- rate limiting requires personally identifiable log keys
- privacy review cannot prove metadata-only default behavior

## Done Signal

Stage 21 Task 2 is done when EasyLife has:

- metadata-only logging rules
- explicit forbidden raw payload logs
- redaction rules
- short retention expectations
- debugging opt-in rules
- privacy review checks
- proof that no implementation, dependency, provider, secret, or real personal-data path was added

## Blunt Verdict

The future gateway may log operational metadata.

It may not log the user's raw life data by default.
