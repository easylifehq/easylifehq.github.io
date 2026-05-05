# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is closer to a calm daily workspace, but visible and near-visible language still leans on internal product framing instead of concrete user actions.

## Mission Voice Fit
The mission wants a connected, professional personal operating system that helps the user act on what matters without clutter. The current copy mostly fits when it says "workspace", "today", "task", "note", "calendar", "workout", and "daily plan." It weakens when it says "command center", "demo", "proof", "sample", or when the screen performs the product structure instead of naming the user's next move.

## Delicate Wording Risks
- "command center" still appears in public/meta copy and route language. It sounds generic SaaS and too operational for a personal assistant product.
- "demo" appears in app-visible or visual-QA-adjacent logic. It may be harmless internally, but any rendered use would make the product feel staged rather than lived-in.
- "sample" in email approval data risks sounding fake if rendered to users. Prefer "example" only where the surface is explicitly illustrative, or use plain item names.
- "proof" appears in `auth-proof-card` as a class name. Not a visible problem by itself, but the surrounding login copy should be checked so it does not sell credibility with vague proof language.
- "CommandCenterPage" and command-center framing create a naming mismatch with the softer Today-first direction.
- Phase review and checkpoint copy repeatedly describe "repair", "quarantine", "guardrails", and "implementation" in docs. That is fine internally, but none of that vocabulary should leak into the app.
- The product still risks explaining modules before it gives the signed-in user one concrete next action.
- "Plan intensity", "capacity signal", and "coach" language needs humility: it should read as a planning aid, not advice or prediction.

## Beautiful Language Opportunities
- Replace "command center" with "Today", "workspace", "daily plan", or "home base" depending on placement.
- Make HQ copy more human and concrete: one next move, one today context line, and compact module status.
- For inbox work, use approval-centered language: "Review candidate", "Keep visible", "Draft reply", "Add to tasks."
- For notes, make the language feel like capture and review, not automation: "Save this thought", "Review recent notes", "Turn into a task."
- For workout and capacity language, favor grounded status: "Light day", "Normal day", "Push day", "based on today's plan."
- Public product copy can feel calmer by naming actual surfaces: task list, calendar block, note, workout log, project brief.
- Empty states should end with a clear action cue, not a product explanation.

## Priority Rewrite
Fix the remaining "command center" framing across customer-facing and signed-in surfaces. Nami should replace visible command-center language with Today-first wording that names the user's immediate action and context, while leaving internal file names or route names alone unless they are rendered. The product should read like "open EasyLife and know what to do next," not "enter a control room."

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and follow-ups in one daily workspace."

- Before: "Command Center"
  After: "Today"

- Before: "Sample data"
  After: "Example day"

- Before: "Demo"
  After: "Preview" for public pages, or remove it inside the working app.

- Before: "Proof"
  After: "What you can do today"

- Before: "Plan intensity"
  After: "Day pace"

- Before: "Push"
  After: "Full focus"

- Before: "Capacity signal"
  After: "Today load"

## Voice Rules
- Use concrete daily nouns: task list, calendar block, note, workout log, project brief, daily plan, inbox item.
- Put the user's next action before product explanation.
- Avoid "command center", "proof", "polish", "handoff", "workflow", "sample data", and visible "demo" language.
- Keep labels short in primary UI; put explanations behind details, drawers, or secondary panels.
- Use humility for computed or planning language: "based on", "suggested", "today load", not certainty or advice.
- Separate public product copy from working app copy. Public pages may explain; signed-in screens should act.
- Prefer verbs over feature names: "Capture", "Review", "Plan", "Add to tasks", "Draft reply."
- Do not invent AI, backend, email, coaching, or automation claims.

## Next 5 Copy Tasks
- [ ] Replace visible "command center" copy in app and public metadata with "daily workspace" or "Today"; do not rename internal identifiers unless they render.
- [ ] Audit HQ first-screen strings and reduce them to one next action, one today context line, and compact module status; do not add new claims.
- [ ] Check EasyList email approval copy for rendered "sample" language and replace with concrete item labels or "example" only where clearly illustrative.
- [ ] Review EasyNotes note-to-action copy for automation overreach; use "Turn into a task" or "Add follow-up" instead of vague process language.
- [ ] Review capacity, coach, and day-pace labels for humility; make clear they are planning cues based on visible app context, not predictions.

## Stop Or Continue
continue but fix copy first