# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is finally developing a recognizable suite language, but it still wears too much presentation chrome for a product that promises calm daily action.

## Mission Fit
The direction partially matches the mission: the shared palette, tactile panels, and consistent navigation make the suite feel more connected than before. The problem is hierarchy. The public product pages are polished but oversized, while the working app still does not prove the first-screen contract strongly enough: one daily next action, today context, and compact module status. Right now the branch feels like it is refining the brochure and shell while still auditioning for the actual assistant surface.

## Taste Check
The soft notebook visual system is a good base: pale grid, deep green action color, heavy editorial type, and restrained cards give EasyLife a more memorable identity than generic SaaS gray soup. The product pages have conviction and some pleasant tactile detail.

What is off: the typography is often too loud for a productivity assistant, especially on mobile where headings become theatrical billboards. The repeated white card sections make every route feel like a pitch deck page. Settings has useful restraint but the app nav is visually cramped and slightly broken on desktop, which is not premium; it is a tiny traffic jam in a very expensive-looking hallway.

## Visual Problems To Fix
- Settings desktop header has visible collision/cramping around the EL mark and Today navigation, making the primary app chrome feel unstable.
- Settings desktop and mobile nav targets are too small, especially Today, Capture, Plan, and Notes; this weakens the "solid on mobile" mission.
- Mobile product pages use hero-scale headlines inside a constrained page card, creating heavy vertical drag before the user reaches useful content.
- Customer-facing product routes repeat identity too many times: EasyLifeHQ in the header, product label in the hero, then another feature intro band. The real product story feels buried under page ceremony.
- The Products/Get Started/header chrome competes with the product demos on public routes instead of staying quiet.
- The pale grid background plus repeated white panels creates a wrapper-panel feeling across routes; it is cohesive, but it can make the app feel staged rather than actively useful.
- Feature cards repeat the same card rhythm across EasyList, EasyNotes, EasyCalendar, and EasyWorkout, which helps consistency but also makes the suite feel templated.
- Settings first screen is calmer than the product pages, but it still opens with account/theme/opening-screen metadata rather than an immediately useful control-center action.
- The latest visual evidence covers several routes, but the key protected Today/HQ assistant surface is not directly shown in the provided latest screenshot set, so confidence on the core mission surface is lower.

## Strongest Opportunities
- Make the protected Today/HQ screen the design anchor: one recommendation, one capture action, and three compact status signals above the fold.
- Reduce public product route chrome so the demo/product example owns the first viewport, not the surrounding explanation.
- Tighten mobile type scale: keep personality, but stop letting headlines consume the whole screen before any action appears.
- Turn Settings into a calm control center by foregrounding the current operating setup and hiding secondary explanation behind accordions.
- Use one shared app-shell navigation treatment across app routes with larger tap targets and quieter active state.
- Add more real product surface evidence in first view: small task rows, note previews, calendar blocks, and workout state should feel operational, not decorative.

## Priority Fix
Fix the app shell navigation sizing and hierarchy, starting with Settings. The top nav needs stable spacing, minimum 44px tap targets, no mark/text collision, and a quieter More treatment. This is the single most practical repair because it touches the connected-suite promise directly: if the shell feels cramped or unstable, the whole personal operating system feels less trustworthy.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: AI Personal Assistant Stage 0 - Salvage Audit; REASON: suite language is clearer, but the assistant-first surface and shell polish are still not fully proven.

## Designer Handoff
Next implementer should make a subtraction pass, not a decoration pass. Keep the soft notebook palette, deep green actions, tactile borders, and compact module language. Change the shell chrome: larger nav hit areas, cleaner spacing around the EL mark, quieter More/Product controls, and less repeated page identity. On mobile, reduce hero type and bring the first useful product signal higher. The user should feel, "I know where I am, I know what to do next, and the system is calm enough to trust."

## What Not To Do Next
- Do not add more sections to the product pages.
- Do not introduce a new visual theme or palette.
- Do not make the marketing pages more expressive before the app shell is stable.
- Do not add dashboards, prediction cards, or fake assistant intelligence.
- Do not hide the nav issue behind copy changes.
- Do not ignore mobile type scale; it is currently doing too much theater.
- Do not touch backend, auth, packages, deployment, or data behavior.

## Next 5 Design Tasks
- [ ] Increase app shell nav targets to at least 44px high on Settings desktop and mobile, preserving existing routes and labels.
- [ ] Fix the Settings desktop header collision around the EL mark and Today link without changing navigation behavior.
- [ ] Reduce mobile product hero headline scale by one step and verify the primary action remains visible without awkward wrapping.
- [ ] Remove one repeated identity/intro layer from a public product route while keeping the product name and primary CTA clear.
- [ ] Make the Settings first card more control-center-like by tightening metadata cards and keeping secondary explanation behind existing disclosure UI.

## Stop Or Continue
continue but fix visual issues first