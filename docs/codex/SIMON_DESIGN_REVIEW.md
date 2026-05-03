# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is becoming calmer and more unified, but Settings is still acting like a control-room brochure when the mission needs a quiet personal operating system.

## Mission Fit
The current direction mostly matches Pack 1 - Product Spine: shared styling is clearer, the core modules feel more related, and the product is moving away from disconnected feature pages. The miss is information staging. The protected first screen is supposed to help the user know what to do next today, but Settings still exposes too many controls above the fold and weakens the sense of one calm daily assistant.

## Taste Check
The suite polish is improving: restrained styling, more consistent surfaces, and clearer module rhythm are all moving in the right direction. What still feels off is the tendency to show too much product machinery too early. Sixteen interactive controls above the fold on Settings is not calm, it is a cockpit with a migraine. The app needs stronger hierarchy, fewer equal-weight actions, and more confidence that secondary controls can live one click deeper.

## Visual Problems To Fix
- Settings exposes 16 interactive controls above the desktop fold, which violates the first-screen contract and makes the page feel busy before the user knows the primary job.
- The Settings first viewport still reads as a full inventory of controls instead of a focused control center with one clear next action.
- Secondary settings actions compete visually with primary page intent; too many controls share similar weight.
- The product spine remains a little too explanatory across app and marketing surfaces, with repeated product framing still louder than daily use.
- The current route chrome is improving, but any remaining wrapper-like framing must stay quiet so the actual app surface is not buried under navigation and explanation.

## Strongest Opportunities
- Turn Settings into a true suite control center: one prominent status or recommendation, one primary action, and grouped secondary sections below.
- Make the HQ and module first screens feel like a connected morning surface, not a directory of app capabilities.
- Use progressive disclosure more aggressively: advanced preferences, explanations, and dense control clusters should move behind tabs, accordions, or secondary panels.
- Keep pushing shared card, heading, button, and spacing patterns so EasyList, EasyNotes, EasyCalendar, EasyWorkout, and Settings feel like siblings.
- Tighten mobile hierarchy after desktop staging is fixed; mobile will punish every unnecessary control faster than desktop.

## Priority Fix
Fix the Settings first viewport. Reduce the above-the-fold action count and establish one dominant Settings job: show the user's current suite setup state and one obvious next adjustment. Demote secondary controls into grouped sections below the fold or behind existing disclosure patterns. Nami should treat this as a staging repair, not a redesign.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: suite styling is clearer, but Settings still overloads the first screen and blurs the daily operating-system spine.

## Designer Handoff
For the next batch, subtract before adding. Keep the calmer shared visual language, the tighter module consistency, and the professional restraint. Change Settings from a dense control surface into a composed control center: primary status, one main action, then quieter grouped preferences. The user should feel, "I know what this controls and what to adjust next," not "I have been handed the admin panel for my own life."

## What Not To Do Next
- Do not add more Settings sections to solve a hierarchy problem.
- Do not introduce new dashboard widgets, AI claims, or product explanation blocks.
- Do not make the route chrome louder with more pills, bars, badges, or helper text.
- Do not touch backend, auth, Firebase, packages, deployment, or settings behavior.
- Do not ignore mobile after reducing desktop clutter; the fix must hold on narrow screens.

## Next 5 Design Tasks
- [ ] Reduce Settings above-the-fold controls to one primary action plus a small number of quiet secondary links; do not change settings behavior or persistence.
- [ ] Group lower-priority Settings controls below the first viewport or behind existing disclosure UI; preserve labels and avoid adding new features.
- [ ] Recheck Settings mobile after the staging fix; ensure no clipped text, cramped controls, or stacked action clutter.
- [ ] Audit the app header and route chrome for repeated page identity; remove or quiet duplicated labels without changing navigation.
- [ ] Compare EasyList, EasyNotes, EasyCalendar, EasyWorkout, and Settings headers for spacing and hierarchy consistency; make only small visual alignment fixes.

## Stop Or Continue
continue but fix visual issues first