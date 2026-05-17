# Phase State

Current Phase: stage-25-provider-readiness-gate
Audience: Spencer as the signed-in EasyLife user managing tasks, notes, calendar, workouts, and daily planning
Product Promise: EasyLife becomes one clean AI personal assistant, not a visible bundle of separate mini-apps.
Primary Action: Prove provider readiness before any separately approved first live provider dry-run.
Showable Moment: EasyLife opens as one assistant path with Today, Inbox, Plan, Notes, and More instead of a visible app suite.
What Not To Build: Do not edit Firebase rules, auth setup, backend config, package/dependency files, generated output, secrets, deployment config, data shapes, or root deployed files.
No More Features Lock: true
Complexity Budget: Stage 25 may create provider-readiness docs only: provider selection rubric, secret management checklist, live-provider dry-run protocol, human approval checklist, and proof. It must not add live model calls, provider SDKs, frontend API keys, backend production behavior, Firebase config changes, dependencies, package files, deploy config, generated output, or secrets without a separate explicit implementation gate.
Before/After Judgment: Each assistant brain task must make EasyLife more useful without pretending to have real AI, real memory, external sync, or hidden automation.
Human Taste Note: keep the useful theme mood, but the real goal is sleek, high-tech, calm, powerful, Apple/Linear/Notion-inspired, and much less visually crowded.
Phase Model Policy: judgment-heavy
Parking State: STAGE_25_QUEUE_READY
Evidence Required: Stage 24 proof packet, provider selection rubric, secret management checklist, live-provider dry-run protocol, human approval checklist, build proof, MAGIC_SCORECARD, CHECKPOINT_REVIEW, SIMON_DESIGN_REVIEW, and ROBIN_COPY_REVIEW.
Done Signal: Stage 1-5 implementation tasks passed build and the five review routes render reliably with `?demo=1`.
Next Phase Criteria: Complete provider-readiness rubric, secret checklist, dry-run protocol, human approval checklist, and Stage 25 proof before any Stage 26 live-provider dry-run can be separately approved.
Repair Trigger: build failure, route review regression, auth preview regression, or visual polish expanding into new feature work.
Repair Return Phase: stage-15-trustworthy-saved-assistant-loop
Updated At: 2026-05-17 - Stage 24 proof passed and Stage 25 provider-readiness gate prepared.

Stage 24 proof result: READY_FOR_STAGE_25_PROVIDER_READINESS_GATE. The no-provider server adapter accepts safe Inbox typed-capture requests, rejects unsafe requests, validates outputs through the Stage 20/22 path, preserves fallback, exposes `Server adapter mock` in Inbox, and never calls a provider or network. This does not approve live model calls, provider SDKs, API keys, backend implementation, Firebase config changes, dependencies, package files, deploy config, generated output, secrets, external actions, hidden reads, hidden writes, real memory, or saved-object expansion.

Stage 24 proof source: docs/codex/EASYLIFE_STAGE_24_SERVER_ADAPTER_PROOF_PACKET.md

Prepared Stage 25 queue: docs/codex/NEXT_5_TASKS.md contains exactly five provider-readiness tasks.

Stage 24 plan result: STAGE_24_PLAN_READY. The no-provider server adapter plan exists at docs/codex/EASYLIFE_STAGE_24_SERVER_ADAPTER_PLAN.md. Stage 24 may implement local TypeScript server-adapter contract modules, no-provider mock handler modules, safety tests, and a compact Inbox server-adapter mock label/toggle only. It must keep first behavior to Inbox typed-capture suggestion and must not add live model calls, provider SDKs, API keys, secrets, external actions, hidden writes, real memory, saved-object expansion, deploy config, production backend behavior, Firebase config changes, dependencies, package files, or generated output.

Stage 24 queue: docs/codex/NEXT_5_TASKS.md contains exactly five bounded no-provider server adapter tasks.

Stage 23 proof result: READY_FOR_STAGE_24_SERVER_ADAPTER_IMPLEMENTATION. The architecture decision packet, architecture ADR, gateway boundary, threat model, rollout/fallback decision, and build proof are complete. Stage 24 may implement a no-provider server adapter shell/mock path only. This does not approve live model calls, provider SDKs, API keys, backend production behavior, Firebase config changes, dependencies, package files, deploy config, generated output, secrets, external actions, hidden reads, hidden writes, real memory, or saved-object expansion.

Stage 23 proof source: docs/codex/EASYLIFE_STAGE_23_SERVER_ARCHITECTURE_PROOF_PACKET.md

Prepared Stage 24 queue: docs/codex/NEXT_5_TASKS.md contains exactly five no-provider server adapter tasks.

Stage 23 decision result: STAGE_23_PACKET_READY. The recommended first real AI gateway architecture is a narrow Firebase Cloud Function / HTTPS callable gateway for Inbox typed-capture suggestion only. Static-only provider calls are rejected because frontend API keys cannot be protected. The Stage 22 local/mock adapter remains approved for development, proof, and fallback only. Generic serverless is an acceptable fallback, while a separate minimal API service is parked until the product needs heavier isolation or operations. This packet does not approve live model calls, provider SDKs, API keys, backend implementation, Firebase config changes, dependencies, package files, deploy config, generated output, secrets, external actions, hidden reads, hidden writes, real memory, or saved-object expansion.

Stage 23 source: docs/codex/EASYLIFE_STAGE_23_SERVER_ARCHITECTURE_DECISION.md

Prepared Stage 23 queue: docs/codex/NEXT_5_TASKS.md contains exactly five server architecture decision tasks.

Stage 22 proof result: READY_FOR_STAGE_23_SERVER_ARCHITECTURE_DECISION. The no-provider mock gateway is narrow enough to choose the real server architecture next. It uses Stage 20 context packets, the `intake-suggestion` prompt ID, Stage 20 output validation, accepted/rejected/downgraded fixture proof, stable timeout/fallback/no-AI states, and visible Inbox proof. This does not approve live model calls, provider SDKs, API keys, backend services, Firebase config changes, dependencies, package files, deploy config, generated output, secrets, external actions, real memory, hidden reads, hidden writes, saved-object expansion, or real personal data.

Stage 22 source: docs/codex/EASYLIFE_STAGE_22_MOCK_GATEWAY_PLAN.md

Prepared Stage 22 queue: docs/codex/NEXT_5_TASKS.md contains exactly five no-provider mock gateway tasks.

Stage 22 may implement a local/server-shaped mock gateway for Inbox typed-capture suggestion only. It must use Stage 20 context packets, Stage 20 prompt IDs, and Stage 20 output validation. It must not add live model calls, provider SDKs, API keys, backend services, Firebase config changes, dependencies, package files, deploy config, generated output, secrets, external actions, real memory, hidden reads, hidden writes, saved-object expansion, or real personal data.

Stage 21 proof result: READY_FOR_MOCK_SERVER_AI_GATEWAY_IMPLEMENTATION. EasyLife is ready to plan a no-provider mock gateway implementation stage that uses Stage 20 context packets, `intake-suggestion`, Stage 20 output validation, metadata-only logging, rate/spend controls, and local fallback behavior. This does not approve live model calls, provider SDKs, API keys, backend services, Firebase config changes, dependencies, package files, deploy config, generated output, secrets, external actions, real memory, hidden reads, hidden writes, or saved-object expansion.

Stage 20 Task 4 proof result: AI_UNAVAILABLE_FALLBACK_READY. EasyLife now has a local AI-unavailable contract and small Today/Inbox fallback copy. Capture, deterministic local classification, task save, note save, and Today review remain usable without live AI.

Stage 20 proof result: READY_FOR_SERVER_AI_GATEWAY_PLANNING. The next stage may plan a server-only AI gateway and threat model, but it must not add live model calls, provider SDKs, frontend API keys, backend implementation, Firebase config changes, dependencies, deploy config, generated output, secrets, external actions, real memory, hidden reads, hidden writes, or saved-object expansion without a separate explicit implementation gate.

## Stage 21 Server AI Gateway Planning Gate

Stage 21 source: docs/codex/EASYLIFE_STAGE_21_SERVER_AI_GATEWAY_PLAN.md

Prepared Stage 21 queue: docs/codex/NEXT_5_TASKS.md contains exactly five server AI gateway planning/proof tasks.

Stage 21 may plan a server-only gateway for the first model-backed behavior: Inbox typed-capture suggestion. The behavior must remain suggestion-only, approval-first, and no-hidden-write. It may use Stage 20 context packets, prompt registry IDs, output validator rules, no-AI fallback behavior, and server-side secret boundaries.

Stage 21 must not add live model calls, provider SDKs, frontend API keys, backend services, Firebase config changes, dependencies, package files, deploy config, generated output, secrets, external actions, real memory, maps, geocoding, exact addresses, device location, hidden reads, hidden writes, saved-object expansion, or real personal data.

## Assistant Brain Gate

The real assistant brain comes after visual polish, not before it. Stage 10 is now approved because the visual proof packet confirmed the shell is credible enough for human review.

Stage 10 source: docs/codex/EASYLIFE_STAGE_10_ASSISTANT_BRAIN_PLAN.md

First Stage 10 behavior: approval-first intake classification. The assistant may suggest task, note, plan, reminder, follow-up, or unsure intent, but it must not create hidden writes, sync external systems, send email, alter calendars, or imply real memory until those contracts exist.

Completed Stage 10 queue: approval-first intent contract, visible Inbox suggestion card, local approval preview states, Today local intent language, and this proof packet.

## Safe Local Memory Gate

Stage 10 proof result: READY_FOR_STAGE_11.

Stage 11 source: docs/codex/EASYLIFE_STAGE_11_SAFE_LOCAL_MEMORY_PLAN.md

Prepared Stage 11 queue: docs/codex/NEXT_5_TASKS.md contains exactly five safe local memory tasks.

Stage 11 may create visible unsaved draft previews from approved local suggestions. The assistant may show what a suggestion would become, but it must not write to tasks, notes, calendar, memory, email, sync, backend, Firebase config, dependencies, generated output, deploy config, or secrets.

Stage 11 proof result: READY_FOR_STAGE_12.

## Explicit Save-Draft Handoff Gate

Stage 12 source: docs/codex/EASYLIFE_STAGE_12_EXPLICIT_SAVE_DRAFT_HANDOFF_PLAN.md

Prepared Stage 12 queue: docs/codex/NEXT_5_TASKS.md contains exactly five explicit handoff tasks.

Stage 12 may show how an unsaved local draft would be handed to an existing task, note, plan, reminder, or follow-up flow after explicit user approval. It must not automatically save, create, archive, send, sync, schedule, remember, mutate stored data, call models, change backend/auth/Firebase config, add dependencies, touch package files, deploy, or generate tracked app output.

Stage 12 proof result: READY_FOR_STAGE_13.

## Narrow User-Approved Save Path Gate

Prepared Stage 13 queue: docs/codex/NEXT_5_TASKS.md contains exactly five narrow user-approved save-path tasks.

Stage 13 may add the first real save action only after a final explicit user confirmation. Start with task drafts in Inbox using existing EasyList save behavior. Stage 13 must not add hidden writes, automatic saves, real AI/model calls, real memory, email/text/call/message sending, notification scheduling, calendar sync, backend/auth/Firebase config changes, dependencies, package files, deploy config, generated output, or secrets.

Stage 13 proof result: READY_FOR_STAGE_14.

## Narrow User-Approved Note Save Path Gate

Prepared Stage 14 queue: docs/codex/NEXT_5_TASKS.md contains exactly five narrow user-approved note save-path tasks.

Stage 14 may add the second real save action only after a final explicit user confirmation. Use existing EasyLife Notes behavior and call it note/context save, not real memory. Stage 14 must not add hidden writes, automatic saves, real AI/model calls, real memory, email/text/call/message sending, notification scheduling, calendar sync, reminder saves, follow-up saves, backend/auth/Firebase config changes, dependencies, package files, deploy config, generated output, or secrets.

Stage 14 proof result: READY_FOR_STAGE_15.

## Trustworthy Saved Assistant Loop Gate

Prepared Stage 15 queue: docs/codex/NEXT_5_TASKS.md contains exactly five trustworthy saved assistant loop tasks.

Stage 15 may harden, simplify, and prove the existing task and note/context save paths. It must not add saved plans, saved reminders, saved follow-ups, external communication, notifications, calendar sync, model-backed action, real memory, backend/auth/Firebase config changes, dependencies, package files, deploy config, generated output, or secrets.

Stage 15 proof result: READY_FOR_HUMAN_REVIEW.

## Human Review Gate

EasyLife should be reviewed by a human before Stage 16 begins. The review should focus on whether the assistant loop feels useful, trustworthy, and worth using daily. Stage 16 must be created from review notes or from an explicit bounded mission, and it must continue to park saved plans, reminders, follow-ups, email, notifications, calendar sync, model calls, and real memory unless separately approved.

Stage 16 decision source: docs/codex/EASYLIFE_STAGE_16_DECISION_GATE.md

Stage 16 is now started as People + Places Memory by explicit user mission.

## People + Places Memory Gate

Stage 16 source: docs/codex/EASYLIFE_PEOPLE_PLACES_MEMORY_PLAN.md

Prepared Stage 16 queue: docs/codex/NEXT_5_TASKS.md contains exactly five People + Places Memory tasks.

Stage 16 may add privacy-light people/place labels to EasyContacts: current city, region, last known place, moved recently, and visit note. It must not require exact street addresses, add map APIs, geocoding, device location, backend/auth/Firebase config changes, dependencies, package files, deploy config, generated output, secrets, real personal data, model calls, or external actions.

Stage 17 decision source: docs/codex/EASYLIFE_STAGE_17_DECISION_GATE.md

Stage 16 proof result: READY_FOR_HUMAN_REVIEW.

## Stage 17 Anti-Annoyance Gate

Stage 17 source: docs/codex/EASYLIFE_STAGE_17_ANTI_ANNOYANCE_PLAN.md

Prepared Stage 17 queue: docs/codex/NEXT_5_TASKS.md contains exactly five anti-annoyance tasks.

Stage 17 is active by explicit user mission after a blunt product scan found likely human-review frustrations. Stage 17 may tighten Today command copy, consolidate Contacts / People + Places, remove Future map filler, repair Notes/Memory language, and clean up Settings assistant chrome. It must not add new feature surfaces beyond consolidation, copy repair, and visual trust cleanup. It must not add backend/auth/Firebase config changes, dependencies, package files, deploy config, generated output, secrets, external actions, model calls, real memory, maps, geocoding, exact addresses, device location, or real personal data.

Stage 17 proof must inspect Today, Inbox, Plan, Notes, Contacts, and Settings and name remaining annoyances honestly.

Stage 17 proof result: READY_FOR_HUMAN_REVIEW.

Do not create new feature tasks automatically. Human review should inspect Today, Inbox, Plan, Notes, Contacts, and Settings, then decide whether Stage 18 should be taste polish, Inbox simplification, Settings split/cleanup, demo-content personalization, or a different explicit mission.

## Stage 18 Review Repair Gate

Stage 18 source: docs/codex/EASYLIFE_STAGE_18_REVIEW_REPAIR_PLAN.md

Prepared Stage 18 queue: docs/codex/NEXT_5_TASKS.md contains exactly five review-repair tasks.

Stage 18 is active by explicit user mission after three external review attempts. The reviewers could not access localhost, so Stage 18 starts with a real local mobile proof and then repairs the most credible signals: public/marketing module-suite language, Inbox trust/copy density, remaining Memory/Remember wording, and old Command Center route risk.

Stage 18 may inspect, prove, shorten, demote, align, or repair existing surfaces. It must not add new assistant capability, model calls, real memory, saved plans, saved reminders, saved follow-ups, email/text/call/message sending, notifications, calendar sync, maps, geocoding, exact addresses, device location, backend/auth/Firebase config changes, dependencies, package files, deploy config, generated output, secrets, or real personal data.

Stage 18 proof must inspect the repaired surfaces and decide whether EasyLife can move to Stage 19 contextual assistant work.

Stage 18 proof result: READY_FOR_STAGE_19.

Stage 18 proof source: docs/codex/EASYLIFE_STAGE_18_PROOF_PACKET.md

Do not create Stage 19 tasks automatically. Stage 19 should be created from an explicit user mission, and should not expand to model calls, external actions, real memory, notifications, calendar sync, maps, geocoding, exact addresses, backend/auth/Firebase config changes, dependencies, generated output, deploy config, secrets, or real personal data without a separate approved gate.

## Stage 19 Contextual Assistant Gate

Stage 19 source: docs/codex/EASYLIFE_STAGE_19_CONTEXTUAL_ASSISTANT_PLAN.md

Prepared Stage 19 queue: docs/codex/NEXT_5_TASKS.md contains exactly five contextual assistant tasks.

Stage 19 may improve Today context synthesis, Inbox source clarity, Plan capacity/readiness, Notes/context recall hints, and Contacts/People + Places tie-ins using existing local/demo app context. It must not add model calls, hidden writes, saved plans, saved reminders, saved follow-ups, email/text/call/message sending, notifications, calendar sync, maps, geocoding, exact addresses, device location, backend/auth/Firebase config changes, dependencies, package files, deploy config, generated output, secrets, fake memory, or real personal data.

Stage 19 Task 1 proof result: TODAY_CONTEXT_SYNTHESIS_READY.

Stage 19 Task 2 proof result: INBOX_SOURCE_DESTINATION_READY.

Stage 19 Task 3 proof result: PLAN_CAPACITY_READ_READY.

Stage 19 Task 4 proof result: NOTES_CONTEXT_RECALL_READY.

Stage 19 Task 5 proof result: PEOPLE_PLACES_TODAY_TIE_IN_READY.

Stage 19 proof result: READY_FOR_STAGE_20.

Stage 19 proof source: docs/codex/EASYLIFE_STAGE_19_PROOF_PACKET.md

Stage 19 proof inspected Today, Inbox, Plan, Notes, Contacts, Settings, plus Command as a regression check, and found contextual assistant usefulness credible enough for Stage 20.

Stage 20 must be created from an explicit mission. Good candidate directions are human-review repair, Summer operating-plan execution planning, a model-contract stage, or Inbox simplification. Do not add model calls, hidden writes, saved plans/reminders/follow-ups, email/text/call/message sending, notifications, calendar sync, maps, geocoding, exact addresses, device location, backend/auth/Firebase config changes, dependencies, package files, deploy config, generated output, secrets, fake memory, or real personal data without a separate approved gate.

## Stage 20 AI Assistant Readiness Gate

Stage 20 source: docs/codex/EASYLIFE_STAGE_20_AI_ASSISTANT_READINESS_GATE.md

Prepared Stage 20 queue: docs/codex/NEXT_5_TASKS.md contains exactly five AI assistant readiness tasks.

Stage 20 Task 1 proof result: ASSISTANT_CONTEXT_PACKET_CONTRACT_READY.

Stage 20 Task 2 proof result: ASSISTANT_PROMPT_REGISTRY_CONTRACT_READY.

Stage 20 Task 3 proof result: MODEL_OUTPUT_VALIDATION_CONTRACT_READY.

Stage 20 verdict: READY_FOR_MODEL_ARCHITECTURE_NOT_MODEL_CALLS.

Stage 20 may define context-packet contracts, prompt registry rules, model output validation, AI-unavailable fallback behavior, and a proof packet. It must not implement live model calls, provider SDKs, API keys, frontend API keys, backend services, Firebase rules/config changes, dependencies, package files, deployment config, generated output, secrets, hidden writes, hidden reads, new saved object types, external actions, email/text/call/message sending, notifications, calendar sync, maps, geocoding, exact addresses, device location, real memory, or real personal data.

Server-only architecture is required for any later model gateway. Frontend API keys are forbidden because browser bundles expose them to users, devtools, extensions, scraped builds, and network logs.

## Phase Order

Website loop: brief -> foundation -> shape -> simplicity -> polish -> proof -> parked

Website stage contract source: docs/codex/WEBSITE_STAGE_RULES.md when present. Use fleet-website-stages.ps1 -Project EasyLife -WriteReference from the fleet control room to write or refresh it.

Analytical software loop: problem-brief -> data-contract -> formula-spec -> fixture-tests -> engine-build -> calibration -> dashboard -> scenario-tools -> analysis-proof -> parked

repair is an interrupt lane, not a normal destination. Any phase can enter repair when RED review gates, build/runtime failures, quarantine, stale/idle lock problems, or visual blockers stop safe progress. After the repair passes, return to the previous product phase.

## Phase Locks

- Brief must define audience, promise, primary action, and what not to build.
- Foundation may add missing structure and core behavior.
- Shape may reorganize pages and flows, but should avoid feature sprawl.
- Simplicity should remove, combine, shorten, hide, or demote before adding.
- Polish should refine visual/copy details without changing the core flow.
- Proof should fix blockers only.
- Parked means review-ready; do not generate new work unless a human moves the phase.
- Repair must address only the named blocker, keep No More Features Lock true, and avoid fresh feature work.
- Problem Brief defines the decision, user, outputs, and what not to predict.
- Data Contract defines CSV schemas, database tables, IDs, missing-data behavior, and snapshot/version rules.
- Formula Spec writes deterministic formulas, weights, defaults, confidence rules, and examples before coding.
- Fixture Tests creates tiny known datasets with obvious expected answers before full app work.
- Engine Build implements loaders, validators, scoring, ranking, probabilities, and exports.
- Calibration compares model outputs against history, known sanity checks, and confidence behavior.
- Dashboard builds table-first review UI only after formulas and fixtures are trustworthy.
- Scenario Tools adds what-if controls, weight changes, strategy modes, and comparison workflows.
- Analysis Proof fixes blockers only: tests, import validation, reports, deterministic outputs, and no live-data dependency.

## Upgrade Rules

- One primary action above the fold.
- No more features after Foundation unless a human moves the phase backward.
- Visual polish is deferred until Stage 9; pre-Stage-9 visual changes are allowed only when they support shell clarity or Today clarity.
- Track whether each task makes the product clearer, simpler, more useful, or more beautiful.
- Keep one sentence product promise visible to the planner.
- Respect complexity budgets for sections, CTAs, choices, and visible copy.
- Protect the showable moment.
- Honor human taste notes.
- Use stronger judgment for Shape, Simplicity, and Polish.
- Park review-ready ships instead of continuing to generate improvements.
