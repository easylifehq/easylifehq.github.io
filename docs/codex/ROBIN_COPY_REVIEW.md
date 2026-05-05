# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward calmer daily-assistant language, but visible copy still mixes working-app language with public pitch, internal proof/demo terms, and a few broad "command center" promises.

## Mission Voice Fit
The best language now fits the mission: "Opening your workspace", "today", "next move", "capture", "workspace", and compact module status all support a connected personal assistant product. The weak fit is where the app still speaks like a product build or brochure instead of a tool someone opens to manage the day. "Command center" in public meta copy overstates the product and sounds generic SaaS. "Start Free", "See Features", "Overview", "Features", and "Workflow" may be acceptable on public marketing pages, but they should not shape the signed-in proof for the product spine.

## Delicate Wording Risks
- "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center." is too broad and generic. It promises an all-in-one system instead of naming the daily outcome.
- "command center" feels corporate and dashboard-like, which conflicts with the personal assistant direction.
- "proof" appears in a customer-adjacent class name, not visible copy, but Robin has repeatedly flagged this vocabulary. Keep it out of visible labels and future task wording.
- "demo" and "sample" appear mostly in internal identifiers and visual QA plumbing, but any visible occurrence should be replaced with "example day", "example task", "preview", or "workspace".
- Public module pages still risk sounding like coordinated sales pages when they repeat "Start Free", "See Features", feature labels, and hero explanations before showing working utility.
- "Workflow" in navigation is generic. If user-facing, it should become a concrete route or section label such as "How it works", "Daily flow", or a module-specific noun.
- The changed auth/login surface is sensitive because auth files are forbidden scope in the mission. Any customer-facing login copy should be plain and trust-building, not persuasive or experimental.

## Beautiful Language Opportunities
- Replace broad product nouns with concrete daily nouns: "daily plan", "task list", "calendar block", "recent notes", "workout log", "project brief".
- Let Today copy stay short and operational: one next move, one reason, one action.
- Public pages can feel more premium by showing a concrete working moment sooner instead of adding more claims.
- Module previews should sound like real daily use: "Review 3 due tasks", "Block 30 minutes", "Capture meeting note", "Log today's workout".
- Empty states can become warmer without being cute by naming the next useful action.
- Command/capture copy should feel like a quiet tool, not a feature pitch.

## Priority Rewrite
Fix the remaining "command center" public/meta promise next. It is the clearest off-voice phrase because it sounds like generic SaaS, conflicts with the personal assistant mission, and appears in durable metadata that frames the product before the UI even loads. Replace it with concrete suite language that names what EasyLife helps organize without claiming an all-powerful operating system.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar plans, workouts, and projects in one calm daily workspace."

- Before: "Command center"
  After: "Daily workspace"

- Before: "Workflow"
  After: "Daily flow"

- Before: "Start Free"
  After: "Open EasyLife"

- Before: "See Features"
  After: "See what it organizes"

- Before: "sample data"
  After: "example day"

- Before: "demo"
  After: "preview" or "example"

- Before: "proof"
  After: "preview" or "route evidence" for internal docs only

## Voice Rules
- Use concrete nouns before abstract product language.
- Keep signed-in copy task-first: what should I do today, where do I capture it, what changed.
- Keep public copy simple: product name, plain promise, primary action, functional preview.
- Do not use "command center", "personal operating system", "premium", "high-tech", "proof", "handoff", or "polish" in visible customer-facing copy.
- Use "command" only when naming a specific UI control, such as a command palette, and keep it secondary to the daily next action.
- Separate marketing copy from app copy. The working app should use direct action labels, not sales language.
- Favor short labels over explanatory paragraphs in the first viewport.
- Do not invent capability claims. If the feature is mock, local, or deterministic, keep the copy humble and concrete.

## Next 5 Copy Tasks
- [ ] Replace the public/meta "command center" description with "one calm daily workspace" language; guardrail: metadata copy only, no auth, routing, config, or feature changes.
- [ ] Inspect visible marketing navigation for "Workflow"; guardrail: replace only if it appears as user-facing navigation text, and use a concrete label such as "Daily flow".
- [ ] Review the signed-in HQ/Today first viewport for any sales-like copy; guardrail: keep one next action dominant and do not add explanatory text.
- [ ] Search visible JSX strings for "demo", "sample data", "proof", "handoff", and "polish"; guardrail: ignore internal identifiers and change only one visible phrase per patch.
- [ ] Tighten one public module hero CTA pair so it sounds less brochure-like; guardrail: preserve routes, meaning, and tap targets.

## Stop Or Continue
continue but fix copy first