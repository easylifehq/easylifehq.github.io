# EasyLife Stage 25 Secret Management Checklist

Date: 2026-05-17
Status: SECRETS_NOT_WIRED

## Mission

Define exactly how provider secrets must be stored, accessed, rotated, and kept out of frontend code before any live provider dry-run.

This checklist does not add secrets, SDKs, dependencies, config changes, deploy config, generated output, or live calls.

## Existing Key Audit

Found existing Firebase web config for project:

```text
pipeline-2f422
```

File:

```text
app-vNext/src/lib/firebase/config.ts
```

Interpretation:

- This is Firebase client configuration.
- It is not an AI provider secret.
- It must not be reused as a model-provider key.
- It should not be treated as proof that live AI secrets are ready.

Found placeholder:

```text
app-vNext/.env.example
VITE_TASK_ANALYZER_URL=https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/analyzeTaskBrainDump
```

Interpretation:

- `VITE_` variables are exposed to the browser.
- `VITE_` variables may hold public endpoint URLs.
- `VITE_` variables must never hold provider API keys or provider secrets.

## Forbidden Secret Locations

Provider secrets must never appear in:

- frontend source files
- `VITE_` environment variables
- docs
- fixtures
- screenshots
- browser bundles
- generated assets
- `localStorage`
- session storage
- Firestore user documents
- console logs
- analytics events
- commits
- GitHub issue/PR comments
- NIGHTLY_REPORT entries
- Magic Scorecard entries

## Approved Secret Shape

For Stage 26 planning, secrets may only be referenced abstractly as:

```text
SERVER_AI_PROVIDER_API_KEY
```

No actual value may be committed or printed.

## Storage Expectation

Secrets must live in the approved server-side secret store for the selected architecture.

For the Stage 23 recommended Firebase Cloud Function path, that means:

- server-only secret configuration
- function/runtime access only
- no frontend import
- no static export
- no browser-visible env value

## Access Rules

The frontend may call only the EasyLife gateway endpoint.

The frontend must not:

- know the provider key
- choose arbitrary provider models
- pass provider credentials
- pass provider endpoint URLs
- pass provider-specific headers

The server gateway must:

- read secrets server-side only
- validate request before provider call
- choose prompt server-side
- validate output before returning
- return fallback on failure

## Rotation And Revocation

Before Stage 26 live dry-run, document:

- where the key is stored
- who can access it
- how to rotate it
- how to revoke it
- how to disable the gateway if the key leaks
- how to verify no key is present in frontend bundles

## Pre-Commit Checks

Before any live integration commit:

- search for provider key prefixes
- search for `apiKey`, `secret`, `token`, `OPENAI`, `ANTHROPIC`, `GEMINI`, `provider`
- inspect generated bundles if any deployment build is produced
- verify docs contain placeholders only
- verify logs do not include raw request or provider response payloads

## Do Not Proceed If

- a provider key is already in frontend code
- a provider key is in `.env` under a `VITE_` name
- a provider key appears in docs or screenshots
- the gateway cannot run without exposing secrets to the browser
- the selected architecture lacks a server-side secret store

## Verdict

Secrets are not wired. Stage 26 still requires explicit human approval and server-only secret setup.
