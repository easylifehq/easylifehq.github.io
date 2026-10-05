$ErrorActionPreference = 'Stop'

$promptText = Get-Content -Raw -LiteralPath 'docs\codex\evidence\EASYWORKOUT_DURABLE_IMPORT_CLAUDE_WORKUNIT_2026-10-05.md'
$claudeArgs = @(
  '-p'
  '--model', 'sonnet'
  '--effort', 'high'
  '--output-format', 'json'
  '--no-session-persistence'
  '--restricted'
  '--tools', 'Read,Edit,Write,Glob,Grep,Bash'
  '--allowedTools', 'Read,Edit,Write,Glob,Grep,Bash(node --experimental-strip-types --test app-vNext/tests/*),Bash(npm --prefix app-vNext test),Bash(npm --prefix app-vNext run typecheck),Bash(npm --prefix app-vNext run build),Bash(npm --prefix app-vNext run test:emulator),Bash(git status --short),Bash(git diff --check),Bash(git diff -- *)'
  '--permission-mode', 'acceptEdits'
  '--permission-prompts', 'none'
  '--strict-mcp-config'
  '--no-chrome'
)

$promptText | & claude @claudeArgs
exit $LASTEXITCODE
