# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is closer to a calm daily workspace, but visible language still slips into brochure, builder, and internal process wording that weakens the personal assistant promise.

## Mission Voice Fit
The copy mostly fits the mission when it uses concrete daily nouns: workspace, task list, calendar planning, notes, workout log, daily plan, and next move. The weaker fit appears when app and marketing surfaces use phrases like "command center", "demo", "proof", "sample", and repeated feature framing. Those phrases make EasyLife sound like a product being shown, not a working personal system helping the user decide what to do today.

## Delicate Wording Risks
- "Command center" appears in public metadata and conflicts with the calmer personal assistant direction. It sounds generic SaaS and too militarized for a personal life workspace.
- "Start Free" and "See Features" on protected or app-like surfaces can make signed-in areas feel like marketing pages instead of usable software.
- "Demo" in URL/test logic is probably internal, but any visible instance should be replaced with "example day", "workspace preview", or "sample workspace" only where clearly non-production.
- "Proof" in class names is harmless internally, but any visible "proof" copy reads like builder validation rather than customer value.
- "Sample data" and "sample" identifiers in rendered mock queues risk making the experience feel fake if the word appears in UI.
- Repeated "Features" framing creates a brochure rhythm and violates information staging when shown before the user's next action.
- "EasyLifeHQ" still feels like an internal product name beside "Daily Workspace" and the module names; the naming spine needs consistency.
- Any remaining "handoff", "polish", or "ship" language should be treated as internal build language unless it is clearly hidden from customers.

## Beautiful Language Opportunities
- Replace "command center" with "daily workspace", "today workspace", or "home for tasks, notes, calendar, and routines."
- Make protected first screens use verbs tied to user outcomes: "Plan today", "Capture a note", "Review the next task", "Open calendar block."
- Use "example day" instead of "demo" when showing static or mock content.
- Use "calendar prep" or "next calendar block" instead of "handoff."
- Use "ready to review" or "ready for today" instead of "proof" or "polish."
- Let module labels stay short and concrete: Today, Tasks, Calendar, Notes, Coach, Inbox, More.
- Keep helper copy below primary actions and make it explain the immediate result, not the whole system.

## Priority Rewrite
The most important wording problem is the remaining brochure/internal language around the product spine: "command center", "demo", "proof", "sample data", "Features", and public CTA language on app-like surfaces. Nami should turn this into a narrow copy cleanup that checks only visible strings in `app-vNext/src`, replaces one customer-facing internal/process phrase at a time, and preserves routes, behavior, and data shapes.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, and projects in one daily workspace."

- Before: "Start Free"
  After: "Open EasyLife"

- Before: "See Features"
  After: "See how it works"

- Before: "Products and demo"
  After: "Products and preview"

- Before: "Sample data"
  After: "Example day"

- Before: "Calendar handoff"
  After: "Calendar prep"

- Before: "Proof"
  After: "Preview" or "Current state"

- Before: "Command Center"
  After: "Today" or "Daily workspace"

## Voice Rules
- Use concrete daily nouns before product nouns: task list, note, calendar block, workout log, project brief, daily plan.
- Do not use internal build words in visible UI: demo, proof, handoff, polish, ship, sample data, workflow.
- Protected app copy should tell the signed-in user what to do next and what they will get.
- Public copy may explain the product, but it should not crowd the first screen with feature inventory.
- Keep primary labels short: Today, Tasks, Calendar, Notes, Coach, Inbox, More.
- Treat "AI", "smart", and assistant language carefully; do not imply real automation unless the visible behavior exists.
- Prefer "example" over "sample" when showing mock content to a customer.
- Keep helper text below the action it supports, not above the main job.

## Next 5 Copy Tasks
- [ ] Replace one visible "command center" phrase in app or public metadata with "daily workspace"; guardrail: do not touch docs, routing, auth, Firebase, or package files.
- [ ] Scan protected routes for visible "Start Free", "See Features", or "Features" labels and replace one instance with app-action language; guardrail: preserve links and behavior.
- [ ] Check EasyList email candidate copy for any rendered "sample" wording and change one visible instance to "example"; guardrail: no data-shape or mock-data structure changes.
- [ ] Review HQ and AppHeader naming for "EasyLifeHQ" versus "Today" or "Daily Workspace"; guardrail: change only one visible label if it improves clarity.
- [ ] Replace one remaining visible "handoff", "proof", "polish", or "demo" phrase with a concrete noun such as "calendar prep", "preview", "ready to review", or "example day"; guardrail: no broad copy sweep.

## Stop Or Continue
continue but fix copy first