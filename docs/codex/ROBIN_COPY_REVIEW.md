# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward a calmer daily workspace voice, but some visible and near-visible language still sounds like product scaffolding instead of a personal assistant helping someone handle today.

## Mission Voice Fit
The mission calls for a connected, professional personal operating system, but the user-facing voice should not keep saying that idea out loud. The best fit is concrete daily language: today, task list, calendar block, recent note, workout log, school plan, follow-up, draft reply, and next move. Recent work appears aligned with that direction, especially around Today, More, Notes, Coach, and Future Plans. The remaining risk is brochure and builder language: "command center", "demo", "proof", "sample data", "polish", and repeated feature-shell copy make the app feel like it is explaining itself instead of helping the user act.

## Delicate Wording Risks
- "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center." The phrase "command center" is too generic-SaaS and conflicts with the calmer daily assistant direction.
- "CommandCenterPage" may be an internal component name, but if any related title renders as "Command Center", it should be replaced with "Today", "Workspace", or "Daily plan".
- "demo" appears in dev/visual QA contexts. Internal route/query usage is acceptable, but visible copy should not say "demo" unless the user is clearly on a public try-it page.
- "sample-final", "sample-meeting", "sample-container", and "sample-noise" look like internal IDs. If any nearby visible copy says "sample", it should become "example", "suggested", or a real daily noun.
- "proof" appears in an auth CSS class. That is likely non-visible, but visible "proof" language would sound like a pitch rather than a product.
- "Future Plans dock" is acceptable in internal docs, but visible app copy should avoid "dock" unless it is a literal UI label the user understands.
- "More hub" is fine as implementation language, but visible UI should say "More", "More apps", or "Optional tools".
- Phase and review packet language is appropriate for docs, not app surfaces.
- "AI Lab", "mock", "sample data", or "fake" language should stay out of the working app surface unless the section is explicitly experimental and clearly separated from the main experience.
- Repeated public CTAs like "Start Free" and "See Features" risk making every module feel like the same product brochure instead of a distinct daily tool.

## Beautiful Language Opportunities
- Replace suite-claim copy with active daily prompts: "Start with today's next move" is stronger than explaining the whole system.
- Use short, concrete module labels: "Tasks", "Calendar", "Notes", "Coach", "Inbox", "More".
- Let each module describe one job: "Capture a task", "Block time", "Review recent notes", "Log a workout", "Draft a reply".
- Make approval language explicit and calm: "Review before adding" or "Draft only - nothing sends yet".
- For optional modules, use understated grouping: "Planning", "Health", "School", "Optional tools".
- For Future Plans, favor "Later ideas" or "Planned next" if the content is not committed work.
- On public pages, move from feature inventory to product use: show one practical preview and one concrete action before any explanation.
- In empty states, use one sentence that answers: what is this for, what should I do, what do I get?

## Priority Rewrite
The single most important wording problem is remaining "command center" and builder/process language on customer-facing or first-screen surfaces. Replace it with concrete daily-workspace language before more Phase 9 work continues, especially in meta descriptions, HQ/Today labels, public module pages, and experimental surfaces that may be visible to users.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and follow-ups in one daily workspace."

- Before: "Command Center"
  After: "Today"

- Before: "See Features"
  After: "See how it works"

- Before: "Start Free"
  After: "Open EasyLife"

- Before: "Sample data"
  After: "Example day"

- Before: "Future Plans dock"
  After: "Later plans"

- Before: "AI Lab"
  After: "Assistant preview"

- Before: "Safe reply draft affordance"
  After: "Review a draft reply"

## Voice Rules
- Use concrete nouns before product abstractions: task list, calendar block, note, workout log, project brief, follow-up, draft reply.
- Do not use "command center", "personal operating system", "premium", "high-tech", "proof", "handoff", "polish", or "workflow" in visible copy unless the reader and action are concrete.
- First-screen copy should name one next action, today context, and a compact status signal.
- Public pages may explain value; working app pages should use direct task labels.
- Keep labels short: one to three words when possible.
- Keep helper copy to one useful sentence, not a product pitch.
- Separate experimental language from production language. Main app surfaces should not say "mock", "fake", or "sample data".
- Approval copy must be explicit when nothing sends or persists: "Review first", "Draft only", "Nothing sends yet".
- Optional modules should feel discoverable but quiet; do not let playful areas compete with Today, Tasks, Calendar, Notes, or Coach.
- Prefer calm specificity over charm. Personality is welcome only after clarity.

## Next 5 Copy Tasks
- [ ] Replace the visible meta description phrase "one command center" with "one daily workspace"; do not touch auth, routing, deploy config, or generated output.
- [ ] Search `app-vNext/src` for visible "Command Center" text and replace only rendered user-facing labels with "Today" or "Daily workspace"; leave internal component names alone.
- [ ] Review EasyList Email visible strings near sample candidate data and replace any user-facing "sample" language with "example"; do not rename internal IDs unless required by visible output.
- [ ] Review public module CTAs and change one repeated generic pair into one route-specific action plus one quiet secondary action; do not add routes or new claims.
- [ ] Review Phase 9 Fun/Drinks entry copy before implementation and keep it optional, playful, and clearly secondary; do not let it appear in the default serious Today path.

## Stop Or Continue
continue but fix copy first