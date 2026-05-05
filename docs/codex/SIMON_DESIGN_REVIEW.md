# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
The surface is calmer and more disciplined than before, but EasyLife still looks too much like a set of polite product brochures instead of the signed-in personal operating system the mission is asking for.

## Mission Fit
The current direction supports the mission in tone: quiet palette, consistent card language, restrained controls, and module-to-module visual family. It does not yet satisfy Pack 1 because the visible screenshots mostly prove product landing pages for EasyList, EasyNotes, EasyCalendar, and EasyWorkout, while the mission and information staging contract say the protected first screen must help the signed-in user understand what to do next today. The design is circling the operating system spine, not landing on it.

## Taste Check
The good: the muted green, soft grid background, compact status rows, and reduced visual noise are moving toward a calm personal suite. The module preview cards feel tactile without screaming, and the typography has enough confidence to avoid bland utility-app mush.

The weak: the repeated hero formula is becoming a template costume. Every module starts with the same big claim, same CTA pair, same tags, same right-side mock panel, then a "Features" section. That is coherent, yes, but it is also starting to feel like a brochure factory. The app promise is "open and act on today"; the visible pages say "please tour our nice feature set." Different meal.

## Visual Problems To Fix
- The latest visual evidence does not include the protected HQ/Today route, even though the active work pack is Product Spine and recent work changed `HQPage.tsx`; confidence is lower because the most important screen is not shown.
- Customer-facing/product routes repeat the same large top brand bar, hero module label, oversized headline, CTA row, tag row, preview panel, and feature section pattern; the repetition makes the suite feel templated rather than intentionally connected.
- The first viewport on mobile is still dominated by marketing hierarchy: giant headline, "Start Free", "See Features", and tag pills before the user sees much of the actual product behavior.
- The "Products" and "Get Started" route chrome is visually louder than it needs to be for demo review; it competes with the module page instead of quietly supporting navigation.
- The module pages rely on big slogans instead of showing the daily operating job first; the screenshots make EasyLife feel explained, not used.
- Mobile type scale is heavy. The headlines are handsome, but they consume too much vertical space and push the concrete workflow evidence down the page.
- The right-side mock panels are useful on desktop, but on mobile they become another large card after the hero rather than a quick proof of action.
- The feature cards are tidy but generic: three-card feature grids are the beige conference tote bag of SaaS layout. This product needs more daily-life specificity.

## Strongest Opportunities
- Make HQ/Today the proof screen: one next move, today context, and compact module status should become the visual north star for the entire suite.
- Convert module landing pages from marketing pages into "working previews" with a quieter intro and a concrete first action near the top.
- Reduce repeated route chrome: keep brand and navigation, but stop stacking identity, page label, slogan, CTA, tags, and preview as if every route needs a launch campaign.
- Use one shared suite shell pattern across modules, then let each module differ through its primary task surface rather than through headline copy.
- On mobile, make the first screen feel like a pocket assistant: next action, capture, and one status strip before any feature explanation.

## Priority Fix
Prove the protected Today/HQ spine visually before adding or polishing more module marketing surfaces. The next design task should produce fresh desktop and 390px mobile screenshots of HQ and make the first viewport read as one daily start point: one clear next action, today's context, compact module status, and a quiet command/capture entry. Until that exists, the suite is dressing nicely for a job interview it has not attended.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: visual restraint improved, but current evidence still favors polished module brochures over the daily operating-system spine.

## Designer Handoff
Keep the calm green system, soft panels, compact status rows, and practical copy tone. Change the hierarchy: HQ/Today must become the product's first proof, not another dashboard dump and not another marketing explainer. Make route navigation quieter, shrink hero dominance on mobile, and move secondary explanation below the first useful action. The user should feel, "I know what to do next," not "I have been introduced to four tidy apps."

## What Not To Do Next
- Do not add another section to any module page.
- Do not make the command palette more theatrical before the Today spine is visually proven.
- Do not keep polishing product-route hero copy while HQ remains unverified.
- Do not add more nav pills, tags, badges, or explanatory wrappers.
- Do not solve this with a broader redesign; one focused HQ first-viewport repair is enough.
- Do not ignore mobile just because the desktop layouts look clean.
- Do not touch backend, auth, Firebase, package files, deployment, or account scope.

## Next 5 Design Tasks
- [ ] Capture fresh HQ/Today desktop and 390px mobile screenshots; guardrail: no UI changes in this task, evidence only.
- [ ] Reduce HQ first viewport to one next action, one today context group, and one compact module status row; guardrail: no new data sources or feature inventory.
- [ ] Quiet the shared route chrome by reducing visual weight of secondary nav/actions; guardrail: preserve navigation and do not remove access.
- [ ] Tighten mobile hero scale on module pages so the product proof appears earlier; guardrail: no copy rewrite beyond shortening labels.
- [ ] Replace one repeated feature-card block with a concrete working-state preview; guardrail: keep the existing layout system and avoid adding a new section.

## Stop Or Continue
continue but fix visual issues first