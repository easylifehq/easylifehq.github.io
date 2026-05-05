# EasyLife Phase Commands

Use this protocol to drive future EasyLife work.

## Standard Loop

1. Implement Phase N
2. Test Phase N
3. Patch Phase N
4. Park Phase N
5. Move to Phase N+1

## Implement Command Template

```text
Implement EasyLife Phase N: [phase name].
Use docs/codex/EASYLIFE_NEXT_VARIATION_ROADMAP.md as the source of truth.
Keep scope limited to Phase N.
Preserve existing user work.
Do not start the next phase.
If the phase finishes early, improve proof, polish, tests, empty states, and mobile behavior inside Phase N only.
Avoid backend, auth, Firebase rules/config, payment, dependency, deploy, generated output, old-site, and root production file changes.
Run app-vNext build/static checks and commit a clean state when done.
```

## Test Command Template

```text
Test EasyLife Phase N.
Run the configured build/static checks.
Inspect the relevant protected routes locally when possible.
Verify the Phase N done criteria only.
Report bugs and gaps.
Do not start Phase N+1.
```

## Patch Command Template

```text
Patch EasyLife Phase N.
Fix only the bugs found during Phase N testing.
Preserve user work and existing behavior.
Avoid backend, auth, Firebase rules/config, payment, dependency, deploy, generated output, old-site, and root production file changes.
Run checks again and commit a clean state.
```

## Park Command Template

```text
Park EasyLife Phase N.
Make sure no EasyLife fleet jobs are still running for this phase.
Commit valid work, leave the repo clean, and summarize:
- what changed
- what was tested
- what remains
- whether Phase N+1 is ready
Do not generate new feature work.
```

## Fleet Self-Sufficiency Rules

- A phase task may improve only the current phase.
- If blocked, make the smallest safe repair and rerun checks.
- If a task requires forbidden scope, quarantine it and choose a safe task in the same phase.
- Keep a clear before/after note for visible changes.
- Prefer subtraction and consolidation before adding controls.
- Keep optional modules hidden or quiet until their phase.
