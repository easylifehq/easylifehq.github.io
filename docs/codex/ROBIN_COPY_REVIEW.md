# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is calmer and more concrete than earlier passes, but some visible and near-visible language still reads like a product pitch or internal build note instead of a daily assistant workspace.

## Mission Voice Fit
The copy generally fits the mission when it uses plain daily nouns like workspace, tasks, notes, calendar planning, workout log, daily plan, and opening your workspace. That language feels calm, useful, and professional. The weaker fit appears where EasyLife still frames itself as a "command center" or where module pages appear to sell the product with acquisition CTAs and feature language rather than helping a signed-in user act today. For EasyLife, the best voice is direct, quiet, and task-oriented: "what needs attention", "capture a note", "review today", "plan the next block."

## Delicate Wording Risks
- "command center" remains in public metadata in `404.html` and `app-vNext/index.html`. It is generic SaaS language and conflicts with the calmer personal assistant direction.
- "Start Free" on signed-in or module-like surfaces reads like a marketing acquisition CTA, not a working app action.
- "See Features" is brochure language when the user is already inside or evaluating a module workflow. It stages explanation before action.
- "demo" and "sample" appear mostly as internal identifiers or visual QA behavior, but any visible use should become "example day", "example inbox", or "sample" only where clearly non-production and harmless.
- "auth-proof-card" is likely internal class naming, but "proof" should not surface in user-facing copy. It sounds like the product is arguing for trust rather than earning it.
- Repeated feature chips risk sounding like labels for a sales page rather than real controls. If they do not do anything, they should be quieter or removed.
- The phrase "personal operating system" belongs in mission docs, not visible product copy. It is too broad for first-screen app language.
- Any customer-facing "polish", "handoff", "workflow", or "ready" wording should be reviewed carefully because it can sound like instructions to builders instead of outcomes for users.

## Beautiful Language Opportunities
- Replace broad suite claims with daily-life specificity: "tasks, notes, calendar planning, and workouts" is stronger than "command center."
- Let the first screen sound like a useful morning surface: "Review today", "Capture what changed", "Plan the next block", "Open recent notes."
- Use module-specific action language instead of feature labels: "Task list", "Calendar block", "Recent notes", "Workout log", "Project brief."
- Settings can sound calmer by naming user outcomes: "Choose how EasyLife looks", "Control visible apps", "Set the workspace mood."
- Loading and empty states are an opportunity for warmth without performance claims: "Opening your workspace" is good; continue in that direction.
- Public product pages should promise less and show more: concrete preview labels beat repeated hero copy.

## Priority Rewrite
Replace "command center" wherever it can be read as public product language, especially in root and app HTML metadata. The next implementer should change it to concrete suite language such as "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and follow-ups in one calm workspace." This is small, reviewable, and directly aligned with Robin and Simon feedback.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and follow-ups in one calm workspace."

- Before: "Start Free"
  After: "Open EasyLife"

- Before: "See Features"
  After: "See what it includes"

- Before: "Products and demo below"
  After: "Explore EasyLife"

- Before: "sample data"
  After: "example day"

- Before: "Calendar handoff"
  After: "Calendar prep"

- Before: "auth proof" if visible
  After: "Account access"

- Before: "AI Command Center"
  After: "Assistant actions"

## Voice Rules
- Use concrete daily nouns before product abstractions: task list, calendar block, note, project brief, workout log, inbox item.
- First-screen copy should answer: what should I do next today?
- Keep labels short. Put explanations lower, behind actions, or inside detail panels.
- Avoid acquisition CTAs on working app surfaces.
- Avoid builder/process words in visible UI: demo, proof, handoff, polish, workflow, command center.
- Do not imply AI, automation, prediction, or backend intelligence unless the UI is clearly mock/local and approval-based.
- Prefer calm verbs: review, capture, plan, open, choose, save, adjust.
- Public pages may explain the product, but protected app screens should act like tools already in use.

## Next 5 Copy Tasks
- [ ] Replace public metadata use of "command center" with "calm workspace"; do not touch package, deploy, auth, Firebase, or generated output.
- [ ] On one protected route, replace "Start Free" or acquisition-style CTA copy with a working-app action; preserve routes and behavior.
- [ ] Audit visible strings for "proof", "handoff", "polish", "demo", and "sample data"; change only one clearly customer-facing phrase per task.
- [ ] Rewrite one feature-chip row into quieter module-specific nouns or remove one non-action chip; do not add new claims or controls.
- [ ] Review Settings theme copy for plain mood and readability language; avoid feature clutter and preserve all existing settings behavior.

## Stop Or Continue
continue but fix copy first