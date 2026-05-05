# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is closer to a calm daily workspace, but a few remaining phrases still sound like product-building language instead of user-facing personal assistant copy.

## Mission Voice Fit
The language generally matches the mission when it uses concrete daily nouns like tasks, notes, calendar planning, workouts, workspace, daily plan, and today. The protected app direction is right: short labels, calmer status language, and less feature-inventory framing. The weak spots are still around public metadata and scattered app strings that use "command center", "demo", "proof", "sample", or "Start with" in ways that can feel internal, generic, or lightly instructional rather than personal and useful.

## Delicate Wording Risks
- `command center` appears in public meta descriptions. It is too generic SaaS and conflicts with the mission preference for a calm personal workspace.
- `Start with` in customer-facing app copy can sound like builder instructions unless the action and outcome are concrete.
- `auth-proof-card` appears as a class name, not visible copy, so it is not a customer-facing issue by itself.
- `demo` appears mostly in route/query logic and internal dev conditions. Keep it out of visible labels, page copy, and marketing surfaces.
- `sample` appears in IDs for EasyList email examples. This is likely internal, but if any visible copy says "sample", replace it with "example" or a concrete item type.
- `Opening your workspace.` is good: direct, calm, and user-centered.
- Public pages still risk sounding like a product tour if repeated module labels, CTA language, and feature explanations appear before the user sees a useful daily outcome.
- "personal operating system" is acceptable in internal mission language, but it should be rare or absent in visible app copy unless the page is explicitly product marketing.

## Beautiful Language Opportunities
- Replace "command center" with "workspace", "daily workspace", or "one place for today" depending on surface.
- Make first-screen copy answer: what needs attention, what can I do next, and what happens if I tap.
- Use short module labels in the shell: Today, Tasks, Calendar, Notes, Coach, Inbox, More.
- Keep helper text practical: "Capture a thought, task, or plan." is stronger than explaining the whole suite.
- Public meta descriptions can sound more trustworthy by naming the actual tools without overclaiming.
- Empty states can become warmer with one concrete next step, not broad reassurance.
- EasyProjects copy should continue moving away from "ship", "handoff", and "polish" toward "project brief", "review plan", "calendar prep", and "next step".

## Priority Rewrite
The most important wording problem to fix next is the remaining public "command center" language in root/app meta descriptions. It is small, visible, and mission-relevant: EasyLife should introduce itself as a calm daily workspace, not a SaaS control room. Nami should replace it with one concrete sentence that names the modules and the daily outcome without adding claims.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and daily plans in one calm workspace."

- Before: "Start with one small win."
  After: "Choose one small task for today."

- Before: "Start with"
  After: "Begin with"

- Before: "sample data"
  After: "example day"

- Before: "demo"
  After: "example"

- Before: "proof"
  After: "preview"

- Before: "polish"
  After: "finish the brief"

- Before: "handoff"
  After: "calendar prep"

## Voice Rules
- Use concrete daily nouns: task list, calendar block, note, project brief, workout log, daily plan, workspace.
- Keep primary labels short and action-ready.
- Do not use "command center", "proof", "handoff", "polish", "workflow", or "demo" in visible user-facing copy.
- Do not explain the whole system on the first screen.
- Separate marketing copy from app copy: public pages may explain; protected app screens should help the user act.
- Prefer "what to do next" over "what the product contains".
- Avoid broad claims about intelligence, automation, productivity, or transformation unless the app visibly proves them.
- Keep helper text warm but useful: one sentence, one next action, no brochure rhythm.

## Next 5 Copy Tasks
- [ ] Replace the public meta description phrase "one command center" with "one calm workspace"; guardrail: do not touch package files, routing, deployment config, or generated output.
- [ ] Inspect visible `Start with` strings and rewrite one instance as a concrete user action; guardrail: preserve behavior and avoid adding longer helper text.
- [ ] Check EasyList email example UI for visible "sample" language; guardrail: change only visible copy, not IDs or data structure.
- [ ] Scan protected HQ visible copy for any remaining product-tour language; guardrail: keep first-screen copy focused on today's next action.
- [ ] Review EasyProjects visible task/timeline examples for "ship", "polish", or "handoff"; guardrail: replace only one phrase at a time with concrete project language.

## Stop Or Continue
continue but fix copy first