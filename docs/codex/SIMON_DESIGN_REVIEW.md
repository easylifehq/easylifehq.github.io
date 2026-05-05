# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
The screens are cleaner and more coherent, but EasyLife still looks like a tasteful product brochure pretending to be a personal operating system.

## Mission Fit
The direction partially matches the mission: shared typography, spacing, panels, and teal accents are helping the suite feel connected. The miss is structural. Pack 1 is Product Spine, and the current screenshots still prioritize module pitch pages with "Start Free", "See Features", feature cards, and marketing-style proof panels instead of a signed-in daily start surface that tells the user what to do next today.

## Taste Check
The best work is the restraint: the palette is calm, the cards have consistent borders, the type has confidence, and the module previews feel more intentional than the earlier generic dashboard smell. The language is also more human than SaaS foam.

The weak part is hierarchy and purpose. Every module is framed like a landing page: giant slogan, CTA pair, chips, preview card, then feature section. That is polished, yes, but it is not yet useful. The mobile views especially feel inflated: the first viewport spends too much space on brand chrome, oversized type, and selling the screen back to the user. A personal OS should help me move; this keeps introducing itself at the door.

## Visual Problems To Fix
- Mobile has a repeated identity stack: a large EasyLifeHQ header card sits above another full product hero, making the actual module feel buried under route chrome.
- Customer-style CTAs such as "Start Free", "Get Started", and "See Features" dominate working app routes, which breaks the signed-in product illusion.
- The first screen is still module marketing, not daily action: the user sees slogans and feature chips before an actionable task, note, calendar block, or workout state.
- Desktop top navigation is visually loud for a demo route; "Products" and "Get Started" compete with the module preview and make the page feel like a public site.
- The hero cards repeat the same pattern across EasyList, EasyNotes, EasyCalendar, and EasyWorkout so strongly that the modules feel templated rather than purpose-built.
- Feature sections arrive too early and too large; they read as brochure inventory instead of progressive disclosure.
- Mobile typography is handsome but oversized for an operating surface, causing long scroll before useful detail appears.
- Preview panels are promising, but they are trapped inside explanatory hero layouts instead of being promoted into the real product surface.

## Strongest Opportunities
- Convert the protected first screen into a true daily start: one next action, today context, and compact statuses from tasks, notes, calendar, and workouts.
- Quiet the route chrome on app/demo surfaces so navigation supports the product instead of announcing the wrapper.
- Replace marketing CTAs with working actions: "Add task", "Capture note", "Plan block", "Start workout", "Review today".
- Make each module preview feel operational: show selected state, empty state, next step, and one clear primary action.
- Use the current visual system as the base, but reduce hero scale and move feature explanation behind tabs, accordions, or secondary sections.

## Priority Fix
Fix the first-screen hierarchy before adding anything else. The next batch should remove customer-facing CTA chrome from signed-in/demo app routes and replace the module hero pattern with a compact operational start: today's next action first, then module status, then quiet navigation. The app should stop pitching EasyLife and start behaving like EasyLife.

## Magic Improvement Score
SCORE: 2; DIRECTION: flat; ACTIVE_PACK: Pack 1 - Product Spine; REASON: cleaner module polish, but the product spine is still hidden behind brochure-style pages.

## Designer Handoff
Keep the calm palette, card discipline, tactile borders, and confident typography. Change the page purpose. Treat the first screen as a working personal assistant, not a product tour: reduce the header height, demote or remove "Start Free" and "See Features", make the first visible card an actionable today panel, and let module explanation live lower or behind secondary controls. The user should feel "I know what to do next" within five seconds, not "this app has a nice positioning statement."

## What Not To Do Next
- Do not add more feature sections.
- Do not add another module or phase surface until the first screen works.
- Do not make the navigation louder to solve discoverability.
- Do not add dashboards, charts, or big summary widgets as decoration.
- Do not keep public-site CTAs on signed-in working routes.
- Do not ignore mobile; mobile is where the brochure problem becomes most obvious.

## Next 5 Design Tasks
- [ ] Reduce mobile route chrome on module pages to one compact brand/nav row; guardrail: no new navigation items and no auth/routing changes.
- [ ] Replace "Start Free" and "See Features" on app/demo module routes with one working primary action and one quiet secondary action; guardrail: copy/UI only, preserve behavior.
- [ ] Create a compact Today-first panel on HQ with one next action and 3-4 module statuses; guardrail: use existing/mock data only and keep it above feature inventory.
- [ ] Demote feature cards below the first operational viewport on EasyList, EasyNotes, EasyCalendar, and EasyWorkout; guardrail: do not add new sections.
- [ ] Tune mobile type and spacing so the first actionable panel appears without excessive scrolling; guardrail: CSS/layout only, no component rewrite.

## Stop Or Continue
continue but fix visual issues first