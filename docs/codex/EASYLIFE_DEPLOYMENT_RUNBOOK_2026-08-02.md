# EasyLife Wave 6 Deployment Runbook

Status: `HOLD_UNTIL_EXPLICIT_DEPLOYMENT_APPROVAL`

This runbook describes a future controlled deployment. Wave 6 did not merge or deploy anything.

## Current blockers

1. The draft PR must be reviewed and hosted checks must be green.
2. One physical iPhone and one physical Android must complete the device-only checklist in the release test matrix.
3. A human must explicitly approve production Firebase and GitHub Pages changes. Source-edit authorization is not deployment authorization.
4. The root GitHub Pages files are generated output and remain older than `app-vNext`. The repository has no tested promotion script that copies `dist` to root, refreshes `404.html`, preserves `CNAME`, and handles stale hashed assets. The promotion must be performed in a separate reviewed deployment commit.
5. Before deploying the hardened provider Functions, production custom-claim provisioning must be confirmed. Ordinary accounts will intentionally receive 403; only `easylifeAiAccess`/`easylifeOperator` claim holders may use the relevant paid capabilities.
6. `old-site/` must remain an archive and must never be copied into the publication artifact or deployed as Functions.

## Release inputs

- Candidate branch: `codex/easylife-release-candidate-wave-6-20260802`
- Verified source implementation: `75526139798b8febd6de54abf6773491143fc26f`
- Required runtime: project Node version plus Java 21 for the Firestore Emulator
- Release gate: `scripts/verify-release.ps1`
- Firebase project, billing, DNS, secrets, and production data are outside this runbook until explicitly approved.

## 1. Reproduce in a clean worktree

Run only after selecting the reviewed PR SHA:

```powershell
git fetch origin
git worktree add C:\Dev\easylife-wave6-release <APPROVED_PR_SHA>
Set-Location C:\Dev\easylife-wave6-release
git status --short
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-release.ps1
```

Stop if the worktree is dirty, any gate fails, Java is not 21-compatible, or the SHA differs from the approved PR.

## 2. Confirm production controls

Before any Firebase command:

- Confirm the exact Firebase project with `firebase use` and have a second reviewer compare it to the approval record.
- Confirm `OPENAI_API_KEY` remains server-side; do not print or rotate it as part of this release.
- Confirm an authorized operator test account has the intended server-issued claim and an ordinary synthetic account does not.
- Confirm the Functions list is limited to `assistantIntakeSuggestion`, `analyzeTaskBrainDump`, and `planProjectWithAi`.
- Confirm Firestore rules diff is exactly the reviewed allowlist/validation change.
- Confirm rollback access and the prior approved production SHA.

Read-only preflight:

```powershell
firebase use
firebase functions:list
git diff origin/main...HEAD -- firestore.rules functions/index.js firebase.json
```

## 3. Prepare the static publication commit

The root is the GitHub Pages deploy target; `app-vNext` is source. Do this on a separate deployment branch only after approval:

```powershell
git switch -c codex/easylife-wave-6-approved-deployment <APPROVED_PR_SHA>
Set-Location app-vNext
npm.cmd ci
npm.cmd run build
Set-Location ..
Copy-Item -Path .\app-vNext\dist\* -Destination . -Recurse -Force
Copy-Item -LiteralPath .\index.html -Destination .\404.html -Force
git status --short
git diff -- index.html 404.html sw.js manifest.webmanifest assets
```

Required review before commit:

- `CNAME` is unchanged.
- No source directory, Firebase file, documentation, or `old-site/` is staged as generated output.
- `index.html` and `404.html` reference only newly built hashed assets.
- `sw.js` is the reviewed `easylife-shell-v6` worker.
- The root app is served locally and the primary desktop/phone smoke matrix is repeated.
- Obsolete hashed assets may remain temporarily; remove them only with an explicit reviewed file list, never a broad recursive delete.

Then stage only the reviewed generated files and create one auditable publication commit. Do not rewrite the known pre-release root `index.html` mismatch on the source branch.

## 4. Deploy Firebase changes

This is a separate explicit approval gate because it changes production authorization and cost-bearing endpoints:

```powershell
firebase deploy --only firestore:rules,functions:assistantIntakeSuggestion,functions:analyzeTaskBrainDump,functions:planProjectWithAi
```

Stop on project mismatch, unexpected Function selection, secret prompt, rules compilation error, or claim-provisioning uncertainty. Never deploy all archived Functions.

## 5. Publish GitHub Pages

Use the repository's approved PR/branch publication mechanism. No local `gh-pages` or Firebase Hosting command is configured. Before merging the generated-output deployment PR, verify repository Pages settings identify the expected root branch/folder and obtain the final production approval.

The merge itself may publish the site; treat it as the deployment action. Do not merge from this Wave 6 task.

## 6. Post-deployment verification

Use only synthetic records:

1. Open `/`, `/app/hq`, `/app/easylist/add`, `/app/command`, `/app/plan`, `/app/easyworkout/dashboard`, `/app/easyworkout/log`, `/app/easystatistics?tab=workout`, and `/app/settings` on desktop and phone.
2. Verify the active worker/cache is `easylife-shell-v6`; close all old tabs, reopen, then verify offline reload of a primed deep route.
3. Verify an ordinary authenticated synthetic account is denied by all three paid provider gates without a provider request.
4. Verify only an explicitly claimed synthetic operator can perform the separately approved provider smoke. Never use private text.
5. Verify cross-account Firestore reads/writes and unsupported/nested collections are denied using emulator results first; production probing must remain synthetic and minimal.
6. Start a workout, edit and navigate immediately, reload, resume, save once, retry once, and verify one session/document.
7. Download workout and whole-account exports; confirm goals, units, time zone, versions, escaping, and no secret-shaped fields.
8. Inspect console, failed network requests, auth/rules errors, and production monitoring. Stop on any unexplained write or provider call.

## 7. Rollback

If the static site is defective, revert the single generated-output publication commit through a reviewed PR and verify the service worker converges after all tabs close. Do not force-push or manually edit live files.

If rules or Functions are defective, check out the prior approved production SHA in a clean worktree and deploy only the prior `firestore:rules` and the same three named Functions. Do not restore the permissive owner wildcard or unauthenticated provider access as a shortcut; if safe rollback cannot preserve those boundaries, disable the provider features and stop.

Record deployed SHA, Firebase project, Function revisions, rules release, Pages commit, timestamps, approvers, smoke results, and rollback decision in a new deployment receipt.

## Approval record required

Deployment may proceed only when all fields are explicit:

- Approved PR SHA
- Production Firebase project ID
- GitHub Pages source branch/folder
- Static publication approver
- Firestore/Functions approver
- Physical iPhone result
- Physical Android result
- Rollback SHA
- Deployment window and operator

Until then: `HOLD_UNTIL_EXPLICIT_DEPLOYMENT_APPROVAL`.
