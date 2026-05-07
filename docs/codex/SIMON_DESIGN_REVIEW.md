# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
The pages are cleaner and more coherent, but EasyLife still presents as a polished product brochure for separate modules instead of a calm assistant workspace that helps me start today.

## Mission Fit
The visual system now feels more connected: shared headers, similar cards, consistent teal accents, and calmer spacing across EasyList, EasyNotes, EasyCalendar, and EasyWorkout. That supports the suite mission. The miss is strategic: the current visible screenshots are still module marketing pages with "Features" sections, product claims, and repeated "Open EasyLife" calls, while the mission asks for one personal operating system with a daily first action. It is better dressed, but it is still introducing the apps instead of running the day.

## Taste Check
The best parts are the restrained color palette, high-contrast type, quiet teal brand mark, and the practical little preview panels. The copy has moved away from generic SaaS fog and toward human daily-life language. Good.

What feels off: the hero cards are enormous, the same page formula repeats across every module, the background grid adds a faint product-demo costume, and the interface still looks like a portfolio case study for EasyLife modules. The hierarchy is loud where it should be useful. A personal assistant should not make me walk through a showroom before I can do one thing.

## Visual Problems To Fix
- The customer-facing module pages repeat the same structure too aggressively: logo header, large hero, "Open EasyLife", chips, preview card, then "Features". It creates page sameness instead of product clarity.
- The first viewport is dominated by marketing claims and module identity, not a daily action, today context, or compact cross-module status.
- The desktop pages have a huge empty band between the top nav and the hero card, making the product feel staged instead of immediately useful.
- The mobile screenshots stack oversized hero text, large body copy, CTA, chips, and preview content into a long first-screen lecture before any actual app workflow appears.
- "Open EasyLife" appears as the primary CTA on every module page, but it does not explain the user's next useful action. It is a doorbell, not assistance.
- The feature chips compete visually with the CTA on mobile; they read like secondary navigation but behave like badges.
- The pale grid background is tidy but unnecessary. It adds a faint template smell and makes the pages feel more like a concept board than a lived-in personal operating system.
- Product pages are calmer than before, but they still separate EasyLife into EasyList, EasyNotes, EasyCalendar, and EasyWorkout as primary mental models. That conflicts with the one-assistant direction.
- The latest visual report says no blocking visual bugs, but design quality still has a staging problem: no broken pixels, wrong theater.

## Strongest Opportunities
- Replace the module-first public page formula with one suite-first daily start narrative: Today, Inbox, Plan, Notes, More.
- Make the protected HQ first screen the design north star, then let marketing pages preview that system instead of selling each module separately.
- Turn the right-side preview cards into actual daily assistant snapshots: next action, time block, capture queue, recent note, workout readiness.
- Reduce the first viewport chrome: smaller hero type, less vertical ceremony, fewer chips, and one clearer primary action.
- Use module pages as proof points, not separate mini-products. Each page should show how that capability flows back into Today.

## Priority Fix
Fix the first-screen hierarchy before adding anything else. The next design task should reduce the marketing-shell weight on the visible product pages and reframe the first viewport around "what do I do next today" with one primary action and compact connected status. Keep the shared visual system, but stop letting every route introduce itself like a keynote slide.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: AI Personal Assistant Stage 0 - Salvage Audit; REASON: visual consistency improved, but the active assistant direction is still not visible enough in the product surface.

## Designer Handoff
Keep the restrained teal, strong type, soft panels, and practical preview language. Change the page hierarchy: make EasyLife feel like one assistant first, and make individual modules subordinate to the daily flow. On desktop, tighten the top spacing and make the first viewport feel active, not promotional. On mobile, reduce hero copy and chip noise so the user sees one next action and one useful preview without scrolling through a brochure. The result should feel like opening a calm personal command surface, not touring four nicely behaved landing pages.

## What Not To Do Next
- Do not add more feature sections.
- Do not add more module chips or badges.
- Do not make the pages more "premium" with gradients, glow, decorative motion, or larger cards.
- Do not build a bigger dashboard dump to solve the assistant problem.
- Do not touch backend, auth, Firebase, packages, deployment, or data scope.
- Do not ignore mobile; the current mobile first screen is where the hierarchy problem is most obvious.
- Do not keep polishing each module page in isolation while the one-assistant spine remains unresolved.

## Next 5 Design Tasks
- [ ] Tighten the module marketing first viewport by reducing the top blank band and hero height; guardrail: no new sections, no routing changes, no backend or auth files.
- [ ] Replace the repeated "Open EasyLife" CTA on one visible page with a more specific daily action label; guardrail: copy-only change, preserve existing link behavior.
- [ ] Convert one module preview panel into a connected assistant snapshot that references Today plus one related module; guardrail: static UI/copy only, no data model changes.
- [ ] Reduce mobile chip prominence on one product page so chips read as quiet metadata, not competing controls; guardrail: CSS or class-level polish only.
- [ ] Add one small suite-level bridge in the product page copy explaining how the module feeds the daily assistant flow; guardrail: one page only, no broad rewrite.

## Stop Or Continue
continue but fix visual issues first