# EasyLife Security Checklist

This checklist is the working security baseline for the web app, mobile app, Firebase project, and future assistant features. It does not make the app impossible to hack; it reduces obvious risk and gives each release a repeatable review path.

## Firebase

- Firestore rules must stay deployed with `firestore.rules`.
- User data must live under `users/{uid}/...` and only be readable or writable by that authenticated `uid`.
- New shared or public collections require an explicit rule review before use.
- Firebase Authentication must be required for every private app route.
- Cloud Functions that use private app data or AI features must verify Firebase ID tokens.
- Cloud Function CORS should stay limited to known EasyLife origins and local development origins.

## Frontend

- Never place private secrets in the frontend bundle. Firebase web config is allowed; server secrets are not.
- Keep OpenAI keys and other server-only credentials in Firebase secrets or server environment variables.
- Show friendly error messages to users instead of raw Firebase, network, stack, or provider errors.
- Keep data export user-controlled and avoid silently sending exports to third-party services.
- Keep destructive actions reviewable and reversible where practical.

## Release Review

- Run `npm run build` before every versioned app release.
- Run dependency audit checks before security-sensitive releases.
- Confirm `firebase.json` still points to Firestore rules before deploy.
- Confirm new Firestore collections live under `users/{uid}` or have documented rules.
- Confirm new functions validate auth before doing private work.
- Confirm user-facing copy explains data export, delete, trash, AI, and notification behavior clearly.

## Mobile

- Treat iPhone as the priority test device for `4.0.0`, while keeping Android build paths available.
- Verify auth persistence, logout, app resume, notification permissions, and safe-area behavior on real devices.
- Never add push notifications without user opt-in and clear Settings controls.
