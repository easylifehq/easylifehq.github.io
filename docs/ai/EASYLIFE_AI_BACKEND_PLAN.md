# EasyLife AI Backend Plan

This document describes a future production AI backend for EasyLife. It is a planning document only; it does not authorize unattended backend, auth, Firebase, dependency, secret, deployment, or production configuration changes.

## Goals

- Provide a server-side AI gateway so API keys and provider credentials never ship in the React bundle.
- Support safe assistant features across EasyList, EasyNotes, EasyCalendar, EasyWorkout, EasyProjects, EasyPipeline, and HQ.
- Convert user-approved context into focused suggestions, summaries, plans, and drafts without silently writing production data.
- Keep manual app workflows usable when AI is unavailable, rate-limited, disabled, or returns low-confidence output.
- Create a reviewable path from mock experimental AI features to production features with clear security, privacy, and cost controls.

## Required Safety Checks

Every production AI request should pass these checks before calling an external model:

- Verify a valid Firebase ID token and derive the user id server-side.
- Confirm the requested feature is enabled for that user, environment, and release stage.
- Allow only known command types; reject free-form backend actions that are not mapped to an approved capability.
- Validate and size-limit all request payloads before model calls.
- Pull user data only from authorized `users/{uid}/...` paths or other explicitly reviewed private scopes.
- Minimize context to the smallest useful snapshot instead of sending broad account exports.
- Redact or omit secrets, credentials, raw provider errors, internal ids that are not needed, and unrelated private data.
- Enforce per-user and global rate limits, request timeouts, and maximum model token budgets.
- Return drafts and suggestions by default; require an explicit user action before creating, editing, deleting, or scheduling real records.
- Log operational metadata without storing full private prompts, full model responses, or sensitive app content by default.
- Provide friendly fallback errors that do not expose stack traces, Firebase internals, provider payloads, or secret names.

## Likely API Shape

The first production API should be a narrow server endpoint rather than a general-purpose agent runtime.

```text
POST /ai/commands
```

Example request shape:

```json
{
  "command": "plan_day",
  "clientRequestId": "uuid",
  "context": {
    "date": "2026-04-24",
    "includeTasks": true,
    "includeCalendar": true,
    "includeNotes": false,
    "includeWorkout": false
  },
  "input": {
    "prompt": "Help me organize today around my deadlines."
  }
}
```

Example response shape:

```json
{
  "status": "draft",
  "command": "plan_day",
  "summary": "A proposed day plan is ready.",
  "suggestions": [
    {
      "type": "calendar_draft",
      "title": "Focus block for priority tasks",
      "reason": "Protects time before the next scheduled event."
    }
  ],
  "warnings": [
    "Review suggested calendar blocks before saving."
  ]
}
```

Initial command types should stay small and explicit:

- `plan_day`
- `summarize_notes`
- `clean_up_tasks`
- `prep_calendar`
- `workout_coach`
- `project_focus`

Any command that would mutate production data should return a draft object first. Separate save endpoints, if added later, must use existing app write paths and validation rules instead of letting AI write directly.

## Auth Requirements

- The frontend must call the backend with the current Firebase ID token.
- The backend must verify the token on every request and must not trust a user id supplied by the client.
- AI endpoints must be denied for anonymous, expired, revoked, or malformed tokens.
- Admin-only diagnostics, prompt testing, and evaluation tools must require a separate admin authorization check.
- CORS must be limited to known EasyLife origins and local development origins.
- Server-side provider keys must live in Firebase secrets or another approved secret store, never in `VITE_` variables, committed files, GitHub Pages output, or browser storage.

## Data Privacy Concerns

EasyLife data can include tasks, notes, calendar events, workout history, project plans, contacts, and pipeline details. These records may contain sensitive personal, school, work, health, schedule, and relationship information.

The production backend should:

- Ask for only the categories of context needed for the selected command.
- Show users which app data categories may be used before enabling AI features.
- Avoid sending full note libraries, complete calendars, full contact lists, or broad history unless the user explicitly requests that scope.
- Keep model prompts and responses out of durable logs unless a reviewed debugging mode is enabled.
- Define retention rules for AI request metadata, error reports, and optional feedback.
- Treat exported AI context as third-party processing data and document that behavior in user-facing privacy copy before launch.
- Provide an AI disable path in Settings before broad rollout.

## What Must Not Be Built Unattended

These items require explicit human review, implementation planning, and supervised deployment:

- Real Cloud Functions or any other production backend endpoint.
- Firebase rules, auth provider, billing, DNS, hosting, or deployment configuration changes.
- Secret creation, secret rotation, API key wiring, or provider account setup.
- Direct AI writes to Firestore or other production data stores.
- Autonomous delete, send, publish, invite, purchase, message, email, or notification actions.
- Cross-user data access, shared workspace AI features, or organization-level context aggregation.
- Persistent memory, long-term user profiling, embeddings, vector databases, or search indexes over private data.
- Dependency additions, model provider SDK changes, or infrastructure migrations.
- Any feature that makes real external AI/API calls from the browser.

## Staged Rollout Plan

### Stage 0: Experiments Only

- Keep AI UI under experiments with fake data and mock responses.
- Do not add secrets, provider calls, backend endpoints, persistence, or production routing changes.
- Use the mock experience to refine command names, result shapes, and user review flows.

### Stage 1: Backend Design Review

- Write a technical design for the first narrow endpoint, expected payloads, auth checks, cost controls, logging, failure modes, and privacy copy.
- Review Firestore read scopes and confirm all context comes from authenticated user paths.
- Decide whether the first backend belongs in Firebase Functions or another approved server environment.

### Stage 2: Local Prototype With Test Credentials

- Build a supervised local-only prototype behind explicit environment configuration.
- Use non-production test data.
- Verify token validation, payload validation, rate limiting, timeout behavior, and fallback UX.
- Keep provider credentials out of the frontend and out of committed files.

### Stage 3: Private Beta

- Enable one command for a small set of test users.
- Return suggestions and drafts only.
- Monitor latency, errors, cost, rate limits, and user feedback.
- Confirm users can understand what context was used and can reject AI output before saving.

### Stage 4: Limited Production Rollout

- Add Settings controls, clear privacy copy, support documentation, and operational dashboards.
- Expand commands one at a time after each command passes review.
- Keep manual workflows fully functional and easy to find.

### Stage 5: Advanced Capabilities

- Consider multi-step planning, cross-app summaries, or persistent preferences only after the narrow command endpoint is stable.
- Require a separate review before adding memory, embeddings, shared workspace features, or any direct mutation workflow.
- Maintain a default posture of draft-first, user-reviewed AI output.
