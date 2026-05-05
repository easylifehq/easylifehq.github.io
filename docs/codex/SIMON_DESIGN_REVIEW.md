# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is calmer and more coherent than before, but the current evidence still shows polished product brochure pages more than a signed-in personal operating system.

## Mission Fit
The direction partially matches the mission: the visual language is connected across EasyList, EasyNotes, EasyCalendar, and EasyWorkout, and the copy is more concrete than generic SaaS fog. But Pack 1 is about the product spine, and the strongest proof should be the protected HQ first screen. The latest screenshots do not show that HQ daily start surface, so confidence is lower. What I can see still spends too much first-screen attention on route chrome, product marketing buttons, feature chips, and explainer panels before proving the daily assistant job.

## Taste Check
The good: the typography has real weight, spacing is mostly generous, the muted green system feels calm, and the repeated card language gives the suite a recognizable house style. The UI is not screaming for attention, which is already better than half the productivity category.

The weak: the pages still have a demo-site smell. "Start Free", "See Features", feature sections, nav labels, and big brochure heroes make the surfaces feel like product landing pages instead of working tools. The palette is also flirting with one-note teal hospital stationery. Nice enough, but it needs more product utility and less tasteful waiting room.

## Visual Problems To Fix
- The available screenshots do not include the protected HQ first screen, which is the actual Pack 1 contract. Judging the product spine from module marketing pages is incomplete evidence.
- Customer-facing route chrome is visually loud: the top nav, Products button, Get Started button, hero CTA buttons, feature chips, and feature section all compete before the user sees a working product surface.
- There is repeated page identity: the shell says EasyLifeHQ, then each route restates the app name in a large hero band, then repeats feature framing below. It makes the real app feel buried under its own introduction.
- The first viewport on mobile is too tall and too explanatory. The user gets brand, app name, headline, paragraph, two CTAs, chips, and a sample panel before reaching anything that behaves like the actual product.
- The module pages are visually consistent but overly templated. EasyList, EasyNotes, EasyCalendar, and EasyWorkout share the same brochure recipe so closely that the suite feels branded, not necessarily alive.
- Pills and chips are overused as decoration. On mobile, they read as controls even when they are just labels, which weakens interaction clarity.
- The feature cards below the hero are clean, but they arrive too early and add another explanatory layer instead of advancing the primary daily workflow.
- The light grid background is tasteful but a little too visible behind stacked white panels, making the page feel designed-around rather than task-centered.

## Strongest Opportunities
- Show the HQ daily start route in the visual QA set and judge it first. Pack 1 cannot be called healthy without that screen.
- Reduce the module route chrome so the first viewport feels like a live product preview: one title, one primary action, one compact status surface, then quiet navigation.
- Convert decorative chips into either real filters/actions or remove them from the first viewport.
- Make mobile more ruthless: brand, one clear job, one next action, and one compact proof panel. Everything else can wait.
- Give the suite one shared app-shell language that is quieter than these marketing routes: less "features", more "today", "capture", "plan", "review".
- Add a little contrast in surface treatment across module previews so the pages feel connected without looking stamped from the same mold.

## Priority Fix
The next design fix is to reduce first-screen chrome and repeated identity on the visible product/module routes, then capture the protected HQ first screen as proof. Keep one app label, one primary action, and one compact status preview above the fold; move feature chips, secondary CTA weight, and explanatory feature sections below the first decision point. Nami should treat this as subtraction, not a new layout invention.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: the suite styling is calmer and more consistent, but the evidence still misses the HQ spine and visible routes carry too much brochure chrome.

## Designer Handoff
For the next batch, design like the user already owns the product. Keep the calm typography, rounded panels, muted green accents, and concrete daily-life copy. Change the first viewport hierarchy: demote marketing navigation, remove or push down decorative chips, make CTAs less shouty when they are not the primary daily action, and let the product/status panel do more of the talking. The result should feel like opening a useful personal assistant, not being sold four separate mini apps in matching uniforms.

## What Not To Do Next
- Do not add more sections to prove usefulness. The problem is too much explanation, not too little.
- Do not introduce a new visual system or dependency.
- Do not make a dashboard mega-surface with every module visible at once.
- Do not polish only desktop; mobile is where the hierarchy currently gets most bloated.
- Do not chase brighter colors, gradients, or decorative motion to create "magic".
- Do not touch backend, auth, Firebase, deployment, packages, or data behavior.
- Do not keep reviewing only module brochure routes while the HQ first screen remains unproven.

## Next 5 Design Tasks
- [ ] Add HQ daily start screenshots to visual QA evidence on desktop and 390px mobile; guardrail: no app code changes, evidence only.
- [ ] On one module route, remove or demote one repeated identity layer above the fold; guardrail: preserve route, copy meaning, and all existing actions.
- [ ] Convert the first-row chips on one route into quieter secondary metadata or move them below the hero; guardrail: do not add new controls or behavior.
- [ ] Reduce mobile first-viewport height on one module page by tightening CTA/chip spacing; guardrail: keep tap targets usable and no clipped text.
- [ ] Make one secondary CTA visually quieter where the primary action already leads; guardrail: no new colors, no new component system, no route changes.

## Stop Or Continue
continue but fix visual issues first