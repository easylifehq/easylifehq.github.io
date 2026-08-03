# EasyLife P4 Supervised Capability Repeatable Prompt

Use this prompt to continue the P4 queue one task at a time.

```text
You are continuing the EasyLife P4 supervised capability activation sprint.

Repo:
C:\Dev\easylifehq.github.io

Current mission:
Add the first real EasyLife capabilities safely, one gated lane at a time: first one narrow real AI/provider Inbox suggestion, then one true push synthetic test lane. Keep everything review-first, consent-first, reversible, and demo-safe.

Source of truth:
- docs/codex/NEXT_5_TASKS.md
- docs/codex/PHASE_STATE.md
- docs/codex/EASYLIFE_P3_5_FINAL_NO_EXTERNAL_AUDIT_HANDOFF.md
- docs/codex/EASYLIFE_P2_REAL_AI_PROVIDER_SUPERVISED_GATE.md
- docs/codex/EASYLIFE_P2_TRUE_PUSH_NOTIFICATION_SUPERVISED_GATE.md
- C:\Users\codex-agent\Downloads\EasyLife_Codex_Audit_Research_Packet_20260530.zip

Rules:
- Work only on P4 unless I explicitly approve otherwise.
- Start with the next incomplete P4 task in docs/codex/NEXT_5_TASKS.md.
- P4 capability order is strict: finish the narrow real AI/provider Inbox suggestion gate before starting the true push synthetic test gate.
- Keep the first AI behavior limited to Inbox typed-capture suggestion only. It may suggest, classify, or draft review text, but it must not auto-save, schedule, send, sync, remember, contact anyone, alter calendars, or perform external actions.
- Keep push limited to one synthetic/manual test lane. Do not add automatic reminder jobs or live user-content push payloads.
- Do not touch Firebase rules, auth policy, billing, DNS, secrets, env files, package/dependency files, deploy config, or generated output.
- Do not deploy unless I separately approve an exact deploy/test prompt.
- Do not store provider keys or push credentials in the repo.
- Do not expose provider keys in frontend code.
- Do not implement calendar sync, geocoding/maps, email/text sending, account deletion backend, contact sync, hidden writes, token storage, automatic scheduling, or external actions unless I separately approve that exact gate.
- If a task needs server/function source code, keep it to the exact P4 gate and preserve disabled-by-default behavior until a separate deploy/test approval.
- Build from app-vNext with npm.cmd run build whenever app code changes.

Start by:
1. Read docs/codex/NEXT_5_TASKS.md, docs/codex/PHASE_STATE.md, docs/codex/EASYLIFE_P3_5_FINAL_NO_EXTERNAL_AUDIT_HANDOFF.md, and any P4 proof/gate doc relevant to the next incomplete P4 task.
2. Run git status --short --branch.
3. Continue with the next incomplete P4 task.
4. Make a narrow implementation, consent/copy proof, disabled contract, or gate document update.
5. Run npm.cmd run build from app-vNext if app code changed.
6. Update NIGHTLY_REPORT.md, MAGIC_SCORECARD.md, and NEXT_5_TASKS.md.
7. Tell me:
   - task completed
   - files changed
   - build result
   - acceptance checks done
   - next P4 task
```
