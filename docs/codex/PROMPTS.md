# Codex Prompts

## ChatGPT Planner Prompt

You are the planning side of my Codex loop.

Project: EasyLife HQ / EasyList / EasyCalendar / EasyPipeline.
Break this goal into small Codex-safe tasks.

Rules:
- Each task should fit in one branch.
- Avoid broad rewrites.
- Tell Codex exactly what files/folders to inspect.
- Include acceptance checks.
- Include what NOT to touch.
- Order tasks from safest to riskiest.

Goal:
[PASTE GOAL]

## Codex Worker Prompt

Read CODEX.md and docs/codex/LOOP.md first.

Task:
[PASTE ONE SMALL TASK]

Rules:
- Inspect before editing.
- Make the smallest safe change.
- Do not touch auth, Firebase rules, Cloud Functions, DNS, deployment settings, billing, secrets, or old-site unless explicitly asked.
- Prefer app-vNext source files.
- Run the appropriate build/test command before finishing.
- Summarize changed files, test results, and risks.

## ChatGPT Review Prompt

Review this Codex change.

Original task:
[PASTE TASK]

Codex summary:
[PASTE SUMMARY]

Diff:
[PASTE DIFF IF SMALL]

Check for:
- bugs
- accidental scope creep
- bad UI choices
- broken mobile behavior
- Firebase/auth/deploy risks
- whether I should commit, revise, or revert
