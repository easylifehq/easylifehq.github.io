# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife now sounds calmer and more concrete in the main app, but several visible or near-visible strings still carry internal build language that makes the product feel less like a personal assistant workspace.

## Mission Voice Fit
The language mostly fits the mission: calm, useful, connected, and daily-life oriented. The strongest copy points toward tasks, notes, calendar planning, workouts, projects, and settings as one workspace. The weakness is that some surfaces still use product-builder shorthand like "command center", "handoff", "demo", "proof", "polish", and "workflow", which makes EasyLife sound like a staged internal prototype instead of a trustworthy personal system for a real user.

## Delicate Wording Risks
- "command center" in public meta copy overstates the product and feels like generic SaaS framing rather than a calm personal workspace.
- "Start with" can work in narrow instructional copy, but in login or first-screen surfaces it risks sounding like a builder prompt unless the action and outcome are concrete.
- "Quick blockers and handoffs" sounds like workplace ops language, not personal planning language. "Handoffs" is especially abstract for a personal assistant product.
- "messy workflow cleanup and mobile-first demo polish" reads as internal product work, not a user-facing example. "workflow", "demo", and "polish" are all weak nouns here.
- "Build onboarding screen" may be fine for an example project if EasyProjects is aimed at builders, but it narrows the product voice toward software work. For a general personal assistant suite, it may feel too internal.
- "Nothing completed yet this week. Start with one small win." is warm, but slightly motivational-app generic. It would be stronger if tied to a concrete action.
- Remaining "demo" query and visual QA strings are likely internal identifiers, but any rendered "demo" label should be changed to "example day" or "sample workspace" only if visible.

## Beautiful Language Opportunities
- Replace broad product nouns with daily-life nouns: workspace, daily plan, task list, calendar block, project brief, note, workout log.
- Make Settings sound like the place to adjust the suite, not an inventory of controls.
- Make EasyProjects examples feel like real personal planning: planning review, project brief, next milestone, calendar prep.
- Make EasyCalendar copy favor time, blocks, next event, and planning decisions over coordination jargon.
- Let public copy promise less and show more: "plan today, capture notes, and keep projects moving" is more believable than "one command center."
- Use short first-screen labels that answer: what is this, what should I do, what do I get?

## Priority Rewrite
Fix the remaining internal-process language in visible app data and public metadata. The next copy task should replace "command center", "handoff", "workflow", "demo", "proof", and "polish" where they appear in rendered strings with concrete daily-workspace language, without lengthening the copy or adding new claims.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and daily work in one calm workspace."

- Before: "Quick blockers and handoffs."
  After: "Quick blockers and calendar prep."

- Before: "Prep two examples: messy workflow cleanup and mobile-first demo polish."
  After: "Prep two examples: task cleanup and a mobile planning review."

- Before: "Start with"
  After: "Begin with today"

- Before: "Build onboarding screen"
  After: "Finish project brief"

- Before: "Nothing completed yet this week. Start with one small win."
  After: "Nothing completed yet this week. Choose one task to finish first."

- Before: "proof"
  After: "preview"

- Before: "demo"
  After: "example"

## Voice Rules
- Use concrete product nouns: task list, note, calendar block, project brief, workout log, daily plan, workspace.
- Avoid internal process words in visible copy: handoff, workflow, polish, proof, demo, command center.
- Keep first-screen labels short and action-led.
- Do not explain the whole suite above the fold.
- Separate public product copy from working app copy: public pages may describe value; app pages should tell the user what to do next.
- Keep tone calm and professional, never hype-driven.
- Do not invent outcomes, intelligence, automation, or assistant behavior unless the UI visibly supports it.
- Prefer "today", "next", "recent", and "scheduled" over abstract status language.

## Next 5 Copy Tasks
- [ ] Replace the public meta phrase "one command center" with "one calm workspace"; guardrail: metadata copy only, no route or config behavior changes.
- [ ] Replace the visible EasyCalendar sample phrase "Quick blockers and handoffs" with concrete planning language; guardrail: copy-only, keep the same data shape.
- [ ] Replace one EasyPipeline sample string containing "workflow", "demo", or "polish" with a plain user-task example; guardrail: do not broaden into unrelated pipeline copy.
- [ ] Review EasyProjects visible sample titles for software-builder bias such as "Build onboarding screen"; guardrail: change only one example phrase and keep it the same length or shorter.
- [ ] Search rendered JSX and context data for "proof", "demo", "handoff", "polish", and "command center"; guardrail: ignore internal identifiers and only change user-visible strings.

## Stop Or Continue
continue but fix copy first