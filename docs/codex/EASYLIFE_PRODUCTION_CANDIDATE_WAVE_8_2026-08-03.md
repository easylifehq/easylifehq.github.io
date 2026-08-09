# EasyLife Wave 8 production deployment candidate

Status: `YELLOW_PRODUCTION_CANDIDATE_WITH_REMAINING_GATES`

**MERGING THE GENERATED-ROOT PR MAY PUBLISH PRODUCTION. DO NOT MERGE WITHOUT EXPLICIT DEPLOYMENT APPROVAL.**

## Outcome

Wave 8 produced and committed a deterministic, production-configured GitHub Pages root without deploying it. The candidate uses only the approved public Firebase web configuration for project `pipeline-2f422`; no Firebase Admin credential, service account, private key, provider secret, bearer token, production user session, or real user data was used.

- verified Wave 7 base and proposed rollback SHA: `5fa26608ed74de5d8f6dac2875c5c88b06b76c54`;
- HTML LF-normalization commit: `dbe66ab2`;
- reviewed source/verification SHA: `09e8b959deccfdd77537d1a69e6382afbe1091f8`;
- generated-output commit: `cb630db2942e69fada4c6eec870144d44e3a8a1b`;
- production metadata-convergence fix: `26dc3050`;
- hosted ancestry fix: `4be10d21`;
- cross-platform publication fixes: `146fcc65`, `88744319`;
- canonical publication metadata: `18b5d085`;
- final receipt commit: the branch HEAD reported by the draft PR and final handoff;
- publication schema: `easylife-pages-publication/v1`;
- payload: 91 files;
- SHA-256 of `pages-publication-sha256.txt`: `5BB5AA54E4340ECC5515EEED67398678B3EB5DB30BD037AAEF21F7606923FC7B`.

## Deployment inputs and identity

Authenticated GitHub metadata confirmed repository administrator access, Pages source `main` at `/`, and the current Pages build. The six required repository variables are present and nonempty; the optional measurement variable is also present. Only these names were confirmed:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- optional `VITE_FIREBASE_MEASUREMENT_ID`

The values were extracted at runtime from the already published committed Pages bundle, held in process memory, and never printed, documented, committed, or written to a plaintext temporary file. `.firebaserc`, the published bundle, the repository variable set, and the production build all agree on `pipeline-2f422`. The six required fields formed one internally consistent Firebase web-client configuration. A generated-output scan rejected private/server/provider credentials and machine paths while allowing only the exact approved public web API key supplied as a build input.

## Generated-root plan

The reviewed plan contained 75 creates, 11 updates, 181 stale managed-asset deletes, 5 unchanged payloads, and 2 preserved files (`CNAME` and `.nojekyll`). All 267 mutations were within the declared fixed files, `assets/**`, or `icons/**`; no source, documentation, Firebase server file, Git metadata, `old-site`, or unknown root path was copied or deleted. `CNAME` remained byte-identical.

The counts exactly match Wave 7's authoritative clean-checkout plan. Material filename differences are hashed application assets caused by replacing the fail-closed review build with the approved production-configured build. The deletion set is accumulated stale managed assets only. No ownership or preservation boundary changed.

The guarded apply ran only in `C:\Dev\easylife-wave8-production-candidate`. `--check` converged at zero changes when locked to the reviewed source SHA. A second isolated candidate produced the same complete inventory hash. The original checkout was not changed.

Hosted Linux initially exposed two Windows-only determinism gaps: shallow checkout prevented the reviewed-source ancestry check, and worktree line-ending expansion changed publication metadata for `.nojekyll`, the SVG icon, web manifest, and service worker. The workflow now fetches full history, preserved metadata uses committed blobs, and all managed text is canonicalized to LF before hashing. Regression tests cover both cases. The production payload was not otherwise changed.

## Verification

- application tests: 72/72;
- authenticated Firestore Emulator integration: 7/7;
- publication/server/production-input tests: 30 discovered, 29 pass and 1 Windows symlink-privilege skip (covered on hosted Linux);
- TypeScript: pass;
- production build: pass, 210 modules;
- Functions lint: pass;
- existing critical advisory gates: pass;
- production configuration: 6/6 required variables, optional measurement present, 85 text files scanned;
- manifest/inventory: 91/91 payload files verified;
- desktop route matrix: 63/63 at 1440x900;
- phone route matrix: 63/63 at 390x844;
- critical narrow matrix: 10/10 at 320x568;
- exact-root HTTP contract: root 200, deep routes truthful 404 shells, manifest/service worker/icons correct media types;
- demo diagnostics: 132 requests across seven critical routes, all loopback; zero external or production Firebase requests; zero console warnings/errors;
- production login boundary: sign-in UI rendered, configuration-unavailable state absent, zero external requests, no sign-in performed;
- PWA: active `sw.js`, controlling scope, current `easylife-shell-v6` cache, offline Progress reload pass, online recovery pass;
- synthetic flows: Capture save, focused Review processing/persistence, Plan ownership, global Workout search, goal pause/resume, 12-working-set workout save, post-workout review, four-session PR filter, My Week, and whole-account export surface pass.
- hosted draft-PR checks: 4/4 pass (`Complete verification and staged Pages artifact`, `Functions syntax and critical advisory gate`, `Web tests and production build`, and `Production-configured root integrity`).

The in-app browser did not expose a download event for the local blob CSV button. The button interaction ran, while deterministic JSON/CSV escaping, manifest, formula-injection, schema, and download-content rules remain covered by the 72-test application suite. This is a browser-harness limitation, not evidence of a production failure.

## Dependency disposition

No dependency or lockfile changed in Wave 8; every advisory is inherited from the verified base.

- Application: 4 advisories (1 high, 3 moderate). Direct Vite and transitive esbuild affect development-server tooling and are not shipped as an executable production server; the audit's complete fix requires breaking Vite 8. Direct `react-router-dom` and transitive `react-router` are production/reachable; npm reports a non-major fix path, but it is deferred to a separate source PR with the 126-route regression matrix rather than mutating a frozen deployment candidate.
- Functions: 9 moderate advisories in the `uuid`/Google client chain. `firebase-admin` and `firebase-functions` are direct production dependencies; the remaining packages are transitive. The reported vulnerable `uuid` buffer-taking v3/v5/v6 path is likely unreachable from EasyLife's three callable functions, which do not invoke that API. npm proposes breaking dependency changes, including a downgrade, so no forced or unsafe fix was applied.
- Critical production advisory gates remain green. `npm audit fix --force` was never used.

## Remaining gates

This candidate is technically reviewable but not deployment-approved. These holds remain:

1. physical installed-PWA testing on an iPhone and an Android phone;
2. explicit Pages approval, Firebase approval, deployment window, and named operator;
3. provider custom-claim provisioning/verification before any paid-provider callable is enabled for a production operator;
4. human approval of rollback SHA `5fa26608ed74de5d8f6dac2875c5c88b06b76c54`;
5. separate review and execution, if approved, of Firestore rules and the exact three Functions.

No Pages, Firestore, Functions, Hosting, claims, or production data deployment occurred.

## Evidence

- `docs/codex/evidence/production-candidate-wave-8-2026-08-03/pages-publication-manifest.json`
- `docs/codex/evidence/production-candidate-wave-8-2026-08-03/pages-publication-sha256.txt`
- `docs/codex/evidence/production-candidate-wave-8-2026-08-03/root-versus-candidate-plan.json`
- `docs/codex/evidence/production-candidate-wave-8-2026-08-03/guarded-apply-plan.json`
- `docs/codex/evidence/production-candidate-wave-8-2026-08-03/route-pwa-matrix.json`
- `docs/codex/evidence/production-candidate-wave-8-2026-08-03/screenshots/`
- `docs/codex/evidence/production-candidate-wave-8-2026-08-03/BASELINE_AND_FINAL_VERIFICATION.md`
- `docs/codex/evidence/production-candidate-wave-8-2026-08-03/ROOT_PLAN_COMPARISON.md`
- `docs/codex/evidence/production-candidate-wave-8-2026-08-03/REMAINING_GATES.md`

`YELLOW_PRODUCTION_CANDIDATE_WITH_REMAINING_GATES`
