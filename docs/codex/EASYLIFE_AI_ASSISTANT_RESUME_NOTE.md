# EasyLife AI Assistant Resume Note

## Current State

EasyLife is paused for the one-week phone field test.

The AI assistant work is parked at:

`READY_FOR_ONE_SYNTHETIC_PROVIDER_TEST_DEPLOY`

That means the next AI step is not more planning and not broad assistant expansion. The next AI step is one carefully controlled synthetic provider test for the narrow Inbox lane.

## Resume Here

When AI work resumes, start from:

- Proof packet: `docs/codex/EASYLIFE_STAGE_33_FIRST_PROVIDER_CALL_READINESS_PROOF_PACKET.md`
- Current task queue: `docs/codex/NEXT_5_TASKS.md`
- Phase state: `docs/codex/PHASE_STATE.md`

## Exact Next Action

Run only the Stage 33 manual operator flow:

1. Confirm working tree is clean.
2. Confirm Firebase project is `pipeline-2f422`.
3. Confirm `OPENAI_API_KEY` exists as a Firebase Functions secret without printing it.
4. Deploy only `functions:assistantIntakeSuggestion`.
5. Temporarily open the provider gate.
6. Send exactly one synthetic `/app/easylist/add?demo=1` request using prompt `intake-suggestion`.
7. Close the provider gate immediately.
8. Write the result proof packet.

## Do Not Resume With

- Broad chat
- Broad app context
- Real private user data by default
- Frontend API keys
- Pasted or committed secrets
- Old AI endpoint expansion
- Hidden reads or hidden writes
- Automatic saves
- Email/text/call/message sending
- Scheduling, syncing, notifications, or calendar changes
- Real memory claims
- Geocoding or device location
- Saved-object expansion

## Why This Is Parked

The one-week phone test should focus on names, UI, friction, capture paths, save clarity, and where AI would actually help.

Live AI provider testing should stay parked until after the week unless explicitly resumed.

## Good Restart Prompt

```text
Resume EasyLife AI assistant from docs/codex/EASYLIFE_AI_ASSISTANT_RESUME_NOTE.md.

Do not broaden the assistant. Do not use real private data. Do not paste or print secrets.

Continue with the Stage 33 manual operator path toward exactly one synthetic assistantIntakeSuggestion provider test, then immediately close the gate and write the result proof packet.
```

