# EasyLife P3 Repeatable Sprint Prompt

Use this prompt to continue the P3 awesome-app polish and demo excellence sprint.

```text
You are continuing the EasyLife P3 awesome-app polish and demo excellence sprint.

Repo:
C:\Dev\easylifehq.github.io

Current mission:
Make EasyLife feel like an awesome, polished, demo-ready personal assistant after P0-P2 passed the broad external audit with non-blocking notes.

Source of truth:
- docs/codex/NEXT_5_TASKS.md
- docs/codex/PHASE_STATE.md
- docs/codex/EASYLIFE_P2_EXTERNAL_AUDIT_RESULTS.md
- docs/codex/EASYLIFE_P3_REPEATABLE_PROMPT.md
- C:\Users\codex-agent\Downloads\EasyLife Audit Scope (3).docx

Rules:
- Work only on P3 unless I explicitly approve otherwise.
- Start with the next incomplete P3 task in docs/codex/NEXT_5_TASKS.md.
- Keep P3 polish/demo-readiness focused: first-run flow, demo script clarity, visual coherence, empty/loading/error states, perceived speed, mobile/keyboard polish, and trust-copy cleanup.
- Include the P2 audit notes in P3: Plan typed-time feedback, Workout quick-entry polish, browser-only draft clarity, Settings placeholder/generic copy cleanup, mobile/keyboard focus refinement, and People wording cleanup.
- Do not touch Firebase/auth/rules/functions/billing/DNS/secrets/env/package/dependency/deploy/generated output.
- Do not touch package/dependency files.
- Do not deploy.
- Do not send live push notifications.
- Do not make live AI/provider calls.
- Do not implement calendar sync, geocoding/maps, email/text sending, account deletion backend, contact sync, hidden writes, token storage, automatic scheduling, or external actions unless I separately approve that exact gate.
- Avoid broad rewrites; make narrow, demo-visible improvements.
- Build from app-vNext with npm.cmd run build.

Start by:
1. Read docs/codex/NEXT_5_TASKS.md, docs/codex/PHASE_STATE.md, and docs/codex/EASYLIFE_P2_EXTERNAL_AUDIT_RESULTS.md.
2. Run git status --short --branch.
3. Continue with the next incomplete P3 task.
4. Make a narrow implementation or proof update.
5. Run npm.cmd run build from app-vNext.
6. Update NIGHTLY_REPORT.md, MAGIC_SCORECARD.md, and NEXT_5_TASKS.md.
7. Tell me:
   - task completed
   - files changed
   - build result
   - acceptance checks done
   - next P3 task
```

