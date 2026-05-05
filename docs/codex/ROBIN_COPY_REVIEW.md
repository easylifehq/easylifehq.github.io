# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward a calmer daily workspace voice, but a few visible phrases still sound like product scaffolding instead of a personal assistant the user can trust.

## Mission Voice Fit
The strongest language fits the mission when it uses concrete daily-life nouns: workspace, today, tasks, notes, calendar planning, workouts, project brief, and daily plan. The weaker language still leans on broad product framing like "command center" or vague builder cues like "Start with," which makes EasyLife feel less like a connected personal suite and more like a demo wrapper.

## Delicate Wording Risks
- "command center" in public meta copy overstates the product and sounds like generic SaaS positioning rather than a calm personal workspace.
- "Start with" on the login surface is too vague if the next action and outcome are not immediately concrete.
- Any remaining visible "demo" language should be treated carefully. It is acceptable in internal dev params, but not in customer-facing copy.
- "proof" appears to be a class name in the sample, not visible copy, but any visible proof language would feel salesy and should be replaced.
- "sample" appears mostly internal in the smoke hits, but visible sample labels can weaken trust if they appear in app surfaces.
- The phrase "personal operating system" is useful in mission docs, but too grand for working app copy unless it is public positioning with restraint.
- The HQ and protected app surfaces should avoid explaining the product. They should tell the signed-in user what to do next today.

## Beautiful Language Opportunities
- Replace broad suite claims with direct daily outcomes: "See today's plan," "Capture a note," "Review calendar blocks," "Finish a project brief."
- Let HQ copy sound like a quiet first step, not a product tour.
- Use short primary labels and save explanatory copy for detail panels or secondary states.
- Make module status lines feel active and useful: tasks due, next calendar block, recent note, workout plan.
- Keep marketing copy concrete enough that it feels like a real product doorway, not a brochure.
- Convert remaining internal terms into user nouns: "example day" instead of "demo," "calendar prep" instead of "handoff," "workspace" instead of "command center."

## Priority Rewrite
Fix the remaining customer-facing "command center" framing in public meta/page copy first. It conflicts with the calm personal assistant promise and has been repeatedly flagged by Robin-style review. Replace it with concrete workspace language that names the daily materials EasyLife organizes without claiming more than the current app proves.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, and projects in one daily workspace."

- Before: "Start with"
  After: "Open your workspace"

- Before: "Nothing completed yet this week. Start with one small win."
  After: "Nothing completed yet this week. Choose one task to finish first."

- Before: "demo"
  After: "example day"

- Before: "sample data"
  After: "example items"

- Before: "Calendar handoff"
  After: "Calendar prep"

- Before: "proof"
  After: "preview" or "workspace view"

## Voice Rules
- Use concrete daily nouns: task list, note, calendar block, workout log, project brief, daily plan, workspace.
- Primary app labels should be short, direct, and task-facing.
- Do not use builder or sales-process words in visible app copy: demo, proof, handoff, polish, workflow, command center.
- Public pages may describe the product; protected app screens should guide the user through today's next action.
- Do not make AI, backend, automation, or prediction claims unless the visible feature proves them.
- Keep helper copy warm but useful; one sentence should be enough for most states.
- Avoid grand claims like "personal operating system" in working app copy.
- If a sentence cannot answer "who is this for, what should they do, and what do they get," rewrite it.

## Next 5 Copy Tasks
- [ ] Replace public meta/page "command center" copy with "daily workspace" language; guardrail: do not edit deployment output or root generated files unless the task explicitly allows it.
- [ ] Review the login first action copy around "Start with"; guardrail: make the action concrete without changing auth behavior or routes.
- [ ] Search visible JSX strings for "demo," "proof," "sample data," "handoff," and "polish"; guardrail: ignore class names, params, IDs, and internal docs.
- [ ] Tighten HQ first-screen helper copy to one concrete next action and one today context line; guardrail: do not add feature explanation or new claims.
- [ ] Review EasyProjects and experiments visible copy for builder language; guardrail: replace one phrase at a time with user task nouns and preserve data fields.

## Stop Or Continue
continue but fix copy first