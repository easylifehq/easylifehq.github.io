# Deployment Readiness

STATUS: HOLD_NO_DEPLOYMENT_AUTHORIZED

## Ready

- Source branch builds as a production Vite app with TypeScript validation.
- Workout reliability/statistics tests pass 19/19.
- Firebase functions syntax lint passes.
- Production-preview browser smoke is clean with no console warnings/errors in a fresh tab.
- Public and authenticated route inventory renders at desktop and phone viewports without document-level horizontal overflow.
- `dist` contains `index.html`, `manifest.webmanifest`, `sw.js`, icons, and hashed assets.
- Demo workout data is explicitly labeled synthetic and performs no Firebase writes.

## Release holds

1. No repository policy or user instruction authorized deployment. No hosting, Firebase, DNS, production database, or live-site state was changed.
2. Remote push was blocked by the execution security approval layer, so the safety and feature branches currently exist locally only.
3. The npm audit reports 10 dependency advisories: 1 low, 4 moderate, 3 high, and 2 critical. Some fixes are available, while the Vite path requires a semver-major upgrade. These were not changed blindly during a workout-focused mission.
4. A physical phone/PWA field test remains pending.
5. The app has no configured application lint script. The new workout Node test command and production build are green, but broader automated UI tests are still absent.
6. A real authenticated Firestore retry/two-tab test was not run against production credentials. Idempotency is covered at the coordinator and deterministic document-ID layers and in demo browser behavior.

## Controlled release sequence

1. Review and intentionally remediate the dependency audit on a separate branch, including compatibility testing for any Vite major upgrade.
2. Run the physical-phone checklist in `WORKOUT_PHONE_FIELD_TEST.md`.
3. Push the safety checkpoint and upgrade branch after source-egress approval.
4. Obtain explicit production deployment authorization.
5. Deploy through the repository's established source-to-generated-artifact workflow; do not hand-edit root generated files.
6. Verify live auth, Firestore writes, service-worker update, workout retry/idempotency, Progress links, and rollback path.

Rollback anchor: local safety branch `codex/safety-july-checkpoint-20260801` at `5fa6149112a6c24d1cbda815a0978dd03425ff61`.
