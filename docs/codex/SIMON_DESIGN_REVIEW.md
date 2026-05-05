# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
The surface is calmer and more coherent than before, but EasyLife still reads too much like a product brochure wearing an app costume.

## Mission Fit
The direction partially matches the mission: the shared visual language is starting to feel like one suite, with consistent cards, restrained color, and cleaner typography across EasyList, EasyNotes, EasyCalendar, and EasyWorkout. But Pack 1 is about the product spine, and the strongest required evidence is the protected HQ first screen; the current screenshot set shows mostly public module marketing pages, not the signed-in daily start surface. Confidence is lower because the HQ spine is still under-proven visually.

## Taste Check
The calmer green-gray palette, softer panel treatment, and heavier editorial headings are an improvement over candy SaaS gloss. The pages have a more tactile, practical feel, and the module preview cards are doing useful work.

The weak part is hierarchy. Every module page is still shouting with a huge hero, repeated product identity, feature pills, CTA buttons, and a second feature band before the user sees much actual utility. It is clean, yes, but it is clean in the way a lobby is clean before anyone tells you where the room is.

## Visual Problems To Fix
- The screenshots show repeated page identity: a top EasyLifeHQ brand bar, then a large module label like EASYLIST or EASYCALENDAR, then another branded hero story. This makes the actual product page feel buried under route chrome.
- The desktop first viewport is dominated by marketing navigation and hero framing instead of a working personal operating system surface.
- Mobile pages spend too much vertical space on giant headings, CTA buttons, and feature chips before showing the useful module preview.
- The "Start Free" and "See Features" CTAs are visually loud on every module page, which competes with the mission of a calm personal assistant product.
- Feature chips wrap into bulky rows on mobile and create extra visual noise without adding much decision value.
- The module preview cards are useful, but they sit inside a brochure hero instead of feeling like the actual product interface.
- The background grid is tasteful enough, but combined with large white cards and multiple bordered panels, it risks making each route feel like a framed demo slide instead of a lived-in app.
- The latest visual evidence does not include a protected HQ screenshot, so the most important first-screen contract is not proven.

## Strongest Opportunities
- Make the protected HQ route the design source of truth: one daily next action, today context, and compact module status should lead the whole system.
- Reduce public module chrome so module pages feel like product surfaces first and marketing pages second.
- Turn the module preview cards into stronger app-like proof: denser, quieter, more usable, less "sample block in a hero."
- On mobile, bring the first useful action higher by shrinking hero typography, demoting chips, and reducing CTA weight.
- Establish a quieter route header pattern that can work across HQ, Tasks, Notes, Calendar, Coach, Inbox, and More without repeating labels.

## Priority Fix
Fix the repeated chrome and brochure-first hierarchy before adding anything else. The next slice should reduce the top-of-page load on one customer-facing module route or the protected HQ surface: keep one clear page identity, demote or remove redundant feature chips/CTA weight, and move the actual daily/product preview higher in the first viewport. The user should feel "I can use this" before they feel "someone is pitching this to me."

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: calmer tokens and module consistency improved, but the HQ spine is still not visually proven and public route chrome overwhelms the app story.

## Designer Handoff
Next implementer: stay small and subtract. Keep the calmer palette, card softness, and practical module preview language. Change the first-screen hierarchy: one identity, one primary action, one useful product proof. Make route navigation quieter, reduce CTA/button dominance, and stop letting chips and feature labels behave like confetti with a pension plan. The result should feel like opening a focused personal assistant, not scrolling a landing page for four separate apps.

## What Not To Do Next
- Do not add more sections to explain the product.
- Do not create new feature cards, dashboards, or promotional blocks.
- Do not make the palette more decorative or more gradient-heavy.
- Do not touch backend, auth, Firebase, packages, deployment, analytics, or settings behavior.
- Do not start a broad shell redesign while the first-screen chrome problem is still visible.
- Do not ignore mobile; the mobile first viewport is where the hierarchy problem gets expensive.
- Do not mistake "no visual bugs detected" for "good hierarchy."

## Next 5 Design Tasks
- [ ] Capture and review the protected HQ route at desktop and 390px mobile; guardrail: evidence only, no implementation, and confirm whether one daily next action leads the first viewport.
- [ ] On one module route, remove or demote one repeated identity/chrome element above the fold; guardrail: preserve route behavior, links, and all existing content below the fold.
- [ ] Reduce mobile hero height on one module route by tightening heading, CTA, or chip spacing; guardrail: no font scaling by viewport width and no clipped text.
- [ ] Convert one loud secondary CTA or chip row into quieter secondary navigation; guardrail: keep tap targets usable and keep the primary action obvious.
- [ ] Strengthen one module preview card so it reads more like working app state and less like marketing illustration; guardrail: no new features, no fake integrations, no backend claims.

## Stop Or Continue
continue but fix visual issues first