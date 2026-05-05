# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward a calmer daily workspace voice, but a few visible phrases still sound like internal product language instead of a signed-in user's next useful step.

## Mission Voice Fit
The mission wants EasyLife to feel connected, clean, trustworthy, personal, and professional. The strongest current language is concrete daily-life copy such as "Opening your workspace" and the newer direction around today, capture, tasks, notes, calendar, and workouts. The weaker language still leans on product framing like "command center", "demo", "proof", and "Start with", which makes the app feel explained or staged instead of immediately useful.

## Delicate Wording Risks
- "command center" in public metadata overstates the product and sounds like generic SaaS positioning rather than a calm personal assistant workspace.
- "Start with" on the login page can read like an instruction to a builder or onboarding script unless the action and outcome are explicit.
- "auth-proof-card" appears to be a class name, but if any related visible text uses "proof", it should be removed from customer-facing copy.
- "demo" in query parameters and internal context helpers is likely non-visible, but visible demo language should not appear in the product story.
- "sample" IDs in EasyList email data are probably internal, but any rendered "sample data" language should become "example email", "example day", or "example task".
- "Keep the home screen calm" and "Make modules feel like rooms, not dashboards" are good internal principles, but they should not be visible as user-facing app copy.
- "Nothing completed yet this week. Start with one small win." is friendly, but "win" is a little cute for the EasyLife voice and does not name the concrete action.
- "personal operating system" should stay in mission docs, not in the working app or public product pages.

## Beautiful Language Opportunities
- Replace broad suite claims with concrete daily nouns: today, task list, calendar block, note, workout log, project brief, workspace.
- Make empty states more direct: say what is missing, what to do next, and what the user gets after doing it.
- Keep protected app copy task-shaped and short, especially on HQ: "Review today", "Capture a thought", "Plan the next block", "Open recent notes".
- Public pages can be warmer, but should still show the product through use: tasks, notes, calendar planning, workouts, and projects in one workspace.
- Login and loading states can feel more hospitable by saying where the user is going, not describing the system.
- Settings copy should sound like a control center only through clear labels and grouping, not through the phrase "control center" repeated in UI.

## Priority Rewrite
Fix the remaining visible "command center" and builder/process language first, especially in public metadata and login-facing copy. The next pass should replace one broad product phrase at a time with concrete daily-workspace language, without expanding descriptions or adding new claims.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and daily work in one calm workspace."

- Before: "Start with"
  After: "Open"

- Before: "Nothing completed yet this week. Start with one small win."
  After: "Nothing completed yet this week. Finish one task to start the record."

- Before: "Opening your workspace."
  After: "Opening today's workspace."

- Before: "sample data"
  After: "example day"

- Before: "proof"
  After: "preview" or "example", depending on the visible context.

- Before: "demo"
  After: "example" for public copy, or remove it if the page is already clearly a working route.

## Voice Rules
- Lead with what the user can do today.
- Use concrete nouns: task list, note, calendar block, workout log, project brief, workspace.
- Avoid product fog: command center, operating system, premium, high-tech, proof, polish, handoff, workflow.
- Keep primary labels short and action-shaped.
- Put explanation after the user asks for detail, not in the first viewport.
- Separate public product language from working app language.
- Do not make the protected app sell itself to the signed-in user.
- Empty states must answer: what is missing, what should I do, and what changes after I do it.

## Next 5 Copy Tasks
- [ ] Replace the public metadata phrase "one command center" with "one calm workspace"; do not change product claims or add features.
- [ ] Inspect `LoginPage.tsx` for visible "Start with" copy and rewrite it as a concrete action label; preserve login behavior and layout.
- [ ] Search visible `app-vNext/src` strings for "proof", "demo", "sample data", "handoff", and "polish"; change only one customer-facing instance per task.
- [ ] Review HQ first-viewport copy and remove any line that explains the suite instead of naming today's next action; do not add new sections.
- [ ] Review empty-state sentences that use "win" or vague encouragement and replace one with a concrete task, note, calendar, or workout action.

## Stop Or Continue
continue but fix copy first