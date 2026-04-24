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

### Phase 1 - Baseline and Suite Shell

- [x] Shared suite shell audit: inspect shared layout/header/nav/app shell files and make one focused improvement to suite consistency, active app clarity, page container spacing, or mobile header ergonomics. Do not change auth, routing behavior, Firebase, data models, dependencies, generated output, TASK_QUEUE.md, or NIGHTLY_REPORT.md.

- [x] Shared navigation polish: improve one obvious app dropdown, shared navigation, or active page clarity issue so EasyLife feels more like one connected suite. Do not rewrite routing, change auth, touch Firebase, add dependencies, or edit generated/root output.

- [x] Shared UI consistency pass: improve one shared button/card/form/container style or component pattern used across the suite. Keep behavior unchanged. Do not change persistence, data models, routing, Firebase, auth, dependencies, generated output, or docs report files.

- [x] Mobile shell polish: make one safe mobile layout/header/container improvement in the shared suite shell. Do not change routing, auth, Firebase, data models, dependencies, generated output, or root deployed files.

### Phase 2 - Settings Control Center

- [x] Settings grouping polish: inspect Settings UI and improve visual grouping, card hierarchy, or spacing so it feels more like an EasyLife control center. Do not change auth behavior, persistence, Firebase, data models, dependencies, or generated output.

- [x] Settings mobile readability: improve Settings mobile spacing, section rhythm, or control readability. Do not change auth behavior, persistence, Firebase, data models, dependencies, routing, or generated output.

- [ ] Settings copy clarity: improve unclear Settings copy/labels/help text while preserving all behavior. Do not change auth, persistence, Firebase, data models, dependencies, routing, or generated output.

### Phase 3 - Core App Polish: EasyList

- [ ] EasyList layout density polish: improve one EasyList page or component for spacing, layout density, or card hierarchy. Preserve all task behavior, data shapes, persistence, routing, auth, Firebase, dependencies, and generated output.

- [ ] EasyList mobile readability: improve one EasyList mobile readability issue in list items, composer, drawer, or dashboard UI. Preserve behavior, data models, persistence, auth, Firebase, routing, dependencies, and generated output.

- [ ] EasyList empty/low-content polish: improve one EasyList empty state, low-content state, or helper text area. Copy/UI only. Do not change logic, data models, persistence, auth, Firebase, routing, dependencies, or generated output.

### Phase 4 - Core App Polish: EasyNotes

- [ ] EasyNotes layout polish: improve one EasyNotes library/editor/trash/new-note UI area for spacing, hierarchy, or readability. Preserve note behavior, data shapes, persistence, routing, auth, Firebase, dependencies, and generated output.

- [ ] EasyNotes mobile readability: improve one EasyNotes mobile spacing or typography issue. Preserve behavior, data models, persistence, auth, Firebase, routing, dependencies, and generated output.

- [ ] EasyNotes empty/low-content polish: improve one EasyNotes empty state, helper copy, or low-content area. Copy/UI only. Do not change logic, data models, persistence, auth, Firebase, routing, dependencies, or generated output.

### Phase 5 - Core App Polish: EasyCalendar

- [ ] EasyCalendar layout polish: improve one EasyCalendar day/week/month UI area for spacing, hierarchy, or readability. Preserve calendar/event logic, data shapes, persistence, routing, auth, Firebase, dependencies, and generated output.

- [ ] EasyCalendar mobile readability: improve one EasyCalendar mobile layout or typography issue. Preserve event logic, date logic, data models, persistence, auth, Firebase, routing, dependencies, and generated output.

- [ ] EasyCalendar empty/low-content polish: improve one EasyCalendar low-content area, helper copy, or empty state. Copy/UI only. Do not change event logic, date logic, data models, persistence, auth, Firebase, routing, dependencies, or generated output.

### Phase 6 - Core App Polish: EasyWorkout

- [ ] EasyWorkout dashboard polish: improve one EasyWorkout dashboard/log/routines UI area for spacing, hierarchy, or readability. Preserve workout behavior, data shapes, persistence, routing, auth, Firebase, dependencies, and generated output.

- [ ] EasyWorkout mobile readability: improve one EasyWorkout mobile layout or typography issue. Preserve behavior, data models, persistence, auth, Firebase, routing, dependencies, and generated output.

- [ ] EasyWorkout empty/low-content polish: improve one EasyWorkout empty state, helper copy, or low-content area. Copy/UI only. Do not change logic, data models, persistence, auth, Firebase, routing, dependencies, or generated output.

### Phase 7 - Experimental AI Prototype Under Experiments Only

- [ ] Experiments AI shell: create or refine a frontend-only AI Command Center / EasyLife AI Lab under `app-vNext/src/features/experiments/`. It must use fake data and mock responses only. Do not make real API calls, add backend, add OpenAI keys, touch Firebase Functions, change auth, write production data, add dependencies, edit docs, or change production routing behavior.

- [ ] Experiments AI command cards: add polished static command cards under experiments for Plan Day, Clean Up Tasks, Summarize Notes, Prep Calendar, Workout Coach, and Project Focus. Fake data only. Do not make real API calls, add backend, touch Firebase/auth, add dependencies, edit docs, or change production routing behavior.

- [ ] Experiments AI daily brief mockup: add a fake AI daily brief under experiments that summarizes mock tasks, notes, calendar events, workouts, warnings, and "what matters today." Fake data only. Do not make real API calls, add backend, touch Firebase/auth, add dependencies, edit docs, or write production data.

- [ ] Experiments AI command input mockup: add a frontend-only command input under experiments with mock responses for prompts like Plan my day, Turn this note into tasks, Summarize my week, and Build a workout plan. Do not make real API calls, add backend, use OpenAI keys, touch Firebase/auth, add dependencies, edit docs, or persist production data.

- [ ] Experiments AI TypeScript contracts: add TypeScript interfaces under experiments for AiCommand, AiSuggestion, AiBrief, AiContextSnapshot, and AiMockProvider. Fake/mock only. Do not add backend, API clients, OpenAI keys, Firebase Functions, dependencies, docs, or production data writes.

### Phase 8 - AI Backend Plan Docs Only

- [ ] AI backend plan doc: create `docs/ai/EASYLIFE_AI_BACKEND_PLAN.md` explaining future backend goals, required safety checks, likely API shape, auth requirements, data privacy concerns, what must not be built unattended, and a staged rollout plan. Docs only. Do not touch app code, Firebase, Functions, auth, secrets, dependencies, generated output, or production config.

### Phase 9 - Stability and Review Support

- [ ] Docs workflow clarity: improve one `docs/codex` workflow doc or create a short v5 sprint review note explaining how to review the practice branch tomorrow. Docs only. Do not touch app code, Firebase, Functions, auth, secrets, dependencies, generated output, or production config.

- [ ] Final polish scan: remove rough placeholder copy introduced during this sprint and improve one obvious rough UI edge in changed frontend areas only. Do not broaden scope, add features, touch Firebase/auth/backend/dependencies/generated output, or edit report/task queue files.

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
