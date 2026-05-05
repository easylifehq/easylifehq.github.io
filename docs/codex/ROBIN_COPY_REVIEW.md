# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward calm daily-workspace language, but a few remaining phrases still sound like product scaffolding instead of a personal assistant the user can trust.

## Mission Voice Fit
The strongest voice direction is concrete and useful: "Opening your workspace," "daily plan," "task list," "calendar block," and module-specific labels fit the mission well. EasyLife should sound like a connected personal workspace that helps the user act today, not like a SaaS launch page or an internal build review. The current copy mostly supports that, but the remaining "command center," "demo," "proof," and "sample" language weakens trust when it appears in customer-facing or rendered surfaces.

## Delicate Wording Risks
- "command center" in public meta copy feels too generic SaaS and too broad for the calmer personal-assistant position.
- "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center" reads like a feature inventory instead of a clear user outcome.
- "proof" in `auth-proof-card` may be only a class name, but if similar wording appears visibly it should be avoided; it sounds like internal validation, not user benefit.
- "demo" in URL flags and context helpers is probably internal, but visible "demo" copy should be replaced with "example day," "preview," or "try the workspace" depending on context.
- "sample data" and "sample" are acceptable as internal IDs, but visible UI should say "example task," "example note," or "example plan."
- "pipeline work" may be meaningful internally, but it is colder and less personal than "projects" or "follow-ups" for a daily-life product.
- Any wording that asks the user to admire the system rather than do something today should be treated as a staging failure.

## Beautiful Language Opportunities
- Replace broad suite claims with a single clear outcome: what the user can organize, what they should open, and what they get next.
- Make the protected first screen sound like a daily start point: one next action, today context, and compact module signals.
- Give module surfaces warmer concrete nouns: task list, note, calendar block, workout log, project brief, inbox item.
- Let public pages promise less and show more: short headline, direct action, functional preview.
- Use "workspace" carefully; it fits the product, but it should not become another vague value prop by itself.
- Convert remaining builder-review words into user-facing outcomes: "review your day," "open today's plan," "capture a note," "prep the next block."

## Priority Rewrite
The most important wording problem is the remaining "command center" framing in public meta and any visible app copy. It makes EasyLife sound like a generic dashboard instead of a personal daily workspace. Nami should replace that phrase wherever it is customer-facing with plain language about organizing the day across tasks, notes, calendar, workouts, and projects.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps your tasks, notes, calendar, workouts, and projects together in one daily workspace."

- Before: "command center"
  After: "daily workspace"

- Before: "demo"
  After: "example day"

- Before: "sample data"
  After: "example tasks"

- Before: "proof"
  After: "preview"

- Before: "pipeline work"
  After: "project follow-ups"

- Before: "Start Free"
  After: "Start your workspace"

## Voice Rules
- Lead with what the user can do today.
- Use concrete nouns: task list, note, calendar block, workout log, project brief, inbox item, daily plan.
- Avoid internal process words in visible copy: demo, proof, polish, handoff, sample data, command center.
- Keep first-screen copy short; do not explain the whole system above the fold.
- Separate public product copy from working app copy.
- Public copy may explain the product; protected app copy should use direct task labels.
- Do not invent AI, automation, privacy, productivity, or outcome claims unless the visible product proves them.

## Next 5 Copy Tasks
- [ ] Replace customer-facing "command center" in root/app meta descriptions with "daily workspace"; guardrail: do not edit package, deploy, Firebase, auth, or generated output unless explicitly approved.
- [ ] Search visible JSX strings for "demo," "proof," "polish," "handoff," and "sample data"; guardrail: ignore class names, route flags, IDs, and internal docs unless rendered to users.
- [ ] Review `LoginPage.tsx` visible copy for proof/demo framing; guardrail: copy-only changes, no auth behavior or session handling.
- [ ] Review EasyProjects visible examples for internal shipping language; guardrail: replace only one phrase at a time and keep data fields unchanged.
- [ ] Tighten HQ first-screen helper copy to one user action and one result; guardrail: no new feature claims and no extra explanatory paragraph.

## Stop Or Continue
continue but fix copy first