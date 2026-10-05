$ErrorActionPreference = 'Stop'

$promptText = Get-Content -Raw -LiteralPath 'docs\codex\evidence\EASYWORKOUT_EMULATOR_DIAGNOSIS_CLAUDE_2026-10-05.md'
$claudeArgs = @(
  '-p'
  '--model', 'sonnet'
  '--effort', 'high'
  '--output-format', 'json'
  '--no-session-persistence'
  '--restricted'
  '--tools', 'Read,Glob,Grep,Bash'
  '--allowedTools', 'Read,Glob,Grep,Bash(java -version),Bash(node --version),Bash(npx --offline --yes firebase-tools@15.25.1 --version),Bash(npm --prefix app-vNext run test:emulator),Bash(netstat -ano),Bash(git status --short)'
  '--permission-mode', 'dontAsk'
  '--permission-prompts', 'none'
  '--strict-mcp-config'
  '--no-chrome'
)

$promptText | & claude @claudeArgs
exit $LASTEXITCODE
