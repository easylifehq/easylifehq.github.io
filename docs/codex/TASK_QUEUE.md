# EasyLife 5.0.0 Night Sprint 1 Queue

## Mission

EasyLife is entering version 5.0.0.

This is a large safe overnight sprint, not a tiny cleanup.

Product goal:
By the end of this run, EasyLife should feel more like one connected, professional, stable product suite, and it should include a safe experimental AI prototype that does not touch production backend systems.

Framing:

Big update, small blast radius.

## Primary Priorities

1. Make EasyLife feel like one connected suite.
2. Make the core apps look more professional.
3. Improve obvious UI stability/bugginess.
4. Add a safe experimental AI command center prototype under experiments only.
5. Keep all risky backend/auth/Firebase/deploy work blocked.

## Source Of Truth Build Command

PowerShell owns builds. Codex must not run build commands.

```powershell
cd app-vNext
npm.cmd run build
```

## Current App Structure

Current main app:

```text
app-vNext/
```

Current source:

```text
app-vNext/src/
```

Feature folders:

```text
app-vNext/src/features/auth
app-vNext/src/features/easycalendar
app-vNext/src/features/easycontacts
app-vNext/src/features/easylist
app-vNext/src/features/easynotes
app-vNext/src/features/easypipeline
app-vNext/src/features/easyprojects
app-vNext/src/features/easystatistics
app-vNext/src/features/easyworkout
app-vNext/src/features/experiments
app-vNext/src/features/hq
app-vNext/src/features/marketing
app-vNext/src/features/settings
```

## Execution Model

Codex should implement one selected task at a time from this queue.

PowerShell owns:
- execution
- build checks
- guardrail checks
- task completion
- report updates
- commits

Codex owns only:
- implementing the selected task
- reviewing the current diff when asked
- summarizing changed files and risk

Branch names should use:

```text
codex/practice-*
```

## Hard Guardrails

Codex may not:
- run npm build commands
- mark tasks complete
- edit docs/codex/NIGHTLY_REPORT.md
- deploy
- push or merge to main
- touch Firebase rules
- touch Firebase auth/provider setup
- touch billing
- touch DNS
- touch production config
- touch secrets, API keys, credentials, or environment files
- touch Cloud Functions
- touch old-site
- touch package.json, package-lock.json, npm-shrinkwrap.json, or dependency config
- add dependencies
- touch generated build output
- touch root deployed/static output unless explicitly required
- rewrite the whole app
- change Firestore data shapes
- change production routing behavior unless fixing an obvious safe UI bug
- make real external AI/API calls
- create or require OpenAI keys
- create a real backend tonight

Blocked paths/files unless explicitly approved:

```text
.firebaserc
firebase.json
firestore.rules
functions/
old-site/
dist/
build/
app-vNext/dist/
app-vNext/build/
app-vNext/coverage/
coverage/
.env
*.pem
*.key
*.p12
*.pfx
package.json
package-lock.json
npm-shrinkwrap.json
app-vNext/package.json
app-vNext/package-lock.json
app-vNext/npm-shrinkwrap.json
index.html
assets/
sw.js
manifest.webmanifest
```

## Allowed Work

Codex may:
- edit `app-vNext/src` UI components
- edit `app-vNext/src` feature UI files
- edit CSS/styling files
- add TypeScript types/interfaces
- improve copy
- fix spacing/layout issues
- fix mobile responsiveness issues
- fix small obvious UI bugs
- edit docs/codex reporting docs when the selected task is docs-only
- add experiments sandbox code
- add fake data / mock services under experiments
- create docs/specs for future AI backend when the selected task is docs-only

## Tasks

### Launch Repair Tasks

- [x] Settings visual QA repair: make the existing Settings experience reachable from the fleet-inspected settings path or update the inspected path so visual QA no longer sees a blank `/settings` route. Preserve the existing authenticated Settings page behavior. Do not change auth logic, Firebase, persistence, data models, backend, dependencies, package files, deployment config, generated output, secrets, or unrelated routing.

### Phase 1 - Baseline and Suite Shell

- [x] Shared suite shell audit: inspect shared layout/header/nav/app shell files and make one focused improvement to suite consistency, active app clarity, page container spacing, or mobile header ergonomics. Do not change auth, routing behavior, Firebase, data models, dependencies, generated output, TASK_QUEUE.md, or NIGHTLY_REPORT.md.

- [x] Shared navigation polish: improve one obvious app dropdown, shared navigation, or active page clarity issue so EasyLife feels more like one connected suite. Do not rewrite routing, change auth, touch Firebase, add dependencies, or edit generated/root output.

- [x] Shared UI consistency pass: improve one shared button/card/form/container style or component pattern used across the suite. Keep behavior unchanged. Do not change persistence, data models, routing, Firebase, auth, dependencies, generated output, or docs report files.

- [x] Mobile shell polish: make one safe mobile layout/header/container improvement in the shared suite shell. Do not change routing, auth, Firebase, data models, dependencies, generated output, or root deployed files.

### Phase 2 - Settings Control Center

- [x] Settings grouping polish: inspect Settings UI and improve visual grouping, card hierarchy, or spacing so it feels more like an EasyLife control center. Do not change auth behavior, persistence, Firebase, data models, dependencies, or generated output.

- [x] Settings mobile readability: improve Settings mobile spacing, section rhythm, or control readability. Do not change auth behavior, persistence, Firebase, data models, dependencies, routing, or generated output.

- [x] Settings copy clarity: improve unclear Settings copy/labels/help text while preserving all behavior. Do not change auth, persistence, Firebase, data models, dependencies, routing, or generated output.

### Phase 3 - Core App Polish: EasyList

- [x] EasyList layout density polish: improve one EasyList page or component for spacing, layout density, or card hierarchy. Preserve all task behavior, data shapes, persistence, routing, auth, Firebase, dependencies, and generated output.

- [x] EasyList mobile readability: improve one EasyList mobile readability issue in list items, composer, drawer, or dashboard UI. Preserve behavior, data models, persistence, auth, Firebase, routing, dependencies, and generated output.

- [x] EasyList empty/low-content polish: improve one EasyList empty state, low-content state, or helper text area. Copy/UI only. Do not change logic, data models, persistence, auth, Firebase, routing, dependencies, or generated output.

### Phase 4 - Core App Polish: EasyNotes

- [x] EasyNotes layout polish: improve one EasyNotes library/editor/trash/new-note UI area for spacing, hierarchy, or readability. Preserve note behavior, data shapes, persistence, routing, auth, Firebase, dependencies, and generated output.

- [x] EasyNotes mobile readability: improve one EasyNotes mobile spacing or typography issue. Preserve behavior, data models, persistence, auth, Firebase, routing, dependencies, and generated output.

- [x] EasyNotes empty/low-content polish: improve one EasyNotes empty state, helper copy, or low-content area. Copy/UI only. Do not change logic, data models, persistence, auth, Firebase, routing, dependencies, or generated output.

### Phase 5 - Core App Polish: EasyCalendar

- [x] EasyCalendar layout polish: improve one EasyCalendar day/week/month UI area for spacing, hierarchy, or readability. Preserve calendar/event logic, data shapes, persistence, routing, auth, Firebase, dependencies, and generated output.

- [x] EasyCalendar mobile readability: improve one EasyCalendar mobile layout or typography issue. Preserve event logic, date logic, data models, persistence, auth, Firebase, routing, dependencies, and generated output.

- [x] EasyCalendar empty/low-content polish: improve one EasyCalendar low-content area, helper copy, or empty state. Copy/UI only. Do not change event logic, date logic, data models, persistence, auth, Firebase, routing, dependencies, or generated output.

### Phase 6 - Core App Polish: EasyWorkout

- [x] EasyWorkout dashboard polish: improve one EasyWorkout dashboard/log/routines UI area for spacing, hierarchy, or readability. Preserve workout behavior, data shapes, persistence, routing, auth, Firebase, dependencies, and generated output.

- [x] EasyWorkout mobile readability: improve one EasyWorkout mobile layout or typography issue. Preserve behavior, data models, persistence, auth, Firebase, routing, dependencies, and generated output.

- [x] EasyWorkout empty/low-content polish: improve one EasyWorkout empty state, helper copy, or low-content area. Copy/UI only. Do not change logic, data models, persistence, auth, Firebase, routing, dependencies, or generated output.

### Phase 7 - Experimental AI Prototype Under Experiments Only

- [x] Experiments AI shell: create or refine a frontend-only AI Command Center / EasyLife AI Lab under `app-vNext/src/features/experiments/`. It must use fake data and mock responses only. Do not make real API calls, add backend, add OpenAI keys, touch Firebase Functions, change auth, write production data, add dependencies, edit docs, or change production routing behavior.

- [x] Experiments AI command cards: add polished static command cards under experiments for Plan Day, Clean Up Tasks, Summarize Notes, Prep Calendar, Workout Coach, and Project Focus. Fake data only. Do not make real API calls, add backend, touch Firebase/auth, add dependencies, edit docs, or change production routing behavior.

- [x] Experiments AI daily brief mockup: add a fake AI daily brief under experiments that summarizes mock tasks, notes, calendar events, workouts, warnings, and "what matters today." Fake data only. Do not make real API calls, add backend, touch Firebase/auth, add dependencies, edit docs, or write production data.

- [x] Experiments AI command input mockup: add a frontend-only command input under experiments with mock responses for prompts like Plan my day, Turn this note into tasks, Summarize my week, and Build a workout plan. Do not make real API calls, add backend, use OpenAI keys, touch Firebase/auth, add dependencies, edit docs, or persist production data.

- [x] Experiments AI TypeScript contracts: add TypeScript interfaces under experiments for AiCommand, AiSuggestion, AiBrief, AiContextSnapshot, and AiMockProvider. Fake/mock only. Do not add backend, API clients, OpenAI keys, Firebase Functions, dependencies, docs, or production data writes.

### Phase 8 - AI Backend Plan Docs Only

- [x] AI backend plan doc: create `docs/ai/EASYLIFE_AI_BACKEND_PLAN.md` explaining future backend goals, required safety checks, likely API shape, auth requirements, data privacy concerns, what must not be built unattended, and a staged rollout plan. Docs only. Do not touch app code, Firebase, Functions, auth, secrets, dependencies, generated output, or production config.

### Phase 9 - Stability and Review Support

- [x] Docs workflow clarity: improve one `docs/codex` workflow doc or create a short v5 sprint review note explaining how to review the practice branch tomorrow. Docs only. Do not touch app code, Firebase, Functions, auth, secrets, dependencies, generated output, or production config.

- [x] Final polish scan: remove rough placeholder copy introduced during this sprint and improve one obvious rough UI edge in changed frontend areas only. Do not broaden scope, add features, touch Firebase/auth/backend/dependencies/generated output, or edit report/task queue files.

## Completion Standard

By the end of this queue, the branch should be reviewable as EasyLife 5.0.0 Night Sprint 1.

Required final state:
- Build passes.
- Guardrails pass.
- Changes stay in app-vNext/src or docs-only tasks.
- No blocked files are touched.
- No real backend/auth/Firebase/deploy/secrets changes happen.
- AI prototype is sandboxed under experiments.
- AI backend plan is docs-only.
- Changes are reviewable and split across small commits.

## Checkpoint Planner Tasks 2026-04-24 15:20:40

- [x] EasyNotes editor toolbar polish: inspect the EasyNotes editor UI and make one focused spacing, label, or hierarchy improvement so writing feels more consistent with the suite. Do not change note logic, persistence, data models, routing, auth, Firebase, dependencies, generated output, docs report files, or package files.
- [x] EasyCalendar agenda polish: improve one small agenda/event list visual detail such as spacing, helper copy, or card hierarchy for scanability. Do not change date logic, event behavior, persistence, data models, routing, auth, Firebase, dependencies, generated output, docs report files, or package files.

## Checkpoint Planner Tasks 2026-04-24 15:24:50

- [x] EasyWorkout routine card polish: improve one small routine/log card hierarchy, spacing, or helper-copy detail for faster scanning. Do not change workout behavior, persistence, data models, routing, auth, Firebase, dependencies, generated output, docs report files, package files, or shared architecture.
- [x] Settings control-center scanability: improve one small Settings section header, option description, or spacing detail so suite controls read more clearly. Do not change auth/account behavior, persistence, data models, routing, Firebase, dependencies, generated output, docs report files, package files, or root config files.

## Checkpoint Planner Tasks 2026-04-24 15:32:02

- [x] EasyList quick-action scanability: improve one small EasyList header, quick-action, or list-item visual detail for faster daily triage. Do not change task logic, persistence, data models, routing, auth, Firebase, dependencies, generated output, docs report files, package files, or shared architecture.
- [x] EasyCalendar today-focus polish: improve one small Today/agenda/date-summary copy, spacing, or hierarchy detail so upcoming plans are easier to scan. Do not change date logic, event behavior, persistence, data models, routing, auth, Firebase, dependencies, generated output, docs report files, package files, or root config files.

## Checkpoint Planner Tasks 2026-04-24 15:37:51

- [x] EasyNotes library scanability: improve one small note list, empty-state, or metadata hierarchy detail so recent notes are easier to scan. Do not change note logic, persistence, data models, routing, auth, Firebase, dependencies, generated output, docs report files, package files, or shared architecture.
- [x] EasyWorkout today-summary polish: improve one small dashboard or log-summary copy, spacing, or card hierarchy detail so today's workout context is easier to understand. Do not change workout behavior, persistence, data models, routing, auth, Firebase, dependencies, generated output, docs report files, package files, or shared architecture.

## Checkpoint Planner Tasks 2026-04-24 15:44:26

- [x] Suite shared header polish: inspect the main app headers in EasyList, EasyNotes, EasyCalendar, EasyWorkout, or Settings and make one small copy, spacing, or hierarchy improvement that improves cross-suite consistency. Do not change routing, behavior, persistence, data models, auth, Firebase, dependencies, generated output, docs report files, package files, or shared architecture.
- [x] Mobile panel polish: improve one small mobile readability issue in an existing EasyList, EasyNotes, EasyCalendar, EasyWorkout, or Settings panel/card. Do not add features, change logic, routing, persistence, data models, auth, Firebase, dependencies, generated output, docs report files, package files, or root config files.

## Checkpoint Planner Tasks 2026-04-24 15:49:40

- [x] EasyCalendar month grid polish: improve one small month-view spacing, label, or event-chip hierarchy detail so plans are easier to scan across desktop and mobile. Do not change date logic, event behavior, persistence, data models, routing, auth, Firebase, dependencies, generated output, docs report files, package files, or root config files.
- [x] Settings mobile scanability polish: improve one small Settings panel/card spacing, helper-copy, or hierarchy detail for better mobile readability. Do not change auth/account behavior, persistence, data models, routing, Firebase, backend, dependencies, generated output, docs report files, package files, root config files, or shared architecture.

## Checkpoint Planner Tasks 2026-04-24 15:54:32

- [x] EasyList mobile task-card polish: improve one small mobile spacing, tap-target, or metadata hierarchy detail in existing EasyList task cards so daily triage is easier. Do not change task logic, persistence, data models, routing, auth, Firebase, backend, dependencies, generated output, docs report files, package files, root config files, or shared architecture.
- [x] EasyCalendar event-chip readability: improve one small event-chip, agenda-row, or calendar-label copy/spacing detail for faster scanability across desktop and mobile. Do not change date logic, event behavior, persistence, data models, routing, auth, Firebase, backend, dependencies, generated output, docs report files, package files, root config files, or shared architecture.

## Checkpoint Planner Tasks 2026-04-24 15:59:11

- [x] EasyNotes note-card action polish: improve one small note-card or note-list action label, spacing, or metadata hierarchy detail so notes feel easier to scan with the suite. Do not change note logic, persistence, data models, routing, auth, Firebase, backend, dependencies, generated output, docs report files, package files, root config files, or shared architecture.
- [x] Settings section rhythm polish: improve one small Settings section divider, panel spacing, or helper-copy detail so the control center reads more consistently on desktop and mobile. Do not change auth/account behavior, persistence, data models, routing, Firebase, backend, dependencies, generated output, docs report files, package files, root config files, or shared architecture.

## School Run Tasks 2026-04-24 - Premium Suite And Themes

- [x] Premium suite shell pass: make one focused visual improvement that moves EasyLife toward an Apple-like high-tech product feel: cleaner glass/card depth, tighter spacing, stronger hierarchy, or calmer command surfaces. Keep behavior unchanged. Do not touch auth, Firebase, routing behavior, data models, persistence, dependencies, generated output, package files, backend, secrets, or root config.
- [x] Theme system audit: inspect the current theme/Candy Mode/customization styling and make one small safe improvement that makes the selected theme feel more intentional and customized. Prefer CSS tokens or existing style hooks. Do not add dependencies, change persistence, change settings logic, touch auth/Firebase/backend, edit package files, generated output, or root config.
- [x] EasyLife app identity pass: improve one app header, panel accent, or empty-state detail so EasyList, EasyNotes, EasyCalendar, EasyWorkout, or Settings feels more like part of a premium connected suite. Do not change app logic, routing, persistence, data models, auth, Firebase, dependencies, generated output, package files, or root config.
- [x] Theme personality pass: choose one existing theme mode or app theme and add a more distinct but tasteful visual treatment such as accent gradients, surface contrast, focus rings, status chips, or subtle high-tech panels. Keep it accessible and not childish. Do not add dependencies, change settings persistence, touch auth/Firebase/backend, generated output, package files, or root config.
- [x] Settings theme controls polish: improve the visual hierarchy, helper copy, or card layout around existing theme/settings controls so customization feels more like a real control center. Do not add new settings behavior, change auth/account behavior, persistence, data models, routing, Firebase, backend, dependencies, generated output, package files, or root config.
- [x] Mobile premium feel pass: improve one small mobile visual detail across shared panels, buttons, cards, or page shells so EasyLife feels less student-made and more professional. Do not change behavior, routing, auth, Firebase, persistence, data models, dependencies, generated output, package files, backend, secrets, or root config.
- [x] App-specific theme accent pass: improve one existing app area with a more customized but consistent accent treatment that helps the app feel distinct inside the suite. Keep the change small and reviewable. Do not change logic, routing, persistence, data models, auth, Firebase, dependencies, generated output, package files, backend, or root config.
- [x] Premium typography and microcopy pass: improve one small heading, helper-copy, label, or metadata hierarchy detail so the product reads more polished and less rough. Do not change behavior, routing, auth, Firebase, persistence, data models, dependencies, generated output, package files, backend, secrets, or root config.

## Checkpoint Planner Tasks 2026-04-24 21:39:27

- [x] Cross-suite empty-state consistency pass: inspect one existing empty state in EasyList, EasyNotes, EasyCalendar, EasyWorkout, or Settings and make one small copy, spacing, or hierarchy improvement so it feels more connected to the suite. Do not change behavior, routing, persistence, data models, auth, Firebase, backend, dependencies, generated output, docs report files, package files, root config files, or shared architecture.
- [x] AI experiments polish pass: improve one small visual hierarchy, helper-copy, or responsive spacing detail in the existing experiments AI mockups so they feel more like part of EasyLife 5.0. Fake/mock UI only. Do not make real API calls, add backend, use OpenAI keys, touch Firebase/auth, add dependencies, persist data, edit docs report files, package files, generated output, or root config files.

## Checkpoint Planner Tasks 2026-04-24 22:03:48

- [x] Shared CSS regression patch: inspect recent `app-vNext/src/styles/globals.css` changes and make one narrowly scoped spacing, overflow, or mobile readability fix for an obvious shared UI rough edge. Do not change app logic, routing, persistence, data models, auth, Firebase, backend, dependencies, generated output, package files, root config files, docs report files, or broad theme architecture.
- [x] Cross-app visual consistency patch: inspect one main app page in EasyList, EasyNotes, EasyCalendar, EasyWorkout, or Settings and make one small copy, spacing, or hierarchy improvement that aligns it with the suite shell. Do not touch `globals.css`, auth, Firebase, backend, routing behavior, persistence, data models, dependencies, generated output, package files, root config files, docs report files, or shared architecture.

## Checkpoint Planner Tasks 2026-04-24 22:07:51

- [x] Visual review note cleanup: update one `docs/codex` review note to summarize the current shared CSS visual-regression risk and what to inspect on desktop/mobile. Docs only. Do not touch app code, Firebase, Functions, auth, secrets, dependencies, generated output, production config, report files, or task queue files.
- [x] EasyWorkout dashboard consistency patch: improve one small heading, helper-copy, spacing, or card-hierarchy detail in the existing EasyWorkout dashboard so it aligns with the suite shell. Do not change workout behavior, persistence, data models, routing, auth, Firebase, backend, dependencies, generated output, docs report files, package files, root config files, `globals.css`, or shared architecture.

## Checkpoint Planner Tasks 2026-04-24 22:12:00

- [x] EasyCalendar day-view summary polish: improve one small heading, helper-copy, spacing, or event-list hierarchy detail in the existing day view so today’s plan is easier to scan. Do not change date logic, event behavior, persistence, data models, routing, auth, Firebase, backend, dependencies, generated output, docs report files, package files, root config files, `globals.css`, or shared architecture.
- [x] EasyList task metadata polish: improve one small task-card metadata label, spacing, or status hierarchy detail so daily triage feels clearer and more consistent with the suite. Do not change task logic, task utility behavior, persistence, data models, routing, auth, Firebase, backend, dependencies, generated output, docs report files, package files, root config files, `globals.css`, or shared architecture.

## Checkpoint Planner Tasks 2026-04-24 22:16:09

- [x] EasyNotes empty-state follow-up polish: improve one small empty-state, note-list helper-copy, or metadata hierarchy detail so capture and review feel more connected to the suite. Do not change note logic, persistence, data models, routing, auth, Firebase, backend, dependencies, generated output, docs report files, package files, root config files, `globals.css`, or shared architecture.
- [x] Settings control panel microcopy polish: improve one existing Settings section label, helper description, or panel hierarchy detail so customization reads like a calm suite control center. Do not change auth/account behavior, settings persistence, data models, routing, Firebase, backend, dependencies, generated output, docs report files, package files, root config files, `globals.css`, or shared architecture.

## Checkpoint Planner Tasks 2026-04-24 22:26:39

- [x] EasyCalendar month header consistency patch: improve one small month-view header, sublabel, or control spacing detail so calendar planning reads more like the suite shell. Do not change date logic, event behavior, persistence, data models, routing, auth, Firebase, backend, dependencies, generated output, docs report files, package files, root config files, `globals.css`, or shared architecture.
- [x] EasyWorkout routines scanability patch: improve one small routine-card, empty-state, or metadata hierarchy detail so workout planning is easier to scan. Do not change workout behavior, persistence, data models, routing, auth, Firebase, backend, dependencies, generated output, docs report files, package files, root config files, `globals.css`, or shared architecture.
- [x] EasyList board rhythm patch: improve one small list section, task grouping, or card spacing detail so daily triage feels cleaner on desktop and mobile. Do not change task logic, task utility behavior, persistence, data models, routing, auth, Firebase, backend, dependencies, generated output, docs report files, package files, root config files, `globals.css`, or shared architecture.

## Checkpoint Planner Tasks 2026-04-24 22:33:24

- [x] EasyNotes library rhythm patch: improve one small note-list section, card spacing, or metadata hierarchy detail so capture and review are easier to scan on desktop and mobile. Do not change note logic, persistence, data models, routing, auth, Firebase, backend, dependencies, generated output, docs report files, package files, root config files, `globals.css`, or shared architecture.
- [x] Settings suite-control grouping patch: improve one small existing Settings group label, helper description, or panel hierarchy detail so Settings feels more like the suite control center. Do not change auth/account behavior, settings persistence, data models, routing, Firebase, backend, dependencies, generated output, docs report files, package files, root config files, `globals.css`, or shared architecture.
- [x] EasyCalendar agenda scanability patch: improve one small agenda row, day summary, or event-list spacing/detail so scheduled items are easier to understand at a glance. Do not change date logic, event behavior, persistence, data models, routing, auth, Firebase, backend, dependencies, generated output, docs report files, package files, root config files, `globals.css`, or shared architecture.

## Checkpoint Planner Tasks 2026-04-24 22:40:16

- [x] Visual QA: fix the small mobile tap target for `a.site-brand` on `/`; keep header height restrained and verify no brand/nav wrapping or overlap. Do not change backend, auth, secrets, dependencies, deployment config, generated output, routing behavior, data models, persistence, package files, root config files, docs report files, or unrelated app behavior.
- [x] Suite header rhythm pass: review the shared page-header/title/helper hierarchy across EasyList, EasyNotes, EasyCalendar, EasyWorkout, and Settings, then make one narrowly scoped spacing or hierarchy alignment improvement. Do not add new sections, change behavior, routing, auth, Firebase, backend, persistence, data models, dependencies, generated output, package files, root config files, docs report files, or broad shared architecture.
- [x] Main-app empty-state structure pass: standardize one existing empty state in EasyList, EasyNotes, EasyCalendar, EasyWorkout, or Settings with short guidance and one clear existing action cue. Do not add functionality, change logic, routing, persistence, data models, auth, Firebase, backend, dependencies, generated output, package files, root config files, docs report files, or broad shared architecture.

## Checkpoint Planner Tasks 2026-04-25 01:14:42

- [x] Mobile card/list rhythm pass: tighten one mobile spacing or metadata hierarchy issue in EasyList, EasyNotes, EasyCalendar, or EasyWorkout so scanability improves without changing behavior. Do not touch `globals.css`, auth, Firebase, backend, routing behavior, persistence, data models, dependencies, generated output, package files, root config files, docs report files, deployment config, secrets, or shared architecture.

## Simon Detail Queue 2026-04-25 - Premium Suite Rescue

Goal: Make EasyLife feel less clunky, less student-made, and more like a calm high-tech personal operating system. Simon should be treated as the design gate for this queue: visible awkwardness, cramped controls, weak hierarchy, and generic surfaces are real product bugs.

Execution rule: implement one selected task at a time. Keep each change reviewable. PowerShell owns builds, reports, checkpoint review, task completion, and commits.

- [x] Shared shell premium audit: inspect `AuthenticatedLayout`, `AppHeader`, `AppWorkspaceHeader`, `ProductsMenu`, and the main page containers, then make one focused improvement that makes navigation, page width, or top-level hierarchy feel more Apple-level and intentional. Do not change routing behavior, auth, Firebase, persistence, data models, dependencies, package files, generated output, deployment config, secrets, old-site, or root static output.

- [x] Global surface system pass: inspect `app-vNext/src/styles/globals.css` for heavy borders, noisy shadows, awkward card spacing, or clunky form surfaces, then make one narrow shared CSS improvement that improves premium feel across multiple pages without breaking layout. Do not change app logic, auth, Firebase, routing, persistence, data models, dependencies, package files, generated output, deployment config, or root files.

- [x] Page header rhythm pass: inspect one shared page-header/title/helper pattern across EasyList, EasyNotes, EasyCalendar, EasyWorkout, and Settings, then align spacing, type scale, and helper hierarchy so pages feel like one suite. Do not add new sections, change behavior, routing, auth, Firebase, persistence, data models, dependencies, package files, generated output, docs report files, or root config.

- [x] Theme personality audit: inspect existing theme/Candy Mode/customization styling and make one existing theme feel more customized and fun while staying professional, accessible, and consistent with EasyLife 5.0. Prefer existing CSS tokens or theme hooks. Do not add dependencies, change Settings persistence, alter auth/Firebase/backend code, edit package files, generated output, deployment config, secrets, or root files.

- [x] Theme contrast and focus pass: improve one theme's contrast, focus rings, surface depth, or accent usage so it feels deliberately designed instead of lightly recolored. Do not add new theme settings, change persistence, touch auth, Firebase, backend, dependencies, package files, generated output, deployment config, secrets, or root files.

- [x] Settings customization control polish: improve the visual hierarchy around existing theme/settings controls so Settings feels like a real control center, not a form dump. Do not add settings behavior, change account/auth behavior, persistence, data models, routing, Firebase, backend, dependencies, package files, generated output, docs report files, or root config.

- [x] EasyWorkout exercise form rescue: inspect the workout log/exercise/set input UI and fix one obvious clunky layout issue such as overflowing set rows, cramped inputs, weak labels, or crowded action buttons on desktop or mobile. Preserve workout behavior, persistence, data shapes, auth, Firebase, routing, dependencies, package files, generated output, docs report files, and root config.

- [x] EasyWorkout mobile log polish: make one focused mobile improvement to workout logging so exercise notes, set rows, add/remove controls, and save actions feel composed and tappable at narrow widths. Do not change workout logic, persistence, data models, routing, auth, Firebase, backend, dependencies, package files, generated output, docs report files, or root config.

- [x] EasyList premium triage pass: improve one visible EasyList task card, composer, dashboard, or Today view hierarchy so daily triage feels cleaner, faster, and more high-tech. Do not change task logic, persistence, data models, routing, auth, Firebase, backend, dependencies, package files, generated output, docs report files, or root config.

- [x] EasyNotes writing surface pass: improve one EasyNotes editor/library surface so writing and reviewing notes feels calmer, sharper, and less boxy. Do not change note logic, persistence, data models, routing, auth, Firebase, backend, dependencies, package files, generated output, docs report files, or root config.

- [ ] EasyCalendar scanability pass: improve one EasyCalendar day/week/month area where event chips, agenda rows, headers, or empty time blocks look cramped, noisy, or hard to scan. Do not change date logic, event behavior, persistence, data models, routing, auth, Firebase, backend, dependencies, package files, generated output, docs report files, or root config.

- [ ] Settings control-center layout pass: improve one Settings group, card, option row, or helper section so the page reads like the command center for the suite. Do not change auth/account behavior, persistence, data models, routing, Firebase, backend, dependencies, package files, generated output, docs report files, or root config.

- [ ] Cross-app empty-state design pass: standardize one existing empty/low-content state in EasyList, EasyNotes, EasyCalendar, EasyWorkout, or Settings with cleaner hierarchy, short useful guidance, and one obvious existing action cue. Do not add features, change logic, routing, persistence, data models, auth, Firebase, backend, dependencies, package files, generated output, docs report files, or root config.

- [ ] Mobile 390px suite QA patch: inspect one main app page at phone width and fix one visible issue involving tap targets, cramped cards, text wrapping, clipped buttons, or excessive vertical bulk. Do not change behavior, routing, auth, Firebase, persistence, data models, dependencies, package files, generated output, deployment config, secrets, docs report files, or root files.

- [ ] App accent consistency pass: inspect one main app's accent treatment and make it feel intentional inside the broader suite without making the page louder or adding unrelated colors. Do not change app logic, persistence, routing, auth, Firebase, backend, dependencies, package files, generated output, docs report files, or root config.

- [ ] Experiments AI lab fit-and-finish pass: improve one visible AI Lab/experiments mockup surface so it feels like part of EasyLife 5.0 instead of a detached prototype. Fake/mock UI only. Do not make API calls, add backend, use OpenAI keys, touch Firebase/auth, add dependencies, persist production data, edit package files, generated output, deployment config, secrets, or root files.

- [ ] Simon cleanup pass: after the above visual work, inspect the changed areas and make one final small CSS or copy cleanup that removes a rough edge Simon would immediately notice. Do not broaden scope, add features, touch auth/Firebase/backend/dependencies/package files/generated output/deployment config/secrets/root files, or edit report files.
