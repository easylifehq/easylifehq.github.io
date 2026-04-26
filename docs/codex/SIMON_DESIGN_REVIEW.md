# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is finally starting to look like one calm product, but the mobile marketing pages still shout every panel like it is the main character.

## Mission Fit
The current direction fits Pack 1 - Product Spine: shared header, restrained palette, consistent product hero structure, and app-specific preview cues are moving EasyLife toward a connected personal operating system. The issue is hierarchy, not intent. The pages now relate to each other, but they still feel too much like a template system wearing different labels instead of a suite with confident product rhythm.

## Taste Check
The best parts are the quiet mint-gray atmosphere, the clearer product naming, the compact preview rows, and the move away from chaotic feature-card grids. It feels calmer and more professional than earlier passes.

What is still off: the mobile hero cards are huge, the preview modules compete with the headline, and the same pill/card language appears everywhere until the page starts to feel processed. The desktop layouts are cleaner, but still too evenly weighted. Premium products know what to whisper. This one is still politely yelling.

## Visual Problems To Fix
- Mobile product pages have too much vertical dead space above the hero, making the first viewport feel padded before it feels useful.
- Hero headlines, body copy, buttons, tags, and preview panels all carry high visual weight on mobile, so the eye has no clear resting order.
- Preview cards on mobile read oversized, especially EasyList and EasyWorkout, where the preview title and row text feel closer to hero content than app UI.
- The repeated rounded pill language appears in the header CTA, tags, preview title bars, badges, and rows, creating visual sameness instead of hierarchy.
- Desktop lower sections still rely on evenly spaced cards too often, so the page lacks a strong editorial lead after the hero.
- The background grid is tasteful but a little too visible behind stacked white panels, which makes some screens feel like a design system demo instead of a working product.
- Product identity cues are improving, but previews still share the same structure too closely across apps.

## Strongest Opportunities
- Make mobile hero rhythm more disciplined: smaller preview text, tighter preview padding, and more separation between marketing copy and app-preview UI.
- Give each product preview one distinct visual behavior while keeping the same suite shell: task rows for EasyList, time blocks for EasyCalendar, note stack for EasyNotes, session log for EasyWorkout.
- Reduce pill repetition by using fewer badges and making only the most important tags visible above the fold.
- Turn one desktop lower section per product into a stronger lead-plus-detail composition, not three equal cards in a trench coat.
- Let the shared shell stay quiet while product previews carry the personality.

## Priority Fix
Fix the mobile first-viewport hierarchy across the product marketing pages. The next task should make the hero headline the clear primary read, the paragraph the secondary read, and the preview a compact supporting artifact. Reduce preview scale and badge density before touching copy or adding anything new.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: suite consistency is stronger, but mobile hierarchy and repeated rounded-card language still keep the product spine from feeling premium.

## Designer Handoff
Keep the calm palette, shared header, product-specific hero structure, and the current low-pressure language. Change the mobile hierarchy: compress previews, reduce tag noise, tighten top spacing, and make the app mockups feel like working UI rather than second hero panels. Desktop should keep the confident two-column hero, but lower sections need one clear lead idea instead of equal-weight feature cards. The user should feel like EasyLife is organized, useful, and composed within three seconds, not like they are scrolling through a polished component catalog.

## What Not To Do Next
- Do not add more marketing sections to compensate for weak hierarchy.
- Do not introduce new colors, gradients, or decorative effects.
- Do not make every product preview unique by breaking the shared suite system.
- Do not touch routing, auth, Firebase, backend, package files, or app behavior.
- Do not ignore mobile just because desktop looks acceptable.
- Do not keep solving everything with more pills and cards.

## Next 5 Design Tasks
- [ ] Tighten the mobile top spacing on one product marketing page so the header-to-hero gap feels intentional, preserving tap targets and desktop layout.
- [ ] Reduce the mobile preview typography and row padding on EasyWorkout so the mock UI reads as compact logging software, not a second headline block.
- [ ] Remove or de-emphasize one nonessential tag row on a mobile product hero, keeping the product promise and primary CTA unchanged.
- [ ] Rework one remaining desktop lower feature section into a lead-plus-support layout using existing copy only, with no new sections or behavior.
- [ ] Audit one product preview for repeated pill overload and replace one pill-like element with quieter text or spacing, preserving suite consistency.

## Stop Or Continue
continue but fix visual issues first