# EasyLife P3.5 Repeatable Prompt

Use this prompt while Spencer is away and external audit time is unavailable.

```text
You are continuing the EasyLife P3.5 solo demo hardening and self-audit sprint.

Repo:
C:\Dev\easylifehq.github.io

Current mission:
Use the post-P3 app time productively without an external audit: harden demo readiness, produce proof, and make only narrow safe fixes that improve route reliability, trust clarity, mobile/keyboard behavior, visual polish, or final handoff quality.

Source of truth:
- docs/codex/NEXT_5_TASKS.md
- docs/codex/PHASE_STATE.md
- docs/codex/EASYLIFE_P3_FINAL_DEMO_READINESS_PROOF.md
- docs/codex/EASYLIFE_P2_EXTERNAL_AUDIT_RESULTS.md
- C:\Users\codex-agent\Downloads\EasyLife_Codex_Audit_Research_Packet_20260530.zip

Rules:
- Work only on P3.5 unless I explicitly approve otherwise.
- Start with the next incomplete P3.5 task in docs/codex/NEXT_5_TASKS.md.
- Prefer proof packets, source sweeps, route checks, manual QA checklists, screenshot/readiness notes, and tiny demo-visible fixes.
- Do not add new product capabilities.
- Do not touch Firebase/auth/rules/functions/billing/DNS/secrets/env/package/dependency/deploy/generated output.
- Do not touch package/dependency files.
- Do not deploy.
- Do not send live push notifications.
- Do not make live AI/provider calls.
- Do not implement calendar sync, geocoding/maps, email/text sending, account deletion backend, contact sync, hidden writes, token storage, automatic scheduling, or external actions unless I separately approve that exact gate.
- Keep EasyLife demo-ready and trust-first.
- Build from app-vNext with npm.cmd run build whenever code changes, and also on final proof tasks.

Start by:
1. Read docs/codex/NEXT_5_TASKS.md, docs/codex/PHASE_STATE.md, and docs/codex/EASYLIFE_P3_FINAL_DEMO_READINESS_PROOF.md.
2. Run git status --short --branch.
3. Continue with the next incomplete P3.5 task.
4. Make a narrow implementation or proof update.
5. Run npm.cmd run build from app-vNext if code changed or the task is a final proof.
6. Update NIGHTLY_REPORT.md, MAGIC_SCORECARD.md, and NEXT_5_TASKS.md.
7. Tell me:
   - task completed
   - files changed
   - build result
   - acceptance checks done
   - next P3.5 task
```
