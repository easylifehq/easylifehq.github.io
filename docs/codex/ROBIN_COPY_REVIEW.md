# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward calmer daily-workspace language, but remnants of builder, brochure, and platform phrasing still weaken the personal assistant promise.

## Mission Voice Fit
The best copy now fits the mission when it uses concrete daily nouns: workspace, daily plan, task list, calendar block, notes, workout log, and settings. The weaker copy still frames EasyLife as a "command center" or product showroom, which sounds generic and slightly inflated for a personal assistant suite. The signed-in app should sound useful and immediate, while public pages can explain the product without crowding the working-app story.

## Delicate Wording Risks
- "command center" remains in customer-facing meta copy in `404.html` and `app-vNext/index.html`; it is broad, corporate, and conflicts with the quieter personal assistant direction.
- "What am I forgetting" can sound like an AI promise if the underlying output is deterministic or local; safer language should make it a review action, not a mind-reading claim.
- "Inbox intelligence" is acceptable as internal phase language, but too grand for visible app copy unless the user can see sources, assumptions, and approval boundaries.
- "approval queue" is clear for internal/product planning, but visible user copy may feel stiff. "Review suggested items" is warmer and more concrete.
- "sample" and "demo" hits appear mostly internal identifiers or dev route flags; do not churn these unless they render visibly to users.
- "proof" appears in a CSS class name and should be ignored unless visible text uses it.
- Repeated "workspace" can become a fog word if it stands alone. Pair it with concrete action: "Open today's plan", "Review tasks", "Capture a note".
- Any first-screen copy that introduces modules instead of naming the next action should be treated as a staging problem.

## Beautiful Language Opportunities
- Make the protected first screen sound like today, not the product: "Start with today's plan", "Review what is due", "Capture a thought".
- Use compact module labels that feel useful: "Tasks due", "Next calendar block", "Recent notes", "Workout plan".
- Replace platform nouns with household daily-life nouns: plan, list, note, block, brief, reminder, review.
- Make command/capture language deterministic: "Review loose ends" instead of implying prediction or memory beyond visible data.
- Keep public pages plain and confident: product name, one promise, one action, one preview.
- Let empty states sound like help, not feature tours.

## Priority Rewrite
Replace remaining visible "command center" language in public metadata and any customer-facing surfaces with concrete daily-workspace wording. This is the most important fix because it is a broad product-positioning phrase that makes EasyLife sound like generic SaaS instead of a calm personal assistant app.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, and projects in one daily workspace."

- Before: "What am I forgetting"
  After: "Review loose ends"

- Before: "Inbox intelligence"
  After: "Inbox review"

- Before: "Approval queue"
  After: "Review suggested items"

- Before: "Plan my day"
  After: "Build today's plan"

- Before: "Sample data"
  After: "Example day"

- Before: "Proof surface"
  After: "Working preview"

## Voice Rules
- Lead with the user's next action, not the product architecture.
- Use concrete nouns: task list, note, calendar block, daily plan, project brief, workout log.
- Avoid broad platform language: command center, operating system, intelligence, proof, workflow, handoff, polish.
- Keep primary labels short and direct.
- Put explanations behind secondary views, rows, drawers, tabs, or help text.
- Separate public marketing copy from signed-in app copy.
- Do not imply AI, prediction, automation, sending, or external data use unless the UI clearly proves it and requires user approval.
- Treat "workspace" as supporting language, not a standalone value prop.

## Next 5 Copy Tasks
- [ ] Replace visible "command center" metadata in public HTML with "daily workspace"; do not touch generated build output unless the supervisor explicitly allows it.
- [ ] Review the protected HQ first viewport and remove one line that explains modules instead of telling the user what to do next today.
- [ ] Rename any visible "What am I forgetting" command to "Review loose ends" unless the output clearly shows sources and assumptions.
- [ ] Change one visible "approval queue" or "inbox intelligence" label to a calmer action label; preserve behavior and approval boundaries.
- [ ] Search changed `app-vNext/src` strings for visible "demo", "sample data", "proof", "handoff", and "polish"; only replace text that renders to users, not class names, IDs, docs, or dev flags.

## Stop Or Continue
continue but fix copy first