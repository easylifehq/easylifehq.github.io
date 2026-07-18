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

Status: Next.

- **User problem:** Notes already has New note, Last note, and Recent notes, but recovery/export explanations appear before resuming recent work and the editor places a long implementation-boundary card before the writing field.
- **Intended behavioral outcome:** New note, last note, recent notes, and the writing area dominate; recovery/export detail remains discoverable without interrupting ordinary writing.
- **Scope boundary:** Reorder or progressively disclose existing copy only. Preserve autosave, local draft backup, manual export link, saved-note behavior, focus, and all trust boundaries. No note schema or persistence change.
- **Acceptance criteria:** Library entry exposes New note and recent/resume choices before detailed recovery text; editor focus and body entry remain immediate; save/recovery status remains perceivable; detailed boundary copy is keyboard accessible and accurate.
- **Verification method:** Source inspection; new-note and recent-note browser smoke; focus/keyboard check; desktop/mobile inspection; production build.

## 5. P4.5-05 - Clarify the navigation hierarchy without removing routes

Status: Pending.

- **User problem:** The demo menu places Today, Inbox, Plan, Notes, People, and Settings together as core; exposes three Workout destinations; and labels a job-application pipeline as Follow-ups while People and Inbox also contain follow-up concepts. Users must infer which destination owns a task.
- **Intended behavioral outcome:** Today, Capture, Notes, Plan, and Inbox read as the daily path; People, Workout, Projects, job pipeline, Progress, Review, and Settings read as secondary or contextual.
- **Scope boundary:** Change menu grouping, labels, and descriptions only. Preserve every route, visibility setting, deep link, workspace sub-navigation, and capability. Do not add a top-level route.
- **Acceptance criteria:** Core and secondary destinations are visually distinct on desktop and mobile; the job pipeline is not mistaken for all personal follow-ups; Workout remains reachable without three equal top-level choices; route and query behavior is unchanged.
- **Verification method:** Source route/menu sweep; desktop/mobile menu screenshots; keyboard navigation check; direct-route smoke for every moved item; production build.

Recommended order: 1 -> 2 -> 3 -> 4 -> 5. Tasks 1 through 3 are complete. Task 4 is next and can now simplify Notes without changing the repaired Today -> Capture -> Inbox path. Task 5 should use field evidence from Tasks 1-4 so hierarchy changes reflect actual use rather than assumptions.
