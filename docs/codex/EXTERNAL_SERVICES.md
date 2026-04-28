# External Services Registry

## Services

- Firebase: existing EasyLife production-adjacent app service used by the current application for authentication/data infrastructure. This document does not approve new Firebase configuration, rule, auth, backend, or deployment changes.

## Environment Variables

- No new environment variables are approved by this registry.
- No secrets, API keys, tokens, service-account files, or credentials may be added or edited by unattended Codex Fleet work.

## Scopes

- Allowed unattended scope: documentation and frontend-only UI work that preserves existing external-service behavior.
- Not approved unattended: Firebase rules, Firebase config, auth/session behavior, Cloud Functions, backend services, deploy configuration, package files, production data, or environment files.

## Cost Risk

- No new paid service, plan change, quota change, API call path, or billing behavior is approved.
- Any cost-bearing external-service change requires explicit human approval before implementation.

## Data Sent

- No new data is approved to be sent to external services by unattended work.
- Existing app behavior must be preserved unless a human explicitly approves a scoped sensitive-system change.

## Approval Status

Status: DOCUMENTED ONLY

This registry records the current external-service boundary for guardrail review. It is not approval for new external services or sensitive-system modifications.
