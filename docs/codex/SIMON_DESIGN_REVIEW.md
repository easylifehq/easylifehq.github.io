# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is finally finding a calm suite language, but Settings is still wearing too much chrome for a product that promised "what should I do next today?"

## Mission Fit
The direction mostly matches the mission: the visual system is cleaner, more connected, and more professional across EasyList, EasyCalendar, EasyNotes, and Settings. The problem is focus. Pack 1 is Product Spine, and the spine should make the signed-in daily operating system feel immediate. Settings still behaves like a configuration page with too many visible controls above the fold, while the marketing/product pages still read more like polished brochures than proof of one connected personal OS.

## Taste Check
The good: the paper-like background, restrained teal accents, firm typography, pill tags, and softened panels are moving toward a recognizable EasyLife house style. EasyList and EasyCalendar now have stronger first-screen confidence and less generic SaaS perfume.

The off: the design still loves explaining itself. Settings has a nice calm surface, then immediately asks the user to parse navigation, section chrome, accordions, support links, and multiple panels. The footer support link is skinny and awkward. The product pages are better, but still oversized and sales-led; useful, yes, but not yet "open this and run your day."

## Visual Problems To Fix
- Settings exposes 17 interactive controls above the fold on desktop, which violates the information staging contract and makes the page feel busier than the mission allows.
- Settings has repeated page identity: global shell says EasyLifeHQ, the page title says Settings, the left rail says Change section, the content header says Personalize, and the first card says Theme mode. That is a lot of labeling before the user gets one useful control.
- The Settings support link, "Report a Bug / Suggest an Improvement", is visually undersized and reads like a forgotten footer legal link instead of a usable support action.
- Settings uses stacked wrapper panels: page hero, section shell, subheader panel, card panel, inner current-selection panel, and accordion panels. The real control is buried under a little bureaucracy parade.
- Marketing pages still lead with large hero explanation and feature chips before proving the working app connection. It is handsome, but it still smells faintly like a launch page template.
- Mobile marketing screenshots show improved hierarchy, but the first screen remains long and dense; tags and secondary panels compete with the primary product promise.

## Strongest Opportunities
- Make Settings a compact control center: one calm heading, one primary setting group open, the rest collapsed behind clear section controls.
- Reduce repeated labels across the shell and page body so each route has one confident identity moment, not four.
- Bring the signed-in daily assistant idea forward: Settings should support the suite, not become a destination that explains the suite again.
- Make marketing pages show one concrete mini workflow earlier, especially the connection between list, calendar, and notes.
- Keep the tactile notebook language, but sharpen it with more whitespace discipline and fewer nested containers.

## Priority Fix
Fix Settings information staging next. Above the fold should show a simple Settings title, one short sentence, the active section selector, and only the current primary control group. Move secondary controls, explanatory detail, support links, and inactive setting groups behind collapsed sections or lower on the page. Nami should treat this as chrome reduction, not a redesign.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: suite styling is clearer, but Settings still overloads the first screen and weakens the daily operating-system spine.

## Designer Handoff
Keep the calm paper surface, teal accent, strong black type, and compact rounded controls. Change the hierarchy: fewer wrappers, fewer repeated labels, fewer visible actions at once. Settings should feel like a quiet control room, not a filing cabinet with all drawers open. The user should feel, "I can adjust the suite quickly and leave," not "I have entered the preferences department."

## What Not To Do Next
- Do not add another Settings section to compensate for the current clutter.
- Do not add more feature cards to marketing pages before the app spine is clearer.
- Do not make the Settings page more decorative; the issue is hierarchy, not ornament.
- Do not touch auth, backend, package, deployment, or data behavior while fixing visual staging.
- Do not ignore mobile after desktop passes; the current visual language can get heavy quickly on small screens.

## Next 5 Design Tasks
- [ ] Settings first-screen reduction: keep one Settings title, one current section, and one primary control group above the fold; move inactive/detail controls behind existing disclosure patterns.
- [ ] Settings support action polish: turn the footer support link into a properly sized quiet button or move it into a lower support section; do not place it above primary settings.
- [ ] Settings wrapper audit: remove or flatten one layer of nested panel styling so controls do not feel buried; preserve existing behavior.
- [ ] Product page first-proof pass: on one marketing route, bring a concrete app workflow preview higher than secondary feature explanation; do not add new sections.
- [ ] Mobile hierarchy check: verify EasyNotes, EasyList, EasyCalendar, and Settings have no clipped text, crowded tag rows, or competing first-screen actions after the Settings cleanup.

## Stop Or Continue
continue but fix visual issues first