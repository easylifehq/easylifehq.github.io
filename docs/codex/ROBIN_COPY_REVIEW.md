# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is closer to a calm daily workspace voice, but visible and seeded copy still leaks internal build language like "command center", "handoff", "demo", "proof", "polish", and "workflow".

## Mission Voice Fit
The best current language fits the mission when it uses concrete daily nouns: tasks, notes, calendar planning, workouts, projects, settings, workspace, daily plan, and next action. That voice supports a professional personal assistant product. The weak spots still sound like a product team describing a build, not a person using EasyLife to organize a day. Settings and protected surfaces need especially strict staging: the user should see what to adjust or do next, not a broad inventory of controls or internal suite language.

## Delicate Wording Risks
- "command center" appears in public metadata and conflicts with the current operating mode, which forbids generic command-center framing.
- "Quick blockers and handoffs." sounds like internal team process language, not a personal calendar item.
- "Prep two examples: messy workflow cleanup and mobile-first demo polish." combines several builder-facing words and reads like a Codex task, not user data.
- "auth-proof-card" may be a class name, but any visible "proof" framing near login would feel salesy and defensive.
- "Start with" can be fine in context, but it should be attached to a concrete action, such as "Start with today's list" or "Start with one task."
- "sample data" and "demo" are acceptable in internal visual QA hooks, but should not appear in customer-visible examples.
- "workflow" is too vague as a standalone benefit; use "task list", "calendar block", "project brief", or "note review" when visible.
- "polish" and "ship" in EasyProjects examples sound like product-build process unless the project is explicitly software work.

## Beautiful Language Opportunities
- Replace internal process words with daily-life nouns: "Calendar prep", "Project brief", "Today plan", "Workout log", "Recent notes".
- Let the protected HQ first screen speak in verbs: "Review today", "Plan the next block", "Capture a thought", "Finish one task".
- Settings copy can become calmer by naming outcomes: "Choose what appears in your suite", "Set your default view", "Adjust theme and display".
- EasyProjects can feel more personal if sample tasks sound like real planning work instead of release work.
- Public metadata should describe EasyLife as a workspace, not a command center.
- Low-content copy should be short, direct, and action-led: one sentence of context, one clear next move.

## Priority Rewrite
Fix the remaining visible builder/process vocabulary across app seed data and public metadata, starting with "command center", "handoff", "demo", "proof", "polish", "ship", and vague "workflow" uses. Replace each with concrete user-facing nouns tied to daily planning, without adding longer explanations or new product claims.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and daily plans in one workspace."

- Before: "Quick blockers and handoffs."
  After: "Quick blockers and calendar prep."

- Before: "Prep two examples: messy workflow cleanup and mobile-first demo polish."
  After: "Prep two examples: clean up the task list and review the mobile plan."

- Before: "Start with"
  After: "Start with today's list"

- Before: "Build onboarding screen"
  After: "Finish project brief"

- Before: "Nothing completed yet this week. Start with one small win."
  After: "Nothing completed yet this week. Choose one small task to finish."

- Before: "Calendar handoff"
  After: "Calendar prep"

## Voice Rules
- Use concrete daily-life nouns before abstract product nouns.
- Keep first-screen copy short: one job, one next action, one useful status.
- Avoid "command center", "personal operating system", "premium", "high-tech", "proof", "handoff", "polish", and "workflow" in visible copy.
- Separate internal QA language from user-facing examples.
- Prefer "workspace", "daily plan", "task list", "note", "calendar block", "project brief", and "workout log".
- Do not make the app sound predictive or magical unless the visible UI shows the source and limits.
- Public pages may explain the product; working app screens should use direct task labels.
- Empty states should answer: what is empty, what should I do, and what happens next?

## Next 5 Copy Tasks
- [ ] Replace the public metadata phrase "one command center" with "one workspace"; guardrail: metadata copy only, no routing or config behavior changes.
- [ ] In `EasyCalendarContext`, replace visible "handoffs" seed copy with concrete calendar language; guardrail: copy-only, keep object fields and behavior unchanged.
- [ ] In `EasyPipelineContext`, replace "workflow cleanup", "demo", and "polish" sample notes with daily workspace examples; guardrail: one seeded note only, no data-shape changes.
- [ ] In EasyProjects visible examples, replace one "ship", "polish", or "Calendar handoff" phrase with a user task like "Finish project brief" or "Calendar prep"; guardrail: copy-only in `easyprojects`.
- [ ] Review login and onboarding visible strings for "proof" and vague "Start with" language; guardrail: visible text only, no auth logic or route changes.

## Stop Or Continue
continue but fix copy first