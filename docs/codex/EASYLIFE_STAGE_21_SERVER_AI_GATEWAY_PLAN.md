# EasyLife Stage 21 Server AI Gateway Plan

Created At: 2026-05-17

Verdict: `SERVER_AI_GATEWAY_PLANNING_READY`

## Mission

Plan the safest server-only path for the first real model-backed EasyLife assistant behavior.

Stage 21 is a planning gate. It does not implement live model calls, provider SDKs, API keys, backend services, Firebase config, dependencies, package files, deploy config, generated output, or secrets.

## First Allowed Model-Backed Behavior

The first allowed model-backed behavior is:

`Inbox typed-capture suggestion`

The user types or pastes one messy thought in Inbox. EasyLife may send only that typed capture plus the current route source in a Stage 20 context packet to a future server AI gateway. The model may return one validated suggestion for task, note, plan, reminder, follow-up, or unsure.

The output must render as a draft or preview. It must not save, send, sync, schedule, remember, geocode, notify, archive, delete, or mutate anything. The existing task and note save paths still require explicit user confirmation.

## Server-Only Gateway Architecture

Target architecture:

1. Browser collects an explicit assistant request from the active surface.
2. Browser creates a Stage 20 context packet with `readPolicy: minimum-needed-only` and `confirmationPolicy: suggestions-only`.
3. Browser sends the packet to an EasyLife-owned server gateway endpoint.
4. Server authenticates the request and enforces user/session checks.
5. Server rejects forbidden context before calling any model.
6. Server selects a named prompt from the Stage 20 prompt registry.
7. Server injects the prompt, allowed context packet, and output schema instructions.
8. Server calls the model provider with server-held secrets.
9. Server validates the provider output with the Stage 20 output validator.
10. Server returns only validated draft/preview output to the browser.
11. Browser renders the suggestion with source labels, state, destination, and confirmation copy.
12. User edits, dismisses, previews, or explicitly confirms any existing save path.

If any step fails, the browser uses deterministic local fallback behavior.

## Why Frontend API Keys Are Forbidden

Frontend API keys are public once bundled. A browser app exposes code and network behavior to users, extensions, devtools, logs, and scraped assets. A provider key in frontend code would create cost abuse, data leakage, prompt leakage, key rotation emergencies, and loss of server-side rate limits.

EasyLife must never put model provider keys in:

- Frontend source.
- Frontend environment variables.
- Docs.
- Fixtures.
- Browser storage.
- Logs.
- Generated assets.
- Public config.

The browser may call only an EasyLife-owned server endpoint. The server owns provider secrets, context filtering, prompt assembly, output validation, rate limits, logging policy, and fallback behavior.

## Request Shape

The future gateway request should be a thin envelope around the Stage 20 context packet:

```json
{
  "requestVersion": "stage-21-gateway-request-v1",
  "promptId": "intake-suggestion",
  "surface": "inbox",
  "contextPacket": {
    "version": "stage-20-context-v1",
    "requestId": "generated-request-id",
    "route": {
      "routeId": "inbox",
      "routeLabel": "Inbox",
      "path": "/app/easylist/add"
    },
    "readPolicy": "minimum-needed-only",
    "confirmationPolicy": "suggestions-only",
    "sources": []
  }
}
```

Required request rules:

- `promptId` must exist in the prompt registry.
- `contextPacket.version` must be `stage-20-context-v1`.
- First behavior may include only `current-route`, `typed-capture`, and optional `demo-fixture`.
- Request must include source IDs and source labels.
- Request must not include auth/session payloads, secrets, raw Firebase users, broad database exports, exact addresses, device location, map/geocoding data, email/calendar sync data, payment/billing data, medical/legal/government ID data, deleted/archived/private hidden items, or real personal data in fixtures.

## Response Validation

The gateway response must pass the Stage 20 output validator before the browser sees it.

Required response rules:

- Output version must match the known Stage 20 model output version.
- Prompt ID must be known.
- Output schema must be known.
- Intent must be known.
- Confidence must be known.
- State must be draft, preview, or needs-review.
- Destination label must be known.
- Sources must be present.
- Editable fields must be typed.
- Confirmation object must be present and explicit.
- Warnings must be an array.

Reject output that claims:

- Automatic saving.
- Email/text/call/message sending.
- Calendar creation or scheduling.
- Notification creation.
- Reminder creation.
- Real memory.
- Hidden reads.
- Background work.
- Sync.
- Geocoding.
- Device location.
- External actions.

Downgrade action-like wording to needs-review before rendering.

## Secret Storage

Secrets must live only in approved server-side secret storage.

Allowed later locations:

- Server runtime secret manager.
- Server-only environment variables configured outside source control.
- Provider-specific secret storage controlled by deployment infrastructure.

Forbidden locations:

- Frontend source.
- Frontend `.env` files.
- Committed backend files.
- Docs.
- Test fixtures.
- Browser local storage.
- Firebase client config.
- Generated assets.
- Logs.
- GitHub issue text or status reports.

Stage 21 does not create any secrets.

## Logging And Privacy Rules

Default logging should be metadata-only.

Allowed logs:

- Request ID.
- Timestamp.
- User/account ID hash or internal ID only if needed for rate limits.
- Prompt ID.
- Surface.
- Context source types.
- Token estimate.
- Latency.
- Validation result.
- Fallback reason.
- Error class.

Do not log by default:

- Raw typed capture.
- Note bodies.
- Task notes.
- Contact names/place labels.
- Prompt-completed text.
- Provider raw response.
- Secrets.
- Auth/session payloads.
- Full context packets.

If a future debugging mode needs raw payloads, it must be opt-in, time-limited, redacted where possible, excluded from production by default, and documented before use.

Retention rule: keep gateway logs short-lived and operational. Do not build a long-term personal-data log trail as part of the first model gateway.

## Rate Limits And Spend Controls

The gateway must control cost and abuse before any provider call.

Required controls:

- Per-user daily request cap.
- Per-user short-window throttle.
- Per-surface cap for first behavior.
- Maximum context packet source count.
- Maximum typed-capture length.
- Maximum prompt and output token budget.
- Timeout and retry limit.
- Circuit breaker after provider errors.
- Disable switch for AI gateway.
- Spend budget alert.
- No automatic background retries.

First behavior should fail closed: if rate limit, budget, timeout, provider error, or validation failure occurs, render local fallback.

## Fallback Behavior

Fallback behavior must stay useful and calm.

Required fallback:

- Keep typed capture text.
- Keep deterministic local classifier.
- Keep local draft preview.
- Keep manual task save path.
- Keep manual note save path.
- Show a short message such as `Live AI is unavailable. Local suggestions still work.`
- Do not loop retries.
- Do not invent model output.
- Do not block Today, Inbox, Plan, Notes, Contacts, Settings, or Command.

## Approval-First Action Rules

Model output may propose only suggestions.

The gateway and browser must not perform:

- Hidden writes.
- Hidden reads.
- Automatic task save.
- Automatic note save.
- Plan save.
- Reminder save.
- Follow-up save.
- Email/text/call/message sending.
- Notification scheduling.
- Calendar sync.
- Map/geocoding lookup.
- Real memory creation.
- Archive/delete/clear/overwrite.

Any future save must use an existing approved save lane or a separately approved stage.

## Stage 21 Done Signal

Stage 21 is complete when EasyLife has:

- A server gateway plan.
- A first behavior decision.
- A request-envelope design using Stage 20 context packets.
- A response-validation design using Stage 20 output validation.
- Secret and logging rules.
- Rate limit and spend controls.
- Fallback behavior.
- Exactly five bounded next tasks.

Stage 21 does not turn on AI. It makes the first safe implementation stage possible.

## Blunt Verdict

EasyLife may plan a server-only AI gateway for one suggestion-only Inbox behavior.

EasyLife must not implement live model calls yet. The next implementation must first create contracts, tests, and a mock gateway path before any provider integration.
