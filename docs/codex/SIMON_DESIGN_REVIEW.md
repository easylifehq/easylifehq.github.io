# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is cleaner and more coherent, but the latest evidence still looks like polished product marketing pretending to prove an operating system.

## Mission Fit
The direction matches the mission in tone: calm, practical, restrained, and less chaotic than before. The problem is proof. Pack 1 is Product Spine, and the visible screenshots still emphasize marketing pages for individual modules more than the signed-in HQ experience where the user should understand the suite, the daily start point, and how the apps relate.

## Taste Check
The typography is strong, the voice is more specific, and the pale tactical surfaces feel current without going full generic SaaS. The repeated product-preview panels give the suite a shared visual language, which is useful. But the layout is too template-driven across modules: same hero rhythm, same card logic, same pill clusters, same proof box. It is handsome, yes. It is also starting to wear a uniform because nobody gave it a job.

## Visual Problems To Fix
- Mobile heroes still spend too much vertical space before showing useful product structure, especially EasyCalendar and EasyList.
- The top mobile header is oversized relative to the first task: it consumes attention before the product value appears.
- Product chips read as decorative filler on several pages instead of actionable or clarifying metadata.
- The module preview cards are visually consistent, but too similar across products, which weakens each app's specific identity.
- Several mobile preview rows have tight label/value relationships that feel heavy and cramped, especially EasyList and EasyNotes.
- The desktop hero cards are clean but overly boxed; the whole page can feel like stacked panels instead of one flowing product experience.
- The screenshots do not show enough signed-in HQ or route-to-route shell proof, so confidence on Pack 1 completion is lower.

## Strongest Opportunities
- Make the signed-in HQ first screen the design anchor: one decisive daily focus area, compact cross-module statuses, and clear next actions.
- Tighten the mobile header and hero spacing so the user sees product proof faster.
- Give each module preview one distinctive interaction pattern rather than the same rounded status list in different clothes.
- Replace decorative chip rows with fewer, sharper status or capability cues.
- Use shared spacing and shell rules across signed-in pages before polishing more marketing surfaces.
- Make the suite connection visible through cross-app handoffs, not just matching colors and cards.

## Priority Fix
Fix the signed-in Product Spine proof next. Nami should focus on HQ and the protected app shell, not another marketing hero pass: the first mobile viewport must show a clear daily start action plus at least two compact module statuses without oversized chrome, decorative pills, or secondary cards competing for attention.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: useful workflow progress and cleaner marketing consistency, but screenshots still under-prove the signed-in operating-system spine.

## Designer Handoff
Keep the quiet palette, confident type, and restrained card language. Change the hierarchy: signed-in screens need to feel like the main product, not supporting evidence for the website. Compress mobile chrome, reduce decorative chips, and make HQ behave like the command surface for a real personal operating system. The user should feel, within three seconds, "I know what matters today and where each part of my life sits."

## What Not To Do Next
- Do not add more marketing sections.
- Do not create another generic rounded-card proof block.
- Do not add visual noise to make the app feel richer.
- Do not chase new feature scope before the signed-in spine is visually convincing.
- Do not ignore mobile just because automated visual checks are green.
- Do not change backend, auth, routing, package files, or data models to solve a hierarchy problem.

## Next 5 Design Tasks
- [ ] Tighten the protected HQ mobile first viewport so the daily start action and two module statuses appear before secondary context; keep scope to UI spacing and hierarchy only.
- [ ] Reduce mobile header height across marketing/product pages without changing navigation behavior; verify buttons remain tappable and text does not clip.
- [ ] Audit one signed-in app page for decorative chips and convert one nonessential chip group into quieter inline metadata; do not add content.
- [ ] Give EasyList's mobile preview rows more breathing room between label, value, and badge; keep the existing data and row count.
- [ ] Capture and review updated signed-in HQ screenshots on desktop and 390px mobile before scoring Pack 1 again.

## Stop Or Continue
continue but fix visual issues first