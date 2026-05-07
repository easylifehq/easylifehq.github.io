# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is finally developing a recognizable calm suite language, but it still presents too much like a product brochure and not enough like the user's daily command surface.

## Mission Fit
The direction matches the mission in broad visual system terms: shared headers, calm green-gray palette, consistent cards, and quieter product modules are helping EasyLife feel more connected. The miss is the first-screen contract. The visible screens still lean toward explaining each product instead of immediately helping the signed-in user decide what to do next today. That is the whole job. The app cannot win by being a handsome directory.

## Taste Check
The best parts are the restrained palette, tactile card borders, strong typography, and more consistent suite chrome across EasyList, EasyNotes, EasyCalendar, EasyWorkout, and Settings. The mobile typography has presence, and the product cards feel more intentional than the earlier scattered app surfaces.

What feels off: the marketing/product pages are too repetitive in structure, with giant headlines, pill lists, preview panels, and "Open workspace" buttons repeated across modules. It is tidy, but it is still template-tidy. Settings has the worst visual problem: the desktop header is cramped and partially overlapping, which makes the suite shell look unfinished exactly where trust matters.

## Visual Problems To Fix
- Settings desktop header has visible crowding/overlap around the EL mark and Today nav item; this is a real polish failure, not a nuance.
- Settings mobile nav targets are too short at 32px, making the primary route controls feel cramped and underbuilt for touch.
- The public product pages repeat the same identity pattern: badge, huge headline, supporting paragraph, "Open workspace", pill row, preview card, features section. It creates suite consistency, yes, but also factory sameness.
- The customer-facing product pages show two layers of identity: global EasyLifeHQ header plus each module's oversized intro. The result is not a double header exactly, but it does feel like the route explains itself twice before the user gets utility.
- The first viewport on module pages is still promotional. It sells EasyList, EasyNotes, EasyCalendar, and EasyWorkout instead of behaving like an active personal operating system.
- Preview panels are visually pleasant but mostly decorative; they simulate useful state without making a real next action feel primary.
- Settings uses large cards inside a large page shell, then nested control panels below. It reads like settings are being displayed in display cases. Very museum gift shop, less control center.
- The background grid is elegant in small doses, but on long pages it starts to feel like a styling crutch behind too many white cards.

## Strongest Opportunities
- Make HQ/Today the proof point: one daily read, one recommended action, one capture affordance, and compact module status above everything else.
- Reduce route chrome on app surfaces so the user sees the actual work area first, not a wrapper describing the product category.
- Turn module previews into actionable compact status blocks: next task, next calendar window, recent note, next workout state.
- Normalize nav sizing across desktop and mobile so the shell feels intentionally touchable everywhere.
- Give Settings a denser control-center layout with fewer nested panels and stronger section rhythm.

## Priority Fix
Fix the Settings shell/nav sizing and overlap first. The current desktop Settings header visually collides around the logo and route pills, while mobile nav controls miss comfortable tap height. This is the shared suite frame, so when it looks cramped, every app underneath inherits the cheapness. Nami should make the header targets at least 44px tall, preserve route labels, prevent logo/nav collision at desktop widths, and verify Settings desktop and mobile screenshots before touching another surface.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: AI Personal Assistant Stage 0 - Salvage Audit; REASON: suite language is more coherent, but the assistant-first surface is still not visually proven.

## Designer Handoff
Keep the current quiet tactile system: green-gray accents, strong black type, restrained cards, and direct language. Change the hierarchy from "module marketing page" to "daily operating surface." The next batch should subtract chrome, fix nav/tap mechanics, and make every first screen answer "what should I do now?" before it explains what the module is. The user should feel less like they are touring a suite and more like they just opened a calm assistant that already knows the shape of their day.

## What Not To Do Next
- Do not add more feature sections to the module pages.
- Do not invent new AI claims, backend behavior, assistant magic, or integrations.
- Do not make the palette louder to create excitement; the product needs confidence, not confetti.
- Do not broaden the repair into a full navigation rewrite.
- Do not ignore mobile tap targets because the desktop layout looks almost acceptable.
- Do not keep polishing marketing previews while the signed-in first screen remains unproven.

## Next 5 Design Tasks
- [ ] Fix Settings header/nav touch targets to minimum 44px height on desktop and mobile, preserving current routes and labels.
- [ ] Repair the Settings desktop logo/nav overlap without changing routing, auth, settings logic, or product menu behavior.
- [ ] Reduce one repeated product-page intro pattern by tightening the module hero spacing or pill row, keeping the existing visual system intact.
- [ ] Convert one decorative module preview row into a clearer compact status/action row, using existing static/local data only.
- [ ] Recheck mobile screenshots for Settings and one module page, with guardrails against clipped text, cramped buttons, and nested panel clutter.

## Stop Or Continue
continue but fix visual issues first