# Versioning

EasyLife uses the app package version in `app-vNext/package.json` as the source of truth for the shipped app version.

## Current Version

- Current app version: `3.4.0`
- Next patch target: `3.4.1`
- Next feature target: `3.5.0`

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
