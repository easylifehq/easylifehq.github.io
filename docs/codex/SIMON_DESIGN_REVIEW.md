# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
The branch is calmer and more coherent, but it is still proving the brochure pages while the mission lives or dies on the protected daily start surface.

## Mission Fit
EasyLife's mission is a connected, professional personal operating system, and the current direction partially matches it: the suite pages now share a quieter visual language, clearer product cards, and more concrete daily-life copy. The problem is evidence. Pack 1 is Product Spine, but the latest screenshots show EasyCalendar, EasyList, EasyNotes, and EasyWorkout marketing/demo routes, not the signed-in HQ first screen where the daily next action should lead. That keeps confidence lower.

## Taste Check
The good: the palette is restrained, the cards have a tactile softness, the typography has authority, and the module examples feel more concrete than generic SaaS filler. EasyList and EasyNotes especially have sharper copy and a less corporate pulse.

The bad: the product pages still feel like a family of landing pages, not a lived-in personal operating system. The top route chrome, oversized hero panels, "Start Free" buttons, feature chips, and repeated "Features" sections make the experience read like a sales site wearing an app costume. Polished costume, yes. Still costume.

## Visual Problems To Fix
- The customer/demo routes repeat the same page identity pattern: logo/nav bar, module eyebrow, giant module headline, module proof panel, feature chips, then a second "Features" intro. It is orderly, but it is also repetitive and brochure-heavy.
- The first visible screen on module pages is dominated by marketing actions like "Start Free" and "See Features" instead of the actual product job: capture, plan, write, log, or review.
- The HQ/product shell is not visually proven in the latest evidence, so the most important Pack 1 surface is effectively off-camera.
- Mobile module pages stack into very tall hero sections before the user reaches practical content. The hierarchy is clean, but it asks too much scrolling before usefulness.
- The desktop nav is visually louder than it needs to be for demo/business routes: "Products" and "Get Started" compete with the specific module story.
- Several proof panels mimic app state but are not clearly interactive, creating a mild fake-product feeling. If it looks like a working app surface, it should either behave like one or be visually framed as a quiet preview.
- The repeated feature-card grid below every hero makes the suite feel assembled from templates rather than shaped around different daily workflows.
- The background grid adds texture, but across all pages it starts to feel like house style doing too much of the identity work.

## Strongest Opportunities
- Put fresh visual proof on the protected HQ route and judge the real first-screen contract: one next action, today context, compact module status.
- Reduce marketing chrome on module pages so each page feels closer to the working product and less like a launch deck.
- Convert one hero proof panel into a more believable mini-workflow: a task row with an action, a note capture state, a calendar block selection, or a workout logging step.
- Tighten mobile first viewports by shortening hero copy, reducing chip count, and moving secondary feature explanation below the fold.
- Create stronger product spine continuity by making module status cards feel like they belong to the same HQ system, not separate landing-page props.
- Make "Products" and route navigation quieter so the module content, not the wrapper, owns attention.

## Priority Fix
Prove and refine the protected HQ first viewport next. The next implementer should not add another feature section or polish another brochure panel until the signed-in start surface is inspected at desktop and 390px mobile, then reduced to one clear daily next action, one today signal, and a compact row of module status. Pack 1 cannot graduate from vibes and screenshots of side doors.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: suite styling and copy are calmer, but the active product spine is still under-proven and the visible routes remain too marketing-led.

## Designer Handoff
Next batch should be a subtraction pass, not a decoration pass. Keep the restrained palette, tactile cards, strong black typography, and concrete life-management language. Change the hierarchy: make the protected HQ route the source of truth, quiet the surrounding route chrome, and push secondary explanations behind clear actions or lower-page sections. The user should feel "I know what to do next today," not "I have arrived at the homepage for four separate apps."

## What Not To Do Next
- Do not add more sections, feature cards, proof blocks, or product claims.
- Do not polish another marketing route before showing HQ screenshots.
- Do not make the nav more elaborate to solve a hierarchy problem.
- Do not introduce dashboards, charts, AI promises, or broad command-center framing.
- Do not touch backend, auth, Firebase, packages, deployment, analytics, or data behavior.
- Do not ignore mobile; the current mobile hierarchy is clean but still too tall.
- Do not mistake "no automated visual bugs" for design approval. The page can be technically fine and still strategically noisy.

## Next 5 Design Tasks
- [ ] Capture and review the protected HQ route at desktop and 390px mobile; guardrail: evidence only first, no implementation in the same task.
- [ ] Reduce the HQ first viewport to one dominant next action plus one compact today context line; guardrail: preserve existing data sources and behavior.
- [ ] Demote one secondary HQ module inventory or helper block below the first viewport; guardrail: do not remove route reachability.
- [ ] Quiet one repeated module-page chrome element such as duplicate "Features" intro, excess chips, or competing CTA row; guardrail: one route only.
- [ ] Tighten one mobile hero viewport by reducing copy or chip count so the practical preview appears sooner; guardrail: no layout rewrite and no new components.

## Stop Or Continue
continue but fix visual issues first