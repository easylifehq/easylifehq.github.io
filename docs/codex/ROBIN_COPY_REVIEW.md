# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward a calm daily workspace voice, but visible copy still leaks internal product-building language and marketing-stage framing where the user needs direct action language.

## Mission Voice Fit
The best language fits the mission when it uses concrete daily nouns: tasks, notes, calendar planning, workouts, projects, workspace, and today. That voice supports a connected personal assistant product. The weaker language still says "command center", "demo", "proof", "sample", "start with", and "personal operating system", which makes the product feel like a pitch, prototype, or internal build review instead of a trustworthy daily tool.

## Delicate Wording Risks
- "command center" in public metadata overstates the product and sounds like generic SaaS positioning rather than a calm personal workspace.
- "personal operating system" is mission language, but it should not become customer-facing hero or app copy unless the screen actually behaves like one daily start surface.
- "demo" and "sample data" are acceptable in internal route/query logic, but visible UI should say "example day", "example task", "example note", or "workspace preview".
- "proof" in class names is harmless, but any visible "proof" language would feel like builder evidence instead of buyer value.
- "Start with one small win" is understandable, but slightly motivational and generic. It could be more useful if tied to the next concrete action.
- "Opening your workspace" is calm and good. Keep this direction.
- "Make modules feel like rooms, not dashboards" is lovely as internal seed copy, but should not be visible as product instruction unless framed as a note example.
- Repeated marketing CTA language such as "Start Free" and "See Features" conflicts with the protected first-screen contract when the signed-in user needs a next action, not a sales path.
- The copy still risks feature-dump staging: module labels, feature chips, and explanatory page intros can crowd the first screen before the user sees what to do today.

## Beautiful Language Opportunities
- Replace platform nouns with daily nouns: "workspace", "today", "task list", "calendar block", "recent notes", "workout log", "project brief".
- Make the protected HQ first screen read like a useful morning surface: one next move, today context, and compact module status.
- Use shorter primary labels: "Today", "Tasks", "Calendar", "Notes", "Coach", "Inbox", "More".
- Move explanatory copy below the first action. The first viewport should not define EasyLife; it should help the user act.
- Give empty states a precise next step: "Add a task", "Write a quick note", "Review today's calendar", "Log a workout".
- Make public copy calmer by showing concrete use instead of claiming system breadth.

## Priority Rewrite
Fix the remaining customer-facing "command center", "demo", "proof", "polish", "handoff", and "sample data" language before more visual polish. Nami should make one narrow visible-copy pass in `app-vNext/src/`, replacing only rendered user-facing instances with concrete daily-workspace nouns while leaving internal identifiers, query params, class names, and docs alone.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, and projects in one calm workspace."

- Before: "Start with one small win."
  After: "Add one task for today."

- Before: "sample data"
  After: "example day"

- Before: "demo"
  After: "preview" or "example"

- Before: "Calendar handoff"
  After: "Calendar prep"

- Before: "proof"
  After: "workspace preview"

- Before: "polish"
  After: "clean up the task list"

- Before: "personal operating system"
  After: "daily workspace"

## Voice Rules
- Lead with what the user can do today.
- Use concrete nouns over product abstractions.
- Keep primary labels short and task-oriented.
- Do not explain the whole suite on the first screen.
- Keep marketing copy separate from signed-in app copy.
- Avoid builder words in visible UI: "demo", "proof", "handoff", "polish", "sample data", "workflow".
- Use calm confidence, not hype.
- Preserve uncertainty and example status when content is mock or illustrative.

## Next 5 Copy Tasks
- [ ] Replace the visible meta description phrase "one command center" with "one calm workspace"; do not change internal docs or package files.
- [ ] Search rendered JSX strings in `app-vNext/src/` for "demo", "proof", "handoff", "polish", and "sample data"; replace one visible instance only and ignore class names, ids, query params, and internal identifiers.
- [ ] Review the protected HQ first viewport and shorten one explanatory sentence so it names the next user action before suite explanation.
- [ ] Review one empty or low-content state and make the next step concrete, using an existing action only.
- [ ] Review marketing hero CTA-adjacent copy and demote one feature-list sentence that competes with product name, promise, action, and preview.

## Stop Or Continue
continue but fix copy first