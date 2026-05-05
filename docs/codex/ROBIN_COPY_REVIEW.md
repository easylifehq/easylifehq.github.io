# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is closer to a calm daily workspace, but a few visible and semi-visible strings still sound like internal product framing instead of a personal assistant the user can trust.

## Mission Voice Fit
The language generally matches the mission when it says "workspace," "today," "daily plan," and "next move." That tone fits a connected personal suite: practical, calm, and action-oriented. The remaining miss is product-position language like "command center," plus builder/review words that appear in source smoke hits. Even when some hits are internal identifiers, the visible surfaces should keep moving away from product-process phrasing and toward concrete daily-life nouns.

## Delicate Wording Risks
- "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center." This still sounds like generic SaaS control-room copy and violates the operating-mode warning against command-center framing.
- "command center" in `404.html` and `app-vNext/index.html` is especially worth replacing because meta copy can become public-facing in previews, search snippets, or app surfaces.
- "proof" appears as `auth-proof-card`; likely a class name, not visible copy, but Robin should keep watching for visible "proof" because it sounds like a review artifact, not buyer language.
- "demo" and "sample" appear mostly in dev/visual QA and mock IDs. Those are not automatic copy failures, but visible UI should say "example day," "example task," or "starter item" instead of "demo" or "sample data."
- "pipeline work" may be too internal unless the app has a clearly user-facing Pipeline module. If retained, it should be staged behind the app, not in first-screen or meta promise copy.
- The copy-review context still contains repeated process words: "polish," "handoff," "proof," "demo," and "command center." These are fine in internal docs, but customer-facing copy should not inherit them.

## Beautiful Language Opportunities
- Replace suite-inventory copy with a more personal daily promise: what the user can open, see, and do today.
- Use "daily workspace," "today plan," "task list," "notes," "calendar blocks," and "workout log" as concrete anchors.
- Let HQ copy name one next move first, then let module status appear as compact context.
- Make Settings copy feel like quiet control, not a settings inventory.
- Give EasyProjects more user-task language: "project brief," "planning review," "next milestone," "calendar prep."
- Keep marketing page language shorter and more product-led: product name, one useful promise, one action, one preview.

## Priority Rewrite
Replace the remaining public/meta "command center" line with concrete daily-workspace language. It is the most important wording problem because it frames EasyLife as a generic dashboard instead of a calm personal assistant surface, and it appears in root/app HTML metadata where it may be seen outside the app.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar plans, workouts, and projects in one calm daily workspace."

- Before: "command center"
  After: "daily workspace"

- Before: "sample data"
  After: "example day"

- Before: "demo"
  After: "example workspace"

- Before: "proof"
  After: "preview" or "status"

- Before: "Calendar handoff"
  After: "Calendar prep"

- Before: "polish"
  After: "review" or "finish"

## Voice Rules
- Lead with what the user can do next today.
- Use concrete nouns: task list, note, calendar block, workout log, project brief, daily plan.
- Avoid generic suite claims like "command center," "all-in-one," "operating system," "premium," and "high-tech" in visible UI.
- Keep primary labels short and direct.
- Put explanations behind actions, panels, or detail views.
- Separate public product copy from working app copy.
- Do not use builder words like "demo," "sample data," "proof," "handoff," or "polish" in customer-facing strings.
- Never invent AI, automation, performance, or productivity claims unless the product visibly proves them.

## Next 5 Copy Tasks
- [ ] Replace the `404.html` meta description "command center" phrase with "calm daily workspace"; guardrail: meta copy only, no route or deployment behavior changes.
- [ ] Replace the `app-vNext/index.html` meta description "command center" phrase with the same daily-workspace wording; guardrail: keep the product scope accurate and do not add claims.
- [ ] Search visible JSX strings for "demo," "sample data," "proof," "handoff," "polish," and "command center"; guardrail: ignore class names, IDs, imports, docs, and dev-only query params.
- [ ] Review EasyProjects visible task/timeline examples for "ship" or "polish"; guardrail: replace only one user-facing phrase with concrete project-work language.
- [ ] Review HQ first-screen copy for staging; guardrail: one next move first, today context second, module inventory lower or quieter.

## Stop Or Continue
continue but fix copy first