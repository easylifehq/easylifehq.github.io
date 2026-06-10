# EasyLife P2 External Calendar Sync Supervised Gate

Date prepared: 2026-05-31

Repo: `C:\Dev\easylifehq.github.io`

## Gate Status

`EXTERNAL_CALENDAR_SYNC_NOT_LIVE`

P2-03 is a supervised consent and proof gate only. EasyLife Plan remains local/manual inside EasyLife. This task does not add external calendar providers, OAuth, calendar import, calendar export, two-way sync, background jobs, hidden writes, package changes, Firebase/auth/rules/functions changes, deploy changes, secrets, env files, or generated output.

## Current State

- Plan stores EasyLife calendar events and task blocks inside the existing signed-in EasyLife data model.
- Settings now states that EasyLife is not reading from or writing to Google Calendar, Apple Calendar, Outlook, or ICS feeds.
- Settings now states that any future sync needs a separately approved consent and review flow.
- Browser reminders can remind about EasyLife Plan blocks locally, but they are not external calendar sync.

## Consent Contract For Future Sync

A later separately approved external calendar sync must:

- ask for explicit user consent before connecting a provider
- name the exact provider and account being connected
- show the scope requested before authorization
- support disconnect before broader rollout
- show whether the flow is import-only, export-only, or two-way
- keep default behavior off for new users
- avoid broad background reads until the user chooses a sync action

## Scope Contract

The first approved sync lane should be narrow:

- one provider only
- one signed-in EasyLife user only
- one selected calendar only
- one manual preview run first
- no recurring background sync until a later gate
- no contacts, email, location, maps, or AI context bundled into the calendar scope

## Source-Of-Truth Contract

Before any real sync:

- EasyLife must say whether EasyLife Plan or the external calendar wins for each field.
- Imported items must be visibly labeled as imported or linked.
- User-created EasyLife blocks must not silently become external events.
- External events must not silently become EasyLife tasks.
- Deleted or changed items must require review before destructive changes propagate.

## Conflict Handling And Rollback

A future implementation must preview conflicts before save:

- same time, different title
- same title, different time
- deleted in one place but present in another
- recurring event mismatch
- timezone mismatch
- duplicate import candidate

Rollback must be possible for the first test lane:

- imported preview can be discarded
- approved import can be removed from EasyLife without touching the external calendar
- export test can be deleted from the external calendar with explicit user review
- sync state can be disabled without leaving hidden jobs running

## No-Hidden-Write Rules

Future sync must not:

- create external calendar events without a final review action
- update external calendar events in the background
- delete external calendar events automatically
- import broad calendar history silently
- write EasyLife tasks from external events without user approval
- send invites, email, texts, or push notifications
- use geocoding, maps, exact addresses, or live location
- use AI to alter calendars without a separate AI/action gate

## Explicit Non-Goals

This task does not:

- implement calendar sync
- connect Google, Apple, Outlook, or ICS
- add OAuth
- add provider SDKs
- add backend functions
- add package dependencies
- deploy anything
- change Firestore rules or auth
- add hidden reads or writes
- schedule automatic sync jobs

## Acceptance Checks

- Settings says external calendar sync is not live.
- Settings says EasyLife is not reading from or writing to Google Calendar, Apple Calendar, Outlook, or ICS feeds.
- Settings says future sync requires consent, preview, conflict handling, and rollback.
- Proof packet defines consent, scope, source-of-truth, conflict, rollback, manual-review, and no-hidden-write rules.
- Source proof finds no Google/Apple/Outlook/ICS provider implementation, OAuth implementation, or external calendar sync call in the touched app source.
- Build passes with `npm.cmd run build` from `app-vNext`.
