# Auth Policy

Status: APPROVED

EasyLife may receive UI-only improvements on existing signed-in and protected surfaces when the work preserves current access behavior.

## Allowed Work

- Frontend-only layout, hierarchy, copy, density, and component polish on existing signed-in surfaces.
- Visual QA routes and protected previews that already exist in the app.
- Refactors that do not alter access checks, sessions, providers, permissions, claims, stored user identity data, or Firebase configuration.

## Not Approved

- Firebase Auth provider or project configuration changes.
- Sign-in, sign-up, session, permission, claim, or role logic changes.
- Firestore rules, Cloud Functions, backend config, secrets, environment files, package files, deployment config, or production data changes.
- New authentication flows or new external services.

## Stop Rule

If a task needs to change authentication behavior, identity data, permissions, Firebase config, rules, sessions, roles, claims, backend services, secrets, or production data, stop and request human approval.
