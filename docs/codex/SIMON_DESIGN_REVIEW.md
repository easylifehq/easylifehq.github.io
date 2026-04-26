# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is finally speaking with one visual voice, but the voice still sounds like a careful template wearing too many rounded badges.

## Mission Fit
The current direction matches Pack 1 - Product Spine: the product marketing pages now feel related, the header is consistent, and the modules read as parts of one suite instead of random app pages. The mission is not fully met because the product spine still depends on repeated cards, pills, and preview panels rather than a more memorable operating-system hierarchy.

## Taste Check
The restraint is good: quiet color, strong type, readable product promises, and a calm grid background give the suite a more professional base. The best parts are the direct headlines and consistent module previews. The weak parts are the repeated pill language, oversized mobile preview typography, soft card-on-card composition, and feature sections that still look like "three SaaS cards, thank you, next." Premium products do not need this many little lozenges to prove they are organized.

## Visual Problems To Fix
- Mobile product pages still have too much vertical ceremony before the user reaches useful content: header, large hero card, CTA row, tag row, then preview.
- The hero previews use the same rounded capsule title treatment across products, making EasyList, EasyNotes, EasyCalendar, and EasyWorkout feel more interchangeable than distinct.
- Mobile preview headings are too large relative to the surrounding UI, especially EasyList and EasyNotes, so the preview competes with the main H1 instead of supporting it.
- Tag rows still read as decorative filler on several pages; they add height without adding much decision value.
- Desktop feature sections remain too equal-weight: three cards with similar density create a brochure rhythm instead of a clear product story.
- The soft green-tint panel language is consistent, but overused; the suite risks looking like one washed mint template instead of a set of purposeful tools.
- The header is cleaner on mobile, but the "Products + demo" pill is visually heavy and still steals attention from the first screen.
- There is limited visible connection between modules beyond naming; EasyCalendar and EasyList mention handoff, but the visual system does not yet show a true suite spine.

## Strongest Opportunities
- Make one product page establish a stronger lead-support hierarchy: H1 first, one crisp sentence, compact CTA, then a quieter product preview.
- Replace repeated feature-card rows with one lead feature plus two smaller supporting notes to create editorial hierarchy without adding sections.
- Give each product preview one distinctive structural cue: calendar time grid, note sheet, task queue, workout set log. Less pill, more product.
- Tighten mobile vertical rhythm by removing or demoting one badge/tag layer per page.
- Use shared spacing and typography, but vary preview internals enough that the suite feels connected, not cloned.
- Let Settings and signed-in surfaces borrow this calm system, but with denser operational hierarchy rather than marketing-card softness.

## Priority Fix
Fix the mobile hero-preview relationship on one product page first, preferably EasyNotes or EasyList. The H1 should own the first read, the description should stay compact, tags should be demoted or reduced, and the preview should look like a useful app surface rather than a second oversized hero inside the hero. Keep the shared shell, but reduce the stacked pill/card noise.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: suite consistency is clearer, but mobile hierarchy and repeated rounded-card language still cap the product spine.

## Designer Handoff
For the next batch, stay in Pack 1 and do one narrow visual repair, not a feature pass. Keep the calm palette, strong headlines, and shared header system. Change the mobile product composition so the top screen feels less inflated: reduce tag prominence, quiet the preview title treatment, and make the preview content feel like actual product UI. The user should feel "this is one polished personal operating system," not "I am scrolling through a component library audition."

## What Not To Do Next
- Do not add more sections to solve hierarchy; the pages already have enough structure.
- Do not introduce new colors or gradients to make modules feel different.
- Do not enlarge previews or cards on mobile.
- Do not start another broad signed-in mobile behavior task while visual hierarchy is still unresolved.
- Do not touch backend, auth, routing, persistence, package files, or deployment scope.
- Do not keep stacking pills, chips, badges, and capsules as the default design answer.
- Do not ignore mobile just because automated visual inspection found no blocking bugs.

## Next 5 Design Tasks
- [ ] On one product marketing page, reduce the mobile tag row to a quieter treatment or fewer visible items; preserve copy meaning, CTAs, links, and desktop layout.
- [ ] On EasyList or EasyNotes marketing, replace the capsule-style preview title with a more product-specific static UI cue; do not add behavior or new data.
- [ ] Rebalance one mobile hero preview so its heading is smaller than the main H1 and cannot compete above the fold.
- [ ] Convert one lower feature-card trio into a lead-plus-support layout using existing copy only; keep mobile readable and avoid adding sections.
- [ ] Audit the shared mobile marketing header CTA weight and make one small visual adjustment if it still overpowers the page title; preserve tap target and routing.

## Stop Or Continue
continue but fix visual issues first