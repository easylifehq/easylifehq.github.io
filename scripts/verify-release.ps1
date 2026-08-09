[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $PSScriptRoot
$npmExecutable = if ([Environment]::OSVersion.Platform -eq [PlatformID]::Win32NT) { "npm.cmd" } else { "npm" }

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
  Invoke-ReleaseGate "Application tests" { & $npmExecutable test }
  Invoke-ReleaseGate "Firestore Emulator integration" { & $npmExecutable run test:emulator }
  Invoke-ReleaseGate "TypeScript" { & $npmExecutable run typecheck }
  Invoke-ReleaseGate "Production build" { & $npmExecutable run build }
  Invoke-ReleaseGate "Web production critical advisory gate" { & $npmExecutable audit --omit=dev --audit-level=critical }
}
finally {
  Pop-Location
}

Invoke-ReleaseGate "Publication tool tests" {
  node --test `
    (Join-Path $repositoryRoot "scripts/tests/prepare-pages-publication.test.mjs") `
    (Join-Path $repositoryRoot "scripts/tests/serve-pages-candidate.test.mjs") `
    (Join-Path $repositoryRoot "scripts/tests/verify-production-publication.test.mjs")
}

$temporaryRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("easylife-pages-verification-" + [Guid]::NewGuid().ToString("N"))
$candidateRoot = Join-Path $temporaryRoot "candidate"
$planPath = Join-Path $temporaryRoot "root-diff-plan.json"
try {
  Invoke-ReleaseGate "Staged publication candidate" {
    node (Join-Path $repositoryRoot "scripts/prepare-pages-publication.mjs") --stage $candidateRoot --plan $planPath
  }
  Invoke-ReleaseGate "Publication hash verification" {
    node (Join-Path $repositoryRoot "scripts/prepare-pages-publication.mjs") --verify-stage $candidateRoot
  }
}
finally {
  $resolvedTemp = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
  $resolvedTarget = [System.IO.Path]::GetFullPath($temporaryRoot)
  if ((Test-Path -LiteralPath $resolvedTarget) -and $resolvedTarget.StartsWith($resolvedTemp, [StringComparison]::OrdinalIgnoreCase)) {
    Remove-Item -LiteralPath $resolvedTarget -Recurse -Force
  }
}

Push-Location (Join-Path $repositoryRoot "functions")
try {
  Invoke-ReleaseGate "Functions syntax lint" { & $npmExecutable run lint }
  Invoke-ReleaseGate "Functions production critical advisory gate" { & $npmExecutable audit --omit=dev --audit-level=critical }
}
finally {
  Pop-Location
}

Write-Host ""
Write-Host "EasyLife deterministic release gates passed."
