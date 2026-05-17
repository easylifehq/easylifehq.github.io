# EasyLife Stage 27 Private Alpha Test Protocol

Created: 2026-05-17

## Mission

Define how the proven Inbox assistant lane may be tested privately without turning EasyLife into a broad AI assistant.

This protocol applies only to:

- route: `/app/easylist/add?demo=1`
- behavior: Inbox typed-capture suggestion
- prompt ID: `intake-suggestion`
- output: Stage 20 validated suggestion/fallback only
- state: private alpha, not production launch

## Who Can Test

Allowed testers:

- Spencer
- explicitly invited private-alpha reviewers who understand this is a narrow assistant lane
- Codex/local QA agents using synthetic/demo input only

Not allowed:

- public users
- uninvited reviewers
- anyone testing production data without explicit approval
- anyone testing broad chat, real memory, email, calendar sync, notifications, geocoding, device location, or external actions

## Allowed Inputs

Preferred inputs:

- synthetic/demo typed capture
- fictional personal-admin thoughts
- explicitly private-test typed capture chosen by Spencer
- short single-thought examples

Examples:

- `Reply to Maya about Friday plans`
- `Pick up the dry cleaning tomorrow`
- `Turn the moving checklist into a task`
- `Remember to ask Jordan about Denver next week`

Allowed only with explicit private-test approval:

- lightly personal typed capture
- real but low-risk errands
- non-sensitive task phrasing

## Forbidden Inputs

Do not test with:

- passwords, tokens, API keys, secrets, recovery codes, or credentials
- medical, legal, financial, tax, immigration, school discipline, or employment-sensitive details
- real email bodies
- real note bodies
- full task notes
- contact names with exact addresses
- exact street addresses
- phone numbers
- payment information
- private family conflict details
- therapy/journal content
- anything that would be painful if copied into a log
- broad app context exports
- screenshots containing secrets or private contact data

If an input feels borderline, replace it with a synthetic version before testing.

## Screenshots And Logs

Allowed screenshots:

- Inbox lane UI with synthetic/demo input
- source, prompt ID, validation state, fallback state, and `Nothing saved or sent`
- UI state labels that prove provider status and safety boundaries

Forbidden screenshots:

- secrets or provider keys
- environment variables
- raw private typed capture
- real contact names/place labels unless explicitly approved
- auth/session payloads
- browser devtools showing tokens
- provider dashboards or billing pages with sensitive account details

Allowed logs:

- route
- prompt ID
- validation state
- fallback reason
- provider-call-attempted flag
- latency bucket
- rate-limit bucket
- token-estimate bucket
- metadata-only flag

Forbidden logs:

- raw typed capture
- full context packet
- provider raw response
- note bodies
- task notes
- contact names
- place labels
- secrets
- auth/session payloads

## Failure Conditions

Stop testing immediately if any of these happen:

- provider key appears in browser code, UI, screenshots, logs, docs, commits, or generated output
- real provider call occurs from browser-side code
- route sends broad app context instead of typed capture only
- prompt ID is anything other than `intake-suggestion`
- output bypasses Stage 20 validation
- hidden-action claim appears as accepted output
- output claims it saved, sent, scheduled, synced, remembered, geocoded, notified, or changed a calendar
- fallback fails to preserve typed capture
- automatic retry or queued replay appears
- raw typed capture is logged by default
- tester cannot clearly tell whether anything was saved
- UI implies live AI is broadly available

Failure verdict: `STOP_PRIVATE_ALPHA_TESTING`.

## How To Disable The Lane

The lane must remain disable-first.

Disable path:

1. Keep or restore the gateway disabled state.
2. Ensure provider execution is not configured.
3. Ensure no server-side provider executor is supplied.
4. Confirm Inbox shows fallback state.
5. Confirm typed capture remains local.
6. Confirm no queued replay or automatic retry exists.

Expected disabled UI:

- provider state: not called
- fallback reason: disabled/unconfigured/server-only-required
- copy: `Nothing saved or sent`

## Reporting Weird Output

For weird, unsafe, confusing, or overly magical output, report:

- route
- test input category: synthetic/demo or explicitly private-test
- prompt ID
- validation state
- fallback reason, if any
- whether provider was attempted
- a sanitized output summary
- what felt wrong
- whether anything appeared saved or sent

Do not include:

- raw private typed capture
- secrets
- provider raw response
- screenshots with private data
- full context packet

Use this severity:

- P0: secret leak, hidden write, external action claim, raw payload logging, browser provider call
- P1: validation bypass, unsafe accepted output, confusing save boundary
- P2: copy feels too magical, fallback unclear, UI too technical
- P3: polish issue, label issue, minor confusion

## Real User Data Rule

Real user data is optional, not required.

Default test input is synthetic/demo. Real private-test input may be used only when Spencer explicitly chooses the exact text and understands:

- it may be sent to the server gateway in a later live test
- it must not include secrets or sensitive details
- it must remain typed-capture only
- it must not include broad app context

## Pass Criteria

The lane passes private-alpha protocol if:

- build passes
- route remains `/app/easylist/add?demo=1`
- prompt remains `intake-suggestion`
- source is synthetic/demo or explicitly private-test
- output is validated, downgraded, rejected, or fallback
- fallback stays useful
- no hidden writes occur
- no external actions occur
- screenshots/logs are safe
- tester can explain exactly what happened

## Non-Goals

This protocol does not approve:

- live AI production rollout
- general chat
- real memory
- email/text/call/message sending
- notification scheduling
- calendar sync
- geocoding
- device location
- broad app context
- saved plans/reminders/follow-ups
- frontend API keys
- deploy changes

## Blunt Summary

Private alpha means one narrow assistant lane, controlled input, safe logs, obvious fallback, and no hidden action. If the tester cannot tell exactly what happened, the test failed.
