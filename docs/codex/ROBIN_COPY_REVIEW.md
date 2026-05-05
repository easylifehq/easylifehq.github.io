# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward a calmer daily assistant voice, but too much visible language still sounds like a product demo, internal build loop, or brochure instead of a working personal workspace.

## Mission Voice Fit
The strongest copy fits the mission when it uses concrete daily nouns: tasks, notes, calendar planning, workout log, daily plan, workspace, project brief, and capture. That language supports a connected personal system without overpromising. The weakest copy still leans on "command center", "demo", "proof", "sample", and marketing CTA patterns, which make EasyLife feel presented rather than used. For this product position, the signed-in app should sound like it is helping the user decide what to do next today, not explaining the suite or showing evidence that the prototype works.

## Delicate Wording Risks
- "command center" in public metadata is too generic and militarized for EasyLife's calm personal assistant mission.
- "Start Free" and "See Features" on signed-in or app-like surfaces create a sales-page feeling where the user expects a working tool.
- "demo" is acceptable in dev-only query params, but risky anywhere visible because it weakens trust and makes the app feel temporary.
- "proof" in class names is not visible copy, but visible "proof" language should be avoided because it sounds like internal validation rather than customer value.
- "sample data" and "sample" identifiers are probably internal, but any visible version should become "example day", "example email", or "practice item".
- "polish", "handoff", and "workflow" should remain out of customer-facing copy unless the action and recipient are concrete.
- Repeated feature eyebrows and chip rows risk sounding like brochure copy instead of helping the user act.
- Large explanatory module copy risks violating the first-screen contract by answering "what is this feature?" before "what should I do next?"

## Beautiful Language Opportunities
- Replace abstract suite language with personal daily language: "Today", "Next move", "Capture", "Calendar block", "Task list", "Workout log", "Project brief".
- Make empty states warmer and more useful by naming the next action in plain terms.
- Use shorter primary labels in the protected app: "Add task", "Capture note", "Plan day", "Review inbox", "Log workout".
- Let public marketing explain the product, but let app surfaces speak in direct task language.
- Give each module a distinct voice texture: tasks should feel action-oriented, notes should feel calm and writable, calendar should feel time-aware, workout should feel quick and grounded.
- Use "example" instead of "demo" where mock or seeded content is visible.
- Replace feature-list language with status language on protected routes: "2 tasks due today" is more useful than "Powerful task management".

## Priority Rewrite
The most important wording problem is the leftover brochure and internal-build vocabulary around signed-in working surfaces. Nami should prioritize replacing any visible "command center", "demo", "proof", "sample data", "handoff", or "polish" language in `app-vNext/src` with concrete daily-workspace nouns, then verify those terms remain only in internal identifiers, docs, CSS class names, or dev-only route flags.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, and projects in one calm daily workspace."

- Before: "Start Free"
  After: "Open workspace"

- Before: "See Features"
  After: "View details"

- Before: "sample data"
  After: "example day"

- Before: "proof"
  After: "example"

- Before: "Calendar handoff"
  After: "Calendar prep"

- Before: "polish project"
  After: "Finish project brief"

- Before: "AI Command Center"
  After: "Daily actions"

## Voice Rules
- Use concrete nouns before product abstractions.
- On signed-in routes, write for action, not persuasion.
- Keep first-screen copy short: one next move, today context, compact status.
- Do not use "demo", "proof", "handoff", "polish", "sample data", or "command center" in visible customer-facing text.
- Use "example" for mock content and "draft" for anything not yet approved.
- Avoid AI promise language unless the behavior is visible, deterministic, and clearly limited.
- Keep labels short; put explanation behind detail views, panels, or secondary routes.
- Separate public marketing copy from working app copy.

## Next 5 Copy Tasks
- [ ] Replace the public metadata phrase "one command center" with "one calm daily workspace"; do not change product claims or add new features.
- [ ] Search visible JSX strings in `app-vNext/src` for "demo", "proof", "sample data", "handoff", "polish", and "command center"; replace only customer-facing instances and leave internal identifiers alone.
- [ ] On one protected route, replace any sales-style CTA pair with direct task labels; do not alter routing, auth, persistence, or behavior.
- [ ] Review the HQ first viewport and shorten one explanatory line so it names the user's next action today; do not add another panel or feature claim.
- [ ] In the Inbox or school-planner surfaces, change any mock-data label to "example" language and keep approval wording explicit; do not imply real email automation or prediction.

## Stop Or Continue
continue but fix copy first