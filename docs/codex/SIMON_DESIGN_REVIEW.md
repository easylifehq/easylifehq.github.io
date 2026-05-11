# Simon Design Review

## Verdict
READY_FOR_STAGE_12

## Stage 11 Design Proof - 2026-05-11

Verdict: `SAFE_LOCAL_DRAFTS_VISUALLY_READY_FOR_HANDOFF`.

The Stage 11 surfaces stay reviewable. Today remains focused on one read, one next move, one command row, and the small today strip. Inbox carries the heaviest behavior, but it is still structured as one suggestion, one comparison row, and one unsaved draft preview. Notes adds a quiet memory-draft affordance without turning Memory into a second dashboard.

What works:
- Today points to safe draft review without adding a new panel.
- Inbox makes draft shape choice visible while keeping one preview as the main object.
- Notes/Memory shows local actions in a contained panel below the memory bridge.
- Plan and Settings remain stable support routes.

What still feels weak:
- Inbox density remains the main design risk because real task capture lives below the assistant preview.
- The Notes affordance is honest but still a little panel-heavy; Stage 12 should avoid adding another large block there.
- The handoff moment does not exist yet, so users can review previews but cannot clearly choose what to do next.

Design recommendation:
Begin Stage 12 with the narrowest explicit handoff preview, likely task-row handoff first. Keep all handoff UI compact and avoid adding a second command center.

## Stage 11 Final Verdict

READY_FOR_STAGE_12

---

## Verdict
READY_FOR_STAGE_11

## Stage 11 Task 3 Design Review - 2026-05-11

Verdict: `TODAY_REMAINS_FOCUSED_WITH_SAFE_DRAFT_HINT`.

Today still holds the first viewport around one assistant read, one next move, one command/capture row, and one Due / Plan / Open strip. The new hint is small enough to support the command row instead of becoming another panel.

What improved:
- The old dense classifier sentence was shortened into one safer action: review an unsaved draft in Inbox.
- The secondary action now says `Review Draft`, which connects Today to the Stage 11 Inbox behavior without implying a save.
- No cross-route draft state or persisted preview was added.

Design risk:
- The command row still carries a long static example string, but this task did not make it worse. If Today gets crowded again, the next visual repair should shorten that example list rather than adding another surface.

## Stage 10 Design Proof - 2026-05-11

The assistant brain foundation is visually reviewable enough to continue. Today keeps the first viewport disciplined while adding a small local intent read into the command row, and Inbox makes the approval loop visible without turning into a new dashboard.

## What Works

- Today still leads with one assistant read, one next move, one command/capture row, and the Due / Plan / Open strip.
- The local intent language is present but compact: it supports the command row instead of competing with it.
- Inbox now has a visible suggestion card and local approval states, so the assistant feels like it is asking before acting.
- The proof routes rendered without browser page errors.

## What Still Feels Weak

- The approval loop needs a more useful local draft result before it will feel genuinely helpful.
- Inbox is carrying both assistant preview and real task-row controls, so density remains a risk.
- Notes has not yet received the same local draft treatment.

## Design Recommendation

Continue to Stage 11 Safe Local Memory with a narrow mandate: show unsaved local draft previews, keep the assistant honest, and avoid adding another dashboard surface.

## Final Verdict

READY_FOR_STAGE_11

---

## Verdict
READY_FOR_HUMAN_VISUAL_REVIEW

## One-Sentence Read
EasyLife is visually credible enough for human review: the entrance, shell, Today, Inbox, Plan, Notes, and More now read as one calm assistant path.

## What Improved
- Plan now leads with a realistic day-planning read: capacity, planned time, open time, fixed commitments, focus blocks, and one next planning action.
- The four-card Plan mode grid is gone, which makes Plan feel less like a calendar module and more like an assistant read.
- The duplicate floating Capture button is hidden on Plan so Add time and Preview plan own the planning controls.
- Inbox now starts from a compact intake queue and no longer opens with the old Lists/Email subnav.
- Today now has a more disciplined first viewport: assistant read, next move, compact Due / Plan / Open strip, inline command input, and quiet context.
- The old mixed Today/Try summary row is gone.
- The duplicate floating Capture button is hidden on Today so the inline command surface owns capture.
- The secondary Resume action is no longer competing with the next best move.
- Context is quieter and less like another card stack.
- Today, Inbox, Plan, Notes, and More are now the dominant signed-in model.
- The first Today viewport is less like a feature dashboard and more like an attention surface.
- Inbox, Plan, and Memory now have clearer assistant jobs instead of reading purely as task/calendar/notes tools.
- Optional modules are less prominent, which helps the product stop introducing itself as a suite.
- Stage 9 shell polish moved More into the same primary assistant nav group instead of leaving it as a separate overflow control.
- The duplicate More group header was removed from the signed-in shell menu.
- Header density is tighter and the selected route has a clearer active state.
- Mobile shell inspection at 390px keeps Today, Inbox, Plan, Notes, and More visible without clipping.

## What Still Feels Bad
- Memory may still benefit from later route-specific polish, especially around review density and the floating Capture affordance.
- There is still some card/panel language in deeper surfaces for a personal assistant that should feel fast, composed, and direct.
- Some deeper optional/direct routes may still carry legacy module language.

## Design Readiness
EasyLife is `READY_FOR_HUMAN_VISUAL_REVIEW`. Stage 10 Assistant Brain Foundation may begin, but only with approval-first local behavior and no hidden writes.

## Stage 9 Proof Result

- Build passed with `npm.cmd run build` from `app-vNext`.
- Login, Today, Inbox, Plan, Notes, and Settings/More all rendered in local review mode on `http://127.0.0.1:4196`.
- Today passed desktop and 390px mobile inspection.
- The previous bounded blockers, Inbox intake polish and Plan day polish, have now been addressed.

## Priority Design Blocker
The next blocker is usefulness, not visual credibility: Stage 10 needs a real approval-first assistant brain foundation that does not overpromise.

## Next Design Tasks
- [x] Stage 9 Task 2: polish Today first viewport and flatten one card/panel clutter source.
- [x] Stage 9 Task 3: polish Inbox into a compact assistant intake queue.
- [x] Stage 9 Task 4: polish Plan day surface without adding scheduling behavior.
- [x] Separate Robin task: clean public/login product inventory language.
- [x] Stage 9 proof packet: inspect login, Today, Inbox, Plan, Notes, and Settings/More.

## Stop Or Continue
continue to Stage 10 Assistant Brain Foundation

## Stage 9 Final Proof Update - 2026-05-11

- Route proof passed for `/login`, `/app/hq?demo=1`, `/app/easylist/add?demo=1`, `/app/easycalendar/day?demo=1`, `/app/easynotes?demo=1`, and `/app/settings?demo=1`.
- Desktop screenshots were captured for all six routes; Today was also captured at 390px mobile.
- No browser page errors were reported.
- Final verdict: `READY_FOR_HUMAN_VISUAL_REVIEW`.
