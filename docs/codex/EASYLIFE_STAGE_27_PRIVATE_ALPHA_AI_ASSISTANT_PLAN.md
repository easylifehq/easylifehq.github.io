# EasyLife Stage 27 Private Alpha AI Assistant Plan

Created: 2026-05-17

## Mission

Prepare the first private-alpha AI assistant path after Stage 26 proof.

Stage 27 is not a broad AI assistant launch. It keeps the proven lane only:

- route: `/app/easylist/add?demo=1`
- behavior: Inbox typed-capture suggestion
- prompt ID: `intake-suggestion`
- input: synthetic/demo or explicitly private-test typed capture only
- output: Stage 20 validated suggestion shapes only
- action model: preview/draft/fallback only unless an existing explicit save path is separately used by the user

## Stage 26 Starting Point

Stage 26 verdict: `READY_FOR_STAGE_27_BUT_NO_LIVE_PROVIDER_YET`

The important truth is that no live provider was actually called. Stage 26 proved:

- the Inbox live-provider dry-run lane renders
- the lane defaults to disabled fallback
- the route shows `Live provider dry run`
- the prompt is fixed to `intake-suggestion`
- validation state is visible
- fallback state is visible
- source is `Synthetic/demo capture`
- the copy says `Nothing saved or sent`
- provider secrets remain server-only placeholders
- no hidden writes or external actions were added

## What Stage 27 May Improve

Stage 27 may improve the reliability and reviewability of the private-alpha path:

- readiness confirmation before any first provider call
- server-only executor boundary/stub
- metadata-only logging proof
- Inbox copy/state labels
- local fallback UX
- private-alpha test protocol and proof

## What Stage 27 Must Not Build

Stage 27 must not add:

- general chat
- broad app context
- real user data by default
- frontend API keys
- provider keys in docs, source, fixtures, logs, screenshots, commits, browser bundles, or generated output
- hidden reads
- hidden writes
- automatic saves
- email/text/call/message sending
- calendar sync
- notifications
- geocoding
- device location
- real memory
- external actions
- saved-object expansion
- deploy changes
- package/dependency changes
- production rollout

## Safety Rules

1. Provider secrets stay server-side only.
2. The first prompt remains `intake-suggestion`.
3. The first route remains `/app/easylist/add?demo=1`.
4. Inputs are synthetic/demo or explicitly private-test only.
5. Every output must pass Stage 20 validation before render or save-offer.
6. Fallback must preserve typed capture and local deterministic behavior.
7. No automatic retries or queued replay.
8. Logging must remain metadata-only by default.
9. The UI must say when the provider is not connected or disabled.
10. Nothing is saved, sent, scheduled, synced, remembered, geocoded, or externally acted on by this stage.

## Task Packet

`docs/codex/NEXT_5_TASKS.md` contains exactly five Stage 27 tasks:

1. Private alpha readiness confirmation.
2. Server-only provider executor contract/stub.
3. Metadata-only gateway logging contract/proof.
4. Inbox private-alpha state/copy cleanup.
5. Stage 27 proof packet.

## Exit Criteria

Stage 27 may end with one of these verdicts:

- `READY_FOR_FIRST_SERVER_SIDE_SYNTHETIC_PROVIDER_CALL`
- `READY_FOR_MORE_PRIVATE_ALPHA_HARDENING`
- `NOT_READY_FOR_FIRST_SERVER_SIDE_SYNTHETIC_PROVIDER_CALL`

The preferred next gate is a first server-side synthetic provider call only if the proof confirms:

- real provider choice
- server runtime
- secret storage
- kill switch
- spend/rate caps
- metadata-only logging
- Stage 20 output validation
- fallback
- no hidden writes
- no external actions

## Blunt Product Note

EasyLife is close to an actual AI assistant lane, but it is not there yet. Stage 27 should make the first lane trustworthy before adding magic.
