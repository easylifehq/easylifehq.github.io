# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
The suite is finally speaking one visual language, but it still behaves too much like a feature brochure and not enough like a daily personal operating system.

## Mission Fit
The current direction partially matches the EasyLife mission. The shared header, soft panels, restrained teal, and consistent product-page templates make EasyLife feel more connected than before. But Pack 1 is Product Spine, and the screenshots still show module marketing surfaces leading with explanation, CTAs, feature pills, and demo cards instead of a signed-in daily start point with one clear next action. The mission is "open EasyLife and know what to do today"; this still says "please tour our features." Very polished pamphlet energy. Not the job.

## Taste Check
The best work is the calmer shared system: strong typography, clean spacing, tactile cards, useful muted borders, and a product family that now feels related. EasyList and EasyNotes have the sharpest copy and clearest use case. The teal accent is restrained enough to feel product-grade.

What is off: the page template is too repetitive across modules, the first viewport is still crowded with marketing mechanics, and the huge hero typography plus feature chips plus CTA pair plus preview panel makes every route feel like the same sales deck wearing a different badge. The mobile layouts are usable, but the type scale gets heavy and the preview cards arrive before the page has earned that much detail.

## Visual Problems To Fix
- The product pages repeat the same page identity pattern: global EasyLifeHQ header, product eyebrow, giant module headline, CTA row, feature chips, and preview card. It is clean, but too formulaic across EasyList, EasyNotes, EasyCalendar, and EasyWorkout.
- The top route chrome is visually loud for a product demo surface. The floating header, Products button, Get Started button, and large empty band before the hero compete with the actual product story.
- The first screen is still marketing-first. "Start Free" and "See Features" appear before a daily operating-system action, which weakens the signed-in product promise.
- Mobile first view stacks too much hierarchy at once: oversized headline, long intro paragraph, two CTAs, chips, and a preview panel. It reads well, but it is a lot of ceremony before utility.
- Feature chips look like filters but are static marketing tags. That creates false affordance and visual clutter.
- Preview cards are useful, but they are too similar across modules. The suite feels consistent, yes, but also templated.
- Settings confidence is lower because the latest visual screenshot set does not include `/settings?visualQa=1`, even though the latest task was a Settings first-viewport repair.
- The product pages still do not clearly distinguish public marketing from the working app surface. For EasyLife, that split matters: the public page can explain, but the protected app must act.

## Strongest Opportunities
- Replace the repeated brochure hero pattern with a daily spine pattern: one "Today" action, compact module status, and quiet module switching.
- Make the product previews more operational and less decorative by showing one realistic next action per module.
- Reduce top chrome on module routes so the user sees the product surface sooner.
- Turn static chips into quieter metadata or remove them from the first viewport.
- Give each module one distinct visual behavior, not just a different headline and preview list.
- Use Settings as the control-center proof point: one primary group first, secondary controls tucked lower or behind disclosure.

## Priority Fix
Reduce first-viewport chrome and marketing density before adding anything else. The next implementer should take one customer-facing product route or the protected HQ start surface and make the first screen answer: "what should I do next today?" Keep one primary action, one compact status area, and one quiet navigation path. Demote feature chips, repeated intro copy, and secondary CTAs below the fold or behind existing structure.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: shared suite styling is cleaner, but first-screen hierarchy still sells modules instead of starting the day.

## Designer Handoff
Keep the soft tactile system, the confident typography, the teal primary action, and the restrained card language. Change the information order. The next batch should make EasyLife feel less like four landing pages and more like one assistant shell: quieter route chrome, fewer first-screen explanations, and a stronger daily action spine. The user should feel, "I know where to start," not "I have been invited to browse features."

## What Not To Do Next
- Do not add more sections to compensate for weak hierarchy.
- Do not make the hero bigger or louder.
- Do not add more feature pills, badges, or marketing proof blocks.
- Do not redesign every module at once.
- Do not touch backend, auth, routing, package files, deployment, or data behavior.
- Do not ignore mobile; the mobile first viewport is where the density problem is most obvious.
- Do not turn this into a generic SaaS command center.

## Next 5 Design Tasks
- [ ] Reduce the public product route header height and vertical gap on one module page; preserve navigation targets and keep desktop and 390px mobile readable.
- [ ] On one module marketing page, demote static feature chips below the preview card or remove them from the first viewport; do not remove primary CTA behavior.
- [ ] Inspect `/settings?visualQa=1` on desktop and mobile, then make one small visual-only adjustment if the primary settings group still competes with secondary controls.
- [ ] Give one module preview card a more specific daily next-action row; keep the same data shape and avoid adding new features.
- [ ] Tighten mobile hero typography and spacing on one route so headline, intro, CTAs, and preview do not feel like four equal priorities.

## Stop Or Continue
continue but fix visual issues first