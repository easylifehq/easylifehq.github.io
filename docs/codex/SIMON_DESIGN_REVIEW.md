# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is cleaner and calmer than before, but it still presents its modules like polished brochure pages instead of one working personal operating system.

## Mission Fit
The direction supports the EasyLife mission in tone: restrained color, consistent cards, direct language, and calm spacing are all moving toward a professional personal suite. The problem is hierarchy. Pack 1 is about the product spine, and the current screenshots still show separate product-marketing surfaces for EasyList, EasyNotes, EasyCalendar, and EasyWorkout, with "Start Free", "See Features", feature sections, and route chrome competing with the signed-in user's daily next action. That is not yet a daily operating spine. It is a showroom with better lighting.

## Taste Check
The best part is the restraint: the teal accent is disciplined, the typography has weight, the cards are tidy, and the module examples feel more tactile than generic SaaS filler. The product language is also less vague than earlier passes.

What feels off is the repeated landing-page formula. Every module uses the same oversized hero, badge label, CTA pair, pills, preview panel, and features block. It is consistent, yes, but consistency alone is not product maturity. On mobile, the type gets heroic for routine app tasks, the cards become long scroll slabs, and the user sees a pitch before they see the tool. The suite currently feels designed to sell EasyLife, not to use EasyLife.

## Visual Problems To Fix
- The module pages repeat a customer-facing marketing structure: hero headline, "Start Free", "See Features", feature cards, and explanatory preview. On signed-in app routes, that is mission-breaking clutter.
- The top route chrome repeats product identity before the module identity appears, especially on mobile where the logo bar consumes the first screen and delays the actual task surface.
- Each module has the same visual rhythm, which creates sameness without stronger product hierarchy. EasyList, EasyNotes, EasyCalendar, and EasyWorkout should feel related, not cloned.
- The first viewport does not consistently answer "what should I do next today?" It answers "what is this module?" That violates the Information Staging contract.
- Mobile headings are too large for working app surfaces. They are readable, but they turn utility screens into billboards.
- The CTA pair "Start Free" and "See Features" is wrong for an internal product surface. It makes the protected app feel like a public promo page.
- The preview panels are attractive but too explanatory. They show example content as proof-of-concept instead of behaving like immediate, actionable status.
- Pills under the hero add more chrome without much decision value. They read as product claims, not controls.
- Feature sections below the hero are polished but premature. They push the screen toward a brochure stack instead of progressive disclosure.
- The background grid is quiet enough, but paired with large cards everywhere it makes the app feel like a designed template rather than a personal workspace.

## Strongest Opportunities
- Convert the module landing format into a working route pattern: compact route header, one primary action, current status, and recent useful items.
- Replace "Start Free" and "See Features" on app routes with contextual actions like "Add task", "Brain dump", "Plan block", or "Log set".
- Make HQ the spine: one daily next action, today context, and compact module status should lead before any module explanation.
- Give each module a distinct operational texture while keeping shared shell rules: tasks need urgency, notes need writing focus, calendar needs time structure, workout needs fast logging.
- Use progressive disclosure aggressively. Keep detail, feature explanation, and educational copy behind tabs, accordions, drawers, or secondary routes.
- Tighten mobile first screens so the user gets a useful control or status before the second scroll. Big type is lovely until it blocks the work.

## Priority Fix
Remove the brochure chrome from signed-in module routes. Start with one route, ideally EasyList or HQ, and replace the hero/CTA/features pattern with a compact working surface: route title, today's most important state, one primary action, and two or three compact status rows. Keep the shared visual language, but stop making the user walk through a sales lobby to get to their own life.

## Magic Improvement Score
SCORE: 2; DIRECTION: flat; ACTIVE_PACK: Pack 1 - Product Spine; REASON: cleaner surface polish, but the active pack is still blocked by marketing-style module hierarchy instead of a daily operating spine.

## Designer Handoff
Next implementer should subtract, not decorate. Keep the calm teal system, the soft panels, the strong typography, and the compact example rows. Change the page model: internal routes should feel like tools already in use, not product pages explaining themselves. Replace repeated hero CTAs with immediate app actions, reduce mobile heading scale, collapse feature education below the working surface, and make each first screen feel like "I know what to do next" within five seconds. The user should feel less pitched to and more quietly assisted.

## What Not To Do Next
- Do not add more sections below the current module pages.
- Do not create another dashboard panel unless it clarifies the daily next action.
- Do not keep polishing "Start Free" and "See Features" on protected app routes. The problem is their existence.
- Do not solve this with more color, gradients, icons, or decorative cards.
- Do not broaden into backend, auth, package, routing, or data changes.
- Do not ignore mobile. The mobile screenshots reveal the hierarchy problem faster than desktop.
- Do not make every module page identical in the name of suite consistency.

## Next 5 Design Tasks
- [ ] Replace the EasyList app-route hero CTA pair with one contextual primary action and one quiet secondary action; do not add new sections or change data behavior.
- [ ] Reduce mobile module heading scale and top spacing on one route; keep desktop hierarchy intact and verify no text wraps awkwardly.
- [ ] Move one module's feature explanation below a quieter disclosure pattern; preserve existing copy where possible and avoid adding new claims.
- [ ] Convert one preview panel from explanatory demo content into current-status style rows with clear labels and one obvious next action.
- [ ] Audit the protected HQ first viewport for the Information Staging contract; remove one piece of chrome that does not support today's next action.

## Stop Or Continue
continue but fix visual issues first