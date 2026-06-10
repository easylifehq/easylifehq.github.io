# EasyLife P4-01 Real AI Inbox Approval And Boundary Record

Date: 2026-05-31

Status: P4_01_COMPLETE

## Verdict

Approved for bounded implementation planning and disabled-by-default preparation of exactly one real AI/provider lane:

`Inbox typed-capture suggestion`

This is not approval to deploy, edit secrets/env files, store provider keys, call a provider, use real private payloads by default, or broaden EasyLife into chat/automation.

## Approved Lane

The only P4 AI lane approved by this record is:

- Surface: Inbox typed capture.
- Route family: `/app/easylist/add?demo=1` and the existing Inbox review surface.
- Prompt id: `intake-suggestion`.
- Behavior: suggest/classify/draft review text for one typed capture.
- UX: review-first, editable, and clearly optional.
- Save behavior: no automatic save; any save must use an existing explicit local save path after user approval.
- External actions: none.

## Allowed Input

Allowed for the first implementation/proof tasks:

- synthetic/demo typed capture
- short manually typed test phrases
- metadata needed to prove route, prompt id, disabled state, fallback state, validation state, and timing

Allowed only after separate explicit approval:

- Spencer's real private typed capture
- private-alpha typed capture
- any broader local context beyond the one visible typed capture

Forbidden:

- hidden reads from notes, tasks, contacts, calendar, workout, settings, or history
- broad workspace context
- raw personal notes or contact details by default
- calendar event descriptions by default
- People names/place labels by default
- workout details by default
- auth/session payloads
- secrets, tokens, keys, or env values

## Output Contract

Provider output, once a later task is allowed to prepare the implementation, must be:

- quarantined before display
- validated against the existing model-output contract
- downgraded to local fallback if invalid, unsafe, too broad, or action-like
- shown as a suggestion/draft only
- clearly labelled as provider-backed only when a provider was actually called
- never treated as saved state until the user explicitly saves through an existing safe flow

The output must not:

- create tasks automatically
- create notes automatically
- schedule calendar blocks
- send email/text
- contact anyone
- trigger push notifications
- sync external systems
- claim real memory
- claim it scanned the user's workspace

## Server And Secret Boundary

Future implementation work may inspect and prepare the existing server-shaped lane only if it stays within P4.

Required boundaries:

- provider calls are server-only
- no frontend provider keys
- no provider keys committed to repo
- no env/secrets file edits in this sprint without separate approval
- no package/dependency changes without separate approval
- no Firebase rules/auth policy/billing/DNS changes
- no deploy without a later exact deploy/test prompt

## Disabled-By-Default Requirement

Until Spencer separately approves an exact synthetic provider deploy/test prompt, the provider lane must remain disabled by default.

Required disabled states:

- kill switch closed by default
- provider call state visible as not-called unless actually called in a separately approved test
- local fallback available
- UI copy says nothing is saved or sent automatically
- no hidden writes
- no automatic retry storm

## Rollback And Kill Switch

Minimum rollback posture:

- provider gate can be closed without changing user data
- UI falls back to local rules/no-AI copy
- invalid provider output is discarded or downgraded
- provider-call proof logs only metadata
- no saved user object depends on provider output unless the user explicitly saved it through an existing local flow

## Required Later Approvals

Still required before any live provider call:

1. Provider choice.
2. Server-side secret storage mechanism.
3. Spend cap and rate limit.
4. Kill switch state.
5. Metadata-only logging policy.
6. Exact route and prompt.
7. Exact synthetic/demo input.
8. Output quarantine and fallback proof.
9. Rollback plan.
10. No frontend provider keys proof.
11. No hidden reads, hidden writes, real memory, or external actions proof.
12. Exact deploy/test prompt from Spencer.

## Explicit Non-Goals

This record does not approve:

- live AI/provider calls
- deploys
- env/secrets edits
- provider SDK/package changes
- Firebase rules/auth policy/billing/DNS changes
- broad chat
- real memory
- hidden reads
- hidden writes
- automatic saves
- automatic scheduling
- email/text sending
- calendar sync
- geocoding/maps
- contact sync
- account deletion backend
- true push
- external actions

## Build

Not run. This was a docs-only approval and boundary record with no app code changes.

## Boundary Proof

- No app source code was changed.
- No server/function source code was changed.
- No Firebase rules, auth policy, billing, DNS, secrets, env files, package/dependency files, deploy config, or generated output were touched.
- No deploy was run.
- No provider call was made.
- No provider key was stored.
- No hidden write, hidden read, automatic scheduling, external action, calendar sync, geocoding/maps, email/text sending, contact sync, account deletion backend, or true push behavior was added.

## Next Task

Proceed to P4-02: inspect the existing assistant/provider gateway code and docs, identify the minimum disabled-by-default implementation surface, and produce the server-call contract audit before editing any server/function code.
