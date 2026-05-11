# Robin Copy Review

## Verdict
COPY_READY_FOR_STAGE_11

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
