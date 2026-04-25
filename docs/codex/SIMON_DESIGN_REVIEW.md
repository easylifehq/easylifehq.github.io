# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is becoming calmer and more cohesive, but the public product pages still look too templated, too teal, and too pleased with their own cards.

## Mission Fit
The current direction mostly matches the mission: the pages now feel like they belong to one suite, the previews are more concrete, and the copy has a useful daily-life angle. The weak spot is that "connected personal operating system" is still expressed more as repeated marketing structure than as a system view. EasyList, EasyNotes, EasyCalendar, and EasyWorkout share the same shell, but they do not yet show enough relationship to each other beyond pills and occasional handoff language.

## Taste Check
The best work is the restrained typography, clean CTAs, improved mobile readability, and more specific working-UI preview rows. The product voice is sharper than generic SaaS sludge, especially EasyList and EasyNotes.

The weaker work is the visual sameness. Every page leans on the same white hero slab, pale teal preview panel, rounded pills, and boxed feature cards. It is polished enough to pass, but not yet memorable. The grid background plus repeated cards create a polite productivity template. Very tidy. Also slightly asleep.

## Visual Problems To Fix
- Mobile has too much empty vertical space between the header and the hero card before the product message begins.
- The mobile header right action, "Products + demo", is visually heavy and competes with the brand block.
- Product preview panels are still oversized on mobile, especially EasyList and EasyNotes, where preview headlines read like secondary hero copy instead of compact app UI.
- The pale teal treatment appears across logo, pills, preview panels, selected states, borders, and backgrounds, making the suite feel monochrome instead of premium.
- Desktop feature sections still rely on three equal cards with similar hierarchy, which makes the content feel interchangeable across products.
- Product heroes are consistent, but too consistent: the same composition across all apps reduces product identity.
- Several pill rows wrap awkwardly on mobile and consume too much first-viewport height for secondary information.
- The background grid is visible enough to add texture, but combined with card borders it makes the page feel busier than the calm system mission wants.
- Preview row labels and values are improved, but some rows still feel like static spec labels rather than live product moments.
- Lower sections start as another card/card/card rhythm, so the page does not build momentum after the hero.

## Strongest Opportunities
- Make each product preview use a distinct interaction metaphor: task queue for EasyList, note stack for EasyNotes, time-block rail for EasyCalendar, set logger for EasyWorkout.
- Reduce the teal dependency by using more neutral surfaces, darker text hierarchy, and accent only for state or action.
- Give mobile first viewport a stronger editorial rhythm: brand, product promise, CTA, then a tighter preview with less dead air.
- Turn one lower section per product into a lighter content band instead of another bordered card set.
- Add subtle cross-suite cues in previews, such as "sent to calendar", "drafted to list", or "today focus", without adding behavior.
- Make feature cards more specific and less equal-weight: one lead feature, two supporting points, tighter metadata.

## Priority Fix
Fix the mobile hero rhythm first. The pages are usable, but the first viewport still spends too much height on header gap, large copy, pill rows, and oversized preview typography before the user sees the product as a working tool. Nami should tune mobile spacing and preview scale so each page shows the promise and a credible app preview sooner, while keeping tap targets comfortable and without deleting content.

## Designer Handoff
Keep the calm shell, strong headlines, and straightforward CTA pattern. Change the product preview treatment so it feels like compact software, not a decorative marketing card: smaller preview headings, denser rows, less pill bulk, and more product-specific structure. Use teal as a controlled accent, not wallpaper. The next batch should make the user feel, within one scroll, "this is one suite, and each tool has a real job."

## What Not To Do Next
- Do not add more marketing sections to solve hierarchy.
- Do not introduce new accent colors just to escape teal; reduce usage first.
- Do not make the preview cards larger or more decorative.
- Do not add animations, illustrations, or fake dashboards as visual sugar.
- Do not touch backend, auth, routing behavior, persistence, or package files.
- Do not ignore mobile because desktop looks acceptable.
- Do not redesign the whole shell; the foundation is close enough.

## Next 5 Design Tasks
- [ ] Mobile hero gap repair: reduce the header-to-hero vertical dead space on public product pages at 390px, preserving all content, links, and tap targets.
- [ ] Mobile preview scale pass: choose one product page and make its hero preview read as compact working UI, with smaller preview heading/body scale and no larger cards.
- [ ] Teal restraint pass: replace one overused pale-teal fill or border treatment with an existing neutral style, without adding new colors.
- [ ] Feature rhythm repair: convert one lower desktop product section from equal card stack into a lighter grouped layout using existing content only.
- [ ] Product identity cue: add one small static, product-specific UI cue to an existing preview so the product is less interchangeable, with no behavior or data changes.

## Stop Or Continue
continue but fix visual issues first