# EasyLife Next Product Upgrades — 2026-08-02

## Verified starting point

- Audit status: `YELLOW_EASYLIFE_RELEASE_CANDIDATE_WITH_LIMITATIONS`
- Audit branch final SHA: `8bde686955bff50fe8d434be4a0b917c7c205822`
- Audited implementation SHA: `1fa66556857b9ceb3e1b7c21cb58432071ba620f`
- Product direction: preserve **Today → Capture → Review → Plan** and make EasyLife feel like one calm assistant rather than disconnected modules.
- Explicitly parked: live AI, true push, social, nutrition, hidden automation, external actions, production deployment, and real-user-data testing.

## Ranking method

Each candidate is ranked against repository truth using user value, implementation effort, regression risk, and deterministic testability. Value and testability are scored from 1–5 where higher is better; effort and risk are scored from 1–5 where lower is better. The ranking favors finished cross-module actions over additional passive metrics.

| Rank | Upgrade | Value | Effort | Risk | Testability | Decision |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| 1 | **My week / Weekly Review** inside the existing Progress route | 5 | 3 | 2 | 5 | **Selected.** The current Progress overview repeats module counts but does not help the user decide what to do. Build a calm review of unresolved captures, overdue/upcoming work, projects missing a next action, application follow-ups, and workout rhythm. Give every section one explicit destination action. |
| 2 | **Guided Next Workout** from saved routines and comparable history | 5 | 3 | 3 | 5 | **Selected.** The Workout dashboard has a generic statistics insight but does not translate a saved routine into the next transparent session. Add deterministic, conservative suggestions with exact source sessions; never modify routines or label the result AI. |
| 3 | **Workout history search, filters, PR-only view, and export** | 4 | 3 | 2 | 5 | **Selected.** Only five recent sessions are visible and there is no portability. Add routine/exercise/date/PR filters, source drill-down, and user-initiated JSON/CSV export that records units, timestamps, schema, and formula versions. |
| 4 | Workout Progress routine comparison and personal goals | 4 | 4 | 3 | 4 | Deferred. Routine-level matched-period trends are valuable, but editable goals introduce a new persistence contract. Complete the selected history/guidance foundations first. |
| 5 | One Today → My week integration action | 4 | 1 | 1 | 5 | **Selected as integration work, not a separate panel.** Add one link inside Today’s existing Review section so cross-module review does not compete with Start here or Capture. Preserve all current Today selection/deduplication rules. |
| 6 | Physical-phone/PWA field hardening | 4 | 3 | 2 | 2 | Deferred to physical evidence. The audit already strengthened service-worker refresh and offline draft retention; iPhone/Android install, keyboard, backgrounding, and airplane-mode relaunch require real devices. |
| 7 | Firebase Emulator Suite ownership/idempotency integration tests | 3 | 3 | 2 | 4 | Deferred. Important release proof, but it is primarily verification rather than the user-facing majority required for this wave. No real data will be used. |
| 8 | React Router 7, Vite 8, and Firebase major dependency upgrades | 2 | 5 | 5 | 3 | Deferred to a dedicated compatibility wave. The audit removed critical/high active production chains and classified the remaining likely-unreachable advisories; these major upgrades are not a safe side effect of product work. |
| 9 | Further large-history and accessible-chart optimization | 3 | 2 | 2 | 5 | Supporting work only. Preserve table alternatives, add bounded filtering/serialization tests, and optimize only if this wave’s larger history UI reveals a measured problem. |

## Selected coherent bundle

### 1. My week

- Add a `My week` tab to the existing `/app/easystatistics` route; do not add a top-level destination.
- Derive review items with a pure, deterministic domain function.
- Review unresolved Inbox items, overdue/due work, upcoming Plan items, active projects without an open linked task, due application follow-ups, and the current workout rhythm.
- Rank recovery before planning and cap each section so the page remains calm.
- Give each section one direct action to the owning module. No automatic scheduling, completion, sending, or saved-object changes.
- Supply deterministic demo fixtures for applications, projects, links, notes, and workouts so every section is visibly proven without Firebase.

### 2. Guided next workout

- Select the least-recently completed saved routine, falling back to the first routine when history is empty.
- For every routine exercise, show the latest comparable working set and a transparent deterministic suggestion.
- Weighted progression is deliberately conservative: repeat the latest working value unless two recent comparable sessions support the same-or-better target; only then show a small optional increment in the selected unit. Non-weighted exercises repeat the last comparable effort.
- Link every suggestion to its source workout and provide one explicit `Start this routine` action.
- Never mutate the routine, prefill hidden progression, infer recovery, or call the feature AI.

### 3. Workout history and portability

- Replace the fixed five-session list with user-controlled routine, exercise, date-window, and PR-only filters.
- Keep source workout review links and truthful empty/filter states.
- Add explicit JSON and CSV downloads. Export includes export/schema/formula versions, stored unit per session, local date key, created/updated timestamps when present, routine/exercise/set structure, set types, completion/deletion state, RIR, duration, and distance.
- Exports are generated locally only after a button press. They do not upload, sync, or alter Firestore.

### 4. Calm integration and supporting quality

- Add one `Review my week` action to Today’s existing Review section, preserving its dominant Start here and Capture actions.
- Add automated tests for every selection, progression, filter, PR, export, date, unit, empty-state, and demo-fixture rule.
- Verify the complete discovered route inventory at desktop and phone sizes, then run the new demo flows with console/network inspection and screenshots.

## Acceptance boundary

This wave is complete only when the selected bundle is integrated, the deterministic demo proves each feature, every automated test and the production build pass, the final browser matrix is green, screenshots are inspected, and a receipt records commits, final SHA, limitations, and merge/deployment readiness. It must not merge or deploy production.
