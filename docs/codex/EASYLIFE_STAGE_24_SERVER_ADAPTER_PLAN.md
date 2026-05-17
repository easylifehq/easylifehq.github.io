# EasyLife Stage 24 No-Provider Server Adapter Plan

## Verdict

Stage 24 is approved for no-provider server adapter implementation.

This stage does not approve live model calls, provider SDKs, API keys, backend production behavior, Firebase config changes, dependencies, package files, deploy config, generated output, secrets, external actions, hidden reads, hidden writes, real memory, or saved-object expansion.

## Mission

Implement a server-shaped adapter shell for the future EasyLife AI gateway while still delegating to the proven Stage 22 mock gateway path.

The adapter should make the future real server boundary concrete without using a provider.

## First Behavior Lock

The only allowed behavior is:

Inbox typed-capture suggestion only.

Allowed surface:

- Inbox

Allowed route:

- `/app/easylist/add`

Allowed prompt ID:

- `intake-suggestion`

Allowed context:

- Stage 20 `stage-20-context-v1`
- `current-route`
- `typed-capture`
- optional synthetic `demo-fixture`

No other assistant surface is approved in Stage 24.

## Why This Stage Exists

Stage 20 proved local context, prompts, output validation, and no-AI fallback.

Stage 21 planned the server gateway contract.

Stage 22 proved a no-provider mock gateway path.

Stage 23 chose the future server architecture and safety boundary.

Stage 24 now turns that boundary into local TypeScript adapter code so the app can prove the shape before provider readiness.

## Implementation Boundaries

Stage 24 may add:

- Local TypeScript server adapter contract modules.
- Local no-provider mock handler modules.
- Safety tests for request and response boundaries.
- A compact Inbox label/toggle showing `Server adapter mock`.
- Docs and proof updates.

Stage 24 may not add:

- Live provider calls.
- Provider SDKs.
- API keys.
- Secrets.
- Firebase config changes.
- Backend production behavior.
- Deployment config.
- Dependencies or package file edits.
- Generated output.
- External actions.
- Hidden reads.
- Hidden writes.
- Real memory.
- Saved-object expansion.

## Architecture Shape

The adapter should model the future path without performing it:

```text
Inbox typed capture
  -> Stage 20 context packet
  -> Stage 24 server adapter request
  -> no-provider server adapter mock handler
  -> Stage 22 mock gateway
  -> Stage 20 output validator
  -> draft / preview / needs-review / fallback UI
```

The adapter must keep provider output untrusted by design, even though Stage 24 has no provider.

## Stage 24 Tasks

`docs/codex/NEXT_5_TASKS.md` contains exactly five Stage 24 tasks:

1. Server adapter types and contract.
2. Server adapter mock handler.
3. Server adapter safety tests.
4. Inbox server-adapter preview toggle.
5. Stage 24 proof packet.

## Acceptance Rules

Each implementation task must:

- Run `npm.cmd run build` from `app-vNext`.
- Keep first behavior to Inbox typed-capture suggestion only.
- Preserve existing task save and note/context save behavior.
- Avoid any real provider integration.
- Update the required proof document.

The proof packet must show that the no-provider adapter:

- Accepts safe requests.
- Rejects unsafe requests.
- Validates outputs.
- Preserves fallback.
- Never calls a provider.

## Stop Conditions

Stop and mark Stage 24 blocked if implementation needs:

- Provider SDKs.
- API keys.
- Secrets.
- Network calls to a model provider.
- Firebase config changes.
- New dependencies.
- Deploy config.
- Raw payload logging.
- Broad app context.
- Hidden reads or writes.
- Any behavior beyond Inbox typed-capture suggestion.

## Next Gate

If Stage 24 proof passes, EasyLife may move to Stage 25 Provider Readiness Gate.

Stage 25 may plan provider readiness, provider selection, secret management, and live dry-run approval. It still must not add live model calls unless a later explicit Stage 26 approval is given.
