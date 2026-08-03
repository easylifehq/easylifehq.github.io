# EasyLife P3.5-03 Trust And Capability Copy Self-Audit

Date: 2026-05-31

Status: P3_5_03_COMPLETE

## Purpose

This packet checks user-visible EasyLife copy for capability overclaims while the final external audit is deferred. The sweep focused on visible app routes and components, not historical planning docs.

## Verdict

PASS_WITH_NARROW_COPY_FIX

The core demo surfaces still describe EasyLife as review-first and bounded. One optional Projects experiment still used older broad `AI project planner` language, so it was repaired to `Gated project draft planner` / `Request draft` copy. No new capability was added.

## Files Checked

- `app-vNext/src/app/router/index.tsx`
- `app-vNext/src/features/hq/routes/HQPage.tsx`
- `app-vNext/src/features/easylist/routes/EasyListInboxPage.tsx`
- `app-vNext/src/features/easylist/components/TaskComposer.tsx`
- `app-vNext/src/features/easylist/routes/EasyListEmailPage.tsx`
- `app-vNext/src/features/easynotes/routes/EasyNotesEditorPage.tsx`
- `app-vNext/src/features/easynotes/routes/EasyNotesLibraryPage.tsx`
- `app-vNext/src/features/easycontacts/routes/EasyContactsPage.tsx`
- `app-vNext/src/features/easyprojects/routes/EasyProjectsHomePage.tsx`
- `app-vNext/src/features/settings/routes/SettingsPage.tsx`
- Related app/component source under `app-vNext/src/features`, `app-vNext/src/components`, and `app-vNext/src/app`

## Narrow Copy Fix

Changed optional Projects planner copy:

- Settings experiment label: `Project Planner` -> `Gated Project Planner`.
- Settings experiment description now says provider-backed planning remains gated and must be approved before use.
- Projects disclosure: `AI project planner` -> `Gated project draft planner`.
- Projects action: `Generate plan` -> `Request draft`.
- Projects loading: `Planning...` -> `Preparing draft...`.
- Projects save action: `Create project plan` -> `Confirm and create project`.
- Fallback messages now say gated project drafting is unavailable instead of broadly saying AI project planning is unavailable.
- Default generated title fallback changed from `AI planned project` to `Draft planned project`.

This is a copy-only trust repair. It does not remove or add an integration, does not call a provider, and does not change package, deploy, Firebase, auth, rules, functions, billing, DNS, secrets, or env files.

## Core Trust Findings

### Live AI / Provider Calls

Pass.

- Today says Settings confirms local review-first helpers, no live AI, no sending, and no external sync.
- Inbox proof chips include `No provider`, `No live AI`, `Provider test gated`, and `Nothing saved or sent` boundaries.
- Inbox live-provider lane remains framed as disabled/gated, synthetic/demo only, server-only, and unchanged saves.
- Settings Assistant controls say no live AI provider is assumed and provider calls are not live.
- Notes save receipts say no model call or real model-backed recall was created.
- Optional Projects planner now uses gated/review-first draft language instead of broad live-AI wording.

Note: `TaskComposer` still contains old brain-dump AI copy in source, but the only current usage in the Inbox route passes `showBrainDump={false}`. It is not part of the current demo-visible Inbox path. If that component is reused later with brain dump enabled, the copy should be repaired before demo use.

### True Push / Notifications

Pass.

- Settings says reminders are browser-only and not server-delivered push.
- Settings says true push is not live, no push tokens are stored, no server push is sent, and no automatic reminder jobs are scheduled.
- Inbox and Notes preview flows say no notification was scheduled or created.
- The existing notification runtime remains local browser reminder behavior, not a true push claim.

### Calendar Sync / Automatic Scheduling

Pass.

- Settings says external calendar sync is not live and EasyLife is not reading from or writing to Google Calendar, Apple Calendar, Outlook, or ICS feeds.
- Settings says future sync needs consent, review, conflict handling, and rollback before touching an outside calendar.
- Plan safe landing says nothing is scheduled automatically.
- Inbox/Notes preview flows keep plans/reminders/follow-ups preview-only unless the user uses an existing explicit save path.

### Geocoding / Maps / Location

Pass.

- People copy says place labels are manual only.
- People and Settings rule out maps, geocoding, exact addresses, live location, and device location.
- No visible core demo copy claims location lookup or map behavior is live.

### Email / Text Sending / Outside Drafts

Pass.

- Settings says EasyLife does not send email, send texts, create outside drafts, archive mail, or contact anyone from the demo.
- Email examples say delivery is not connected and external draft actions are not live.
- Inbox and Notes receipts say no email/text/send behavior happened.

### Contact Import / Contact Sync

Pass.

- People says contact import/sync is not live.
- Settings says People is not reading phone contacts, Google Contacts, Apple Contacts, Outlook, address book, email, texts, calendar, or social accounts.
- Future import language requires consent, preview, dedupe, field mapping, and rollback.

### Account Deletion Backend

Pass.

- Settings says export first.
- Settings says there is no self-serve delete button or backend deletion action in the demo.

### Hidden Writes / Token Storage / External Actions

Pass.

- Router fallback says nothing was changed or saved.
- Settings says no hidden actions and no hidden calendar writes.
- Inbox fallback and provider-test copy says no hidden read, retry, hidden write, save, send, schedule, sync, memory, geocoding, notification, or external action happened.
- Settings true-push gate says no push tokens are stored.
- Provider/test source uses an auth token only for the gated client request path; visible copy does not claim token storage.

### Placeholders / Draft Legal Copy

Pass.

- Settings labels Privacy Policy and Terms as draft placeholders.
- No visible source claims the final hosted legal pages are approved.

## Residual Watch Item

`TaskComposer` has legacy brain-dump AI copy behind `showBrainDump`. Current Inbox route disables it. If another route enables that composer later, update the labels before demo:

- `Brain dump with AI`
- `AI Analyze Into Rows`
- `AI is finding...`
- `AI will pull out...`

Recommended future wording: `Local/gated brain dump preview`, `Create editable rows`, and copy that says provider-backed parsing is not live unless separately approved.

## Boundary Proof

- No Firebase/auth/rules/functions/billing/DNS/secrets/env files were touched.
- No package/dependency/deploy/generated output was touched.
- No deploy was run.
- No live AI/provider call was made.
- No true push notification was sent.
- No calendar sync, geocoding/maps, email/text sending, contact sync, account deletion backend, hidden write, token storage, automatic scheduling, or external action was added.

## Build

`npm.cmd run build` from `app-vNext` is required for this task because app copy changed.

