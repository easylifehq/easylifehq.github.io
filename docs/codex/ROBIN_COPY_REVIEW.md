# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward a calm daily workspace voice, but visible and semi-visible copy still mixes user language with builder terms like "command center", "demo", "proof", and "sample".

## Mission Voice Fit
The strongest copy fits the mission when it says what the user can do next today: capture a note, review a task list, approve an inbox item, plan a calendar block, or open the workspace. The weaker copy still frames EasyLife like a product build or feature tour instead of a signed-in personal assistant surface. For the current Phase 5 inbox work, the voice should be especially plain and trust-building: what was found, what type it is, what action is safe, and what requires approval.

## Delicate Wording Risks
- "command center" appears in public meta copy and is too generic SaaS for EasyLife's current direction.
- "demo" is acceptable in internal route flags, but should not appear as customer-facing UI language.
- "proof" in `auth-proof-card` appears internal as a class name, but the word should not surface in visible login copy.
- "sample" IDs in the inbox candidate queue are likely internal, but visible copy must say "example" only when the user needs to know data is not real.
- Any "approval queue" wording must avoid implying real email automation, Gmail access, sending, archiving, or classification certainty.
- Inbox candidate language can become risky if it sounds like the system has already decided the correct action. Prefer "Looks like" or neutral labels over confident automation language.
- "Keep visible" is clear but slightly odd as a candidate type. It may need a warmer visible label like "Keep in inbox" or "Leave visible" if that matches the UI action.
- "Draft reply" must clearly mean "prepare for review", not "send".
- Repeated product phrases like "personal operating system" and "command center" still risk making the app sound broad before it feels useful.
- Customer-facing first-screen copy should avoid builder words such as "handoff", "polish", "proof", "workflow", "sample data", and "demo".

## Beautiful Language Opportunities
- Make the inbox surface feel careful and humane: "Review before anything changes" is stronger than automation language.
- Use concrete type labels: "Task", "Deadline", "Event", "Follow-up", "Keep in inbox", "Draft reply".
- Add short outcome copy near approval actions: "Add to EasyList", "Put on calendar", "Save reply draft", "Leave as email".
- Let Today copy stay brief: one next move, one today context line, and one capture action.
- Replace broad suite language with daily-life nouns: "today", "task list", "calendar block", "note", "reply draft", "follow-up", "workspace".
- Use progressive disclosure for inbox explanation. The first screen should not explain classification logic.

## Priority Rewrite
The most important wording problem to fix next is the Phase 5 inbox classification language. Every candidate must make clear that EasyLife is proposing a safe, reviewable action, not taking action on email. Nami should update visible labels and helper text so the user sees the candidate type, the source, the proposed next step, and the approval requirement in plain language.

## Suggested Rewrites
- Before: "command center"
  After: "daily workspace"

- Before: "Approval queue"
  After: "Review inbox suggestions"

- Before: "Email classification"
  After: "Suggested email actions"

- Before: "Draft reply"
  After: "Prepare reply draft"

- Before: "Keep visible"
  After: "Keep in inbox"

- Before: "sample data"
  After: "example day"

- Before: "No real Gmail send/archive automation"
  After: "Nothing is sent or archived until you approve it."

## Voice Rules
- Use concrete daily-life nouns before product abstractions.
- Say what the user can do, what changes, and what stays unchanged.
- For inbox intelligence, make approval visible near every action.
- Do not imply sending, archiving, deleting, scheduling, or task creation has happened before user approval.
- Keep first-screen labels short; move explanations into details, drawers, or secondary text.
- Avoid builder language in visible UI: "demo", "proof", "handoff", "polish", "workflow", "sample data".
- Prefer "suggested", "review", "prepare", and "approve" over "automate", "decide", "process", or "classify".
- Keep the tone calm and professional, not clever.

## Next 5 Copy Tasks
- [ ] Replace visible "command center" meta/product copy with "daily workspace" or another concrete phrase; do not touch internal docs or config unless the text is customer-facing.
- [ ] Review `EasyListEmailPage.tsx` visible candidate labels and standardize them to "Task", "Deadline", "Event", "Follow-up", "Keep in inbox", and "Prepare reply draft"; do not change data shapes or behavior.
- [ ] Add or refine one short approval reassurance near inbox suggestions: "Nothing is sent or archived until you approve it"; do not add claims about Gmail automation.
- [ ] Search visible UI strings for "demo", "proof", "polish", "handoff", and "sample data"; replace only one customer-facing instance per task with concrete daily-workspace language.
- [ ] Tighten the inbox empty or low-content state so it names the next action and outcome in one sentence; avoid explaining the system or classification process.

## Stop Or Continue
continue but fix copy first