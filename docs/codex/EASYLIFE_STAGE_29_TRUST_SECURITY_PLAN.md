# EasyLife Stage 29 Trust And Security Hardening Plan

Date: 2026-05-17

Stage 28 verdict: `READY_FOR_STAGE_29_TRUST_SECURITY_HARDENING`

## Mission

Harden trust, security, privacy, and failure boundaries for the private-alpha Inbox assistant lane before any broader assistant expansion.

Stage 29 is not an AI expansion stage. It is a proof-and-guardrail stage for the existing `/app/easylist/add?demo=1` assistant lane.

## Current Approved Lane

- Route: `/app/easylist/add?demo=1`
- Behavior: Inbox typed-capture suggestion only
- Prompt: `intake-suggestion`
- Input: synthetic/demo or explicitly controlled private-alpha typed capture only
- Output: must pass the Stage 20 output validator before display
- Save boundary: no save unless the user uses an existing explicit save path
- Provider state: no broad provider rollout, no frontend key, no hidden write, no external action

## What Stage 29 Must Prove

Stage 29 must prove:

- Provider secrets are not exposed in frontend code, bundles, docs, fixtures, generated assets, or committed files.
- Browser-exposed `VITE_` variables are not treated as safe provider-secret storage.
- Assistant logging stays metadata-only by default.
- Bug reports and screenshots avoid raw private typed input, contact details, exact places, secrets, tokens, account info, environment variables, and network payloads.
- Hostile typed capture cannot make the assistant claim saving, sending, scheduling, syncing, notifications, real memory, geocoding, device location, secret access, hidden reads, hidden writes, or external actions.
- The disabled/kill-switch path leaves typed capture and manual save paths usable.
- Private alpha review has a clear go/no-go checklist.

## Parked Work

Keep parked:

- Broad chat
- Real user data by default
- Frontend API keys
- Provider keys in docs, logs, commits, fixtures, or screenshots
- Hidden reads
- Hidden writes
- Automatic saves
- Email, text, call, or message sending
- Scheduling, syncing, notifications, calendar changes
- Real memory
- Geocoding, device location, exact addresses
- External actions
- Saved-object expansion
- Deploy changes
- Package/dependency changes
- Generated output
- Provider SDKs
- Production rollout

## Stage 29 Task Plan

1. Secret and frontend bundle/key scan.
2. Logging redaction proof.
3. Hidden-write and external-action audit.
4. Rollback/kill-switch checklist and disabled-state proof.
5. Stage 29 private-alpha readiness proof packet.

## Acceptance

- `npm.cmd run build` passes from `app-vNext`.
- `docs/codex/NEXT_5_TASKS.md` contains exactly five bounded Stage 29 tasks.
- No app capability expansion is introduced by this planning packet.
- No deployment, provider SDK, API key, backend config, dependency, package file, generated output, secret, hidden write, external action, real memory, notification, calendar sync, geocoding, or saved-object expansion is added.

## Exit Criteria

Stage 29 can end `READY_FOR_STAGE_30_PRIVATE_ALPHA_REVIEW_GATE` only if:

- Secret exposure proof is clean.
- Frontend bundle/key scan is clean.
- Logging redaction proof is complete.
- Hidden-write and external-action audit is complete.
- Kill-switch/fallback proof is complete.
- Private-alpha review checklist is practical and still forbids broad AI claims.

If any of those are incomplete, end `NOT_READY_FOR_STAGE_30`.
