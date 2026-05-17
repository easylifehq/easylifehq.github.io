# EasyLife Stage 30 Private Alpha Operator Checklist

Date: 2026-05-17

Status: `OPERATOR_CHECKLIST_READY`

Use this checklist before turning on any live AI provider lane. This checklist does not approve broad assistant behavior. It covers only the Inbox typed-capture suggestion lane at `/app/easylist/add?demo=1` with prompt `intake-suggestion`.

## Required Confirmations

- [ ] Provider choice is written down and approved for a private alpha test.
- [ ] Provider secret is stored server-side only as `SERVER_AI_PROVIDER_API_KEY`.
- [ ] No provider key exists in frontend code, `VITE_` variables, docs, fixtures, localStorage, browser logs, screenshots, or commits.
- [ ] Live AI remains disabled by default until the operator intentionally enables the lane.
- [ ] Spend cap is set and small enough for a private alpha mistake.
- [ ] Per-user daily rate limit is set.
- [ ] Short-window throttle is set.
- [ ] Kill switch is tested and can disable the lane immediately.
- [ ] Metadata-only logging is active.
- [ ] Raw typed capture, raw provider responses, secrets, auth/session payloads, note bodies, contact details, calendar contents, and full context packets are not logged by default.
- [ ] First route is exactly `/app/easylist/add?demo=1`.
- [ ] First prompt is exactly `intake-suggestion`.
- [ ] First input class is synthetic/demo typed capture or explicitly approved private-alpha typed capture.
- [ ] Provider request sanitizer is active before any provider call.
- [ ] Provider response quarantine is active before any output can render.
- [ ] Stage 20 output validation is active.
- [ ] Local deterministic fallback remains available.
- [ ] Timeout fallback is tested.
- [ ] Rate-limit fallback is tested.
- [ ] Validation-rejected fallback is tested.
- [ ] Rollback plan is written down.
- [ ] No external actions are enabled.
- [ ] Existing task and note save behavior is unchanged.

## Allowed First Test

- Route: `/app/easylist/add?demo=1`
- Surface: Inbox typed capture
- Prompt: `intake-suggestion`
- Input: synthetic/demo or explicitly approved private-alpha typed capture only
- Output: draft, preview, or needs-review suggestion only
- Save behavior: no automatic save; existing manual save controls only

## Do Not Proceed If

- Any provider secret is browser-exposed or starts with `VITE_`.
- Any provider key appears in source, docs, fixtures, screenshots, logs, commits, or built assets.
- The lane is enabled by default.
- The route is anything other than `/app/easylist/add?demo=1`.
- The prompt is anything other than `intake-suggestion`.
- The request sanitizer allows broad app context, contact details, exact addresses, note bodies, calendar contents, task lists, auth/session data, or secrets.
- The response quarantine allows hidden-write, external-action, real-memory, missing-source, missing-destination, or unsupported-intent output to render as clean.
- Metadata-only logging is not confirmed.
- Kill switch or rollback has not been tested.
- Fallback does not preserve typed capture.
- The change adds broad chat, real memory, email/text sending, notification scheduling, calendar sync, geocoding, device location, hidden writes, automatic saves, saved-object expansion, deploy config, package/dependency changes, or production rollout.

## Operator Verdict

Choose one before any live provider call:

- `APPROVED_FOR_SEPARATELY_SCOPED_PRIVATE_ALPHA_CALL`
- `NOT_APPROVED_FOR_LIVE_AI`

Approval here is approval for one bounded private-alpha call path only. It is not approval for broad AI assistant behavior.
