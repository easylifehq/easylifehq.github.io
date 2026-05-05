# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
The branch is calmer and more coherent than before, but the screenshots still sell EasyLife like a polished brochure instead of proving it as a daily personal operating system.

## Mission Fit
The direction partially matches the EasyLife mission. The modules now share a restrained visual language, better spacing, and clearer product-specific copy, which supports the "one suite" goal. But the current visual evidence is mostly EasyList, EasyNotes, EasyCalendar, and EasyWorkout marketing-style route pages, not the protected Today/HQ spine where the user should immediately know what to do next. For Pack 1 - Product Spine, that is a problem. You cannot claim the spine is fixed while showing me ribs.

## Taste Check
The good: the palette is quiet, the typography has confidence, the cards are cleaner, and the example panels feel more tactile than generic SaaS mush. The copy is also more human than before: "Clear the annoying stuff" has an actual pulse.

The off: the routes still feel like landing pages with hero blocks, "Start Free" CTAs, feature sections, and product-pitch rhythm. That is acceptable for public marketing, but it is wrong evidence for the active mission if the goal is a signed-in daily operating surface. The repeated oversized hero formula across modules makes the suite feel consistent, yes, but consistently like a product tour rather than a working app.

## Visual Problems To Fix
- The latest screenshots do not show the protected HQ/Today first screen, so confidence is lower on the actual Pack 1 claim.
- EasyList, EasyNotes, EasyCalendar, and EasyWorkout all repeat the same large hero plus feature-section structure, which creates page identity repetition instead of proving distinct daily workflows.
- The top navigation and hero CTAs still read as public marketing chrome on routes that should demonstrate product utility.
- "Start Free" appears prominently on module pages, competing with the mission of a signed-in personal operating system.
- The first viewport is dominated by pitch hierarchy: giant headline, product explanation, pills, and sample panel before any real daily action.
- Mobile screenshots show improved comfort, but the hero stack consumes too much vertical space before the user reaches useful working content.
- The feature sections below the hero repeat the same card grid pattern, which makes modules feel templated instead of intentionally shaped around their job.
- The pale grid background is tasteful, but across every route it risks becoming a decorative house style rather than a functional system surface.
- The example cards look polished, but they are static proof points; they do not yet feel like the user's live today view.

## Strongest Opportunities
- Make HQ/Today the visual proof of Pack 1: one next action, today context, compact module status, and quiet route switching.
- Reduce module-page marketing chrome and let each route show the actual working surface earlier.
- Keep the shared visual system, but give each module a task-shaped first screen: list inbox, notes capture, calendar pressure, workout session state.
- Turn repeated hero cards into compact app headers where the user is already inside the product.
- Use progressive disclosure harder: feature explanations, secondary pills, and product claims can move below the fold or behind calmer affordances.
- Preserve the tactile panel language; it is the strongest current design asset.

## Priority Fix
Fix the product spine evidence next: the next design slice should expose and tighten the protected HQ/Today first viewport, not another module landing section. The first screen must show one daily next move, today's context, and compact status across modules before any broad product explanation, giant hero copy, or promotional CTA. Make it feel like the user opened their life dashboard, not a startup website wearing a nice sweater.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: visual polish and module consistency improved, but the visible evidence still leans marketing-route polish instead of proving the HQ daily operating spine.

## Designer Handoff
Keep the restrained palette, sturdy type, soft panels, and direct human copy. Change the hierarchy. The next implementer should make the protected Today/HQ route the center of gravity: compact shell, one strong daily action, a small context stack, and quiet module status. Public or module-intro language should step back. The result should feel like opening a calm assistant that already knows what matters today, not browsing four separate product pages with matching suits.

## What Not To Do Next
- Do not add more feature sections.
- Do not add a bigger dashboard grid to compensate for weak hierarchy.
- Do not keep polishing marketing CTAs while Pack 1 needs the signed-in spine.
- Do not introduce new backend, auth, AI, analytics, or integration claims.
- Do not make the mobile route taller with more explanatory copy.
- Do not solve consistency by making every module page structurally identical.
- Do not ignore the Joey RED gate; design progress is not permission to continue unattended past a security stop.

## Next 5 Design Tasks
- [ ] Capture a fresh HQ/Today desktop and 390px mobile screenshot; guardrail: no code changes, just evidence for the actual Pack 1 surface.
- [ ] Reduce HQ/Today first-screen chrome so one next action and today context read before module inventory; guardrail: no routing, auth, persistence, or new data shapes.
- [ ] Replace any prominent signed-in "Start Free" or marketing CTA treatment inside working-app routes with quiet app actions; guardrail: copy and styling only.
- [ ] Tighten one module route header from brochure hero toward working-app header; guardrail: one route only, preserve existing behavior.
- [ ] Move one secondary explanatory block below the first viewport or behind an existing action; guardrail: subtraction over new UI, no new sections.

## Stop Or Continue
continue but fix visual issues first