# Visual Bug Report

Generated: 2026-05-01 15:12:00
Project: EasyLife
Status: No Blocking Visual Bugs
Artifacts: C:\Dev\easylifehq.github.io\.codex-logs\visual-inspect-20260501-151143

## Summary

- High: 0
- Medium: 1
- Low: 5

## Information Staging Review

Contract: C:\Dev\easylifehq.github.io\docs\codex\INFORMATION_STAGING.md

- First screen job: help the signed-in user understand what to do next today.
- Primary content: one daily next action, today context, and compact module status from tasks, notes, calendar, workouts, or settings.
- Secondary actions: switch modules, add an item, brain dump, review a calendar block, open recent notes, or adjust settings.
- Detail content: task details, note bodies, project metadata, repeat scheduling, workout history, settings explanations, and experiment detail.
- Not visible at first: backend/auth implementation, AI/backend promises, internal build language, feature inventories, broad product claims, and every module control at once.
- How deeper information opens: the user follows module navigation, action buttons, tabs, panels, detail rows, drawers, or existing routes after the daily start surface has made the next useful action clear.

- [MEDIUM] First screen looks overloaded for the documented information-staging contract. (/settings?visualQa=1, desktop)
  - Evidence: 203 words and 11 interactive controls above the fold
- [LOW] First screen has too many competing headings for a calm staged layout. (/, desktop)
  - Evidence: 6 headings above the fold
- [LOW] First screen has too many competing headings for a calm staged layout. (/easylist?visualQa=1, desktop)
  - Evidence: 6 headings above the fold
- [LOW] First screen has too many competing headings for a calm staged layout. (/easynotes?visualQa=1, desktop)
  - Evidence: 6 headings above the fold
- [LOW] First screen has too many competing headings for a calm staged layout. (/easycalendar?visualQa=1, desktop)
  - Evidence: 6 headings above the fold
- [LOW] First screen has too many competing headings for a calm staged layout. (/easyworkout?visualQa=1, desktop)
  - Evidence: 6 headings above the fold

## Findings

1. [MEDIUM] information-staging-overload on /settings?visualQa=1 (desktop)
   - Selector: `first-screen`
   - Issue: First screen looks overloaded for the documented information-staging contract.
   - Evidence: 203 words and 11 interactive controls above the fold
   - Screenshot: C:\Dev\easylifehq.github.io\.codex-logs\visual-inspect-20260501-151143\settings-visualQa-1-desktop.png

2. [LOW] information-staging-too-many-headings on / (desktop)
   - Selector: `first-screen`
   - Issue: First screen has too many competing headings for a calm staged layout.
   - Evidence: 6 headings above the fold
   - Screenshot: C:\Dev\easylifehq.github.io\.codex-logs\visual-inspect-20260501-151143\root-desktop.png

3. [LOW] information-staging-too-many-headings on /easylist?visualQa=1 (desktop)
   - Selector: `first-screen`
   - Issue: First screen has too many competing headings for a calm staged layout.
   - Evidence: 6 headings above the fold
   - Screenshot: C:\Dev\easylifehq.github.io\.codex-logs\visual-inspect-20260501-151143\easylist-visualQa-1-desktop.png

4. [LOW] information-staging-too-many-headings on /easynotes?visualQa=1 (desktop)
   - Selector: `first-screen`
   - Issue: First screen has too many competing headings for a calm staged layout.
   - Evidence: 6 headings above the fold
   - Screenshot: C:\Dev\easylifehq.github.io\.codex-logs\visual-inspect-20260501-151143\easynotes-visualQa-1-desktop.png

5. [LOW] information-staging-too-many-headings on /easycalendar?visualQa=1 (desktop)
   - Selector: `first-screen`
   - Issue: First screen has too many competing headings for a calm staged layout.
   - Evidence: 6 headings above the fold
   - Screenshot: C:\Dev\easylifehq.github.io\.codex-logs\visual-inspect-20260501-151143\easycalendar-visualQa-1-desktop.png

6. [LOW] information-staging-too-many-headings on /easyworkout?visualQa=1 (desktop)
   - Selector: `first-screen`
   - Issue: First screen has too many competing headings for a calm staged layout.
   - Evidence: 6 headings above the fold
   - Screenshot: C:\Dev\easylifehq.github.io\.codex-logs\visual-inspect-20260501-151143\easyworkout-visualQa-1-desktop.png

## Suggested Task Queue Wording

- [ ] User pain: the first screen is exposing too much information before the main job is clear. Target: /settings?visualQa=1 in desktop view. Change: repair information staging so the documented primary job is dominant and detail/internal content moves behind the documented opener. First screen: keep the documented primary job and one obvious next action visible. Remove/simplify: demote overloaded, misplaced, or too-early detail content from the first screen. Guardrails: do not change backend, auth, secrets, dependencies, deployment config, generated output, or unrelated app behavior. Acceptance: visual inspect reports no information-staging-overload finding for this route and viewport. Check: rerun visual inspect and confirm the Information Staging Review no longer reports information-staging-overload. [class:design risk:low mode:single impact:visible surface:mixed]
- [ ] User pain: the first screen is exposing too much information before the main job is clear. Target: / in desktop view. Change: repair information staging so the documented primary job is dominant and detail/internal content moves behind the documented opener. First screen: keep the documented primary job and one obvious next action visible. Remove/simplify: demote overloaded, misplaced, or too-early detail content from the first screen. Guardrails: do not change backend, auth, secrets, dependencies, deployment config, generated output, or unrelated app behavior. Acceptance: visual inspect reports no information-staging-too-many-headings finding for this route and viewport. Check: rerun visual inspect and confirm the Information Staging Review no longer reports information-staging-too-many-headings. [class:design risk:low mode:single impact:visible surface:mixed]
- [ ] User pain: the first screen is exposing too much information before the main job is clear. Target: /easylist?visualQa=1 in desktop view. Change: repair information staging so the documented primary job is dominant and detail/internal content moves behind the documented opener. First screen: keep the documented primary job and one obvious next action visible. Remove/simplify: demote overloaded, misplaced, or too-early detail content from the first screen. Guardrails: do not change backend, auth, secrets, dependencies, deployment config, generated output, or unrelated app behavior. Acceptance: visual inspect reports no information-staging-too-many-headings finding for this route and viewport. Check: rerun visual inspect and confirm the Information Staging Review no longer reports information-staging-too-many-headings. [class:design risk:low mode:single impact:visible surface:mixed]
- [ ] User pain: the first screen is exposing too much information before the main job is clear. Target: /easynotes?visualQa=1 in desktop view. Change: repair information staging so the documented primary job is dominant and detail/internal content moves behind the documented opener. First screen: keep the documented primary job and one obvious next action visible. Remove/simplify: demote overloaded, misplaced, or too-early detail content from the first screen. Guardrails: do not change backend, auth, secrets, dependencies, deployment config, generated output, or unrelated app behavior. Acceptance: visual inspect reports no information-staging-too-many-headings finding for this route and viewport. Check: rerun visual inspect and confirm the Information Staging Review no longer reports information-staging-too-many-headings. [class:design risk:low mode:single impact:visible surface:mixed]
- [ ] User pain: the first screen is exposing too much information before the main job is clear. Target: /easycalendar?visualQa=1 in desktop view. Change: repair information staging so the documented primary job is dominant and detail/internal content moves behind the documented opener. First screen: keep the documented primary job and one obvious next action visible. Remove/simplify: demote overloaded, misplaced, or too-early detail content from the first screen. Guardrails: do not change backend, auth, secrets, dependencies, deployment config, generated output, or unrelated app behavior. Acceptance: visual inspect reports no information-staging-too-many-headings finding for this route and viewport. Check: rerun visual inspect and confirm the Information Staging Review no longer reports information-staging-too-many-headings. [class:design risk:low mode:single impact:visible surface:mixed]
- [ ] User pain: the first screen is exposing too much information before the main job is clear. Target: /easyworkout?visualQa=1 in desktop view. Change: repair information staging so the documented primary job is dominant and detail/internal content moves behind the documented opener. First screen: keep the documented primary job and one obvious next action visible. Remove/simplify: demote overloaded, misplaced, or too-early detail content from the first screen. Guardrails: do not change backend, auth, secrets, dependencies, deployment config, generated output, or unrelated app behavior. Acceptance: visual inspect reports no information-staging-too-many-headings finding for this route and viewport. Check: rerun visual inspect and confirm the Information Staging Review no longer reports information-staging-too-many-headings. [class:design risk:low mode:single impact:visible surface:mixed]
