# EasyLife Stage 22 Mock Server AI Gateway Plan

Created At: 2026-05-17

Verdict: `MOCK_GATEWAY_PACKET_READY`

## Mission

Plan the no-provider mock gateway implementation stage approved by Stage 21.

Stage 22 may implement a local, server-shaped mock gateway path so EasyLife can prove the gateway contract before choosing a real server architecture or connecting a model provider.

Stage 22 must not add live model calls, provider SDKs, API keys, backend services, Firebase config, dependencies, package files, deploy config, generated output, secrets, external actions, hidden reads, hidden writes, real memory, or saved-object expansion.

## Product Boundary

First behavior remains:

`Inbox typed-capture suggestion`

The mock gateway may:

- accept a Stage 21 request envelope
- validate a Stage 20 context packet
- allow only the `intake-suggestion` prompt ID
- produce synthetic no-provider output
- run every output through the Stage 20 output validator
- return accepted, downgraded, rejected, timeout, disabled, rate-limit, circuit-open, or fallback states
- show the result in Inbox as mock/no-provider behavior

The mock gateway must not:

- save anything automatically
- send email, text, calls, or messages
- schedule reminders, notifications, or calendar events
- sync external systems
- create real memory
- read hidden app data
- call a model provider
- store secrets
- bypass Stage 20 validation

## Implementation Shape

Stage 22 should use local TypeScript modules under:

`app-vNext/src/features/assistant/gateway/`

The modules should be server-shaped so the later real gateway can follow the same contracts:

1. Request envelope validation.
2. Context packet validation.
3. Prompt/surface allowlist.
4. Synthetic mock output creation.
5. Stage 20 output validation.
6. Stable fallback states.
7. Inbox preview wiring.

This is not the final server implementation. It is a local proof path.

## Required Contracts

Stage 22 must use:

- Stage 20 context packets: `stage-20-context-v1`
- Stage 20 prompt IDs: `intake-suggestion`
- Stage 20 model output contract: `stage-20-output-v1`
- Stage 20 validator: `validateAssistantModelOutput`
- Stage 21 gateway request envelope: `stage-21-gateway-request-v1`
- Stage 21 first endpoint concept: `POST /api/assistant/intake-suggestion`

## Test Expectations

Stage 22 should prove:

- valid request accepted
- unsupported prompt rejected
- forbidden context rejected
- accepted mock output rendered
- hidden-action output rejected
- action-like wording downgraded
- timeout fallback returned
- rate-limit fallback returned
- circuit-open fallback returned
- AI-disabled fallback returned
- no-AI local behavior remains usable

Tests should use synthetic examples only.

## User-Facing Rule

Only Task 4 is UI-facing.

Inbox may show the mock result, but it must clearly label the behavior as local/mock/no-provider. It must preserve existing task and note save behavior and must not imply live AI is active.

## Stage 22 Tasks

1. Mock gateway request contract.
2. Mock gateway response validator path.
3. Mock gateway fallback states.
4. Inbox mock gateway preview wiring.
5. Stage 22 proof packet.

## Done Signal

Stage 22 is done when EasyLife has:

- local server-shaped request validation
- local server-shaped mock response handling
- Stage 20 output validator proof
- stable fallback states
- Inbox mock preview wiring
- build proof
- proof packet ending with `READY_FOR_STAGE_23_SERVER_ARCHITECTURE_DECISION` or `NOT_READY_FOR_STAGE_23`

## Blunt Verdict

EasyLife may now plan the no-provider mock gateway implementation.

This is still not live AI.
