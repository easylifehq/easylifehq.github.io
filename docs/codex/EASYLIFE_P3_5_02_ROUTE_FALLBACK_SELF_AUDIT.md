# EasyLife P3.5-02 Route And Fallback Self-Audit

Date: 2026-05-31

Status: P3_5_02_COMPLETE

## Purpose

This packet re-checks EasyLife route safety while the final external audit is deferred. It is a source self-audit only: no new product capability was added, and no app code was changed.

## Verdict

PASS_WITH_NO_CODE_CHANGE

The current router still protects the demo path. Canonical aliases, Settings redirects, Plan/Workout safe landings, legacy nested redirects, and invalid `/app/*` fallback behavior are wired in source and preserve review query strings where the router owns the redirect.

## Source Files Checked

- `app-vNext/src/app/router/index.tsx`
- `app-vNext/src/lib/mobile/appRouteMemory.ts`
- `app-vNext/src/lib/firestore/settings.ts`
- `app-vNext/src/components/navigation/SiteFooter.tsx`
- Targeted source references under `app-vNext/src`

## Core Route Findings

### Startup And Public Home

- `/` sends signed-in users to either the configured startup route or last-used app route.
- `/app` uses the same startup route behavior inside the authenticated layout.
- Both paths preserve `location.search` and `location.hash` when navigating.
- Startup fallback remains `/app/hq`, which is the Today/home base.

### Canonical Demo Aliases

The app-level aliases are present and safe:

- `/app/today` redirects to `/app/hq`.
- `/app/inbox` redirects to `/app/easylist/add`.
- `/app/notes` redirects to `/app/easynotes`.
- `/app/people` redirects to `/app/easycontacts`.
- `/app/plan` renders a safe Plan landing page.
- `/app/workout` renders a safe Workout landing page.

The redirect aliases use `PreserveSearchRedirect`, which carries the current query string and hash. This keeps `?demo=1` and similar review flags alive through the route repair path.

### Nested Legacy Redirects

Legacy nested routes stay safe:

- `/app/easylist` redirects to `/app/easylist/dashboard`.
- `/app/easylist/inbox` redirects to `/app/easylist/add`.
- `/app/easylist/today` redirects to `/app/easylist/dashboard`.
- `/app/easylist/upcoming` redirects to `/app/easylist/dashboard`.
- `/app/easycalendar` redirects to `/app/easycalendar/month`.
- `/app/easycalendar/week` redirects to `/app/easycalendar/month`.
- `/app/easypipeline` redirects to `/app/easypipeline/dashboard`.
- `/app/easyworkout` redirects to `/app/easyworkout/dashboard`.

These redirects also use `PreserveSearchRedirect`.

### Settings And Privacy

- `/settings` redirects to `/app/settings` while preserving search and hash.
- `/app/settings` renders Settings inside the authenticated app.
- The footer `Privacy & Terms` link targets `/app/settings?section=trust`, which is the canonical trust/privacy section.
- Settings contains visible draft policy labels for Privacy Policy and Terms; there is no live legal hosting claim.

### Plan Safe Landing

`/app/plan` does not redirect into an uncertain route or blank state. It renders a Plan landing page with:

- `Open Plan day` -> `/app/easycalendar/day`
- `Return to Today` -> `/app/hq`
- Copy that says nothing is scheduled automatically and the user chooses what moves from Inbox into the day.

Both actions preserve the current query string.

### Workout Safe Landing

`/app/workout` does not redirect into an uncertain route or blank state. It renders a Workout landing page with:

- `Open Workout dashboard` -> `/app/easyworkout/dashboard`
- `Open Log` -> `/app/easyworkout/log`
- `Return to Today` -> `/app/hq`
- Copy that says no workout AI or hidden changes run from this route.

All actions preserve the current query string.

### Invalid App Routes

Invalid `/app/*` routes render `SafeAppNotFoundPage`. The fallback:

- Shows `Route safety`.
- Names the missing path.
- Says nothing was changed or saved.
- Offers `Return to Today` -> `/app/hq`.
- Offers `Open Inbox` -> `/app/easylist/add`.
- Preserves the current query string on both actions.

This is the correct demo behavior: no blank route, no unexpected module, and no write action.

## Route Memory Check

`appRouteMemory.ts` labels the canonical aliases and working module routes consistently:

- `/app/hq` and `/app/today` -> Today
- `/app/inbox` and `/app/easylist/*` -> Inbox
- `/app/notes` and `/app/easynotes/*` -> Notes
- `/app/plan` and `/app/easycalendar/*` -> Plan
- `/app/people` and `/app/easycontacts/*` -> People
- `/app/workout` and `/app/easyworkout/*` -> Workout

The memory helper ignores `/app` and `/app/settings`, which avoids reopening a generic index route or Settings as the daily startup route.

## Targeted Source Sweep Notes

- Direct alias source references found: one saved-banner link to `/app/inbox`; this is acceptable because `/app/inbox` is a canonical alias and safely redirects to the working Inbox route.
- Direct Settings privacy source reference found: footer link to `/app/settings?section=trust`; this is acceptable because it targets the canonical Settings route and trust section.
- No source sweep finding required a code change for P3.5-02.

## Manual Follow-Up

When Spencer runs the signed-in checklist, include these quick route checks:

- `/app/today?demo=1` lands on Today with `?demo=1` preserved.
- `/app/inbox?demo=1` lands on Inbox with `?demo=1` preserved.
- `/app/notes?demo=1` lands on Notes with `?demo=1` preserved.
- `/app/people?demo=1` lands on People with `?demo=1` preserved.
- `/settings?demo=1&section=trust` lands on Settings with query/hash behavior intact.
- `/app/plan?demo=1` shows the safe Plan landing.
- `/app/workout?demo=1` shows the safe Workout landing.
- `/app/not-a-real-route?demo=1` shows the route-safety fallback.

## Boundary Proof

- No Firebase/auth/rules/functions/billing/DNS/secrets/env files were touched.
- No package/dependency/deploy/generated output was touched.
- No deploy was run.
- No live AI/provider call was made.
- No true push notification was sent.
- No calendar sync, geocoding/maps, email/text sending, contact sync, account deletion backend, hidden write, token storage, automatic scheduling, or external action was added.

## Build

Not run. This was a docs/source-audit task with no app code change, and it is not the final proof task.

