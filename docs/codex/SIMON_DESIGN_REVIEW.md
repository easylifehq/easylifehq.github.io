# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife now has a cleaner visual language, but it is still dressed like a polite product brochure when the mission needs a working daily operating system.

## Mission Fit
The direction partially matches the mission: the pages feel calmer, more consistent, and less chaotic across EasyList, EasyNotes, EasyCalendar, and EasyWorkout. The problem is Pack 1 is about the product spine, and the current visual evidence mostly shows module landing pages with hero copy, feature bands, and "Start Free" calls to action instead of a signed-in daily start surface that tells the user what to do next today. The suite looks more related, but it does not yet feel like one connected personal operating system.

## Taste Check
The restrained green, soft panels, rounded cards, and strong typography are moving toward a premium calm-product feel. The screenshots have a consistent rhythm and the module-specific mini previews are more convincing than generic SaaS clip art.

But the hierarchy is too marketing-first. Huge headlines, repeated feature sections, pill tags, and CTA buttons make every module feel like a separate brochure page. The app is saying "look at my positioning" when it should be saying "here is what needs your attention." Very neat. Too neat. Like the app ironed its shirt and forgot to do the work.

## Visual Problems To Fix
- The first visible surface in the screenshots is still dominated by product-page chrome: top nav, hero headline, "Start Free", "See Features", and feature bands. That competes with the actual working app mission.
- EasyList, EasyCalendar, EasyNotes, and EasyWorkout all use nearly identical hero-page structures, which creates consistency but also makes the modules feel like separate landing pages rather than connected tools inside one suite.
- The large hero headings consume too much first-viewport attention, especially on mobile, where the user must scroll before seeing anything that behaves like a real daily workflow.
- The "Products" and "Get Started" buttons are visually loud for a route that should be demonstrating product usefulness; they make the shell feel public-marketing first, app second.
- Feature cards below the hero repeat the promise instead of advancing the user's next action. They add polish, not utility.
- The module preview panels are the strongest app-like elements, but they are secondary to the hero copy. The useful artifact is buried beside the speech.
- Mobile screenshots show acceptable layout behavior, but the typography scale is too grand for a practical personal assistant app. It reads more like a campaign page than a daily tool.
- There is no screenshot evidence of the protected HQ first screen, so confidence is lower on whether the actual daily start surface satisfies the information-staging contract.

## Strongest Opportunities
- Make the signed-in Today/HQ surface the design anchor: one daily next action, today context, and compact module status should be the most visually important thing in the product.
- Convert the module pages from brochure heroes into app previews with immediate utility: recent tasks, next calendar window, latest note, current workout state.
- Reduce public-route chrome on demo/product surfaces so the actual module experience feels closer to the top.
- Use the current module preview cards as the design seed; expand their clarity, state, and action hierarchy instead of adding more explanatory sections.
- Establish one shared suite header pattern that feels like app navigation, not a landing-page navbar.
- On mobile, make the first viewport feel like a usable start surface with one primary action instead of a giant headline stack.

## Priority Fix
The single most important design problem is the marketing wrapper overpowering the app spine. Nami should reduce hero/CTA dominance and move the most app-like content up: Today context, one next action, and compact cross-module status must visually beat "Start Free", "See Features", and repeated feature explanations. Keep the calm visual system, but make the first screen behave like a personal assistant, not a product tour.

## Magic Improvement Score
SCORE: 2; DIRECTION: flat; ACTIVE_PACK: Pack 1 - Product Spine; REASON: polished module brochures still outweigh the daily operating-system spine.

## Designer Handoff
Keep the quiet green system, soft panels, strong type, and compact status rows. Change the hierarchy. The next batch should make EasyLife feel signed-in and useful earlier: a calm Today surface first, module status second, marketing explanation later or quieter. The user should feel, "I know what needs attention and where to go next," not "I have been introduced to four nicely named features." Remove chrome before adding sections. Let the app prove itself through state, not slogans.

## What Not To Do Next
- Do not add more feature sections, benefit cards, or explanatory bands.
- Do not make the module pages even more identical through more shared marketing structure.
- Do not introduce flashy dashboard widgets just to signal "operating system."
- Do not expand backend, auth, email automation, AI claims, or integration scope.
- Do not ignore mobile; the oversized headline issue is clearest there.
- Do not spend the next pass polishing nav pills while the first-screen job remains unresolved.

## Next 5 Design Tasks
- [ ] Reduce the public/demo route hero height so the module preview or Today-like status appears higher in the first viewport; do not add new sections or change routing.
- [ ] Quiet the top route chrome by making "Products" and "Get Started" visually secondary on module demo pages; preserve existing destinations and labels if behavior depends on them.
- [ ] Refactor one module hero into an app-first layout where the preview/status panel is visually primary and the explanatory copy is secondary; keep the change to one route.
- [ ] Audit mobile typography on one module page and reduce oversized first-screen type without making buttons or status rows harder to tap.
- [ ] Add screenshot evidence for the protected HQ/Today first screen and verify it shows one next action, today context, and compact module status before broad feature explanation.

## Stop Or Continue
continue but fix visual issues first