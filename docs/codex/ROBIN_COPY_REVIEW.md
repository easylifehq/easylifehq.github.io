# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward calm daily-workspace language, but a few visible strings still sound like internal product scaffolding instead of a personal assistant surface.

## Mission Voice Fit
The best copy fits the mission when it says "workspace", "daily plan", "tasks", "notes", "calendar", and "what matters today." That language is concrete, useful, and aligned with a connected personal suite. The weaker language still leans on builder or brochure terms like "command center", "demo", "proof", "sample", and "Start with", which makes the product feel less trustworthy and less like a lived-in daily assistant.

## Delicate Wording Risks
- "command center" in public meta copy feels like generic SaaS framing and conflicts with the calmer personal assistant position.
- "Start with" can sound like a builder instruction or onboarding script when the action and outcome are not concrete.
- "auth-proof-card" is likely internal class naming, but "proof" should not leak into visible copy because it sounds like sales evidence instead of product usefulness.
- "demo" and "sample" are acceptable in internal/dev logic, but risky if rendered into user-facing labels because they make the workspace feel fake.
- "Keep the home screen calm..." reads like a design note if surfaced to users. It should stay internal or be rewritten as direct user benefit.
- "Nothing completed yet this week. Start with one small win." is warm, but "small win" is slightly generic and motivational; a more concrete action cue would feel more professional.
- "personal operating system" and "command center" should remain mission/planning language, not customer-facing product copy.

## Beautiful Language Opportunities
- The HQ first screen can use short, grounded labels: "Today", "Next move", "Capture", "Calendar", "Tasks", "Notes".
- Empty states can become warmer without becoming cute by naming the next action plainly.
- Public pages can shift from product claims to daily outcomes: fewer abstract promises, more concrete moments.
- Settings copy can feel more like a control center by using practical nouns: "Theme", "App order", "Notifications", "Install", "Data view".
- Module previews can feel less fake by replacing "sample" language with "example day", "recent note", "next task", or "calendar block".
- Loading and transition copy is already close: "Opening your workspace." is calm and concrete.

## Priority Rewrite
Replace visible "command center" language with calmer daily-workspace language, starting with public HTML/meta copy. It is the most mission-visible wording problem because it frames EasyLife as a generic control panel instead of a personal assistant suite.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and daily work in one calm workspace."

- Before: "Start with one small win."
  After: "Choose one task to finish today."

- Before: "Start with"
  After: "Begin with"

- Before: "sample data"
  After: "example day"

- Before: "demo"
  After: "preview" or "example"

- Before: "proof"
  After: "preview" or "summary"

- Before: "Calendar handoff"
  After: "Calendar prep"

- Before: "polish"
  After: "clean up" or "finish"

## Voice Rules
- Use concrete daily-life nouns before abstract product nouns.
- Prefer "workspace", "daily plan", "task list", "calendar block", "note", "project brief", and "workout log".
- Avoid visible "command center", "personal operating system", "demo", "proof", "handoff", "polish", and "sample data".
- Keep first-screen copy short: one next action, today context, compact module status.
- Do not explain the whole suite above the fold.
- Separate product marketing from working app copy.
- In the signed-in app, labels should tell the user what they can do now.
- Keep warmth practical, not motivational or cute.

## Next 5 Copy Tasks
- [ ] Replace visible public meta copy using "command center" with "calm workspace"; do not touch root production files unless the task explicitly allows that path.
- [ ] Search `app-vNext/src` for visible "demo", "proof", and "sample" strings; replace only rendered user-facing instances, not route flags, IDs, class names, or dev-only params.
- [ ] Review HQ first-screen labels for any builder-style wording; keep only concrete labels tied to today's action, capture, tasks, notes, calendar, and workout status.
- [ ] Rewrite any visible "Start with" line so it names the concrete action and outcome; keep the sentence under 10 words where possible.
- [ ] Review EasyProjects and experiments copy for "handoff", "polish", and "ship"; replace only visible task/example text with real user-work language.

## Stop Or Continue
continue but fix copy first