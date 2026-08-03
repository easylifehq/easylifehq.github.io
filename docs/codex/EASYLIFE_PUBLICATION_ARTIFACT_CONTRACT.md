# EasyLife publication artifact contract

Contract: `easylife-pages-publication/v1`

## Authority and lifecycle

`app-vNext/` is the application source. `app-vNext/dist/` is disposable production-build output. The repository root is the current GitHub Pages publication target, but it is not disposable and is never a recursive-copy or recursive-delete target.

The only supported promotion implementation is `scripts/prepare-pages-publication.mjs`. A candidate is built, staged, verified, reviewed, and browser-tested before a separately approved generated-output commit. Wave 7 does not apply or publish it.

## Owned publication paths

The tool may create, replace, compare, or remove only:

- fixed files: `index.html`, `404.html`, `sw.js`, `manifest.webmanifest`, `pages-publication-manifest.json`, and `pages-publication-sha256.txt`;
- managed trees: regular files below `assets/` and `icons/`.

`404.html` is byte-identical to the built `index.html`. Obsolete files are deletable only when they are regular files inside an owned managed tree and absent from the candidate. There is no wildcard ownership outside these paths.

## Preserved and prohibited paths

`.nojekyll` and `CNAME` are preserved byte-for-byte. Unknown root files are reported as preserved and are never included in a deletion plan.

The candidate rejects:

- `old-site`, source, documentation, tests, coverage, Firebase rules/configuration, Functions source, Git metadata, lockfiles, dependency trees, environment files, logs, and source maps;
- absolute or traversal paths, backslash escapes, symlinks, non-regular files, malformed entrypoints, missing referenced assets, or a target inside the repository;
- credential-shaped paths or content, private keys, bearer tokens, production Firebase configuration, local usernames, drive paths, or other machine-specific values.

Firebase SDK library chunks are allowed code dependencies. A production Firebase client identity is not publication content. Review builds therefore fail closed when `VITE_FIREBASE_*` inputs are absent; production authentication remains an explicit security/deployment approval gate.

## Manifest and integrity

`pages-publication-manifest.json` records:

- contract/schema version;
- selected source SHA and application version;
- UTC build timestamp and its policy (`source-commit-time` by default);
- sorted owned payload entries with relative POSIX path, byte size, and SHA-256.

`pages-publication-sha256.txt` is a sorted hash inventory of every payload file plus the manifest. The inventory excludes itself. Neither artifact may contain an absolute path or secret. Repeating a build with the same source, lockfiles, runtime, and explicit timestamp must produce byte-identical inventories.

## Modes and exit contract

```text
node scripts/prepare-pages-publication.mjs --check
node scripts/prepare-pages-publication.mjs --dry-run --plan <plan.json>
node scripts/prepare-pages-publication.mjs --stage <new-or-matching-directory> --plan <plan.json>
node scripts/prepare-pages-publication.mjs --verify-stage <directory>
node scripts/prepare-pages-publication.mjs --apply --confirm-apply --plan <plan.json>
```

- exit `0`: validation/verification succeeded or the requested state already matches;
- exit `1`: invalid source, build, candidate, manifest, path, or content;
- exit `2`: `--check` found an expected root mismatch;
- exit `3`: `--apply` was refused because deliberate or repository safety conditions were not met.

`--dry-run` changes no tracked root file. `--stage` accepts an absent directory or a byte-identical completed candidate, and refuses partial, stale, or unrelated contents. `--apply` additionally requires the deliberate flag, the expected repository, a named branch, and an otherwise clean worktree. It copies exact owned files atomically, removes only the exact reviewed stale-owned list, rechecks `CNAME`, and verifies the resulting root. It must never be run from a product/source PR.

## Review boundary

A staged candidate and plan are review evidence, not deployment authorization. The reviewed generated-output commit must stage exact paths from the plan; never use `git add .` at repository root. GitHub Pages settings, production Firebase project/configuration, custom claims, physical installed-PWA results, rollback SHA, and human approval remain separate gates.
