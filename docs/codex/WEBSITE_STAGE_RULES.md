# Website Stage Rules

This file is generated from Codex Fleet Phase 1. It defines how website ships move from direction to proof without waiting for a human after every tiny task.

Stage order: brief -> foundation -> shape -> simplicity -> polish -> proof -> parked

General rule: auto-advance inside the stage system only when the current stage exit criteria pass. Stop for RED gates, sensitive scope, failed builds, unclear direction, or parked review state.

## brief

Purpose: Lock the product direction before coding.

Allowed work:
- mission docs
- PHASE_STATE.md
- audience and buyer definition
- primary CTA
- required page list
- what-not-to-build

Forbidden work:
- new implementation
- visual polish
- feature expansion
- routing rewrites

Exit criteria:
- Audience is specific
- Product Promise is concrete
- Primary Action is one clear action
- Showable Moment is named
- What Not To Build is explicit

Reviewer gates: human direction, product-usefulness

Auto-advance rule: May advance to foundation when all brief fields are non-TODO and the ship has no admission/usefulness blocker.

Stop rules:
- unclear buyer
- unclear CTA
- broad platform framing
- missing what-not-to-build

## foundation

Purpose: Create the minimum working site/app structure.

Allowed work:
- required routes/pages
- navigation
- core demo flow
- local demo data
- basic responsive layout
- SITE_MAP.md
- visual-routes.json

Forbidden work:
- final micro-polish
- new backend/auth/payments
- large copy voice pass
- unapproved dependencies

Exit criteria:
- Required pages/routes exist
- Navigation reaches every required page
- Primary CTA works locally
- Build/static check passes
- Mobile and desktop can be previewed

Reviewer gates: build, visual smoke, Joey if sensitive scope appears

Auto-advance rule: May advance to shape when the promised pages and primary flow exist and load.

Stop rules:
- missing required page
- broken route
- build failure
- sensitive scope request

## shape

Purpose: Make the site understandable in 30 seconds.

Allowed work:
- page order
- section hierarchy
- first viewport
- navigation labels
- CTA placement
- remove confusing sections

Forbidden work:
- extra feature tours
- new routes unless a required page is missing
- generic marketing fluff
- tiny spacing-only churn

Exit criteria:
- First viewport says who it is for
- Primary action is obvious
- Core demo/showable moment is visible or one tap away
- No duplicate headers
- No route feels unrelated

Reviewer gates: Simon, Robin, visual QA

Auto-advance rule: May advance to simplicity when the structure is coherent and Simon/Robin are not RED for direction.

Stop rules:
- confusing first screen
- too many equal CTAs
- duplicate route identity
- unclear page purpose

## simplicity

Purpose: Reduce cognitive load before adding anything else.

Allowed work:
- remove
- combine
- shorten
- hide
- demote
- collapse
- rename
- reduce choices

Forbidden work:
- new sections
- new feature capability
- more cards
- more explanatory text
- larger navigation

Exit criteria:
- No obvious wall of text
- Fewer competing choices than before
- Primary action remains dominant
- Mobile first viewport is calmer
- No important action is hidden

Reviewer gates: Simon, Robin, visual QA

Auto-advance rule: May advance to polish when no major clutter or comprehension issue remains.

Stop rules:
- first screen still overwhelming
- copy still vague
- new complexity added
- primary CTA demoted

## polish

Purpose: Make the already-shaped site feel refined.

Allowed work:
- spacing
- type scale
- color rhythm
- button rhythm
- final microcopy
- mobile fit
- small accessibility repairs

Forbidden work:
- new pages
- new product claims
- new workflows
- backend/auth/payments
- broad redesign

Exit criteria:
- No clipped text
- Tap targets are comfortable
- Copy sounds human and concrete
- Visual rhythm is consistent
- Build passes

Reviewer gates: Simon, Robin, visual QA, copy smoke

Auto-advance rule: May advance to proof when polish issues are small and no reviewer is RED.

Stop rules:
- visual RED
- copy RED
- repeated vague phrases
- mobile overlap

## proof

Purpose: Verify and repair only blockers.

Allowed work:
- broken links
- broken routes
- build failures
- runtime failures
- clipped text
- bad tap targets
- review blockers
- screenshot evidence

Forbidden work:
- redesign
- new sections
- new features
- tone experiments
- scope expansion

Exit criteria:
- Build/check command passes
- Required routes load
- Desktop/mobile screenshots exist
- Simon not RED
- Robin not RED
- Joey GREEN or not applicable
- No high/medium visual bugs

Reviewer gates: build, visual QA, Simon, Robin, Joey

Auto-advance rule: May advance to parked when proof passes and no unchecked tasks remain.

Stop rules:
- failed build
- runtime crash
- security RED
- high visual bug
- blocking review finding

## parked

Purpose: Stop spending loops; the ship is ready for human inspection.

Allowed work:
- docs-only review note
- preview instructions
- human-requested follow-up task

Forbidden work:
- unattended new work
- planner-generated polish
- new feature work
- continued churn

Exit criteria:
- Parking State is PARKED_REVIEW_READY
- No unchecked tasks
- Working tree clean
- Latest proof/report explains what to inspect

Reviewer gates: human

Auto-advance rule: Do not auto-advance. A human must move it out of parked.

Stop rules:
- any unattended task generation

