# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is finally starting to look like one suite, but the marketing system is still wearing too much padded armor and mistaking size for confidence.

## Mission Fit
The current direction mostly matches the mission: shared headers, repeated product hero structures, consistent product language, and product-specific previews all push EasyLife toward a connected personal operating system. The suite now feels calmer and more coherent than a pile of unrelated apps. The problem is that the polish is concentrated on public product pages while the core mission is daily utility; the design needs to feel less like a brochure and more like a fast, trustworthy operating surface.

## Taste Check
The best work is the consistency: the logo/header treatment, teal action color, product-specific preview panels, and quieter support pills are moving in the right direction. The product copy has a sharper voice than generic SaaS sludge, especially EasyList and EasyNotes.

What is off: the layout still leans too heavily on oversized white boxes, huge mobile type, pill farms, and repeated card grids. The background grid is pleasant, but it is doing a lot of aesthetic labor. The mobile pages are readable, but the first viewport still feels inflated: header, dead space, hero shell, headline, paragraph, buttons, chips, preview. That is a lot of ceremony before usefulness appears. Very calm, yes. A little too spa lobby for a product that promises speed.

## Visual Problems To Fix
- The mobile top gap between header and hero is still excessive, creating a cold empty band before any meaningful product content.
- Mobile hero previews appear earlier than before, but the user still has to pass through too much headline, paragraph, CTA, and chip material before seeing the useful product surface.
- The support chips remain visually noisy on mobile because there are too many similarly weighted rounded pills stacked close to the CTAs.
- Desktop hero cards are clean but too boxed; the hero and following feature sections read as stacked white containers instead of a more fluid product page.
- Product preview panels are more specific now, but they still look like presentation mocks, not quite like real app surfaces with controls, states, density, or hierarchy.
- The repeated pale teal fills flatten hierarchy across previews, tags, borders, and background; everything whispers at the same volume.
- Feature cards under the hero are serviceable but generic, with similar shape, spacing, and typography across products.
- Mobile preview typography is too large inside the mock panels, especially EasyNotes and EasyWorkout, making the previews feel less like compact daily tools and more like enlarged signage.
- The desktop nav is tidy, but the header still feels detached from the product content below because the vertical rhythm creates a separate floating island.

## Strongest Opportunities
- Make the first mobile viewport feel useful faster by tightening the hero stack and letting the product preview act as the main proof, not an afterthought.
- Turn previews into more convincing product moments: selected states, compact rows, small controls, timestamps, status hierarchy, and realistic density.
- Reduce repeated pill treatments and reserve rounded chips for actual metadata, not every secondary idea on the page.
- Use section rhythm more confidently on desktop: fewer bordered boxes, more full-width bands, stronger internal alignment, and cleaner transitions between hero and feature content.
- Give each product one distinct visual behavior while preserving the shared suite system: calendar can show time structure, notes can show library/writing flow, workouts can show active session logging, list can show capture and completion.
- Bring this polish back into the actual app pages next, especially dashboards, empty states, and settings, so the mission does not stall at marketing polish.

## Priority Fix
Fix the mobile hero hierarchy first. At 390px, the product pages still spend too much vertical space on branding, headline, explanatory copy, CTAs, and chips before the user sees the concrete product preview. Nami should reduce the mobile-only top gap, compress chip rows further or hide the least useful chip, and tune the preview panel typography down so the first viewport communicates "this is a useful tool" faster than "this is a nicely padded landing page."

## Designer Handoff
Keep the shared suite language, logo lockup, teal primary action, calm grid background, and product-specific preview concept. Change the rhythm: mobile should feel tighter, more task-forward, and less ceremonial; desktop should feel less like a stack of white cards and more like one composed product surface. The next implementer should focus on density, hierarchy, and realism: make previews look like compact working UI, reduce repeated pill/card shapes, and let each product demonstrate its daily job immediately. The result should feel professional, quick, and quietly premium, not like a polite SaaS template with better copy.

## What Not To Do Next
- Do not add more marketing sections to compensate for weak hierarchy.
- Do not add new colors, gradients, decorative blobs, or visual garnish.
- Do not keep tuning copy while ignoring first-viewport density.
- Do not make the previews larger; make them more believable.
- Do not broaden scope into backend, routing, auth, analytics, deployment, or dependencies.
- Do not ignore mobile because the desktop screenshots look acceptable.
- Do not turn every concept into a pill, card, or badge.

## Next 5 Design Tasks
- [ ] Mobile hero rhythm pass: reduce the vertical gap above the hero and tighten mobile-only hero spacing on one product page, without changing routing, copy meaning, or desktop layout.
- [ ] Preview typography pass: reduce oversized mobile preview heading/body scale on one product hero so the mock reads like compact app UI, not a billboard.
- [ ] Chip hierarchy pass: remove or visually quiet one row of support-pill noise on mobile while keeping CTAs clearly primary and tap targets usable.
- [ ] Desktop section rhythm pass: convert one lower marketing section from card-stack repetition into a lighter grouped band using existing content only.
- [ ] Product realism pass: add one small static state detail to an existing hero preview, such as selected row, status marker, timestamp, or compact control, without adding behavior or data fetching.

## Stop Or Continue
continue but fix visual issues first