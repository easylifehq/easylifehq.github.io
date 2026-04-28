# Codex Unattended Run Policy

This repo supports a bounded unattended Codex loop for small, safe tasks.

## The loop owns the workflow

PowerShell is the supervisor. Codex may inspect files, edit files, and review its own diff, but the outer script owns task selection, builds, reports, task completion, and commits.

For each round, the loop:
1. Selects the first unchecked task in `docs/codex/TASK_QUEUE.md`.
2. Asks Codex to implement only that task.
3. Runs guardrails against the diff.
4. Runs `npm.cmd run build` from `app-vNext`.
5. Asks Codex to review and fix only issues in the current diff.
6. Runs guardrails again.
7. Runs the final external build.
8. Marks the task complete, appends `docs/codex/NIGHTLY_REPORT.md`, and commits only after the final build passes.

## Safe unattended tasks

Use the loop for small, specific tasks such as:
- copy-only UI cleanup
- spacing-only UI cleanup
- docs cleanup
- low-risk component polish
- tiny bug fixes with an obvious expected result

Good task shape:

```md
- [ ] EasyList tiny cleanup: inspect EasyList UI files and make one copy-only or spacing-only improvement. Do not change logic, routing, auth, Firebase, or data structure.
```

## Tasks that should not run unattended

Do not put these in the unattended queue:
- auth changes
- Firebase rules or Cloud Functions
- billing, DNS, deployment, or production config
- secrets, API keys, credentials, or environment files
- database migrations or data model changes
- package/dependency changes
- broad rewrites
- old-site changes

## Guardrails

The guardrail script stops the loop if Codex changes forbidden paths, touches task/report files directly, edits dependency manifests, changes too many files, or makes a docs-only task touch app code.

Raw logs are written to `.codex-logs/`, which is excluded locally through `.git/info/exclude`.

## ChatGPT Pro handoff

After a run, use `scripts/codex-brief.ps1` to generate a compact project-lead brief. Paste that brief into the ChatGPT Pro project and ask it to decide whether to continue, revise the queue, or stop.

## Practice branch review

When reviewing a `codex/practice-*` branch the next day, start with the guardrail result, the final external build result, and the changed-file list before reading individual diffs. Confirm that the branch only touched allowed paths for the selected tasks and that docs-only tasks changed docs only.

Review the diff in small slices that match the task queue order. Do not mark additional tasks complete during review; leave completion, reports, commits, and branch cleanup to the supervisor workflow.
