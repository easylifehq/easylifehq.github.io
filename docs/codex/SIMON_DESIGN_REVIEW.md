# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is finally starting to look like one suite, but the current marketing surface still feels too boxed, too teal, and too pleased with its own pills.

## Mission Fit
The direction mostly matches the mission: connected, clean, professional, and safer than a scattered app pile. The shared header, consistent hero structure, product-specific previews, and calmer card language all support the "personal operating system" idea. The problem is that the system currently reads more like a polished template than a lived-in daily tool, especially on the public product pages.

## Taste Check
The strongest work is the restraint: typography is confident, copy is clearer, buttons are consistent, and the product previews now point toward real daily use instead of vague SaaS theater. The desktop rhythm is cleaner than before, and the suite identity is becoming legible.

What is off: the pale teal treatment is everywhere, the grid background is doing too much, the hero cards are huge on mobile, and the rounded pills still compete with actual actions. The page has taste, but it is still wearing too many matching accessories.

## Visual Problems To Fix
- Mobile first viewport still has too much dead air between the header and hero card, making every product page feel slower than it is.
- The mobile hero preview appears, but it arrives after a heavy stack of headline, paragraph, buttons, and oversized pills.
- Pale teal fills, pale teal borders, pale teal panels, and pale teal chips flatten hierarchy across the entire marketing system.
- The hero preview cards feel like stylized content blocks rather than crisp product UI glimpses.
- Desktop product pages still rely on large white boxed sections, which makes the page rhythm feel segmented instead of editorial and premium.
- The mobile header phrase "Products and demo below" is useful but blunt, and it reads more like a construction note than a polished navigation cue.
- Support tags are improved but still visually loud because their size and pill shape imply interaction importance.
- Feature cards on desktop are clean but generic; they need sharper density and a more intentional relationship to the product preview above.

## Strongest Opportunities
- Make the product previews feel more like real EasyLife surfaces: denser rows, stronger labels, fewer decorative capsules, and clearer daily-state hierarchy.
- Reduce the teal system to an accent, not a bath. Let white, ink, and spacing do more of the premium work.
- Tighten mobile hero stacking so users see the product preview sooner without losing the headline.
- Give each product page one distinctive visual behavior while keeping the shared shell, such as calendar time blocks, notes list rhythm, workout set rows, or task queue states.
- Turn the marketing pages from "same template, different noun" into "same suite, different daily job."

## Priority Fix
Fix mobile hero density and hierarchy next. At 390px, the header, hero copy, CTAs, support tags, and preview are all individually reasonable, but together they create a first viewport that feels inflated. Nami should reduce vertical padding, make support tags smaller and quieter, and pull the preview closer to the CTA area so the product utility shows before the user has to commit to a scroll.

## Designer Handoff
Keep the shared brand shell, strong type, and calm professional tone. Change the mobile hierarchy: header should be compact, hero should feel immediate, CTAs should remain obvious, and support tags should become secondary metadata rather than chunky badges. On desktop, reduce the "stacked white card" feeling by letting at least one section breathe against the grid background with tighter internal cards. The result should feel like a sharp personal operating system preview, not a tasteful brochure assembled from reusable rectangles.

## What Not To Do Next
- Do not add more marketing sections to compensate for hierarchy problems.
- Do not add new colors; the current palette needs discipline, not expansion.
- Do not make the previews more decorative or illustrative.
- Do not touch backend, routing, auth, persistence, deployment, or package scope.
- Do not ignore mobile because the desktop screenshots look acceptable.
- Do not keep enlarging pills, badges, and capsules as a substitute for real structure.
- Do not turn this into a full redesign; the current direction is viable, just over-padded and over-boxed.

## Next 5 Design Tasks
- [ ] Tighten one mobile product hero at 390px so the preview starts higher on the page; preserve copy meaning, tap targets, and existing routing.
- [ ] Reduce support-tag visual weight across the shared product hero pattern; keep tags readable but clearly secondary to CTAs.
- [ ] Refine one product preview so it looks more like an operational EasyLife surface with denser rows and clearer status hierarchy; use existing static content only.
- [ ] Remove or soften one pale-teal boxed treatment in a marketing section so hierarchy relies more on spacing, type, and contrast.
- [ ] Polish the mobile marketing header copy or spacing so it feels like intentional navigation, not an implementation note; preserve existing links and behavior.

## Stop Or Continue
continue but fix visual issues first