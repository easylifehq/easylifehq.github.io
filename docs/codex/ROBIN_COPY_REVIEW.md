# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward calm daily-assistant language, but visible copy still mixes buyer-facing product pitch, builder/demo language, and working-app labels in ways that weaken trust.

## Mission Voice Fit
The best current language fits the mission: "Choose today's next move.", "Capture anything", "Open task list", "Review inbox", and "No school item is saved until you review..." are concrete, useful, and calm. The weaker language still comes from product-studio framing: "Demo Path", "Show this first", "Presentation flow", "proof", "workflow", "handoff", and public CTAs like "Start Free" create a brochure layer around what should feel like a signed-in daily workspace. The voice should keep moving from selling and explaining toward direct daily action.

## Delicate Wording Risks
- "command center" remains in `404.html` and `app-vNext/index.html` metadata; it is generic SaaS language and conflicts with the quieter daily workspace direction.
- "Demo Path", "Show this first", and "Presentation flow" sound like instructions to the builder or presenter, not helpful copy for the user.
- "Draft handoff to EasyList", "EasyList handoff", and "Capture, refine, then hand off" still read like internal process language. Use "task drafts", "send to tasks", or "turn notes into tasks".
- "Start Free", "See Features", and "Get Started" are acceptable on public marketing pages, but they should not appear on signed-in or demo-like working routes where the user expects actions.
- "proof" appears in class naming and public copy around "visible proof of what got done"; the visible phrase feels salesy and slightly defensive.
- "Workflow" is overused in marketing navigation and descriptions. It can be clear in moderation, but as a primary label it feels corporate and less personal than "Plan", "Steps", "Daily flow", or "Routine".
- "AI workspace lab" risks sounding like a prototype surface rather than a stable product area. If visible, it should be staged clearly as an experiment.
- "Sync Gmail" and "Create Gmail drafts" are risky if the app does not actually perform connected Gmail actions in production. Use approval-first, non-sending language unless the feature is real.
- "No school item is saved until you review and add it..." is good for safety, but it should be near any school-to-task/calendar controls, not only in the lead card.
- "example email" is honest but stiff. It should become "sample inbox item" or "example inbox item" so it reads like a local preview, not fake customer data.

## Beautiful Language Opportunities
- The HQ opening line can become warmer and more specific without adding claims: keep "Choose today's next move" and pair it with short action language.
- Inbox language is close; strengthen it by making every action approval-first: "Review suggestion", "Prepare draft", "Keep visible", "Dismiss".
- School planner copy can feel more useful by emphasizing study load and review before save, not the novelty of the planner.
- Marketing pages should replace internal module movement words with guest-clear product verbs: capture, review, plan, send to tasks, add to calendar.
- The public metadata should say "daily workspace" instead of "command center".
- The product feature sections need fewer labels that explain the product and more labels that describe what the user does.

## Priority Rewrite
Fix the remaining builder/demo/process vocabulary in visible surfaces before the next polish pass. The most important targets are "Demo Path", "Show this first", "Presentation flow", "handoff", "proof", "workflow", and any Gmail language that implies real sync/send behavior. Nami should turn this into a copy-only task that changes one narrow surface at a time, preserving routes and behavior.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and follow-ups in one daily workspace."

- Before: "Draft handoff to EasyList"
  After: "Send task drafts to EasyList"

- Before: "EasyList handoff"
  After: "Task drafts"

- Before: "Capture, refine, then hand off"
  After: "Capture, refine, then send to tasks"

- Before: "Demo Path"
  After: "First things to try"

- Before: "Show this first"
  After: "Start with these moments"

- Before: "Use these moments to explain the product without wandering through every setting."
  After: "Start here when you want the fastest read on how EasyLife fits your day."

- Before: "Sync Gmail"
  After: "Review inbox items"

## Voice Rules
- Use working-app verbs: add, capture, review, plan, open, prepare, keep, dismiss.
- Prefer concrete nouns: task list, note, calendar block, inbox item, draft reply, study block, project brief.
- Do not use builder words in customer-facing copy: demo, proof, handoff, polish, presentation flow, show this first.
- Do not imply real Gmail sync, sending, archiving, AI action, or saving unless the feature truly does it.
- Keep the first screen focused on one next move, today context, and compact status.
- Marketing copy can explain; app copy should help the user act.
- Use "workspace" sparingly and only when it has a concrete object nearby.
- Keep safety language plain: "Review before saving", "No send action happens here", "Prepare draft only".

## Next 5 Copy Tasks
- [ ] Replace public metadata "command center" with "daily workspace"; guardrail: metadata copy only, no root production config or generated output unless explicitly allowed.
- [ ] Rename the visible HQ "Presentation flow", "Demo Path", and "Show this first" copy to user-facing daily language; guardrail: copy-only, preserve details behavior.
- [ ] Replace EasyNotes "handoff" language with "task drafts" or "send to tasks"; guardrail: no behavior or route changes.
- [ ] Audit Gmail/inbox visible labels for overclaims like "Sync Gmail" or "Create Gmail drafts"; guardrail: use approval-first copy unless the action is real.
- [ ] Replace one remaining public "workflow" primary nav or heading label with a concrete label such as "Plan", "Daily flow", or "Steps"; guardrail: do not broaden into a marketing rewrite.

## Stop Or Continue
continue but fix copy first