$ErrorActionPreference = 'Stop'

$promptText = Get-Content -Raw -LiteralPath 'docs\codex\evidence\EASYWORKOUT_DURABLE_IMPORT_CLAUDE_REVIEW_2026-10-05.md'
$claudeArgs = @(
  '-p'
  '--model', 'sonnet'
  '--effort', 'high'
  '--output-format', 'json'
  '--no-session-persistence'
  '--restricted'
  '--tools', 'Read,Glob,Grep,Bash'
  '--allowedTools', 'Read,Glob,Grep,Bash(node --experimental-strip-types --test app-vNext/tests/legacy-workout-durable-import.test.mjs app-vNext/tests/legacy-workout-durable-import-ui.test.mjs),Bash(npm --prefix app-vNext test),Bash(npm --prefix app-vNext run typecheck),Bash(npm --prefix app-vNext run build),Bash(npm --prefix app-vNext run test:workout-stats-progress),Bash(npm --prefix app-vNext run test:emulator),Bash(git status --short),Bash(git diff --check),Bash(git diff -- app-vNext/src app-vNext/tests firestore.rules docs/codex)'
  '--permission-mode', 'plan'
  '--permission-prompts', 'none'
  '--strict-mcp-config'
  '--no-chrome'
)

$promptText | & claude @claudeArgs
exit $LASTEXITCODE
