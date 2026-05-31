# EasyLife New-Chat Handoff Packet

Purpose: give the next Codex chat enough current context to continue EasyLife without replaying the long thread.

Updated: 2026-05-31

## Current Repo Status

- Repo: `C:\Dev\easylifehq.github.io`
- Branch: `codex/product-EasyLife-20260504-231503`
- Last known git status before this packet: clean and synced with `origin/codex/product-EasyLife-20260504-231503`.
- Live site: `https://easylifehq.com`
- Source app: `app-vNext`
- Static deploy output: repo root after copying `app-vNext/dist` and syncing `404.html` with `index.html`.
- Build command: run `npm.cmd run build` from `app-vNext`.
- Functions check: run `npm.cmd --prefix functions run lint` when functions change.
- Current phase: `notes-capture-friction-interrupt`.
- Active user activity: one-week phone field test.
- Current docs state:
  - `docs/codex/PHASE_STATE.md`
  - `docs/codex/NIGHTLY_REPORT.md`
  - `docs/codex/MAGIC_SCORECARD.md`
  - `docs/codex/NEXT_5_TASKS.md`

## Most Recent Implemented Work

1. Notes capture repair
   - Commit: `45453ae1 Make Notes capture-first`
   - Deployed by: `def0b30a Deploy Notes capture repair`
   - Result: Notes starts with `New note`, last note, and recent notes before assistant/context tooling.
   - Editor focuses the writing field when a note opens.
   - Default startup route changed to `last-used` for new/default settings.

2. EasyWorkout field-test repair
   - Commit: `5d7acffb Repair EasyWorkout field test flow`
   - Result: hamburger/source label moved toward real drawer behavior, Workout subnav moved into drawer, active workout drafts protect active exercise identity, inactive exercises collapse, and the active workout flow advances to the next exercise.
   - Workout AI remains parked.

3. Phone field-test polish
   - Commits include:
     - `b87f507b Fix workout field test friction`
     - `adc50516 Mark EasyLife AI assistant resume point`
     - `020b5354 Add EasyLife phone field test packet`
     - `d8340ef6 Polish EasyLife mobile field test shell`
     - `7ce5a15e Simplify EasyLife primary navigation`
     - `cb6dba7e Polish Today first-screen copy`

4. AI assistant lane
   - Current state: `READY_FOR_ONE_SYNTHETIC_PROVIDER_TEST_DEPLOY`
   - `assistantIntakeSuggestion` is prepared as the narrow first-provider lane.
   - It is scoped to `/app/easylist/add?demo=1`, prompt `intake-suggestion`, synthetic/demo input only, disabled/manual gate, output quarantine, and no hidden writes.
   - Do not expand broad chat, memory, email, notifications, calendar sync, geocoding, or external actions.

5. Push notification lane
   - Current queue: Stage 34 Real Push Notification Gate.
   - Current state: plan ready only.
   - Real push is not live.
   - Existing notifications are local/browser-timer style, not true server-backed push.

## Report-To-Task Crosswalk

| Source finding | Status | Work already done | Remaining task direction |
| --- | --- | --- | --- |
| App reads like EasyLifeHQ / suite of mini-apps | Partially fixed | Shell labels changed toward EasyLife, Today, Inbox, Plan, Notes, People, Settings; More demotes optional modules | Keep removing old suite labels only when they are visible to the user. Do not rename internal files just for aesthetics. |
| Header looked boxed/wack and hard to see | Partially fixed | Hamburger/drawer direction started; Workout links moved into drawer | Continue real sidebar/drawer polish from live phone screenshots if still awkward. |
| Notes too buried for quick capture | Fixed enough for field test | Notes first screen now write-first with New note, last note, recent notes; context tools hidden | Watch field-test reports for whether old notes still require too much scrolling. |
| App returned to landing page after a short break | Partially fixed | Default startup changed to `last-used` | Verify on phone/PWA/browser. If still happens, inspect route memory/auth/session restore rather than adding UI shortcuts. |
| Workout data loss during active session | Partially fixed | Active draft protection, active exercise ID, local draft recovery, view-mode protection | Continue testing. Highest priority if data still disappears. |
| Workout page has too much scrolling | Partially fixed | Inactive exercises collapse; active exercise advances to next | Improve active workout compactness only after live proof. |
| Workout numeric fields keep leading `0` | Fixed in prior workout pass | Inputs select on focus and use empty placeholders | Re-test on phone Safari. |
| No delete previous sets | Fixed in prior workout pass | Logged sets can be deleted | Re-test on phone. |
| PR should glow gold | Fixed in prior workout pass | PR marker added | Re-test visual clarity. |
| Workout AI recommendation would help mid-workout | Parked | Local/non-AI next-lift suggestions exist; no model-backed workout AI | Do not build workout AI until logger is reliable. |
| Trust/copy implied hidden actions/memory/sync | Mostly addressed in AI stages | Prompt registry, output validator, quarantine, no-hidden-write copy, fallback states | Continue scanning visible copy for `remember`, `sync`, `follow up`, `schedule`, `command center` claims. |
| Demo/local assistant outputs can feel fake | Partially addressed | Source, destination, draft/preview, fallback, and nothing-saved labels added in Inbox | Keep source/destination labels compact. Avoid proof-packet UI language. |
| External reviewers could not load localhost | Resolved operationally by live site/audit packet | Live URL and 10 test accounts exist; audit packet created outside git | Use live URL audits, not localhost-dependent audits. |

## Remaining Open Findings From Deep Research / Audits

These are not all equally current because several outside reviews could not inspect local routes. Treat them as direction, then verify against the live app.

1. One-assistant identity is still the north star.
   - Avoid user-facing `EasyHQ`, `EasyList`, `EasyCalendar`, `EasyNotes`, `EasyContacts`, or product-family language above the fold.
   - User-facing model should be: Today, Inbox, Plan, Notes, People, Settings, Workout where needed.

2. Simple capture must beat clever surfaces.
   - The user tried to write down what they had to do today and hated navigating through menu > Notes > scroll > note.
   - Any repair should remove steps before adding features.

3. Mobile phone use is the current truth source.
   - Phone field-test annoyances beat theoretical stage plans.
   - Fix data loss, buried capture, awkward nav, and excessive scrolling before AI expansion.

4. Workout logger is not yet trusted.
   - The top risk is losing workout data mid-session.
   - The second risk is too much scrolling during a live workout.
   - Workout AI should wait until the logger feels safe.

5. AI assistant is close but intentionally boxed.
   - Current safe lane is only Inbox typed-capture suggestion.
   - Next AI step is one synthetic provider test deploy, not broad assistant behavior.

6. Push notifications are planned but not live.
   - Stage 34 exists, but should not interrupt phone-field-test repairs unless the user explicitly resumes it.

7. External audit packet exists but is not committed.
   - Local zip: `C:\Dev\EasyLife_external_audit_packet_20260529-224245.zip`
   - Do not commit the packet or test-account credentials.

## Current Recommended Task Queue

Recommended order for the next chat:

1. Sanity read and status
   - Inspect `PHASE_STATE.md`, `NIGHTLY_REPORT.md`, `MAGIC_SCORECARD.md`, and `NEXT_5_TASKS.md`.
   - Run `git status --short --branch`.
   - Summarize the state before coding.

2. Phone field-test repair triage
   - Ask the user for the latest field-test notes or screenshots.
   - Pick the highest pain item only.
   - Current likely candidates:
     - verify Notes capture-first flow on phone
     - verify app resumes to last-used route
     - repair workout active-session data loss if still reproducible
     - clean remaining sidebar/header drawer weirdness

3. External audit coordination
   - If the user resumes the audit track, use the local audit packet path.
   - Keep live app audits separate from deep research.
   - Do not commit test accounts or credentials.

4. Stage 34 push notifications
   - Resume only if the user explicitly asks for real push notification work.
   - Start with the Stage 34 capability audit task in `NEXT_5_TASKS.md`.
   - Do not send live push until later proof and explicit deploy/test approval.

5. AI assistant provider test
   - Resume only if the user explicitly asks for AI.
   - Start from `docs/codex/EASYLIFE_AI_ASSISTANT_RESUME_NOTE.md` and the Stage 33 proof/operator switch.
   - First action is one synthetic `assistantIntakeSuggestion` provider test deploy only.
   - Do not broaden to chat, real memory, notifications, calendar sync, email/text, geocoding, device location, external actions, or hidden writes.

## What Not To Do In The New Chat

- Do not paste or expose API keys.
- Do not commit generated audit zips or temporary test-account credentials.
- Do not deploy without explicit user request.
- Do not expand old AI endpoints.
- Do not treat old Firebase AI functions as the new assistant lane.
- Do not add broad chat.
- Do not add real memory claims.
- Do not add email/text sending, calendar sync, geocoding, device location, or hidden writes.
- Do not start visual beauty work before fixing current field-test friction.

## Paste-Ready Prompt For The Next Codex Chat

```text
You are helping me continue EasyLife development in a fresh Codex chat.

Repo:
C:\Dev\easylifehq.github.io

Branch:
codex/product-EasyLife-20260504-231503

First, read this handoff packet:
docs/codex/EASYLIFE_NEW_CHAT_HANDOFF_PACKET.md

Then inspect:
- docs/codex/PHASE_STATE.md
- docs/codex/NIGHTLY_REPORT.md
- docs/codex/MAGIC_SCORECARD.md
- docs/codex/NEXT_5_TASKS.md

Then run:
git status --short --branch

Important rules:
- Work only in C:\Dev\easylifehq.github.io unless I explicitly say otherwise.
- Do not print, paste, commit, or expose secrets.
- Do not deploy unless I explicitly ask.
- Build from app-vNext with npm.cmd run build.
- Commit only intentional EasyLife changes.
- Treat AI provider work as parked unless I explicitly resume it.
- Treat push notifications as parked unless I explicitly resume Stage 34.
- Current priority is making EasyLife usable for my one-week phone field test.

Current product direction:
EasyLife should feel like one clean personal assistant, not a suite of Easy* modules.
Simple capture, Today, Notes, Inbox, Plan, People, Settings, and reliable Workout logging matter more than new features right now.

Before coding:
1. Summarize the current repo/phase state in plain English.
2. Tell me whether the working tree is clean.
3. Recommend the next safest task based on the handoff.
4. Wait for my approval unless I already gave you a specific implementation task.
```

## Commit Guidance Before Moving Chats

This handoff packet should be committed before moving chats so the next Codex session can find it from the repo instead of relying on this thread.

After committing this packet, there should be nothing else required to commit before migration if `git status --short --branch` is clean.
