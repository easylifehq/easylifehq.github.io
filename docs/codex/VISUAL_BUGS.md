# Visual Bug Report

Generated: 2026-05-07 11:50:51
Project: EasyLife
Status: No Blocking Visual Bugs
Artifacts: C:\Dev\easylifehq.github.io\.codex-logs\visual-inspect-20260507-115034

## Summary

- High: 0
- Medium: 11
- Low: 0

## Information Staging Review

Contract: C:\Dev\easylifehq.github.io\docs\codex\INFORMATION_STAGING.md

- First screen job: help the signed-in user understand what to do next today.
- Primary content: one daily next action, today context, and compact module status from tasks, notes, calendar, workouts, or settings.
- Secondary actions: switch modules, add an item, brain dump, review a calendar block, open recent notes, or adjust settings.
- Detail content: task details, note bodies, project metadata, repeat scheduling, workout history, settings explanations, and experiment detail.
- Not visible at first: backend/auth implementation, AI/backend promises, internal build language, feature inventories, broad product claims, and every module control at once.
- How deeper information opens: the user follows module navigation, action buttons, tabs, panels, detail rows, drawers, or existing routes after the daily start surface has made the next useful action clear.

- No automated information-staging issues detected.

## Findings

1. [MEDIUM] console on /easycalendar?visualQa=1 (desktop)
   - Selector: `console`
   - Issue: Console warning or error was emitted.
   - Evidence: warning: Error while trying to use the following icon from the Manifest: http://127.0.0.1:65005/icons/easylife-icon.svg (Download error or resource isn't a valid image)
   - Screenshot: C:\Dev\easylifehq.github.io\.codex-logs\visual-inspect-20260507-115034\easycalendar-visualQa-1-desktop.png

2. [MEDIUM] console on /easycalendar?visualQa=1 (mobile)
   - Selector: `console`
   - Issue: Console warning or error was emitted.
   - Evidence: warning: Error while trying to use the following icon from the Manifest: http://127.0.0.1:65005/icons/easylife-icon.svg (Download error or resource isn't a valid image)
   - Screenshot: C:\Dev\easylifehq.github.io\.codex-logs\visual-inspect-20260507-115034\easycalendar-visualQa-1-mobile.png

3. [MEDIUM] small-tap-target on /settings?visualQa=1 (desktop)
   - Selector: `a.site-brand`
   - Issue: Interactive target may be hard to tap.
   - Evidence: 19x48px EL EasyLife
   - Screenshot: C:\Dev\easylifehq.github.io\.codex-logs\visual-inspect-20260507-115034\settings-visualQa-1-desktop.png

4. [MEDIUM] small-tap-target on /settings?visualQa=1 (desktop)
   - Selector: `a:nth-of-type(1)`
   - Issue: Interactive target may be hard to tap.
   - Evidence: 71x34px Today
   - Screenshot: C:\Dev\easylifehq.github.io\.codex-logs\visual-inspect-20260507-115034\settings-visualQa-1-desktop.png

5. [MEDIUM] small-tap-target on /settings?visualQa=1 (desktop)
   - Selector: `a:nth-of-type(2)`
   - Issue: Interactive target may be hard to tap.
   - Evidence: 70x34px Capture
   - Screenshot: C:\Dev\easylifehq.github.io\.codex-logs\visual-inspect-20260507-115034\settings-visualQa-1-desktop.png

6. [MEDIUM] small-tap-target on /settings?visualQa=1 (desktop)
   - Selector: `a:nth-of-type(3)`
   - Issue: Interactive target may be hard to tap.
   - Evidence: 49x34px Plan
   - Screenshot: C:\Dev\easylifehq.github.io\.codex-logs\visual-inspect-20260507-115034\settings-visualQa-1-desktop.png

7. [MEDIUM] small-tap-target on /settings?visualQa=1 (desktop)
   - Selector: `a:nth-of-type(4)`
   - Issue: Interactive target may be hard to tap.
   - Evidence: 58x34px Notes
   - Screenshot: C:\Dev\easylifehq.github.io\.codex-logs\visual-inspect-20260507-115034\settings-visualQa-1-desktop.png

8. [MEDIUM] small-tap-target on /settings?visualQa=1 (mobile)
   - Selector: `a:nth-of-type(1)`
   - Issue: Interactive target may be hard to tap.
   - Evidence: 51x32px Today
   - Screenshot: C:\Dev\easylifehq.github.io\.codex-logs\visual-inspect-20260507-115034\settings-visualQa-1-mobile.png

9. [MEDIUM] small-tap-target on /settings?visualQa=1 (mobile)
   - Selector: `a:nth-of-type(2)`
   - Issue: Interactive target may be hard to tap.
   - Evidence: 61x32px Capture
   - Screenshot: C:\Dev\easylifehq.github.io\.codex-logs\visual-inspect-20260507-115034\settings-visualQa-1-mobile.png

10. [MEDIUM] small-tap-target on /settings?visualQa=1 (mobile)
   - Selector: `a:nth-of-type(3)`
   - Issue: Interactive target may be hard to tap.
   - Evidence: 41x32px Plan
   - Screenshot: C:\Dev\easylifehq.github.io\.codex-logs\visual-inspect-20260507-115034\settings-visualQa-1-mobile.png

11. [MEDIUM] small-tap-target on /settings?visualQa=1 (mobile)
   - Selector: `a:nth-of-type(4)`
   - Issue: Interactive target may be hard to tap.
   - Evidence: 50x32px Notes
   - Screenshot: C:\Dev\easylifehq.github.io\.codex-logs\visual-inspect-20260507-115034\settings-visualQa-1-mobile.png

## Suggested Task Queue Wording

- [ ] Visual QA: fix console on /easycalendar?visualQa=1 in desktop view. Console warning or error was emitted. Do not change backend, auth, secrets, dependencies, deployment config, generated output, or unrelated app behavior.
- [ ] Visual QA: fix console on /easycalendar?visualQa=1 in mobile view. Console warning or error was emitted. Do not change backend, auth, secrets, dependencies, deployment config, generated output, or unrelated app behavior.
- [ ] Visual QA: fix small-tap-target on /settings?visualQa=1 in desktop view. Interactive target may be hard to tap. Do not change backend, auth, secrets, dependencies, deployment config, generated output, or unrelated app behavior.
- [ ] Visual QA: fix small-tap-target on /settings?visualQa=1 in desktop view. Interactive target may be hard to tap. Do not change backend, auth, secrets, dependencies, deployment config, generated output, or unrelated app behavior.
- [ ] Visual QA: fix small-tap-target on /settings?visualQa=1 in desktop view. Interactive target may be hard to tap. Do not change backend, auth, secrets, dependencies, deployment config, generated output, or unrelated app behavior.
- [ ] Visual QA: fix small-tap-target on /settings?visualQa=1 in desktop view. Interactive target may be hard to tap. Do not change backend, auth, secrets, dependencies, deployment config, generated output, or unrelated app behavior.
- [ ] Visual QA: fix small-tap-target on /settings?visualQa=1 in desktop view. Interactive target may be hard to tap. Do not change backend, auth, secrets, dependencies, deployment config, generated output, or unrelated app behavior.
- [ ] Visual QA: fix small-tap-target on /settings?visualQa=1 in mobile view. Interactive target may be hard to tap. Do not change backend, auth, secrets, dependencies, deployment config, generated output, or unrelated app behavior.
