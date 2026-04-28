# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is calmer and more coherent, but the product is still wearing too much wrapper chrome before it lets the actual suite breathe.

## Mission Fit
The direction matches Pack 1 - Product Spine: shared headers, quiet teal system language, and repeated module preview cards are making EasyLife feel more like one suite instead of random feature pages. The problem is proof. The freshest screenshots still mostly show marketing/demo routes, and those routes lead with a big global header plus another oversized product intro, so the "personal operating system" mission is visible but slightly buried under presentation furniture.

## Taste Check
The best parts are the restrained color system, tactile panels, heavier typography, and module cards that feel related across EasyList, EasyNotes, EasyCalendar, and EasyWorkout. The copy is more concrete than before, which helps. What feels off: the mobile hero cards are huge, the top route controls are visually loud, and some page sections repeat identity instead of advancing the user. The design is no longer generic SaaS sludge, but it still has a demo-shell smell. Very trade-show booth in a nice coat.

## Visual Problems To Fix
- Mobile marketing/demo routes show a prominent header card, then immediately another large product identity card, creating stacked chrome before useful content.
- The "Products + demo" control on mobile competes with the product page hero instead of quietly supporting navigation.
- Hero spacing on mobile is still too tall across EasyList, EasyCalendar, EasyNotes, and EasyWorkout, pushing the most useful preview below a lot of brand repetition.
- The repeated pill-style product labels inside preview cards duplicate the page identity and add visual weight without much information.
- Settings mobile has a reported small tap target for the Apps menu trigger, and the header cluster feels cramped against the page frame.
- The marketing pages are visually more proven than the signed-in HQ spine, which weakens confidence that Pack 1 is truly solved.
- Several cards use similar border, background, and pill treatments, so hierarchy sometimes flattens: everything whispers at the same volume.

## Strongest Opportunities
- Make the signed-in shell the design source of truth: HQ, Settings, and core app routes should define the suite feeling, with marketing pages borrowing from them.
- Collapse mobile route chrome into a quieter, slimmer bar so the product/demo content starts faster.
- Give each module preview one distinctive functional signal, not just a repeated label and list rows.
- Tighten first viewport density so mobile users see identity, value, primary action, and one useful product proof without scrolling past ceremony.
- Standardize a compact page-header pattern for protected routes, then use it everywhere before inventing more section layouts.

## Priority Fix
Reduce mobile chrome before adding anything else. Specifically, slim the top route header and product switcher treatment on customer-facing/demo routes, then tighten the first hero card so the module preview appears sooner. The next task should remove repeated identity weight, not decorate around it.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: suite consistency is better, but loud route chrome and under-proven signed-in hierarchy keep it from feeling finished.

## Designer Handoff
Keep the quiet teal palette, sturdy typography, and shared card language. Change the mobile page structure: header controls should become background utility, not the first thing the user studies. The main content should feel like "I opened a useful life system" within one glance, not "I entered a demo wrapper." Preserve the calm, practical tone, but sharpen hierarchy so the product surface wins over the frame.

## What Not To Do Next
- Do not add more sections to marketing pages.
- Do not add more pills, badges, or explanatory labels to solve hierarchy.
- Do not redesign the whole suite at once.
- Do not chase novelty with gradients, illustrations, or louder color.
- Do not move into backend, auth, settings logic, integrations, analytics, or package work.
- Do not ignore mobile because desktop looks acceptable.

## Next 5 Design Tasks
- [ ] Tighten mobile marketing/demo header chrome so the product hero starts higher; preserve routes, labels, and behavior.
- [ ] Reduce duplicated product identity inside module preview cards; keep one clear module label and one functional proof.
- [ ] Fix the Settings mobile Apps trigger tap target to at least 44px high without changing menu behavior.
- [ ] Capture fresh signed-in HQ mobile and desktop screenshots and judge Pack 1 against those, not only marketing pages.
- [ ] Normalize first-card spacing across EasyList, EasyCalendar, EasyNotes, and EasyWorkout with a small CSS-only pass; no new content.

## Stop Or Continue
continue but fix visual issues first