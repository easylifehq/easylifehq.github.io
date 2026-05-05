# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward calmer daily-assistant language, but visible and near-visible copy still carries internal product-studio residue that makes the app feel less trustworthy and less concrete.

## Mission Voice Fit
The strongest copy direction is concrete: tasks, notes, calendar planning, workouts, school load, capacity, capture, and daily plan. That fits the mission of a connected personal workspace. The weak spots are phrases that sound like a product team proving the app instead of a user using it, especially "command center", "demo", "proof", "sample", "handoff", and "polish". EasyLife should sound like a calm place to decide what to do today, not a showcase of modules or an internal build review.

## Delicate Wording Risks
- "command center" in public metadata is too generic and slightly militarized for EasyLife. It also conflicts with the desired personal assistant tone.
- "demo" is acceptable in internal query params, but risky if it appears in visible UI. It makes the product feel temporary.
- "proof" in `auth-proof-card` appears to be an internal class name, not visible copy, but avoid visible "proof" language because it sounds like the app is trying to justify itself.
- "sample" IDs in EasyList email examples are likely internal, but visible "sample data" or "sample email" should become "example email", "example day", or "review item".
- Any remaining "handoff" wording should be removed from customer-facing copy. It is builder/process language unless the user clearly knows who hands what to whom.
- "polish" and "ship" should not appear as user tasks unless the user is actually managing product work. They read like Codex/fleet process leaking into EasyLife.
- "workflow" should be used carefully. If the screen does not name the reader, action, and result, replace it with a concrete noun like "task list", "calendar block", "project brief", or "daily plan".
- The branch has touched auth and login surfaces. Copy there must stay plain, reassuring, and functional. Avoid claims about security, privacy, or trust unless already backed by product behavior.

## Beautiful Language Opportunities
- Replace product-studio nouns with daily-life nouns: "workspace", "daily plan", "task list", "calendar block", "note", "workout log", "school week", "follow-up".
- Let Today/HQ copy speak in short, useful commands: "Start with this", "Capture something", "Review today's plan", "Clear one follow-up".
- Make Inbox Intelligence language approval-first: "Review before adding", "Draft only", "Needs your approval", "Keep visible".
- Make Notes language feel like capture and return: "Quick capture", "Recent notes", "Turn into task", "Review later".
- Use capacity and coach copy with humility: "Looks full", "Light day", "Normal plan", "Push plan", "Based on today's tasks and workouts".
- Keep first-screen copy spare. The first viewport should not explain the suite; it should name the next useful action.

## Priority Rewrite
The highest-priority wording problem is any visible "command center", "demo", "proof", "sample data", "handoff", "polish", or "workflow" language on public or signed-in surfaces. Nami should turn this into a narrow copy pass that searches visible JSX strings and rendered data only, then replaces one phrase at a time with concrete daily-workspace nouns without changing behavior or adding claims.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, and projects in one daily workspace."

- Before: "sample data"
  After: "example day"

- Before: "Calendar handoff"
  After: "Calendar prep"

- Before: "Proof"
  After: "What is ready"

- Before: "Demo"
  After: "Example"

- Before: "Workflow"
  After: "Daily plan"

- Before: "Polish project"
  After: "Finish project brief"

- Before: "Start Free"
  After: "Open EasyLife"

## Voice Rules
- Use concrete daily nouns before product nouns.
- Say what the user can do next, not what the product is proving.
- Keep primary labels short: "Today", "Tasks", "Notes", "Calendar", "Coach", "Inbox", "More".
- Put explanations below the working surface or behind detail views.
- Avoid builder language in visible UI: "handoff", "proof", "polish", "ship", "demo", "sample data".
- Avoid generic SaaS labels when a daily-life label is available.
- Use "example" for mock/local data only when the user needs to know it is not real.
- For AI-like or assistant-like surfaces, avoid certainty. Prefer "suggested", "based on", "review", and "approve".

## Next 5 Copy Tasks
- [ ] Replace the public metadata phrase "one command center" with "one daily workspace"; guardrail: metadata copy only, no routing or app behavior changes.
- [ ] Search visible JSX strings in `app-vNext/src` for "demo", "proof", "sample data", "handoff", "polish", and "workflow"; replace only one confirmed user-facing phrase with a concrete daily noun.
- [ ] Review EasyList email approval copy for "sample" language; use "example email", "review item", or "follow-up" only where the UI is visibly mock/local.
- [ ] Review HQ/Today first-screen copy and remove one explanatory line that describes the system instead of the user's next action; guardrail: do not add new content.
- [ ] Review Notes copy for note-to-action language and keep labels practical: "Turn into task", "Add follow-up", or "Review later"; guardrail: no new claims or persistence promises.

## Stop Or Continue
continue but fix copy first