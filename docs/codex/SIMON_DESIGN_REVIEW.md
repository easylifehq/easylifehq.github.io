# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
The work is cleaner and more unified, but it still reads too much like a tasteful product brochure and not enough like a daily operating system.

## Mission Fit
The direction partially matches the mission: the shared typography, spacing, soft surfaces, and repeated product-card language make EasyLife feel more connected across EasyList, EasyNotes, EasyCalendar, and EasyWorkout. The problem is that the visible screenshots are mostly landing-style pages, not lived-in app workflows, so the design is selling the suite more than proving the suite. Settings is worse: `/settings` renders as an empty pale page with route warnings, which breaks the "control center" promise entirely.

## Taste Check
The premium parts are real: the large type has confidence, the soft green system has a calm wellness-product quality, the cards are restrained, and the product pages now feel like siblings. The logo/header treatment is much more composed than generic SaaS chrome.

What is off: the palette is getting too mint-on-mint, the chip pills are oversized on mobile, the hero cards repeat the same formula too mechanically, and the huge vertical gaps make the experience feel staged instead of fast. The mobile pages are readable but bloated. A personal operating system should not need this much air to say "write a note."

## Visual Problems To Fix
- `/settings` desktop and mobile appear blank with "No routes matched location "/settings"" warnings, so the Settings control-center experience is currently not visible.
- The mobile header leaves an enormous dead vertical band before the hero content, making first paint feel slow and underdesigned.
- Product chips on mobile are too large and too pill-heavy, creating a toy-like rhythm against otherwise professional type.
- The hero template is nearly identical across EasyList, EasyNotes, EasyCalendar, and EasyWorkout, which helps consistency but weakens product specificity.
- The right-side desktop product card has too much unused vertical space and reads like decorative filler instead of a useful suite preview.
- The grid background is elegant at first glance but becomes a little design-studio wallpaper when repeated across every product page.
- Secondary feature cards are visually competent but generic: label, headline, paragraph, repeat. There is no useful density or operational signal.
- Mobile content scale is too inflated below the hero, especially the supporting card headline and pill labels.

## Strongest Opportunities
- Turn the product-card area into a real miniature workflow preview per app: tasks triage, note list, calendar blocks, workout logging.
- Reduce mobile vertical drama so users see meaningful content faster, especially below the header.
- Make Settings visible and polished before touching another product page. The suite needs its control room.
- Introduce subtle product-specific artifacts while keeping the shared shell: calendar time blocks, task status rows, note snippets, workout set rows.
- Tighten chips into compact tags, especially on mobile, so they support hierarchy instead of competing with the headline.
- Use one shared app-page rhythm, but vary the proof area so each product earns its claim.

## Priority Fix
Fix Settings visibility first. The current `/settings` screenshots are blank, which is not a visual polish issue, it is a trust issue. Nami should make the existing Settings route render correctly in both desktop and mobile screenshots, then verify the page has a clear suite-control hierarchy: title, short helper copy, grouped controls, and restrained spacing. No new settings, no auth/account changes, no backend scope.

## Designer Handoff
Keep the calm shell, strong type, softened panels, and shared EasyLife visual language. Change the pages from brochure repetition into product proof: each app should show one compact, real-feeling interface artifact inside the existing hero/product panel instead of another empty marketing card. Tighten mobile spacing, shrink tags, reduce dead air, and make the first viewport feel useful faster. The user should feel "this is my calm command center," not "this is a very polite landing page trying to become an app."

## What Not To Do Next
- Do not add more sections to compensate for weak proof.
- Do not keep polishing marketing copy while `/settings` is blank.
- Do not add more gradients, shadows, or decorative background tricks.
- Do not make the chips louder; make them smaller and more disciplined.
- Do not broaden scope into routing architecture, auth, backend, packages, or persistence.
- Do not ignore mobile; mobile is currently where the hierarchy gets puffy.
- Do not make every app page identical just because consistency is the mission.

## Next 5 Design Tasks
- [ ] Fix `/settings` visual availability: make the existing Settings page render in desktop and mobile screenshots with no blank page, no route warning, and no auth/backend/persistence changes.
- [ ] Tighten mobile hero spacing on one product page: reduce the dead band between header and content while preserving readable type and avoiding overlap.
- [ ] Compact mobile product chips: reduce pill size, spacing, and visual weight on one app page without changing copy or behavior.
- [ ] Replace one desktop hero product-card empty area with a static UI proof artifact using existing content patterns; keep it decorative-safe and non-interactive.
- [ ] Audit the shared product-page grid/background strength and soften it in one narrow CSS adjustment if it competes with content; do not change layout behavior.

## Stop Or Continue
continue but fix visual issues first