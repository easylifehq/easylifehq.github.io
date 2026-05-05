# Simon Design Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is becoming calmer and more coherent, but the visible product still behaves too much like a feature brochure and not enough like a daily personal operating system.

## Mission Fit
The current direction supports the mission in tone: restrained teal, quieter cards, consistent typography, and cleaner module language make the suite feel less scattered. The miss is hierarchy. Pack 1 is Product Spine, and the strongest visual evidence is still public/module pages with marketing CTAs, feature bands, and repeated showroom structure. The protected HQ "what should I do next today" surface is the actual mission proof, and the screenshots provided still do not show it directly. Confidence is lower because the key changed surface is under-evidenced.

## Taste Check
The visual system is much better than generic candy SaaS: the graphite text, soft paper background, tactile cards, and teal action color feel more adult. The module demos have useful specificity and the copy is less inflated.

What is off: the layout keeps saying "look at my product page" when EasyLife needs to say "here is your day." Huge mobile headings, repeated CTAs, chips, feature sections, and oversized wrapper chrome create a polite little launch deck. Clean, yes. Productive, not yet. The app is wearing a blazer over a brochure.

## Visual Problems To Fix
- Public module pages repeat the same page identity pattern: EasyLifeHQ header, module eyebrow, giant hero, CTA pair, chip row, demo card, then "Features." That repetition makes the suite feel templated instead of purpose-built.
- The top route chrome competes with the content on desktop and mobile; on mobile the brand bar is large relative to the job it performs.
- The customer-facing module routes still lead with "Start Free" and "See Features," so the first screen reads as acquisition rather than daily utility.
- The first mobile viewport is vertically heavy: large header, large title, long body copy, CTAs, and chips delay the useful product example.
- The "Features" bands arrive too soon and too loudly, repeating the sales pitch before the user has absorbed the actual workflow.
- Demo rows on mobile are readable but blunt: labels, values, and small status badges compete at similar weight, especially on EasyList and EasyWorkout.
- Settings mobile has too many heavy bordered panels stacked early; "Signed in," "Theme," and "Opens to" feel like large dashboard tiles instead of quiet setup facts.
- HQ first-screen screenshots are missing from the latest visual evidence, despite HQ being the active Pack 1 surface. That is a concrete review gap.

## Strongest Opportunities
- Make HQ the visual anchor: one next best move, today context, and compact module signals should be visible before any directory or explanatory content.
- Reduce public module chrome so the product preview becomes the hero, not a sample trapped inside a marketing card.
- Tighten mobile type scale and vertical rhythm so useful content appears earlier without making the interface feel cramped.
- Turn repeated feature bands into quieter supporting content, collapsible detail, or lower-priority sections.
- Add stronger cross-module continuity in the UI examples: note to task, task to calendar block, workout to today status.

## Priority Fix
The single most important problem is missing proof of the protected HQ spine. Before more module polish, capture and adjust the HQ first viewport so it clearly shows one daily next action, today's context, and compact status from the core modules before secondary navigation or product explanation. If the user cannot land and immediately know what to do next, Pack 1 is not done, no matter how handsome the cards are.

## Magic Improvement Score
SCORE: 3; DIRECTION: improved; ACTIVE_PACK: Pack 1 - Product Spine; REASON: calmer visuals and stronger module consistency are real progress, but HQ proof is still missing and visible routes remain too marketing-led.

## Designer Handoff
Keep the restrained palette, tactile paper feel, strong black typography, and teal primary action. Change the staging. HQ should feel like a personal assistant start surface: compressed shell, one dominant next action, today's context, and four small module signals. Public/module pages should become quieter and more product-led: reduce CTA weight, trim chip rows, lower the volume of "Features," and let the preview demonstrate the workflow. The result should feel like "I know what matters today," not "I have entered the EasyLife sales maze."

## What Not To Do Next
- Do not add more sections to make the pages feel complete.
- Do not polish more marketing routes before proving HQ.
- Do not solve hierarchy with more copy.
- Do not add dashboards, charts, badges, or decorative panels.
- Do not change backend, auth behavior, Firebase, packages, deployment, analytics, or data architecture.
- Do not ignore mobile density because the automated visual bug report is green.

## Next 5 Design Tasks
- [ ] Capture HQ desktop and 390px mobile screenshots; guardrail: review only the first viewport and do not change behavior.
- [ ] Make one HQ UI-only adjustment so the next best move appears above module inventory; guardrail: no data, auth, route, or persistence changes.
- [ ] Reduce mobile HQ/header vertical space by one narrow CSS/layout pass; guardrail: preserve navigation and labels.
- [ ] On one module route, quiet the CTA/chip stack so the product preview is visible sooner; guardrail: no new sections or claims.
- [ ] Normalize one demo-card row style on mobile so labels are secondary, values are primary, and badges do not compete; guardrail: one component or one route only.

## Stop Or Continue
continue but fix visual issues first