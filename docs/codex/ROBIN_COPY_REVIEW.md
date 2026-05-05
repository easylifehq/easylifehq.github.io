# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward calm daily-assistant language, but a few visible and near-visible phrases still sound like internal product framing instead of concrete help for a signed-in user.

## Mission Voice Fit
The strongest direction is the protected Today/HQ language: "next best move", today context, fast capture, and compact module status fit the mission better than generic dashboard language. The product wants to feel like a connected personal workspace, so copy should keep naming specific daily actions: task list, calendar block, note, workout log, project brief, daily plan. The remaining risk is that some source and meta copy still leans on "command center", "demo", "proof", "polish", and "sample" vocabulary, which makes the product feel observed or built rather than used.

## Delicate Wording Risks
- `command center` in public meta descriptions sounds generic SaaS and too broad for EasyLife's calmer personal workspace promise.
- `demo` remains in dev/visual QA plumbing. Most instances appear internal, but visible routes should avoid "demo" unless the page is explicitly a public demo selector.
- `proof` appears in a class name, not visible copy, but previous visible "proof surface" language should stay out of customer-facing UI.
- `sample` appears in EasyList email data IDs. If any related email examples render "sample" visibly, replace with "example" or a concrete email label.
- "personal operating system" is mission-useful internally, but too abstract for working app copy. The app should say what the user can do next today.
- "command center", "workflow", "handoff", "polish", and "manager-ready" style language should not appear as buyer-facing value props or signed-in app labels unless the action and outcome are concrete.
- The checkpoint shows a copy-relevant risk in `LoginPage.tsx`, an auth-related surface. Even if the change was UI-only, future copy work should avoid auth files unless explicitly cleared.

## Beautiful Language Opportunities
- Make the protected HQ first screen sound like a calm assistant: "Start with this", "Today needs", "Capture something", "Review your plan".
- Replace abstract suite language with concrete nouns: "Tasks", "Calendar", "Notes", "Workout", "Projects", "Settings".
- Use "workspace" carefully as a container word, then quickly name the actual thing inside it.
- Use "example day" instead of "demo" when the user is looking at seeded or preview content.
- Use "calendar prep" or "calendar block" instead of "handoff".
- Use "ready to review" instead of "proof" or "manager-ready".
- Use short primary labels and put explanatory copy behind panels, rows, or details.

## Priority Rewrite
The single most important wording problem to fix next is the remaining public-facing "command center" framing in meta/product copy. It overstates the product as a platform and weakens the Today-first assistant promise. Replace it with concrete daily-workspace language that names the real modules without sounding like a SaaS control room.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, and projects in one daily workspace."

- Before: "command center"
  After: "daily workspace"

- Before: "demo"
  After: "example day"

- Before: "proof"
  After: "review"

- Before: "sample data"
  After: "example items"

- Before: "Calendar handoff"
  After: "Calendar prep"

- Before: "polish"
  After: "clean up"

- Before: "workflow"
  After: "task list", "calendar plan", or "project brief", depending on the surface.

## Voice Rules
- Lead with the user's next action, not the product concept.
- Prefer concrete nouns: task list, note, calendar block, workout log, project brief, daily plan.
- Avoid internal build words in visible UI: demo, proof, handoff, polish, sample data, workflow, command center.
- Keep first-screen copy short; do not explain the whole suite above the fold.
- Use "workspace" only when it is supported by specific module language nearby.
- Separate public product copy from signed-in app copy: public pages may explain; app screens should help the user act.
- Do not invent intelligence, prediction, automation, or AI promises unless the behavior is visible and deterministic.
- Keep button labels direct: "Add task", "Capture note", "Review today", "Open calendar".

## Next 5 Copy Tasks
- [ ] Replace the public meta "command center" description in editable app source only; guardrail: use "daily workspace" language and do not touch generated root output unless explicitly approved.
- [ ] Search visible `app-vNext/src` strings for "demo", "proof", "handoff", "polish", and "sample data"; guardrail: change only rendered UI text, not class names, IDs, params, or internal docs.
- [ ] Review HQ first-screen labels after the Today context stack; guardrail: every visible sentence must answer who it is for, what to do, and what the user gets.
- [ ] Review EasyList email/example content for any visible "sample" wording; guardrail: replace with concrete email/task language without changing data shape or behavior.
- [ ] Review LoginPage visible copy only if auth-file changes are explicitly allowed; guardrail: copy-only, no auth logic, no route behavior, no Firebase changes.

## Stop Or Continue
continue but fix copy first