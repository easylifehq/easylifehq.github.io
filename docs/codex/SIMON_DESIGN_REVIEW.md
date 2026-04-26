# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
The system is calmer and more coherent, but it still feels like a polished product brochure more than a signed-in personal operating system.

## Mission Fit
The direction supports Pack 1 - Product Spine in surface language, shared navigation, spacing, and calmer module identity. The problem is evidence: the latest screenshots mostly show marketing/product pages, not the protected HQ or daily workflow spine where the mission actually lives. Confidence is lower on the signed-in experience because the visual proof is still orbiting the showroom.

## Taste Check
The best parts are the restrained color system, clear module names, confident typography, and useful product-specific copy. EasyList and EasyWorkout finally sound less like generic SaaS and more like actual daily tools. The weak part is repetition: every page uses the same hero-card, right-side demo panel, pill stack, feature-card formula. It is clean, yes, but a little too obedient. Hospitality-grade design needs rhythm, not photocopies.

## Visual Problems To Fix
- The mobile header consumes too much first-screen height before the user reaches meaningful content.
- Hero cards are visually dominant across every product page, making the suite feel templated instead of product-specific.
- The right-side demo panels on desktop are useful, but they are all too similar in structure, scale, and tint.
- Mobile pages stack hero, chips, and demo panel into a long preamble before users reach feature content.
- Pills still read as decorative chrome in several places, especially when they wrap into multiple rows on mobile.
- The background grid is quiet but too persistent, making pages feel like one repeated marketing canvas.
- Feature cards below the fold are clean but conventional; they do not yet reveal enough of the actual working product.
- The latest visual evidence does not prove that HQ, EasyList dashboard, EasyCalendar, EasyNotes library, Settings, and EasyWorkout protected views now feel like one signed-in system.

## Strongest Opportunities
- Make the signed-in HQ first screen the visual north star, then let marketing borrow from it instead of the reverse.
- Reduce repeated pill treatments and replace them with compact inline metadata where the information is secondary.
- Give each core module one distinct working-surface pattern: list density for EasyList, writing calm for EasyNotes, time grid authority for EasyCalendar, session focus for EasyWorkout.
- Tighten mobile top spacing so the first viewport shows action plus status, not just branding and promise.
- Use fewer boxed sections and more confident full-width hierarchy, especially on protected pages.
- Make one suite-level navigation/state treatment feel unmistakably shared across protected modules.

## Priority Fix
Fix the protected HQ and core module first-screen hierarchy before adding any more polish. The next task should use visual evidence from signed-in routes, not marketing pages, and make the primary daily action, current status, and cross-module relationship visible above the fold on desktop and mobile. The user should open EasyLife and immediately know what needs attention, where to capture something, and which module is carrying the day.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: calmer shared language and visual consistency improved, but the proof still feels too marketing-led and not enough signed-in product spine.

## Designer Handoff
Keep the calm teal-forward system, the direct copy, the restrained typography, and the general spacing discipline. Change the emphasis: stop making every surface introduce itself like a product page. On the next batch, work inside the protected experience and make it feel like a daily cockpit without saying "cockpit" or "command center." Prioritize one decisive first screen with useful density, visible current state, fewer pills, and a stronger relationship between HQ and the modules. The user should feel, "I can run my day from here," not "I am being sold a nice app."

## What Not To Do Next
- Do not add more marketing sections.
- Do not create another hero-card variation and call it progress.
- Do not add decorative badges, gradients, or pill rows to fake depth.
- Do not broaden scope across every module in one pass.
- Do not touch backend, auth, routing, packages, persistence, or data models.
- Do not ignore mobile compression; the current mobile rhythm is still too tall.
- Do not treat the automated "no visual bugs" result as design approval.

## Next 5 Design Tasks
- [ ] Capture or inspect signed-in HQ desktop and mobile screenshots, then reduce top chrome so the main daily action and one suite status appear in the first viewport.
- [ ] On the protected HQ page, quiet one secondary card treatment by removing extra border, pill, or shadow chrome without changing content or behavior.
- [ ] On one protected module dashboard, replace a decorative chip row with compact inline metadata and verify mobile wrapping stays clean.
- [ ] Align protected module page headers to one shared hierarchy: module label, concrete page title, primary action, and restrained status text only.
- [ ] Review mobile screenshots for EasyList, EasyCalendar, EasyNotes, EasyWorkout, and Settings, then fix one visible cramped or overly tall first-screen section only.

## Stop Or Continue
continue but fix visual issues first