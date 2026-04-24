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

# Preflight: repo must be clean before starting
$status = (git status --porcelain) -join "`n"
if (![string]::IsNullOrWhiteSpace($status)) {
    Write-Host "Repo is not clean. Commit, restore, or stash changes before running the loop." -ForegroundColor Red
    git status
    exit 1
}

# Start from fresh main
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

if (!(Test-Path "docs/codex/NIGHTLY_REPORT.md")) {
    "# Codex Nightly Report`n" | Set-Content "docs/codex/NIGHTLY_REPORT.md"
}

for ($i = 1; $i -le $Rounds; $i++) {
    Write-Host "`n===== ROUND $i of $Rounds =====" -ForegroundColor Cyan

    $implementPrompt = @"
Read CODEX.md if present, AGENTS.md if present, docs/codex/LOOP.md if present, and docs/codex/TASK_QUEUE.md.

You are running a supervised practice Codex loop.

Round: $i of $Rounds

Pick the first unchecked task in docs/codex/TASK_QUEUE.md.

If there are no unchecked tasks:
- append a final summary to docs/codex/NIGHTLY_REPORT.md
- make no code changes
- stop after reporting

For the selected task:
1. Inspect the relevant files before editing.
2. Implement only the selected task.
3. Do not do broad rewrites.
4. Do not touch auth, Firebase rules, Cloud Functions, DNS, deployment settings, billing, secrets, API keys, old-site, or root build output.
5. Prefer app-vNext source files only.
6. Run the app-vNext production build using:
   cd app-vNext
   npm.cmd run build
7. If the build fails, fix the issue only if it is directly caused by your change.
8. Review your own diff for bugs, mobile regressions, scope creep, and accidental unrelated edits.
9. Only mark the task complete in docs/codex/TASK_QUEUE.md if the build passes.
10. Append a concise report entry to docs/codex/NIGHTLY_REPORT.md with:
   - task attempted
   - files changed
   - build result
   - risks or follow-up needed
"@

    $log1 = "$logDir\round-$i-implement.log"

    & codex exec --full-auto "$implementPrompt" 2>&1 | Tee-Object -FilePath $log1
    $implementExit = $LASTEXITCODE

    if ($implementExit -ne 0) {
        Add-Content "docs/codex/NIGHTLY_REPORT.md" "`n## Round $i`nCodex implementation command failed. Stopping loop for safety.`n"
        Write-Host "Codex implementation failed. Stopping loop for safety." -ForegroundColor Red
        break
    }

    Write-Host "`nRunning external build check..." -ForegroundColor Yellow
    Push-Location "app-vNext"
    npm.cmd run build
    $buildOk = $LASTEXITCODE -eq 0
    Pop-Location

    if (-not $buildOk) {
        Add-Content "docs/codex/NIGHTLY_REPORT.md" "`n## Round $i`nExternal build failed after implementation. Stopping loop for safety.`n"
        Write-Host "Build failed. Stopping loop for safety." -ForegroundColor Red
        break
    }

    $diff = (git diff) -join "`n"

    if ([string]::IsNullOrWhiteSpace($diff)) {
        Add-Content "docs/codex/NIGHTLY_REPORT.md" "`n## Round $i`nNo code changes detected. Stopping loop.`n"
        Write-Host "No changes detected. Stopping loop." -ForegroundColor Yellow
        break
    }

    $reviewPrompt = @"
Review the current git diff as a strict reviewer.

You are the review pass in a supervised Codex practice loop.

Run git diff yourself and inspect the current working tree.

Check for:
- bugs
- broken mobile behavior
- accidental scope creep
- unrelated file edits
- auth/Firebase/deployment/DNS/secrets risk
- build/test issues
- bad UI choices

If you find issues:
- fix only those issues
- rerun app-vNext build with npm.cmd run build
- update docs/codex/NIGHTLY_REPORT.md

If the diff is safe:
- do not invent extra work
- append a concise approval note to docs/codex/NIGHTLY_REPORT.md
"@

    $log2 = "$logDir\round-$i-review.log"

    & codex exec --full-auto "$reviewPrompt" 2>&1 | Tee-Object -FilePath $log2
    $reviewExit = $LASTEXITCODE

    if ($reviewExit -ne 0) {
        Add-Content "docs/codex/NIGHTLY_REPORT.md" "`n## Round $i`nCodex review command failed. Stopping loop for safety.`n"
        Write-Host "Codex review failed. Stopping loop for safety." -ForegroundColor Red
        break
    }

    Write-Host "`nRunning final build check..." -ForegroundColor Yellow
    Push-Location "app-vNext"
    npm.cmd run build
    $finalBuildOk = $LASTEXITCODE -eq 0
    Pop-Location

    if (-not $finalBuildOk) {
        Add-Content "docs/codex/NIGHTLY_REPORT.md" "`n## Round $i`nFinal build failed after review. Stopping loop for safety.`n"
        Write-Host "Final build failed. Stopping loop for safety." -ForegroundColor Red
        break
    }

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