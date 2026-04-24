param(
    [Parameter(Mandatory = $true)]
    [string]$Task,

    [string]$Stage = "diff",

    [int]$MaxChangedFiles = 8
)

$ErrorActionPreference = "Continue"

function Stop-Guardrail {
    param([string]$Message)

    Write-Host "Guardrail failed during ${Stage}: $Message" -ForegroundColor Red
    exit 1
}

$changedFiles = @(git diff --name-only)

if ($LASTEXITCODE -ne 0) {
    Stop-Guardrail "Could not inspect git diff."
}

if ($changedFiles.Count -eq 0) {
    Stop-Guardrail "No changed files found."
}

if ($changedFiles.Count -gt $MaxChangedFiles) {
    Stop-Guardrail "Too many files changed ($($changedFiles.Count)); max is $MaxChangedFiles."
}

$forbiddenExact = @(
    ".firebaserc",
    "firebase.json",
    "firestore.rules",
    "package.json",
    "package-lock.json",
    "app-vNext/package.json",
    "app-vNext/package-lock.json",
    "docs/codex/TASK_QUEUE.md",
    "docs/codex/NIGHTLY_REPORT.md"
)

$forbiddenPatterns = @(
    "^functions/",
    "^old-site/",
    "^dist/",
    "^build/",
    "^app-vNext/dist/",
    "^app-vNext/build/",
    "^\.env($|\.)",
    "(^|/)\.env($|\.)",
    "\.(pem|key|p12|pfx)$",
    "(secret|credential|apikey|api-key|service-account)"
)

$normalizedFiles = $changedFiles | ForEach-Object { $_ -replace "\\", "/" }

$blocked = @()
foreach ($file in $normalizedFiles) {
    if ($forbiddenExact -contains $file) {
        $blocked += $file
        continue
    }

    foreach ($pattern in $forbiddenPatterns) {
        if ($file -match $pattern) {
            $blocked += $file
            break
        }
    }
}

if ($blocked.Count -gt 0) {
    Stop-Guardrail "Forbidden file changes detected: $($blocked -join ', ')"
}

$isDocsOnlyTask = $Task -match "(?i)\bdocs?\b|documentation|TASK_BOARD|LOOP\.md"

if ($isDocsOnlyTask) {
    $nonDocsChanges = @($normalizedFiles | Where-Object { $_ -notmatch "^docs/" })
    if ($nonDocsChanges.Count -gt 0) {
        Stop-Guardrail "Docs task changed non-doc files: $($nonDocsChanges -join ', ')"
    }
} else {
    $docsChanges = @($normalizedFiles | Where-Object { $_ -match "^docs/" })
    if ($docsChanges.Count -gt 0) {
        Stop-Guardrail "Non-doc task changed docs files: $($docsChanges -join ', ')"
    }
}

$largeFiles = @()
foreach ($file in $normalizedFiles) {
    if (Test-Path $file) {
        $item = Get-Item $file
        if ($item.Length -gt 500KB) {
            $largeFiles += $file
        }
    }
}

if ($largeFiles.Count -gt 0) {
    Stop-Guardrail "Large file changes detected: $($largeFiles -join ', ')"
}

Write-Host "Guardrails passed during ${Stage}: $($normalizedFiles.Count) changed file(s)." -ForegroundColor Green
