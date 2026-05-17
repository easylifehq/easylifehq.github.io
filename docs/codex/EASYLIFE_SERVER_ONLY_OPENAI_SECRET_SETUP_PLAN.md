# EasyLife Server-Only OpenAI Secret Setup Plan

Date: 2026-05-17

Status: setup plan only. No key has been added, printed, committed, or used.

## Mission

Define exactly where `SERVER_AI_PROVIDER_API_KEY` should live for the first EasyLife live AI call.

The first live AI path remains narrow:

- route: `/app/easylist/add?demo=1`
- prompt: `intake-suggestion`
- behavior: Inbox typed-capture suggestion only
- input: synthetic/demo or explicitly approved private-alpha typed capture only
- output: suggestion-only, validated and quarantined before display

## Bottom Line

`SERVER_AI_PROVIDER_API_KEY` must live only in the server gateway runtime secret environment.

It must not live in:

- `app-vNext/src`
- `app-vNext/.env`
- any `VITE_` variable
- Firebase web config
- docs
- fixtures
- generated assets
- built frontend output
- browser storage
- screenshots
- logs
- commits

EasyLife is still a static/frontend app until the server-only gateway exists, so there is currently no safe place inside `app-vNext` to put the OpenAI key.

## Provider

Provider: OpenAI.

Server-side secret placeholder name:

`SERVER_AI_PROVIDER_API_KEY`

This placeholder name is safe to commit. The real key value is not.

## Why Not Frontend Or `VITE_`

Vite exposes `VITE_` variables to browser code. That means a `VITE_OPENAI_API_KEY`, `VITE_AI_PROVIDER_API_KEY`, or similar value would be extractable from the browser bundle.

Frontend API keys are not secrets. They can be copied from source, built assets, devtools, source maps, request payloads, screenshots, or logs.

Because of that, no OpenAI/provider key may be stored in any frontend environment file, frontend source file, static config, docs file, or committed artifact.

## Local Dev Secret Setup

Local dev should use a server-only runtime secret for the future gateway process.

Approved local pattern:

1. Start only the server gateway/emulator process from a trusted local shell.
2. Set `SERVER_AI_PROVIDER_API_KEY` in that shell/session only.
3. Do not write the key to repo files.
4. Do not put the key in `app-vNext/.env`.
5. Do not prefix it with `VITE_`.
6. Do not print it in terminal output.
7. Do not log request bodies, raw provider responses, or environment values.

Example shape, with the value intentionally omitted:

```powershell
$env:SERVER_AI_PROVIDER_API_KEY = "<set manually outside the repo>"
```

That command is a local operator action only. The real value should come from the user's private notes or a password manager, never from chat and never from a committed file.

If the local server process does not see `SERVER_AI_PROVIDER_API_KEY`, it must return the existing local fallback instead of attempting a provider call.

## Production Secret Setup

Production should use the deployment platform's server-side secret manager.

For the currently recommended architecture, that means the future narrow Firebase Cloud Function / HTTPS callable gateway should attach a secret named:

`SERVER_AI_PROVIDER_API_KEY`

Production setup rules:

- Store the real OpenAI key in the server platform secret store, not in the repo.
- Attach the secret only to the narrow assistant gateway function.
- Do not expose the secret to the static frontend host.
- Do not mirror the secret into Firebase web config.
- Do not place the secret in deploy config committed to git.
- Rotate or revoke the key from the provider dashboard and secret manager if exposure is suspected.
- Keep the gateway disabled by default until the Stage 31 approval record changes to `APPROVED_FOR_ONE_SYNTHETIC_INBOX_PROVIDER_CALL`.

## Gateway Read Rules

The future server-only gateway may read only the placeholder-backed server runtime secret:

`SERVER_AI_PROVIDER_API_KEY`

The gateway must fail closed when:

- the secret is missing
- the runtime is browser/client-side
- a `VITE_` provider secret is proposed
- the route is not `/app/easylist/add?demo=1`
- the prompt is not `intake-suggestion`
- input is not synthetic/demo or explicitly approved private-alpha typed capture
- sanitizer rejects the request
- quarantine rejects the provider response
- kill switch, circuit breaker, rate limit, or timeout triggers

Failing closed means returning the existing local fallback while preserving typed capture. It must not retry in the background.

## First Gateway Scope

Gateway name from the Stage 23 ADR:

`assistantIntakeSuggestion`

The gateway may eventually:

- receive a bounded Stage 20 context packet
- verify route `/app/easylist/add?demo=1`
- verify prompt `intake-suggestion`
- sanitize the typed capture request
- call OpenAI using `SERVER_AI_PROVIDER_API_KEY` from server runtime only
- quarantine and validate provider output
- return a draft/preview suggestion or local fallback

The gateway must not:

- save tasks
- save notes
- schedule plans
- send email/text/calls/messages
- create notifications
- sync calendars
- geocode places
- use device location
- claim real memory
- read broad app context
- log raw typed capture by default
- expose raw provider responses
- run from browser code

## Logging Rule

Logging remains metadata-only.

Allowed metadata:

- route
- prompt ID
- request class
- sanitizer state
- quarantine state
- validation result
- provider call state
- fallback reason
- rate-limit state

Forbidden logging:

- raw typed capture
- OpenAI key or any secret value
- environment values
- provider raw response
- full context packet
- note bodies
- task notes
- contact names
- place labels
- auth/session payloads

## Operator Checklist Before Any Real Call

Before any real OpenAI call is allowed:

- Provider choice is OpenAI.
- `SERVER_AI_PROVIDER_API_KEY` is stored outside the repo.
- No provider key exists in frontend source, docs, env files, or built assets.
- No `VITE_` provider secret exists.
- Server gateway is disabled by default.
- Kill switch exists.
- Spend cap exists.
- Rate limit exists.
- Metadata-only logging is enforced.
- Local fallback is verified.
- Request sanitizer is required.
- Response quarantine is required.
- Stage 31 approval record ends `APPROVED_FOR_ONE_SYNTHETIC_INBOX_PROVIDER_CALL`.

## Current Decision

The user is good because no committed OpenAI/provider key was found in the repo scan.

The app is not yet ready to run live AI because the real key still needs to be placed in server-only secret storage for the future gateway, not in `app-vNext`.

Do not paste the key into chat. Do not put it in code. Do not commit it.

