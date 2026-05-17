# EasyLife Stage 28 Assistant Reliability Proof Packet

Date: 2026-05-17

Verdict: `READY_FOR_STAGE_29_TRUST_SECURITY_HARDENING`

## Scope

Stage 28 tested whether the Inbox assistant lane is reliable enough for broader private review. It stayed limited to `/app/easylist/add?demo=1`, typed-capture suggestions, local/mock/server-adapter/live-dry-run proof states, and no hidden writes.

Stage 28 did not add broad chat, real memory, email, calendar sync, notifications, geocoding, device location, external actions, saved-object expansion, deploy changes, provider SDKs, frontend API keys, or live provider behavior.

## Build Proof

Passed: `npm.cmd run build` from `app-vNext`.

## Route Proof

Inspected route: `/app/easylist/add?demo=1`.

The in-app Browser pane was unavailable in this session, so route inspection used local Chrome headless DOM inspection against the running local review server.

Rendered proof strings found:

- `Assistant intake preview`
- `Live fallback preview`
- `Live provider dry run`
- `Nothing saved or sent`
- `Source`
- `Destination`
- `Capture`
- `Local deterministic fallback`
- `Disabled`
- `Timeout`
- `Rate limit`
- `Validation blocked`
- `Provider error`

Route status: HTTP 200.

## Edge-Case Behavior

Stage 28 reliability fixtures cover the bad-output cases that would make the assistant feel fake or unsafe:

- Empty output rejects.
- Duplicate suggestions fall back.
- Missing source rejects.
- Wrong intent/destination pairing downgrades to needs-review.
- Unknown destination rejects.
- Missing destination rejects.
- Ambiguous save language downgrades.
- Overconfident language falls back.
- Unsupported intent rejects.
- Too-long suggestion falls back.
- Hidden-action wording rejects.

Blunt read: bad or vague model-shaped output is not allowed to slide through as a clean save candidate.

## Duplicate / Stale Behavior

Duplicate and stale behavior is now guarded in the Inbox lane:

- Suggestions are paired to the current capture through a visible capture fingerprint.
- Duplicate-looking gateway output is held for review instead of shown as fresh.
- Local deterministic suggestions can mark possible duplicates as review-only.
- Live dry-run output is checked against the current request before display.
- Stale live dry-run output is cleared or labeled as stale instead of offered as current work.
- No automatic retry or persistent suggestion history was added.

Blunt read: the assistant lane is much less likely to confuse a tester with an old or repeated suggestion.

## Source / Destination Clarity

Source and destination are now explicit across the assistant lane:

- Local rules, mock gateway, server-adapter mock, live dry-run, fallback, duplicate-held, draft preview, task handoff, and reminder/follow-up preview states all use the source/state/destination row.
- The validator downgrades intent/destination mismatches to `Needs review`.
- Unknown or missing destination labels reject.
- Broad save wording such as `save it wherever EasyLife thinks it should go` downgrades before display.
- Existing save paths remain unchanged.

Blunt read: the user can see where a suggestion came from, what state it is in, and where it can go before any save action.

## Alpha Bug Capture

Private alpha bugs can be captured cleanly with `docs/codex/EASYLIFE_ASSISTANT_ALPHA_BUG_REPORT_TEMPLATE.md`.

The template asks for:

- Route.
- Typed input category, not raw private text.
- Assistant source state.
- Source label, destination label, and capture pairing.
- Validation/fallback state.
- What looked wrong.
- Whether anything saved or sent.
- Screenshot guidance that avoids secrets/private data.
- Severity and recommended next step.

Blunt read: testers can report useful failures without dumping private typed input, secrets, contacts, exact places, raw payloads, or screenshots with sensitive data.

## What Still Is Not Ready

EasyLife still should not be marketed as a finished AI assistant.

Still parked:

- Broad chat.
- Real user data by default.
- Frontend API keys.
- Provider keys in docs/logs/commits.
- Hidden reads.
- Hidden writes.
- Automatic saves.
- Sending, scheduling, syncing, notifications, calendar changes, real memory, geocoding, device location, external actions, saved-object expansion, deployment changes, generated output, provider SDKs, and production rollout.

## Stage 29 Recommendation

Stage 29 should be `Trust + Security Hardening`.

Focus:

- Raw input and logging redaction proof.
- Secret exposure scan.
- Prompt injection and hostile typed-capture fixtures.
- Kill switch / disabled-state proof.
- Private review security checklist.

Do not expand assistant capability yet.

## Verdict

`READY_FOR_STAGE_29_TRUST_SECURITY_HARDENING`
