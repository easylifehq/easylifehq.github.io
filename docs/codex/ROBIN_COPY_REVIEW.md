# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is closer to a calm daily workspace, but a few visible phrases still sound like product scaffolding or dashboard marketing instead of a signed-in personal assistant.

## Mission Voice Fit
The strongest copy direction is concrete and useful: "Opening your workspace", "daily plan", "task list", "recent notes", and "today context" fit the mission well. The weaker copy still leans on broad platform language like "command center" and builder-facing signals like "demo", "proof", and "sample" when those appear near user-facing surfaces. EasyLife should sound like a professional daily assistant, not a SaaS dashboard, internal prototype, or feature showroom.

## Delicate Wording Risks
- "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center." overexplains the suite and uses "command center", which the operating mode explicitly discourages.
- "Start with" in the login proof card risks sounding like an instruction fragment rather than a clear customer action.
- "Nothing completed yet this week. Start with one small win." is friendly, but slightly motivational-generic; it would be stronger if tied to a concrete action.
- `auth-proof-card` is likely a class name, but if "proof" appears visually anywhere, it should be removed. It sounds like internal sales evidence.
- "demo" is acceptable in dev params and internal route logic, but any visible "demo" copy should become "example day", "preview", or "workspace".
- "sample" IDs are harmless internally, but rendered "sample data" or "sample" labels should be avoided in product surfaces.
- The marketing meta description still reads like a feature inventory before a user outcome.
- Some review/task language still uses "polish", "handoff", "proof", and "workflow"; those are fine in internal docs, but should not leak into visible app copy.

## Beautiful Language Opportunities
- Replace "command center" with "daily workspace" or "one workspace for your day".
- Make first-screen copy answer: what should I do next, where is today's context, and what changes if I act?
- Give module copy more job-specific nouns: task list, calendar block, note, workout log, project brief.
- Use warmer loading and empty-state language without becoming cute.
- Shorten primary labels. Let detail copy appear only after the user opens the relevant module or panel.
- Make public copy promise calm organization, not total control or all-in-one breadth.

## Priority Rewrite
The single most important copy fix is replacing visible "command center" language in public HTML/meta copy with a concrete daily-workspace promise. It is broad, generic, and against the current EasyLife voice rules. Nami should make one narrow copy-only task for `404.html` and `app-vNext/index.html` if those files are allowed by the supervisor, or otherwise quarantine it as root/static output that needs human-approved production-copy handling.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps your tasks, notes, calendar, workouts, and projects in one calm daily workspace."

- Before: "Start with"
  After: "Begin with"

- Before: "Nothing completed yet this week. Start with one small win."
  After: "Nothing completed yet this week. Pick one task to finish today."

- Before: "Opening your workspace."
  After: "Opening today's workspace."

- Before: "demo"
  After: "example day"

- Before: "proof"
  After: "preview"

- Before: "sample data"
  After: "example items"

- Before: "workflow"
  After: "daily plan"

## Voice Rules
- Use concrete daily-life nouns: task list, calendar block, note, workout log, project brief, daily plan, workspace.
- Avoid "command center", "personal operating system", "premium", "high-tech", "proof", "handoff", "polish", "workflow", and visible "demo".
- Keep first-screen copy short. One next action first, context second, details later.
- Do not explain every module at once inside the working app.
- Public pages may describe the product, but signed-in app copy should use direct task labels.
- Empty states should say what is missing and what the user can do next.
- Do not add claims about AI, automation, outcomes, reliability, or integration unless the product visibly supports them.

## Next 5 Copy Tasks
- [ ] Replace visible "command center" meta copy with "daily workspace" language; do not touch routing, auth, deployment behavior, or package files.
- [ ] Review LoginPage visible text around "Start with" and make the action label a complete, concrete phrase; avoid adding claims or new sections.
- [ ] Rewrite the EasyStatistics empty-state sentence so it points to one concrete next action; keep it under 12 words.
- [ ] Search app-visible strings for "demo", "proof", and "sample data"; replace only rendered customer-facing text, not params, IDs, class names, or dev-only logic.
- [ ] Review the protected HQ first viewport copy and remove one broad product phrase if present; preserve the one-next-action staging.

## Stop Or Continue
continue but fix copy first