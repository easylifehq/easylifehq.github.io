# EasyLife Stage 28 Assistant Reliability Plan

Status: `STAGE_28_PACKET_READY`

Created: 2026-05-17

## Mission

Harden the proven Inbox assistant lane before expanding capability.

Stage 28 is not an expansion stage. It keeps EasyLife inside the private-alpha Inbox typed-capture suggestion lane and makes that lane harder to break, easier to test, and easier for alpha testers to report on.

## Source Gate

Stage 27 proof verdict: `READY_FOR_STAGE_28_ASSISTANT_RELIABILITY`

Stage 27 proof packet: `docs/codex/EASYLIFE_STAGE_27_PRIVATE_ALPHA_AI_ASSISTANT_PROOF_PACKET.md`

## Reliability Focus

Stage 28 focuses on:

- deterministic retries disabled by default
- validation edge cases
- poor or empty model output handling
- duplicate suggestion prevention
- source and destination consistency
- alpha tester bug report format

## Non-Goals

Do not add:

- broad chat
- real memory
- external actions
- calendar sync
- notifications
- geocoding
- device location
- hidden writes
- saved-object expansion
- provider SDKs
- frontend API keys
- secrets
- deployment changes
- package/dependency changes
- generated output

## Allowed Lane

Only this lane is in scope:

- route: `/app/easylist/add?demo=1`
- surface: Inbox typed-capture suggestion
- prompt ID: `intake-suggestion`
- context: Stage 20 typed-capture context packets
- output: Stage 20 model output validator shapes
- fallback: local deterministic classifier/draft behavior

## Stage 28 Task Shape

1. Fallback and retry reliability matrix
2. Validation edge-case and poor-output handling
3. Duplicate suggestion prevention contract
4. Source/destination consistency hardening
5. Alpha tester bug report format and proof packet

## Done Signal

Stage 28 is done when:

- every fallback state preserves typed capture
- no fallback auto-retries by default
- empty, malformed, vague, unsafe, or overconfident outputs are rejected or downgraded
- duplicate suggestions do not stack into confusing repeated cards
- source/destination labels remain consistent across local, mock, server-adapter mock, and live dry-run lanes
- alpha testers have a concise bug report format
- proof ends with either `READY_FOR_NEXT_AI_GATE` or `NOT_READY_FOR_NEXT_AI_GATE`

## Blunt Boundary

This stage does not make EasyLife a broad AI assistant. It makes the first assistant lane less fragile.

