# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is closer to a calm daily workspace, but a few visible and metadata-adjacent phrases still sound like internal product framing instead of a useful personal assistant.

## Mission Voice Fit
The protected Today/HQ direction fits the mission when it names a next move, today context, and quick capture in concrete language. The strongest voice is practical and calm: "Opening your workspace," "daily plan," "capture note," and module-specific nouns all support the personal assistant position. The weaker voice appears where EasyLife still uses broad builder/product language like "command center," "proof," "demo," and "sample," which makes the product feel inspected rather than lived in.

## Delicate Wording Risks
- "command center" in public metadata overstates the product and sounds like generic SaaS infrastructure rather than a personal daily workspace.
- "proof" in `auth-proof-card` appears to be a class name, not visible copy, but it should not become visible text.
- "demo" appears mostly in query parameters and dev-only contexts. Keep it out of customer-facing labels.
- "sample" appears in internal IDs on EasyList Email. Acceptable as an identifier, but guest/user-facing examples should say "example" or use a concrete item name.
- "Plan my day" is clear, but it can become too magical if paired with AI-style claims. Keep it deterministic and local.
- "What am I forgetting" is useful but emotionally loaded. It works as a command only if the output is framed as a checklist or possible gaps, not certainty.
- Any remaining "proof," "handoff," "polish," or "command center" copy should be treated as builder language unless it is clearly internal code.

## Beautiful Language Opportunities
- Replace broad suite language with daily nouns: workspace, task list, calendar block, note, workout log, project brief, daily plan.
- Make command copy feel like a quiet utility: "Capture something," "Review today," "Add a task," "Open calendar."
- Let Today/HQ copy sound like a start point, not a product pitch.
- Use "example day" instead of "demo" when showing mock or seeded data to a user.
- Use "calendar prep" instead of "handoff" when describing moving task context toward planning.
- Keep first-screen labels short, then put explanation only inside expanded panels or detail states.

## Priority Rewrite
The most important wording problem is the remaining "command center" framing in public metadata and any visible app copy. EasyLife should not introduce itself as infrastructure. It should introduce itself as a calm workspace for today's tasks, notes, calendar, workouts, and projects.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and follow-ups in one daily workspace."

- Before: "Command palette"
  After: "Quick actions"

- Before: "What am I forgetting"
  After: "Check for gaps"

- Before: "demo"
  After: "example day"

- Before: "sample data"
  After: "example items"

- Before: "proof"
  After: "preview" or "example"

- Before: "Calendar handoff"
  After: "Calendar prep"

## Voice Rules
- Prefer concrete daily-life nouns over product-platform nouns.
- Keep the protected first screen task-led: one next move, today context, quick capture.
- Use "workspace" instead of "command center" for public and app-facing copy.
- Use "example" instead of "demo" or "sample" when the user can see it.
- Avoid AI certainty. Say what the app can help organize, not what it knows.
- Keep command labels short and verb-led.
- Do not explain the whole suite on the first screen.
- Separate internal/dev labels from user-facing language.

## Next 5 Copy Tasks
- [ ] Replace public metadata "command center" with "daily workspace"; do not change routing, auth, or generated output unless the supervisor explicitly selects that file.
- [ ] Audit visible HQ command labels for "What am I forgetting" and ensure nearby copy frames results as possible gaps, not certainty.
- [ ] Check EasyList Email visible examples for "sample" language; replace only visible text with "example" or concrete email names.
- [ ] Review command palette labels and keep the first four actions concrete: Add task, Capture note, Plan today, Check for gaps.
- [ ] Search app-facing JSX strings for "demo," "proof," "handoff," and "polish"; change only visible customer copy, leaving internal identifiers alone.

## Stop Or Continue
continue but fix copy first