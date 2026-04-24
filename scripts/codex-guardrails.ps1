param(
    [string]$Task,

    [string]$Stage = "diff",

    [int]$MaxChangedFiles = 8
)

$ErrorActionPreference = "Continue"

if ([string]::IsNullOrWhiteSpace($Task)) {
    $Task = $env:CODEX_SELECTED_TASK
}

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
    "npm-shrinkwrap.json",
    "package-lock.json",
    "app-vNext/package.json",
    "app-vNext/npm-shrinkwrap.json",
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
    "^app-vNext/coverage/",
    "^coverage/",
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

$addedDiffLines = @(git diff --unified=0 | Where-Object {
    $_ -match "^\+" -and $_ -notmatch "^\+\+\+"
})

$debugLines = @($addedDiffLines | Where-Object {
    $_ -match "\bconsole\.(log|debug|trace)\b" -or $_ -match "\bdebugger\b"
})

if ($debugLines.Count -gt 0) {
    Stop-Guardrail "Debug statements were added."
}

$todoLines = @($addedDiffLines | Where-Object {
    $_ -match "(?i)\b(TODO|FIXME|HACK)\b"
})

if ($todoLines.Count -gt 0) {
    Stop-Guardrail "Unresolved TODO/FIXME/HACK comments were added."
}

if (-not $isDocsOnlyTask) {
    $backendOrAiRiskLines = @($addedDiffLines | Where-Object {
        $_ -match "(?i)(fetch\(|axios|XMLHttpRequest|openai|anthropic|gemini|api key|api-key|secret|bearer token|cloud function|httpsCallable|firebase functions|process\.env|import\.meta\.env)"
    })

    if ($backendOrAiRiskLines.Count -gt 0) {
        Stop-Guardrail "Backend/API/AI integration risk was added."
    }
}

Write-Host "Guardrails passed during ${Stage}: $($normalizedFiles.Count) changed file(s)." -ForegroundColor Green
