# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward a calmer daily workspace voice, but visible copy still slips into internal product language and broad suite claims before the user action is concrete.

## Mission Voice Fit
The language generally fits a professional personal workspace: "workspace", "daily plan", "tasks", "notes", and "calendar planning" are grounded enough for the mission. The weaker fit is where EasyLife still calls itself a "command center" or uses builder-review terms like "demo", "proof", "polish", and "sample" near user-facing surfaces. For a signed-in product, the copy should sound less like a product team explaining the system and more like a calm assistant helping the user decide what to do next today.

## Delicate Wording Risks
- "command center" in public metadata overstates the product and sounds like generic SaaS positioning instead of a personal daily workspace.
- "Start with" can be fine in a sentence, but it risks sounding like an instruction to the builder or an onboarding script when the object and outcome are vague.
- "auth-proof-card" appears class-based, but "proof" remains a word to avoid in visible copy because it makes the page feel like a sales argument.
- "demo" and "sample" are acceptable in route flags, IDs, and dev-only data, but risky if rendered visibly because they remind the user that the experience is not real.
- "personal operating system" belongs in internal mission language, not app UI. It is broad, abstract, and can feel inflated.
- "Opening your workspace." is calm and acceptable, but could be more useful if the loading state knows the destination.
- "Nothing completed yet this week. Start with one small win." is friendly, but "small win" is a little generic and motivational compared with the product's concrete task language.
- Any first-screen copy that explains the whole suite before naming one next action is a staging problem.

## Beautiful Language Opportunities
- Make HQ copy feel like a daily start surface: one next action, today context, then compact module status.
- Replace broad suite claims with concrete nouns: task list, calendar block, recent note, workout log, project brief, inbox item.
- Use "workspace" carefully: good as a place noun, weak as a standalone value prop.
- Loading and empty states can become warmer by naming the next useful action instead of narrating the system.
- Marketing pages should let the preview do more work and let copy become shorter, quieter, and more specific.
- Settings copy can feel more like a control center by using plain labels for what changes and what stays fixed.

## Priority Rewrite
The single most important wording problem is the remaining customer-facing "command center" framing in metadata and any visible app language. Replace it with concrete daily-workspace language that says what EasyLife keeps together and what the user gets from it, without implying a grand platform or abstract operating system.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, and projects in one daily workspace."

- Before: "Nothing completed yet this week. Start with one small win."
  After: "Nothing completed yet this week. Choose one task to finish today."

- Before: "Opening your workspace."
  After: "Opening today's workspace."

- Before: "Start with"
  After: "Begin with today's plan"

- Before: "sample data"
  After: "example day"

- Before: "demo"
  After: "preview" or "example" when customer-facing, depending on context.

- Before: "proof"
  After: "preview", "detail", or "current state" when customer-facing.

## Voice Rules
- Prefer concrete daily-life nouns over platform language.
- Keep first-screen copy short: one next action, today context, compact status.
- Do not use "command center", "personal operating system", "premium", "high-tech", "proof", "handoff", or "polish" in visible customer-facing copy.
- Use "demo" only for internal route flags or developer-only states, not visible app text.
- Empty states should answer: what is missing, what can the user do next, and what happens after.
- Marketing copy may explain the product; working app copy should label tasks and actions directly.
- Avoid motivational filler like "small win" unless paired with a concrete action.
- Do not add new claims about automation, intelligence, integrations, or results unless the product visibly supports them.

## Next 5 Copy Tasks
- [ ] Replace the public metadata phrase "one command center" with "one daily workspace"; guardrail: metadata copy only, no root deployed output unless explicitly approved by the supervisor.
- [ ] Review visible HQ first-screen strings for broad suite claims; guardrail: change only one phrase and keep the next daily action dominant.
- [ ] Replace one visible "Start with" sentence with a concrete action label; guardrail: preserve meaning and do not add explanation.
- [ ] Search app source for visible "demo", "sample data", "proof", "handoff", and "polish"; guardrail: ignore class names, IDs, route flags, docs, and dev-only identifiers.
- [ ] Tighten one empty-state sentence so it names the object and next action; guardrail: no new feature promises, no added controls, no behavioral changes.

## Stop Or Continue
continue but fix copy first