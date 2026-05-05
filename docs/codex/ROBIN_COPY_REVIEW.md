# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is closer to a calm daily workspace, but visible copy still leaks brochure, builder, and internal review language in places where the user needs concrete next-action language.

## Mission Voice Fit
The best direction is the newer Today, capture, notes, school, inbox, and coach language: it speaks to actual daily use instead of selling a platform. The mission wants a connected personal assistant product, and that voice should be short, specific, and action-led. Copy still slips when it uses "command center", "demo", "proof", "sample data", or overly broad suite claims, because those words make EasyLife feel like a product presentation instead of a working daily surface.

## Delicate Wording Risks
- "command center" in public metadata overclaims the product shape and sounds like generic SaaS positioning rather than a personal daily workspace.
- "demo" is acceptable in dev-only params and internal flags, but any visible use should become "example", "preview", or a concrete product noun.
- "proof" in `auth-proof-card` looks like an internal class name, not visible copy, but the pattern should not become customer-facing.
- "sample" IDs in EasyList email data are likely internal, but visible email candidate copy should avoid "sample data" and use "example email", "inbox item", or the actual candidate type.
- "Products", "Get Started", "Start Free", and "See Features" are too marketing-forward if they appear on working app surfaces.
- "personal operating system" is mission language, but it should stay out of visible app copy unless the surface is explicitly a public product page.
- Review packets and fleet recovery language contain builder phrases like "quarantined", "guardrails", "proof", and "implementation"; keep those in docs only, never app UI.
- Any first-screen text that explains modules instead of naming the user's next action is a staging failure.

## Beautiful Language Opportunities
- Replace broad suite claims with concrete daily nouns: today, task list, calendar block, note, workout log, project brief, inbox item.
- Make empty states warmer by telling the user exactly what they can do next in one sentence.
- Use "Today" as the anchor word more consistently on protected surfaces.
- Make approval language plain and trust-building: "Review before adding", "Draft only", "Nothing sends without you."
- For Notes, favor capture and memory language: "Capture a thought", "Review recent notes", "Turn this into a task."
- For Coach and capacity, keep mathematical humility: "based on today's plan", "suggested pace", "light day", not certainty or prediction.
- For school planning, use practical student nouns: course, assignment, exam, study block, due date.

## Priority Rewrite
The most important wording problem is removing visible builder and brochure language from first-screen and module-entry copy. Nami should scan protected and marketing UI for "command center", "demo", "proof", "sample data", "polish", and "handoff", then replace only visible instances with concrete daily-workspace language while leaving internal identifiers alone.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar plans, workouts, and projects in one daily workspace."

- Before: "Start Free"
  After: "Open EasyLife"

- Before: "See Features"
  After: "See how it works"

- Before: "Sample data"
  After: "Example day"

- Before: "Calendar handoff"
  After: "Calendar prep"

- Before: "Proof"
  After: "Preview"

- Before: "What am I forgetting"
  After: "Review loose ends"

- Before: "Command Center"
  After: "Today"

## Voice Rules
- Lead with the user's next action, then context, then detail.
- Use concrete product nouns: task, note, calendar block, workout log, inbox item, project brief.
- Keep protected app copy functional and quiet; save product explanation for public pages.
- Avoid internal process words in visible UI: proof, demo, handoff, polish, workflow, guardrail, quarantine.
- Do not claim automation, intelligence, prediction, or sending unless the behavior is real and user-approved.
- Prefer "review", "draft", "add", "capture", "plan", and "open" over abstract verbs like "manage" or "optimize".
- Keep labels short; put explanation behind panels, rows, drawers, or secondary text.
- When a feature is mock or local-only, call it an example only where the user needs that context.

## Next 5 Copy Tasks
- [ ] Replace visible "command center" in public metadata or UI with "daily workspace"; do not touch internal mission docs or routing.
- [ ] Scan protected first-screen copy for "demo", "proof", "sample data", "polish", and "handoff"; change only visible strings, not class names or dev flags.
- [ ] Review HQ Today copy and make the primary action label name one concrete user action; keep it under five words.
- [ ] Review EasyList email approval copy and ensure each candidate type says task, deadline, event, follow-up, keep visible, or draft reply; do not imply auto-send.
- [ ] Review EasyNotes capture/review text and replace any broad feature explanation with one clear action cue; do not add new claims.

## Stop Or Continue
continue but fix copy first