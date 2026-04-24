param(
    [int]$Rounds = 1,
    [switch]$Push
)

$ErrorActionPreference = "Continue"

$Repo = "C:\Dev\easylifehq.github.io"
Set-Location $Repo

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$branch = "codex/practice-$timestamp"
$logDir = ".codex-logs\$timestamp"

Write-Host "Starting Codex practice loop on branch $branch" -ForegroundColor Cyan

# Keep raw Codex logs out of commits
if (!(Test-Path ".git\info\exclude")) {
    New-Item -ItemType File -Path ".git\info\exclude" -Force | Out-Null
}

$excludeText = Get-Content ".git\info\exclude" -Raw
if ($excludeText -notmatch "\.codex-logs/") {
    Add-Content ".git\info\exclude" "`n.codex-logs/"
}

mkdir $logDir -Force | Out-Null

function Get-FirstUncheckedTask {
    $lines = Get-Content "docs/codex/TASK_QUEUE.md"
    foreach ($line in $lines) {
        if ($line -match "^\s*-\s+\[ \]\s+(.+)$") {
            return $Matches[1].Trim()
        }
    }
    return $null
}

function Mark-FirstUncheckedTaskComplete {
    $path = "docs/codex/TASK_QUEUE.md"
    $lines = Get-Content $path
    $updated = $false

    $newLines = foreach ($line in $lines) {
        if (-not $updated -and $line -match "^(\s*-\s+)\[ \](\s+.+)$") {
            $updated = $true
            "$($Matches[1])[x]$($Matches[2])"
        } else {
            $line
        }
    }

    Set-Content $path $newLines
}

function Append-Report {
    param(
        [string]$Task,
        [string[]]$FilesChanged,
        [string]$BuildResult,
        [string]$Risk
    )

    if (!(Test-Path "docs/codex/NIGHTLY_REPORT.md")) {
        "# Codex Nightly Report`n" | Set-Content "docs/codex/NIGHTLY_REPORT.md"
    }

    $date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $files = if ($FilesChanged.Count -gt 0) {
        ($FilesChanged | ForEach-Object { "- `$_" }) -join "`n"
    } else {
        "- None"
    }

    Add-Content "docs/codex/NIGHTLY_REPORT.md" @"

## $date

- Task attempted: $Task
- Build result: $BuildResult
- Files changed:
$files
- Risks or follow-up needed: $Risk
"@
}

# Preflight: repo must be clean before starting
$status = (git status --porcelain) -join "`n"
if (![string]::IsNullOrWhiteSpace($status)) {
    Write-Host "Repo is not clean. Commit, restore, or stash changes before running the loop." -ForegroundColor Red
    git status
    exit 1
}

git checkout main
if ($LASTEXITCODE -ne 0) {
    Write-Host "Could not checkout main. Stopping." -ForegroundColor Red
    exit 1
}

git pull --ff-only
if ($LASTEXITCODE -ne 0) {
    Write-Host "Could not pull main cleanly. Stopping." -ForegroundColor Red
    exit 1
}

git checkout -b $branch
if ($LASTEXITCODE -ne 0) {
    Write-Host "Could not create practice branch. Stopping." -ForegroundColor Red
    exit 1
}

for ($i = 1; $i -le $Rounds; $i++) {
    Write-Host "`n===== ROUND $i of $Rounds =====" -ForegroundColor Cyan

    $task = Get-FirstUncheckedTask

    if ([string]::IsNullOrWhiteSpace($task)) {
        Append-Report -Task "No unchecked tasks" -FilesChanged @() -BuildResult "Skipped" -Risk "No unchecked tasks were found."
        Write-Host "No unchecked tasks found. Stopping." -ForegroundColor Yellow
        break
    }

    Write-Host "Selected task: $task" -ForegroundColor Cyan

    $implementPrompt = @"
Read CODEX.md if present and docs/codex/TASK_QUEUE.md.

You are running a supervised Codex practice loop.

Round: $i of $Rounds

Selected task:
$task

Rules:
1. Implement only the selected task.
2. Inspect relevant files before editing.
3. Make the smallest safe change.
4. Do not do broad rewrites.
5. Do not touch auth, Firebase rules, Cloud Functions, DNS, deployment settings, billing, secrets, API keys, old-site, root build output, TASK_QUEUE.md, or NIGHTLY_REPORT.md.
6. Prefer app-vNext source files only unless this is a docs-only task.
7. Do not run npm build commands. The outer PowerShell loop will run the build.
8. Do not mark the task complete. The outer PowerShell loop will do that only after build passes.
9. Summarize changed files and risks.
"@

    $log1 = "$logDir\round-$i-implement.log"

    & codex exec --full-auto "$implementPrompt" 2>&1 | Tee-Object -FilePath $log1
    $implementExit = $LASTEXITCODE

    if ($implementExit -ne 0) {
        Append-Report -Task $task -FilesChanged @() -BuildResult "Failed" -Risk "Codex implementation command failed."
        Write-Host "Codex implementation failed. Stopping loop for safety." -ForegroundColor Red
        break
    }

    $diff = (git diff) -join "`n"

    if ([string]::IsNullOrWhiteSpace($diff)) {
        Append-Report -Task $task -FilesChanged @() -BuildResult "Skipped" -Risk "Codex made no changes."
        Write-Host "No changes detected. Stopping loop." -ForegroundColor Yellow
        break
    }

    Write-Host "`nRunning external build check..." -ForegroundColor Yellow
    Push-Location "app-vNext"
    npm.cmd run build
    $buildOk = $LASTEXITCODE -eq 0
    Pop-Location

    if (-not $buildOk) {
        $filesChanged = git diff --name-only
        Append-Report -Task $task -FilesChanged $filesChanged -BuildResult "Failed" -Risk "External PowerShell build failed. Task not marked complete. Stopping loop."
        Write-Host "Build failed. Stopping loop for safety." -ForegroundColor Red
        break
    }

    $reviewPrompt = @"
Review the current git diff as a strict reviewer.

Selected task:
$task

Rules:
1. Run git diff yourself and inspect the working tree.
2. Check for bugs, broken mobile behavior, accidental scope creep, unrelated file edits, auth/Firebase/deployment/DNS/secrets risk, and bad UI choices.
3. If you find issues, fix only those issues.
4. Do not run npm build commands. The outer PowerShell loop will run the final build.
5. Do not edit TASK_QUEUE.md or NIGHTLY_REPORT.md.
6. Do not invent extra work.
7. Summarize whether the diff is safe.
"@

    $log2 = "$logDir\round-$i-review.log"

    & codex exec --full-auto "$reviewPrompt" 2>&1 | Tee-Object -FilePath $log2
    $reviewExit = $LASTEXITCODE

    if ($reviewExit -ne 0) {
        $filesChanged = git diff --name-only
        Append-Report -Task $task -FilesChanged $filesChanged -BuildResult "Failed" -Risk "Codex review command failed."
        Write-Host "Codex review failed. Stopping loop for safety." -ForegroundColor Red
        break
    }

    Write-Host "`nRunning final external build check..." -ForegroundColor Yellow
    Push-Location "app-vNext"
    npm.cmd run build
    $finalBuildOk = $LASTEXITCODE -eq 0
    Pop-Location

    if (-not $finalBuildOk) {
        $filesChanged = git diff --name-only
        Append-Report -Task $task -FilesChanged $filesChanged -BuildResult "Failed" -Risk "Final external PowerShell build failed. Task not marked complete."
        Write-Host "Final build failed. Stopping loop for safety." -ForegroundColor Red
        break
    }

    $filesChangedBeforeDocs = git diff --name-only

    Mark-FirstUncheckedTaskComplete
    Append-Report -Task $task -FilesChanged $filesChangedBeforeDocs -BuildResult "Passed" -Risk "Low. External build passed and review completed."

    $changed = (git status --porcelain) -join "`n"

    if (![string]::IsNullOrWhiteSpace($changed)) {
        git add .
        git commit -m "Codex practice round $i"

        if ($LASTEXITCODE -ne 0) {
            Write-Host "Commit failed. Stopping loop." -ForegroundColor Red
            break
        }

        if ($Push) {
            git push -u origin $branch
        }

        Write-Host "Round $i committed." -ForegroundColor Green
    } else {
        Write-Host "No commit needed for round $i." -ForegroundColor Yellow
    }
}

Write-Host "`nCodex practice loop finished." -ForegroundColor Cyan
Write-Host "Review report: docs/codex/NIGHTLY_REPORT.md"
Write-Host "Branch: $branch"
Write-Host "Raw logs: $logDir"