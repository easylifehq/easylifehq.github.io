# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife looks cleaner and more coherent than before, but it is still dressed like a product brochure when the mission asks for a calm daily operating surface.

## Mission Fit
The shared visual language is improving: consistent cards, teal accents, calm backgrounds, and clearer module identities all support the connected-suite goal. The problem is strategic hierarchy. Pack 1 is about the product spine, and the current screenshots still lead with marketing-style module pages instead of helping the signed-in user understand what to do next today. The most important screen, HQ/Today, is not represented in the provided screenshots, so confidence is lower on the Phase 7 capacity and coach work.

## Taste Check
The best parts are the restraint, the quiet teal system, the large confident typography, and the tactile preview panels. It has a more mature rhythm than generic SaaS confetti. But the repeated "Start Free", "See Features", feature pills, and section-card layout make every route feel like a landing page template wearing a different hat. The typography is handsome but too heroic for working app surfaces. Mobile is readable, but it spends the first screen selling the module instead of letting the user use the product. Very polished brochure. Still not enough product.

## Visual Problems To Fix
- The module routes repeat the same product-page chrome: EasyLifeHQ nav, large hero, "Start Free", "See Features", feature pills, preview card, then another "Features" section. This buries the actual app experience.
- The first mobile viewport is dominated by marketing copy and CTAs, not today's next action, module status, or a usable workflow.
- The primary hero type is too large for app-adjacent screens, making every module feel like a launch page instead of part of a personal operating system.
- The preview cards are visually pleasant but mostly illustrative; they read as mock screenshots rather than actionable surfaces.
- Repeated CTA language creates product identity noise across EasyList, EasyNotes, EasyCalendar, and EasyWorkout.
- The grid background and stacked white panels are consistent, but the page rhythm is becoming formulaic: hero card, feature card, three columns, repeat.
- Desktop hierarchy gives too much weight to explanation and not enough to immediate state or action.
- The latest visual evidence does not include the HQ/Today surface, even though the recent Phase 7 work appears centered there. That is a design evidence gap.

## Strongest Opportunities
- Convert the signed-in HQ/Today screen into the visible spine: one next action, today's context, compact module signals, and quiet route switching.
- Reduce public/demo chrome on working routes so the user sees the product, not the wrapper around the product.
- Make module pages feel like workspaces with compact headers, active state, and live-looking rows rather than marketing sections.
- Keep the calm teal and crisp typography, but scale type down inside app surfaces so hierarchy feels operational.
- Use progressive disclosure: put feature explanations behind tabs, details, or secondary panels instead of stacking them under every hero.

## Priority Fix
Fix the product spine before adding another feature slice. The next batch should remove the marketing-page treatment from one signed-in route, preferably HQ/Today: replace repeated hero/CTA chrome with a compact daily start surface showing one next action, today's capacity/context, and 3-4 quiet module status chips. Keep navigation useful but quieter. This is the difference between "nice website for an app" and "the app."

## Magic Improvement Score
SCORE: 2; DIRECTION: flat; ACTIVE_PACK: Pack 1 - Product Spine; REASON: visual polish is cleaner, but the branch still advances brochure-like module pages more than the daily operating spine.

## Designer Handoff
Treat the next pass as subtraction and re-hierarchy. Keep the soft teal system, white panels, rounded controls, and concrete life-management language. Change the page intent: working routes should stop opening with sales CTAs and oversized product claims. The user should land, understand today's next useful move, and feel that EasyList, EasyNotes, EasyCalendar, and EasyWorkout are connected parts of one calm assistant. Make the chrome quiet, make the state visible, and make the first action obvious.

## What Not To Do Next
- Do not add more feature sections below these pages.
- Do not add another dashboard cluster before fixing the first-screen job.
- Do not make the typography even bigger to create "premium" energy.
- Do not introduce new colors, decorative graphics, or visual noise.
- Do not touch backend, auth, Firebase, deployment, packages, or data models.
- Do not ignore mobile; mobile currently exposes the brochure problem fastest.
- Do not keep repeating "Start Free" and "See Features" inside signed-in product surfaces.

## Next 5 Design Tasks
- [ ] HQ first-screen trim: make the top signed-in surface show one daily next action, today context, and compact module status; remove any marketing CTA language from that viewport.
- [ ] EasyList route chrome reduction: replace "Start Free", "See Features", and feature-pill hero treatment with a compact app header and one primary task action; preserve existing behavior.
- [ ] EasyNotes workspace pass: reduce hero scale and make the first visible panel look like a note capture workspace, not a feature explanation; no persistence changes.
- [ ] Mobile hierarchy pass on one route: verify the first 700px shows usable product state before secondary explanation; keep text readable and controls tappable.
- [ ] Shared module header cleanup: define one quiet header pattern for working routes with module name, short status, and one primary action; do not add new navigation systems.

## Stop Or Continue
continue but fix visual issues first