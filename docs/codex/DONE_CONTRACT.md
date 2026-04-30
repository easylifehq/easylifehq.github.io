# Done Contract

This is the ship-specific completion contract. It tells the fleet what "done enough" means before generating more work, advancing phase, or parking the ship.

## Current Stage

Stage: shape

Stage rules: present

Site map: missing

Evaluators: present

## Product Target

Audience: Spencer as the signed-in EasyLife user managing tasks, notes, calendar, workouts, and daily planning

Product promise: EasyLife helps one person start the day, capture tasks/notes/events, and recover from mistakes without fighting the app.

Primary action: Open the signed-in HQ or current module and take the next daily action.

Showable moment: The protected side feels like a calm connected daily assistant instead of separate unfinished tools.

Current useful state: A stable local preview where the protected app feels faster, simpler, and clearly useful on mobile.

Main friction: The next concrete product friction still needs to be chosen from live preview, reports, or user feedback.

Next useful improvement: The next task should improve:

- [x] main workflow
- [x] local evaluator
- [x] visual clarity
- [x] copy clarity
- [ ] formula correctness
- [x] onboarding or demo path
- [x] repair or regression risk

Specific improvement: choose one visible or deterministic friction from the latest preview/reports and make it easier to understand or use.

## Done Enough

The ship can stop or advance when all of these are true:

- The primary action is visible or reachable in one obvious step.
- The showable moment is visible or reachable from the first screen.
- The current stage exit criteria in WEBSITE_STAGE_RULES.md are satisfied.
- The Done Signal in PHASE_STATE.md is true in the local preview.
- The next useful improvement in PRODUCT_USEFULNESS.md is either completed or no longer needed.
- No Simon, Robin, Joey, visual, runtime, or checkpoint report has a RED blocker.
- No unchecked product-shaped task remains that is required for the current stage.

## Must Not Do

- Do not edit Firebase rules, auth setup, backend config, package/dependency files, generated output, secrets, deployment config, data shapes, or root deployed files.
- Do not add new features when No More Features Lock is true.
- Do not add sections, pages, claims, or controls just to keep the loop busy.
- Do not move to polish or proof if shape/simplicity blockers are still obvious.
- Do not keep running once proof passes and the ship is review-ready.

## Evidence Required

- Build/check command: npm.cmd run build
- Preview route(s): /, /easylist?visualQa=1, /easynotes?visualQa=1, /easycalendar?visualQa=1, /easyworkout?visualQa=1, /settings?visualQa=1
- Latest visual evidence covers the first screen and the highest-impact route.
- Robin copy review is not RED for visible wording.
- Simon design review is not RED for layout, hierarchy, or first impression.
- Joey security review is GREEN or not applicable for the touched scope.

## Advance Or Park Rule

- If Done Enough is true and current stage is not proof, advance to the next stage instead of inventing more same-stage tasks.
- If Done Enough is true in proof, set phase to parked and Parking State to PARKED_REVIEW_READY.
- If Done Enough is false, generate only tasks that close a specific failed bullet above.
