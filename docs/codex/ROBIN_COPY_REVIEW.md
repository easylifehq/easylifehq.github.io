# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is close to a calm daily workspace voice, but visible copy still leaks internal build language and first-screen explanation that makes the product feel less trustworthy than it should.

## Mission Voice Fit
The mission asks for a connected, professional personal operating system that helps the user act faster without clutter. The strongest copy now uses concrete daily nouns like workspace, daily plan, task list, calendar prep, recent notes, and workout log. The weaker copy still sounds like a product team talking to itself: "command center", "demo", "proof", "handoff", "polish", "sample data", "workflow", and "Start with" appear in places that can read as builder language rather than buyer or user language. For EasyLife, the voice should feel like a quiet assistant surfacing the next useful move, not a brochure explaining the suite or a sprint note describing implementation.

## Delicate Wording Risks
- "command center" in root/app metadata overstates the product and feels like generic SaaS positioning instead of a personal daily workspace.
- "demo" in visible or query-adjacent contexts risks making the app feel fake or temporary. Keep it internal only.
- "proof" in `auth-proof-card` may be harmless as a class name, but any visible "proof" language should be avoided because it sounds like sales evidence rather than user value.
- "Start with" can be fine in onboarding, but in app copy it can sound instructional and vague unless the action is concrete.
- "Quick blockers and handoffs." in EasyCalendar sample copy sounds like workplace process language, not a personal calendar note.
- "messy workflow cleanup and mobile-first demo polish" sounds entirely internal and should not appear in user-visible sample data.
- "Build onboarding screen" is plausible in a project tool, but it leans product-team-specific; EasyLife should use broader personal or work planning examples unless the surrounding context is explicitly software projects.
- "Nothing completed yet this week. Start with one small win." is clear but a little motivational-generic; it should point to a concrete action if there is room.
- First-screen copy still risks feature-inventory behavior: too many headings, labels, and explanatory fragments make the product explain itself before helping the user act.
- Staff/internal style words like "handoff", "polish", and "workflow" should not appear as standalone value props or sample content unless the reader and outcome are concrete.

## Beautiful Language Opportunities
- Replace suite-positioning nouns with daily-life nouns: workspace, day plan, task list, calendar block, note, project brief, workout log.
- Let HQ copy sound like an assistant opening the day: one next action, today context, and a compact reason why it matters.
- Make Settings copy feel like a control center by naming the setting group and outcome, not describing the system broadly.
- Make EasyProjects examples feel like real user work: "Weekly planning review", "Finish project brief", "Calendar prep", "Budget check", "Trip outline".
- Make EasyCalendar sample copy more temporal and practical: "Review blockers before the 2:00 block" or "Prep notes before the afternoon call."
- Shorten marketing page support copy so the product name, promise, action, and preview carry the first screen.
- Use warmer but restrained empty states: "No notes yet. Capture the thought before it gets away." is better than broad motivation.
- Keep module labels distinct by job: tasks are action, notes are capture, calendar is time, workout is energy, settings are control.

## Priority Rewrite
The single most important wording problem is visible internal/process language in sample and product copy. Nami should replace one phrase at a time, starting with "command center", "handoff", "demo", "proof", "polish", and "workflow" where they appear in rendered strings or sample data. The replacement should name the user object and outcome, such as "daily workspace", "calendar prep", "example day", "project brief", "task list", or "workout log", without adding claims or longer explanation.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, and projects in one daily workspace."

- Before: "Quick blockers and handoffs."
  After: "Review blockers before the next calendar block."

- Before: "Prep two examples: messy workflow cleanup and mobile-first demo polish."
  After: "Prep two examples: task list cleanup and mobile planning review."

- Before: "Build onboarding screen"
  After: "Finish project brief"

- Before: "Nothing completed yet this week. Start with one small win."
  After: "Nothing completed yet this week. Choose one task to finish today."

- Before: "Products and demo below"
  After: "Products below"

- Before: "Calendar handoff"
  After: "Calendar prep"

- Before: "sample data"
  After: "example day"

## Voice Rules
- Prefer concrete nouns: task list, note, calendar block, project brief, workout log, setting, daily plan.
- Avoid internal build words in visible copy: demo, proof, handoff, polish, workflow, command center, sample data.
- First-screen copy should answer: what should I do next, why today, and where do I go if needed.
- Keep primary labels short and concrete; move explanation into secondary panels or detail views.
- Do not make broad AI, automation, productivity, or certainty claims unless the product visibly supports them.
- Separate marketing copy from app copy: public pages may explain; the signed-in app should help the user act.
- Empty states should offer one clear next action, not a motivational slogan.
- Use calm confidence, not hype: useful, specific, restrained.

## Next 5 Copy Tasks
- [ ] Replace the visible "command center" metadata/app copy with "daily workspace" or another concrete suite noun; guardrail: do not edit auth, routing, package files, or generated output.
- [ ] In EasyCalendar sample strings, replace "handoff" with "calendar prep" or a concrete event-prep phrase; guardrail: copy-only, preserve data fields and behavior.
- [ ] In EasyPipeline sample notes, replace "workflow cleanup" and "demo polish" with user-facing task language; guardrail: do not broaden into a source-wide rewrite.
- [ ] In EasyProjects visible placeholders/sample tasks, replace product-build examples like "Build onboarding screen" with general project examples; guardrail: keep the same UI and field length.
- [ ] Review the signed-in first screen for repeated headings and helper lines, then remove or shorten one explanatory line; guardrail: keep one next action and today context dominant.

## Stop Or Continue
continue but fix copy first