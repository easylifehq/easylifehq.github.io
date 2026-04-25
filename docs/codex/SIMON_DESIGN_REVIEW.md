# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is finally speaking with one product voice, but the marketing pages still feel too inflated on mobile and too boxed-in on desktop to read as a truly polished personal operating system.

## Mission Fit
The direction matches the mission better than earlier batches: shared headers, product-specific hero previews, consistent CTAs, and repeated card language make the suite feel connected instead of random. The problem is not concept anymore. The problem is execution rhythm. EasyLife wants to feel fast and calm, but the current first viewport often feels like a very well-behaved brochure wearing platform shoes.

## Taste Check
The strongest work is the unified product shell: the logo block, teal action color, restrained typography, and static product previews are much more credible than generic SaaS decoration. The copy has personality, especially EasyList and EasyWorkout, and the preview rows now communicate daily utility.

What is off: mobile scale is still too large, support pills are visually heavy, the header cue truncates awkwardly, and the desktop pages rely too much on stacked white panels over the grid background. The suite looks cleaner, but not yet expensive. The grid background plus card-on-card repetition is doing a little too much "template launch page" theater.

## Visual Problems To Fix
- Mobile header text truncates as "Explore products and demo pa...", which looks unfinished and lowers trust immediately.
- Mobile first viewport still spends too much vertical space before the product preview, especially on EasyNotes and EasyWorkout.
- Hero H1s on mobile are oversized relative to the product cards, making the pages feel like billboards instead of fast product surfaces.
- Support pills are still too loud on mobile; they compete with the CTA row and add visual bulk.
- Desktop hero cards sit in large white panels over a visible grid, creating a boxed-layout feeling across every product page.
- Product preview cards use similar pale teal fills and rounded pill headers, which gives the suite cohesion but also flattens product identity.
- Feature cards below the hero are competent but generic; the repeated three-card rhythm feels more like a SaaS checklist than a personal OS.
- The desktop nav-to-hero spacing is improved, but the page still has a lot of air before the content earns it.

## Strongest Opportunities
- Make the mobile marketing header shorter and cleaner: brand on the left, one concise cue or action on the right, no truncation.
- Reduce mobile hero type and support-pill bulk so the preview becomes visible earlier without deleting the message.
- Give each product preview one distinctive structural detail: calendar time slots, notes list density, workout set rows, task triage states.
- Break the stacked-white-panel rhythm by letting some sections breathe directly on the page background with cleaner dividers instead of more cards.
- Use product-specific microcopy inside previews to make the suite feel operational, not decorative.
- Tighten desktop feature sections so they feel like proof points attached to the preview, not generic marketing modules.

## Priority Fix
Fix the mobile first viewport hierarchy across the shared product marketing shell. The next implementer should make the header cue non-truncating, reduce hero headline/support-pill scale at 390px, and pull the product preview higher so the user sees actual product utility before the page becomes a scroll workout. This is the single biggest blocker between "polished suite" and "nice landing template."

## Designer Handoff
Keep the unified EasyLife shell, the teal primary action, the direct product copy, and the idea of product-specific operational previews. Change the mobile rhythm: smaller H1, tighter hero padding, quieter pills, cleaner header cue, and earlier preview visibility. On desktop, stop adding more boxed sections and instead refine the existing sections with sharper hierarchy, lighter borders, and more product-specific preview details. The result should feel like opening a calm, connected personal operating system, not browsing five separate launch pages with matching outfits.

## What Not To Do Next
- Do not add more marketing sections to solve a hierarchy problem.
- Do not introduce new colors, gradients, blobs, illustrations, or decorative noise.
- Do not keep tuning one product page while leaving the shared mobile shell awkward.
- Do not expand backend, routing, auth, data, analytics, deployment, or package scope.
- Do not make the pages more "premium" by increasing whitespace; the current issue is already too much vertical ceremony.
- Do not ignore 390px mobile just because automated visual inspection found no blocking bugs.

## Next 5 Design Tasks
- [ ] Mobile header cue repair: replace or restyle the right-side mobile marketing cue so it never truncates at 390px; preserve existing routing and tap targets.
- [ ] Shared mobile hero scale pass: reduce product hero H1 size, line-height, and top/bottom padding at 390px only; do not change copy meaning or desktop layout.
- [ ] Support-pill quieting pass: make mobile hero support tags visually secondary to CTAs with smaller spacing and lighter emphasis; preserve readable tap-sized chips.
- [ ] Product preview lift pass: for one remaining product page, move the existing preview higher in the mobile first viewport without deleting hero content or adding sections.
- [ ] Desktop boxed-rhythm cleanup: convert one lower marketing section from a heavy card stack into a cleaner full-width content band or lighter grouped layout; no new content, no new colors.

## Stop Or Continue
continue but fix visual issues first