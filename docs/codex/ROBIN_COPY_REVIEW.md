# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward calmer daily-assistant language, but some visible and near-visible copy still leans on internal product framing instead of concrete user outcomes.

## Mission Voice Fit
The strongest fit is the protected Today/HQ direction: "next move", "today context", "capture", and "workspace" support the mission better than the older "command center" and "personal operating system" language. The remaining risk is staging and surface split: public/product copy can explain EasyLife, but the working app should sound like a useful daily assistant, not a launch packet or feature tour. The provided smoke hits also show lingering terms like "command center" in HTML meta copy and several "demo/proof/sample" markers that should be checked for visibility before the branch continues.

## Delicate Wording Risks
- "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center." This is still generic SaaS language and sounds more like a platform claim than a personal daily workspace.
- "command center" is overbuilt for the EasyLife voice. It implies a heavy dashboard and conflicts with the calmer assistant direction.
- "proof" in `auth-proof-card` appears to be a class name, not visible copy, but the term should stay out of customer-facing text.
- "demo" in query params and context helpers appears internal, but any visible route labels, page text, buttons, or helper copy using "demo" should be replaced with "example day", "preview", or "workspace".
- "sample" IDs in EasyList email examples appear internal data identifiers, but if "sample" appears in rendered copy it will make the product feel staged.
- Phase/review packet language is appropriate in docs, but it must not leak into app surfaces. "review packet", "guardrails", "proof", and "implementation" are builder-facing.
- The task queue still uses phrases like "visible UI, interaction, or copy area" and "prefer deleting awkward complexity"; acceptable for internal docs, not acceptable in visible product copy.
- The public pages still risk brochure framing if "Start Free", "See Features", chips, and feature labels dominate before a functional preview.

## Beautiful Language Opportunities
- Replace broad suite claims with concrete daily nouns: task list, calendar block, note, workout log, project brief, daily plan.
- Let the first protected screen speak in direct user terms: what matters now, what is due, what can be captured, what can wait.
- On public pages, make product copy shorter and more grounded: "Plan the day from tasks, notes, and calendar blocks" is stronger than "one command center".
- Use "workspace" carefully. It is a good replacement for "command center", but it should be paired with an action or outcome.
- For command/capture surfaces, prefer simple verbs: "Add task", "Capture note", "Plan today", "Check what is due".
- Keep helper text under controls short enough to feel like guidance, not a product explanation.

## Priority Rewrite
Replace the remaining customer-facing "command center" meta/product language with a concrete daily-workspace description. This is the highest-priority copy repair because it sits at the product promise level and reinforces the wrong mental model: a dashboard for everything, instead of a calm assistant that helps the user decide what to do next.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar plans, workouts, and projects in one daily workspace."

- Before: "command center"
  After: "daily workspace"

- Before: "See Features"
  After: "See how it works"

- Before: "Start Free"
  After: "Open EasyLife"

- Before: "sample data"
  After: "example day"

- Before: "proof"
  After: "preview"

- Before: "demo"
  After: "example workspace"

- Before: "What am I forgetting"
  After: "Check what is still open"

## Voice Rules
- Use concrete daily nouns before abstract product nouns.
- In the working app, write task labels, not sales copy.
- Keep first-screen copy short: one next action, one today context, one capture path.
- Avoid "command center", "personal operating system", "premium", "high-tech", "proof", "handoff", "polish", "demo", and "sample data" in visible copy.
- Use "workspace" only when paired with a clear user action or benefit.
- Separate public explanation from signed-in app labels.
- Never make AI/backend promises unless the UI shows deterministic local behavior and the copy names it honestly.
- Prefer "example" over "demo" when showing mock or illustrative content.

## Next 5 Copy Tasks
- [ ] Replace the visible/meta "command center" description in `404.html` and `app-vNext/index.html` with concrete daily-workspace language; guardrail: copy-only, no deploy/build output decisions beyond the allowed source surface.
- [ ] Search visible JSX strings for "demo", "proof", "sample data", "handoff", "polish", and "command center"; guardrail: ignore class names, IDs, query params, and internal docs unless rendered to users.
- [ ] Review the protected Today/HQ first viewport copy and shorten any helper line that explains the system instead of naming the next action; guardrail: do not add new claims or new UI.
- [ ] Check public module CTAs and replace one generic feature-tour label with a concrete action label; guardrail: preserve route behavior and tap targets.
- [ ] Review command/capture labels for clarity at 390px and keep only direct actions such as "Add task", "Capture note", and "Plan today"; guardrail: no new command behavior.

## Stop Or Continue
continue but fix copy first