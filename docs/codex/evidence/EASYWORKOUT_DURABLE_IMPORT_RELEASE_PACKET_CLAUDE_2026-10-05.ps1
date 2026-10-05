$ErrorActionPreference = 'Stop'

$promptText = Get-Content -Raw -LiteralPath 'docs\codex\evidence\EASYWORKOUT_DURABLE_IMPORT_RELEASE_PACKET_CLAUDE_2026-10-05.md'
$claudeArgs = @(
  '-p'
  '--model', 'sonnet'
  '--effort', 'high'
  '--output-format', 'json'
  '--no-session-persistence'
  '--restricted'
  '--tools', 'Read,Write,Glob,Grep,Bash'
  '--allowedTools', 'Read,Write,Glob,Grep,Bash(git status --short),Bash(git diff --stat),Bash(git diff -- firestore.rules),Bash(git rev-parse HEAD)'
  '--permission-mode', 'acceptEdits'
  '--permission-prompts', 'none'
  '--strict-mcp-config'
  '--no-chrome'
)

$promptText | & claude @claudeArgs
exit $LASTEXITCODE
