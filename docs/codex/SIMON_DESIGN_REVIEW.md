# Simon Design Review

## Verdict
NOT_READY_FOR_HUMAN_VISUAL_REVIEW

## One-Sentence Read
EasyLife is visually credible in its entrance, shell, and Today surface, but Inbox and Plan still need polish before the assistant brain should begin.

## What Improved
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
- Inbox still needs to feel more like a compact approval queue and less like list management.
- Plan and Memory still need route-specific visual polish after Today and Inbox.
- There is still some card/panel language in deeper surfaces for a personal assistant that should feel fast, composed, and direct.

## Design Readiness
Continue Stage 9 one surface at a time. Public/login, signed-in shell, and Today are improved enough to keep, but the app is not yet `READY_FOR_HUMAN_VISUAL_REVIEW`.

## Stage 9 Proof Result

- Build passed with `npm.cmd run build` from `app-vNext`.
- Login, Today, Inbox, Plan, Notes, and Settings/More all rendered in local review mode.
- Today passed desktop and 390px mobile inspection.
- The remaining visual blockers are bounded: Inbox intake polish and Plan day polish.

## Priority Design Blocker
Inbox intake polish. The assistant home now supports the model; the next judgment point is whether capture/approval feels sleek, compact, and operational.

## Next Design Tasks
- [x] Stage 9 Task 2: polish Today first viewport and flatten one card/panel clutter source.
- [ ] Stage 9 Task 3: polish Inbox into a compact assistant intake queue.
- [ ] Stage 9 Task 4: polish Plan day surface without adding scheduling behavior.
- [x] Separate Robin task: clean public/login product inventory language.

## Stop Or Continue
continue Stage 9 visual polish
