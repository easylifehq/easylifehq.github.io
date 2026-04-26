# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is getting calmer and more coherent, but the evidence still looks like polished product marketing before it looks like a signed-in personal operating system.

## Mission Fit
The current direction supports the mission in tone: quiet, useful, low-pressure, and less scattered than earlier passes. The problem is proof. Pack 1 is Product Spine, and the latest screenshots mostly prove marketing consistency across EasyList, EasyNotes, EasyCalendar, and EasyWorkout, not the actual protected suite shell where a user should feel "this is my day, my apps, one system." Good taste is arriving, but the mission is not a brochure.

## Taste Check
The typography is confident, the copy is more grounded, and the restrained teal-white system feels more professional than generic neon SaaS. The best moments are the simple product promises: "Write first. Sort it out later." and "Start a workout and log without fighting the app." Those feel human.

What is off: the layout is getting repetitive. Each product page has the same big white hero card, the same pale preview panel, the same chip row, the same feature card rhythm. It is clean, yes, but also a little showroom furniture. Mobile hierarchy is especially heavy: giant type, large gaps, oversized preview cards, and too much first-viewport ceremony before the user sees enough product proof.

## Visual Problems To Fix
- Mobile has a large dead band between the header and hero card, making the first viewport feel padded instead of fast.
- The mobile preview panels use oversized headings and row text, so the proof surfaces feel inflated and push real content too far down.
- The product pages are visually too similar across apps; the suite feels consistent, but each module lacks a distinct functional signature.
- The pale grid background plus white card plus pale teal preview panel is becoming a one-note visual system.
- Chip rows are still too prominent in several mobile views, competing with primary actions instead of acting as quiet metadata.
- Desktop hero cards are clean but over-contained; the repeated framed-card pattern makes the pages feel less tactile and more template-driven.
- The latest screenshots do not include the protected HQ or signed-in shell, so confidence is lower on whether Pack 1 is actually solved.
- The header CTA language on mobile, "Products + demo", is serviceable but not elegant; it reads like navigation plumbing.

## Strongest Opportunities
- Make the signed-in HQ the visual proof point: daily focus first, compact module status second, navigation spine always obvious.
- Give each app one distinct product artifact: calendar grid density, note list/editor feel, task stack state, workout logging flow, instead of the same preview-card pattern everywhere.
- Tighten mobile vertical rhythm so the first viewport shows brand, promise, primary action, and meaningful proof without theatrical scrolling.
- Reduce chip styling into quieter inline metadata where the chips are not acting as real controls.
- Introduce a more mature neutral contrast layer so the palette does not live entirely in pale mint, teal, and white.
- Let screenshots and QA target protected app routes next; marketing has had enough champagne.

## Priority Fix
Fix the mobile first-viewport hierarchy across the product pages and protected HQ evidence path. Reduce the top dead space, shrink preview-card typography, quiet the chip rows, and make sure the first mobile screen shows the page promise plus one real proof surface without needing a long scroll. This is the most direct way to make EasyLife feel fast, useful, and like one operating system instead of a set of nice posters.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: calmer suite consistency and workflow polish improved, but Pack 1 still needs stronger signed-in product-spine proof.

## Designer Handoff
Next batch should stay narrow and visual. Keep the calmer typography, direct language, and restrained controls. Change the density: fewer loud chips, tighter mobile spacing, smaller preview-panel type, and more compact proof rows. Do not add new sections. The user should feel that EasyLife opens quickly into useful daily structure, not that they are scrolling through a product tour before the product starts.

## What Not To Do Next
- Do not add more marketing sections to compensate for weak product proof.
- Do not introduce another decorative card style or louder gradient treatment.
- Do not expand into backend, AI calls, auth, analytics, integrations, or data model work.
- Do not keep polishing only marketing pages while Pack 1 asks for the signed-in suite spine.
- Do not ignore mobile density; that is where the current design starts sweating.
- Do not make every module preview use the exact same layout forever.

## Next 5 Design Tasks
- [ ] Tighten mobile hero spacing on one product page by reducing top dead air and preview padding only; do not add content, sections, routes, or behavior.
- [ ] Reduce mobile preview-card heading and row text scale on EasyList or EasyNotes so proof content fits earlier; preserve existing copy and layout order.
- [ ] Convert one non-interactive chip row into quieter inline metadata on a protected app screen; do not change functionality or data.
- [ ] Capture or inspect protected HQ mobile and desktop screenshots, then make one small hierarchy-only adjustment if daily focus is not visible first.
- [ ] Add one distinct visual proof treatment to a single module preview using existing content only; avoid new palette, new assets, or broad component rewrites.

## Stop Or Continue
continue but fix visual issues first