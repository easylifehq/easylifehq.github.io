# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward calm daily-assistant language, but a few visible and metadata strings still sound like a product scaffold instead of a trustworthy personal workspace.

## Mission Voice Fit
The best current language supports the mission: "Opening your workspace," "today context," "next best move," and "daily plan" fit a connected personal operating system without overselling it. The weaker copy still leans on internal or platform language, especially "command center" in public metadata and repeated "demo/proof/sample" smoke hits that need review before confidence rises. For EasyLife, the voice should feel practical, steady, and personal: what needs attention, where to capture it, and what the user gets next.

## Delicate Wording Risks
- "command center" in `404.html` and `app-vNext/index.html` is customer-facing metadata language and feels too generic SaaS for EasyLife.
- "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center" reads as a feature inventory, not a daily-use promise.
- "pipeline work" is abstract and less personal than tasks, notes, calendar, workouts, and projects.
- `auth-proof-card` is likely a class name, but "proof" should stay out of visible product copy because it sounds like internal validation language.
- `demo` in visual QA query handling appears internal, but any visible "demo" label should be replaced with "example day," "preview," or a concrete product noun.
- `sample-final`, `sample-meeting`, and similar IDs are probably internal, but any rendered "sample data" language would weaken trust.
- The run history still shows repeated concern around "handoff," "polish," "proof," "demo," and "command center"; that pattern suggests the copy system needs a final visible-source sweep, not just isolated replacements.
- The first-screen language must avoid explaining the whole suite at once; labels should name the immediate action before describing the product system.

## Beautiful Language Opportunities
- Replace broad suite descriptions with a daily-use promise: tasks, notes, calendar, and workouts should feel connected through "today," "next," and "capture."
- Let the signed-in HQ own the strongest product language: one next move, today's context, and compact module signals.
- Use "workspace" carefully as a container word, but pair it with concrete nouns like task list, note, calendar block, workout log, and project brief.
- Marketing metadata can become calmer and more specific without adding claims.
- Empty states can feel warmer by naming the next small action rather than describing the feature area.

## Priority Rewrite
The single most important wording problem is the remaining public metadata phrase "one command center." It is visible to search/social/browser contexts, repeats the exact SaaS framing the mode forbids, and turns EasyLife into a feature bundle instead of a calm daily workspace. Replace it with a concrete daily-life sentence that names the core surfaces and the user outcome without claiming intelligence, automation, or all-in-one power.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps your tasks, notes, calendar, workouts, and projects together in one calm daily workspace."

- Before: "command center"
  After: "daily workspace"

- Before: "pipeline work"
  After: "project follow-up"

- Before: "Opening your workspace."
  After: "Opening today's workspace."

- Before: "sample data"
  After: "example day"

- Before: "demo"
  After: "preview"

- Before: "proof"
  After: "example"

## Voice Rules
- Lead with the user's next action, not the product architecture.
- Use concrete nouns: task list, note, calendar block, workout log, project brief, daily plan, workspace.
- Avoid builder/process words in visible copy: demo, proof, polish, handoff, sample data, command center.
- Keep primary labels short and task-like.
- Put explanations behind the first action, not above it.
- Do not imply AI, prediction, automation, or backend intelligence unless the actual feature is visible and true.
- Marketing copy may explain the product; app copy should help the user act.

## Next 5 Copy Tasks
- [ ] Replace "command center" in public metadata with "calm daily workspace"; do not change routing, layout, or product claims.
- [ ] Search visible JSX strings for "demo," "proof," "sample data," "handoff," and "polish"; change only customer-facing instances, not class names or internal IDs.
- [ ] Review the HQ first viewport and ensure every visible sentence answers: who is this for, what should they do, and what do they get?
- [ ] Tighten one empty-state paragraph into one clear next action plus one short outcome; do not add new feature promises.
- [ ] Review marketing hero support copy for feature-inventory language; remove one secondary phrase if it repeats what the headline or preview already says.

## Stop Or Continue
continue but fix copy first