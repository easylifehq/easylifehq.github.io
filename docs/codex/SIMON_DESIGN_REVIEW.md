# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is getting calmer and more coherent, but the visible proof still looks like polished product marketing wrapped around a missing daily operating system.

## Mission Fit
The direction partially matches the mission: the modules now share a restrained teal palette, consistent cards, quieter labels, and more grounded copy, which helps EasyLife feel like one suite. The problem is that the provided screenshots show EasyList, EasyNotes, EasyCalendar, and EasyWorkout as public/demo product pages, not the signed-in Today surface that should prove the "personal operating system" mission. Confidence is lower because the latest visual packet does not include HQ/Today screenshots, and Pack 1 cannot be called solved without seeing the actual first daily action surface.

## Taste Check
The best work is the restraint: soft off-white background, crisp dark type, muted teal accents, and a consistent module preview pattern. It feels more adult than generic SaaS confetti, which is good.

The weak part is hierarchy discipline. The pages are handsome but over-explanatory: big headline, CTA buttons, feature pills, preview card, then feature cards. That is a marketing template wearing a personal assistant costume. The module routes are too similar to each other, the first viewport spends too much energy selling the product, and the actual daily-use experience still feels hidden behind the showroom glass.

## Visual Problems To Fix
- The latest screenshot set does not show the protected HQ/Today route, so the active Pack 1 spine is not visually proven.
- Customer-facing/demo routes have loud route chrome: top nav, product button, "Get Started", hero CTA buttons, feature pills, and section labels all compete before the user sees the useful product behavior.
- The desktop header repeats brand identity twice in a tight cluster: logo block, "EASYLIFEHQ", and "EasyLifeHQ" stacked together. It is not catastrophic, but it reads like the product forgot it already introduced itself.
- Mobile top chrome is oversized and sparse: the white brand bar eats meaningful first-screen height while offering only logo/name, then the hero repeats module identity immediately below.
- The same hero formula appears across EasyList, EasyNotes, EasyCalendar, and EasyWorkout, making the suite consistent but also reskinned. Consistency is not the same as product spine.
- Mobile hero type is still too large for a working app context. It pushes the preview and useful state too far down, especially on EasyCalendar and EasyWorkout.
- Feature pills are visually busy on mobile and feel like marketing tags, not daily workflow controls.
- The pale preview cards are attractive, but they are static proof panels competing with real action. They should either become quieter examples or yield space to an actual next step.
- The "Start Free" and "See Features" CTAs do not match the signed-in personal assistant mission. They sell; they do not help the user act today.
- The lower feature sections continue the page-explainer pattern instead of deepening the product surface. Nice cards, wrong job.

## Strongest Opportunities
- Make HQ/Today the visual source of truth: one next action, today context, compact module status, and one quiet capture entry.
- Reduce public/demo chrome so the product example appears faster and feels less buried.
- Give each module one distinct behavioral signature instead of the same hero-card-feature rhythm everywhere.
- On mobile, compress the brand bar and hero stack so the preview or primary action lands in the first viewport.
- Replace marketing CTAs on protected or demo-like routes with product-native actions: capture task, open note, plan today, start workout.
- Turn feature pills into quieter metadata or remove them where they do not directly help navigation.

## Priority Fix
Prove the Pack 1 product spine by capturing and tuning the protected HQ/Today first viewport, then reduce any chrome that keeps the user from seeing the daily next action immediately. Nami should make the next task about the actual signed-in start surface, not another module marketing polish pass: one clear next move, compact context, subdued capture, and no repeated identity band stealing the top of the screen.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: shared visual restraint is stronger, but the visible evidence still favors marketing-style module pages over the daily operating-system spine.

## Designer Handoff
Keep the restrained palette, dark type, softened panels, and plainspoken copy. Change the information hierarchy: the first screen must feel like "here is what to do today", not "here are the features of this module". Compress the header, quiet secondary nav, reduce feature pills, and let one real product action become the first visual anchor. The user should feel oriented and relieved within five seconds, not politely briefed by a brochure.

## What Not To Do Next
- Do not add another feature section below these pages.
- Do not make the cards more decorative; the issue is hierarchy, not garnish.
- Do not broaden into backend, auth, packages, deployment, analytics, or architecture.
- Do not keep polishing module marketing pages while HQ/Today remains unproven.
- Do not solve mobile by shrinking everything equally; choose what disappears, what stays quiet, and what earns the first viewport.
- Do not add more CTAs. One primary move is the whole point.

## Next 5 Design Tasks
- [ ] Capture HQ/Today desktop and 390px mobile screenshots, then verify the first viewport shows one next action, today context, and compact module status before any feature inventory.
- [ ] Compress the mobile brand/header area by at least 25 percent height without removing basic navigation or causing tap targets below 44px.
- [ ] On one protected Today/HQ surface, demote secondary capture/module controls so the next best move reads first; do not add new panels or new data.
- [ ] Remove or quiet one repeated identity/chrome element from the visible route shell; guardrail: no routing, auth, or behavior changes.
- [ ] Pick one module route and replace marketing CTA language with product-native action language while preserving layout and build stability.

## Stop Or Continue
continue but fix visual issues first