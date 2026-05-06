# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is finally developing a recognizable house style, but it still behaves too much like a product brochure when the mission is a daily operating system.

## Mission Fit
The branch supports Pack 1 by making the suite feel more visually related: shared cards, calm green accents, consistent typography, and mobile-first spacing are clearly improving. The problem is hierarchy. The screenshots still lead with public demo framing, oversized product claims, and feature-section scaffolding before the user feels the actual daily assistant behavior. EasyLife should open like "what needs my attention today," not "please admire our suite taxonomy."

## Taste Check
The best work is the restrained palette, the sturdy typography, and the tactile pale panels. The mobile layouts are more comfortable than before, and the module demos now feel like siblings instead of unrelated prototypes.

The weak part is the repeated SaaS-demo choreography: logo bar, hero card, giant headline, feature pills, secondary feature card. It is clean, yes, but clean like a startup template with better manners. Settings also gets too theatrical on mobile: "Settings" does not need to enter the room wearing a cape.

## Visual Problems To Fix
- The public product routes repeat the same page identity through the top brand bar, product kicker, hero headline, product pills, and then another section intro immediately below. The real product idea is buried under wrapper ceremony.
- Mobile hero type is still too large for utility surfaces. It is readable, but it makes every screen feel like a landing page instead of a fast personal tool.
- The first viewport on root and product routes is dominated by explanation and feature badges, not a concrete daily next action or compact module status.
- The header chrome is visually louder than it needs to be on mobile. The large rounded header consumes prime space before the user sees the job of the page.
- Settings mobile stacks "Daily Setup," "Settings," account summary, theme summary, opening screen, "Settings Section," and "Appearance" before the user reaches the actual controls. That is progressive disclosure in reverse.
- Feature pills are overused. They create a row of equal-weight claims where one primary action and one secondary action would be stronger.
- Several module pages use the same hero/feature structure so heavily that EasyList, EasyCalendar, EasyNotes, and EasyWorkout risk feeling skinned rather than purpose-built.
- Card nesting is creeping in on Settings: summary cards inside a large hero panel, then a section panel, then control panels. The hierarchy is tidy but too boxy.
- The pale grid background is pleasant, but across every screen it starts to flatten the product into one texture instead of letting each workflow breathe.
- Visual bug automation says GREEN, but design quality is still YELLOW because the first-screen mission is not fully obeyed.

## Strongest Opportunities
- Turn EasyHQ into the unmistakable daily start surface: one next action, today context, and compact module signals above all explanation.
- Reduce route chrome on mobile so the content starts sooner and feels more app-like.
- Make each module preview show a usable working state instead of a mini marketing card.
- Give Settings a calmer control-center layout with fewer title layers and more immediate controls.
- Keep the shared visual language, but let each product surface express its job through layout, not just copy.

## Priority Fix
Fix the first-screen hierarchy before adding or polishing more module pages. On the signed-in start surface and mobile route shells, remove one layer of explanatory chrome, reduce hero scale, and bring the user's next daily action or actionable module status into the first viewport. The task is not to make the page prettier; it is to make EasyLife feel like it is ready to help today.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: visual consistency and mobile comfort improved, but brochure hierarchy still blocks the daily operating spine.

## Designer Handoff
Keep the calm notebook texture, dark graphite type, green action color, and shared card discipline. Change the hierarchy: shrink public-demo hero behavior on app routes, quiet the header, cut repeated section labels, and make the first visible content more operational. The user should feel "I know what to do next" before they feel "this suite has many features." Nami should work in subtractive slices: fewer wrappers, fewer pills, fewer intros, stronger primary action.

## What Not To Do Next
- Do not add more sections to prove the suite is connected.
- Do not add more feature pills, badges, or explanatory cards.
- Do not redesign every product route in one pass.
- Do not make Settings more dashboard-like.
- Do not chase decorative polish while the first screen still reads like marketing.
- Do not touch backend, auth, Firebase, packages, deployment, analytics, or data scope.
- Do not ignore mobile; mobile is where the hierarchy problem is most obvious.

## Next 5 Design Tasks
- [ ] Reduce mobile app header height on one core route only; keep branding present, keep tap targets comfortable, and do not change routing or auth.
- [ ] On EasyHQ, move one concrete daily next action or compact module status higher in the first viewport; remove one explanatory label or claim to make room.
- [ ] Simplify Settings mobile hierarchy by removing one repeated title layer or summary panel; preserve all existing controls and behavior.
- [ ] Pick one product route and replace one row of feature pills with quieter secondary text or a single compact control; do not add new content.
- [ ] Audit one module page for card nesting and flatten one wrapper panel; keep the visual system intact and avoid broad CSS rewrites.

## Stop Or Continue
continue but fix visual issues first