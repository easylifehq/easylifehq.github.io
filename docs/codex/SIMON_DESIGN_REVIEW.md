# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is finally developing a coherent product voice, but the public product pages still wear too much padding, pale teal, and oversized mobile type like a wellness SaaS that just discovered spreadsheets.

## Mission Fit
The direction supports the mission: the product pages now feel related, calmer, and more professional, with repeated header, hero, CTA, tag, preview, and feature patterns that make EasyLife read as a suite rather than unrelated pages. The strongest mission fit is the working-UI preview language across EasyList, EasyNotes, EasyCalendar, EasyWorkout, and EasyProjects; each product is beginning to show what it does instead of only describing itself. The weakness is that the system currently feels more like a polished marketing shell than a connected personal operating system, because the screenshots emphasize public product pages and do not prove the internal daily app surfaces are equally unified.

## Taste Check
The restrained typography, consistent header, quieter cards, and denser preview rows are good progress. The brand feels calmer and more trustworthy than a generic dashboard kit, and the copy has a sharper point of view than the usual "organize your life effortlessly" soup.

What still feels off: the mobile scale is too inflated, the vertical rhythm is too indulgent, and the pale teal treatment is doing too much work across backgrounds, pills, preview panels, and borders. Desktop is clean but still card-heavy in places. Mobile is readable, but not yet efficient; it behaves like a brochure when the mission asks for a fast personal operating system.

## Visual Problems To Fix
- Mobile has a large dead zone between the header and hero card, especially visible at 390px; it wastes prime first-viewport space.
- Hero previews on mobile still feel too large and poster-like, with preview headings competing against the actual product headline.
- CTA buttons and support pills are cleaner than before, but still consume too much vertical space as a group on mobile.
- The same pale teal language appears in the page background, preview panels, pills, and borders, flattening hierarchy.
- Desktop hero cards are polished but still read as isolated white boxes sitting on a grid rather than a fully integrated product surface.
- Feature cards across product pages are consistent, but their rhythm is repetitive; three bordered cards under every hero starts to feel templated.
- The marketing header is neat on desktop, but mobile gives the header too much ceremony for a utility suite.
- Product previews are improving, but some still read as static labeled mockups rather than miniature app states with clear controls, density, and consequence.

## Strongest Opportunities
- Tighten the mobile first viewport so users see brand, promise, CTA, and part of the working preview without a long ceremonial scroll.
- Introduce more neutral contrast and fewer teal fills so hierarchy comes from layout, type, and content density instead of tint.
- Make each product preview more functionally specific: EasyList should feel like triage, EasyCalendar like time blocking, EasyNotes like capture and retrieval, EasyWorkout like fast logging.
- Replace repeated card stacks with lighter bands, table-like groups, or compact rows where content is informational rather than promotional.
- Bring more of this shared visual system into the logged-in app surfaces so the suite promise is visible where daily work actually happens.
- Use smaller, denser mobile UI inside previews so they feel like product screenshots, not marketing placards.

## Priority Fix
Fix mobile vertical economy first. The next implementer should reduce the mobile header-to-hero gap, compress hero padding, and scale down preview typography so the preview appears sooner and feels like compact working software. Do this without deleting content, changing routing, or inventing a new layout system. Right now mobile is handsome, but it takes the scenic route to the point.

## Designer Handoff
Keep the calm editorial voice, shared product shell, strong black typography, and consistent CTA treatment. Change the mobile rhythm: less top air, smaller preview headings, tighter preview rows, and quieter support pills. On desktop, continue reducing the sense of stacked white containers by turning lower sections into lighter grouped bands or denser information layouts. The user should feel that EasyLife is a sharp, connected daily operating system that respects attention, not a soft landing page politely asking for a scroll.

## What Not To Do Next
- Do not add more marketing sections to solve hierarchy problems.
- Do not introduce another accent color just to escape the teal issue.
- Do not make previews larger; make them denser and more product-like.
- Do not polish only desktop and pretend mobile is done.
- Do not redesign the full shell in one sweep.
- Do not touch backend, auth, routing behavior, persistence, dependencies, or deployment scope.
- Do not add decorative gradients, blobs, or visual noise to create "brand."

## Next 5 Design Tasks
- [ ] Mobile hero vertical economy pass: reduce the header-to-hero gap and hero vertical padding at 390px only, preserving existing content, links, and tap targets.
- [ ] Mobile preview typography pass: scale down preview titles, body copy, and row labels inside one product hero preview so it reads as compact app UI, not a second hero.
- [ ] Teal hierarchy pass: replace one remaining pale-teal fill or pill treatment with a neutral treatment using existing tokens only, without adding new colors.
- [ ] Desktop lower-section rhythm pass: convert one repeated three-card feature area into a lighter grouped band or denser row layout using existing copy only.
- [ ] Product specificity pass: add one small static working-UI cue to the least distinctive product preview, with no behavior, data fetching, or new section.

## Stop Or Continue
continue but fix visual issues first