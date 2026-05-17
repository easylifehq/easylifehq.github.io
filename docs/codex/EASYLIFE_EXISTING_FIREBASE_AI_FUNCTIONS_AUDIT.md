# EasyLife Existing Firebase AI Functions Audit

Date: 2026-05-17

Status: audit only. No deploy, no secret read, no secret value printed, and no live AI call made.

## Mission

Check the existing Firebase Functions AI endpoints that already use `OPENAI_API_KEY` and decide whether they are safe to redeploy/test, or whether they need to be aligned with the newer Stage 31 server-only gateway plan first.

## Bottom Line

Do not redeploy the existing functions yet if the goal is the Stage 31 first-live-AI lane.

The repo already has two Firebase Functions that call OpenAI with the Firebase secret named `OPENAI_API_KEY`:

- `analyzeTaskBrainDump`
- `planProjectWithAi`

Those functions are legitimate server-side AI functions, but they predate the Stage 31 guardrail model. Redeploying them would update existing AI endpoints, including EasyProjects AI planning, not just the approved Inbox typed-capture `intake-suggestion` lane.

## Existing OpenAI Functions

| Function | File | Secret expected | Provider call | Current purpose |
| --- | --- | --- | --- | --- |
| `analyzeTaskBrainDump` | `functions/index.js` | `OPENAI_API_KEY` | `https://api.openai.com/v1/responses` | Turn a messy brain dump into editable EasyList task rows. |
| `planProjectWithAi` | `functions/index.js` | `OPENAI_API_KEY` | `https://api.openai.com/v1/responses` | Turn a project idea into EasyProjects sections and tasks. |

Both functions attach the secret through Firebase Functions `defineSecret("OPENAI_API_KEY")`.

This means the key the user set with:

```text
firebase functions:secrets:set OPENAI_API_KEY
```

is the correct secret name for the existing deployed Functions code.

## Frontend Call Sites

| Call site | Function used | Notes |
| --- | --- | --- |
| `app-vNext/src/features/easylist/components/TaskComposer.tsx` | `analyzeTaskBrainDump` | Uses `VITE_TASK_ANALYZER_URL`; if not configured or user is not signed in, it falls back to local parsing. |
| `app-vNext/src/features/easyprojects/lib/projectAiPlanner.ts` | `planProjectWithAi` | Uses `VITE_PROJECT_PLANNER_URL` or defaults to the production `pipeline-2f422` function URL. |

## What Matches The Stage 31 Direction

Good existing properties:

- Provider key is server-side in Firebase Functions secret storage.
- No frontend OpenAI key is required.
- Both endpoints require a signed-in Firebase user token.
- Both endpoints use structured JSON schemas for provider output.
- Both endpoints cap user input length.
- Both endpoints return editable/reviewable draft-like data rather than directly writing data in the function.
- Error logging records provider status/code/type, not the real key.

## What Does Not Match Stage 31

The existing endpoints do not fully match the newer Stage 31 gateway contract.

Mismatches:

- Secret name is `OPENAI_API_KEY`, while the Stage 31 placeholder docs use `SERVER_AI_PROVIDER_API_KEY`.
- `planProjectWithAi` expands beyond the first approved route and behavior.
- `analyzeTaskBrainDump` is task extraction, not the Stage 31 `intake-suggestion` prompt contract.
- Neither endpoint uses the Stage 20 prompt registry.
- Neither endpoint uses the Stage 20 output validator / Stage 30 quarantine path.
- Neither endpoint uses the Stage 30 request sanitizer.
- Neither endpoint is limited to `/app/easylist/add?demo=1`.
- Neither endpoint is explicitly synthetic/demo-input-only.
- Neither endpoint uses the Stage 31 first-call harness.
- Neither endpoint has a documented kill-switch/rate-limit/circuit-breaker gate in the function code.

## Redeploy Risk

Redeploying now would not merely prepare the new Stage 31 lane.

It would refresh the deployed secret version for existing production functions:

- `analyzeTaskBrainDump`
- `planProjectWithAi`

The terminal already reported that those two functions are using a stale version of `OPENAI_API_KEY`, so a redeploy would likely make them use the newly stored key version.

That may be acceptable later, but it is not the clean Stage 31 path because it would revive or update broader existing AI functionality before the newer sanitizer/quarantine/harness boundary is applied.

## Safe Testing Decision

Safe to say:

- The key is stored in the right Firebase secret for the existing functions.
- The key is not in the frontend repo.
- The existing functions are server-side and can technically call OpenAI after redeploy.

Not safe to say:

- The Stage 31 first live AI assistant lane is ready to run.
- Redeploying existing functions is limited to `/app/easylist/add?demo=1`.
- Existing functions satisfy the Stage 20/30/31 sanitizer, prompt registry, output validator, quarantine, and first-call harness rules.

## Safest Next Step

Do not deploy yet.

Before redeploying, choose one of these paths:

1. Recommended: align or park existing Firebase AI endpoints before redeploy.
   - Keep `OPENAI_API_KEY` as the current Firebase Functions secret name, or deliberately migrate docs/code to `SERVER_AI_PROVIDER_API_KEY`.
   - Add an explicit disabled-by-default or allowlist gate for old AI endpoints.
   - Build the Stage 31 `intake-suggestion` gateway as a separate narrow endpoint.
   - Keep EasyProjects planning parked until separately approved.

2. Faster but riskier: explicitly approve testing old AI endpoints.
   - Redeploy functions.
   - Test `analyzeTaskBrainDump` and `planProjectWithAi` as legacy server AI helpers.
   - Accept that this is broader than the Stage 31 first-live-AI lane.

## Recommendation

Use path 1.

The existing Functions code proves there is already a server-side OpenAI path, which is good. But the current endpoints are not the carefully bounded Stage 31 assistant lane.

The next implementation task should align the old Functions AI surface with the newer guardrails before any redeploy.

