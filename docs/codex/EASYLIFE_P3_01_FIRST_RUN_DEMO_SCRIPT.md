# EasyLife P3-01 First-Run Demo Script Polish

Date: 2026-05-31
Status: `P3_01_COMPLETE`

## Scope

P3-01 focused on making the existing safe app feel more demo-ready by showing the north-star loop directly on Today. This task did not add new features, external capabilities, hidden writes, live AI, true push, calendar sync, sending, geocoding, contact sync, account deletion, token storage, deployment, package changes, or Firebase/auth/rules/functions changes.

## What Changed

- Today now includes a compact `Demo path` section titled `The calm assistant loop`.
- The path shows the intended first-run story:
  - Start in Notes.
  - Add the next task to Inbox.
  - Plan lightly after review.
  - End at Settings for the trust check.
- The copy preserves P0-P2 boundaries: review-first helpers, no live AI, no sending, and no external sync.

## Acceptance Checks

- The first-run path is visible from Today.
- The path links to existing safe routes only.
- The copy does not imply live AI, true push, calendar sync, geocoding, email/text sending, contact sync, account deletion backend, hidden writes, token storage, automatic scheduling, or external actions.
- Build: passed with `npm.cmd run build` from `app-vNext`.
