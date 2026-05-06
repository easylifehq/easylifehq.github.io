# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is closer to a calm daily workspace, but a few visible phrases still sound like internal product scaffolding instead of a trustworthy personal assistant.

## Mission Voice Fit
The best copy now points toward useful daily nouns: workspace, daily plan, task list, calendar block, notes, workout log, and settings. That fits the mission. The weak spots are leftover product-build phrases, especially "command center", "demo", "proof", "sample", and broad module language that can make the app feel like a showcase instead of something the user opens to decide what to do next.

## Delicate Wording Risks
- "command center" in public metadata overstates the product and sounds generic SaaS instead of calm personal workspace.
- "demo" is acceptable in internal query params, but should not appear in visible customer-facing copy unless the page is explicitly a demo page.
- "proof" appears in class naming; harmless if not visible, but avoid moving that language into UI copy.
- "sample data" and "sample" should not appear as visible labels. Prefer "example day", "example task", or "starter list" if the user sees it.
- "Fun and drinks" may feel slightly casual beside the serious daily assistant direction. It should stay optional and quiet, not part of the main spine.
- "Future Plans" is clear enough, but it can become vague if the surrounding copy does not name concrete outputs like ideas, projects, or later tasks.
- Approval/reply language must stay explicit: no copy should imply EasyLife sends, archives, or changes email without user approval.

## Beautiful Language Opportunities
- Replace broad system language with direct daily-life copy: "Start with today", "Review your next task", "Open recent notes", "Plan a calendar block".
- Use short labels in primary navigation: Today, Calendar, Tasks, Notes, Coach, Inbox, More.
- Make optional modules feel like quiet extensions: "Later", "Projects", "School", "Ideas", "Fun".
- In Inbox surfaces, keep trust high with phrases like "Review before adding", "Draft only", and "Needs approval".
- In Notes, use warm but concrete memory language: "Recent notes", "Needs review", "Turn into a task".
- In HQ, avoid explaining the suite. Name the next move and the visible context.

## Priority Rewrite
Fix remaining visible "command center", "demo", "proof", "polish", "handoff", and "sample data" language wherever it reaches users. The app should sound like it is helping someone run today, not presenting a build artifact or internal review packet.

## Suggested Rewrites
- Before: "command center"
  After: "daily workspace"

- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and follow-ups in one daily workspace."

- Before: "sample data"
  After: "example day"

- Before: "demo"
  After: "example"

- Before: "proof"
  After: "preview"

- Before: "Calendar handoff"
  After: "Calendar prep"

- Before: "Future Plans"
  After: "Later plans"

- Before: "Fun and drinks"
  After: "Fun ideas"

## Voice Rules
- Use concrete daily nouns before abstract product nouns.
- Say what the user can do now, not what the system is.
- Keep first-screen copy short: one next move, today context, compact status.
- Do not use builder words in customer-facing UI: handoff, proof, polish, workflow, sample data, command center.
- Use "draft", "review", and "approve" whenever copy touches email-derived actions.
- Keep optional modules quieter than Today, Tasks, Calendar, Notes, Coach, and Inbox.
- Do not make claims about AI, automation, prediction, or sending unless the behavior is real and visible.

## Next 5 Copy Tasks
- [ ] Replace public metadata "command center" with "daily workspace"; do not touch auth, routing, config, package files, or generated output.
- [ ] Search visible JSX strings for "demo", "proof", "sample data", "handoff", and "polish"; replace only user-facing instances, leaving internal identifiers alone.
- [ ] Review the Inbox approval queue copy and confirm every email-derived action says "review", "draft", or "approve" before any outcome.
- [ ] Review the More hub labels and keep optional entries quiet, concrete, and secondary to Today, Calendar, Tasks, Notes, Coach, and Inbox.
- [ ] Review HQ first-screen copy and remove any explanatory line that describes the product instead of naming today's next move.

## Stop Or Continue
continue but fix copy first