# Versioning

EasyLife uses the app package version in `app-vNext/package.json` as the source of truth for the shipped app version.

## Current Version

- Current app version: `4.5.0`
- Next patch target: `4.5.1`
- Next feature target: `4.6.0` Firebase Rules Verification.

## What To Update

For any versioned app release, update:

- `app-vNext/package.json`
- `app-vNext/package-lock.json`
- `CHANGELOG.md`
- `docs/ROADMAP.md`

Docs-only planning changes do not need to bump the app package version unless they are being treated as a formal release.

## Version Rules

- Patch release: bug fixes, copy fixes, small layout fixes, and low-risk polish.
- Minor release: new user-facing features, redesigned workflows, or new settings/data behavior.
- Major release: a stable milestone with broad app-level changes.

## Release Checklist

Before starting a release batch:

- Confirm the current git status.
- Confirm the current version in `app-vNext/package.json`.
- Confirm the release target in `docs/ROADMAP.md`.
- Pick one release section as the active scope.

Before finishing a release batch:

- Run the relevant build or test command.
- Update `CHANGELOG.md`.
- Mark completed roadmap items as done.
- Bump `app-vNext/package.json` and `app-vNext/package-lock.json` if app behavior changed.
- Rebuild deployable root files when the React app changes.
- Confirm git status and summarize changed files.

## Recommended Release Order

1. `3.1.7` Stability Sweep.
2. `3.2.0` Task and Calendar Foundation.
3. `3.3.0` Calendar and Settings Upgrade.
4. `3.4.0` Fast Capture and Notes Integration.
5. `3.5.0` EasyWorkout Redesign.
6. `3.6.0` EasyStatistics Hub.
7. `3.7.0` EasyProject and Pipeline Routing.
8. `3.8.0` AI Assistance Layer.
9. `3.9.0` Calendar Recurrence and Category Customization.
10. `3.10.0` Settings Navigation Split.
11. `3.11.0` Notes Library Organization.
12. `3.12.0` EasyWorkout Polish.
13. `3.13.0` AI Routing Suggestions.
14. `3.14.0` Final 3.x Stability Sweep.
15. `3.14.2` Version sync and bug-hunt patch.
16. `3.15.0` Demo, Onboarding, and Landing Pages.
17. `3.15.1` Presentation Copy Polish.
18. `3.16.0` Core UX Refinement.
19. `3.17.0` Settings Deepening.
20. `3.18.0` Data Review and Export.
21. `3.19.0` High-Tech Visual Polish.
22. `3.19.1` Visual QA Patch.
23. `3.19.x` Real-Use Patch Cycle.
24. `3.20.0` Security Hardening.
25. `4.0.0` Mobile App Foundation.
26. `4.0.2` Mobile Install and Runtime Polish.
27. `4.0.3` Mobile Resume Polish.
28. `4.1.0` Notification Foundation.
29. `4.1.1` Notification Preview.
30. `4.2.0` Mobile Polish and Reliability.
31. `4.3.0` Mobile Distribution Prep.
32. `4.4.0` AI Assistant Foundation.
33. `4.5.0` Planner Item Types.
34. `4.6.0` Firebase Rules Verification.
35. `5.0.0` EasyDrinks and EasyGames Suite Expansion.

`4.0.0` is now the mobile app foundation target. EasyDrinks and EasyGames move to `5.0.0` so the phone app, notifications, security hardening, and real-use reliability come first. Deeper Firebase rules verification is parked at `4.6.0` so the calendar/task planner model can land first.
