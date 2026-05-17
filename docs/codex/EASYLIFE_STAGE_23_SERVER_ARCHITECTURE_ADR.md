# ADR: First Server-Only AI Gateway Architecture

Status: Accepted for Stage 23 planning.

Date: 2026-05-17

## Context

EasyLife has reached the point where the assistant can show local deterministic suggestions, no-provider mock gateway responses, validation failures, fallback states, and no-AI behavior. The next product question is not "which model should we call?" It is "where can a future model call safely live?"

The first real model-backed behavior must remain narrow:

Inbox typed-capture suggestion only.

The gateway may eventually receive a bounded Stage 20 context packet for typed capture text, use the reviewed `intake-suggestion` prompt, validate model-shaped output, and return a draft/preview suggestion. It must not save, send, sync, schedule, remember, geocode, use device location, read hidden app data, or perform external actions.

## Decision

Use a narrow Firebase Cloud Function / HTTPS callable gateway as the first server-only AI gateway architecture.

Working gateway name:

`assistantIntakeSuggestion`

This ADR does not implement the gateway. It approves only the architecture direction for future gated work.

## Why This Is The Safest First Path

EasyLife already has Firebase/Auth client concepts and Firestore-adjacent app patterns. A narrowly scoped Firebase Cloud Function can use that existing direction without inventing a broad new backend surface.

The selected architecture gives the first real AI path a server boundary for:

- Provider secret storage.
- Request validation.
- Prompt selection.
- Rate limits.
- Spend controls.
- Metadata-only logging.
- Kill switch behavior.
- Provider timeout handling.
- Stage 20 output validation.
- Local fallback response.

The function must remain a single-purpose gateway for Inbox typed-capture suggestions. It is not permission to build a general assistant backend, broad app context API, or "ask AI anything" route.

## Why Frontend API Keys Remain Forbidden

Frontend API keys are not secrets.

If a provider key is placed in frontend source, Vite public env vars, browser storage, generated assets, source maps, public config, docs, fixtures, logs, screenshots, or network-visible code, it can be extracted.

That creates several unacceptable risks:

- Anyone can use the key outside EasyLife.
- Spend controls can be bypassed.
- Abuse and scraping become harder to stop.
- Provider calls can leak raw user input from the browser.
- Prompt boundaries can be copied and modified.
- Revoking the key becomes an emergency operation instead of a normal rotation.

Any future live provider call must happen server-side only.

## Why Not Static-Only

Static-only is safe for the current deterministic assistant and no-provider mock gateway, but it is not safe for real provider integration.

Static-only cannot protect:

- Provider secrets.
- Per-user rate limits.
- Provider spend caps.
- Metadata-only logging policy.
- Server-side prompt selection.
- Server-side request rejection.
- Provider raw response handling.

Decision: keep static/local behavior for deterministic fallback and UI proof; reject static-only for live provider calls.

## Why Not Broad Backend Expansion

A broad backend would add too much surface area before the first real AI behavior is proven.

Risks of broad expansion:

- More auth/session boundaries to review.
- More logs that could accidentally capture raw personal data.
- More routes that could drift away from approval-first behavior.
- More room for hidden reads or hidden writes.
- More operational work before user value is proven.

Decision: do not build a broad backend. Build, later and only after approval, one narrow gateway endpoint with a fixed prompt ID and fixed request/response contract.

## Alternatives Considered

### Static-only frontend call

Rejected for live provider integration because provider secrets cannot be protected in the browser.

### Local/dev mock adapter

Kept for proof, UI review, validation fixtures, and fallback. It is not a production provider architecture.

### Generic serverless function

Acceptable fallback if Firebase Functions becomes unsuitable. It can protect secrets and enforce the same contract, but it adds auth/session integration work before the first narrow behavior.

### Separate minimal API service

Parked. It may become appropriate when EasyLife needs stronger isolation, multi-provider routing, deeper observability, or heavier controls. It is unnecessary for the first Inbox typed-capture suggestion.

## Required Boundary

Browser may:

- Build a Stage 20 context packet.
- Send typed capture and current route context.
- Render only validated draft/preview/fallback states.
- Keep deterministic local fallback available.

Browser must not:

- Hold provider keys.
- Choose arbitrary prompts.
- Send broad app context.
- Send hidden note/task/contact/calendar data.
- Trust provider-shaped output without validation.
- Save, send, sync, schedule, remember, or mutate data from AI output.

Server gateway may eventually:

- Verify request shape.
- Verify the allowed prompt ID.
- Verify the allowed Inbox surface.
- Enforce rate/spend controls.
- Call a provider with server-held secrets.
- Validate the provider response with Stage 20 output validation.
- Return validated draft/preview output or fallback.

Server gateway must not:

- Accept arbitrary prompts.
- Accept broad app context.
- Log raw typed capture by default.
- Store provider raw responses by default.
- Perform external actions.
- Write user data.
- Create real memory.
- Retry in the background after the user leaves.

## First Behavior Lock

The first real behavior is locked to:

- Surface: Inbox typed capture.
- Prompt ID: `intake-suggestion`.
- Output: draft/preview/needs-review suggestion.
- Confirmation: explicit user approval required before any existing save path is used.
- Fallback: deterministic local assistant behavior remains available.

No other assistant behavior is approved by this ADR.

## Consequences

Positive:

- Provider secrets remain server-side.
- The first live AI path has a clear safety boundary.
- Stage 20 prompt registry and output validator remain the core safety layer.
- Stage 22 mock gateway remains useful for local proof.
- EasyLife avoids frontend-key shortcuts.

Tradeoffs:

- Firebase Function implementation will need a later explicit gate.
- Secret storage and runtime config must be planned before provider work.
- Local static hosting alone cannot provide live AI.
- The first gateway behavior is intentionally narrow.

## Stage 24 Implication

Stage 24 may implement a no-provider server adapter shell/mock path that matches this boundary.

Stage 24 must not add:

- Live provider calls.
- Provider SDKs.
- API keys.
- Firebase config changes.
- Dependencies.
- Package file changes.
- Deploy config.
- Backend production behavior.
- Secrets.
- External actions.
- Hidden reads.
- Hidden writes.
- Real memory.
- Saved-object expansion.

## Review Questions

- Does the selected architecture keep provider secrets out of frontend code?
- Does it preserve Inbox typed-capture as the only first behavior?
- Does it keep request validation before any provider call?
- Does it keep output validation before browser render?
- Does it preserve local fallback if AI is unavailable?
- Does it avoid creating a broad backend before user value is proven?

## Final ADR Statement

EasyLife should use a narrow Firebase Cloud Function / HTTPS callable gateway for its first real AI provider integration. This is safer than static-only provider calls because secrets stay server-side, and safer than broad backend expansion because the first behavior remains fixed, reviewable, approval-first, and reversible.
