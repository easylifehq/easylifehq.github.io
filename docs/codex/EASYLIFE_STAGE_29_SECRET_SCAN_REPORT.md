# EasyLife Stage 29 Secret Scan Report

Date: 2026-05-17

Verdict: `NO_AI_PROVIDER_SECRET_FOUND`

Secondary note: `PUBLIC_FIREBASE_WEB_CONFIG_PRESENT`

## Scope

This scan covered the Stage 29 Task 1 surfaces:

- Frontend source: `app-vNext/src`
- Docs: `docs`
- Env examples: `app-vNext/.env.example`
- Built output after build: `app-vNext/dist`

The scan did not print or commit any raw secret values. Suspicious matches were classified by pattern name, file path, and redacted context only.

## Build Proof

Passed: `npm.cmd run build` from `app-vNext`.

## Patterns Checked

- OpenAI-style key shape
- Anthropic-style key shape
- Google API-key-like shape
- AWS access-key shape
- GitHub token shape
- Slack token shape
- Private-key block marker
- Provider secret environment names
- Browser-exposed provider environment names such as `VITE_*AI*KEY`

## Results

### AI Provider Keys

Result: `clean`

No OpenAI, Anthropic, GitHub, Slack, AWS, private-key block, or AI-provider secret value was found in the scoped frontend source, docs, env example, or built output.

### OpenAI-Style False Positives

Result: `false-positive`

The broad `sk-...` pattern matched strings derived from `task-save` class names and Magic Scorecard labels. These are not secrets and do not contain provider credentials.

Affected scoped areas:

- `app-vNext/src/features/easylist/routes/EasyListInboxPage.tsx`
- `app-vNext/src/styles/globals.css`
- `docs/codex/MAGIC_SCORECARD.md`
- `app-vNext/dist/assets/EasyListInboxPage-*.js`
- `app-vNext/dist/assets/index-*.css`

Classification: safe false-positive caused by the substring `sk-` inside task-save wording.

### Firebase Web Config

Result: `expected-public-web-config`

One Google API-key-like value appears in the Firebase web config and built frontend bundle.

Affected scoped areas:

- `app-vNext/src/lib/firebase/config.ts`
- `app-vNext/dist/assets/index-*.js`

Classification: this is the existing browser-exposed Firebase web `apiKey` value. It is not an AI/model provider key. It must not be reused or treated as safe storage for AI provider secrets.

### Provider Secret Placeholder Names

Result: `reference-only`

Provider secret names such as `SERVER_AI_PROVIDER_API_KEY` appear as documentation or typed placeholder references. No real key value was found.

Affected scoped areas:

- `app-vNext/src/features/assistant/serverGateway/serverGatewayLiveDryRunTypes.ts`
- Stage 25/26/29 Codex docs
- Firebase and OpenAI analyzer docs that discuss secret handling

Classification: safe placeholder/reference only.

### Browser-Exposed Provider Env Names

Result: `reference-only`

The scan found documentation references warning against browser-exposed provider env names such as `VITE_*AI*KEY`. No real browser-exposed AI provider key value was found.

Classification: warning text only.

### Env Example

Result: `clean`

Env example file checked:

- `app-vNext/.env.example`

No provider secret value or provider-secret placeholder match was found in the env example.

## Built Output Check

Built output was checked after `npm.cmd run build`.

Result:

- No AI/provider secret value found.
- `task-save` false positives appear in the built Inbox bundle/CSS.
- Existing public Firebase web config appears in the built app bundle.

## Risk Notes

- The public Firebase web config is browser-exposed by design. It is not an AI provider secret, but it should keep being treated as unsuitable for provider-secret storage.
- Any future provider secret must stay server-side only.
- `VITE_` values remain browser-exposed and forbidden for provider secrets.
- Future scans should preserve the same redaction rule: do not print raw match values.

## Verdict

`NO_AI_PROVIDER_SECRET_FOUND`

Do not proceed to live provider work based on this scan alone. This only proves the current frontend/doc/bundle surfaces do not contain an AI provider key. Stage 29 still needs logging redaction proof, hidden-write/external-action audit, rollback/kill-switch proof, and the private-alpha readiness gate.
