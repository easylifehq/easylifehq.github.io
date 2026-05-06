# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward a calmer daily workspace voice, but remaining "command center", "demo", "proof", and brochure-style module language still makes parts of the product sound like a build preview instead of a useful personal assistant app.

## Mission Voice Fit
The strongest mission fit is the shift toward concrete daily nouns: tasks, notes, calendar planning, workout log, daily plan, workspace, and capture. That language matches the audience and product position because it tells a signed-in user what to do next. The weaker fit is the repeated product-positioning language around "command center", "proof", "demo", "Start Free", and feature-style module framing. Those phrases work for a launch deck, not for a protected app that should feel already useful.

## Delicate Wording Risks
- "command center" in `404.html` and `app-vNext/index.html` sounds generic SaaS and overstates the personal assistant promise.
- "auth-proof-card" appears to be a class name, but if "proof" appears visibly anywhere, it reads like internal validation language rather than customer value.
- `demo` query and context identifiers are likely non-visible, but visible "demo" copy should be avoided unless the surface is clearly a public sandbox.
- "sample" IDs in EasyList Email are probably internal, but any visible "sample data" wording would reduce trust. Use "example" only when the UI is openly illustrative.
- "Start Free" on working-module surfaces, if visible to signed-in users, creates a public marketing tone inside the app.
- Repeated module introductions risk sounding like feature brochures instead of an already-open workspace.
- "command palette" can be acceptable as app UI, but "command center" is too grand and generic for EasyLife.
- "Fun and drinks" may fit as an optional hidden area, but it should not compete with the serious daily workspace voice.

## Beautiful Language Opportunities
- Replace broad suite claims with daily-use outcomes: "See today's plan", "Capture a note", "Clear the task list", "Review the next calendar block".
- Make protected app labels shorter and more task-like: "Today", "Tasks", "Calendar", "Notes", "Coach", "Inbox", "More".
- Let each module sound different through its work: EasyNotes should say capture, recent notes, follow-up; EasyCalendar should say today, next block, planning review; EasyWorkout should say session, log, recovery.
- Use "example day" instead of "demo" or "sample data" when fake/local data is visible.
- Use "workspace" carefully; it is warm and broad, but it should not become a vague value prop on its own.
- Soften future-module copy with clear status: "Available under More", "Local preview", "Needs review before saving".

## Priority Rewrite
The single most important wording problem is the remaining public and app-adjacent "command center" language. Replace it anywhere visible with concrete daily-workspace language that names what EasyLife holds and what the user gets: a daily plan, task list, notes, calendar blocks, workouts, projects, and settings in one calm workspace.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and settings in one calm workspace."

- Before: "Command Center"
  After: "Today"

- Before: "AI Command Center"
  After: "Daily planning lab"

- Before: "Demo"
  After: "Example day"

- Before: "Sample data"
  After: "Example items"

- Before: "Start Free"
  After: "Open EasyLife"

- Before: "See Features"
  After: "See what it can organize"

- Before: "Proof"
  After: "Preview"

## Voice Rules
- Use concrete daily nouns before product abstractions.
- Protected app copy should sound like the user is already working, not being sold to.
- Public copy may explain the product, but the working app should use direct task labels.
- Avoid "command center", "operating system", "proof", "handoff", "polish", "demo", and "sample data" in visible customer-facing copy.
- Keep first-screen copy short: one next move, today context, compact module status.
- Do not promise AI, prediction, automation, or intelligence unless the visible surface is deterministic and approved by the user.
- Use "example" for mock data, not "fake", "sample", or "demo".
- Let navigation labels stay plain: Today, Tasks, Calendar, Notes, Coach, Inbox, More.

## Next 5 Copy Tasks
- [ ] Replace visible "command center" in public metadata with "calm workspace"; guardrail: do not touch auth, routing, or build output.
- [ ] Search visible JSX strings for "demo", "proof", "polish", "handoff", and "sample data"; guardrail: change only customer-facing text, not identifiers or docs.
- [ ] On one signed-in module surface, replace marketing CTA language with one direct app action; guardrail: preserve existing routes and button behavior.
- [ ] Tighten one module intro so it names the current job before features; guardrail: no new claims or longer explanatory copy.
- [ ] Review More and optional-module labels for tone drift; guardrail: playful entries must remain secondary and not crowd Today.

## Stop Or Continue
continue but fix copy first