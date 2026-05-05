# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is calmer and more grown-up, but it still shows too much brochure before it proves the daily assistant spine.

## Mission Fit
The direction matches the EasyLife mission better than before: restrained teal, quieter cards, firmer typography, and more concrete module language all help the suite feel connected and professional. The miss is still Pack 1. The screenshots mostly prove public/module presentation pages, while the mission depends on the protected HQ first screen showing one next move, today context, and compact module status. Since HQ screenshots are missing, confidence is lower.

## Taste Check
The best parts feel tactile, quiet, and more current: soft paper surfaces, dark editorial type, controlled teal, and fewer toy-like visual tokens. EasyList and EasyNotes have sharper product language, and the demos are more believable than generic SaaS filler.

The weak part is staging. The route chrome, giant module heroes, CTA pairs, chip rows, and early feature bands still make the product feel like a polished landing-page kit. It is handsome enough, yes, but it keeps trying to sell me the app when the mission is to help me use the app. Very polite, very clean, still a little too "template found a blazer."

## Visual Problems To Fix
- The latest visual evidence does not include the protected HQ first screen, even though HQ is the active Product Spine surface.
- Public/module routes repeat the same identity pattern: EasyLifeHQ header, module eyebrow, giant title, CTA pair, chips, preview card, then feature band.
- The top route chrome is visually loud for a demo/business surface; on mobile the brand bar consumes too much first-viewport height before the actual product example appears.
- Module pages still lead with "Start Free" and "See Features," which makes the first screen feel acquisition-led instead of utility-led.
- Mobile headings are oversized relative to the task: EasyCalendar and EasyWorkout push useful preview content down with long hero copy.
- Chip rows add noise without much decision value, especially when stacked under CTAs on mobile.
- Feature sections arrive too early and too large, repeating the sales explanation before the product workflow has done the work.
- Demo rows are readable but visually blunt: labels, values, and badges compete at similar weight, so the eye has to sort what matters.

## Strongest Opportunities
- Make HQ the proof surface: one next best move, today's context, and compact module status should be visible immediately.
- Reduce public route chrome so product previews move higher and feel like the main event.
- Tighten mobile type scale and vertical rhythm so the useful demo appears sooner without feeling cramped.
- Turn feature bands into quieter supporting sections lower on the page or behind progressive disclosure.
- Show stronger cross-module continuity: note becomes task, task becomes calendar block, workout contributes to today's status.

## Priority Fix
The single most important design problem is lack of visible HQ proof. Capture and tune the protected HQ first viewport before more module-page polish. The first screen must show one clear daily next action, today context, and compact status from the core modules before secondary navigation, feature explanation, or directory-like content. If HQ does not answer "what should I do next today," Pack 1 is not done.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: calmer visuals and better module consistency help, but HQ proof is missing and visible routes remain too marketing-led.

## Designer Handoff
Keep the restrained palette, paper texture, strong black type, and teal primary action. Change the hierarchy. HQ should feel like a personal assistant start surface: compact shell, one dominant next move, today context, and small module signals. Public/module pages should become more product-led and less campaign-led: reduce CTA weight, trim chip rows, lower the "Features" volume, and let the preview demonstrate value sooner. The user should feel oriented, not pitched.

## What Not To Do Next
- Do not add more sections to make the pages feel richer.
- Do not polish more marketing routes before proving HQ.
- Do not solve hierarchy by adding explanatory copy.
- Do not add dashboards, charts, badges, or decorative panels.
- Do not change backend, auth, Firebase, packages, deployment, analytics, or data architecture.
- Do not treat a green automated visual bug report as proof that the design is staged correctly.
- Do not ignore mobile density; the first viewport is still carrying too much ceremony.

## Next 5 Design Tasks
- [ ] Capture HQ desktop and 390px mobile screenshots; guardrail: review only the first viewport and do not change behavior.
- [ ] Make one HQ UI-only adjustment so the next best move appears before module inventory; guardrail: no data, auth, route, or persistence changes.
- [ ] Reduce mobile header and hero vertical weight on one protected surface; guardrail: preserve labels, navigation, and tap targets.
- [ ] On one module route, quiet the CTA/chip stack so the product preview appears sooner; guardrail: no new sections or claims.
- [ ] Normalize one demo-row style on mobile so labels are secondary, values are primary, and badges do not compete; guardrail: one route or one shared component only.

## Stop Or Continue
continue but fix visual issues first