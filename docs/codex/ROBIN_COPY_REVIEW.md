# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward calmer assistant language, but visible and near-visible copy still slips into product-build, dashboard, and proof language that weakens trust.

## Mission Voice Fit
The strongest current voice is concrete and useful: "Today", "Capture", "Plan", "Notes", "More", "Opening your workspace", and "calendar planning" all fit the mission of a calm personal assistant suite. The weaker language appears when EasyLife describes itself as a "command center" or carries internal words like demo, proof, sample, polish, and handoff near customer-facing surfaces. For this product, the copy should feel like a working daily space, not a pitch deck or fleet artifact.

## Delicate Wording Risks
- "command center" in public HTML metadata sounds generic SaaS and conflicts with the assistant-first direction. It also suggests a broad dashboard rather than one clear daily next action.
- "auth-proof-card" is probably a class name, not visible copy, but "proof" remains a recurring product-build word and should stay out of visible UI.
- "demo" in URL/dev flags appears internal, but any visible "demo" language should be replaced with "example day", "sample workspace", or removed depending on context.
- "sample-final", "sample-meeting", "sample-container", and "sample-noise" are likely internal IDs. If rendered anywhere, "sample" should become "example" or the item should read like a real task, meeting, or follow-up.
- The task queue still contains many builder-facing phrases like "proof", "polish", "handoff", "showpiece", and "implementation slice". Those are acceptable in internal docs, but must not leak into app copy.
- "Products and demo below" was correctly identified as rough; any similar mobile header cue should be treated as student-made and replaced with direct navigation language.
- "Open EasyLife" is serviceable, but repeated use across product pages feels generic. It does not tell the user what they will do next.
- "Personal operating system" is mission language, not product-surface language. In the app, prefer daily nouns: today, plan, task list, note, workout, project brief, settings.

## Beautiful Language Opportunities
- Replace public metadata "command center" with "daily workspace" or "personal workspace" so the first product promise feels calmer.
- Make CTAs more contextual: "Plan today", "Capture a task", "Write a note", "Review schedule", "Open workspace".
- Use "workspace" as the broad container and concrete module nouns for action: task list, calendar block, recent note, workout log, project brief.
- Keep first-screen copy short enough to answer: who is this for, what should they do, and what do they get?
- Let Today sound like an assistant start point: one sentence for the current read, one button for the next move, one quiet path to capture.
- In marketing previews, make static rows sound like real daily moments rather than specs or proof points.
- In settings, make descriptions useful and calm: what changes, where it applies, and whether it affects the whole suite.

## Priority Rewrite
The single most important wording problem is the remaining "command center" framing in public metadata and any similar visible app language. It tells the user EasyLife is a dashboard or control room, while the mission requires a personal assistant start surface. Replace it with "daily workspace" or "personal workspace" language everywhere it is customer-facing, and reserve internal planning terms for docs only.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and follow-ups in one daily workspace."

- Before: "Open EasyLife"
  After: "Open workspace"

- Before: "Open EasyLife"
  After: "Plan today"

- Before: "Products and demo below"
  After: "Products below"

- Before: "EasyCalendar handoff"
  After: "Calendar prep"

- Before: "sample data"
  After: "example day"

- Before: "proof"
  After: "preview" or "example", only if visible and accurate

- Before: "polish"
  After: "finish" or "clean up", only when describing a user task

## Voice Rules
- Use concrete daily-life nouns before product nouns: task list, calendar block, note, workout log, project brief, workspace.
- Keep app copy action-led: what the user can do now and what they get from doing it.
- Do not use "command center", "personal operating system", "proof", "handoff", "polish", "demo", or "sample data" in visible customer-facing UI.
- Keep internal fleet words inside docs only.
- First-screen copy should be short, direct, and staged. Do not explain every module at once.
- CTAs should name the next action, not the product wrapper.
- Marketing copy may explain the product; working app copy should help the user act.
- Do not inflate uncertainty or promise intelligence unless the screen shows deterministic inputs, assumptions, and outputs.

## Next 5 Copy Tasks
- [ ] Replace the public HTML meta description phrase "one command center" with "one daily workspace"; do not touch routing, auth, build output, or package files.
- [ ] Search visible JSX strings for "command center", "proof", "handoff", "polish", "demo", and "sample data"; change only one customer-facing instance per task and leave internal identifiers alone.
- [ ] Replace one repeated "Open EasyLife" CTA on a product page with a context-specific action label; preserve the link target and button hierarchy.
- [ ] Review `/app/hq` first-viewport copy and remove one line that explains the suite instead of telling the user the next useful action.
- [ ] Review EasyList email candidate copy for any rendered "sample" language; if visible, rewrite it as "example email", "follow-up", "deadline", "event", or "task" without adding claims.

## Stop Or Continue
continue but fix copy first