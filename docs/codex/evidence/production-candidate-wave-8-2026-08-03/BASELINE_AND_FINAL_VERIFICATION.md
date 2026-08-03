# Baseline and final verification

## Identity

- base/proposed rollback: `5fa26608ed74de5d8f6dac2875c5c88b06b76c54`;
- reviewed source: `09e8b959deccfdd77537d1a69e6382afbe1091f8`;
- generated root: `cb630db2942e69fada4c6eec870144d44e3a8a1b`;
- inventory: `79B24D0362132C1CE0AFFABFC0C133D847CC8FFB404FB4C297E6B12AE69E3ADD`;
- approved Firebase project: `pipeline-2f422`;
- variables: 6/6 required present; optional measurement present; values deliberately omitted.

## Commands and results

`powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-release.ps1`, with repository variables loaded into the process environment, passed:

- 72/72 application tests;
- 7/7 authenticated Firestore Emulator tests using demo project `demo-easylife-wave2`;
- TypeScript;
- production Vite build, 210 modules;
- 28 publication/server/input tests: 27 pass, 1 Windows-only symlink privilege skip;
- staged candidate creation and 91-file SHA-256 verification;
- Functions syntax lint;
- application and Functions critical production advisory gates.

`node scripts/verify-production-publication.mjs` passed with 6/6 required variable names, optional measurement present, and 85 text files scanned. It confirmed the approved project and rejected prohibited server/provider credentials and machine paths without emitting configuration values.

`node scripts/prepare-pages-publication.mjs --check`, with `EASYLIFE_PUBLICATION_SOURCE_SHA` locked to the committed manifest's reviewed ancestor, reported 91 unchanged payload files, preserved `CNAME`/`.nojekyll`, and zero create/update/delete operations.

Two isolated generations and the applied root produced byte-identical inventories.

## Browser and PWA

- 63/63 desktop at 1440x900;
- 63/63 phone at 390x844;
- 10/10 critical routes at 320x568;
- seven critical demo pages: 132 loopback requests, zero external/production Firebase requests, zero console warnings/errors;
- production login: sign-in surface present, unavailable state absent, no sign-in/provider request;
- exact-root deep routes: HTTP 404 with renderable shell;
- root/manifest/service worker/icons: expected status and media type;
- service worker: active and controlling, cache `easylife-shell-v6`;
- offline Progress reload and online recovery: pass;
- final browser log: zero warnings/errors.

The source service-worker tests independently cover successful navigation refresh, refusal to cache failed assets, and deletion of stale EasyLife caches while preserving unrelated origin caches.

## Advisory snapshot

Application audit: 4 total (1 high, 3 moderate); Functions audit: 9 moderate; no critical. No dependency changed in Wave 8. Vite/esbuild are development tooling and the complete audit fix is breaking. Router advisories are production/reachable with a reported non-major path and are deferred to a source PR with full route regression. The Functions chain is inherited and npm proposes breaking changes; EasyLife does not call the vulnerable `uuid` buffer API directly. No forced fix ran.
