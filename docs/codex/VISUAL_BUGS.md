# Visual Bug Report

Generated: 2026-04-25 14:10:28
Project: EasyLife
Status: Needs Fixes
Artifacts: C:\Dev\easylifehq.github.io\.codex-logs\visual-inspect-20260425-141011

## Summary

- High: 1
- Medium: 1
- Low: 0

## Findings

1. [HIGH] covered-heading on /settings?visualQa=1 (desktop)
   - Selector: `h2`
   - Issue: Important heading appears covered by another element.
   - Evidence: Quick add covered by section.settings-hero.panel-section:nth-of-type(1)
   - Screenshot: C:\Dev\easylifehq.github.io\.codex-logs\visual-inspect-20260425-141011\settings-visualQa-1-desktop.png

2. [MEDIUM] small-tap-target on /settings?visualQa=1 (mobile)
   - Selector: `a.site-brand`
   - Issue: Interactive target may be hard to tap.
   - Evidence: 296x34px EL EasyLifeHQ Settings
   - Screenshot: C:\Dev\easylifehq.github.io\.codex-logs\visual-inspect-20260425-141011\settings-visualQa-1-mobile.png

## Suggested Task Queue Wording

- [ ] Visual QA: fix covered-heading on /settings?visualQa=1 in desktop view. Important heading appears covered by another element. Do not change backend, auth, secrets, dependencies, deployment config, generated output, or unrelated app behavior.
- [ ] Visual QA: fix small-tap-target on /settings?visualQa=1 in mobile view. Interactive target may be hard to tap. Do not change backend, auth, secrets, dependencies, deployment config, generated output, or unrelated app behavior.
