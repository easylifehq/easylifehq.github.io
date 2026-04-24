# EasyLife Codex Loop

## Roles

ChatGPT:
- Plans features
- Breaks goals into small Codex-safe tasks
- Reviews Codex summaries and diffs
- Decides whether to commit, revise, split, or revert

Codex:
- Works inside the repo
- Makes small code changes
- Runs build/test checks
- Explains changed files, test results, and risks

Human:
- Approves commands
- Reviews diffs
- Commits/pushes
- Handles secrets, deployment, Firebase, billing, DNS, and production settings

## Standard Loop

1. Start clean:
   git status
   git pull

2. Create a branch:
   git checkout -b codex/task-name

3. Start local dev server if needed:
   cd app-vNext
   npm run dev

4. In another terminal from repo root:
   codex

5. Give Codex one small task.

6. Codex must:
   - Read CODEX.md
   - Inspect before editing
   - Avoid secrets/auth/deploy unless explicitly asked
   - Run build/test checks
   - Summarize changed files, test results, and risks

7. Human checks:
   git diff
   git status

8. If good:
   git add .
   git commit -m "Clear commit message"
   git push -u origin codex/task-name

9. Merge only after review.

## Never unattended

Do not let Codex do these unattended:
- Firebase rules
- auth rewrites
- production deploys
- DNS
- billing/API key setup
- database migrations
- deleting/renaming many files
- merging to main
