# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is getting calmer and more coherent, but the current branch still feels more like a polished product catalog than a signed-in personal assistant that knows what I should do next.

## Mission Fit
The direction matches the EasyLife mission in tone: shared navigation, calmer language, consistent cards, and a clearer Today/Capture/Plan/Notes model are all moving toward one connected personal operating system. The miss is hierarchy. The reviewed screens still spend too much first-screen energy explaining modules instead of proving the daily assistant flow. Stage 0 is supposed to salvage and clarify the assistant direction; right now it clarifies the brochure better than the working cockpit.

## Taste Check
The best parts: the soft paper surface, graphite text, teal accent, and restrained panels feel more mature than generic SaaS blue-on-white. The cards have a pleasant tactile quality, and the copy is less corporate than before.

The weak parts: the page system is too templated. EasyList, EasyCalendar, EasyNotes, and EasyWorkout all use nearly the same hero-card-plus-feature-card composition, so the suite feels consistent but not yet alive. Mobile type is oversized and scroll-hungry. Desktop has a weird amount of ceremonial white space before the hero. The whole thing has taste, but it is still wearing a very expensive training-wheel layout.

## Visual Problems To Fix
- Desktop product pages have a large dead band between the header and the hero card, delaying the actual page content for no useful reason.
- The root page repeats "Products" in both the main nav and the right-side action cluster, making the header feel undecided.
- Product pages repeat identity in the header and hero eyebrow: "Daily Workspace EasyLifeHQ" followed by "EASYLIFEHQ" or the module name. This is not catastrophic, but it is duplicated page identity and should be quieter.
- The customer-facing product pages still bury the real app promise inside framed panels and feature blocks instead of showing a more immediate working surface.
- Settings desktop navigation is visually cramped: the brand mark and nav row feel squeezed, and the visual report confirms small tap targets.
- Settings mobile nav is large but still reports small tap targets on Today, Capture, Plan, and Notes; that is an interaction polish failure on the suite shell.
- Mobile product pages are too vertically inflated: huge body copy, tall buttons, and pill rows consume the first screen before the user sees enough proof.
- The preview panels on product pages are useful, but they all share the same pale card treatment, so module personality is flattened.
- Feature sections arrive too loudly and too soon. They read like marketing inventory when the mission wants progressive disclosure and daily utility.

## Strongest Opportunities
- Make the signed-in HQ or command cockpit the visual proof source: one next action, one command input, compact Today/Inbox/Plan/Memory state, then quieter module links.
- Reduce route chrome across product and app surfaces so the actual working screen has priority over wrappers, labels, and explanatory bands.
- Tighten the app header into a reliable shell with 44px minimum targets and fewer competing labels.
- Give each module one distinct functional preview pattern instead of recycling the same card list: timeline for Plan, intake stack for Capture, memory snippets for Notes, compact session logger for Workout.
- On mobile, cut hero copy by 25-35 percent and let the preview surface appear earlier.

## Priority Fix
Fix the suite shell and first-screen hierarchy before adding any new sections. The next batch should make navigation quieter, targets larger, and the first signed-in surface more obviously assistant-led: one daily action, one command/capture affordance, compact module status, and no repeated product identity. Nami should treat this as a chrome reduction task, not a new feature task.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: AI Personal Assistant Stage 0 - Salvage Audit; REASON: suite tone and assistant language improved, but shell hierarchy and first-screen assistant proof are still not strong enough.

## Designer Handoff
Keep the restrained paper-and-teal visual system, the blunt life-management copy, and the connected Today/Capture/Plan/Notes model. Change the hierarchy: strip duplicated labels, reduce header noise, enforce proper tap targets, and move feature inventory lower. The user should feel like they opened a calm daily assistant, not a well-dressed directory of apps. On mobile, make the first screen useful faster: fewer words, earlier preview, quieter chips.

## What Not To Do Next
- Do not add more marketing sections to prove the product.
- Do not add new modules, new routes, or bigger dashboards.
- Do not make the command center more theatrical with fake AI claims.
- Do not ignore the settings nav tap-target findings because they look "minor."
- Do not keep cloning the same hero and feature-card layout across every module.
- Do not change backend, auth, persistence, packages, deployment, or anything outside the visual/frontend scope.

## Next 5 Design Tasks
- [ ] Fix the app header tap targets to meet at least 44px height on desktop and mobile, without changing routing or adding new nav items.
- [ ] Remove duplicated "Products" header treatment on the root marketing page, keeping one clear path to product exploration and one primary app CTA.
- [ ] Tighten desktop top spacing above product hero cards by one small CSS/layout pass, with no new sections and no typography scale increase.
- [ ] Reduce mobile hero copy and chip crowding on one product page, making the preview panel visible earlier without removing the primary CTA.
- [ ] Give one module preview a more specific functional layout, such as a real day timeline for Calendar or intake stack for EasyList, while preserving the shared visual system.

## Stop Or Continue
continue but fix visual issues first