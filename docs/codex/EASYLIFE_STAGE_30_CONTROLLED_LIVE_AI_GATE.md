# EasyLife Stage 30 Controlled Live AI Gate

Date: 2026-05-17

Status: `STAGE_30_PACKET_READY`

Source verdict: `READY_FOR_STAGE_30_CONTROLLED_LIVE_AI_GATE`

## Mission

Plan the narrowest controlled path from the proven Inbox assistant lane toward live AI.

Stage 30 does not approve a live provider call. It prepares the contracts, sanitizers, quarantine checks, and human operator checklist required before a separately approved first live provider call can happen.

## Allowed Lane

Stage 30 covers only:

- Route: `/app/easylist/add?demo=1`
- Surface: Inbox typed capture
- Prompt: `intake-suggestion`
- Behavior: suggestion-only assistant output
- Input: synthetic/demo or explicitly private-alpha typed capture only
- Output: draft/preview/needs-review suggestion that must pass validation before display

## Required Posture

- Live AI is disabled by default.
- Provider secrets are server-side only.
- Frontend API keys are forbidden.
- Browser-exposed `VITE_` variables may not hold provider secrets.
- Local deterministic fallback remains available.
- Manual task/note save behavior stays unchanged.
- No provider call may run without a later explicit human approval gate.

## Hard No List

Stage 30 must not add:

- broad chat
- broad app context export
- real user data by default
- frontend API keys
- committed provider keys
- provider SDKs
- live provider calls
- backend implementation
- deploy config
- package/dependency changes
- generated output
- hidden reads
- hidden writes
- automatic saves
- email or text sending
- calendar sync
- notification scheduling
- real memory
- geocoding
- device location
- external actions
- saved-object expansion
- production rollout

## Human Approval Required Before First Live Provider Call

Before any real provider call, a human must explicitly approve all of these:

- Provider choice.
- Server-side secret storage mechanism.
- Secret placeholder and runtime environment.
- Spend cap.
- Per-user rate limit.
- Short-window throttle.
- Kill switch.
- Rollback path.
- Metadata-only logging rule.
- Provider request sanitizer.
- Provider response quarantine path.
- First route: `/app/easylist/add?demo=1`.
- First prompt: `intake-suggestion`.
- First input class: synthetic/demo typed capture, or explicitly approved private-alpha typed capture.
- Fallback behavior.
- Failure conditions.

Approval of this Stage 30 packet is not approval to make a live provider call.

## Stage 30 Task Plan

### 1. Live AI Environment Contract

Define a disabled-by-default local TypeScript environment contract for future live AI.

Must prove:

- server-side secret placeholder name only
- disabled-by-default flag
- allowed route `/app/easylist/add?demo=1`
- allowed prompt `intake-suggestion`
- provider call state labels
- `VITE_` provider-secret prohibition

### 2. Provider Request Sanitizer

Create a local sanitizer that accepts only bounded Inbox typed-capture requests and rejects overbroad or private context.

Must reject:

- secrets
- auth/session data
- contact details
- exact addresses
- note bodies
- broad task lists
- calendar contents
- full context packets

### 3. Provider Response Quarantine

Create a local quarantine path for unsafe provider-style output before display.

Must quarantine:

- malformed responses
- hidden-write claims
- external-action claims
- real-memory claims
- missing source/destination
- unsupported intent
- ambiguous action wording

### 4. Private-Alpha Operator Checklist

Create a human checklist for turning on any live AI lane later.

Must cover:

- provider choice
- server-side secret storage
- spend cap
- rate limit
- kill switch
- metadata-only logging
- no frontend key
- first route/prompt
- fallback
- rollback
- no external actions
- do-not-proceed conditions

### 5. Controlled Live AI Proof Packet

Prove whether Stage 30 is ready for a separately approved first live provider call.

Must end with one of:

- `READY_FOR_SEPARATELY_APPROVED_FIRST_LIVE_AI_CALL`
- `NOT_READY_FOR_LIVE_AI`

## Acceptance

- `docs/codex/NEXT_5_TASKS.md` contains exactly five bounded Stage 30 tasks.
- `npm.cmd run build` from `app-vNext` passes.
- No live provider call is added.
- No provider SDK, key, deploy config, backend implementation, dependency, generated output, hidden write, external action, real memory, notification, calendar sync, geocoding, device location, or saved-object expansion is added.

## Blunt Read

EasyLife is not a finished live AI assistant yet.

It is now at the controlled-live-AI gate: the assistant lane is bounded enough to prepare server-side live-provider controls, but the first actual provider call still needs separate explicit approval.
