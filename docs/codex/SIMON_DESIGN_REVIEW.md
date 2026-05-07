# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is cleaner and more coherent than before, but it still wears too much demo-site armor for a product that wants to feel like a calm personal operating system.

## Mission Fit
The direction broadly matches the mission: the teal, graphite, soft grid, shared card language, and simplified Today/Capture/Plan/Notes shell are moving EasyLife toward one connected suite instead of scattered apps. The problem is priority. The screenshots mostly prove marketing/product pages and Settings, not the signed-in Today assistant surface, so the most important mission promise remains under-evidenced. Stage 0 is supposed to prepare the assistant rebuild, and the current branch has improved the shell, but it has not yet visually proven the one daily start point.

## Taste Check
The strongest taste move is restraint: the palette is quiet, the typography is confident, and the product pages now feel less like random SaaS confetti. The large editorial headlines have presence, and the status-preview cards give the suite a recognizable system language.

What is off: every product page is using the same big hero-card formula so aggressively that EasyList, EasyCalendar, EasyNotes, and EasyWorkout start to feel like themed brochures, not distinct tools inside a living personal OS. The mobile scale is also too heavy in places: massive type, pill stacks, oversized cards, and chunky buttons make the interface feel padded rather than fast. Chic, yes. Efficient, not yet. The app wants to help you move; right now it sometimes asks you to admire the furniture.

## Visual Problems To Fix
- The root desktop header repeats "Products" twice, once as a nav item and again as a prominent button. That is route chrome competing with itself, and it makes the first screen feel less disciplined.
- Product pages use nearly identical hero structure, chip rows, right-side preview cards, and feature bands, which weakens product identity across EasyList, EasyCalendar, EasyNotes, and EasyWorkout.
- The mobile product pages stack huge headline, large body copy, large CTA, chips, and preview card before the user gets to useful product comparison, creating a slow first screen.
- Settings mobile has a clean shell but the nav targets are visibly cramped by the QA report: Today, Capture, Plan, and Notes are 32px high on mobile, below comfortable touch size.
- Settings mobile repeats heavy panel framing: header card, setup card, signed-in card, theme card, opens-to card, section card, appearance card. The page feels like cards all the way down.
- The background grid is pleasant, but across many pages it starts reading as a decorative wallpaper instead of a functional product surface.
- The public/product pages still lean on broad marketing phrasing like "clean workspace" and "built around daily use" while the mission asks for a concrete daily assistant.
- Latest visual evidence does not include a clear signed-in HQ/Today screenshot, so confidence is lower on the most important first-screen contract.
- The More/header work appears directionally better, but the customer-facing route still has loud route controls and duplicate product navigation that should be quieter.

## Strongest Opportunities
- Make Today the visual proof point: one next action, one capture affordance, compact context, and module status below it.
- Reduce the public product chrome so the hero can breathe without duplicated navigation or explanatory clutter.
- Give each module one distinctive preview behavior instead of the same card-and-row demo pattern everywhere.
- Tighten mobile scale: smaller hero type, fewer visible chips, more compact CTA grouping, and 44px minimum touch targets.
- Turn Settings into a proper control center with grouped rows and progressive disclosure instead of stacked billboard cards.
- Use the suite shell as the brand system, not repeated marketing sections.

## Priority Fix
Fix the shell and first-screen proof before adding any new product polish: capture a current signed-in Today/HQ screenshot and reduce the visible chrome around the primary daily action so the first viewport reads as "here is what to do next today," not "here is a suite tour." Nami should turn this into one narrow task: inspect `/app/hq` and `/settings` mobile, enlarge primary nav tap targets to at least 44px, remove one duplicated navigation/control label, and keep the daily action visually dominant.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: AI Personal Assistant Stage 0 - Salvage Audit; REASON: shell consistency improved, but the assistant-first surface is still not visually proven.

## Designer Handoff
Keep the quiet graphite-and-teal system, the soft tactile panels, and the plainspoken product tone. Change the hierarchy: make the app shell feel like the product, not a wrapper around product pages. On public pages, reduce duplicate navigation and stop repeating the same hero template so each product has one clear role. On app pages, use progressive disclosure: first show today, then capture, then status, then details. The user should feel "I can act now," not "I have entered a beautifully padded brochure."

## What Not To Do Next
- Do not add more landing sections or feature cards.
- Do not create another dashboard surface.
- Do not add AI promises, assistant theatrics, or fake intelligence claims.
- Do not solve this with more chips, badges, or tiny labels.
- Do not broaden into backend, auth, routing, package, or data changes.
- Do not ignore mobile tap targets because the desktop looks tidy.
- Do not make every module share the exact same preview composition.

## Next 5 Design Tasks
- [ ] Inspect `/app/hq` desktop and mobile, then remove or hide one non-primary first-screen block so Today shows one next action before module inventory; do not change routes, data, auth, or backend.
- [ ] Increase app shell nav tap targets on mobile and desktop to at least 44px high while preserving the Today, Capture, Plan, Notes, More labels; do not add new navigation items.
- [ ] On the root/product marketing header, remove the duplicated "Products" competition by making only one Products affordance visually primary; do not change routing behavior.
- [ ] Tighten mobile product hero scale by reducing visible chip clutter above the fold on one product page; keep the primary CTA and one product preview visible.
- [ ] Refactor one Settings mobile section from stacked card blocks into a quieter grouped control layout; keep existing settings and copy, and do not touch auth logic.

## Stop Or Continue
continue but fix visual issues first