# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is cleaner and more consistent, but it is still wearing a product brochure costume when the mission asks for a daily operating surface.

## Mission Fit
The visual system is moving toward a connected suite: shared header, soft panels, consistent teal accents, and similar module storytelling across EasyList, EasyNotes, EasyCalendar, and EasyWorkout. But Pack 1 is Product Spine, and the visible screens still introduce each module as a marketing page instead of helping a signed-in user decide what to do next today. The first-screen contract is not fully served because the hierarchy favors "Start Free", "See Features", feature pills, and explanatory sections over one daily next action and compact module status.

## Taste Check
The restraint is better. The palette is calmer, the rounded panels feel tactile, and the module mockups have a coherent visual grammar. The mobile layouts are surprisingly comfortable: tap targets breathe, text is readable, and the stacked preview cards do not collapse into soup.

What is off: the pages are too samey, too promotional, and too proud of explaining themselves. Every module gets the same big headline, same CTA pair, same pill row, same feature section. That is not a personal operating system; that is a polite SaaS parade. The typography is strong, but it is overused at hero scale, so hierarchy starts loud and stays loud.

## Visual Problems To Fix
- The customer-facing/product chrome dominates the app routes: top nav, "Products", "Get Started", "Start Free", and "See Features" compete with the actual module experience.
- Repeated page identity is present: the header says EasyLifeHQ, the module eyebrow repeats the product name, then the feature section reintroduces the module again. It feels like the page keeps announcing itself instead of becoming useful.
- The first viewport on every module is still a brochure hero, not a working app surface with today's next action, current state, or a useful starting point.
- The module pages use nearly identical structure, which improves consistency but weakens product personality; EasyList, Notes, Calendar, and Workout should feel related, not cloned.
- The feature pills under the primary CTAs add noise before value. They read as keyword badges, not usable controls.
- Desktop pages have too much vertical ceremony before the first meaningful workflow appears; the real product is buried below a hero and feature explanation.
- Mobile hierarchy is readable but oversized: large copy plus CTA pair plus pills plus preview card makes the first screen feel long before it feels actionable.
- The preview cards are polished, but several rows feel like fake product evidence rather than live state. They need to feel closer to module status or next action.
- The background grid is quiet, but across every route it starts to feel like template wallpaper rather than product atmosphere.

## Strongest Opportunities
- Convert one module route, preferably HQ or EasyList, from marketing hero into a real daily start surface: one next action, today context, and compact status.
- Reduce route chrome so the user sees the product first. Keep navigation useful but quiet.
- Give each module a distinct first task: capture a task, start a note, review open time, begin workout. Same system, different jobs.
- Replace feature pills with small state chips only when they communicate live usefulness.
- Use the right-side preview card as an active "today" panel rather than a decorative demo card.
- Establish a reusable app-page hierarchy: quiet app header, focused page title, primary action, compact status, then details.

## Priority Fix
Fix the brochure-first route hierarchy. Pick one primary working route and remove the marketing CTA stack from the first viewport: no "Start Free", no "See Features", no feature-pill confetti. Replace it with a focused daily action, a small today/status line, and one compact module preview that feels operational. Until that happens, the suite polish is just nice upholstery on the wrong chair.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: visual consistency and theme restraint improved, but the first screen still reads as product marketing instead of the daily operating spine.

## Designer Handoff
Next implementer should keep the calm teal system, generous mobile spacing, soft panel treatment, and strong type contrast. Change the first viewport behavior: make it feel like EasyLife is already helping the user, not pitching itself. Route navigation should become quiet utility chrome, while the content area should lead with one concrete job per module. The user should feel "I know what to do next" before they feel "I understand the feature set."

## What Not To Do Next
- Do not add more sections below the current hero. The page already explains too much.
- Do not create another theme pass before fixing hierarchy.
- Do not add more badges, pills, or preview rows to prove usefulness.
- Do not turn this into a larger dashboard redesign.
- Do not touch backend, auth, settings infrastructure, package files, or routing scope.
- Do not ignore mobile just because the current mobile screenshots are not broken.
- Do not make every module use the exact same hero formula.

## Next 5 Design Tasks
- [ ] On one primary working route, replace the "Start Free" and "See Features" CTA pair with one operational primary action; keep the change local and do not alter routing or auth.
- [ ] Remove or demote the feature-pill row on one module first viewport; preserve only chips that communicate actual state or immediate action.
- [ ] Convert one right-side module preview card into a "today status" panel with no more than four rows and one clear selected/current state.
- [ ] Reduce repeated page identity on one route by keeping only one product/module label above the fold; do not add new copy to compensate.
- [ ] Check the same route on mobile after the hierarchy change and ensure the primary action plus first status panel appears without cramped controls or clipped text.

## Stop Or Continue
continue but fix visual issues first