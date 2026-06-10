# EasyLife P2 Email/Text Sending Supervised Gate

Date prepared: 2026-05-31

Repo: `C:\Dev\easylifehq.github.io`

## Gate Status

`EMAIL_TEXT_SENDING_NOT_LIVE`

EasyLife may show review-only reply text and inbox suggestions, but it must not send email, send texts, create outside drafts, archive mail, contact recipients, store provider tokens, or call email/SMS providers without a separate explicit approval gate.

## Current Demo State

- Settings says email/text behavior is not connected.
- Email draft review says nothing is sent from EasyLife and no mail or text draft is created.
- The inbox email surface is a local review queue for Task, Deadline, Event, and Follow-up suggestions.
- Prepared reply text is read-only review copy that the user can copy or rewrite manually outside EasyLife.
- Existing review statuses are local UI state, not a sent-message audit log.

## Future Approval Contract

Any future email/text implementation must be approved as its own gate and include:

1. Recipient confirmation before every external action.
2. Editable message preview with clear subject/body/recipient/source.
3. A second explicit approval immediately before send, archive, or outside draft creation.
4. A visible audit trail that records what happened, when, and which provider action ran.
5. Rollback notes for actions that cannot be undone, including what EasyLife can and cannot reverse.
6. A kill switch that disables all sending without removing the review-only draft surface.
7. Metadata-only logs by default; no raw private message bodies in logs.

## No-Automatic-Send Rules

- No automatic sending from assistant suggestions.
- No background email, SMS, or message provider calls.
- No auto-reply, auto-archive, auto-delete, auto-forward, or auto-draft creation.
- No contact sync, recipient autocomplete from external accounts, or hidden address book writes.
- No hidden writes back into tasks, notes, Plan, People, external mailboxes, or messaging providers.

## Non-Goals For This Task

- No Gmail, Outlook, Apple Mail, SMTP, SMS, iMessage, Twilio, or messaging provider integration.
- No OAuth, provider token storage, webhook, background job, or server action.
- No account deletion, calendar sync, true push, geocoding, live AI provider call, or deploy work.
- No Firebase/auth/rules/functions/billing/DNS/secrets/env/package/dependency/deploy/generated output changes.

## Acceptance Checks

- Settings clearly says EasyLife does not send email, send texts, create outside drafts, archive mail, or contact anyone in the demo.
- Email draft review clearly says recipient and wording must be confirmed outside EasyLife.
- Email draft review says delivery is not connected and no provider is called.
- Future sending rules require recipient confirmation, audit trail, rollback notes, kill switch, and second approval.
- Source scan finds no provider SDK, OAuth, SMS provider, SMTP, send API, token storage, or background-send implementation added by this gate.
- `npm.cmd run build` passes from `app-vNext`.
