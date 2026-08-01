# EasyLife Weekend Upgrade Baseline

STATUS: BASELINE_GREEN_WITH_KNOWN_LIMITATIONS

## Repository reality

- Active repository: `C:\Dev\easylifehq.github.io`
- Starting branch: `codex/product-EasyLife-20260504-231503`
- Starting SHA: `5fa6149112a6c24d1cbda815a0978dd03425ff61`
- Upgrade branch: `codex/weekend-upgrade-workout-intelligence-20260801`
- Local safety ref: `codex/safety-july-checkpoint-20260801`
- Tracked remote checkpoint before the run: `origin/codex/product-EasyLife-20260504-231503` at `81c7dd84b72c69108acc3da8bf48dabd537945db`
- Local-only July commit: `5fa61491 P4.7: make Today loading truthful`
- Remote reachability after `git fetch --prune origin`: no remote ref contained `5fa61491`.
- Remote safety push: blocked by the execution security approval layer; no remote was changed.
- The empty shell at `C:\Users\codex-agent\Documents\EasyLife` was not used or modified.

## Production drift

The tracked deployed root artifacts were last changed by `def0b30a7102c5d4c252f7ba08052480c1c796cd` (`Deploy Notes capture repair`). The source HEAD is materially ahead: 60 `app-vNext` files differ from `origin/main`, with 3,116 insertions and 796 deletions before this mission. The live production site is therefore not repository truth for this upgrade.

## Baseline commands

| Command | Result |
|---|---|
| `npm.cmd ci` in `app-vNext` | PASS; 157 packages installed; npm reported 10 dependency advisories (1 low, 4 moderate, 3 high, 2 critical). No automatic audit fix was applied. |
| `npm.cmd run build` in `app-vNext` | PASS; TypeScript project build and Vite production build; 183 modules transformed. |
| `npm.cmd run lint` in `functions` | PASS; `node --check index.js`. |
| `git diff --check` | PASS. |
| App lint | NOT AVAILABLE; no app lint script exists. |
| App test | NOT AVAILABLE; `.test.ts` proof modules compile but package.json has no executable test command. Establishing a real workout test command is part of Phase 1. |

## Starting workout architecture and risks

- `EasyWorkoutLogPage` stores a v1 draft directly in localStorage and restores basic routine/date/duration/notes/active-exercise/set fields.
- Autosave has no explicit state machine or announced local/sync state.
- Final save is non-idempotent; rapid or retried submissions can create duplicates.
- The draft is cleared after `addSession` resolves even when demo mode returns `null`, and failure handling is not explicit.
- Set records do not distinguish completion, deletion, warm-up, drop/failure, bodyweight, duration, distance, or optional RIR.
- Estimated max and workload formulas are duplicated in dashboard/statistics UI.
- Statistics aggregate incompatible values and include an unsupported elapsed-time “Recovery read.”
- Demo mode currently supplies no workout fixtures through `EasyWorkoutContext`.
- Routes include public marketing, authentication, daily app surfaces, nested module routes, redirects, and a safe app not-found route; the final route matrix will use the router as its source.

## Baseline release verdict

The source builds cleanly, but the workout data-loss/duplicate-save risks, non-executable tests, ad-hoc statistics, empty demo workout data, npm advisories, and missing physical-device/PWA proof prevent a release-ready verdict at baseline.
