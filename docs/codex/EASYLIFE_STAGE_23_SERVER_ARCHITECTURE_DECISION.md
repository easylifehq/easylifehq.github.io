# EasyLife Stage 23 Server Architecture Decision

## Verdict

Recommended first real AI gateway architecture: a narrow Firebase Cloud Function / HTTPS callable gateway for the Inbox typed-capture suggestion flow.

This is an architecture decision only. It does not approve live model calls, provider SDKs, API keys, backend implementation, Firebase config changes, dependencies, package files, deployment config, generated output, secrets, external actions, hidden reads, hidden writes, real memory, or saved-object expansion.

## First Allowed Behavior

The first real model-backed behavior remains:

Inbox typed-capture suggestion only.

The gateway may eventually accept a bounded Stage 20 context packet for the typed capture text currently visible in Inbox, use the reviewed `intake-suggestion` prompt, validate the model-shaped output, and return a suggestion preview. It must not save, send, sync, schedule, remember, geocode, use device location, read hidden app data, or perform external actions.

## Architecture Options Compared

### Static-only no server

Decision: rejected for real provider integration.

Why:
- Provider secrets cannot be protected in a static browser bundle.
- Frontend API keys can be extracted from source maps, browser devtools, network calls, scraped builds, extensions, screenshots, or logs.
- Browser-only enforcement cannot reliably protect prompt boundaries, spend controls, raw payload logging, or abuse throttles.

Allowed use:
- Keep static/local deterministic assistant behavior.
- Keep Stage 22 no-provider mock gateway for local proof and fallback.

Not allowed:
- Live provider calls from frontend code.
- Provider keys in Vite env vars, public config, browser storage, docs, fixtures, logs, or generated assets.

### Local/dev mock adapter

Decision: keep for development and proof only.

Why:
- Stage 22 already proved the app can use context packets, prompt IDs, output validation, fallback states, and visible no-provider labeling without real AI.
- It is useful for UI review, safety fixtures, and regression tests.

Limits:
- It cannot protect real provider secrets.
- It cannot be treated as production auth, quota, spend, privacy, or logging enforcement.

### Generic serverless function

Decision: acceptable fallback, not the preferred first path.

Why:
- A generic serverless function can protect secrets, validate requests, apply rate limits, call a provider, validate output, and return a safe response.

Why not first:
- EasyLife already has Firebase/Auth concepts in the app.
- A separate generic serverless stack would require extra auth/session bridging before the first narrow AI behavior.
- More platform surface increases operational complexity for one Inbox suggestion endpoint.

### Firebase / Cloud Function

Decision: recommended first architecture.

Why:
- EasyLife already uses Firebase client concepts, Auth context, and Firestore-adjacent data patterns.
- A narrow HTTPS callable or HTTPS Cloud Function can keep provider secrets server-side.
- The function can verify user/session context before it accepts a request.
- The function can enforce Stage 20 context packet shape, Stage 20 prompt registry choices, Stage 20 output validation, metadata-only logging, rate limits, spend controls, kill switch, and fallback behavior.
- It avoids broad backend expansion while still providing a real server boundary.

Constraint:
- The first function must be treated as a single-purpose assistant gateway, not the beginning of a broad backend rewrite.

### Separate minimal API service

Decision: parked.

Why:
- A separate API service gives strong isolation and full control over auth, logs, rate limits, secrets, and provider calls.
- It may become appropriate if EasyLife outgrows Firebase Functions, needs multi-provider routing, or needs heavier queueing and observability.

Why not first:
- It adds deployment, auth, monitoring, and operational overhead before the first real provider behavior has been proven.

## Recommended Gateway Shape

Working name:

`assistantIntakeSuggestion`

Possible runtime shape:

- Firebase HTTPS callable function, or
- Firebase HTTPS function with the same envelope contract.

The exact deployment/config choice stays parked until a later implementation gate. Stage 23 only chooses the boundary.

## Request Path

Browser:
- Builds a Stage 20 context packet.
- Uses only current route, typed capture, and optional demo fixture for the first behavior.
- Sends prompt ID `intake-suggestion`.
- Never sends broad app context.
- Never includes hidden tasks, note bodies, contact names/place labels, raw calendars, or secrets.

Server gateway:
- Verifies request version.
- Verifies authenticated/session-safe caller when auth enforcement exists.
- Verifies prompt ID is exactly `intake-suggestion`.
- Verifies surface is Inbox typed capture.
- Validates the Stage 20 context packet before any provider call.
- Rejects or falls back on forbidden context, oversized input, unsupported prompt, unsupported route, or unsafe source type.

Provider call:
- Happens only server-side in a later approved stage.
- Uses provider secrets stored outside frontend code.
- Uses a reviewed prompt from the prompt registry.
- Sends only the approved context packet.

Response path:
- Server validates provider output with Stage 20 output validator before returning it.
- Server rejects or downgrades output that claims automatic saving, sending, syncing, scheduling, real memory, geocoding, device location, hidden reads, background work, or external actions.
- Browser still treats the response as untrusted and renders only known draft/preview/fallback states.

## Secret Storage

Provider secrets must live only in the chosen server runtime secret store or equivalent secure environment variable mechanism.

Forbidden locations:
- Frontend source.
- Vite public env vars.
- Docs.
- Fixtures.
- Screenshots.
- Browser localStorage/sessionStorage.
- Generated assets.
- Logs.
- Git commits.
- Network-visible config.

No secret should be introduced until a separate provider-readiness gate explicitly approves provider choice, secret storage, rotation, revocation, and spend cap.

## Request Validation

Validation must happen before any provider call.

Required checks:
- Request version is known.
- Prompt ID is allowed.
- Surface is Inbox typed capture.
- Route is allowed.
- Context packet version is known.
- Source types are allowed.
- Typed capture is present and within length limits.
- Broad app context is absent.
- Contact place labels, note bodies, task notes, auth/session payloads, and secrets are absent unless a later gate explicitly approves a new behavior.
- Rate limits and kill switch state allow the request.

Invalid requests return local fallback. They do not retry in the background.

## Response Validation

Provider output must pass the Stage 20 output validator before it can be returned as usable assistant output.

Allowed output qualities:
- Known intent.
- Known confidence label.
- Known source list.
- Known destination label.
- Draft, preview, or needs-review state.
- Explicit confirmation requirement.
- Approval-first language.

Rejected or downgraded output qualities:
- Automatic save claims.
- Sending/email/text/message claims.
- Scheduling/calendar/notification claims.
- Sync claims.
- Real memory claims.
- Geocoding/device location claims.
- Hidden read or background work claims.
- Unsupported destination.
- Missing confirmation requirement.

## Privacy And Logging

Normal logging must be metadata-only.

Allowed metadata examples:
- Request ID.
- Timestamp.
- Gateway version.
- Prompt ID.
- Surface.
- Route ID.
- Source type list.
- Source count.
- Input length bucket.
- Output validation state.
- Fallback reason.
- Rate-limit state.
- Latency bucket.

Forbidden default logs:
- Raw typed capture.
- Note bodies.
- Task notes.
- Contact names.
- Place labels.
- Provider raw request.
- Provider raw response.
- Full prompts with user content.
- Full context packets.
- Secrets.
- Auth/session payloads.

Debug capture must be opt-in, time-limited, redacted, synthetic-fixture-first, and cleaned up after the debugging window.

## Rate Limits And Spend Controls

The first real gateway must start conservative.

Required controls:
- Disabled-by-default launch posture.
- Per-user daily cap.
- Short-window throttle.
- Context/token limits.
- Timeout.
- No automatic background retries.
- Circuit breaker.
- Server-side kill switch.
- Spend warning threshold.
- Hard spend cap before production use.

Every rate, budget, timeout, validation, and provider failure path returns local fallback and preserves typed capture.

## Rollback And Fallback

Rollback path:
- Disable the server gateway or provider calls with a kill switch.
- Keep deterministic local classifier/draft preview available.
- Keep manual task save and note/context save behavior unchanged.
- Do not replay queued AI requests after re-enable.
- Do not silently upgrade fallback drafts into provider drafts.

Fallback copy should remain direct:

`AI unavailable. Local draft tools still work; nothing was saved or sent.`

## Implementation Sequence

Stage 23 remains docs-only:
1. Architecture ADR.
2. Gateway request/response boundary decision.
3. Gateway threat model.
4. Rollout and fallback decision.
5. Stage 23 proof packet.

Stage 24 may implement a no-provider server adapter shell/mock path only after Stage 23 proof.

Stage 25 may decide provider readiness only after the no-provider server adapter proof.

Stage 26 may run a first live provider dry-run only with explicit human approval.

## Do Not Cross

Do not add:
- Live model calls.
- Provider SDKs.
- API keys.
- Backend implementation.
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

## Stage 23 Decision Summary

EasyLife should use a narrow Firebase Cloud Function / HTTPS callable gateway as the first real AI server boundary, because it protects provider secrets and matches the existing Firebase/Auth direction without creating a broad backend. Static-only is rejected for live provider calls. The local mock adapter remains a development and fallback proof tool. Generic serverless is a fallback. A separate minimal API service is parked until the product needs heavier isolation or operations.
