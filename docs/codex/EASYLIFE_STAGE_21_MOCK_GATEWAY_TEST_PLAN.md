# EasyLife Stage 21 Mock Gateway Test Plan

Created At: 2026-05-17

Verdict: `MOCK_GATEWAY_TEST_PLAN_READY`

## Mission

Define a no-provider mock gateway test plan before any real model integration exists.

This is a planning contract only. It does not add live model calls, provider SDKs, API keys, backend services, Firebase config, dependencies, package files, deploy config, generated output, secrets, external actions, hidden writes, or real personal data.

## Test Target

The first mock gateway target is the planned server-only behavior:

`POST /api/assistant/intake-suggestion`

Allowed prompt ID:

`intake-suggestion`

Allowed behavior:

`Inbox typed-capture suggestion`

The mock must prove the future gateway can accept a bounded request, produce or simulate a safe output, validate it with the Stage 20 output validator, and fall back locally when anything fails.

## Required Stage 20 Contracts

The mock test plan must use these existing Stage 20 contracts:

- Context packet version: `stage-20-context-v1`
- Prompt registry version: `stage-20-prompts-v1`
- Output version: `stage-20-output-v1`
- Output validator: `validateAssistantModelOutput`

Allowed Stage 20 prompt IDs:

- `intake-suggestion`
- `today-context-read`
- `plan-capacity-read`
- `note-context-draft`
- `people-place-cue`

The first mock gateway may execute only `intake-suggestion`. Other prompt IDs may appear only in negative tests proving unsupported prompt/surface handling for this endpoint.

## Mock Request Fixture Shape

Every mock request fixture must wrap a Stage 20 context packet.

Accepted first-behavior fixture:

```json
{
  "requestVersion": "stage-21-gateway-request-v1",
  "promptId": "intake-suggestion",
  "surface": "inbox",
  "contextPacket": {
    "version": "stage-20-context-v1",
    "requestId": "mock-request-001",
    "route": {
      "routeId": "inbox",
      "routeLabel": "Inbox",
      "path": "/app/easylist/add"
    },
    "readPolicy": "minimum-needed-only",
    "confirmationPolicy": "suggestions-only",
    "sources": [
      {
        "id": "mock-request-001-route",
        "sourceType": "current-route",
        "sourceLabel": "Current route",
        "routeId": "inbox",
        "routeLabel": "Inbox",
        "path": "/app/easylist/add"
      },
      {
        "id": "mock-typed-capture-001",
        "sourceType": "typed-capture",
        "sourceLabel": "Typed capture",
        "text": "Draft a follow-up task for a demo conversation",
        "state": "draft"
      }
    ]
  }
}
```

Fixture rules:

- Use fictional text only.
- Use no contact names, real place labels, note bodies, task notes, auth/session payloads, secrets, exact addresses, device location, provider payloads, or full app exports.
- Use only `current-route`, `typed-capture`, and optional `demo-fixture` sources for the first behavior.
- Do not add provider-specific fields, model names, vendor response shapes, or SDK fixtures.

## Mock Response Fixture Shape

Every mock response must pass through `validateAssistantModelOutput` before the browser or gateway wrapper treats it as usable.

Accepted response fixture:

```json
{
  "version": "stage-20-output-v1",
  "promptId": "intake-suggestion",
  "outputSchemaName": "AssistantIntakeSuggestionOutputV1",
  "intent": "task",
  "confidence": "medium",
  "state": "draft",
  "destinationLabel": "Inbox task draft",
  "title": "Follow up on demo conversation",
  "summary": "Looks like a task draft from the typed capture.",
  "sources": [
    {
      "sourceId": "mock-typed-capture-001",
      "sourceLabel": "Typed capture"
    }
  ],
  "fields": [
    {
      "label": "Task",
      "value": "Follow up on demo conversation",
      "editable": true
    }
  ],
  "confirmation": {
    "required": true,
    "label": "Final confirmation required",
    "copy": "Review this task draft before saving anything."
  },
  "warnings": []
}
```

## Accepted Output Cases

Accepted cases must validate as `accepted` through Stage 20 output validation.

Required accepted cases:

1. `accepted-task-draft`
   - prompt ID: `intake-suggestion`
   - schema: `AssistantIntakeSuggestionOutputV1`
   - intent: `task`
   - state: `draft`
   - destination: `Inbox task draft`
   - confirmation: `Final confirmation required`

2. `accepted-note-preview`
   - prompt ID: `intake-suggestion`
   - schema: `AssistantIntakeSuggestionOutputV1`
   - intent: `note`
   - state: `preview`
   - destination: `Notes context draft`
   - confirmation: `Review only` or `Preview only`

3. `accepted-follow-up-preview`
   - prompt ID: `intake-suggestion`
   - schema: `AssistantIntakeSuggestionOutputV1`
   - intent: `follow-up`
   - state: `preview`
   - destination: `Follow-up preview only`
   - confirmation: `Preview only`
   - must say nothing was sent or saved

4. `accepted-unsure-needs-review`
   - prompt ID: `intake-suggestion`
   - schema: `AssistantIntakeSuggestionOutputV1`
   - intent: `unsure`
   - state: `needs-review`
   - destination: `Needs review`
   - confirmation: `Review only`

Acceptance proof:

- all accepted outputs include sources
- all accepted outputs include editable fields
- all accepted outputs require confirmation
- no accepted output claims automatic saving, sending, scheduling, syncing, geocoding, real memory, hidden reads, or background work

## Rejected Output Cases

Rejected cases must validate as `rejected` through Stage 20 output validation or be rejected before validation because the request is not allowed.

Required rejected cases:

1. `rejected-hidden-autosave`
   - output claims `task saved`, `automatically saved`, or `I saved`
   - expected result: rejected

2. `rejected-external-action`
   - output claims email/text/call/message sending
   - expected result: rejected

3. `rejected-calendar-or-notification-action`
   - output claims calendar event creation, notification creation, reminder creation, or scheduled event
   - expected result: rejected

4. `rejected-real-memory`
   - output claims memory was created, saved, updated, or real memory exists
   - expected result: rejected

5. `rejected-unsupported-prompt`
   - request uses a prompt ID other than `intake-suggestion` for this endpoint
   - expected result: rejected before provider/mock response

6. `rejected-forbidden-context`
   - context packet contains broad app export, auth/session payload, secret, exact address, device location, email inbox body, calendar sync payload, raw database dump, or real personal data in fixture
   - expected result: rejected before provider/mock response

7. `rejected-missing-confirmation`
   - output omits confirmation or sets `required` to false
   - expected result: rejected

## Downgraded Output Cases

Downgraded cases must validate as `downgraded` and return a `needs-review` output.

Required downgraded cases:

1. `downgraded-ready-to-save`
   - output says `ready to save`
   - expected result: state becomes `needs-review`
   - destination becomes `Needs review`

2. `downgraded-saved-to-language`
   - output uses ambiguous `saved to` phrasing without a direct forbidden hidden-action claim
   - expected result: state becomes `needs-review`
   - warning explains action-like wording

3. `downgraded-scheduled-language`
   - output uses vague `scheduled` wording without an actual event creation claim
   - expected result: state becomes `needs-review`
   - direct save actions are not offered from model wording

Downgrade proof:

- downgraded output never bypasses the Stage 20 output validator
- downgraded output is rendered as review-only
- downgraded output never triggers save, send, sync, schedule, remember, geocode, notify, or external action

## Timeout And Fallback Cases

The mock plan must prove local fallback before provider integration.

Required timeout/fallback cases:

1. `timeout-before-provider-response`
   - simulated gateway timeout
   - expected result: local fallback, typed capture preserved, no background retry

2. `rate-limit-fallback`
   - simulated daily cap or short-window throttle hit
   - expected result: local fallback before mock response

3. `circuit-open-fallback`
   - simulated circuit breaker open
   - expected result: local fallback, no queued replay

4. `ai-disabled-fallback`
   - simulated kill switch active
   - expected result: stable `ai-disabled` fallback and local deterministic behavior remains available

5. `validation-rejected-fallback`
   - mock output fails validator
   - expected result: local fallback and no retry loop

Fallback must preserve:

- typed capture text locally
- local classifier behavior
- local draft preview
- manual task save path
- manual note/context save path

Fallback must not:

- invent model output
- save data
- send messages
- schedule calendar or notification work
- sync data
- start background retries
- log raw payloads

## No-AI Fallback Proof

The mock plan must prove EasyLife works with AI unavailable.

Required no-AI proof:

- Today can still show local Today review.
- Inbox can still classify typed capture locally.
- Inbox can still show a local draft preview.
- Existing task save path still requires final confirmation.
- Existing note/context save path still requires final confirmation.
- Plan, Notes, Contacts, Settings, and Command are not blocked by AI unavailability.

No-AI copy should stay short:

`Live AI is unavailable. Local suggestions still work.`

## Test Matrix

| Case group | Expected safety state | Provider required? | Validator required? | Fallback required? |
| --- | --- | --- | --- | --- |
| accepted outputs | `accepted` | no | yes | no |
| rejected outputs | `rejected` | no | yes or pre-request reject | yes |
| downgraded outputs | `downgraded` | no | yes | no |
| timeout | fallback | no | no output to validate | yes |
| rate limit | fallback | no | no output to validate | yes |
| circuit open | fallback | no | no output to validate | yes |
| AI disabled | fallback | no | no output to validate | yes |

## Implementation Guardrails For Later

When the mock is eventually implemented, it must:

- live behind the same gateway contract as the future real provider
- use Stage 20 context packet validation
- use Stage 20 prompt IDs
- use Stage 20 output validator fixtures
- never bypass `validateAssistantModelOutput`
- use synthetic examples only
- avoid provider-specific fixture formats
- avoid backend services unless a later stage explicitly approves a mock server implementation
- avoid secrets, API keys, provider SDKs, external calls, generated output, real personal data, hidden reads, hidden writes, and external actions

## Stop Conditions

Stop if:

- the mock can render unvalidated model-shaped output
- the mock requires provider-specific response fields
- the mock stores real user data
- fallback blocks manual task or note/context save
- validation failures retry in a loop
- timeout or rate-limit cases queue invisible work
- test fixtures include real personal data
- context packet tests require broad app export
- output tests imply automatic saving, sending, syncing, scheduling, real memory, geocoding, device location, or external actions

## Done Signal

Stage 21 Task 4 is done when EasyLife has:

- mock request fixture rules using Stage 20 context packets
- mock prompt rules using Stage 20 prompt IDs
- mock response fixture rules using Stage 20 output shapes
- accepted output cases
- rejected output cases
- downgraded output cases
- timeout and fallback cases
- no-AI fallback proof
- a clear ban on provider-specific fixtures and validator bypasses
- proof that no live AI, provider SDK, API key, backend service, dependency, secret, external action, hidden write, or real personal data path was added

## Blunt Verdict

EasyLife can plan a mock gateway only if it proves the exact same safety path the real gateway will use later.

No provider. No shortcuts around validation. No fake saved actions.
