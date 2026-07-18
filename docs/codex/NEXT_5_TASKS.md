# EasyLife P4.5 Field Use Repair Queue

Current lane: P4.5 Field Use Repair. The daily-use loop is Today -> immediate capture -> later review or organization -> action or planning -> reliable return. P5 live AI and true push are paused behind separate explicit EasyLife HQ approval. This queue does not authorize deploys, external actions, backend policy changes, dependency changes, data migrations, or any parked capability.

## 1. P4.5-01 - Repair Today action collision

Status: Complete. Committed locally in `d005103c`; not pushed or deployed.

- **User problem:** Today renders a general EasyLife overview and the data-driven Start here action in the same CSS grid area, so their copy and controls overlap at desktop and mobile widths and obscure what to do next.
- **Intended behavioral outcome:** Today shows one readable, data-driven Start here action followed by the separate immediate Capture control.
- **Scope boundary:** Remove only the redundant overview/CTA block from Today. Preserve the dynamic Start here logic, Capture behavior, summary, context, downstream routes, data, and capabilities. No CSS rewrite.
- **Acceptance criteria:** Exactly one `.assistant-next-inline` remains in the Today start card; its heading, explanation, and actions do not overlap another block at desktop or phone width; Today still exposes Capture and all removed links remain reachable through existing navigation or their destination surfaces.
- **Verification method:** Source diff; `npm.cmd run build`; browser DOM rectangle comparison and screenshots at 1440x1000 and 390x844; `git diff --check`.

## 2. P4.5-02 - Put Inbox product behavior ahead of capability machinery

Status: Complete. The existing quick-row composer now precedes review context, while the unchanged capability-test surface sits behind one native disclosure collapsed by default; production build and desktop/mobile browser checks passed with no horizontal overflow.

- **User problem:** `/app/easylist/add` contains roughly a full screen and a half of mock gateway, provider-gate, quarantine, preview, and approval machinery around the daily capture/review path. Autofocus currently jumps to raw quick rows, but scrolling upward exposes a technical lab instead of a calm Inbox.
- **Intended behavioral outcome:** Inbox first explains and supports capture/review; advanced suggestion and provider-test proof remains available only after deliberate disclosure.
- **Scope boundary:** Reorder or disclose existing client UI only. Preserve quick-row focus/draft durability, all safety copy, disabled provider behavior, test controls, and save confirmations. No provider call, backend change, or capability deletion.
- **Acceptance criteria:** On entry, a user can identify Inbox capture/review without interpreting gateway terminology; advanced machinery is collapsed by default and keyboard reachable; no hidden call or write is introduced; existing demo proof remains inspectable after disclosure.
- **Verification method:** Source inspection; keyboard disclosure check; desktop/mobile browser inspection; production build; existing save/draft behavior smoke without persisting demo data.

## 3. P4.5-03 - Make persistent Capture raw-first

Status: Complete. Universal Capture now opens in a focused raw Inbox mode with one explicit `Save to Inbox` action; the existing eight structured types render only inside one native disclosure, raw drafts survive close/reopen and mode switching, failed saves retain text, and focus returns to the actual Today or global trigger. Production build and desktop/mobile browser checks passed.

- **User problem:** The global Capture control is persistent on most core surfaces, but its modal presents up to eight equal capture types and can frame the raw thought as a task, event, contact, project, or workout set before the user has decided what it is.
- **Intended behavioral outcome:** Opening Capture presents one obvious raw Inbox landing action first, with classification and alternate destinations available only when requested.
- **Scope boundary:** Reuse the existing UniversalCapture modal, existing task/Inbox storage, and existing explicit save paths. No new saved object type, route, classifier, service, migration, AI call, hidden write, or external action.
- **Acceptance criteria:** First focus is a single raw text field; saving requires no category, due date, priority, or destination choice; success states say the item is in Inbox and offer a direct review link; alternate capture types remain accessible; keyboard and Escape/focus return behavior are preserved.
- **Verification method:** Source inspection; keyboard capture smoke; signed-in manual save/return check outside demo; desktop/mobile browser inspection; production build.

## 4. P4.5-04 - Keep Notes write-first above trust proof

Status: Complete. Notes now keeps New note, Last note, and Recent notes ahead of a collapsed native Recovery and export disclosure; the editor keeps its title, body, save status, and active restored-draft notice ahead of collapsed Recovery details. Active library errors remain near the primary actions, and production build plus desktop/mobile browser checks passed without horizontal overflow.

- **User problem:** Notes already has New note, Last note, and Recent notes, but recovery/export explanations appear before resuming recent work and the editor places a long implementation-boundary card before the writing field.
- **Intended behavioral outcome:** New note, last note, recent notes, and the writing area dominate; recovery/export detail remains discoverable without interrupting ordinary writing.
- **Scope boundary:** Reorder or progressively disclose existing copy only. Preserve autosave, local draft backup, manual export link, saved-note behavior, focus, and all trust boundaries. No note schema or persistence change.
- **Acceptance criteria:** Library entry exposes New note and recent/resume choices before detailed recovery text; editor focus and body entry remain immediate; save/recovery status remains perceivable; detailed boundary copy is keyboard accessible and accurate.
- **Verification method:** Source inspection; new-note and recent-note browser smoke; focus/keyboard check; desktop/mobile inspection; production build.

## 5. P4.5-05 - Clarify the navigation hierarchy without removing routes

Status: Complete. The shared drawer now opens with a Daily group ordered Today, Inbox, Notes, and Plan; supporting routes are grouped as Life, Career, Workout, and Utilities. The job pipeline is labelled Job applications, Workout routes have distinct purpose labels, Settings is last in Utilities, and only the matching Workout route receives `aria-current`. All 13 route/ID pairs are unchanged; production build and desktop/mobile route checks passed without horizontal overflow.

- **User problem:** The demo menu places Today, Inbox, Plan, Notes, People, and Settings together as core; exposes three Workout destinations; and labels a job-application pipeline as Follow-ups while People and Inbox also contain follow-up concepts. Users must infer which destination owns a task.
- **Intended behavioral outcome:** Today, Inbox, Notes, and Plan read as the daily path; People, Projects, job applications, Workout, Review, Progress, and Settings read as supporting or contextual destinations.
- **Scope boundary:** Change shared navigation grouping, ordering, display labels, concise descriptions, semantics, and route-current matching only. Preserve every route, stable ID, visibility key, deep link, page, workspace link, and capability. Do not add a top-level route.
- **Acceptance criteria:** Daily and supporting destinations are distinct on desktop and mobile; the job pipeline is not mistaken for personal follow-ups; all three Workout routes are directly reachable and uniquely named; Settings is secondary; each destination has one correct active state; route and query behavior is unchanged.
- **Verification method:** Before/after route-and-ID inventory; baseline and final production builds; direct desktop/mobile smoke for all 13 destinations; Back/Forward and drawer-close checks; accessibility/overflow inspection; `git diff --check`.

Recommended order: 1 -> 2 -> 3 -> 4 -> 5. All five original P4.5 implementation tasks are complete.

## Integrated gate repair status

The integrated P4.5 local/demo gate is VERIFIED after the five implementation slices and two bounded gate repairs.

- **P4.5-R1 - Stabilize local/demo navigation: Complete.** AuthContext now owns one in-memory review-mode flag initialized only from the explicit local `demo=1` or `visualQa=1` entry. Route-scoped providers consume that stable flag, retain existing fixtures or settle into their existing empty state, and block Firestore subscriptions and writes for the synthetic `local-preview` user. Two fresh desktop runs, the mobile route sequence, Back/Forward, and People/Projects/Progress checks produced no Firestore Listen requests, `ca9`, `b815`, access errors, or horizontal overflow after the query disappeared. A fresh non-demo load remained signed out with no fixtures.
- **P4.5-R2 - Correct Inbox closed-disclosure descendant visibility and focusability: Complete.** A scoped closed-state rule now prevents every nonsummary child of `.easylist-capability-disclosure` from rendering while the native disclosure is closed. Desktop and mobile checks found zero rendered advanced-control rectangles when closed; reopening restored all 23 existing controls, and collapse/reopen retained local form state without invoking an operation.
- **Final integrated local/demo gate: VERIFIED.** Two fresh desktop attempts completed Today, raw-first Capture draft recovery and cleanup, Inbox, Notes library/editor, Plan, People, Projects, Job applications, all three Workout routes, Review, Progress, Settings, three Back operations, three Forward operations, and a natural return to Today. The mobile sequence completed at 390x844. Runtime inspection found no remote Firestore Listen/Write, `local-preview`, provider call, assertion, unhandled exception, horizontal overflow, hidden save, or retained smoke draft.
- **Drawer classification: Pre-existing nonblocking accessibility weakness.** Opening the mobile drawer can leave initial focus on the visible invoker. The focus-trap and return-focus source is unchanged from `4f787a9d`; Escape closes and returns focus, route activation closes, all 13 links remain present and reachable, the drawer scrolls, and prior R1 keyboard evidence remains valid. This browser session's synthetic Tab injection did not advance native focus reliably, so it is not treated as physical-keyboard proof.
- **Verification limits:** This is local/demo automation, not human field validation or authenticated production proof. Authenticated Firestore writes, authenticated visibility restoration, real provider behavior, true push, a physical phone keyboard, and installed/PWA behavior remain unverified.

Next action: EasyLife HQ checkpoint review and a separate remote-backup push decision for the seven local P4.5 commits. Live AI and true push remain unapproved, and no P5 implementation work is authorized.
