# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife now has a cleaner shared skin, but the main visible routes still behave like product brochures when the mission needs a daily operating surface.

## Mission Fit
The direction partially matches the mission: the typography, spacing, teal system color, card language, and shared header are starting to make EasyLife feel like one suite. The problem is that Pack 1 is Product Spine, and these screenshots show module marketing pages first: big pitch headline, "Start Free", "See Features", pill claims, then feature cards. That explains the product, but it does not help a signed-in user decide what to do next today. The mission is a calm personal operating system, not a tasteful pamphlet about one.

## Taste Check
The restraint is improving. The off-white grid, dark type, teal accent, and consistent preview panels feel more adult than earlier generic SaaS work. The module pages share a recognizable system, which is good.

What is off: the hierarchy is too loud for an operating product. The H1s are enormous, the first viewport is dominated by sales copy, and every module repeats the same hero-card-plus-feature-section formula. The result is polished but oddly hollow: nice suit, no appointment book. Mobile is readable, but the top screen is still heavy and promotional before it is useful.

## Visual Problems To Fix
- The customer/demo route chrome repeats the same product identity on every module: EasyLifeHQ header, module eyebrow, large pitch headline, CTA buttons, tags, and feature intro. It makes each route feel wrapped in marketing instead of opening into the product.
- The repeated "Start Free" and "See Features" actions compete with the module previews and imply public marketing pages, not a signed-in personal operating system.
- The first viewport on Calendar, List, Notes, and Workout is too similar structurally: giant headline left, pale demo card right or below, then "Features." This consistency is neat, but it flattens product identity across different jobs.
- Mobile pages spend too much vertical space on explanatory headline and intro copy before the user sees anything actionable. The preview arrives, but only after the sales pitch has taken the room.
- The background grid is quiet enough, but paired with stacked white cards it still reads like a designed web template instead of a lived-in app surface.
- Feature sections arrive too early and too loudly. "Features" as a label is internal product framing, not daily-life navigation.
- The module preview cards are the best product evidence on the page, but they are visually secondary to the copy. That is backwards for this mission.
- Some pill tags are useful, but several read like feature inventory chips. They add noise without creating a real decision path.

## Strongest Opportunities
- Make the protected HQ and module first screens start from today's action state: one next task, one calendar signal, one note capture, one workout state, then quiet module navigation.
- Promote the live-looking product preview above the marketing explanation. The user should see the thing working before being told why it matters.
- Replace repeated public CTA language with app-native actions: "Add task", "Capture note", "Plan next block", "Start workout", "Review today."
- Give each module a more specific visual rhythm while preserving the shared shell: Calendar can feel grid/time based, Notes can feel writing-first, List can feel triage-first, Workout can feel session-first.
- Reduce hero type scale by one full tier on app routes. Let the product state, not the headline, carry the authority.
- Keep the teal, soft panel borders, strong dark type, and calm density. Those are the pieces with actual taste.

## Priority Fix
Stop opening core module routes with marketing hero structure. Convert one primary route, ideally HQ or EasyList, into an app-native daily start surface: compact header, today's context, one primary next action, and a product-state panel visible immediately. Remove or demote "Start Free", "See Features", "Features", and pitch tags on signed-in/demo app surfaces. Nami should treat this as chrome reduction and hierarchy repair, not a new feature build.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: shared visual restraint improved, but the active pack still needs a real daily product spine instead of repeated brochure pages.

## Designer Handoff
Next batch should subtract. Keep the shared shell, teal accent, calm background, sturdy typography, and compact product preview style. Change the route hierarchy so the first screen feels like opening EasyLife for today: one immediate action, a few status signals, and quieter module movement. Marketing language should move down-page or disappear from protected/demo app surfaces. The user should feel, "I know what to do next," not "I am being introduced to a feature set."

## What Not To Do Next
- Do not add more feature sections to make the pages feel complete.
- Do not add more pills, badges, or explanatory cards; the page already explains itself too much.
- Do not chase a new visual theme before fixing the app-vs-brochure hierarchy.
- Do not make a larger dashboard full of every module at once.
- Do not touch backend, auth, routing logic, package files, or data behavior to solve a visual hierarchy problem.
- Do not ignore mobile; the current mobile stack is readable but too slow to become useful.

## Next 5 Design Tasks
- [ ] On one protected/demo app route, replace public CTAs with app-native actions only; keep behavior unchanged and do not add new routes.
- [ ] Reduce the first-screen H1 scale on module routes by one tier; verify desktop and mobile still preserve clear module identity.
- [ ] Promote the product-state preview above feature inventory on mobile; keep only one primary action visible before secondary content.
- [ ] Rename or demote the "Features" band on one module route to a quieter app-native section; avoid adding new sections.
- [ ] Remove one row of repeated feature pills from a module first screen; preserve the strongest two or three only if they support action.

## Stop Or Continue
continue but fix visual issues first