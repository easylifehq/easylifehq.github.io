# EasyLife Wave 7: deterministic publication automation

Status: `YELLOW_PUBLICATION_AUTOMATION_WITH_LIMITATIONS`

## Outcome

Wave 7 replaced the manual Pages copy procedure with a dependency-free, cross-platform, bounded publication pipeline. It creates and verifies a deterministic review candidate, reports the exact root delta, preserves the custom domain, refuses unsafe repositories/targets/content, and can apply only after a separate deliberate approval. This wave did not apply, publish, merge, or deploy anything.

Base: `c8e0d7d23ef8f7e9a73731957a00eaa8c9ef0c57` (verified Wave 6 merge). Authoritative staged implementation/CI SHA: `8a299a25bab2722523d5f187ea966373cb6741aa`. The final documentation/evidence commit is the branch HEAD reported in the PR and final handoff.

## Implemented

- `scripts/prepare-pages-publication.mjs`: `--check`, `--dry-run`, `--stage`, `--verify-stage`, and guarded `--apply --confirm-apply` modes with deterministic exit codes.
- Explicit ownership of six fixed generated files plus `assets/**` and `icons/**`; no unbounded root deletion.
- Byte-preserved `CNAME`/`.nojekyll`, exact stale-owned planning, atomic copies, post-apply verification, symlink/traversal/partial-target refusal, and clean named-branch requirement.
- Versioned manifest and sorted SHA-256 inventory with source SHA, app version, commit-time timestamp policy, sizes, and hashes.
- Twenty fixture tests spanning idempotency, parity, stale plans, path separators, symlinks, malformed/missing builds, prohibited files/content, dry-run/check/apply exits, secret/machine-path rejection, and isolated apply.
- `scripts/serve-pages-candidate.mjs` plus four tests for a truthful static Pages-style 404 fallback and safe regular-file serving.
- Read-only CI artifact generation in the normal release workflow and a focused manually dispatchable/PR workflow with Node 24 and Java 21.
- Production Firebase configuration removed from source defaults. Review builds fail closed; loopback demo uses only the Firestore Emulator identity and the tests prove deployed-host demo cannot access Firebase.
- Deterministic promotion and rollback instructions in the artifact contract and deployment runbook.

## Final candidate

- location: `C:\Dev\easylife-wave7-publication-candidate-8a299a25-clean`;
- schema: `easylife-pages-publication/v1`;
- source SHA: `8a299a25bab2722523d5f187ea966373cb6741aa`;
- app: `4.37.1`;
- payload: 91 files;
- SHA-256 of `pages-publication-sha256.txt`: `4257C56AEC78D082EB15DB16464FF666A55081A892241C2218C4489BE4BB6E4F`;
- every payload/manifest hash: verified;
- no source maps, credential-shaped content, production Firebase identity, absolute machine paths, or obsolete asset references.

The candidate was served directly as the site root at `http://127.0.0.1:4189/`. This URL was local evidence only and is not a deployment.

## Exact root plan

The clean-checkout plan is captured in `root-versus-candidate-plan.json`:

- create 75;
- update 11;
- delete 181 stale managed assets;
- unchanged 5;
- preserved 2 (`CNAME` and `.nojekyll`).

The source worktree reports a different unchanged/update split because of the known tracked-HTML normalization state; the clean-checkout result above is authoritative. No planned deletion escapes the owned generated paths. No real-root apply or deletion occurred.

## Verification results

- application 72/72;
- Firestore Emulator 7/7;
- publication/review-server 24 discovered: 23 pass, 1 Windows privilege skip (Linux hosted coverage remains active);
- TypeScript/build: pass, 210 modules;
- Functions lint: pass;
- existing critical advisory gates: pass; the final Functions audit reports eight inherited moderate transitive `uuid` advisories with only a breaking forced resolution, so no dependency change was made;
- hosted draft-PR checks at implementation/evidence SHA `44751371`: 3/3 green (complete publication artifact 1m25s, web 54s, Functions 12s);
- staged route matrix: 63/63 desktop at 1440×900 and 63/63 phone at 390×844 (126/126 total);
- direct deep route: truthful HTTP 404 with renderable `404.html` shell;
- manifest and four icons: HTTP 200 with correct media types;
- service worker: installed/controlling `easylife-shell-v6`;
- offline reload of `/app/easystatistics?demo=1&visual=1`: pass;
- update convergence: stale EasyLife cache removed, current cache present, unrelated cache preserved;
- fresh diagnostic trace: zero non-offline load failures, unexpected HTTP errors, console warnings/errors, production Firebase/Functions requests, or failed local assets. Three observed 404s were the expected deep-route fallback contract.

## Promotion command and safety boundary

Review commands:

```powershell
node .\scripts\prepare-pages-publication.mjs --dry-run --plan C:\Dev\easylife-plan.json
node .\scripts\prepare-pages-publication.mjs --stage C:\Dev\easylife-candidate --plan C:\Dev\easylife-plan.json
node .\scripts\prepare-pages-publication.mjs --verify-stage C:\Dev\easylife-candidate
node .\scripts\serve-pages-candidate.mjs --root C:\Dev\easylife-candidate --port 4187
```

Future approved generated-output worktree only:

```powershell
node .\scripts\prepare-pages-publication.mjs --apply --confirm-apply --plan C:\Dev\easylife-apply-plan.json
```

Without the deliberate flag, clean named branch, expected repository, and exact validated candidate, apply exits with refusal. The command was not run against this repository root.

## Rollback rehearsal

Two independent candidates at SHA `8a299a25...` and the same explicit commit timestamp produced byte-identical inventory hashes (`4257C56A...`). Isolated apply mechanics and stale-owned cleanup passed automated tests. The live rollback SHA is still a required human release input; Firebase rollback remains separate and restricted to reviewed rules plus `assistantIntakeSuggestion`, `analyzeTaskBrainDump`, and `planProjectWithAi`.

## Evidence

- `docs/codex/evidence/publication-wave-7-2026-08-03/pages-publication-manifest.json`
- `docs/codex/evidence/publication-wave-7-2026-08-03/pages-publication-sha256.txt`
- `docs/codex/evidence/publication-wave-7-2026-08-03/root-versus-candidate-plan.json`
- `docs/codex/evidence/publication-wave-7-2026-08-03/route-pwa-matrix.json`
- `docs/codex/evidence/publication-wave-7-2026-08-03/screenshots/`
- `docs/codex/evidence/publication-wave-7-2026-08-03/BASELINE_AND_FINAL_VERIFICATION.md`
- `docs/codex/evidence/publication-wave-7-2026-08-03/CI_ARTIFACT_DETAILS.md`
- `docs/codex/evidence/publication-wave-7-2026-08-03/ROLLBACK_REHEARSAL.md`
- `docs/codex/evidence/publication-wave-7-2026-08-03/REMAINING_GATES.md`

## Limitations and readiness

The automation and review candidate are PR-ready. Production publication is not approved because physical iPhone/Android installed-PWA tests, production custom claims, Firebase project/client-configuration strategy, Pages settings, rollback SHA, HTML-normalization disposition, and human deployment approval remain open. The fail-closed review build intentionally has no production authentication configuration.

`YELLOW_PUBLICATION_AUTOMATION_WITH_LIMITATIONS`
