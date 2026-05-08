# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is finally speaking with one calmer product voice, but the visual system still feels like a polished demo wrapper sitting on top of the actual assistant.

## Mission Fit
The direction mostly matches the mission: connected suite language is improving, the core model of Today, Capture, Plan, Notes, and More is clearer, and the tone is more practical than generic SaaS. The problem is hierarchy. The mission says the signed-in first screen should help the user know what to do next today, but the available screenshots lean heavily on product-page storytelling, big marketing headers, feature sections, and module explainers. That is useful for selling the suite, not yet enough proof of a daily personal operating system.

## Taste Check
The best parts are the restrained palette, confident type weight, calmer copy, and consistent card language across EasyList, EasyCalendar, EasyNotes, and EasyWorkout. The soft paper background and teal accent have a recognizable EasyLife identity.

What is off: the pages are too proud of explaining themselves. The huge hero cards, repeated "Features" bands, pills, sample panels, and route wrappers make the product feel more like a showroom than a tool. The Settings page is especially awkward: useful structure, but the nav shell is visually loud and the first card stack feels heavy. The design has taste now, but it still has the nervous habit of introducing itself twice.

## Visual Problems To Fix
- The customer/product routes repeat page identity: the global "Daily Workspace / EasyLifeHQ" header sits above a large module hero that repeats the product story, then a "Features" section repeats the explanation again.
- The product pages bury the real workspace behind marketing chrome; "Open workspace" is prominent, but the first viewport is still mostly pitch, preview, and tags rather than the actual daily surface.
- Mobile product pages are readable but oversized: H1s, body text, pills, preview panels, and feature cards stack into a long brochure before the user sees anything operational.
- Settings desktop has cramped top navigation targets and a brand mark that visually collides with the first nav pill; the visual QA small-tap-target findings are real, not just scanner noise.
- Settings mobile makes the nav bar too dominant: the first thing a user sees is a large framed navigation block, then an oversized settings intro, then account/theme cards before controls.
- The "More" nav state on Settings is clear, but the large outlined pill treatment competes with the page title and makes route chrome feel like a second product surface.
- Preview/sample rows inside the hero cards are visually consistent, but they are too similar across modules; each app risks feeling like the same template with different labels.
- Feature sections use clean cards, but they add more explanation before more utility. The hierarchy says "read this" more than "do this."

## Strongest Opportunities
- Turn the protected HQ first screen into the visual anchor: one next action, today context, compact module status, and one quiet command entry.
- Make route navigation smaller, steadier, and less boxed-in so it feels like product infrastructure, not the main event.
- Convert module marketing pages from broad feature pages into lighter product previews, with the actual app route doing the serious daily work.
- Use progressive disclosure harder: pills, feature explanations, and secondary details should sit below the first job or behind simple controls.
- Give each core module one distinctive operational cue: List gets triage, Calendar gets next block, Notes gets saved memory, Workout gets active session, Settings gets control state.

## Priority Fix
Fix the shell hierarchy before adding any more assistant content. The next batch should reduce route chrome and first-viewport explanation, especially on Settings and the core product/demo routes: quieter header, larger tap targets, fewer repeated labels, and less wrapper framing. The user should land in EasyLife and feel "I know what to do next," not "I have arrived at a nicely typeset product brochure."

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: AI Personal Assistant Stage 0 - Salvage Audit; REASON: assistant language and suite consistency improved, but first-screen hierarchy and chrome restraint are still not strong enough.

## Designer Handoff
Keep the soft paper surface, teal accent, confident typography, and calm assistant vocabulary. Change the page structure: make navigation quiet, reduce duplicate identity bands, and let the working surface carry the product. On mobile, compress the top shell and cut explanatory density before touching visuals lower on the page. The result should feel like a composed personal assistant opening to today's next move, not a suite catalog wearing a nice sweater.

## What Not To Do Next
- Do not add more feature sections, stat cards, module tiles, or explanatory copy.
- Do not make a broader dashboard to prove the assistant concept.
- Do not add fake AI promises, provider language, or backend-sounding capability claims.
- Do not redesign every route at once; fix one visible shell or first-screen problem per task.
- Do not ignore mobile because desktop looks acceptable.
- Do not change auth, settings persistence, routing architecture, dependencies, or package files.
- Do not add more colored accents to solve hierarchy; subtraction is the design move.

## Next 5 Design Tasks
- [ ] Settings nav tap-target repair: increase usable target size and remove the brand/nav collision without changing routes, auth, persistence, or settings behavior.
- [ ] Settings first-screen compression: reduce the mobile intro/card stack so the first viewport reaches the active settings control sooner, with no new sections added.
- [ ] Product route chrome reduction: remove one repeated identity or intro band from a core product page while preserving the existing CTA and module purpose.
- [ ] Mobile hero density pass: on one core product route, tighten H1/body/pill spacing so the preview panel appears sooner without shrinking text below readable sizes.
- [ ] Module preview differentiation: adjust one preview panel so it shows a more specific operational cue for that module, with no new fake data systems or backend claims.

## Stop Or Continue
continue but fix visual issues first