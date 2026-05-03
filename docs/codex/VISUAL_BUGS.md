# Visual Bug Report

Generated: 2026-05-03 10:59:49
Project: EasyLife
Status: No Blocking Visual Bugs
Artifacts: C:\Dev\easylifehq.github.io\.codex-logs\visual-inspect-20260503-105931

## Summary

- High: 0
- Medium: 2
- Low: 0

## Information Staging Review

Contract: C:\Dev\easylifehq.github.io\docs\codex\INFORMATION_STAGING.md

- First screen job: help the signed-in user understand what to do next today.
- Primary content: one daily next action, today context, and compact module status from tasks, notes, calendar, workouts, or settings.
- Secondary actions: switch modules, add an item, brain dump, review a calendar block, open recent notes, or adjust settings.
- Detail content: task details, note bodies, project metadata, repeat scheduling, workout history, settings explanations, and experiment detail.
- Not visible at first: backend/auth implementation, AI/backend promises, internal build language, feature inventories, broad product claims, and every module control at once.
- How deeper information opens: the user follows module navigation, action buttons, tabs, panels, detail rows, drawers, or existing routes after the daily start surface has made the next useful action clear.

- [MEDIUM] First screen exposes too many actions before the user reaches the primary job. (/settings?visualQa=1, desktop)
  - Evidence: 17 interactive controls above the fold

## Findings

1. [MEDIUM] small-tap-target on /settings?visualQa=1 (desktop)
   - Selector: `a`
   - Issue: Interactive target may be hard to tap.
   - Evidence: 250x21px Report a Bug / Suggest an Improvement
   - Screenshot: C:\Dev\easylifehq.github.io\.codex-logs\visual-inspect-20260503-105931\settings-visualQa-1-desktop.png

2. [MEDIUM] information-staging-too-many-actions on /settings?visualQa=1 (desktop)
   - Selector: `first-screen`
   - Issue: First screen exposes too many actions before the user reaches the primary job.
   - Evidence: 17 interactive controls above the fold
   - Screenshot: C:\Dev\easylifehq.github.io\.codex-logs\visual-inspect-20260503-105931\settings-visualQa-1-desktop.png

## Suggested Task Queue Wording

- [ ] Visual QA: fix small-tap-target on /settings?visualQa=1 in desktop view. Interactive target may be hard to tap. Do not change backend, auth, secrets, dependencies, deployment config, generated output, or unrelated app behavior.
- [ ] User pain: the first screen is exposing too much information before the main job is clear. Target: /settings?visualQa=1 in desktop view. Change: repair information staging so the documented primary job is dominant and detail/internal content moves behind the documented opener. First screen: keep the documented primary job and one obvious next action visible. Remove/simplify: demote overloaded, misplaced, or too-early detail content from the first screen. Guardrails: do not change backend, auth, secrets, dependencies, deployment config, generated output, or unrelated app behavior. Acceptance: visual inspect reports no information-staging-too-many-actions finding for this route and viewport. Check: rerun visual inspect and confirm the Information Staging Review no longer reports information-staging-too-many-actions. [class:design risk:low mode:single impact:visible surface:mixed]
