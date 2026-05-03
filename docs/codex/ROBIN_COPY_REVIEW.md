# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward a calmer daily workspace voice, but visible copy still slips into internal build language and broad product framing before the user's next action is concrete.

## Mission Voice Fit
The language mostly fits the mission when it uses plain daily nouns: workspace, daily plan, task list, calendar prep, notes, workout log, project brief. That voice supports a connected personal assistant product without sounding inflated. The weaker fit appears where copy still says "command center", "handoff", "demo", "proof", "polish", "workflow", or "Start with" without a specific user action and outcome. Those phrases make EasyLife sound like a product build or portfolio sample instead of a trustworthy personal workspace.

## Delicate Wording Risks
- `command center` in public meta copy overstates the product and sounds generic SaaS. For EasyLife, "workspace" or "daily workspace" is more concrete and calmer.
- `Quick blockers and handoffs.` reads like internal team operations language, not personal planning language. "Blockers" and "handoffs" need a specific user context or should become "Calendar prep" or "Follow-ups".
- `Prep two examples: messy workflow cleanup and mobile-first demo polish.` sounds like Codex/build review copy surfaced as sample content. It should become real user-facing planning language.
- `Start with` can work if followed by a specific action, but alone it reads like an instruction shell. Use "Today" or "Next" labels when the action is already visible.
- `proof-card` appears as a class name, not necessarily visible copy, but visible "proof" language should be avoided because it feels salesy and evidentiary without support.
- `demo` in query params and dev flags is harmless as internal code, but visible "demo" copy should become "example day", "sample workspace", or "preview" depending on context.
- `workflow` is acceptable in internal tools, but as customer copy it is vague. Prefer task list, project plan, calendar block, note, or review.
- Settings remains a staging risk if the first viewport still contains too many controls and explanations before one clear settings job.

## Beautiful Language Opportunities
- Replace broad suite claims with daily-use language: "Plan today", "Review your list", "Open recent notes", "Prep the next calendar block".
- Make empty states sound useful without cheerleading: "No calendar blocks today. Add one plan or keep the day open."
- Use module-specific nouns so the suite feels connected but not cloned: task queue, note library, day plan, workout log, project brief.
- Let public pages promise less and show more. A short product line plus a believable preview will feel more premium than repeated feature explanations.
- Make Settings sound like control, not configuration: "Choose what appears in your workspace" is clearer than abstract customization language.
- For EasyProjects, turn sample build phrases into ordinary life/project phrases: planning review, project brief, next milestone, calendar prep.

## Priority Rewrite
The single most important wording problem is remaining internal/process language in visible sample data and product surfaces. Nami should replace one visible instance at a time, starting with EasyProjects, EasyCalendar, and EasyPipeline sample strings, so every visible phrase describes a real user task, calendar block, note, plan, or project outcome rather than a build process, demo, handoff, proof, or polish pass.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and follow-ups in one daily workspace."

- Before: "Quick blockers and handoffs."
  After: "Quick follow-ups and calendar prep."

- Before: "Prep two examples: messy workflow cleanup and mobile-first demo polish."
  After: "Prep two examples: clean up a task list and plan a mobile review."

- Before: "Build onboarding screen"
  After: "Finish onboarding outline"

- Before: "Nothing completed yet this week. Start with one small win."
  After: "Nothing completed yet this week. Pick one small task for today."

- Before: "Calendar handoff"
  After: "Calendar prep"

- Before: "Start with"
  After: "Next step"

## Voice Rules
- Use concrete daily nouns: task list, note, calendar block, workout log, project brief, daily plan, workspace.
- Avoid internal build words in visible copy: demo, proof, handoff, polish, workflow, command center, manager-ready.
- Keep first-screen copy short and action-led: what to do today, where to do it, what changes after.
- Separate marketing copy from app copy; the working app should use direct task labels, not sales language.
- Do not add claims about intelligence, automation, integration, or outcomes unless the UI visibly supports them.
- Keep module labels specific enough to prevent sameness across EasyList, EasyNotes, EasyCalendar, EasyWorkout, and Settings.
- Prefer one clear action over explanatory helper text above the fold.

## Next 5 Copy Tasks
- [ ] Replace the public meta `command center` phrase with "daily workspace"; guardrail: do not edit package, deploy, or generated output unless this source file is explicitly in scope.
- [ ] In `EasyCalendarContext`, replace visible `handoffs` sample copy with concrete planning language; guardrail: copy-only, no event logic or data-shape changes.
- [ ] In `EasyPipelineContext`, rewrite the visible sample note containing `workflow`, `demo`, and `polish`; guardrail: keep it as one short example note, not a new feature explanation.
- [ ] In EasyProjects visible placeholders or samples, replace build-process phrases like "Build onboarding screen" with ordinary project-task language; guardrail: preserve form fields and behavior.
- [ ] Scan `app-vNext/src` for visible `proof`, `demo`, `handoff`, `polish`, and `command center`; guardrail: ignore class names, dev query params, and internal identifiers unless they render as user-facing text.

## Stop Or Continue
continue but fix copy first