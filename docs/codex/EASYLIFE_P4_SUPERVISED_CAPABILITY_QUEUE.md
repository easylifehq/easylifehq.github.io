# EasyLife P4 Supervised Capability Queue

Date: 2026-05-31

Status: P4_QUEUE_READY

## Goal

Move EasyLife from polished demo readiness into the first real capabilities without breaking trust.

P4 starts with the easiest high-value capability: one narrow real AI/provider Inbox suggestion. After that gate is proven, P4 moves to a true push synthetic test lane.

## Order

1. Real AI/provider Inbox suggestion gate.
2. External audit or internal proof checkpoint for AI behavior.
3. True push synthetic test gate.
4. External audit or internal proof checkpoint for both activated capability lanes.

## P4 Queue

- P4-00 Phase unlock and gate posture.
- P4-01 Real AI/provider Inbox approval and boundary record.
- P4-02 Real AI/provider server-call contract audit.
- P4-03 Real AI/provider disabled-by-default implementation proof.
- P4-04 Inbox review-first AI suggestion UI.
- P4-05 One synthetic provider test readiness proof.
- P4-06 AI lane audit/checkpoint packet.
- P4-07 True push capability and permission audit.
- P4-08 True push client contract and consent UI.
- P4-09 True push disabled server-test-send scaffold proof.
- P4-10 One synthetic push test readiness proof.
- P4-11 Final P4 capability handoff and audit prompt.

## Non-Negotiables

- No hidden writes.
- No automatic saves.
- No automatic scheduling.
- No external sends.
- No broad chat.
- No live private payloads by default.
- No provider keys in frontend code.
- No secrets, env files, DNS, billing, package/dependency, generated output, or deploy work without separate explicit approval.
- No real push payloads with user content.
- No deploy unless Spencer separately approves an exact deploy/test prompt.

## Expected End State

P4 should end with one of these verdicts:

- `READY_FOR_ONE_SYNTHETIC_PROVIDER_TEST_DEPLOY`
- `READY_FOR_ONE_SYNTHETIC_PUSH_TEST_DEPLOY`
- `P4_READY_FOR_EXTERNAL_AUDIT`
- `P4_BLOCKED_NEEDS_REPAIR`
