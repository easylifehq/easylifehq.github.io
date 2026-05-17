# EasyLife Stage 23 Gateway Rollout And Fallback Decision

## Purpose

Define how the future EasyLife AI gateway can be rolled out safely, disabled instantly, and replaced by local fallback without breaking capture, preview, task save, note save, or Today review.

This is a rollout decision only. It does not add live calls, provider SDKs, API keys, backend services, dependencies, package files, deploy config, generated output, or secrets.

## Rollout Verdict

The AI gateway must launch disabled by default.

Every stage must prove:

- The gateway can be turned off instantly.
- Local deterministic fallback still works.
- Typed capture is preserved.
- No background retry or queued replay occurs.
- No provider call happens unless that stage explicitly approves it.
- No model output can save, send, sync, schedule, remember, geocode, notify, or mutate data.

## First Behavior Lock

The rollout applies only to:

- Surface: Inbox typed capture.
- Route: `/app/easylist/add`.
- Prompt ID: `intake-suggestion`.
- Context sources: `current-route`, `typed-capture`, and optional synthetic `demo-fixture`.
- Output: draft, preview, needs-review, downgraded, rejected, or fallback.

No other EasyLife assistant behavior is approved by this rollout decision.

## Disabled-By-Default Launch Posture

Default state:

`AI gateway disabled`

Expected user-facing behavior:

- Inbox still accepts typed capture.
- Local deterministic classifier still runs.
- Local draft preview remains available.
- Task save path remains manual and final-confirmed.
- Note/context save path remains manual and final-confirmed.
- No server provider request is made.

Default copy:

`AI is unavailable. Local draft tools still work; nothing was saved or sent.`

The gateway may not default to live provider calls in dev, preview, staging, or production.

## Kill Switch Expectations

The future gateway must have a server-side kill switch before any live provider call is approved.

Kill switch must:

- Stop provider calls immediately.
- Return an AI-unavailable fallback response.
- Preserve typed capture.
- Keep local fallback behavior available.
- Avoid queued replay after re-enable.
- Avoid automatic background retries.
- Avoid changing task/note save behavior.

Kill switch should be checked:

- Before prompt selection.
- Before provider call.
- Before retry.
- During provider outage handling.

Kill switch must not depend on a frontend-only flag.

## Local Fallback Behavior

Fallback is not failure theater. It is a required product mode.

Fallback must:

- Keep the typed capture visible.
- Keep deterministic local classification available.
- Keep unsaved local draft preview available.
- Keep explicit task save and note/context save flows unchanged.
- Explain why model-backed suggestion is unavailable in one short line.
- Avoid scaring the user.
- Avoid implying a provider tried to save, send, sync, or schedule anything.

Fallback must not:

- Drop the typed capture.
- Clear the form.
- Save anything automatically.
- Retry in the background.
- Queue a provider call for later.
- Replace local draft text with unvalidated provider text.

## Rate And Spend Safety

Before any live provider stage, the gateway must define:

- Per-user daily request cap.
- Short-window throttle.
- Request/context length limit.
- Token/output budget.
- Provider timeout.
- No automatic background retry.
- Circuit breaker.
- Server-side kill switch.
- Spend warning threshold.
- Hard spend cap.
- Metadata-only usage counters.

On rate or spend failure:

- Return fallback.
- Preserve typed capture.
- Do not call provider.
- Do not retry later.
- Do not save or mutate data.

## Staged Testing Order

### Stage A: Local Mock

Status: already proven by Stage 22.

Purpose:

- Exercise request shape.
- Exercise output validation.
- Exercise fallback states.
- Show no-provider behavior in Inbox.

Allowed:

- Local mock gateway.
- Synthetic fixtures.
- Local deterministic fallback.

Forbidden:

- Provider calls.
- Secrets.
- Backend services.
- Deploy config.

Exit criteria:

- Accepted, rejected, downgraded, timeout, fallback, and no-AI cases are proven.
- Inbox shows no-provider labeling.
- Build passes.

### Stage B: Server Adapter Mock

Purpose:

- Prove the server-shaped boundary without a provider.
- Prove request validation, prompt allowlist, output validation, fallback, and disabled states can exist behind an adapter.

Allowed:

- TypeScript/local adapter shell.
- No-provider mock handler.
- Safety tests.
- Inbox label showing `Server adapter mock`.

Forbidden:

- Provider SDKs.
- API keys.
- Live calls.
- Firebase config changes.
- Deploy config.
- Production backend behavior.
- Secrets.

Exit criteria:

- Safe requests pass.
- Unsafe requests reject.
- Unsafe outputs reject or downgrade.
- Timeout/disabled/rate/fallback states render.
- No provider can be called.

### Stage C: Provider Dry-Run

Purpose:

- Prove a single synthetic typed-capture provider request can pass through the chosen server boundary.

Allowed only after explicit approval:

- Synthetic/demo typed capture.
- Provider call from server only.
- Metadata-only logs.
- Hard spend cap.
- Kill switch enabled and tested.
- Output validator enforced before UI render.

Forbidden:

- Real personal data.
- Broad context.
- Hidden reads.
- Hidden writes.
- External actions.
- Background retries.
- Saved-object expansion.

Exit criteria:

- Provider request uses only approved synthetic context.
- Output validates or falls back.
- Logs contain metadata only.
- Kill switch can disable provider calls.
- Fallback works after disable.

### Stage D: Private User Test

Purpose:

- Let the user test the first real behavior with strict limits.

Allowed only after provider dry-run proof:

- Inbox typed-capture suggestion only.
- Authenticated/private test.
- Low daily cap.
- Short-window throttle.
- Hard spend cap.
- Explicit no-hidden-write UI.

Forbidden:

- Public rollout.
- Other assistant routes.
- Email/calendar/notification/map/memory actions.
- Real external actions.
- Hidden saves.

Exit criteria:

- User understands when AI is unavailable.
- User understands suggestion is draft/preview.
- No hidden writes occur.
- No logs contain raw payload by default.
- Cost and usage stay inside cap.

## Rollback Decision

Rollback must be boring and immediate.

Rollback action:

- Flip server-side kill switch or disable provider calls.
- Return AI-unavailable fallback.
- Keep local deterministic behavior.
- Keep existing manual saves.

Rollback must not:

- Require redeploy as the only stop mechanism.
- Delete user data.
- Queue failed requests for replay.
- Hide the fallback state.
- Change capture/save behavior.

Rollback copy:

`AI is unavailable. Local draft tools still work; nothing was saved or sent.`

## AI Unavailable Behavior

When AI is unavailable, Inbox should still support:

- Typed capture.
- Local intent classification.
- Unsaved draft preview.
- Explicit final task save path.
- Explicit final note/context save path.
- Dismiss/edit/review local states.

AI unavailable should not block:

- Today review.
- Manual task entry.
- Manual note/context entry.
- Plan review.
- Contacts/People + Places review.
- Settings access.

AI unavailable should not imply:

- A provider saved anything.
- A provider sent anything.
- A provider scheduled anything.
- A provider remembered anything.
- A retry will happen later.

## Rollout Decision Matrix

| State | Provider call? | User-facing label | Save behavior | Retry behavior |
| --- | --- | --- | --- | --- |
| Disabled default | No | AI unavailable / local mode | Manual existing saves only | None |
| Local mock | No | Mock gateway / no provider | Manual existing saves only | None |
| Server adapter mock | No | Server adapter mock / no provider | Manual existing saves only | None |
| Provider dry-run | Yes, synthetic only | Provider dry-run | No real user data saves | None |
| Private test | Yes, Inbox only | AI suggestion / draft | Manual existing saves only | No background retry |
| Kill switch on | No | AI unavailable | Manual existing saves only | None |

## Required Proof Before Stage 24

Stage 24 may start only if:

- Architecture ADR exists.
- Gateway boundary exists.
- Threat model exists.
- This rollout/fallback decision exists.
- Stage 24 remains no-provider.
- Stage 24 can represent disabled, timeout, rate-limited, validation-rejected, and fallback states.
- Stage 24 cannot call a provider.
- Stage 24 cannot save data from model output.

## Required Proof Before Stage 25

Stage 25 may start only if:

- Stage 24 server adapter mock proof passes.
- Provider selection rubric is planned.
- Secret management checklist is planned.
- Live-provider dry-run protocol is planned.
- Human approval checklist is planned.
- Rate/spend controls are documented.
- Metadata-only logging is documented.
- Kill switch expectations are documented.
- Fallback behavior is proven.

## Do Not Proceed If

Stop before rollout work if the next step requires:

- Live provider calls.
- Provider SDKs.
- API keys.
- Firebase config changes.
- Backend production behavior.
- Dependencies.
- Package file changes.
- Deploy config.
- Generated output.
- Secrets.
- Real personal data.
- External actions.
- Hidden reads.
- Hidden writes.
- Real memory.
- Saved-object expansion.

## Final Decision

EasyLife's AI gateway should move through local mock, server adapter mock, provider dry-run, and private user test in that order. It must be disabled by default, kill-switchable at the server boundary, and backed by local deterministic fallback. Any stage that cannot preserve fallback, spend/rate safety, metadata-only logs, and approval-first behavior must stop.
