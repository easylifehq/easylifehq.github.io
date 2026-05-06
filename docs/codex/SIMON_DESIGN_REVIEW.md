# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife now has a calmer shared visual skin, but the core routes still behave like polished product brochures instead of a personal operating system you can use today.

## Mission Fit
The direction partially matches the mission: shared navigation, restrained color, consistent cards, and calmer spacing are moving toward one suite. The miss is structural. Pack 1 is Product Spine, and these screens still lead with marketing claims, "Start Free", feature chips, and explanatory sections instead of one signed-in daily next action, today context, and compact module status. The product is wearing the suit, but it is still giving the pitch deck.

## Taste Check
The good: the palette is quieter, the teal is controlled, the typography has decent confidence, and the preview panels create a recognizable suite language across EasyList, EasyNotes, EasyCalendar, and EasyWorkout. Mobile is no longer obviously broken, and the cards feel more intentional than the earlier generic dashboard sludge.

The off: the hierarchy is too loud for the job. Every module opens with a huge hero, repeated "Features" framing, CTA buttons, and pill claims. That is not daily software; that is a showroom. The repeated page structure makes each app feel cloned, not meaningfully connected. On mobile, the hero copy and feature preview consume the first screen before the user gets a real action.

## Visual Problems To Fix
- Customer-facing and working-app chrome are blended: "Start Free", "See Features", and marketing nav are visible on module pages that should feel like usable app surfaces.
- Repeated page identity is present across routes: each module repeats the same top header, hero label, oversized headline, CTA row, pill row, preview panel, and "Features" intro. It makes the suite feel templated, not intelligent.
- The first viewport violates the Information Staging contract: it shows product explanation before one daily next action, today context, or compact real module status.
- The module previews are handsome but fake-feeling; they read as static sales examples rather than live task, note, calendar, or workout state.
- Mobile hierarchy is heavy: the hero headline, paragraph, buttons, chips, and preview panel push useful content too far down.
- The route navigation is visually louder than it needs to be for a working product, especially when paired with repeated page intros.
- The "Features" band arrives too soon and too often, creating brochure rhythm instead of operating rhythm.
- The product naming is split between "Daily Workspace", "EasyLifeHQ", and individual app labels, which softens the spine instead of clarifying it.
- Cards have consistent polish, but the repeated card-plus-card composition starts to feel like a design system demo rather than a lived-in assistant app.

## Strongest Opportunities
- Convert the protected HQ and primary module first screens from marketing heroes into daily work surfaces: next action, today signal, and one primary command.
- Make module pages feel connected through live cross-module context, not repeated sales structure: EasyList should show calendar handoff, EasyCalendar should show task blocks, EasyNotes should show recent capture, EasyWorkout should show last session or next routine.
- Reduce route chrome so navigation becomes quiet infrastructure, not the main event.
- Replace feature chips with small status chips only when they reflect actual state or a direct action.
- Give each module one distinct first-screen behavior while keeping shared spacing, type, and panels consistent.
- Push explanations behind "Learn more", tabs, or lower page sections so the app can feel useful before it feels described.

## Priority Fix
Remove the brochure shell from one protected core route first, preferably HQ or EasyList. The next task should replace the oversized hero, "Start Free", "See Features", and feature-chip row with a compact daily operating header: today's date/context, one clear next action, and 2-3 quiet module signals. Keep the existing visual tokens and calm cards, but make the first screen do work instead of introducing itself twice.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: visual restraint improved, but the active pack is still blocked by brochure-first route hierarchy.

## Designer Handoff
Keep the restrained teal, soft panels, improved spacing, and suite consistency. Change the page model. The next implementer should treat EasyLife as a signed-in personal assistant, not a product landing page: shrink the header, remove public CTA language from app routes, and stage each module around the first useful action. The user should feel, "I know what to do next," not, "I understand the feature list."

## What Not To Do Next
- Do not add more feature sections.
- Do not add another dashboard band to compensate for the weak first screen.
- Do not make the theme system louder.
- Do not introduce more marketing copy on protected app routes.
- Do not solve this with icons, gradients, or decorative polish.
- Do not touch backend, auth, packages, Firebase, deployment, or data behavior.
- Do not ignore mobile; mobile is where the brochure weight hurts most.

## Next 5 Design Tasks
- [ ] Remove public CTA language from one protected module route; keep one primary app action and verify no auth or routing behavior changes.
- [ ] Replace one module hero with a compact daily-use header showing today context, one next action, and no more than three status signals.
- [ ] Convert one feature-chip row into quieter state/action chips; guardrail: no new feature claims and no extra sections.
- [ ] Reduce repeated "Features" intro prominence on one route by moving explanation below the first useful working surface.
- [ ] Mobile pass on the repaired route: ensure the first viewport shows the primary action before long explanation or secondary content.

## Stop Or Continue
continue but fix visual issues first