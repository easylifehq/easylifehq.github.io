# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
The branch is calmer and more coherent, but it still dresses simple product pages in too much wrapper chrome and repeated identity furniture.

## Mission Fit
The direction supports Pack 1 - Product Spine: the marketing pages now feel more related, the palette is restrained, and the product previews explain daily use better than before. It is not yet a fully convincing personal operating system because the suite shell still competes with the actual module story, especially on mobile where the header, hero card, chips, and preview panel all arrive as separate layers instead of one confident product surface.

## Taste Check
The best parts are the quiet teal system, strong type contrast, tactile cards, and concrete daily-workflow copy like "See when your life is full" and "Write first. Sort it out later." EasyCalendar feels closest to premium because the preview content has a real job and the hierarchy is clean.

The weaker parts are the repeated module labels, pill clutter, heavy bordered containers, and a faint generic SaaS wrapper smell. The pages are trying to be calm, but sometimes they look like calm inside a shipping box. EasyList still exposes "EasyCalendar handoff," which reads like internal workflow language, not customer-facing product clarity.

## Visual Problems To Fix
- Mobile customer-facing routes still begin with a large rounded navigation slab before the product page starts; the actual module experience is pushed down and feels wrapped instead of immediate.
- Product identity repeats too many times: top brand, hero eyebrow, preview pill label, and sometimes feature section labeling all restate the same idea.
- The hero chip rows are visually loud on mobile; they create a secondary navigation-looking layer without enough payoff.
- Preview cards use the same pale green panel treatment across products, which helps consistency but also makes modules feel templated rather than distinct.
- EasyList mobile still has "EasyCalendar handoff" as a chip, which is clunky and builder-facing.
- Several mobile preview rows are tight: labels, values, and status pills compete in narrow white rows, especially EasyList and EasyNotes.
- Desktop pages have solid spacing, but the large white hero card inside a full page wrapper makes the route feel like a demo page rather than the product itself.
- Feature sections below the hero repeat the card-and-eyebrow formula, which risks making every page feel assembled from the same kit.

## Strongest Opportunities
- Make the mobile route shell quieter so the first viewport belongs to the product promise and preview, not navigation chrome.
- Reduce each product hero to one identity moment: either the eyebrow or the preview label, not both.
- Give each module preview a more specific shape: calendar should feel scheduled, notes should feel editorial, list should feel scannable, workout should feel fast and tap-first.
- Replace remaining internal words like "handoff" with user-visible outcomes such as "Send to calendar" or "Turn notes into tasks."
- Tighten mobile preview rows with simpler status treatment and fewer competing typographic weights.
- Let the signed-in product spine lead the next visual push; marketing polish is useful, but the mission is one connected operating system.

## Priority Fix
The single most important design problem is repeated route chrome on customer-facing product pages. On mobile, slim the top navigation and remove redundant product identity inside the hero/preview stack so the user sees one clean product story: product name, promise, action, and functional preview. Do not add sections. Subtract labels, quiet the chip row, and make the preview feel like the first real artifact.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: quieter previews and copy are better, but repeated route chrome and product-label pills still keep the spine from feeling fully resolved.

## Designer Handoff
Next implementer should treat this as a subtraction pass, not another polish pass. Keep the current typography, teal accent, clean cards, and concrete daily-life copy. Change the mobile hierarchy by reducing wrapper chrome, removing repeated product labels inside previews, and making chip rows less dominant. The result should feel like opening a useful product page, not walking through a nicely formatted product brochure.

## What Not To Do Next
- Do not add more marketing sections to solve a hierarchy problem.
- Do not introduce new colors, gradients, illustrations, or decorative texture.
- Do not make the cards rounder or softer; the issue is repetition, not insufficient friendliness.
- Do not touch backend, auth, data, routing behavior, packages, deployment, or integrations.
- Do not ignore mobile; the mobile first viewport is where the clutter is most expensive.
- Do not rename everything at once; fix the most visible repeated labels and internal phrases first.

## Next 5 Design Tasks
- [ ] Mobile product chrome trim: reduce the customer-facing mobile header height/visual weight while preserving all labels, routes, and 44px tap targets.
- [ ] Preview identity cleanup: remove one redundant product-name pill from each marketing preview where the hero eyebrow already names the product; do not add new content.
- [ ] EasyList copy cleanup: replace visible "handoff" language with concrete user-facing action language; keep meaning and avoid new feature claims.
- [ ] Mobile preview row tightening: adjust spacing and status pill scale inside one product preview so labels and values do not compete on 390px screens.
- [ ] Feature section restraint pass: reduce repeated eyebrow/card emphasis in one marketing feature section without changing layout structure or adding sections.

## Stop Or Continue
continue but fix visual issues first