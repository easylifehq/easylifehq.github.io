[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $PSScriptRoot

function Invoke-ReleaseGate {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Label,
    [Parameter(Mandatory = $true)]
    [scriptblock]$Command
  )

  Write-Host ""
  Write-Host "== $Label =="
  & $Command
  if ($LASTEXITCODE -ne 0) {
    throw "$Label failed with exit code $LASTEXITCODE."
  }
}

Push-Location (Join-Path $repositoryRoot "app-vNext")
try {
  Invoke-ReleaseGate "Application tests" { npm.cmd test }
  Invoke-ReleaseGate "Firestore Emulator integration" { npm.cmd run test:emulator }
  Invoke-ReleaseGate "TypeScript" { npm.cmd run typecheck }
  Invoke-ReleaseGate "Production build" { npm.cmd run build }
  Invoke-ReleaseGate "Web production critical advisory gate" { npm.cmd audit --omit=dev --audit-level=critical }
}
finally {
  Pop-Location
}

Push-Location (Join-Path $repositoryRoot "functions")
try {
  Invoke-ReleaseGate "Functions syntax lint" { npm.cmd run lint }
  Invoke-ReleaseGate "Functions production critical advisory gate" { npm.cmd audit --omit=dev --audit-level=critical }
}
finally {
  Pop-Location
}

Write-Host ""
Write-Host "EasyLife deterministic release gates passed."
