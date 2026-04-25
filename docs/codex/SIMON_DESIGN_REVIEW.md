# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is getting calmer and more deliberate, but the current visual proof still says "polished landing page" more than "connected personal operating system."

## Mission Fit
The work is mission-aligned: small frontend polish, shared CSS cleanup, tighter copy, and app-level hierarchy passes all support a cleaner suite. The weakness is evidence. The screenshots mainly show the root page, while the changed files are mostly core app screens, so confidence is lower that EasyList, EasyNotes, EasyCalendar, EasyWorkout, and Settings truly feel unified in daily use.

## Taste Check
The root page has a more premium posture: restrained color, confident typography, soft panels, and a clear product promise. The glassy surfaces and teal accent feel current without becoming nightclub SaaS, merci. The weaker taste note is scale control: mobile typography, chips, and hero spacing are large enough to feel a bit bloated, and the desktop hero has a lot of decorative air before the product earns it. The brand system is cleaner, but not yet sharp enough to feel inevitable.

## Visual Problems To Fix
- Mobile `a.site-brand` is reported as a small tap target, which is unacceptable for the first interactive element on the page.
- Mobile hero content is oversized: headline, buttons, and chips compete for space instead of creating a fast path to action.
- The root mobile screenshot cuts into the feature panel below the fold awkwardly, making the page feel long before it feels useful.
- Desktop root layout has a large vertical quiet zone between header and hero; it reads more like spacing drift than intentional drama.
- The pill chips are visually heavy on mobile and pull attention away from the primary call to action.
- App-level screenshots are missing for the main changed areas, so suite consistency is not proven.
- Repeated `globals.css` edits create broad visual-regression risk across cards, panels, buttons, and mobile wrapping.

## Strongest Opportunities
- Turn the next pass into proof of system: capture the five core app areas on desktop and mobile, then fix the visible inconsistencies.
- Make the suite shell unmistakable with consistent page headers, section rhythm, card density, and empty-state language.
- Reduce mobile visual bulk so EasyLife feels fast and composed, not just enlarged.
- Use accent color as a functional signal for app identity and state, not as decorative frosting.
- Make Settings feel like the command center by tightening grouping, hierarchy, and control descriptions.

## Priority Fix
Fix mobile shell ergonomics first, starting with the reported `a.site-brand` tap target and the oversized root mobile hero rhythm. Make the brand link comfortably tappable, keep the header compact, reduce chip/button bulk where needed, and preserve the current calm brand tone. This is the small premium detail that separates "nice CSS" from a product that respects the user's hands.

## Designer Handoff
Keep the restrained teal, soft-panel language, and professional typography direction. Change the next batch from generic polish to suite validation: inspect EasyList, EasyNotes, EasyCalendar, EasyWorkout, and Settings on desktop and mobile, then normalize one visible pattern at a time. Prioritize header rhythm, card density, metadata hierarchy, and mobile tap comfort. The user should feel like every page belongs to the same operating system and that the interface is ready for daily use, not posing for a Dribbble thumbnail.

## What Not To Do Next
- Do not add more landing-page sections to compensate for weak app evidence.
- Do not keep touching `globals.css` without visual checks across the core app pages.
- Do not make the theme louder before the hierarchy is tighter.
- Do not add new product features, backend scope, auth scope, routing changes, dependencies, or architecture work.
- Do not chase "Apple-like" gloss while mobile sizing and tap targets still need discipline.
- Do not ignore the root mobile issue because it is only medium severity.

## Next 5 Design Tasks
- [ ] Fix the mobile `a.site-brand` tap target to meet comfortable touch sizing, keeping routing and layout behavior unchanged.
- [ ] Capture desktop and mobile screenshots for EasyList, EasyNotes, EasyCalendar, EasyWorkout, and Settings before more shared CSS polish.
- [ ] Tighten the root mobile hero scale by reducing visual bulk in chips, spacing, or button rhythm without changing copy meaning or navigation.
- [ ] Normalize one core app page header to the suite pattern, changing only spacing, hierarchy, or helper-copy presentation.
- [ ] Audit one card-heavy app page for metadata clutter and reduce visual noise without removing existing content or behavior.

## Stop Or Continue
continue but fix visual issues first