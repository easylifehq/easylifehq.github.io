# Evaluators

Define how this ship proves progress. If the fleet cannot evaluate the work locally, it should not spend long autonomous loops on the ship.

## Build Evaluator

Command: npm.cmd run build

Expected result: command exits 0 without generated-output churn.

## Visual Evaluator

Routes or screens to inspect: /, /easylist?visualQa=1, /easynotes?visualQa=1, /easycalendar?visualQa=1, /easyworkout?visualQa=1, /settings?visualQa=1

What must be visible: the main workflow, primary action, and one obvious next step.

What must not happen: broken styling, duplicate headers, confusing walls of text, fake data presented as real, or hidden primary controls.

## Product Evaluator

Manual check: open the local preview and complete the first useful workflow.

Expected user outcome: A stable local preview where the protected app feels faster, simpler, and clearly useful on mobile.

## Data Or Formula Evaluator

Fixtures: use project-specific fixtures when formulas, recommendations, imports, or rankings are present.

Golden values: document known inputs and expected outputs before formula changes.

Tolerance: deterministic outputs should match exactly unless the formula spec says otherwise.

## Copy Evaluator

Voice: plain, specific, useful, and low-jargon.

Forbidden phrases: unlock, revolutionize, seamless, AI-powered, intelligent ecosystem, ready for service, wine-list polish.

Clarity check: a new user should know what the page does in under 30 seconds.

## Regression Risks

- Risk: product gets more complicated instead of easier.
  Check: remove or hide secondary controls before adding more UI.
- Risk: generated claims sound fake or unsupported.
  Check: every number, rank, recommendation, or formula has a source or fixture.
