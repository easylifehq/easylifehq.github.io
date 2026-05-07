# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is cleaner and more coherent, but it is still wearing a polished brochure suit when the mission asks for a calm daily assistant.

## Mission Fit
The direction partly matches the mission: the shared teal, paper-like panels, card rhythm, and simplified Today/Capture/Plan/Notes/More shell are moving toward one connected personal operating system. The miss is evidence. The latest screenshots mostly show public product pages and Settings, not the protected HQ first screen where the signed-in user should see one daily next action, today context, and compact module status. Confidence is lower because the most mission-critical surface is not visually proven.

## Taste Check
The best parts are the restraint, the quieter color system, the tactile paper surfaces, and the move away from scattered product names toward assistant-style navigation. The typography is bold and legible, and the copy is more concrete than before.

What is off: the marketing/product routes are too templated. Every product page uses the same big headline, right-side demo card, pill cluster, and feature-card block, so the suite feels like a dressed-up catalog instead of a living product. Settings is closer to the real app, but the top route chrome is visually loud and cramped, especially on mobile. The nav should feel like a tool rail, not a parade float.

## Visual Problems To Fix
- The protected assistant-first HQ surface is not represented in the latest visual evidence, so the core mission cannot be judged with confidence.
- Settings mobile has oversized route chrome: the logo, Today, Capture, Plan, Notes, and More controls consume the first screen before the settings job starts.
- Settings desktop shows the app nav inside a floating header panel with awkward brand compression; the EL mark and EasyLife label look crowded instead of premium.
- Multiple navigation targets are reported as small tap targets on Settings, especially the brand and Today/Capture/Plan/Notes links.
- Product pages repeat the same visual formula across EasyList, EasyCalendar, EasyNotes, and EasyWorkout, which weakens product identity instead of making each module feel purposeful.
- The product-page hero cards feel too large and explanatory for a personal assistant suite; the actual working flow is still secondary to marketing framing.
- Pill tags under hero CTAs add clutter without much hierarchy; they read like feature inventory chips.
- The first viewport often shows two competing jobs: "open the workspace" and "understand this product page." Pick one.
- The pale grid background is tasteful enough, but used everywhere it starts to feel like a theme blanket instead of intentional surface design.
- Settings has too much visible account/config detail before the user gets to the actionable controls; progressive disclosure is not yet disciplined.

## Strongest Opportunities
- Make `/app/hq` the visual proof point: one next action, one capture affordance, and compact status from modules.
- Quiet the app header on internal routes so Today/Capture/Plan/Notes/More supports the task instead of becoming the task.
- Give each module one distinct working preview pattern, not the same marketing-card template with different words.
- Reduce hero chip clutter and let primary action plus one supporting sentence do the work.
- Move secondary settings details behind disclosure, especially on mobile.
- Tighten mobile vertical rhythm so first screens feel useful faster, not just larger.

## Priority Fix
Fix the internal app shell chrome before adding anything else. On Settings and the protected app routes, reduce the nav height, repair tap targets to at least 44px without making the bar visually heavier, and stop the brand/nav block from competing with the page title. The user should land on the page job first, with navigation available but quiet.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: AI Personal Assistant Stage 0 - Salvage Audit; REASON: suite consistency is better, but the assistant-first daily surface is still not visually proven.

## Designer Handoff
Next batch should stay small and surgical. Keep the paper texture, teal accent, strong typography, and simplified assistant nav. Change the internal shell so it feels like a compact operating-system control, not a marketing header. Settings should open with clear setup hierarchy and comfortable controls, while account/theme/opening-screen details become quieter. The result should feel calmer, faster, and more like a personal assistant that is ready to help today.

## What Not To Do Next
- Do not add more product sections.
- Do not invent new assistant features to compensate for weak hierarchy.
- Do not make the nav taller just to satisfy tap target checks.
- Do not keep cloning the same hero/card/chip pattern across every module.
- Do not touch auth, backend, Firebase, deployment, packages, or data behavior.
- Do not ignore mobile; that is where the chrome problem is loudest.

## Next 5 Design Tasks
- [ ] Compact the internal app header on Settings while preserving Today/Capture/Plan/Notes/More and meeting 44px tap targets.
- [ ] Reduce Settings first-screen density by making secondary setup details quieter or disclosed, with no backend or auth changes.
- [ ] Capture fresh desktop and mobile screenshots of `/app/hq` so the assistant-first surface can be judged directly.
- [ ] Remove one row of nonessential hero chips from a product page and verify the CTA hierarchy becomes clearer.
- [ ] Give one module page a more workflow-specific preview card instead of the shared generic marketing-card layout.

## Stop Or Continue
continue but fix visual issues first