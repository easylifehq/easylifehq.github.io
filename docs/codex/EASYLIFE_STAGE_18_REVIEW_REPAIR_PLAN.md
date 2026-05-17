# EasyLife Stage 18 Review Repair Plan

Stage 18 is a repair pass created from the human/agent review loop after Stage 17. The goal is not to add a new assistant capability. The goal is to remove the review risks that would make EasyLife feel stale, fake, overexplained, or unsafe before the next assistant-brain stage.

## Stage Mission

Make EasyLife safer to review by tightening the remaining first-impression, trust-copy, mobile, memory-language, and legacy command-surface risks.

## Inputs

- Stage 17 proof verdict: `READY_FOR_HUMAN_REVIEW`.
- Human concern: outside agents could not access localhost, so the next pass needs a real local mobile proof instead of stale screenshot guesses.
- Agent 1 signal: public/login/marketing surfaces may still expose old EasyHQ, EasyList, EasyCalendar, EasyContacts, Products, or app-suite language.
- Agent 2 signal: trust copy should rely more on precise labels and action buttons, less on repeated policy warnings.
- Agent 3 signal: no valid mobile review was completed because localhost was inaccessible from that environment.

## Target Outcomes

- A real local mobile proof exists for the current build.
- Public/login first impression reads as one assistant, not a suite.
- Inbox remains approval-first, but reads less like a policy notice.
- Remaining Memory/Remember language is replaced with honest saved-context language.
- `/app/command` no longer undermines the newer approval-first assistant model.

## Non-Goals

- Do not add model calls.
- Do not add real memory.
- Do not add saved plans, saved reminders, saved follow-ups, email, notifications, calendar sync, maps, geocoding, exact addresses, device location, backend changes, auth changes, Firebase rules/config changes, package/dependency changes, deploy config, generated output, secrets, or real personal data.
- Do not redesign the whole app.
- Do not create a new dashboard.

## Stage 18 Tasks

1. Live mobile review proof.
2. Public/marketing module-language cleanup.
3. Inbox trust/copy compression.
4. Remaining Memory/Remember cleanup.
5. Command Center route audit.

## Acceptance

- `docs/codex/NEXT_5_TASKS.md` contains exactly five Task Contract V2-compatible Stage 18 tasks.
- `npm.cmd run build` passes from `app-vNext`.
- No product code changes are made while creating this packet.
- Stage 18 remains a repair pass, not a new capability pass.
