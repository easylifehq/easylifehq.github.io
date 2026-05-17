# EasyLife Stage 25 Live Provider Dry-Run Protocol

Date: 2026-05-17
Status: PROTOCOL_ONLY

## Mission

Define the exact dry-run protocol for the first live provider test, but do not run it.

This protocol does not add provider SDKs, API keys, backend implementation, dependencies, package files, deploy config, generated output, secrets, or live calls.

## First Dry-Run Behavior

Only this behavior is allowed:

```text
Inbox typed-capture suggestion.
```

Only this route is allowed:

```text
/app/easylist/add?demo=1
```

Only synthetic/demo typed capture is allowed.

## Synthetic Test Input

Use a harmless input like:

```text
Reply to Maya about Friday plans
```

Do not use real emails, real contacts, real notes, real tasks, real addresses, real calendar events, or personal data.

## Expected Request

The request must use the Stage 24 server adapter envelope:

- behavior: `inbox-typed-capture-suggestion`
- promptId: `intake-suggestion`
- surface: `inbox`
- route path starts with `/app/easylist/add`
- context packet contains:
  - current route
  - one typed-capture source
  - optional demo fixture only

Forbidden in request:

- full app context
- note bodies
- contact names/place labels
- calendar details
- auth/session payloads
- secrets
- provider config
- endpoint URLs
- arbitrary prompt text from the browser

## Expected Prompt

Allowed prompt ID:

```text
intake-suggestion
```

Prompt must be selected server-side from the prompt registry.

The browser must not send raw prompt text.

## Expected Response

The response must validate against Stage 20 output validation.

Allowed intents:

- task
- note
- plan
- reminder
- follow-up
- unsure

Allowed states:

- draft
- preview
- needs-review

Required:

- source attribution
- destination label
- confirmation requirement
- no hidden write claim
- no external action claim

## Validation Checks

Before rendering, server and browser must confirm:

- response schema version is expected
- prompt ID is expected
- output schema name is expected
- intent is known
- confidence is known
- state is allowed
- sources are present
- confirmation is required
- forbidden claims are absent

Forbidden claims include:

- saved automatically
- sent an email/text/message
- scheduled a reminder
- synced calendar
- remembered permanently
- used device location
- geocoded an address
- read hidden data
- background work started

## Fallback Checks

Every failure must return local fallback:

- provider unavailable
- timeout
- rate limit
- circuit open
- invalid request
- validation rejected

Fallback must:

- preserve typed capture
- keep deterministic local classifier available
- avoid automatic retries
- avoid hidden writes
- avoid external actions

## Logging Checks

Default logs may include metadata only:

- request ID
- route
- prompt ID
- validation result
- latency bucket
- fallback reason
- response state

Default logs must not include:

- raw typed capture
- note bodies
- task notes
- contact names/place labels
- auth/session payloads
- provider raw responses
- secrets
- full context packets

## Rate And Spend Checks

Before the dry-run:

- daily per-user cap exists
- short-window throttle exists
- timeout exists
- no automatic background retry exists
- circuit breaker exists
- kill switch exists
- spend cap expectation is documented

## Kill Switch Check

Before dry-run:

- prove AI can be disabled
- prove disabled state returns no-AI fallback
- prove UI remains usable with local rules

## Immediate Failure Conditions

Stop immediately if:

- provider key appears in frontend
- raw payload is logged
- request includes broad context
- model output bypasses validation
- output claims an external action
- output claims a hidden write
- fallback loses typed capture
- retry runs automatically
- spend/rate controls are missing
- route behavior expands beyond Inbox typed-capture suggestion

## Stage 26 Entry Condition

Stage 26 may begin only after explicit human approval of:

- provider
- secret store
- spend cap
- logging policy
- fallback behavior
- first prompt
- first route
- rollback plan

## Verdict

Protocol exists, but no live provider dry-run is approved yet.
