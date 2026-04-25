# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is starting to look cohesive and calm, but it still reads more like a polished product brochure than a daily operating system.

## Mission Fit
The shared visual language is clearly improving: consistent shell, teal system color, restrained surfaces, repeated hero/product-card pattern, and more intentional copy across EasyList, EasyNotes, EasyCalendar, and EasyWorkout. That supports the connected-suite mission. The problem is emphasis: the inspected screens spend too much first-view real estate selling the products instead of showing the user what needs attention, what is scheduled, what was captured, or what to do next. For EasyLife 5.0, the suite needs to feel operational, not merely branded.

## Taste Check
The best parts are the calm palette, confident type scale, strong product naming, tidy buttons, and a recognizable system rhythm across apps. The pages now have a more adult point of view.

The weaker parts are the giant marketing heroes, oversized pills, large empty vertical bands, and repeated "EasyLifeHQ product" cards. It is all very composed, but a little too showroom. The grid background is tasteful in moderation, but across every page it starts to feel like the app is wearing the same expensive sweater to every meeting.

## Visual Problems To Fix
- Mobile headers consume too much vertical space before the actual product content appears.
- The hero cards are too large on mobile, pushing useful content below the fold.
- Product chips are oversized on mobile and become visual clutter instead of quick scannable metadata.
- Desktop pages rely on the same two-column hero formula, making each product feel related but not meaningfully distinct.
- The right-side "EasyLifeHQ product" panel repeats obvious branding without enough functional value.
- The visual hierarchy is too headline-heavy; page content below the hero feels secondary even when it should carry the workflow.
- The background grid is visible behind every major surface and risks becoming decorative noise.
- Settings has a reported route warning on `/settings` in desktop and mobile visual QA, which damages trust even if the screenshot itself is not available here.
- Confidence is slightly lower for Settings because the supplied screenshot list did not include the actual settings screenshots, only the visual bug report evidence.

## Strongest Opportunities
- Replace some marketing hero weight with operational previews: today, next, captured, scheduled, recently completed.
- Make each app page share the same shell but expose a distinct workflow pattern, not just a distinct headline.
- Tighten mobile spacing so users reach actionable content faster.
- Turn repeated product panels into suite-connection panels that show how this app relates to the others.
- Use smaller, sharper metadata chips and reserve large rounded pills for primary filters or meaningful states.
- Give Settings a more control-center feeling with grouped system preferences and quieter explanatory copy.

## Priority Fix
Fix the first-screen hierarchy on mobile. The current mobile experience makes users scroll through a brand block, a large hero, oversized chips, and a secondary product panel before they reach anything that feels like daily-use software. Nami should compress the mobile hero rhythm, reduce chip scale, and bring one concrete workflow cue into the first screen for each app.

## Designer Handoff
Keep the calm teal system, the confident typography, and the clean card language. Change the balance from marketing to utility: every main app should still feel like EasyLife, but the first screen should tell the user what they can do today, not just what the product promises. Reduce decorative repetition, make mobile denser without becoming cramped, and convert secondary panels from brand reassurance into connected-suite context. The user should feel, "I can run my day from here," not "I have arrived at a lovely SaaS landing page."

## What Not To Do Next
- Do not add more sections below the current pages to compensate for weak first-screen hierarchy.
- Do not add more gradients, shadows, or decorative panels.
- Do not make every app page more identical; shared system does not mean cloned composition.
- Do not chase new backend, auth, analytics, settings persistence, or routing scope.
- Do not ignore the `/settings` route warning just because the visible pages look decent.
- Do not enlarge the chips or buttons further on mobile.
- Do not solve premium feel by adding more white space; there is already plenty.

## Next 5 Design Tasks
- [ ] Mobile hero compression pass: reduce first-screen vertical height on one main app page while preserving readable heading, copy, and primary actions.
- [ ] Chip scale cleanup: make product chips smaller and more metadata-like on mobile, with no wrapping overlap or tap-target regression.
- [ ] Suite connection panel rewrite: replace one repeated "EasyLifeHQ product" panel with a functional cross-app cue that explains what this app hands off to another app.
- [ ] Settings visual QA repair: fix the `/settings` route warning without changing auth, routing architecture, backend, dependencies, or settings behavior.
- [ ] Desktop differentiation pass: adjust one app landing layout detail so it feels product-specific while keeping the shared EasyLife shell.

## Stop Or Continue
continue but fix visual issues first