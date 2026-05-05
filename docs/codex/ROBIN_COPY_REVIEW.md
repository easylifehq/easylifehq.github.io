# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is getting closer to a calm daily workspace, but several new labels still sound like internal product scaffolding or implied intelligence instead of concrete help the user can trust.

## Mission Voice Fit
The language mostly fits the mission when it says "today", "workspace", "task list", "calendar", "notes", "workout", and "capture". Those nouns support the personal assistant position without overexplaining it. The weaker fit appears around phase language that may leak into the product voice: "command layer", "Inbox Intelligence", "capacity signal", "coach", "approval queue", "plan intensity", and "What am I forgetting" can sound either too technical or too smart for a deterministic, frontend-only app unless the UI clearly shows the source, action, and user approval path.

## Delicate Wording Risks
- "Command center" still appears in public metadata in `404.html` and `app-vNext/index.html`; it is a generic SaaS phrase and conflicts with the quieter daily workspace direction.
- "What am I forgetting" is useful but risky if it appears as a confident assistant action without source context. It should read as a check of visible tasks, notes, calendar, and follow-ups, not a promise of omniscience.
- "Inbox Intelligence" sounds like AI/backend classification. For a mock/local approval surface, use plainer labels such as "Inbox review" or "Suggested from email".
- "Capacity signal" is internal product language. Customer-facing copy should say "Today's load", "Room today", or "How full today looks".
- "Coach" can be warm, but it risks overstating guidance if the app is only recalculating local task/calendar/workout context. Pair it with concrete controls and avoid advice-heavy language.
- "Plan intensity" is slightly abstract. "Light day", "Normal day", and "Push day" are clearer if the UI explains what changes.
- "Approval queue" is staff/internal workflow language. In user-facing copy, "Review suggestions" or "Choose what to add" is more natural.
- "Draft reply" is good if it clearly says it will not send without approval. Any label that implies auto-send or email automation would be risky.
- "Sample data" and `sample-*` identifiers are not automatically visible, but any rendered copy should say "Example day", "Example email", or "Example plan" instead.
- The changed auth login file is not a copy issue by itself, but "proof" language on login surfaces should be treated carefully. It can sound like a sales artifact rather than a trustworthy sign-in page.

## Beautiful Language Opportunities
- Rename internal-feeling assistant features around daily-life nouns: "Today", "Daily plan", "Task list", "Calendar prep", "Inbox review", "Study load", "Workout log".
- Make every smart-sounding action show its evidence: "From today's tasks", "Based on visible calendar blocks", "Suggested from this email".
- Keep the first screen terse: one next move, one reason, one action.
- Use warm but restrained copy for capacity: "A full day. Keep the plan light." is more human than "High capacity signal".
- For school planning, favor practical labels: "Due this week", "Exam window", "Study block", "Turn into task", "Add calendar block".
- For inbox review, keep the promise modest: "Review suggested tasks and replies before anything is added."

## Priority Rewrite
The most important wording problem is the smart-feature vocabulary around command, intelligence, capacity, coach, and approval. These labels should be converted into concrete daily actions with visible user control: what source is being checked, what suggestion is being made, and what the user can approve. This will keep EasyLife from sounding like a fake AI layer while preserving the personal assistant direction.

## Suggested Rewrites
- Before: "command center"
  After: "daily workspace"

- Before: "Inbox Intelligence"
  After: "Inbox review"

- Before: "capacity signal"
  After: "Today's load"

- Before: "approval queue"
  After: "Review suggestions"

- Before: "What am I forgetting"
  After: "Check today's loose ends"

- Before: "Plan intensity"
  After: "Choose today pace"

- Before: "Draft reply"
  After: "Prepare reply for review"

- Before: "sample data"
  After: "example day"

## Voice Rules
- Lead with what the user can do today, not what the system is.
- Use concrete nouns: task, note, calendar block, study block, workout log, reply draft, suggestion.
- Do not imply prediction, memory, or AI judgment unless the visible source and limitation are shown.
- Keep smart actions approval-based: review, choose, add, prepare, open.
- Avoid builder terms in visible copy: command layer, proof, polish, handoff, sample data, workflow.
- Keep primary labels short; put explanations behind secondary text or detail panels.
- Marketing copy can explain the product, but app copy should use direct task labels.
- If a control changes assumptions, name what changes and what stays fixed.

## Next 5 Copy Tasks
- [ ] Replace visible "command center" metadata with "daily workspace" or similarly concrete language; do not touch auth, deploy config, generated output, or package files unless explicitly approved.
- [ ] Audit the new Today/HQ capacity copy and replace "capacity signal" with "Today's load" or "Room today"; include a short source cue such as tasks, calendar, or workout only if already visible.
- [ ] Rename any visible "Inbox Intelligence" or "approval queue" copy to "Inbox review" and "Review suggestions"; preserve all behavior and do not imply automatic email action.
- [ ] Review "What am I forgetting" and rewrite it as "Check today's loose ends" unless the UI clearly explains the local sources being checked.
- [ ] Review school and coach labels for over-advice; keep labels practical, such as "Study block", "Due this week", "Light day", "Normal day", and "Push day", with no claims of prediction.

## Stop Or Continue
continue but fix copy first