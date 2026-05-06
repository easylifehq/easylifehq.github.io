# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is closer to a calm daily workspace, but some visible and near-visible language still drifts into platform pitch, internal build vocabulary, and vague product framing.

## Mission Voice Fit
The strongest voice fit is the newer daily-workspace language: "Opening your workspace", "today context", "daily plan", "task list", "calendar block", and "workspace" all support the mission. The weaker fit is any copy that frames EasyLife as a "command center", "proof", "demo", "sample", "polish", or "handoff"; those words make the product feel like a build artifact or SaaS brochure instead of a trusted personal assistant suite.

## Delicate Wording Risks
- "command center" in public meta copy is too generic and too corporate for the personal assistant position. It sounds like a dashboard product, not a calm daily workspace.
- "Start Free" and "See Features" still read as public marketing CTAs when they appear on module surfaces. They delay the user's sense of what to do next.
- "proof" appears in `auth-proof-card`; likely non-visible as a class name, but it is a smoke-hit reminder that visible "proof" language should stay out of customer copy.
- "sample" IDs in EasyList email examples are probably internal identifiers, but any visible "sample data" phrasing would weaken trust. Prefer "example email", "example day", or "draft item" when the user sees it.
- Theme language in Phase 11 needs care: Night, Focus, Soft, and Candy should describe mood and readability, not promise productivity outcomes or feature behavior.
- "command center", "personal operating system", "premium", and "high-tech" should not appear as user-facing product claims. The app should demonstrate those qualities through hierarchy and usefulness.
- Review packet and task language still uses "handoff", "polish", "proof", and "workflow"; acceptable in internal docs, but these words should not leak into UI copy.
- Login/auth copy deserves human review because the auth route changed since base and auth surfaces carry trust risk, even when the issue is only wording.

## Beautiful Language Opportunities
- Replace dashboard language with daily-life nouns: "Today", "task list", "calendar block", "recent notes", "workout log", "project brief", "settings", and "workspace".
- Make Settings theme copy quieter and more concrete: explain what the mood changes visually without implying new capability.
- Let module routes use working-app labels before marketing labels: "Add task", "Write note", "Plan today", "Log workout", "Review calendar".
- Public pages can stay warm, but the signed-in app should be direct and task-led.
- Empty states can become more useful by naming the next action and the result: "Add a task to give Today something to work from."
- The AI/command surfaces should use deterministic humility: "suggested", "example", "draft", "review before adding", and "requires approval".

## Priority Rewrite
Fix remaining visible "command center" and marketing CTA language before more theme work. The next copy pass should replace public and protected customer-facing "command center", "Start Free", "See Features", "demo", "proof", "sample data", "handoff", and "polish" wherever they are visible with concrete daily actions and outcomes. Internal identifiers can stay, but UI text should read like a user is opening a daily workspace, not evaluating a product build.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, and projects in one calm daily workspace."

- Before: "Start Free"
  After: "Open Today"

- Before: "See Features"
  After: "See what is included"

- Before: "AI Command Center"
  After: "Quick actions"

- Before: "Demo data"
  After: "Example day"

- Before: "Sample email"
  After: "Example email"

- Before: "Calendar handoff"
  After: "Calendar prep"

- Before: "Theme token guardrails"
  After: "Theme preview clarity"

## Voice Rules
- Lead with what the user can do next today.
- Use concrete nouns over platform nouns.
- Keep primary labels short: "Today", "Tasks", "Calendar", "Notes", "Coach", "Inbox", "More".
- Keep theme copy about look and feel, not promised behavior.
- Separate marketing copy from app copy; the app should use task labels, not sales labels.
- Do not use "command center", "proof", "handoff", "polish", "demo", or "sample data" in visible customer-facing copy.
- For AI-like surfaces, say "suggested", "draft", "example", and "review" instead of implying autonomous action.
- Prefer calm, plain language over cleverness.

## Next 5 Copy Tasks
- [ ] Replace the public meta description phrase "one command center" with "one calm daily workspace"; do not change routing, auth, or build output manually.
- [ ] Review Phase 11 theme labels and descriptions for Night, Focus, Soft, and Candy; keep each description under one sentence and limit it to visual mood, contrast, and readability.
- [ ] Search visible JSX strings for "Start Free" and "See Features" on protected or module-like surfaces; replace one instance with a concrete app action and one quiet secondary label.
- [ ] Inspect EasyList email approval copy for any visible "sample" or "demo" wording; replace with "example email", "draft reply", or "review before adding" as appropriate.
- [ ] Inspect LoginPage visible copy only; flag any trust-risk language, but do not alter auth behavior, auth logic, routes, Firebase, or session handling.

## Stop Or Continue
continue but fix copy first