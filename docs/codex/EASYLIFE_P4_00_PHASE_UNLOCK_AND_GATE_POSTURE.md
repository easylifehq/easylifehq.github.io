# EasyLife P4-00 Phase Unlock And Gate Posture

Date: 2026-05-31

Status: P4_00_COMPLETE

## Verdict

P4 is unlocked for supervised capability activation, but no live capability is approved by this task.

The strict P4 order is:

1. One narrow real AI/provider Inbox typed-capture suggestion gate.
2. AI lane proof/checkpoint.
3. One true push synthetic/manual test gate.
4. Final P4 handoff/audit prompt.

## Current Baseline

P3.5 ended with `P3_5_FINAL_HANDOFF_COMPLETE` in `docs/codex/EASYLIFE_P3_5_FINAL_NO_EXTERNAL_AUDIT_HANDOFF.md`.

The app is demo-ready for Spencer's solo use. P4 changes the posture from "demo hardening only" to "supervised capability activation," but keeps the same trust-first discipline:

- no hidden writes
- no automatic saves
- no automatic scheduling
- no broad chat
- no external sends
- no external sync
- no real private payloads by default
- no deploy without separate explicit approval
- no repo-stored secrets, provider keys, push credentials, or token records

## AI/Provider Gate Posture

Source: `docs/codex/EASYLIFE_P2_REAL_AI_PROVIDER_SUPERVISED_GATE.md`

The first AI lane must remain:

- Route: Inbox typed capture, with the proven route family around `/app/easylist/add?demo=1`.
- Prompt: `intake-suggestion`.
- Input: synthetic/demo typed capture first, or explicitly approved private-alpha typed capture later.
- Runtime: server-only provider call.
- Key handling: no frontend provider key and no provider key in repo.
- Output: quarantined and validated before display.
- UX: suggestion-only, editable, and review-first.
- Storage: no automatic save and no hidden write.
- External actions: none.

This P4-00 task does not approve:

- a live provider call
- provider SDK/package changes
- env/secrets work
- deploy work
- broad chat
- real memory
- hidden reads
- hidden writes
- automatic saves
- external actions

## Push Gate Posture

Source: `docs/codex/EASYLIFE_P2_TRUE_PUSH_NOTIFICATION_SUPERVISED_GATE.md`

True push remains second in P4. It may not start until the AI lane reaches its checkpoint.

The first push lane must remain:

- one manually triggered synthetic push test only
- user-initiated permission flow
- no automatic reminder jobs
- no user-content payloads
- no token storage until separately approved by the exact gate
- no server push send until a separately approved deploy/test prompt
- kill switch and rollback first
- metadata-only logging

This P4-00 task does not approve:

- Firebase Messaging implementation
- token storage
- live push sending
- service-worker push handling
- automatic reminder scheduling
- user-content push payloads
- deploy work
- env/secrets work

## Parked Capabilities

The following remain parked unless Spencer separately approves that exact gate:

- calendar sync
- geocoding/maps
- email/text sending
- contact import/sync
- account deletion backend
- hidden writes
- token storage
- automatic scheduling
- broad assistant chat
- real memory
- external actions
- Firebase rules/auth policy/billing/DNS/secrets/env work
- package/dependency changes
- deploy config changes
- generated output

## Required Task Discipline For P4

Every P4 task must answer:

1. What exact capability is being unlocked, if any?
2. What remains disabled by default?
3. What explicit approval is still required before live behavior?
4. What data is allowed into the lane?
5. What data is forbidden?
6. What writes are allowed?
7. What rollback or kill switch exists?
8. What user-visible copy prevents overclaiming?

## Build

Not run. This was a docs-only gate posture task with no app code changes.

## Boundary Proof

- No app source code was changed.
- No server/function source code was changed.
- No Firebase rules, auth policy, billing, DNS, secrets, env files, package/dependency files, deploy config, or generated output were touched.
- No deploy was run.
- No provider call was made.
- No push notification was sent.
- No token was stored.
- No calendar sync, geocoding/maps, email/text sending, account deletion backend, contact sync, hidden write, automatic scheduling, or external action was added.

## Next Task

Proceed to P4-01: create the real AI/provider Inbox approval and boundary record for exactly one typed-capture suggestion lane.
