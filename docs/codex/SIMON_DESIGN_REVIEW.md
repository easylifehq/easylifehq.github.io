# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is cleaner than before, but the current evidence still looks like a polished module brochure instead of a working personal operating system.

## Mission Fit
The direction partially fits the mission: the palette, spacing, and shared card language are starting to make EasyList, EasyNotes, and EasyCalendar feel related. The miss is Pack 1: the screenshots do not prove a daily spine where the signed-in user immediately knows what to do today. They show product explanation pages with "Start Free", "See Features", feature cards, and route chrome, which is public-site behavior, not protected daily-assistant behavior.

## Taste Check
The good: the teal accent is restrained, the typography has confidence, the cards are tidy, and the module preview panels are calm enough to feel trustworthy. The mobile EasyList screen has decent breathing room and avoids obvious breakage.

The bad: the whole thing still smells like a SaaS landing page that got dressed in productivity clothes. Big headlines, feature sections, chips, and CTA pairs dominate before the product does any work. The layout is handsome but too explanatory, which is exactly how a personal assistant app becomes a brochure with a calendar addiction.

## Visual Problems To Fix
- The top EasyLifeHQ nav repeats product identity while each module hero repeats another identity band, creating stacked page chrome instead of one clear app surface.
- "Start Free" and "See Features" appear on module routes, which makes signed-in/product-demo surfaces feel like marketing pages instead of working tools.
- The first viewport is consumed by hero copy and feature positioning; the user's next daily action is not the dominant object.
- The module preview panels look useful but are presented as proof points beside marketing copy, not as the primary interactive workspace.
- Feature cards appear too early and too large, pushing the product's actual daily workflow below the fold.
- Mobile EasyList is visually stable, but it becomes a vertical pitch deck: headline, paragraph, CTAs, chips, preview, then features.
- The grid background and repeated white panels are clean but flatten hierarchy; too many surfaces have the same visual weight.
- The route navigation is useful but too loud for the current mission because it competes with the main demo instead of quietly supporting it.
- Screenshots are missing for the protected HQ daily start after the latest school-planner changes, so confidence is lower on whether Pack 1 actually improved.

## Strongest Opportunities
- Turn the first screen into a real "Today" operating surface: one next action, current context, and compact module status before any product explanation.
- Demote marketing CTAs on working routes to quiet secondary actions or remove them from signed-in surfaces entirely.
- Make module previews feel clickable and operational: task rows, note rows, calendar blocks, and study load should look like the app, not sample content in a sales card.
- Create one shared route shell with quieter identity, then let each module own the content area instead of repeating brand theater.
- Use progressive disclosure: features, workflow explanation, and product claims can live below, behind tabs, or on public pages.

## Priority Fix
Reduce chrome and marketing framing on the working/product-demo routes. Keep the shared EasyLifeHQ shell, but remove or quiet the "Start Free" / "See Features" CTA pair, oversized feature-intro structure, and repeated identity bands on module pages. The first viewport should show a useful daily or module action state first, with explanation secondary. Nami should treat this as subtraction and hierarchy repair, not as permission to add another dashboard strip.

## Magic Improvement Score
SCORE: 2; DIRECTION: flat; ACTIVE_PACK: Pack 1 - Product Spine; REASON: visual polish is cleaner, but the screenshots still show module marketing pages instead of the daily operating spine.

## Designer Handoff
Next batch should make EasyLife feel less like a public pitch and more like a tool someone has already chosen. Keep the calm teal system, strong typography, soft panels, and compact row language. Change the first-screen hierarchy: one primary daily/module action at the top, compact status rows beside or below it, and quiet navigation. Remove sales CTAs from working routes, push feature explanation down, and make the preview components feel like the real product surface. The user should feel, "I know what to handle next," not "I have been invited to learn about features."

## What Not To Do Next
- Do not add more sections below the existing feature blocks.
- Do not add another school, inbox, or planning widget until the first-screen hierarchy is corrected.
- Do not make the route nav bigger, stickier, or more decorative.
- Do not solve this with more accent colors, badges, shadows, or gradient treatment.
- Do not touch backend, auth, Firebase, packages, deployment, or data models.
- Do not ignore mobile; the current mobile surface is stable but too brochure-like.

## Next 5 Design Tasks
- [ ] Remove or demote "Start Free" and "See Features" from one working module route; guardrail: no routing, auth, or behavior changes.
- [ ] Convert one module hero preview into the primary visible work surface above the fold; guardrail: reuse existing mock/local content only.
- [ ] Reduce repeated EasyLifeHQ/module identity chrome on one route; guardrail: keep navigation available but visually quieter.
- [ ] Move one early feature-card section below the primary workflow content; guardrail: do not add new sections or copy volume.
- [ ] Capture and review the protected HQ desktop and mobile first screen after the change; guardrail: verify one next action is visible before feature explanation.

## Stop Or Continue
continue but fix visual issues first