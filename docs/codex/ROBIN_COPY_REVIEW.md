# Robin Copy Review

## Verdict
FOLLOWUP_REMINDER_HANDOFF_COPY_STAYS_HONEST

## Stage 12 Task 4 Copy Review - 2026-05-11

Verdict: `FOLLOWUP_REMINDER_HANDOFF_COPY_STAYS_HONEST`.

The follow-up and reminder handoff copy stays honest because each preview names the action it refuses to take. Follow-up says it does not send email, text, calls, or messages. Reminder says it does not schedule a notification. Both say the preview is not saved automatically and that the user must choose any real next action.

What improved:
- The handoff action is explicit: `Preview follow-up handoff` or `Preview reminder handoff`.
- Follow-up uses `Manual reply review`, which keeps the work inside review instead of pretending a message can be sent.
- Reminder uses `Manual reminder review` and `No notification scheduled`, which avoids implying background scheduling.

Copy risk:
- Follow-up and reminder are naturally external-action words, so every future Stage 13 save/handoff task must keep no-send and no-notification copy close to the controls until real integrations are deliberately approved.

---

## Verdict
NO_REAL_MEMORY_WORDING_STAYS_HONEST_FOR_NOTE_HANDOFF

## Stage 12 Task 2 Copy Review - 2026-05-11

Verdict: `NO_REAL_MEMORY_WORDING_STAYS_HONEST_FOR_NOTE_HANDOFF`.

The note handoff copy stays honest because the preview says `Editable unsaved note draft`, warns that it is not saved and is not real memory, and points users back to the existing note creation flow only when they are ready to create a real note.

What improved:
- The handoff requires the explicit `Preview note handoff` choice before any editable note preview appears.
- The preview fields are labeled as local editing surfaces, not as saved memory.
- Empty-state copy now says `No memory matches this view` and `No memory yet`, which avoids implying a stored assistant memory system.

Copy risk:
- `Remember something` is still a real note creation action on the same route, so it must stay visually and verbally separate from local assistant draft handoffs.

---

## Verdict
COPY_READY_FOR_STAGE_12

## Stage 11 Copy Proof - 2026-05-11

Verdict: `COPY_READY_FOR_EXPLICIT_HANDOFF`.

The Stage 11 copy keeps the no-write promise clear enough to proceed. Today says nothing is saved from Today. Inbox says drafts are unsaved and no task, note, plan, reminder, follow-up, email, sync, schedule, or memory has been created. Notes says the memory-like draft is not saved, pinned, remembered, planned, or turned into a task.

What works:
- `Unsaved local preview` appears at the draft moment.
- `Preview draft` is safer than approval language that sounds like a write.
- `Compare unsaved shapes` makes the choice feel local and reversible.
- Notes uses `Memory-like assistant draft`, which avoids claiming real memory.

Copy risks to carry into Stage 12:
- `Remember something` is still a real note-creation action, so Stage 12 must keep it visually and verbally separate from local draft preview actions.
- `Turn into task` and `Turn into plan` are acceptable as labels only while paired with preview/no-write language; actual handoff copy must say what will happen before it happens.
- Reminder and follow-up handoff must not imply notifications, email sending, calendar sync, or background automation.

## Stage 11 Final Copy Verdict

COPY_READY_FOR_STAGE_12

---

## Verdict
COPY_READY_FOR_STAGE_11

## Stage 11 Task 4 Copy Review - 2026-05-11

Verdict: `NO_REAL_MEMORY_WORDING_CLEAR`.

Notes/Memory now says the assistant draft is an unsaved local preview and explicitly says it is not saved, pinned, remembered, planned, or turned into a task. The dismiss state also says no memory draft was saved, pinned, created, scheduled, synced, or remembered.

What improved:
- `Save context for later` became `Keep context close`, which makes the route feel less like standalone notebook management.
- `Saved context Today can use later` became `Context candidates Today can review later`, which keeps the bridge tied to Today without implying assistant memory has happened.
- The new affordance uses draft/action language instead of real automation language.

Copy risk:
- The main `Remember something` button still creates a real note through existing Notes behavior, so it should remain visually separate from the local assistant draft affordance.

## Stage 11 Task 2 Copy Review - 2026-05-11

Verdict: `COPY_STAYS_HONEST_FOR_LOCAL_DRAFT_COMPARISON`.

The new Inbox comparison row stays honest because it says `Compare unsaved shapes`, uses draft labels rather than save labels, and keeps the no-write warning visible in the single approved preview. Selecting Task, Memory, Plan, Reminder, Follow-up, or Review changes only the local preview shape.

What improved:
- `Approve preview` had already been softened to `Preview draft`, and this task keeps that safer verb.
- The repeated approval-state chip was removed from the suggestion topline, so the card now avoids saying the same preview state in three places.
- The draft preview still says the selected draft is not saved and that no task, note, plan, reminder, follow-up, email, sync, schedule, or memory has been created.

Copy risk:
- `Memory draft` is acceptable only because the nearby warning says it is not saved or remembered. Keep that pairing until real persistence is deliberately designed.

## Stage 10 Copy Proof - 2026-05-11

The Stage 10 assistant copy is honest enough to continue. It consistently frames the assistant as suggesting, classifying, reviewing, and asking for approval before anything changes.

## What Works

- Today says `Capture, classify, review, approve` and pairs the local suggestion with `Nothing changes here.`
- Inbox says the preview is local and that nothing is saved, sent, synced, or remembered from the card.
- Approval controls now say `Approve preview`, `Edit preview`, and `Dismiss preview`, which avoids implying a real write.
- The preview state labels say `Preview:` for suggested, editing, approved locally, dismissed locally, and needs review.

## Copy That Still Needs Care

- `Approved locally` is acceptable for this proof, but Stage 11 should make clear whether approved means a draft, not a saved object.
- The shared task composer still contains task-row language under the assistant frame.
- Stage 11 must avoid saying memory, sync, plan, or follow-up as if those actions actually happen.

## Copy Recommendation

Continue to Stage 11, but keep every new draft label visibly unsaved until an explicit save behavior is intentionally designed and reviewed.

## Final Verdict

COPY_READY_FOR_STAGE_11

---

## Verdict
COPY_READY_FOR_HUMAN_VISUAL_REVIEW

## One-Sentence Read
The main EasyLife review path now introduces and sustains one assistant model from login through Today, Inbox, Plan, Notes, and More.

## What Improved
- Public/login header navigation now says Assistant instead of Products.
- The mobile cue now says Assistant preview instead of Explore products.
- The landing hero leads with one assistant promise: one calm assistant for the things you actually have to handle.
- The old suite/product grid is now an Assistant Map anchored around Today, Inbox, Plan, and Notes.
- The public Assistant menu no longer exposes EasyHQ, EasyList, EasyNotes, or other Easy* product names as visible labels.
- Login proof copy no longer frames the product as a tool shelf.
- App header assistive copy now says assistant navigation and keeps the visible model at Today, Inbox, Plan, Notes, More.
- Inbox now reads as one intake surface with approve, Plan, and Today language.
- Plan now uses fixed items, focus blocks, due items, Today timeline, and quick add plan item instead of calendar-app labels.
- Notes now reads as Memory with context groups, task cues, plan cues, pinned context, and old-context review.

## Copy That Still Hurts The Product
- Some deeper non-owned surfaces still use EasyList/EasyNotes language, especially archive/deleted/editor and optional More modules.
- Individual legacy public product routes still exist and may carry old labels when opened directly; this slice kept those routes intact and cleaned the main public/login entrance only.

## Does The App Read As One Assistant?
Yes from the public/login entrance and inside the signed-in review path for Today, Inbox, Plan, Notes, and Settings/More. Remaining copy risk is in deeper optional/direct legacy routes, not the main entrance.

## Route Inspection
- Method: local Vite preview on `http://127.0.0.1:4191`, rendered DOM and screenshots captured with the in-app browser.
- Checked: `/login`, `/`, and opened public Assistant menu.
- Build: `npm.cmd run build` passed from `app-vNext`.

## Next Copy Tasks
- [x] Clean `MarketingHeader`, `marketingNavigation`, and the public landing route so login no longer starts with feature inventory.
- [ ] Clean non-owned deeper route chrome for EasyList/EasyNotes archive, deleted, editor, and optional More paths.
- [ ] Keep AI language modest until real assistant behavior exists.

## Stop Or Continue
continue to Stage 10 Assistant Brain Foundation with modest approval-first language

## Stage 9 Proof Update - 2026-05-11

Copy is not the main blocker to human visual review anymore. The public/login entrance, signed-in shell, Today, Notes, and Settings/More read as one assistant path. Remaining copy caveats are in deeper optional/direct routes and can be handled after the visual proof blockers unless they appear in the main review path.

## Stage 9 Inbox Intake Update - 2026-05-11

Inbox now leads with `Review the intake queue`, `Next review`, `Approve`, `Plan`, `Remember`, and `Follow up` language. The route no longer starts with the visible Lists/Email subnav, and the local scope control is framed as `Queue scope` instead of a list picker.

Copy verdict for this route: `INBOX_COPY_READY_FOR_VISUAL_PROOF`.

Remaining copy caveat: the shared task composer still contains underlying task-row labels because the behavior remains real task capture, but the visible Inbox frame now reads as assistant intake instead of a standalone list app.

## Stage 9 Final Copy Proof - 2026-05-11

Copy verdict: `COPY_READY_FOR_HUMAN_VISUAL_REVIEW`.

The six-route proof rendered the main path with assistant language:

- Login: `Open your assistant`
- Today: `What needs attention now?`
- Inbox: `Review the intake queue`
- Plan: `Plan a realistic day`
- Notes: `Memory`
- Settings/More: `Settings`

The remaining copy caveats are non-blocking: deeper optional/direct routes can still carry legacy labels, and Stage 10 copy must avoid implying real AI automation, real memory, email sending, sync, or hidden writes.
