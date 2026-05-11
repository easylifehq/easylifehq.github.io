# EasyLife Stage 10 Assistant Brain Plan

## Mission

Add the first real assistant-brain behavior only after the visual shell is reviewable. Stage 10 should make EasyLife feel helpful without becoming unpredictable: every suggested action must be visible, editable, and approved by the user before anything changes.

## Entry Gate

Stage 10 may begin only after Stage 9 creates a proof packet that says `READY_FOR_HUMAN_VISUAL_REVIEW`, or after the remaining visual blockers are small enough to park safely.

Required evidence:

- `npm.cmd run build` passes from `app-vNext`.
- Login, Today, Inbox, Plan, Notes, and Settings/More are locally inspectable.
- `SIMON_DESIGN_REVIEW.md` says the core shell is visually credible enough for review.
- `ROBIN_COPY_REVIEW.md` says the core assistant language no longer reads as product inventory.
- `MAGIC_SCORECARD.md` records whether Stage 10 is approved to start.

## Stage 10 Principles

- Approval-first: the assistant suggests; the user approves.
- Local-first: begin with existing local/static app data and UI state before external integrations.
- Narrow behavior: one assistant action at a time.
- Honest copy: do not imply background AI, email sending, calendar sync, or memory persistence until those features exist.
- Reversible UI: every suggestion must have edit, dismiss, or ignore affordance.
- No hidden writes: no data should be created, sent, synced, or persisted differently unless the task explicitly owns that behavior and proves it.

## Sequence

1. Assistant intent contract
   - Define the allowed intent types: task, note, plan, reminder, follow-up, and unsure.
   - Define the suggestion shape, confidence language, and approval states before implementation.

2. Local capture classifier UI
   - Turn one messy capture string into a visible static suggestion card using deterministic/local rules or mocked examples.
   - Keep the suggestion editable and non-persistent unless approved in a later task.

3. Approval queue behavior
   - Add approve/edit/dismiss UI around suggestions without sending, syncing, or changing integrations.
   - Keep all assistant action copy honest and reversible.

4. Today next-move reasoning slice
   - Surface one suggested next move from existing local task/day context.
   - Explain why it was suggested in plain language.

5. Notes-to-memory candidate slice
   - Let Notes show memory candidates such as remember, turn into task, turn into plan, or pin context.
   - Do not build real long-term memory until a later persistence contract exists.

## Not Stage 10

- Background automation.
- Email sending or Gmail integration.
- Calendar sync or external calendar writes.
- Real long-term memory storage.
- Model provider setup.
- Firebase rules, auth provider changes, payments, deployment config, package/dependency changes, generated output, or secrets.

## Done Signal

Stage 10 is ready for the next phase when EasyLife can show one approved assistant loop end to end in local review mode: capture input, classify/suggest, allow edit/dismiss, and explain the next move without hidden side effects.
