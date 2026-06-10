# EasyLife P2 Contact Import/Sync Supervised Gate

Date prepared: 2026-05-31

Repo: `C:\Dev\easylifehq.github.io`

## Gate Status

`CONTACT_IMPORT_SYNC_NOT_LIVE`

People remains a manual-label surface. EasyLife is not reading, importing, syncing, deduping, merging, or writing contacts from a phone address book, Google Contacts, Apple Contacts, Outlook, email, texts, calendar, social accounts, or any external account.

## Current Demo State

- People uses saved labels the user typed.
- Email and phone fields are manual labels only.
- Place labels are manual and do not use maps, geocoding, exact addresses, live location, calendar sync, email, or texts.
- Settings says contact import/sync is not connected.
- No contact provider, account connection, token storage, address-book permission, or background sync is exposed.

## Future Import/Sync Approval Contract

Any future contact import or sync must be approved as its own gate and include:

1. Explicit source consent before reading an external address book.
2. Provider/source naming before any import begins.
3. Preview of every proposed contact before writing.
4. Field mapping for name, organization, role, email, phone, source, notes, and follow-up fields.
5. Dedupe/merge preview that shows likely matches and conflicts.
6. User choice for create, update, skip, or merge.
7. Rollback plan for imported or merged records.
8. Audit trail showing source, time, count, and selected action.
9. Kill switch that disables external import/sync while preserving manual People records.
10. Metadata-only logs by default; no raw contact payloads in logs.

## No-Silent-Write Rules

- No background contact import.
- No automatic sync or recurring refresh.
- No silent merge into existing People records.
- No hidden writes to People, Inbox, Notes, Plan, Follow-ups, external address books, email, calendar, or messaging providers.
- No recipient autocomplete from external accounts.
- No provider token storage or address-book permission request without a separate explicit gate.

## Explicit Non-Goals For This Task

- No contact import implementation.
- No contact sync implementation.
- No Google Contacts, Apple Contacts, Outlook, phone contacts, CardDAV, CSV import, social account, or email/text provider integration.
- No OAuth, token storage, provider SDK, address-book permission, background job, or server action.
- No Firebase/auth/rules/functions/billing/DNS/secrets/env/package/dependency/deploy/generated output changes.
- No live AI, true push, calendar sync, geocoding/maps, email/text sending, account deletion backend, hidden writes, automatic scheduling, or external actions.

## Acceptance Checks

- People visibly says contact import/sync is not live and manual labels remain the current behavior.
- Settings visibly says contact import/sync is not connected.
- Contact editor says email/phone are manual labels only and does not imply sending, sync, recipient autocomplete, or external contact access.
- Future import/sync rules require consent, preview, dedupe, field mapping, rollback, audit trail, kill switch, and no-silent-write behavior.
- Source scan finds no provider SDK, OAuth, token storage, address-book permission, background sync, or import implementation added by this gate.
- `npm.cmd run build` passes from `app-vNext`.
