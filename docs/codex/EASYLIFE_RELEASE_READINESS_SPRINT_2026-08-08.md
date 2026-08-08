# EasyLife Wave 8 release-readiness sprint

Date: 2026-08-08

Status: `YELLOW_PRODUCTION_CANDIDATE_WITH_REMAINING_GATES`

**This sprint did not merge, deploy GitHub Pages or Firebase, provision claims, or access production data.**

## Candidate identity

- repository: `easylifehq/easylifehq.github.io`;
- branch: `codex/easylife-production-candidate-wave-8-20260803`;
- starting and expected SHA: `a71de8301d2ccf71c8d66dcd05f637c86d9df470`;
- PR: `#6`, open and draft;
- source-fix commit: `da3d92d47778b29902e6b2a0c2c61c9c73a30c58`;
- generated-root commit: `af89fe0a`;
- reviewed production build source recorded in the publication manifest: `da3d92d47778b29902e6b2a0c2c61c9c73a30c58`.

## Bounded defect fixed

The Projects landing route rendered section-level `h2` headings but no semantic page-level `h1`. This was reproduced at 320 x 568 and corrected by promoting the first Projects `PageSection` to `headingLevel={1}`. The existing release-accessibility test now covers Capture, Plan, and Projects.

The production Pages root was regenerated through the guarded publication tool from the exact source-fix commit. `CNAME` and `.nojekyll` were preserved, the 91-file inventory verified, and a second publication check converged with zero create, update, or delete operations.

## Final local verification

`powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-release.ps1` passed after the fix:

- application tests: 72/72;
- authenticated Firestore Emulator tests: 7/7 against demo project `demo-easylife-wave2`;
- TypeScript project check: pass;
- Vite production build: pass, 210 modules;
- publication/server/input tests: 30 discovered, 29 pass and one documented Windows symlink-privilege skip;
- staged publication inventory verification: 91/91;
- Functions syntax lint: pass;
- web and Functions critical advisory gates: pass.

A separate production-configured build, using only the already committed public Firebase web configuration held in process memory, also passed:

- approved project identity: `pipeline-2f422`;
- required public web fields: 6/6;
- optional measurement field: present;
- text files scanned for prohibited server/provider credentials and machine paths: 85;
- guarded publication convergence: 91 unchanged, two preserved, zero create/update/delete.

No configuration value, token, private credential, production session, or production record was printed or persisted by the sprint.

## Browser smoke evidence

The committed root was served through `scripts/serve-pages-candidate.mjs` on loopback only.

- representative desktop routes at 1440 x 900: pass;
- representative phone routes at 390 x 844: pass;
- ten critical narrow routes at 320 x 568: no horizontal overflow;
- Projects post-fix: exactly one `h1`, `Start a project`;
- mobile navigation: dialog opens and Escape closes it;
- service worker: controlling with `easylife-shell-v6`;
- offline Progress reload: pass;
- online recovery: pass;
- critical demo navigation: 119 observed requests, all loopback HTTP requests or inline data URLs;
- console warnings/errors: zero.

The export UI completed its click handler and displayed its success message, but the in-app browser harness did not surface a download event. Deterministic JSON/CSV content, schema, manifest, escaping, formula neutralization, and secret exclusion remain covered by application tests. Physical browser download/share-sheet behavior is still a field gate.

## Operational holds

- installed-PWA testing on a physical iPhone and Android phone;
- human review and explicit approval for Pages publication;
- separate human review and explicit approval for Firebase rules and the three named Functions;
- human approval of rollback SHA `5fa26608ed74de5d8f6dac2875c5c88b06b76c54`;
