# Simon Design Review

## Verdict
NOT_READY_FOR_HUMAN_VISUAL_REVIEW

## One-Sentence Read
EasyLife is visually credible in its entrance, shell, and Today surface, but Inbox and Plan still need polish before the assistant brain should begin.

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
- The final Stage 9 proof packet still needs to re-check the whole review path after the Inbox and Plan fixes.
- Memory may still benefit from later route-specific polish, but it is no longer the top blocker before the next proof run.
- There is still some card/panel language in deeper surfaces for a personal assistant that should feel fast, composed, and direct.

## Design Readiness
Rerun the Stage 9 visual proof packet. Public/login, signed-in shell, Today, Inbox, and Plan have now had focused polish, but the app still needs the full review verdict before Stage 10.

## Stage 9 Proof Result

- Build passed with `npm.cmd run build` from `app-vNext`.
- Login, Today, Inbox, Plan, Notes, and Settings/More all rendered in local review mode.
- Today passed desktop and 390px mobile inspection.
- The previous bounded blockers, Inbox intake polish and Plan day polish, have now been addressed and need a fresh proof verdict.

## Priority Design Blocker
Full Stage 9 proof. The next judgment point is whether the complete review path is credible enough for human visual review.

## Next Design Tasks
- [x] Stage 9 Task 2: polish Today first viewport and flatten one card/panel clutter source.
- [x] Stage 9 Task 3: polish Inbox into a compact assistant intake queue.
- [x] Stage 9 Task 4: polish Plan day surface without adding scheduling behavior.
- [x] Separate Robin task: clean public/login product inventory language.
- [ ] Stage 9 proof packet: inspect login, Today, Inbox, Plan, Notes, and Settings/More.

## Stop Or Continue
continue Stage 9 visual polish
