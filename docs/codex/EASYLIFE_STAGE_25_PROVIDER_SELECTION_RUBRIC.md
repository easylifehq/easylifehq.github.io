# EasyLife Stage 25 Provider Selection Rubric

Date: 2026-05-17
Status: PROVIDER_NOT_SELECTED_FOR_LIVE_USE

## Mission

Choose a provider only by safety, fit, and operating constraints, not hype.

This rubric does not add SDKs, API keys, dependencies, backend implementation, deploy config, generated output, secrets, or live calls.

## First Allowed Use Case

Only evaluate providers for:

```text
Inbox typed-capture suggestion using synthetic/demo capture text.
```

Not allowed yet:

- broad assistant chat
- email sending
- calendar sync
- notifications
- real memory
- geocoding
- hidden reads
- hidden writes
- plan/reminder/follow-up saving

## Evaluation Criteria

Score each provider from 1 to 5.

| Criterion | Question | Required For Stage 26 |
| --- | --- | --- |
| Privacy controls | Can raw user data be minimized, redacted, and excluded from logs where possible? | Yes |
| Structured output | Can the provider reliably return schema-shaped output compatible with Stage 20 validation? | Yes |
| Cost controls | Can request caps, token caps, and spend caps be enforced server-side? | Yes |
| Latency | Can one Inbox suggestion return fast enough to feel useful? | Prefer yes |
| Reliability | Can outages fail cleanly into no-AI fallback? | Yes |
| Logging controls | Can EasyLife avoid storing raw typed capture, full context packets, raw provider responses, and secrets? | Yes |
| Model quality | Can the model classify messy capture into task/note/plan/reminder/follow-up/unsure suggestions? | Yes |
| Tool/function support | Can the provider support schema-like responses without authorizing tools or external actions? | Prefer yes |
| Developer ergonomics | Can the first dry-run be implemented with minimal server-only code? | Prefer yes |
| Secret handling | Can keys stay entirely outside frontend bundles, docs, screenshots, commits, and logs? | Yes |

## Provider Candidate Notes

Provider candidates should be compared only after confirming:

- no frontend key exposure
- server-side secret store path
- schema validation before rendering
- timeout and fallback behavior
- rate and spend limits
- no automatic retries
- no external tools/actions

## Current Recommendation

Do not select a live provider inside Stage 25. Stage 25 should produce a readiness gate and require explicit human approval before Stage 26.

If the user later approves a provider, the first integration should use the Stage 23 server-only gateway architecture and the Stage 24 no-provider adapter contract.

## Disqualifiers

Do not proceed with any provider if:

- it requires a frontend API key
- it requires raw full-app context
- it cannot return bounded structured output
- it encourages direct tool/action execution
- logging cannot be controlled
- spend caps cannot be enforced
- fallback behavior is unclear
- it requires real personal data for the first test

## Verdict

Provider choice is not live-approved yet.
