# Wave 7 baseline and final verification

## Checkpoint

- Expected and verified `origin/main`: `c8e0d7d23ef8f7e9a73731957a00eaa8c9ef0c57`.
- Branch: `codex/easylife-publication-automation-wave-7-20260803`.
- `main` was updated with `git pull --ff-only`; the Wave 6 merge was present.
- The original worktree's known root `index.html` normalization mismatch remained unstaged and unmodified by Wave 7.
- A previously absent sibling worktree, `C:\Dev\easylife-wave7-dry-run`, was created for the clean-checkout dry run. Git immediately reported checkout-normalized `index.html` and `404.html` differences because tracked HTML bytes conflict with `*.html eol=lf`; no tool caused those changes.

## Baseline

Before implementation, the Wave 6 gate passed: application 70/70, Firestore Emulator 7/7, TypeScript, 210-module production build, Functions syntax lint, and production critical advisory gates.

The first publication-candidate attempt correctly failed because the prior bundle contained a production Firebase client identity. Wave 7 removed the bundled defaults, added boundary tests, and made review builds fail closed. No production Firebase project was accessed or modified.

## Final local gate

Command:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-release.ps1
```

Result: exit `0`.

- application: 72/72 passed;
- authenticated Firestore Emulator: 7/7 passed using demo project `demo-easylife-wave2`;
- publication/review-server tests: 24 discovered, 23 passed, 1 Windows symlink-privilege skip; the escaping-symlink case passes on Linux CI and the publication suite separately covers Windows-safe rejection paths;
- TypeScript: passed;
- production build: passed, 210 modules, application `4.37.1`;
- staged candidate: 91 payload files and all hashes verified;
- Functions lint: passed;
- application production critical advisory gate: passed;
- Functions production critical advisory gate: passed with the final inherited eight moderate transitive `uuid` findings reported and no forced/breaking change.

No generated repository-root output was staged or applied.
