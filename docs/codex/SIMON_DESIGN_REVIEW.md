# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
The branch is calmer and more coherent, but it is still proving the brochure better than the signed-in personal operating system.

## Mission Fit
The current direction matches the mission in tone: quiet, practical, connected, and less generic than earlier passes. The marketing pages now explain each module with clearer daily-use examples, and the shared visual language is more consistent across List, Calendar, Notes, and Workout. But Pack 1 is Product Spine, and the latest screenshots mostly show product marketing surfaces, not the protected HQ/app shell where the suite should actually feel connected. Confidence is lower because the visual evidence under-shows the signed-in first screen.

## Taste Check
The restrained teal, soft panels, heavy headings, and simple status rows feel more intentional than stock SaaS. The copy has gotten sharper and less inflated, especially on EasyList and EasyCalendar. The weak spot is hierarchy: mobile starts with a large header gap, oversized hero cards, and repeated pill/status motifs that make the pages feel a bit like four polished one-pagers instead of one working system. Nice coat, but I need to see the apartment.

## Visual Problems To Fix
- Mobile pages waste too much first-viewport height between the header and hero, delaying the useful product proof.
- Hero type is oversized on mobile, causing the page to feel like a landing page instead of a fast daily workspace.
- The pale grid background is visible everywhere and starts to read decorative instead of functional.
- Product proof cards reuse the same pill-in-card pattern across modules, which helps consistency but risks sameness.
- The "Products + demo" mobile header action is unclear as a primary navigation affordance.
- The signed-in suite spine is not sufficiently evidenced in current screenshots, despite recent AppHeader and HQ work.
- Feature cards below the hero are clean but too evenly weighted; they do not create a strong next action or product flow.
- Status rows inside the preview cards are useful, but some labels and badges are cramped on mobile.

## Strongest Opportunities
- Make the protected HQ first viewport the proof of the product: daily action first, module status second, supporting context third.
- Reduce mobile hero scale and vertical padding so useful state appears sooner.
- Turn the app switch/current module area into a compact suite control that feels operational, not promotional.
- Give each module one distinct visual behavior while keeping shared structure, so consistency does not become wallpaper.
- Use the first screen to show connected handoffs between tasks, calendar, notes, and workout instead of repeating isolated module claims.
- Tighten the marketing header so mobile navigation feels deliberate rather than compressed.

## Priority Fix
Fix the first-viewport hierarchy on the signed-in HQ and app shell, then verify it visually. The next pass should make the active module, primary daily action, and two module statuses visible without scrolling on 390px mobile, with less top padding and less hero-style typography. Do not add new sections; compress, reorder, and sharpen what is already there.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: calmer suite consistency is visible, but the active product spine is still under-proven by screenshots.

## Designer Handoff
Keep the quiet teal-and-paper system, the compact status-row idea, and the plainspoken daily-life copy. Change the scale and priority: protected screens should feel like a working cockpit, not a marketing card parade. On mobile, the user should immediately see where they are, what needs attention, and one obvious next action. Desktop can keep more breathing room, but it still needs a stronger suite relationship across modules. The result should feel like opening a calm personal console, not scrolling through a tasteful product brochure.

## What Not To Do Next
- Do not add more marketing sections.
- Do not invent new AI claims or assistant features.
- Do not keep polishing public pages while the signed-in spine remains under-evidenced.
- Do not add more decorative backgrounds, badges, or pills to solve hierarchy.
- Do not touch backend, auth, routing, packages, deployment, or persistence.
- Do not ignore 390px mobile; this is where the hierarchy problem is most obvious.

## Next 5 Design Tasks
- [ ] Capture and review protected HQ mobile and desktop screenshots before changing anything; guardrail: no code changes in this task.
- [ ] Tighten protected HQ first-viewport spacing so the primary daily action and two module statuses appear above the fold on 390px mobile; guardrail: no new sections or behavior.
- [ ] Reduce mobile hero/header vertical padding on app-facing surfaces only; guardrail: preserve existing labels, routes, and content order unless needed for viewport fit.
- [ ] Clarify the mobile app/header navigation affordance so current module and product switch read as controls; guardrail: do not add routes or menus.
- [ ] Vary one module preview treatment subtly so each product has a distinct functional signal while keeping shared spacing and typography; guardrail: no new content blocks.

## Stop Or Continue
continue but fix visual issues first