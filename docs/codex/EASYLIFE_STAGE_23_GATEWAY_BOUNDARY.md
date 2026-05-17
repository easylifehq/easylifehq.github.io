# EasyLife Stage 23 Gateway Boundary

## Purpose

Define exactly where request validation, prompt selection, provider calls, output validation, and fallback handling live for the future EasyLife AI gateway.

This is a boundary decision only. It does not implement live AI calls, provider SDKs, API keys, backend services, dependencies, package files, deploy config, generated output, or secrets.

## First Behavior Lock

The first real model-backed behavior remains:

Inbox typed-capture suggestion only.

Allowed first prompt ID:

`intake-suggestion`

Allowed first context sources:

- `current-route`
- `typed-capture`
- optional `demo-fixture`

Allowed first route:

`/app/easylist/add`

No other assistant surface is approved for model-backed gateway behavior by this boundary.

## Contract Names

Stage 20 context contract:

- Version: `stage-20-context-v1`
- Type family: `AssistantContextPacket`
- Read policy: `minimum-needed-only`
- Confirmation policy: `suggestions-only`
- Existing validator: `validateAssistantContextPacket`

Stage 20 prompt registry:

- Version: `stage-20-prompts-v1`
- First prompt ID: `intake-suggestion`
- First expected output schema: `AssistantIntakeSuggestionOutputV1`
- Registry object: `assistantPromptRegistry`

Stage 20 output validation:

- Output version: `stage-20-output-v1`
- Existing validator: `validateAssistantModelOutput`
- Allowed safety states: accepted, downgraded, rejected.

Stage 21/22 request precedent:

- Request version: `stage-21-gateway-request-v1`
- Allowed first surface: `inbox`
- Stage 22 local proof module: no-provider mock gateway.

Stage 24 may rename or wrap the request envelope for a server adapter, but it must preserve these boundaries.

## End-To-End Boundary

```text
Browser
  -> build bounded context packet
  -> send gateway request envelope
Server gateway
  -> authenticate/session-check where available
  -> validate envelope/context/prompt/surface/rate/kill-switch
  -> choose reviewed prompt
Provider
  -> receive only approved prompt + approved context
Server validator
  -> validate model output
  -> reject/downgrade/fallback unsafe output
Browser
  -> render only draft/preview/needs-review/fallback
```

## Browser Responsibilities

The browser may:

- Capture the typed Inbox text the user can see.
- Build a Stage 20 `AssistantContextPacket`.
- Include the current route source.
- Include exactly one `typed-capture` source for the first gateway behavior.
- Include an optional synthetic `demo-fixture` source in dev/demo proof.
- Send prompt ID `intake-suggestion`.
- Show local deterministic fallback when AI is unavailable.
- Render validated draft/preview/needs-review output from the server.
- Keep manual task save and note/context save behavior unchanged.

The browser must not:

- Hold provider API keys.
- Choose arbitrary prompt IDs.
- Send broad app context.
- Send hidden task lists.
- Send hidden note bodies.
- Send contact names/place labels for the Inbox typed-capture behavior.
- Send calendar sync payloads.
- Send auth/session payloads.
- Send Firebase user objects.
- Send secrets or config.
- Call a provider directly.
- Treat server output as a saved action.
- Save, send, sync, schedule, remember, geocode, notify, or mutate data from model output.

## Browser Request Assembly

For the first behavior, the browser request should be conceptually equivalent to:

```text
requestVersion: stage-21-gateway-request-v1 or later compatible server version
promptId: intake-suggestion
surface: inbox
contextPacket:
  version: stage-20-context-v1
  readPolicy: minimum-needed-only
  confirmationPolicy: suggestions-only
  route:
    routeId: inbox
    path: /app/easylist/add
  sources:
    - current-route
    - typed-capture
    - optional demo-fixture
```

The browser may validate locally to give fast feedback, but local validation is not the security boundary. The server must validate again.

## Server Gateway Responsibilities

The server gateway must:

- Verify the request envelope version.
- Verify the caller/session when auth enforcement is available.
- Verify the route and surface are the allowed Inbox path.
- Verify prompt ID is exactly `intake-suggestion`.
- Verify the context packet version is `stage-20-context-v1`.
- Verify `readPolicy` is `minimum-needed-only`.
- Verify `confirmationPolicy` is `suggestions-only`.
- Verify source count is within the limit.
- Verify allowed first source types only.
- Verify exactly one non-empty typed capture source exists.
- Verify typed capture stays within the configured length limit.
- Reject forbidden keys such as token, secret, auth, session, cookie, password, latitude, longitude, geocode, exact address, billing, payment, medical, or SSN-like fields.
- Enforce rate limits before provider call.
- Enforce spend/circuit/kill-switch state before provider call.
- Select the prompt from the reviewed prompt registry.
- Call the provider only after every preflight check passes.
- Validate provider output before returning anything usable.
- Return local fallback when validation, provider, rate, spend, timeout, or kill-switch checks fail.

The server gateway must not:

- Accept arbitrary prompts.
- Accept broad context packets.
- Accept selected-task, selected-note-context, selected-day-summary, or selected-contact-place for the first Inbox typed-capture behavior.
- Log raw typed capture by default.
- Store raw provider responses by default.
- Save user data.
- Send email/text/call/message.
- Create calendar events.
- Schedule reminders.
- Create notifications.
- Create real memory.
- Geocode or use device location.
- Run automatic background retries.

## Prompt Selection Boundary

Prompt selection must live server-side.

Browser input may name `intake-suggestion`, but the server must still:

- Check that the prompt ID is allowed for this endpoint.
- Load the prompt from the reviewed Stage 20 registry.
- Refuse any unregistered prompt.
- Refuse any registered prompt that is not approved for the current endpoint.
- Refuse any prompt if registry validation fails.

For the first server gateway, no other prompt IDs are allowed, even though the Stage 20 registry contains other future prompt IDs.

## Provider Call Boundary

Provider calls must live server-side only.

Provider request may include:

- Reviewed prompt template.
- Approved prompt ID.
- Approved Stage 20 context packet content.
- Minimal metadata needed for traceability.

Provider request must not include:

- Provider secrets in payload.
- Auth/session payloads.
- Raw database dumps.
- Full app exports.
- Hidden note/task/contact/calendar data.
- Email inbox body.
- Calendar sync payload.
- Device location.
- Geocoding results.
- Exact street address.
- Real personal data in fixtures.
- Anything outside the first Inbox typed-capture behavior.

## Output Validation Boundary

Output validation must live server-side before the browser receives a usable suggestion.

The server must run `validateAssistantModelOutput` or a server-equivalent copy of the same contract against provider output.

Accepted output may return only if it includes:

- Known output version.
- Prompt ID `intake-suggestion`.
- Expected schema `AssistantIntakeSuggestionOutputV1`.
- Known intent.
- Known confidence label.
- Known state.
- Known destination label.
- Title.
- Summary.
- Source list.
- Editable fields.
- Confirmation object with explicit confirmation required.
- String warning list.

Downgraded output may return only as a review-only state.

Rejected output must not render as model output. It returns fallback.

## Output Claims That Must Reject Or Downgrade

Reject or downgrade any output claiming:

- Automatic saving.
- Task saved.
- Email sent.
- Text sent.
- Calendar event created.
- Reminder scheduled.
- Notification scheduled.
- Sync completed.
- Real memory created or updated.
- Device location used.
- Geocoding performed.
- Hidden read.
- Background work.
- External action performed.

The browser must never display these claims as true.

## Fallback Boundary

Fallback handling is shared, but final safety decisions live server-side.

Server returns fallback when:

- Request is invalid.
- Prompt is unsupported.
- Context is forbidden.
- Rate limit is reached.
- Spend limit is reached.
- Circuit breaker is open.
- AI is disabled.
- Provider times out.
- Provider errors.
- Output validation rejects the response.

Browser fallback behavior:

- Preserve the typed capture text.
- Keep deterministic local classifier/draft preview available.
- Explain that AI is unavailable or the request could not be used.
- Keep manual task/note save flows unchanged.
- Do not retry automatically in the background.
- Do not replay old AI requests later.

## Logging Boundary

Browser logs:

- May record UI state and local fallback state.
- Must not log raw typed capture for AI gateway debugging by default.
- Must not log provider payloads because it never receives raw provider payloads.

Server logs:

- May record metadata-only request ID, gateway version, prompt ID, surface, route ID, source types, source count, input length bucket, validation state, fallback reason, rate-limit state, and latency bucket.
- Must not log raw typed capture, full context packets, prompt text with user content, provider raw request, provider raw response, auth/session payloads, or secrets by default.

## Failure Mode Table

| Failure | Owner | Result |
| --- | --- | --- |
| Browser sends unsupported prompt | Server | Reject request, return fallback |
| Browser sends broad context | Server | Reject request, return fallback |
| Browser sends hidden source type | Server | Reject request, return fallback |
| Rate limit reached | Server | Return local fallback |
| Kill switch enabled | Server | Return AI-unavailable fallback |
| Provider timeout | Server | Return timeout fallback |
| Provider unsafe output | Server validator | Reject or downgrade, then fallback/review-only |
| Browser render mismatch | Browser | Render fallback and keep manual controls |

## What Runs Where

Browser:

- UI capture.
- Local deterministic classifier.
- Local draft preview.
- Stage 20 context packet creation.
- Optional local preflight validation.
- Server response rendering.
- Manual user-confirmed save paths.

Server:

- Auth/session enforcement when available.
- Request envelope validation.
- Context packet validation as security boundary.
- Prompt allowlist check.
- Prompt registry lookup.
- Rate limits.
- Spend controls.
- Kill switch.
- Provider call.
- Output validation as security boundary.
- Metadata-only logging.
- Fallback response.

Provider:

- Receives only approved prompt and approved context.
- Returns untrusted model output.
- Does not make app decisions.
- Does not perform external actions.

## Stage 24 Implementation Constraint

Stage 24 may implement a no-provider server adapter shell/mock path that follows this boundary.

Stage 24 must not add:

- Live provider calls.
- Provider SDKs.
- API keys.
- Backend production behavior.
- Firebase config changes.
- Dependencies.
- Package file changes.
- Deploy config.
- Generated output.
- Secrets.
- External actions.
- Hidden reads.
- Hidden writes.
- Real memory.
- Saved-object expansion.

## Boundary Decision

The browser owns visible input, local fallback, and rendering. The server owns trust: request validation, prompt selection, provider calls, output validation, rate/spend controls, kill switch, metadata-only logging, and final fallback. The provider is never trusted as an actor; it is only an untrusted text generator behind server validation.
