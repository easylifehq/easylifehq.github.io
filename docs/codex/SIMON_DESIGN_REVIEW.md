# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife now has a calmer visual language, but it is still walking into the room wearing a product brochure costume when the mission asks for a daily operating system.

## Mission Fit
The shared palette, rounded panels, restrained teal, and repeated module structure support the "connected suite" mission better than before. But the active work pack is Product Spine, and the current screenshots still lead with public-product page framing: big marketing headlines, "Start Free", "See Features", feature sections, and demo cards. That does not satisfy the protected first-screen contract: one daily next action, today context, and compact module status. The design direction is closer to one product family, but not yet one working personal assistant surface.

## Taste Check
The best part is the restraint: the soft grid background, quiet teal accent, consistent card treatment, and chunky confident type give the suite a recognizable house style. EasyList and EasyWorkout have some useful specificity in the copy and demo rows.

The weak part is hierarchy discipline. The pages all use the same brochure formula: eyebrow, giant headline, CTA pair, feature pills, demo card, then feature cards. It feels tidy, but too templated. The mobile pages are readable, but the type scale is heavy enough that everything becomes a proclamation. Calm software should not shout every module name like it just launched at a conference.

## Visual Problems To Fix
- The customer-facing module routes repeat page identity too often: header brand, module eyebrow, giant module hero, feature section intro, and demo preview all restate the same idea before the user reaches useful work.
- The desktop top area has too much empty vertical air between the header and hero, making the actual product feel pushed down and staged instead of immediately useful.
- The "Start Free" and "See Features" CTAs appear on every module page and compete with the product examples; for an operating-system mission, these should not dominate repeated route views.
- Mobile typography is legible but oversized; paragraphs and row labels become huge blocks, so the first viewport feels slower and more marketing-heavy than assistant-like.
- The demo cards show useful examples, but they are visually subordinate to the marketing hero instead of being the primary object of attention.
- Pills such as "Brain dumps", "Flexible planner", and "Archive history" add surface clutter without giving the user an action or state.
- The shared template makes EasyCalendar, EasyList, EasyNotes, and EasyWorkout feel related, but also interchangeable; each route needs one concrete working moment, not just a themed sales pitch.
- The top navigation is useful on desktop but still visually loud for repeated product routes; the route chrome is cleaner than before, but it continues to compete with the main demo.

## Strongest Opportunities
- Convert one route, preferably HQ or EasyList, from brochure-first to daily-action-first: one next action, compact status, then quieter module navigation.
- Make the preview cards feel like real working UI by giving them first-screen priority, tighter density, and clearer active state.
- Reduce the repeated CTA stack on internal or demo-like routes; keep "Start Free" for public landing moments, not every module surface.
- Establish a smaller mobile type scale for product surfaces so the app feels fast and practical, not poster-sized.
- Use progressive disclosure: feature details can sit below, behind tabs, or after the first working moment.
- Differentiate each module through task shape and interaction density rather than new colors or decorative sections.

## Priority Fix
Fix the brochure-first hierarchy on the primary app spine. Pick the main protected start surface or one core module and make the first viewport behave like a personal assistant: show today's context, one next action, and compact module status before any feature list, CTA pair, or explanatory marketing copy. Keep the shared visual system, but cut the repeated route chrome and let the working product surface become the hero.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: cleaner shared shell and calmer styling, but the branch still leads with repeated module brochures instead of a daily operating system.

## Designer Handoff
Keep the quiet teal system, tactile cards, soft grid, and consistent module rhythm. Change the hierarchy: the next batch should reduce marketing chrome, shrink mobile type, and promote actual working UI examples above feature explanation. The user should feel "I know what to do next today", not "I am reading four nicely behaved landing pages for apps that may eventually help me." Do not add more sections. Subtract, tighten, and make one screen feel operational.

## What Not To Do Next
- Do not add another feature band, explainer section, or marketing CTA block.
- Do not make new dashboard cards just to fill space; the first screen needs one clear job.
- Do not solve this with more color, gradients, icons, or theme variation.
- Do not keep repeating "Start Free" across every module route if the route is meant to prove the working product.
- Do not ignore mobile; the current mobile hierarchy is readable but too inflated.
- Do not touch backend, auth, routing architecture, packages, analytics, deployment, or product claims.

## Next 5 Design Tasks
- [ ] Reduce one core route's first viewport to one daily action, one compact context line, and one working preview; do not add new sections or new routes.
- [ ] Remove or quiet repeated "Start Free" and "See Features" CTA prominence on module routes; keep one clear primary action only where it serves the screen.
- [ ] Tighten mobile type scale and vertical spacing on module hero areas; preserve readability and avoid clipped or overlapping text.
- [ ] Replace one row of feature pills with a quieter disclosure pattern or remove it entirely; do not replace it with another decorative control.
- [ ] Promote the module preview card into the main visual focus on one page; keep copy shorter and make the preview look like usable app state, not a brochure prop.

## Stop Or Continue
continue but fix visual issues first