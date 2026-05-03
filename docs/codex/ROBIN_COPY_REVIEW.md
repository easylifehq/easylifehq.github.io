# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is closer to a calm personal workspace, but visible and near-visible language still slips into internal product-build wording and Settings still explains too much before the user knows what to do.

## Mission Voice Fit
The mission asks for a connected, professional personal operating system that helps the user act faster without clutter. The best current language fits that: "workspace", "daily plan", "calendar prep", "task list", "recent notes", and "today" all support a useful assistant feel. The weaker language still sounds like a builder narrating the product: "command center", "demo", "proof", "handoff", "polish", "sample data", and overloaded Settings helper copy. Those words make EasyLife feel less like a trustworthy daily tool and more like an internal prototype or sales deck.

## Delicate Wording Risks
- "command center" still appears in public metadata and conflicts with the calmer personal assistant position. It sounds generic SaaS and heavier than the product needs.
- "demo" in visible or route-adjacent copy risks making the product feel temporary or fake. Keep it only for internal dev flags and non-customer identifiers.
- "proof" reads like builder validation language, not user value. If visible, replace it with "example", "preview", "workspace", or the concrete object being shown.
- "handoff" is too internal for customer-facing copy. It should become "calendar prep", "project brief", "next step", or "shared note" depending on context.
- "polish" and "ship" in EasyProjects sample or timeline copy sound like product-development work, not ordinary user projects.
- "Start with" can be acceptable in empty states, but it should name the object and result: "Start with one small win" is clear enough; "Start with" alone is too instructional and unfinished.
- Settings still appears to expose too many controls and explanations above the fold. Even if each label is clear, the staging makes the page read like an inventory instead of a control center.
- Any copy that says or implies "sample data" should be replaced with "example day", "example task", or "example project" when it is visible to users.

## Beautiful Language Opportunities
- Settings can sound calmer by leading with one concrete setup state, then moving secondary options lower: "Your suite is set for today" or "Choose what EasyLife shows first."
- EasyProjects can become more personal and credible by replacing product-build phrases with everyday project language: "Weekly planning review", "Finish project brief", "Prepare calendar blocks."
- Marketing metadata should trade "command center" for "workspace" or "daily workspace" to match the mission without sounding overbuilt.
- Empty states can be warmer when they name the next action and the payoff: "Add one task to give today a clear starting point."
- Module previews should use object nouns over abstract status: "Task list", "Calendar block", "Project brief", "Workout log", "Recent note."
- Experiments and visual QA surfaces should clearly read as examples only where needed, without letting "demo" become a visible product word.

## Priority Rewrite
Fix remaining visible builder/process language in EasyProjects and public metadata first. Replace one user-facing "polish", "ship", "handoff", "proof", "demo", or "command center" instance at a time with concrete daily-workspace nouns, without adding claims or longer explanation. Nami should start with EasyProjects copy because it directly affects trust: project examples should sound like a user's real work, not EasyLife's own development queue.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one calm workspace."
- Before: "Calendar handoff"
  After: "Calendar prep"
- Before: "Polish project"
  After: "Finish project brief"
- Before: "Ship timeline"
  After: "Weekly planning review"
- Before: "Proof"
  After: "Example workspace"
- Before: "Sample data"
  After: "Example day"
- Before: "Products and demo below"
  After: "Products below"
- Before: "Start with"
  After: "Start with one task"

## Voice Rules
- Use concrete product nouns: task list, note, calendar block, project brief, workout log, daily plan, workspace.
- Do not use builder words in visible UI: demo, proof, handoff, polish, ship, sample data, command center.
- Keep first-screen copy short. One job, one next action, one compact status.
- Marketing copy may explain the product; working app copy should tell the user what they can do now.
- Prefer "today" language when the surface is protected and signed-in.
- Avoid broad claims unless the UI visibly supports them.
- Do not make Settings sound like a system admin panel. Make it sound like control over the user's daily workspace.
- Keep helper text secondary and specific; do not explain every feature at once.

## Next 5 Copy Tasks
- [ ] Replace one visible EasyProjects "polish", "ship", or "handoff" phrase with a concrete user task; do not change data fields, routes, or behavior.
- [ ] Replace public metadata "command center" with "calm workspace" or "daily workspace"; do not touch generated build output or deployment files.
- [ ] Scan visible JSX strings for "proof" and replace only customer-facing instances with "example", "preview", or a concrete object noun.
- [ ] Review the Settings first viewport and remove or shorten one helper paragraph; preserve all setting labels that affect meaning.
- [ ] Review one empty state for "Start with" phrasing and ensure it names the action and outcome in one short sentence.

## Stop Or Continue
continue but fix copy first