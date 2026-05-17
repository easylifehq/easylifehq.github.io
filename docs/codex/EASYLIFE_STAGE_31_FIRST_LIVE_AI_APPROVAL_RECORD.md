# EasyLife Stage 31 First Live AI Approval Record

Date: 2026-05-17

Verdict: `NOT_APPROVED_FOR_LIVE_AI`

## Mission

Create the explicit human approval record required before any first live provider call.

This record does not turn on live AI, does not add a provider SDK, does not store or expose a real API key, and does not approve broad assistant behavior.

## Approval Status

Not approved yet.

Reason: provider choice is still pending. A first live provider call cannot run until the provider is explicitly named and the server-side secret storage path is confirmed.

## Required Confirmations

| Item | Status | Decision |
| --- | --- | --- |
| Provider choice | Pending | Must be explicitly named before any live provider call. |
| Server-side secret placeholder | Confirmed | `SERVER_AI_PROVIDER_API_KEY` |
| Frontend API keys | Forbidden | No provider key may appear in browser code, docs, logs, localStorage, screenshots, generated assets, or commits. |
| `VITE_` provider secrets | Forbidden | `VITE_` variables are browser-exposed and cannot hold provider secrets. |
| First route | Confirmed | `/app/easylist/add?demo=1` |
| First prompt | Confirmed | `intake-suggestion` |
| First behavior | Confirmed | Inbox typed-capture suggestion only. |
| Allowed input | Confirmed | Synthetic/demo typed capture or explicitly approved private-alpha typed capture only. |
| Real user data by default | Forbidden | No real user data may be used by default. |
| Hidden writes | Forbidden | The provider lane may not save, create, edit, archive, send, schedule, sync, remember, or mutate app data. |
| External actions | Forbidden | No email/text/call/message sending, notification scheduling, calendar sync, geocoding, device location, or external action. |

## Spend Cap

Pending final provider choice.

Minimum required before approval:
- a hard daily request cap
- a short-window throttle
- a low private-alpha spend ceiling
- a kill switch that disables the lane without deploy
- no automatic background retries

## Rate Limit

Pending final provider choice.

Minimum required before approval:
- per-user daily cap
- short-window throttle
- provider timeout limit
- no automatic retry loop
- fallback returned when rate-limited

## Kill Switch

Required before approval.

The live provider lane must remain disabled by default and must be disableable instantly. Disabled, circuit-open, rate-limit, timeout, provider-error, invalid-request, and validation-rejected states must preserve typed capture and return local fallback.

## Logging Policy

Metadata-only logging is required.

Forbidden by default:
- raw typed capture
- note bodies
- task notes
- contact names or place labels
- provider raw responses
- full context packets
- auth/session payloads
- secrets, tokens, keys, or environment values

Allowed metadata examples:
- route
- prompt ID
- request class
- validation result
- fallback reason
- provider call state
- sanitizer state
- quarantine state

## Fallback

Local deterministic fallback must remain available.

Fallback must be returned when:
- live AI is disabled
- provider is unconfigured
- approval is missing
- request sanitizer rejects input
- provider times out
- provider returns malformed output
- response quarantine blocks output
- rate limit or circuit breaker is active

## Rollback

Rollback plan:
- disable the live lane with the kill switch
- keep typed capture usable
- keep deterministic local classifier and draft preview usable
- keep task and note save paths unchanged
- do not require deploy to stop live calls
- do not delete user data or mutate saved objects during rollback

## First Call Boundary

If later approved, the first live provider call may only be:
- route: `/app/easylist/add?demo=1`
- prompt: `intake-suggestion`
- behavior: Inbox typed-capture suggestion
- input: synthetic/demo or explicitly approved private-alpha typed capture
- output: suggestion-only, validated and quarantined before display

It must not:
- save a task
- save a note
- schedule a plan
- send a message
- create a notification
- sync a calendar
- geocode a place
- use device location
- claim real memory
- read broad app context
- run in the browser with a frontend key

## Do Not Proceed If

Do not proceed to a live provider call if any of these are true:
- provider choice is pending
- server-side secret storage is unclear
- a provider key would be exposed to the browser
- a `VITE_` provider secret is proposed
- spend cap is missing
- rate limit is missing
- kill switch is missing
- metadata-only logging is not proven
- fallback is broken
- sanitizer can pass broad/private context
- quarantine can render unsafe output
- the route is not `/app/easylist/add?demo=1`
- the prompt is not `intake-suggestion`
- hidden writes or external actions are in scope

## Final Approval Record

Provider choice is pending, so this record does not approve a live provider call.

NOT_APPROVED_FOR_LIVE_AI
