# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is getting calmer and more concrete, but visible copy still slips into builder, brochure, and internal-process language instead of consistently sounding like a personal daily workspace.

## Mission Voice Fit
The best copy fits the mission when it uses plain nouns like tasks, notes, calendar, workout log, daily plan, workspace, follow-up, and draft reply. Those words support a connected personal assistant product without overpromising. The weaker copy still leans on "command center", "demo", "proof", "sample data", "polish", and "handoff", which makes EasyLife sound like a build artifact or sales page rather than a tool a signed-in user opens to decide what to do next today.

## Delicate Wording Risks
- "command center" appears in public metadata and still feels too generic SaaS for EasyLife. It suggests a broad platform claim instead of a calm daily workspace.
- "demo" appears in route/query logic and may be internal, but any visible use should be replaced with "example day", "preview", or "workspace example" depending on context.
- "proof" appears in `auth-proof-card`; if this is only a class name it is harmless, but any visible "proof" phrasing would feel builder-facing and salesy.
- "sample data" and `sample-*` identifiers are probably internal, but visible labels should not say "sample data"; users should see "example email", "example day", or "suggested item".
- "handoff" remains a known risk because it sounds like internal service-process language unless the reader, action, and result are concrete.
- "polish" and "ship" are not appropriate in visible user tasks. They frame EasyLife around product work instead of the user's life.
- "Start Free" and "See Features" are still cited in design evidence as repeated above-the-fold language. On signed-in surfaces, this is a staging failure and should not appear.
- "personal operating system" and "high-tech" should remain mission shorthand only, not customer-facing or app-facing copy.
- "manager-ready", "ready for service", "workflow", and "handoff" should stay out of visible app copy unless tied to a specific user action and outcome.

## Beautiful Language Opportunities
- Replace broad identity claims with daily utility: "Plan today", "Capture a thought", "Review the next block", "Clear the task list".
- Give Today/HQ copy a calmer assistant voice: one next action, one reason, one easy path forward.
- Rename mock or prototype surfaces as examples only when visible: "Example day", "Example email", "Suggested plan".
- Use module-specific nouns so pages stop feeling interchangeable: task list, note, calendar block, workout log, study load, draft reply.
- Keep candidate labels short and concrete: task, deadline, event, follow-up, keep visible, draft reply.
- Make school and coach copy humble: "suggested focus", "capacity signal", "plan intensity", not "coach knows" or "AI decides".
- Use progressive disclosure in labels. Primary labels should be short; explanatory copy belongs inside detail panels, previews, or review rows.

## Priority Rewrite
The most important wording problem is the remaining builder/brochure vocabulary in visible surfaces and metadata. Nami should prioritize a narrow copy pass that replaces "command center", visible "demo", "proof", "sample data", "handoff", "polish", and "ship" with concrete daily-workspace nouns, while leaving internal identifiers alone unless they render into the UI.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, and projects in one daily workspace."

- Before: "Products and demo below"
  After: "Browse the apps"

- Before: "EasyCalendar handoff"
  After: "Calendar prep"

- Before: "sample data"
  After: "example day"

- Before: "proof"
  After: "preview" or "example", depending on whether the user sees it.

- Before: "polish project"
  After: "Finish project brief"

- Before: "ship timeline"
  After: "Weekly planning review"

- Before: "command center"
  After: "daily workspace"

## Voice Rules
- Lead with what the user can do today.
- Use concrete nouns: task list, note, calendar block, workout log, project brief, study load, draft reply.
- Avoid internal build words in visible UI: demo, proof, sample data, polish, ship, handoff.
- Keep primary labels short and useful.
- Put explanation behind the user's next action, not before it.
- Separate marketing copy from working app copy.
- Signed-in screens should never sound like a sales page.
- Do not imply real AI, backend automation, email sending, or prediction unless the feature is actually present and approved.
- For scenario or coach language, say "suggested", "signal", "based on", and "review" instead of certainty language.
- Prefer calm practical warmth over cleverness.

## Next 5 Copy Tasks
- [ ] Replace the public metadata phrase "one command center" with "one daily workspace"; guardrail: metadata copy only, no route or behavior changes.
- [ ] Scan visible JSX strings for "demo", "proof", and "sample data"; guardrail: change only rendered user-facing text, not query params, class names, or internal IDs.
- [ ] Review the signed-in HQ first viewport for sales-language leftovers; guardrail: remove "Start Free", "See Features", or product-promise phrasing if present, without adding new sections.
- [ ] Review EasyProjects visible examples for "polish", "ship", and "handoff"; guardrail: replace one internal-process phrase with a concrete user task and keep the same data shape.
- [ ] Review Phase 7 capacity and coach labels for overconfidence; guardrail: use "capacity signal", "suggested focus", and "plan intensity" without implying prediction or automated advice.

## Stop Or Continue
continue but fix copy first