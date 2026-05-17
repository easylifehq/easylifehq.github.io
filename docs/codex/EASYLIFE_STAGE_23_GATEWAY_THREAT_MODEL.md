# EasyLife Stage 23 AI Gateway Threat Model

## Purpose

Name the realistic ways the future EasyLife AI gateway can fail before any live model integration exists.

This threat model is intentionally blunt. It does not approve code, provider SDKs, API keys, dependencies, backend config, deploy config, generated output, secrets, live calls, external actions, hidden reads, hidden writes, real memory, or saved-object expansion.

## System In Scope

Future first gateway:

- Runtime: narrow Firebase Cloud Function / HTTPS callable gateway.
- First behavior: Inbox typed-capture suggestion only.
- Prompt ID: `intake-suggestion`.
- Context contract: `stage-20-context-v1`.
- Prompt registry: `stage-20-prompts-v1`.
- Output validation: `validateAssistantModelOutput`.
- Response shape: draft, preview, needs-review, downgraded, rejected, or fallback.

## System Out Of Scope

Not approved:

- General "ask AI anything."
- Reading full app data.
- Reading hidden tasks, notes, calendars, contacts, or Firebase records.
- Saving data from model output.
- Sending email, texts, calls, or messages.
- Calendar sync.
- Notification scheduling.
- Real memory.
- Maps, geocoding, exact addresses, or device location.
- Background retries or queued replay.
- Provider calls from browser code.

## Threat Summary

| Threat | Severity | Stage 24 block? | Stage 25 block? |
| --- | --- | --- | --- |
| Secret leakage | Critical | Yes | Yes |
| Prompt injection | High | Yes | Yes |
| Overbroad context | Critical | Yes | Yes |
| Raw payload logging | Critical | Yes | Yes |
| Unsafe output | Critical | Yes | Yes |
| Hidden writes | Critical | Yes | Yes |
| External action claims | Critical | Yes | Yes |
| Spend runaway | High | No, if mocked only | Yes |
| Rate abuse | High | Yes | Yes |
| Provider outage | Medium | Yes | Yes |
| User trust failure | High | Yes | Yes |

## 1. Secret Leakage

Threat:

Provider API keys or credentials are exposed through frontend source, Vite public env vars, docs, fixtures, logs, screenshots, commits, generated assets, browser storage, source maps, or network-visible config.

Why it matters:

An exposed key can be used outside EasyLife, bypass spend controls, leak provider configuration, and create an emergency key-rotation event.

Mitigations:

- Provider calls must be server-side only.
- Frontend API keys remain forbidden.
- Secrets must live only in the approved server/runtime secret store after a later explicit gate.
- Docs and fixtures must use placeholders only.
- Logs must never include keys or provider auth headers.
- Review must include a secret scan before any provider-readiness stage.

Blocks Stage 24 if:

- The no-provider server adapter plan requires real secrets, provider SDKs, or deployed config.
- Any proposed adapter puts provider keys in frontend code or docs.

Blocks Stage 25 if:

- Secret storage, rotation, revocation, and review checks are not written.
- The provider plan depends on browser-visible keys.

## 2. Prompt Injection

Threat:

Typed capture text or future context includes instructions that try to override the prompt, request hidden data, claim saved actions, bypass validation, or manipulate the assistant into broader behavior.

Why it matters:

The first gateway handles user-written text. That text is untrusted. If treated as instructions, it can steer output toward unsafe claims or hidden actions.

Mitigations:

- Server chooses the prompt from the reviewed registry.
- Prompt ID is allowlisted to `intake-suggestion`.
- User text is context, not instructions.
- Provider output is untrusted until validated.
- Output that claims hidden actions, external actions, real memory, or saved state is rejected or downgraded.
- The UI labels suggestions as draft/preview/needs-review.

Blocks Stage 24 if:

- The adapter does not preserve a hard prompt allowlist.
- The adapter lets browser-supplied prompt text replace the registry prompt.

Blocks Stage 25 if:

- Provider dry-run protocol does not include prompt-injection fixtures.
- Output validator cannot reject injection-driven claims.

## 3. Overbroad Context

Threat:

The gateway sends too much app context, including hidden tasks, note bodies, contact names/place labels, calendar data, auth/session payloads, raw Firebase user objects, or full app exports.

Why it matters:

Overbroad context increases privacy risk, prompt-injection risk, model hallucination surface, and user mistrust.

Mitigations:

- Use `stage-20-context-v1`.
- First gateway allows only `current-route`, `typed-capture`, and optional `demo-fixture`.
- Use `minimum-needed-only` read policy.
- Use `suggestions-only` confirmation policy.
- Server revalidates context before any provider call.
- Reject forbidden keys such as auth, session, token, secret, firebase, password, billing, payment, latitude, longitude, geocode, exact address, medical, or SSN-like fields.

Blocks Stage 24 if:

- The adapter accepts broad context or unsupported source types.
- The adapter treats local/browser validation as the security boundary.

Blocks Stage 25 if:

- Provider plan allows broad context for the first dry-run.
- Provider plan sends real personal data before synthetic/demo proof.

## 4. Raw Payload Logging

Threat:

Gateway logs raw typed capture, full context packets, prompt text with user content, provider raw requests, provider raw responses, auth/session payloads, or secrets.

Why it matters:

Logging can become a quiet data leak. AI debug logs are especially risky because they often capture the exact personal text users typed.

Mitigations:

- Metadata-only logs by default.
- Allowed logs: request ID, timestamp, gateway version, prompt ID, surface, route ID, source types, source count, length bucket, validation state, fallback reason, rate-limit state, latency bucket.
- Raw payload retention is zero by default.
- Debug capture is opt-in, time-limited, redacted, synthetic-fixture-first, and cleaned up.

Blocks Stage 24 if:

- The adapter test/log plan logs raw request bodies by default.
- Test fixtures include real personal data.

Blocks Stage 25 if:

- Provider dry-run protocol logs raw provider requests or responses by default.
- There is no redaction/retention policy.

## 5. Unsafe Output

Threat:

Provider output claims that EasyLife saved a task, sent email, scheduled a reminder, created memory, used device location, synced data, or performed background work.

Why it matters:

Unsafe output can make the UI lie. Even if no action happened, the user may believe EasyLife acted behind their back.

Mitigations:

- Server runs `validateAssistantModelOutput` or a server-equivalent validator before returning usable output.
- Accepted output must match known schema, known intent, known confidence, known source list, known destination label, and explicit confirmation requirement.
- Action-like wording is downgraded to needs-review.
- Forbidden hidden-action or external-action claims are rejected.
- Browser renders fallback rather than unsafe model text.

Blocks Stage 24 if:

- Server adapter mock can return output without passing the validator path.
- The adapter cannot represent accepted, downgraded, rejected, and fallback states.

Blocks Stage 25 if:

- Provider dry-run protocol does not prove unsafe outputs are rejected or downgraded.

## 6. Hidden Writes

Threat:

Gateway output or UI wiring causes tasks, notes, calendar items, reminders, follow-ups, contacts, memory, or settings to be saved without explicit final user confirmation.

Why it matters:

Hidden writes are the fastest way to destroy trust in a personal assistant. EasyLife must feel like control, not magic doing things offscreen.

Mitigations:

- Gateway may return suggestions only.
- The output confirmation object must require explicit confirmation.
- Existing save paths remain separate from model output.
- Manual task and note/context save flows remain user-confirmed.
- No model output may directly call persistence.

Blocks Stage 24 if:

- The server adapter imports or calls save behavior.
- The adapter changes existing task/note persistence.

Blocks Stage 25 if:

- Provider plan allows model output to invoke tools, writes, or actions.

## 7. External Action Claims

Threat:

Output or UI implies EasyLife sent an email/text/message, called someone, synced a calendar, scheduled a notification, geocoded a place, or used live location.

Why it matters:

External action claims are dangerous even when false. They make the assistant look autonomous and unreliable.

Mitigations:

- External actions remain parked.
- Output validator rejects or downgrades external-action claims.
- UI copy must say draft/preview and "nothing was sent/scheduled/synced."
- Provider prompts must not ask for external actions.

Blocks Stage 24 if:

- Adapter naming or fallback copy implies external action support.

Blocks Stage 25 if:

- Provider prompt, rubric, or dry-run allows external action language.

## 8. Spend Runaway

Threat:

Provider calls loop, retry repeatedly, accept abuse, or process oversized context, causing uncontrolled spend.

Why it matters:

Costs can spike quickly, especially if a key or endpoint is abused.

Mitigations:

- No provider calls before provider-readiness gate.
- Per-user daily cap.
- Short-window throttle.
- Token/context size limit.
- Timeout.
- No automatic background retries.
- Circuit breaker.
- Kill switch.
- Spend warning threshold and hard cap before production use.

Blocks Stage 24 if:

- Not a block for no-provider mock code unless the adapter design includes automatic retry loops or background replay.

Blocks Stage 25 if:

- No daily cap, throttle, timeout, circuit breaker, kill switch, spend threshold, or hard cap is defined.

## 9. Rate Abuse

Threat:

Users or scripts repeatedly hit the gateway, causing cost, latency, logs, or reliability issues.

Why it matters:

Even a narrow endpoint can be abused if it lacks throttling.

Mitigations:

- Auth/session checks where available.
- Per-user daily caps.
- Short-window throttle.
- Reject malformed requests before any expensive work.
- Circuit breaker.
- Metadata-only abuse counters.
- Return local fallback when limited.

Blocks Stage 24 if:

- Adapter has no place to represent rate-limited fallback states.
- Adapter bypasses request validation before expensive work.

Blocks Stage 25 if:

- Provider plan does not define rate limits and abuse handling.

## 10. Provider Outage

Threat:

The provider times out, returns malformed output, returns unsafe text, or becomes unavailable.

Why it matters:

EasyLife must still work when AI is unavailable. Capture, local draft preview, task save, note save, and Today review should not break.

Mitigations:

- Provider timeout.
- Fallback response.
- AI disabled state.
- No automatic background retries.
- Preserve typed capture.
- Keep deterministic local classifier/draft behavior.
- Keep manual save flows unchanged.

Blocks Stage 24 if:

- Adapter cannot represent timeout, disabled, validation rejected, or fallback states.

Blocks Stage 25 if:

- Provider dry-run protocol does not include outage and timeout proof.

## 11. User Trust Failure

Threat:

The assistant feels fake, overpromising, too autonomous, too wordy, or unclear about what did and did not happen.

Why it matters:

The product promise is approval-first AI personal assistant. If the user cannot tell whether something saved, sent, synced, or stayed as a draft, the feature fails even if the code is technically safe.

Mitigations:

- Keep first behavior narrow.
- Use state labels: Draft, Preview, Needs review, Saved only after existing save path.
- Copy must say suggestions are drafts until user confirms.
- Fallback must be calm and useful.
- Receipts must name what happened and what did not happen.
- Do not use "remembered," "sent," "scheduled," "synced," or "handled" unless those actions are real and separately approved.

Blocks Stage 24 if:

- Adapter UI/proof language implies live AI or hidden action.

Blocks Stage 25 if:

- Provider prompt/dry-run copy makes the assistant sound autonomous or broader than Inbox typed-capture suggestion.

## Stage 24 Blockers

Do not start Stage 24 no-provider server adapter implementation if any of these are true:

- Stage 23 ADR is missing.
- Gateway boundary document is missing.
- This threat model is missing.
- Rollout/fallback decision is missing.
- The adapter plan requires provider SDKs, API keys, secrets, live calls, backend production config, deploy config, dependencies, or package file changes.
- The adapter accepts unsupported prompt IDs.
- The adapter accepts broad context.
- The adapter lacks fallback states.
- The adapter can bypass output validation.
- The adapter can call save/persistence behavior.
- The adapter logs raw request payloads by default.

## Stage 25 Blockers

Do not start provider-readiness work if any of these are true:

- Stage 24 no-provider adapter proof is missing.
- Secret management checklist is missing.
- Provider selection rubric is missing.
- Live-provider dry-run protocol is missing.
- Human approval checklist is missing.
- Provider plan uses frontend API keys.
- Provider plan lacks rate/spend controls.
- Provider plan lacks metadata-only logging.
- Provider plan lacks timeout/fallback proof.
- Provider plan allows real personal data in the first dry-run.
- Provider plan expands beyond Inbox typed-capture suggestion.

## Human Stop Conditions

Stop and ask before moving beyond this model if the next request requires:

- A real provider key.
- A provider SDK.
- Firebase config changes.
- A deploy target.
- Billing/spend setup.
- External actions.
- Hidden reads.
- Hidden writes.
- Real memory.
- Saved plans/reminders/follow-ups.
- Real personal data fixtures.

## Threat Model Verdict

The gateway is only safe to continue if Stage 24 remains no-provider and proves the server adapter shell can preserve the same request validation, prompt allowlist, output validation, fallback, no-hidden-write, and metadata-only logging boundaries. Real provider work belongs later, behind Stage 25 and explicit human approval.
