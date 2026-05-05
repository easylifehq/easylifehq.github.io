# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is visually calmer and more coherent, but it still looks like four product brochures wearing the same jacket instead of one working personal operating system.

## Mission Fit
The shared shell, typography, cards, and muted teal system are moving toward a connected suite, but the current evidence does not prove the core mission yet. Pack 1 is Product Spine, and the screenshots still lead with module landing pages: EasyList explains EasyList, EasyCalendar explains EasyCalendar, EasyNotes explains EasyNotes, and EasyWorkout explains EasyWorkout. That is tidy, but it is not the signed-in daily assistant surface promised by the mission. Confidence is slightly lower because the latest screenshots do not include the HQ/Today surface where the new capacity signal apparently lives.

## Taste Check
The best part is restraint: the palette is quiet, the typography has real weight, the cards are cleaner, and the mock product previews feel more intentional than generic SaaS confetti. The visual system is starting to have a recognizable EasyLife voice.

The weak part is hierarchy and product posture. Every route still opens like a marketing page with a massive headline, feature pills, "Start Free", and "See Features". That is not how a personal operating system should greet a signed-in user. The layout is composed, but it is performing the product instead of operating it. Very polite brochureware. Champagne flute, no dinner service.

## Visual Problems To Fix
- The route chrome repeats the same product identity on every page: top EasyLifeHQ brand, module eyebrow, hero headline, feature section, and repeated module explanation all stack into a double-intro pattern.
- Customer/app route controls are too loud for working surfaces: "Start Free", "See Features", "Products", and product-nav labels compete with the actual module preview.
- The first viewport is dominated by giant marketing headlines instead of one daily next action, today context, or compact module status.
- The desktop pages bury useful product behavior inside a right-side demo card while the largest visual element is still explanatory copy.
- Mobile layouts are readable, but the oversized hero type and buttons force long scroll before the user reaches useful content.
- Feature sections repeat the same rhythm across routes, making modules feel templated rather than meaningfully connected.
- The background grid and large floating cards create a dressed-up demo shell; the working product still feels one layer underneath the wrapper.
- EasyWorkout mobile shows feature pills as plain text rather than consistent pill controls, which breaks suite polish.
- The screenshots do not show HQ/Today, so the most mission-critical first-screen contract is not visually proven in this review batch.

## Strongest Opportunities
- Replace module landing intros with working-app starts: today task, next calendar block, recent note, workout readiness, and one calm recommendation.
- Turn the right-side preview cards into the actual primary surface, not a decoration beside marketing copy.
- Make navigation quieter and more app-like: persistent suite nav, clear active state, fewer promotional CTAs.
- Establish a shared module header pattern with compact status, not repeated hero prose.
- Use progressive disclosure: keep details behind tabs, drawers, or secondary rows instead of showing feature inventories up front.
- Let HQ become the spine: every module page should feel like it was entered from Today, not like a standalone product page.

## Priority Fix
Reduce the brochure chrome before adding anything else. On signed-in/product demo routes, replace the oversized hero-and-feature pattern with a compact working header plus one actionable module panel. Remove or demote "Start Free", "See Features", and repeated section intros where they appear inside app-like routes. The next batch should make one route feel like a usable part of the daily operating system, not a sales page explaining itself twice.

## Magic Improvement Score
SCORE: 2; DIRECTION: flat; ACTIVE_PACK: Pack 1 - Product Spine; REASON: cleaner visual polish, but Pack 1 is still blocked by brochure-style module pages instead of a working daily spine.

## Designer Handoff
Keep the quiet color system, strong type, rounded card language, and calm life-management copy. Change the page posture. Treat these screens like a signed-in personal assistant, not a marketing site: shrink the hero, quiet the nav, remove promotional CTAs from app surfaces, and put one useful daily action above explanatory content. The user should feel "I know what to do next" within five seconds, not "I understand the feature positioning."

## What Not To Do Next
- Do not add more sections below the current pages.
- Do not add more feature cards, benefit blocks, or product claims.
- Do not make the teal system louder to create excitement.
- Do not introduce dashboard theatrics, fake AI promises, or strategy-mode panels.
- Do not keep polishing module brochures while the HQ/Today spine remains visually unproven.
- Do not ignore mobile; the first useful action still arrives too late.
- Do not touch backend, auth, payments, Firebase, deployment, packages, or data models.

## Next 5 Design Tasks
- [ ] On one app route, replace the giant marketing hero with a compact working header and one primary action panel; preserve behavior and keep the diff small.
- [ ] Remove or demote "Start Free" and "See Features" from signed-in/app-like route surfaces; keep any public marketing CTAs only where they belong.
- [ ] Convert one repeated "Features" intro band into a quieter secondary details section behind an existing button, tab, or lower-priority panel.
- [ ] Tighten mobile first-screen hierarchy on one route so the primary action/demo content appears before long feature explanation; do not add new content.
- [ ] Capture and review HQ/Today screenshots after the capacity signal work; confirm the first screen shows one daily next action, today context, and compact module status.

## Stop Or Continue
continue but fix visual issues first