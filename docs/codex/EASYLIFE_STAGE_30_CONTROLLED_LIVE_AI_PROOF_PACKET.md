# EasyLife Stage 30 Controlled Live AI Proof Packet

Date: 2026-05-17

Verdict: `READY_FOR_SEPARATELY_APPROVED_FIRST_LIVE_AI_CALL`

## Mission

Decide whether EasyLife is ready for a separately approved first live AI provider call.

This proof does not implement the live provider call. It proves the guardrails are now strong enough that the next stage can ask for explicit human approval before attempting one narrow server-side provider call.

## Build Result

Passed: `npm.cmd run build` from `app-vNext`.

## Verified Stage 30 Artifacts

- Live AI environment contract: `app-vNext/src/features/assistant/serverGateway/liveAiEnvironment.ts`
- Live AI environment proof fixtures: `app-vNext/src/features/assistant/serverGateway/liveAiEnvironment.test.ts`
- Provider request sanitizer: `app-vNext/src/features/assistant/serverGateway/providerRequestSanitizer.ts`
- Provider request sanitizer proof fixtures: `app-vNext/src/features/assistant/serverGateway/providerRequestSanitizer.test.ts`
- Provider response quarantine: `app-vNext/src/features/assistant/serverGateway/providerResponseQuarantine.ts`
- Provider response quarantine proof fixtures: `app-vNext/src/features/assistant/serverGateway/providerResponseQuarantine.test.ts`
- Private-alpha operator checklist: `docs/codex/EASYLIFE_STAGE_30_PRIVATE_ALPHA_OPERATOR_CHECKLIST.md`

## Live AI Environment Contract

Ready for the next gate.

- Live AI is disabled by default.
- Server-side secret placeholder is `SERVER_AI_PROVIDER_API_KEY`.
- `VITE_` provider secrets are explicitly forbidden.
- Allowed route is only `/app/easylist/add?demo=1`.
- Allowed prompt is only `intake-suggestion`.
- Provider call state labels exist for disabled, blocked-in-browser, server-secret-missing, server-ready-after-human-approval, called-by-server-only, and fallback.
- Browser provider calls and frontend provider SDK assumptions are rejected by contract.

## Provider Request Sanitizer

Ready for the next gate.

- Accepts only Inbox typed-capture suggestion requests.
- Accepts only synthetic/demo typed capture or explicitly approved private-alpha typed capture.
- Preserves prompt ID, route, output schema, bounded source labels, typed-capture text, input class, character/word counts, minimum-needed read policy, and suggestions-only confirmation policy.
- Rejects wrong route, unsupported prompt, generic typed-capture labels, provider key envelopes, `VITE_` key envelopes, contact source, exact street address, email/contact detail capture, note body context, calendar contents, broad task list, and full context packet.
- Errors avoid echoing secret-like values.

## Provider Response Quarantine

Ready for the next gate.

- Uses Stage 20 `validateAssistantModelOutput`.
- Accepted output can pass only after validation.
- Downgraded output can pass only as `needs-review`.
- Malformed output quarantines.
- Hidden-write claims quarantine.
- External-action claims quarantine.
- Real-memory claims quarantine.
- Missing source and missing destination quarantine.
- Unsupported intent quarantines.
- Quarantined output is not renderable as a suggestion and does not expose the raw provider response.

## Private-Alpha Operator Checklist

Ready for the next gate.

The checklist requires a human to confirm:

- provider choice
- server-side secret storage
- spend cap
- rate limit
- kill switch
- metadata-only logging
- no frontend key
- first route
- first prompt
- fallback
- rollback
- no external actions

The checklist includes a `Do Not Proceed If` section and requires one explicit verdict: `APPROVED_FOR_SEPARATELY_SCOPED_PRIVATE_ALPHA_CALL` or `NOT_APPROVED_FOR_LIVE_AI`.

## No Frontend Keys

No frontend AI provider key was added.

The proof scan surfaced:

- expected public Firebase web config in `app-vNext/src/lib/firebase/config.ts`
- deliberate fake secret-like strings inside Stage 30 sanitizer/contract tests
- old CSS/task class-name false positives

No real AI provider key was found or committed by this task.

## No Broad Context

Broad context remains blocked. The sanitizer rejects full context packets, task lists, calendar contents, note bodies, contact source/details, exact addresses, auth/session-like data, and key/token-shaped fields before provider-use summary creation.

## No Hidden Writes Or External Actions

Hidden writes and external actions remain blocked.

- The live AI environment contract keeps `hiddenWritesAllowed` and `externalActionsAllowed` false.
- The response quarantine quarantines hidden-write, external-action, and real-memory claims.
- This proof task made no product behavior changes and no provider calls.

## Local Fallback

Local fallback remains available through the existing Stage 26-29 dry-run and rollback path. Stage 30 did not remove deterministic local classification, local draft previews, task save behavior, note save behavior, or typed-capture preservation.

## Blunt Remaining Risk

EasyLife is not yet a live AI assistant. It is ready for a separately approved first live provider call only because the lane is narrow and guarded:

- one route
- one prompt
- one synthetic/private-alpha input class
- no frontend key
- no hidden writes
- no external actions
- no broad context
- validator and quarantine before display
- local fallback preserved
- explicit human operator approval required

The next task must not be "turn on AI." The next task must be the Stage 31 human approval record.

## Stage 31 Requirement

Stage 31 must require explicit human approval before any live provider call. The approval record must name the provider, secret storage mechanism, spend cap, rate limit, kill switch, logging policy, route, prompt, fallback, rollback, and no-external-action boundary.

## Final Verdict

READY_FOR_SEPARATELY_APPROVED_FIRST_LIVE_AI_CALL
