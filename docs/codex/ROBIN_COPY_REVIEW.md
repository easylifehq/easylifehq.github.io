# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward calmer daily-assistant language, but a few visible phrases still sound like internal product scaffolding or safety disclaimers instead of direct user outcomes.

## Mission Voice Fit
The language mostly fits the mission of a clean, trustworthy personal workspace: "daily plan", "workspace", "reply draft", "approval", and concrete candidate types are stronger than older command-center or demo language. The weak spots are staging and audience. Some copy still explains the system mechanics before the user knows the next action, and the app still carries a few builder-facing words in likely public surfaces, especially "command center" in metadata and blunt no-send/no-archive disclaimers in the inbox screen.

## Delicate Wording Risks
- `command center` in public metadata sounds generic SaaS and conflicts with the calmer personal assistant position.
- "Nothing is sent from this screen" is clear, but it reads like implementation copy. A user needs to know they stay in control, not how the screen behaves internally.
- "Nothing is sent or archived from this screen" is safe but heavy. It foregrounds fear before the value of reviewing email-derived items.
- "Reply draft prepared for approval" is accurate, but slightly procedural. It could be warmer and more action-oriented.
- `sample-final`, `sample-meeting`, `sample-container`, and `sample-noise` appear to be internal IDs, not visible copy. Keep them internal only.
- `demo` and `proof` in component names or dev flags are not copy blockers if they are not rendered, but they should not leak into visible UI.
- Simon's review shows repeated "Start Free", "See Features", "FEATURES", and module identity labels may still make module pages feel like brochures rather than daily tools.

## Beautiful Language Opportunities
- Replace broad suite claims with specific user nouns: task list, calendar block, note, daily plan, workout log, project brief, reply draft.
- Soften safety copy by putting the user in control: "Review before anything changes" is better than "Nothing is sent from this screen."
- Make inbox intelligence feel practical by naming the work: "Approve email items", "Keep as follow-up", "Draft a reply", "Add deadline".
- Keep the first screen spare: one next move, one today context line, one capture entry.
- Public pages can be more graceful by reducing repeated CTA and feature-label language, then letting the product preview do more of the explaining.

## Priority Rewrite
The most important wording problem to fix next is the visible safety language around inbox and draft replies. It is good that EasyLife does not imply automatic sending or archiving, but the current phrasing sounds like a developer warning. Rewrite those strings so the user understands the concrete outcome: drafts are prepared for review, email items wait for approval, and nothing changes until the user confirms.

## Suggested Rewrites
- Before: "Reply draft prepared for approval. Nothing is sent from this screen."
  After: "Reply draft ready to review. You choose what happens next."

- Before: "Use separators like three dashes between emails. Nothing is sent or archived from this screen."
  After: "Separate emails with three dashes. Review each item before anything changes."

- Before: "command center"
  After: "daily workspace"

- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, and projects in one daily workspace."

- Before: "Start Free"
  After: "Open workspace"

- Before: "See Features"
  After: "See how it works"

- Before: "FEATURES"
  After: "What this helps with"

## Voice Rules
- Lead with what the user can do today, not what the system contains.
- Prefer concrete nouns over platform nouns: task, note, calendar block, reply draft, follow-up, daily plan.
- Keep safety language calm and user-controlled, not defensive or technical.
- Avoid "command center", "proof", "handoff", "polish", "demo", "sample data", and "workflow" in visible copy unless the context is explicitly internal.
- Do not explain every module on the first screen.
- Public marketing copy may explain; protected app copy should direct action.
- Button labels should name the action, not the product promise.

## Next 5 Copy Tasks
- [ ] Replace the public metadata phrase "command center" with "daily workspace"; do not touch routing, auth, build output, or deployment files.
- [ ] Rewrite the inbox disclaimer "Nothing is sent or archived from this screen" into user-control language; keep the safety meaning intact.
- [ ] Rewrite the draft status message so it says the reply draft is ready to review; do not imply sending, automation, or external email behavior.
- [ ] Audit one protected first screen for visible "demo", "proof", "handoff", "polish", "sample data", or "command center"; change only one visible phrase and leave internal identifiers alone.
- [ ] Review one marketing module page for repeated "Start Free", "See Features", or "FEATURES" language; replace only one inappropriate instance with a concrete product action.

## Stop Or Continue
continue but fix copy first