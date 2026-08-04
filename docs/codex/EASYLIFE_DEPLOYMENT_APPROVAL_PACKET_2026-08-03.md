# EasyLife deployment approval packet

**MERGING THE GENERATED-ROOT PR MAY PUBLISH PRODUCTION. DO NOT MERGE WITHOUT EXPLICIT DEPLOYMENT APPROVAL.**

Candidate status: `YELLOW_PRODUCTION_CANDIDATE_WITH_REMAINING_GATES`
Draft PR only. Firebase deployment is separate and has not occurred. Green CI alone is not approval.

## Candidate identity

| Item | Verified value |
| --- | --- |
| Repository | `easylifehq/easylifehq.github.io` |
| Branch | `codex/easylife-production-candidate-wave-8-20260803` |
| Wave 7 base | `5fa26608ed74de5d8f6dac2875c5c88b06b76c54` |
| Reviewed source SHA | `09e8b959deccfdd77537d1a69e6382afbe1091f8` |
| Generated-output commit | `cb630db2942e69fada4c6eec870144d44e3a8a1b` |
| Inventory SHA-256 | `5BB5AA54E4340ECC5515EEED67398678B3EB5DB30BD037AAEF21F7606923FC7B` |
| Payload | 91 files |
| Root plan | 75 create / 11 update / 181 delete / 5 unchanged / 2 preserved |
| Pages source | `main` at `/` (authenticated repository metadata) |
| Firebase project | `pipeline-2f422` |
| Proposed rollback | `5fa26608ed74de5d8f6dac2875c5c88b06b76c54` — awaiting human approval |

The rollback proposal is the verified `origin/main`/Pages source checkpoint immediately before this candidate. It is not approved merely because it is recorded here.

The draft PR's four hosted checks passed at candidate commit `18b5d085`: complete verification/artifact, Functions/advisory gate, web tests/build, and production-configured root integrity. Green CI is evidence, not deployment approval.

## Predeployment approval fields

- [ ] Pages generated-root diff reviewed by: ____________________  Date/time: ____________________
- [ ] Pages publication explicitly approved by: ____________________  Date/time: ____________________
- [ ] Firebase rules/Functions diff reviewed by: ____________________  Date/time: ____________________
- [ ] Firebase deployment explicitly approved by: ____________________  Date/time: ____________________
- [ ] iPhone installed-PWA checklist passed by: ____________________  Device/iOS: ____________________
- [ ] Android installed-PWA checklist passed by: ____________________  Device/Android: ____________________
- [ ] Proposed rollback SHA approved by: ____________________  Date/time: ____________________
- [ ] Provider operator custom claim verified by: ____________________  Operator UID kept outside this document
- [ ] Deployment window approved: ____________________ through ____________________
- [ ] Named deployment operator: ____________________
- [ ] Monitoring owner: ____________________

Any blank field is a hold.

## Predeployment commands

Run in a fresh reviewer worktree after checking out the exact draft-PR head:

```powershell
git status --short
git log -5 --oneline
npm.cmd ci --prefix app-vNext
npm.cmd ci --prefix functions
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-release.ps1
node .\scripts\verify-production-publication.mjs
node .\scripts\prepare-pages-publication.mjs --verify-stage C:\path\to\downloaded-ci-candidate
node .\scripts\prepare-pages-publication.mjs --check
```

The production repository variables must be supplied by the approved GitHub Actions variable boundary. Do not create or commit an `.env` file and do not print their values.

Before approval, confirm the draft PR checks are green, the physical field record is complete, the root diff changes only owned generated paths, `CNAME` is unchanged, and the PR is still draft.

## Pages publication boundary

The repository uses Pages source `main` at `/`. Merging the generated-root PR may therefore publish the production site through existing Pages behavior. There is no separate Pages CLI command in this packet. The merge itself is a deployment-affecting action and requires the explicit Pages approval above.

Do not mark the PR ready or merge it based only on green CI.

## Separate Firebase deployment

This command has not been run. It is permitted only after the Firebase approval field is signed and the operator/project identity is rechecked:

```powershell
firebase use pipeline-2f422
firebase deploy --only firestore:rules,functions:assistantIntakeSuggestion,functions:analyzeTaskBrainDump,functions:planProjectWithAi
```

Exact callable Functions in scope:

1. `assistantIntakeSuggestion`
2. `analyzeTaskBrainDump`
3. `planProjectWithAi`

No Hosting target is included. No Firebase Admin credential belongs in GitHub Pages or the production web build. Provider access remains held until the server-side custom claim is explicitly verified; no claim is provisioned by this PR.

## Postdeployment verification

Only after an approved Pages merge or Firebase deployment:

```powershell
gh api repos/easylifehq/easylifehq.github.io/pages
gh run list --repo easylifehq/easylifehq.github.io --limit 10
```

Then, without using a real user's data:

1. verify landing and login surfaces;
2. verify a newly provisioned dedicated test account only if separately approved;
3. verify deep-route refresh and asset/media types;
4. verify PWA install/update/offline behavior on the signed physical devices;
5. inspect console and network for unexpected failures;
6. verify the three callable Functions only with approved synthetic inputs and an approved operator claim;
7. record Pages build SHA, Firebase release identifiers, timestamps, operator, and monitoring result in a new postdeployment receipt.

## Rollback process

If Pages is unhealthy, stop further Firebase work. Revert the deployment merge through a new reviewed PR; do not force-push or rewrite `main`. Re-run the current publication verifier and route/PWA checks on the rollback root. The proposed last-known-good source is `5fa26608ed74de5d8f6dac2875c5c88b06b76c54`, but a human must approve it before use.

If Firebase is unhealthy, use Firebase release history and a separately approved rollback for rules and each named Function. Pages rollback does not roll back Firebase, and Firebase rollback does not roll back Pages. Provider claims must be removed or disabled through an independently approved administrator procedure if the provider boundary is implicated.

Rollback record:

- incident/trigger: ____________________
- approved rollback target: ____________________
- approver: ____________________
- operator: ____________________
- start/end time: ____________________
- Pages result: ____________________
- Firebase result: ____________________
- post-rollback verification: ____________________

## Current holds

- physical iPhone result: pending;
- physical Android result: pending;
- Pages human approval: pending;
- Firebase human approval: pending;
- rollback SHA human approval: pending;
- provider custom-claim verification: pending;
- deployment window/operator: pending.

**DO NOT MERGE THIS DRAFT PR YET.**
