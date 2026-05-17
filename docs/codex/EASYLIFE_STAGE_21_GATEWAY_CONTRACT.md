# EasyLife Stage 21 Gateway Contract

Created At: 2026-05-17

Verdict: `GATEWAY_CONTRACT_READY`

## Mission

Define the exact server gateway endpoint contract for the first model-backed assistant behavior.

This is a contract only. It does not add a route, backend service, provider SDK, API key, Firebase config, dependency, package file, deploy config, generated output, secret, or live model call.

## First Behavior

Allowed behavior: `Inbox typed-capture suggestion`

The browser may submit one user-typed Inbox capture string as a Stage 20 context packet. The future gateway may return one validated assistant suggestion. The suggestion must stay draft, preview, or needs-review until the user explicitly chooses an existing save path.

This contract does not allow:

- Ask-anything chat.
- Whole-app context export.
- Background assistant work.
- Automatic task save.
- Automatic note save.
- Plan save.
- Reminder save.
- Follow-up save.
- Email/text/call/message sending.
- Notification scheduling.
- Calendar sync.
- Maps or geocoding.
- Exact addresses or device location.
- Real AI memory.
- Hidden reads.
- Hidden writes.

## Endpoint

Future endpoint name:

`POST /api/assistant/intake-suggestion`

Endpoint status: planned only.

Allowed prompt ID:

`intake-suggestion`

Allowed surface:

`inbox`

Allowed route:

`/app/easylist/add`

## Request Envelope

Request version:

`stage-21-gateway-request-v1`

The request envelope must wrap a Stage 20 context packet.

```json
{
  "requestVersion": "stage-21-gateway-request-v1",
  "promptId": "intake-suggestion",
  "surface": "inbox",
  "contextPacket": {
    "version": "stage-20-context-v1",
    "requestId": "assistant-request-123",
    "route": {
      "routeId": "inbox",
      "routeLabel": "Inbox",
      "path": "/app/easylist/add"
    },
    "readPolicy": "minimum-needed-only",
    "confirmationPolicy": "suggestions-only",
    "sources": [
      {
        "id": "assistant-request-123-route",
        "sourceType": "current-route",
        "sourceLabel": "Current route",
        "routeId": "inbox",
        "routeLabel": "Inbox",
        "path": "/app/easylist/add"
      },
      {
        "id": "typed-capture-1",
        "sourceType": "typed-capture",
        "sourceLabel": "Typed capture",
        "text": "Reply to Maya about Friday plans",
        "state": "draft"
      }
    ]
  }
}
```

## Request Rules

The gateway must reject the request before any provider call if:

- `requestVersion` is not `stage-21-gateway-request-v1`.
- `promptId` is not `intake-suggestion`.
- `surface` is not `inbox`.
- `contextPacket.version` is not `stage-20-context-v1`.
- `contextPacket.route.routeId` is not `inbox`.
- `contextPacket.readPolicy` is not `minimum-needed-only`.
- `contextPacket.confirmationPolicy` is not `suggestions-only`.
- `contextPacket.sources` omits source labels.
- `contextPacket.sources` contains more than current route, typed capture, and optional demo fixture.
- Typed capture text is empty after trimming.
- Typed capture text exceeds the future gateway length limit.
- Any forbidden Stage 20 source type or forbidden key pattern appears.

Forbidden request content:

- Auth/session payloads.
- API keys or secrets.
- Raw Firebase users.
- Broad app exports.
- Database dumps.
- Email inbox data.
- Calendar sync payloads.
- Payment or billing data.
- Medical, legal, government ID, SSN, or sensitive identity data.
- Exact street addresses.
- Device location.
- Latitude/longitude.
- Map/geocoding data.
- Deleted, archived, trashed, private, or hidden items that the user did not explicitly open.
- Real personal data in fixtures.

## Response Envelope

Response version:

`stage-21-gateway-response-v1`

The gateway may return only validated Stage 20 output or a fallback/error state.

Accepted response shape:

```json
{
  "responseVersion": "stage-21-gateway-response-v1",
  "requestId": "assistant-request-123",
  "status": "ok",
  "validationState": "accepted",
  "fallback": null,
  "output": {
    "version": "stage-20-output-v1",
    "promptId": "intake-suggestion",
    "outputSchemaName": "AssistantIntakeSuggestionOutputV1",
    "intent": "follow-up",
    "confidence": "likely",
    "state": "draft",
    "destinationLabel": "Follow-up preview only",
    "title": "Reply to Maya about Friday plans",
    "summary": "Looks like something to follow up on.",
    "sources": [
      {
        "sourceId": "typed-capture-1",
        "sourceLabel": "Typed capture"
      }
    ],
    "fields": [
      {
        "label": "Follow-up",
        "value": "Reply to Maya about Friday plans",
        "editable": true
      }
    ],
    "confirmation": {
      "required": true,
      "label": "Preview only",
      "copy": "Review this suggestion. Nothing is sent, scheduled, or saved."
    },
    "warnings": []
  }
}
```

## Response Validation Rules

The server must run the Stage 20 output validator before returning `status: ok`.

The response must be rejected or downgraded if output claims:

- Automatic saving.
- Task already saved.
- Note already saved.
- Email/text/call/message sending.
- Calendar event creation.
- Notification creation.
- Reminder creation.
- Real memory.
- Hidden reads.
- Background work.
- Sync.
- Geocoding.
- Device location.
- External actions.

Allowed `validationState` values:

- `accepted`
- `downgraded`
- `rejected`

If validation is `downgraded`, the browser must render the suggestion as `needs-review` and must not offer a direct save action from the model wording.

If validation is `rejected`, the browser must render fallback and preserve the typed capture.

## Error States

The gateway should use stable error codes so the browser can show calm fallback copy.

| Code | Meaning | Browser behavior |
| --- | --- | --- |
| `invalid-request` | Envelope is malformed or wrong version | Keep typed capture and show local fallback |
| `unsupported-prompt` | Prompt ID is not `intake-suggestion` | Keep typed capture and show local fallback |
| `forbidden-context` | Context contains forbidden source/key/data | Keep typed capture, show local fallback, do not retry |
| `too-large` | Capture/context exceeds size limit | Keep typed capture, ask user to shorten |
| `rate-limited` | User or surface cap reached | Keep local classifier and show rate-limit fallback |
| `ai-disabled` | Gateway disabled or kill switch on | Use deterministic local fallback |
| `provider-timeout` | Provider call timed out | Use deterministic local fallback |
| `provider-error` | Provider call failed | Use deterministic local fallback |
| `validation-rejected` | Output failed Stage 20 validator | Use deterministic local fallback |
| `server-error` | Unexpected gateway failure | Use deterministic local fallback |

## Fallback States

Allowed fallback states:

- `local-classifier`
- `ai-disabled`
- `rate-limited`
- `timeout`
- `validation-rejected`
- `server-error`

Fallback response shape:

```json
{
  "responseVersion": "stage-21-gateway-response-v1",
  "requestId": "assistant-request-123",
  "status": "fallback",
  "validationState": "rejected",
  "fallback": {
    "state": "local-classifier",
    "copy": "Live AI is unavailable. Local suggestions still work.",
    "preserveTypedCapture": true
  },
  "output": null
}
```

Fallback must:

- Preserve typed capture text.
- Keep deterministic local classifier available.
- Keep local draft preview available.
- Keep manual task save available.
- Keep manual note/context save available.
- Avoid retry loops.
- Avoid invented model output.

## Browser Rendering Rules

The browser may render:

- Source label.
- Draft/preview/needs-review state.
- Destination label.
- Editable fields.
- Confirmation copy.
- Warnings.
- Fallback copy.

The browser must not render a server output as saved work unless the user later uses an existing approved save path.

## Security Boundary

Frontend API keys remain forbidden.

Provider secrets must never appear in:

- Frontend source.
- Frontend environment variables.
- Docs.
- Fixtures.
- Browser storage.
- Logs.
- Generated assets.
- Public config.
- GitHub status reports.

## Done Signal

This contract is ready when:

- The endpoint is named.
- The only allowed prompt ID is named.
- The request envelope uses Stage 20 context packets.
- The response envelope uses Stage 20 model output validation.
- Error and fallback states are explicit.
- Ask-anything and broad app-context language are absent.

Final verdict: `GATEWAY_CONTRACT_READY`
