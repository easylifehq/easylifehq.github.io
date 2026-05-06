# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
The suite is cleaner and more coherent, but it still opens like a product brochure wearing an app costume.

## Mission Fit
The direction supports Pack 1 in surface consistency: shared header, shared cards, repeated product rhythm, and a calmer teal system all make the routes feel related. But the mission is a connected personal operating system, and the visible screens still sell individual modules instead of helping the signed-in user decide what to do today. EasyList, EasyNotes, EasyCalendar, and EasyWorkout read as polished landing pages, not daily-use surfaces.

## Taste Check
The palette is restrained, the type has confidence, and the product panels feel more intentional than before. The copy is more concrete and less foggy. Good.

The problem is hierarchy. Every route is doing the same oversized hero, the same CTA pair, the same feature chips, and the same lower feature band. That repetition creates suite consistency, yes, but also makes the product feel templated. The "Start Free" and "See Features" controls are too loud for internal product surfaces, and the big marketing H1s delay the actual utility. It is handsome enough, but still too much pitch deck. Very clean elevator music.

## Visual Problems To Fix
- The customer-facing route chrome repeats identity too heavily: the top bar says EasyLifeHQ, the brand mark repeats, then the page immediately restates the module name in a giant hero band.
- Public marketing CTAs compete with the product examples on every route; "Start Free" and "See Features" dominate screens that should demonstrate actual daily flow.
- The first viewport is still module-first, not day-first: users see a slogan and feature pitch before they see today's next action or compact module status.
- The hero template is nearly identical across EasyList, EasyNotes, EasyCalendar, and EasyWorkout, which makes the suite feel systematic but also generic.
- Mobile screenshots show oversized type and large vertical spacing pushing useful controls and examples too far down the page.
- Feature chips are visually loud relative to their usefulness; they add chrome without enough decision value.
- The example cards are useful, but they sit inside promotional framing instead of feeling like the working product surface.
- The repeated "FEATURES" section arrives too early and feels like brochure inventory, not progressive disclosure.
- The background grid is restrained, but combined with large white cards it still reads like generic modern SaaS rather than a personal assistant workspace.
- EasyWorkout mobile shows tags as plain text rather than pill controls, which breaks consistency with the other module pages.

## Strongest Opportunities
- Replace the repeated marketing hero pattern with a shared "today spine" pattern: one next action, one compact context row, and module status beneath.
- Make the product examples the primary visual object, not the supporting illustration.
- Reduce CTA prominence on signed-in or demo-like routes; keep navigation quiet and let the work surface lead.
- Give each module one distinct interaction moment while preserving shared shell rhythm.
- Tighten mobile first view height so the user sees actual product state before the first scroll.
- Turn feature inventory into secondary disclosure: tabs, accordions, or a lower quiet section after the daily job is clear.

## Priority Fix
Reduce the brochure chrome before adding anything else. The next batch should convert one core route, ideally HQ or EasyList, from slogan-plus-CTA hierarchy into a daily operating surface: one clear next action, today's context, compact module status, and quieter secondary navigation. Keep the shared visual language, but stop making every route introduce itself like it just walked onto a conference stage.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: stronger suite consistency and cleaner module polish, but the active pack is still blocked by marketing hierarchy over daily operating flow.

## Designer Handoff
Keep the restrained teal, soft cards, confident type, and shared shell. Change the page hierarchy. The first screen should feel like opening a calm personal assistant, not browsing a feature page: less hero theater, fewer chips, quieter CTAs, more immediate state. Show the user what matters today, then let modules explain themselves after the first useful action is visible. The result should feel faster, more personal, and less like a SaaS template pretending to have a morning routine.

## What Not To Do Next
- Do not add more feature sections.
- Do not add another optional module or playful entry before the spine is fixed.
- Do not make the header louder to solve navigation.
- Do not increase decoration, gradients, badges, or background effects.
- Do not expand backend, auth, analytics, deployment, or package scope.
- Do not ignore mobile; the current hierarchy gets heavy fast on a phone.
- Do not treat "consistent template" as the same thing as "connected product."

## Next 5 Design Tasks
- [ ] Convert the HQ first screen to a daily spine: one next action, today context, and compact module status only; no new backend or data behavior.
- [ ] Reduce marketing CTA prominence on one core module route; keep one primary action and move feature exploration below the first useful product example.
- [ ] Tighten mobile hero spacing on one module so the product example appears in the first viewport; do not shrink text below readable size.
- [ ] Replace one row of feature chips with quieter secondary disclosure; preserve existing route behavior and links.
- [ ] Normalize EasyWorkout mobile tags so they visually match the other module pills or deliberately become quiet text, but not half-control, half-label.

## Stop Or Continue
continue but fix visual issues first