# EasyLife Stage 20 AI Assistant Readiness Gate

Reviewed At: 2026-05-17

Verdict: `READY_FOR_MODEL_ARCHITECTURE_NOT_MODEL_CALLS`

## Mission

Decide whether EasyLife is ready for model-backed assistant work, and define the safest architecture before any model calls are implemented.

Stage 19 proved that EasyLife can read local context deterministically across Today, Inbox, Plan, Notes, and Contacts. Stage 20 may now define a model-backed assistant architecture, but it must not add model calls, provider SDKs, API keys, backend services, Firebase rules/config changes, deployment config, generated output, package/dependency changes, or secrets until a later explicit gate approves them.

## Readiness Decision

EasyLife is ready for model-backed assistant planning, contracts, validation, and UI fallback work.

EasyLife is not yet approved for live model calls.

The reason is simple: the product promise is personal and high-trust. A model-backed assistant will need server-side secret handling, explicit read boundaries, strict output validation, and approval-first action gates before it is allowed to touch any user-facing save path.

## Safe Architecture

The model layer should be server-only.

Recommended shape:

1. Frontend collects an explicit assistant request and a bounded context packet.
2. Frontend sends the request to a server-owned assistant gateway.
3. Gateway injects the system prompt and approved context only.
4. Gateway calls the model provider with server-held secrets.
5. Gateway validates model output against a strict schema.
6. Frontend renders the validated suggestion as Draft or Preview.
7. User edits, dismisses, or explicitly confirms any save action.

The frontend may render suggestions, but it must not own model provider secrets, call provider APIs directly, or trust raw model output.

## What The Model May Read

Only the minimum context needed for the requested action should be sent.

Allowed only after a user initiates an assistant request:

- Current typed capture text.
- Current visible draft/suggestion state.
- Selected task title, notes, priority, list, due date, and estimated duration.
- Selected note title, body excerpt, tags, and pinned/status context.
- Selected plan/day summary: date, fixed commitments, open windows, local day mode, and task blocks.
- Selected contact display name, relationship/context, privacy-light place labels, and visit note.
- Current route/surface name such as Today, Inbox, Plan, Notes, or Contacts.
- Demo-mode fixture labels when using local review mode.

Every context packet should include a source list so the UI can say what the suggestion was based on.

## What The Model May Never Read

Stage 20 does not approve sending:

- Secrets, API keys, environment variables, Firebase config secrets, tokens, cookies, auth/session payloads, or private headers.
- Raw Firebase user objects, auth provider responses, credentials, refresh tokens, or access tokens.
- Full database dumps or broad cross-app exports.
- Hidden route state that the user did not request.
- Exact street addresses, device location, geolocation, IP-derived location, or map/geocoding data.
- Email inboxes, texts, calls, messages, or third-party account data unless a later explicit integration gate approves that source.
- Payment data, billing data, medical records, legal records, government IDs, passwords, or financial account data.
- Real personal data in tests, fixtures, docs, or demo prompts.
- Deleted, archived, trashed, private, or hidden items unless the user explicitly opens that source and approves including it.

## Actions That Require Confirmation

Every model-backed output starts as a suggestion.

These actions require visible user confirmation:

- Save task.
- Save note/context.
- Turn capture text into a task draft.
- Turn note/context into task draft.
- Turn note/context into plan draft.
- Save or copy a plan draft.
- Save reminder draft if a future stage approves reminder saves.
- Save follow-up draft if a future stage approves follow-up saves.
- Change priority, due date, tags, list, plan window, note group, or contact place labels.
- Any destructive action such as archive, delete, clear, dismiss with data loss, or overwrite.
- Any external action such as email/text/call/message sending, notification scheduling, calendar sync, map/geocoding lookup, or third-party write.

Until later gates approve them, plans, reminders, follow-ups, email, notifications, calendar sync, maps, geocoding, exact addresses, real memory, and external actions remain preview-only or parked.

## Where Prompts Live

Prompts should live in a dedicated assistant prompt registry, not scattered through UI components.

Recommended future path:

- `app-vNext/src/features/assistant/prompts/`
- `app-vNext/src/features/assistant/modelContracts/`
- `docs/codex/EASYLIFE_STAGE_20_AI_ASSISTANT_READINESS_GATE.md`

Prompt files should be versioned, named by use case, and separated from secrets. They should describe:

- Allowed inputs.
- Forbidden inputs.
- Expected output schema.
- Tone/copy boundaries.
- Save-boundary reminders.
- Fallback behavior.
- Required source attribution fields.

Prompts must not contain real user data, secrets, provider keys, private URLs, production identifiers, or environment-specific values.

## Output Validation

Raw model output is never trusted.

Every output must be parsed and validated before rendering.

Required validation:

- Output must match a known schema.
- Intent must be one of the allowed assistant intents.
- Confidence must be a bounded enum, not arbitrary prose.
- Suggested destination must be one approved local destination.
- Action state must begin as Draft, Preview, or Needs review.
- Source list must be present.
- Any save action must declare exactly what will be saved and what will not happen.
- Unsupported external actions must be rejected or converted to preview-only copy.
- Unsafe or overbroad requests must return `needs-review` instead of a confident action.
- Model output must not create hidden writes, hidden reads, external sync, real memory claims, calendar changes, notifications, emails, maps, or geocoding work.

If validation fails, the UI should show a calm fallback and keep the user's original input intact.

## Secret Protection

Secrets must live only on the server or in approved secret storage. They must never be committed, bundled, logged, exposed to the browser, written into docs, added to fixtures, or placed in frontend environment variables.

No Stage 20 task may add:

- Provider keys.
- `.env` files.
- Firebase rules/config changes.
- Cloud Functions or backend services.
- Deployment config.
- Package/dependency changes.
- Generated output.
- Production remote changes.

Those require a separate explicit implementation gate.

## Why Frontend API Keys Are Forbidden

Frontend API keys are public once shipped. Even if an environment variable starts with a private-looking name, a bundled browser app exposes it to users, extensions, devtools, network logs, and scraped builds.

Putting a model key in frontend code would allow:

- Unauthorized model usage.
- Cost abuse.
- Prompt and context leakage.
- Secret rotation emergencies.
- Loss of control over rate limits and safety filters.
- User data being sent outside the approved gateway.

Therefore the browser may only call an EasyLife-owned server endpoint. The server endpoint owns provider secrets, rate limits, logging policy, context filtering, prompt injection, output validation, and fallback behavior.

## Fallback Behavior When AI Is Unavailable

EasyLife must remain useful without AI.

Required fallback behavior:

- Keep deterministic local classifier and draft builder available.
- Preserve typed capture text.
- Keep task and note save paths working.
- Show local context reads where possible.
- Render a calm message: "AI suggestions are unavailable. You can still save tasks and notes manually."
- Do not block Today, Inbox, Plan, Notes, Contacts, or Settings.
- Do not retry in a loop.
- Do not invent model output.
- Do not hide the save buttons that do not require AI.

## Stage 20 Approval Boundary

This gate approves exactly this:

- Documentation of model read boundaries.
- Documentation of forbidden data.
- Documentation of confirmation requirements.
- Documentation of prompt location and prompt registry rules.
- Documentation of output validation.
- Documentation of server-only secret handling.
- Documentation of fallback behavior.
- Task Contract V2 planning for the above.

This gate does not approve:

- Live model calls.
- Provider SDK installation.
- API key creation or storage.
- Backend or Cloud Functions.
- Firebase rule/config changes.
- External integrations.
- New saved object types.
- Calendar sync, notifications, email/text/call/message sending, maps, geocoding, exact addresses, or real memory.

## Stage 20 Done Signal

Stage 20 is complete when the architecture is specific enough that a later implementation task can add a server-only model gateway without guessing:

- What context may be sent.
- What context is forbidden.
- Which actions require confirmation.
- Where prompts live.
- How output validation works.
- Where secrets live.
- What the UI does when AI is unavailable.

Until that proof exists, EasyLife should keep using the deterministic/local assistant foundation.
