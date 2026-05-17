# EasyLife Assistant Alpha Bug Report Template

Use this for private alpha testing of the Inbox assistant lane. Do not paste private typed input, secrets, screenshots with real personal data, or API/provider details.

## Report Summary

- Date:
- Tester:
- Route:
  - Example: `/app/easylist/add?demo=1`
- Browser / device:
- Build or commit if known:

## Input Category

Select the closest category. Do not include the raw typed text.

- [ ] Simple task
- [ ] Messy task
- [ ] Note/context
- [ ] Plan idea
- [ ] Reminder-like text
- [ ] Follow-up-like text
- [ ] Unsure / ambiguous
- [ ] Empty or very short input
- [ ] Long input
- [ ] Other:

## Assistant Lane State

- Assistant source state:
  - [ ] Local rules
  - [ ] Mock gateway
  - [ ] Server adapter mock
  - [ ] Live provider dry run
  - [ ] Unknown
- Source label shown:
- Destination label shown:
- Capture pairing shown:
  - [ ] Yes
  - [ ] No
  - [ ] Not sure

## Validation / Fallback State

- Validation state:
  - [ ] Accepted
  - [ ] Downgraded / needs review
  - [ ] Rejected
  - [ ] Unknown
- Fallback state:
  - [ ] None
  - [ ] AI disabled
  - [ ] Timeout
  - [ ] Rate limit
  - [ ] Circuit open
  - [ ] Invalid request
  - [ ] Validation rejected
  - [ ] Provider error
  - [ ] Unknown

## What Looked Wrong

Check all that apply.

- [ ] Source was missing or unclear
- [ ] Destination was missing or unclear
- [ ] Suggestion looked stale
- [ ] Suggestion looked duplicated
- [ ] Suggestion was overconfident
- [ ] Suggestion implied saving happened
- [ ] Suggestion implied sending, scheduling, syncing, notifications, memory, location, or external action
- [ ] Fallback copy felt scary or confusing
- [ ] UI was too crowded
- [ ] Button/action wording was ambiguous
- [ ] Other:

Short description:

```text

```

## Save / Send Boundary

- Did anything actually save?
  - [ ] No
  - [ ] Yes, task only after final confirmation
  - [ ] Yes, note/context only after final confirmation
  - [ ] I am not sure
- Did anything send, schedule, sync, notify, geocode, use device location, or create real memory?
  - [ ] No
  - [ ] I am not sure
  - [ ] It looked like yes
- If it looked like yes, describe the visible wording without pasting private data:

```text

```

## Screenshot Guidance

Screenshots are useful, but keep them clean.

- Hide or crop private typed input.
- Hide names, contact details, exact places, addresses, notes, secrets, tokens, and account info.
- Do not include browser devtools with environment variables or network payloads.
- Prefer a cropped screenshot of the assistant card, source/destination row, validation/fallback state, and action buttons.

Screenshot file or link:

```text

```

## Expected Behavior

What should EasyLife have shown or done instead?

```text

```

## Triage

- Severity:
  - [ ] Critical: implies hidden write/external action or exposes private data
  - [ ] High: wrong source/destination or unsafe suggestion offered
  - [ ] Medium: confusing fallback/copy/state
  - [ ] Low: polish issue
- Recommended next step:
  - [ ] Block Stage 29
  - [ ] Fix during Stage 28 proof
  - [ ] Track for later polish
  - [ ] No action after review
