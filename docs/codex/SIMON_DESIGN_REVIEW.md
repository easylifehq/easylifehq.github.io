# Simon Design Review

## Verdict
SETTINGS_FEELS_MORE_ASSISTANT_CONTROL_PANEL

## Stage 17 Task 5 Design Review - 2026-05-12

Verdict: `SETTINGS_FEELS_MORE_ASSISTANT_CONTROL_PANEL`.

Settings now leads with assistant control language instead of cozy notebook identity or a product-module inventory. The default visual theme reads as `Control Light`, the first section is `Assistant controls`, and optional surfaces are explicitly parked under More.

What works:
- `Soft Notebook` no longer appears as the default-feeling visual identity.
- The old static Surface Defaults inventory cards are gone.
- The More section names Today, Inbox, Plan, and Notes as the default path.
- Workout, Projects, Follow-ups, People, and Progress now read as optional context rather than peer core apps.
- Browser inspection showed the Settings hero, More section, and Surface Defaults section using the new assistant-control framing.

Design risk:
- Settings is still a large page with many deep controls. It is less old-EasyLife now, but a future human review may still want a stricter split between daily controls and advanced/export/install controls.

---

## Verdict
CONTACTS_PEOPLE_PLACES_IS_LESS_CRM_LIKE

## Stage 17 Task 2 Design Review - 2026-05-12

Verdict: `CONTACTS_PEOPLE_PLACES_IS_LESS_CRM_LIKE`.

Contacts now opens on one People memory surface instead of a dashboard stack. The first screen has three clear jobs: people needing attention, where people are, and who might be near a place. The company/stat/reporting language is pushed out of the first impression.

What works:
- The old stats grid is gone from the top path.
- The duplicate focus strips and separate `People to check on` section are gone.
- The place review prompt is part of the first People memory surface instead of a standalone block.
- `Company or context` is softened to `Context`, and `Add contact` is now `Add person`.
- Desktop inspection showed the first screen reading as people/place memory rather than CRM reporting.

Design risk:
- The future map preview still exists below People by place. Stage 17 Task 3 should remove, collapse, or reframe it so the page stops carrying future-feature filler.

---

## Verdict
TODAY_COMMAND_SURFACE_IS_LESS_PROOFY

## Stage 17 Task 1 Design Review - 2026-05-12

Verdict: `TODAY_COMMAND_SURFACE_IS_LESS_PROOFY`.

Today now behaves more like a compact command surface and less like an implementation proof packet. The first viewport keeps the assistant read, next move, capture/command affordance, and small context strip, while the save-boundary language is compressed into one calm line.

What works:
- The command card no longer prints the full slash-separated example chain.
- The old `Task-only confirm` secondary action is now the simpler `Capture`.
- The first viewport says the safety boundary once: `Inbox previews first. Tasks and notes still need confirmation.`
- Desktop and 390px mobile review both showed the command card without clipped helper copy.

Design risk:
- The Today data is still demo-flavored, especially the `Reply to Maya about Friday plans` example. That is acceptable for this anti-annoyance task, but human review should still judge whether the sample content feels personal enough.

---

## Verdict
STAGE_16_READY_FOR_HUMAN_REVIEW

## Stage 16 People + Places Design Proof - 2026-05-12

Verdict: `STAGE_16_READY_FOR_HUMAN_REVIEW`.

People + Places is reviewable before maps. The strongest surface is now the practical sequence: Contacts first names people/place memory, the visiting prompt asks who is near a saved label, People by place groups the answer, and the future map preview is clearly parked.

What works:
- The grouped city/region view is more useful than the decorative map-like preview.
- The visiting prompt gives the user a fast review action without live location or geocoding.
- The place-memory blocks make individual contacts feel more personal.
- Today and Settings still render as the broader assistant shell, so Contacts does not become a separate product.

Design risk:
- Contacts has several stacked sections now. Human review should decide whether the future map preview should be collapsed, moved lower, or removed until a real map mission exists.

---

## Verdict
PEOPLE_BY_PLACE_IS_REVIEWABLE

## Stage 16 Task 3 Design Review - 2026-05-12

Verdict: `PEOPLE_BY_PLACE_IS_REVIEWABLE`.

The new People by place surface gives the user a useful city/region scan without pretending there is a real map. The grouped cards are quieter than the bubble preview and make the practical review action clearer: who do I know near this place?

What works:
- The section groups fictional contacts by Denver and Portland using current city/region data.
- Each group shows count, names, visit notes, and moved-recently context when relevant.
- The future map preview is explicitly labeled as future-only and non-geocoded.
- The grouped view is easier to scan than a decorative map-like cluster.

Design risk:
- The page now has several contacts sections. Stage 16 should keep watching density and may need to collapse or reorder the future map preview after the People by place flow is proven.

---

## Verdict
READY_FOR_HUMAN_REVIEW

## Stage 15 Design Proof - 2026-05-12

Verdict: `READY_FOR_HUMAN_REVIEW`.

The saved task/note loop is visually tolerable enough to show. It is still safety-forward, but it no longer reads like a wall of policy. Today stays focused on the assistant read, next move, command input, and small status strip. Inbox and Notes keep the real save actions inside contained review panels with receipts.

What works:
- Today's helper is short enough to feel like guidance, not a warning block.
- Inbox keeps task save local and scannable after the receipt simplification.
- Notes keeps note/context save calm enough to review without pretending real memory exists.
- Plan and Settings still render as supporting assistant surfaces, not new save destinations.

Design risk:
- The product can be human-reviewed now, but broad visual polish is not done forever. The next design move should come from actual review notes, not automatic expansion.

---

## Verdict
TODAY_SAVE_LANES_ARE_TIGHTER

## Stage 15 Task 3 Design Review - 2026-05-12

Verdict: `TODAY_SAVE_LANES_ARE_TIGHTER`.

Today now explains the two safe save lanes in fewer words and feels less like a policy notice. The Inbox route still carries the full lane rule once, while the intake helper now uses a shorter no-action-until-confirmation sentence.

What works:
- Today says `Save tasks in Inbox, notes in Notes; plans, reminders, and follow-ups stay previews.`
- Today still keeps assistant read, next move, command/capture, and the Due/Plan/Open strip in the first viewport.
- Inbox still says tasks confirm there, note/context confirms in Notes, and plans/reminders/follow-ups stay preview-only.
- No saved task or note data appears on Today.

Design risk:
- The shortened Today copy is still doing safety work in one compact line. Stage 15 proof should verify that it reads as guidance, not policy clutter.

---

## Verdict
INBOX_TASK_RECEIPT_IS_EASIER_TO_SCAN

## Stage 15 Task 1 Design Review - 2026-05-12

Verdict: `INBOX_TASK_RECEIPT_IS_EASIER_TO_SCAN`.

Inbox keeps the same final-confirmed task save behavior, but the confirmation now reads faster. The full excluded-action list moved out of the confirmation and the receipt gained a compact `Only saved: Task` field, which makes the result easier to scan after the click.

What works:
- The confirmation still requires `Confirm and save task`.
- The receipt still shows title, list, kind, due date, minutes, and the task-only boundary.
- The new `Only saved: Task` field makes the receipt more scannable.
- Inbox remains an intake/approval queue; no completion dashboard was added.

Design risk:
- The receipt still carries necessary safety copy. Stage 15 should keep simplifying around the edges, not remove the core no-note/no-plan/no-reminder/no-follow-up/no-external-action boundary.

---

## Verdict
READY_FOR_STAGE_15

## Stage 14 Design Proof - 2026-05-12

Verdict: `READY_FOR_STAGE_15`.

The task and note save paths are visually contained enough to continue, but Stage 15 should harden and simplify rather than expand. Today explains both save lanes without showing saved note data, Inbox keeps task save local, and Notes keeps note/context save inside the existing review panel.

What works:
- Today still opens with assistant read, next move, command/capture row, and Due/Plan/Open strip.
- Inbox has a legible task save sequence: draft, task-only save row, final confirmation, receipt.
- Notes has a legible note/context save sequence: preview, final confirmation, receipt.
- Plan, reminder, and follow-up surfaces remain visually separate from real save behavior.

Design risk:
- Safety copy is dense across Today, Inbox, and Notes. Stage 15 should compress repeated warnings while preserving the boundaries.
- Do not add saved plans/reminders/follow-ups yet; those would make the assistant feel broader than the current trust contract supports.

---

## Verdict
TODAY_AND_INBOX_SAVE_HINTS_STAY_FOCUSED

## Stage 14 Task 4 Design Review - 2026-05-12

Verdict: `TODAY_AND_INBOX_SAVE_HINTS_STAY_FOCUSED`.

Today and Inbox now explain the two safe save lanes without turning either surface into a saved-object dashboard. Today keeps the first viewport centered on assistant read, next move, command/capture, and the small Due/Plan/Open strip. Inbox keeps the task confirmation path local while pointing note/context saves to Notes.

What works:
- Today says Inbox can save one task and Notes can save one note/context item, then parks plans, reminders, and follow-ups as preview-only.
- Inbox says tasks confirm here, note/context confirms in Notes, and plans/reminders/follow-ups remain preview-only.
- The task-only save preview now names Notes final confirmation without showing note data inside Inbox.
- No cross-route saved note state appears on Today.

Design risk:
- The safety copy is doing real trust work and is a little dense. Stage 14 proof should decide whether to keep it as-is or compress it after the save boundaries are fully reviewed.

---

## Verdict
SAVED_NOTE_RECEIPT_STAYS_CONTAINED

## Stage 14 Task 2 Design Review - 2026-05-12

Verdict: `SAVED_NOTE_RECEIPT_STAYS_CONTAINED`.

The saved note receipt is visible without turning Notes into a completion dashboard. It stays below the final confirmation inside the existing note/context review panel and reports the concrete title plus context group before repeating the no-real-memory boundary.

What works:
- The receipt is compact and scannable: label, note title, context group, pin preview, then boundary copy.
- Demo review mode is honest and still shows the receipt structure without creating signed-in note data.
- The receipt keeps external/non-note actions out of scope: no tasks, plans, reminders, follow-ups, email, notifications, calendar items, sync, model calls, or real memory.
- The Notes surface remains a context review surface instead of gaining a new route-level status area.

Design risk:
- The note receipt adds another dense proof panel to Notes. Stage 14 should keep future note-save work focused on boundary copy and receipts, not add more dashboard chrome.

---

## Verdict
READY_FOR_STAGE_14

## Stage 13 Design Proof - 2026-05-12

Verdict: `READY_FOR_STAGE_14`.

The first real assistant save path is visually contained enough to continue. Inbox is still the densest route, but the flow is legible: suggestion, selected draft, task-only save row, final confirmation, and receipt. Today points to that path without becoming a saved-task status surface.

What works:
- Today keeps assistant read, next move, command row, and Due/Plan/Open strip in the first viewport.
- Inbox makes the only real action look like task save, not broad assistant automation.
- The receipt stays inside the Inbox approval surface instead of creating a completion dashboard.
- Plan and Notes handoff previews remain visually separate from real save behavior.

Design risk:
- Inbox density is acceptable for proof, but Stage 14 should avoid adding a second dense command center. If note save begins, keep the saved note path inside the existing Notes/Memory draft area and avoid touching Today beyond one compact hint.

---

## Verdict
TODAY_POINTS_TO_TASK_ONLY_INBOX_CONFIRMATION

## Stage 13 Task 4 Design Review - 2026-05-12

Verdict: `TODAY_POINTS_TO_TASK_ONLY_INBOX_CONFIRMATION`.

Today now points users toward the safe Inbox path without becoming a saved-task dashboard. The first viewport still centers the assistant read, next move, small Due/Plan/Open strip, and command row.

What works:
- The command row says Inbox final confirmation can save one task only.
- The start-here action routes task pressure to Inbox review instead of dashboard completion.
- The copy says notes, plans, reminders, and follow-ups stay preview-only.
- Today does not display the saved task receipt or any new saved-task state.

Design risk:
- The command-row helper sentence is doing a lot of safety work. Stage 13 proof should check whether the task-only warning can stay this compact once the full save path is reviewed.

---

## Verdict
TASK_SAVE_RECEIPT_KEEPS_INBOX_AS_APPROVAL_QUEUE

## Stage 13 Task 2 Design Review - 2026-05-12

Verdict: `TASK_SAVE_RECEIPT_KEEPS_INBOX_AS_APPROVAL_QUEUE`.

The saved task receipt makes the final-confirmed save result visible without turning Inbox into a completion dashboard. It stays inside the existing assistant handoff area and reports the concrete saved object instead of adding another route-level status surface.

What works:
- The receipt shows the task title and list immediately after `Confirm and save task`.
- The boundary copy is still close to the receipt: no email, notification, calendar item, note, memory, or follow-up was created.
- Demo review mode remains honest by saying no signed-in task save happened.

Design risk:
- Inbox is still the densest assistant surface. The next Stage 13 task should tighten task-only boundary language or reduce receipt copy before adding any new saved-action surface.

---

## Verdict
READY_FOR_STAGE_13

## Stage 12 Design Proof - 2026-05-11

Verdict: `READY_FOR_STAGE_13`.

The explicit handoff previews are visually reviewable enough to move forward. Today remains focused, Plan keeps its handoff inside the planning read, Notes keeps the note handoff below the memory draft affordance, and Settings remains stable. Inbox is dense, but the structure is still legible: suggestion, draft shape, selected handoff, then the existing real task composer.

What works:
- Handoffs appear only after an explicit user click.
- The preview panels are visually consistent across task, note, plan, reminder, and follow-up.
- The no-save/no-send/no-schedule warnings are close to the fields they describe.

Design risk:
- Inbox should not receive another full-width panel before Stage 13 proof. The next task should convert the existing task handoff into one final-confirmation save path rather than adding a new surface.

---

## Verdict
PLAN_REMAINS_FOCUSED_AND_HONEST_FOR_HANDOFF

## Stage 12 Task 3 Design Review - 2026-05-11

Verdict: `PLAN_REMAINS_FOCUSED_AND_HONEST_FOR_HANDOFF`.

The Plan route remains focused because the assistant handoff sits inside the existing first planning read instead of becoming a second calendar surface. It adds one explicit `Preview plan handoff` action, then reveals one editable unscheduled day draft.

What works:
- The preview is visibly local and says it is not scheduled and not saved.
- The editable fields are compact: title, day mode, date, start, end, and review notes.
- The existing real Plan controls stay separate below the assistant preview.
- The older `Apply plan`/`Plan applied` language was softened to `Add suggestions`/`Suggested blocks added`, which makes the route feel less like the assistant silently scheduled something.

Design risk:
- Plan now has both an assistant handoff preview and a real suggestion flow. The separation is acceptable for this slice, but future tasks should avoid adding another Plan panel before the Stage 12 proof.

---

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
