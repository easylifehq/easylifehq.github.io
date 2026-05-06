# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is calmer and more concrete than before, but it still leaks builder language and product-showroom phrasing where the user needs direct daily action.

## Mission Voice Fit
The language mostly fits the mission of a connected personal workspace: words like "workspace", "today", "capture", "task list", "calendar", "notes", and "settings" are grounded and useful. The copy is strongest when it names what the user can do next. It weakens when it falls back to "command center", "demo", "proof", "polish", "sample data", or broad suite-positioning language, because those phrases describe the product build or sales frame rather than the user's day.

## Delicate Wording Risks
- "command center" remains in public metadata and app metadata. It is too generic SaaS and too militarized for a calm personal assistant product.
- "demo" appears in dev/query contexts and may be harmless internally, but any visible use should become "example day", "preview", or "workspace".
- "proof" appears as a class name and may not be visible, but the concept should not surface as customer-facing copy. It sounds like a pitch deck, not an app.
- "sample" appears in EasyList email candidate IDs. If rendered anywhere, "sample data" should become "example email", "example follow-up", or "example day".
- Product and module pages still risk explaining the system before the user feels the useful action.
- Repeated CTA language like "Get Started", "Start Free", and "See Features" can make the product feel like a brochure when the first screen should feel operational.
- "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center" is too inventory-heavy and too generic for the product promise.
- "pipeline work" is not a natural daily-life noun for most users and may make the suite feel more corporate than personal.

## Beautiful Language Opportunities
- Replace broad system claims with a single daily promise: plan today, capture what matters, and return to what is open.
- Make Settings copy feel like controls for a calm workspace, not a feature catalog.
- Give module previews more lived-in nouns: "today's list", "open note", "calendar block", "workout log", "project brief".
- Let public pages describe outcomes in plain language before feature groups.
- Keep first-screen labels short and concrete: "Today", "Tasks", "Calendar", "Notes", "Coach", "Inbox", "More".
- Use "example" instead of "demo" when showing mock or seeded content.
- Use "workspace" only when the copy names what happens inside it.

## Priority Rewrite
The most important wording problem is the remaining "command center" promise in metadata and any visible surfaces. It positions EasyLife like a generic dashboard instead of a personal assistant workspace. Replace it with a quieter sentence that names the user's daily outcome without listing every module at once.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife brings your tasks, notes, calendar, workouts, and plans into one calm daily workspace."

- Before: "command center"
  After: "daily workspace"

- Before: "demo"
  After: "example day"

- Before: "sample data"
  After: "example items"

- Before: "proof"
  After: "preview"

- Before: "See Features"
  After: "See what is included"

- Before: "Start Free"
  After: "Open EasyLife"

- Before: "pipeline work"
  After: "project work"

## Voice Rules
- Lead with what the user can do today.
- Use concrete product nouns: task list, note, calendar block, workout log, project brief, inbox item, setting.
- Avoid builder words in visible copy: demo, proof, polish, handoff, sample data, workflow, command center.
- Keep first-screen copy short; move explanation lower or behind action.
- Do not list every module when one daily outcome will do.
- Public pages may explain; working app screens should direct.
- Theme copy should describe mood and readability, not technical styling.
- Copy should feel calm, useful, and specific, never inflated.

## Next 5 Copy Tasks
- [ ] Replace visible "command center" metadata with "daily workspace" language; do not touch routing, auth, or config behavior.
- [ ] Search visible JSX strings for "demo", "proof", "polish", "handoff", and "sample data"; replace only customer-facing instances.
- [ ] Review Settings theme labels and helper text; keep each description under one sentence and tied to readability or mood.
- [ ] On one public product page, reduce CTA/feature explanation copy above the fold; keep one primary action and one concrete support line.
- [ ] Review EasyList email candidate labels; ensure any example content says "example email" or "example follow-up", not "sample data".

## Stop Or Continue
continue but fix copy first