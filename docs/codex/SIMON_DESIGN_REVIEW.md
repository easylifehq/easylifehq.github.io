# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is cleaner and more coherent, but it still looks more like a tidy marketing kit than a convincing signed-in personal operating system.

## Mission Fit
The direction matches the mission: calm, practical, connected, and visibly less chaotic than earlier batches. The shared header, restrained palette, tactile cards, and clearer product language help the suite feel related. The miss is Pack 1 proof: the branch keeps polishing product pages and module surfaces, while the signed-in spine still is not visually undeniable from the evidence provided.

## Taste Check
The quiet grid background, pale panels, strong black type, and teal action color feel current and disciplined. The best parts are the direct headlines and calmer mobile stacking. The weaker parts are the repeated large rounded cards, pill overload, and hero-first composition that makes every product page feel like it went to the same SaaS finishing school and came back with a tote bag.

## Visual Problems To Fix
- Mobile pages start with too much dead vertical air between the header and primary content.
- Product pages overuse the same hero card plus proof-card pattern, reducing app personality between EasyList, EasyCalendar, EasyNotes, and EasyWorkout.
- Pills are visually heavy and numerous, especially on mobile, where they compete with the primary CTA.
- The preview cards have oversized type and padding on mobile, making the first screen feel slower than it needs to.
- Settings desktop has a clearer structure, but the top hero area leaves a large quiet void before useful controls.
- The navigation shell is consistent, but it still reads as marketing navigation more than a working product command surface.
- Screenshots still under-prove the protected HQ/app spine after multiple Pack 1 tasks.

## Strongest Opportunities
- Make the signed-in HQ first viewport the unmistakable system spine: today, capture, next event, open tasks, and module jumps in one calm working surface.
- Reduce mobile hero height by compressing badge rows, intro copy, and preview padding.
- Give each module one distinctive but restrained interaction surface instead of repeating the same product-card choreography.
- Turn the header into a more useful suite control on protected pages: app switcher, current module state, and one primary capture/action.
- Use denser status rows for daily-use screens, saving big cards for genuinely important decisions.

## Priority Fix
Fix the signed-in product spine next. The next design task should target the protected HQ or app shell first viewport, not another marketing page: make the user immediately see "what needs attention, what is next, and where to capture" without scrolling, with compact module statuses that feel like one operating system instead of separate app promos.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: visual consistency and mobile polish improved, but Pack 1 still lacks decisive signed-in suite-spine evidence.

## Designer Handoff
Keep the calm palette, strong typography, and practical language. Change the hierarchy: less hero theater, more working dashboard. The next batch should make the protected HQ/app shell feel like the center of the product, with a compact daily command surface, scan-friendly module states, and fewer decorative pills. The user should feel, in the first five seconds, "this is where my day starts" rather than "this is a nice brochure for apps I might use."

## What Not To Do Next
- Do not add more marketing sections.
- Do not add more pills, badges, or soft cards to fake progress.
- Do not redesign every module at once.
- Do not chase a new visual theme; refine the current one.
- Do not touch backend, auth, Firebase, deployment, packages, or data models.
- Do not ignore mobile first-viewport density.
- Do not keep scoring Pack 1 from product-page screenshots alone.

## Next 5 Design Tasks
- [ ] Protected HQ first-viewport compression: show daily focus, quick capture, and two module statuses above the fold on 390px mobile; no new backend, routes, data shapes, or broad layout rewrite.
- [ ] Protected shell navigation polish: make the app switch/current module area feel like a working suite control, not marketing nav; keep labels short and preserve existing routes.
- [ ] Mobile pill diet pass: reduce chip weight/count on product and module pages so CTAs and proof surfaces dominate; do not add new copy sections.
- [ ] Settings top-area density repair: shrink the empty hero void and bring the first useful controls higher on desktop and mobile; no settings behavior changes.
- [ ] Module preview differentiation pass: adjust one product preview card layout so it better reflects that module's actual daily use; keep shared tokens and avoid decorative novelty.

## Stop Or Continue
continue but fix visual issues first