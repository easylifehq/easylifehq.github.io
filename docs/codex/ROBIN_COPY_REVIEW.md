# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is closer to a calm daily assistant, but a few visible and meta-level phrases still sound like internal product positioning instead of a concrete workspace for today.

## Mission Voice Fit
The current direction fits the mission when it uses plain daily nouns like "workspace", "today", "tasks", "notes", "calendar", and "capture". The copy is weakest when it leans on broad suite language such as "command center" or review/build vocabulary like "proof", "demo", "sample", and "polish"; those words make EasyLife feel like a product pitch or internal build process rather than a trustworthy personal operating system.

## Delicate Wording Risks
- "command center" in public meta copy overclaims and sounds generic SaaS; it also conflicts with the calmer personal assistant voice.
- "proof" appears in `auth-proof-card` as a class name, which is not visible copy, but it is a smoke signal for a salesy framing that should not leak into user-facing text.
- "demo" appears mostly in route/query logic and should be left alone if internal, but visible uses should become "example day", "workspace preview", or "try EasyLife".
- "sample data" and "sample" identifiers are probably internal in the email page, but any rendered label should avoid "sample" and use "example" or concrete item names.
- "Easy System App vNext" in internal docs is not customer-facing, but it reinforces the gap between builder language and buyer/user language.
- The checkpoint language still references "personal operating system"; this belongs in mission docs, not visible app copy. For the product, prefer "daily workspace" or "today plan".
- The review packet task failed guardrails, so copy documentation may now sound more procedural than helpful. Keep review copy factual and avoid broad "proof" language.

## Beautiful Language Opportunities
- Replace "command center" with "daily workspace" or "one place for tasks, notes, plans, workouts, and projects".
- Let the HQ/Today first screen use direct action language: "Start with today", "Capture a thought", "Review your next block", "Open recent notes".
- Use compact module status labels that answer the user's question: "Due today", "Next event", "Recent note", "Workout plan".
- Public product copy can feel warmer by describing the outcome instead of the system: less "suite", more "see what needs attention and where to put the next thought".
- Error, empty, and loading states should keep hospitality-level calm: "Opening your workspace" works; similar copy should stay concrete and short.
- For experiments, distinguish clearly between "example" and real output so the app does not imply live AI behavior.

## Priority Rewrite
Fix the remaining public/meta "command center" language first. It is the most visible phrase that weakens trust because it sounds like generic SaaS positioning and promises a broad control layer instead of the simpler EasyLife job: help the user see today, capture quickly, and move between tasks, notes, calendar, workouts, and projects.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and follow-ups in one daily workspace."

- Before: "Opening your workspace."
  After: "Opening today's workspace."

- Before: "sample data"
  After: "example day"

- Before: "demo"
  After: "example workspace"

- Before: "proof"
  After: "preview" or "working example"

- Before: "personal operating system"
  After: "daily workspace"

## Voice Rules
- Use concrete daily-life nouns: task list, calendar block, note, project brief, workout log, daily plan, workspace.
- Keep first-screen copy short and action-led: what should the user do next, and what do they get?
- Avoid internal build words in visible copy: demo, proof, handoff, polish, workflow, sample data, command center.
- Do not imply real AI, prediction, automation, or backend intelligence unless the feature visibly exists.
- Separate marketing copy from app copy: public pages can explain; the working app should guide action.
- Prefer "today" over broad product claims.
- Keep labels compact; move explanations behind detail views, drawers, or secondary panels.

## Next 5 Copy Tasks
- [ ] Replace the visible/meta "command center" phrase in app-facing HTML/meta copy with "daily workspace"; do not touch routing, auth, Firebase, package files, or deployment config unless a human approves the blocked path.
- [ ] Search visible `app-vNext/src` strings for "demo", "proof", "sample data", "polish", and "handoff"; change only rendered user-facing text, not query params, class names, IDs, or internal docs.
- [ ] Review HQ/Today copy for one clear next action; keep it under one short sentence and avoid feature-inventory language.
- [ ] Review UniversalCapture labels and helper text; keep capture copy concrete and secondary to the next best move.
- [ ] Review EasyProjects visible example/timeline language; replace internal shipping phrases with user task phrases such as "Weekly planning review", "Finish project brief", or "Calendar prep".

## Stop Or Continue
continue but fix copy first