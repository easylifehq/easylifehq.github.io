# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is speaking with a calmer daily-workspace voice, but a few visible phrases still sound like product-building shorthand instead of a clear personal assistant experience.

## Mission Voice Fit
The language mostly matches the EasyLife mission: calm, useful, connected, and centered on daily action. Recent HQ and module wording appears to be moving away from "command center" and toward concrete next moves, which fits the protected app's job. The weak spot is consistency: customer-facing metadata and a few app strings still carry internal or generic terms such as "command center," "proof," "demo," "sample," and "Start with one small win." Those phrases weaken trust because they sound like review scaffolding, marketing boilerplate, or builder language rather than a finished personal workspace.

## Delicate Wording Risks
- `command center` in `404.html` and `app-vNext/index.html` is still too generic SaaS for EasyLife. It suggests a dashboard product instead of a calm personal workspace.
- `auth-proof-card` appears to be a class name, not visible copy, but "proof" should stay out of customer-facing labels if it appears elsewhere.
- `demo` appears mainly in visual QA/dev conditionals. That is acceptable if non-visible, but visible "demo" language should be replaced with "example day," "workspace," or "preview" depending on context.
- `sample` appears in EasyList email example identifiers. If any rendered email labels say "sample," they will feel unfinished. Prefer "example" only when the user needs to know the content is illustrative.
- "Nothing completed yet this week. Start with one small win." is clear, but slightly generic and motivational. It does not say what the user should do in the product.
- The unchecked recovery task wording in the queue is too vague for implementation: "visible UI, interaction, or copy area" and "one repeated label" are process instructions, not a concrete user outcome.
- "Life OS" in acceptance wording is internal shorthand. It should not become visible product copy.
- Simon's concern remains copy-adjacent: public pages still risk sounding acquisition-led when the mission asks for daily use.

## Beautiful Language Opportunities
- Replace "command center" with a concrete noun like "workspace," "daily workspace," or "one place for tasks, notes, calendar, and workouts."
- Turn generic encouragement into a next action: "Pick one task for today" is more useful than "Start with one small win."
- Use "today," "next," "capture," "plan," "review," and "finish" as primary working verbs.
- Keep public product copy shorter and more concrete: product name, one promise, one action, one preview.
- Let protected app copy sound like a quiet assistant: "Choose today's next move," "Capture a thought," "Review the next calendar block."
- Separate internal review words from visible copy: "proof," "demo," "handoff," and "polish" belong in docs, not the app surface.

## Priority Rewrite
Fix the remaining customer-facing "command center" metadata first. It is small, visible, and mission-shaping: EasyLife should not introduce itself as a command center when the product direction is a calm personal workspace. Replace the meta description in both root/static and app source only when that scope is approved by the supervisor; otherwise queue it as a guarded copy task because root files are normally forbidden.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, and projects in one calm daily workspace."

- Before: "Nothing completed yet this week. Start with one small win."
  After: "No completed items this week. Choose one task to finish today."

- Before: "Start Free"
  After: "Open EasyLife"

- Before: "See Features"
  After: "See What It Organizes"

- Before: "demo"
  After: "example day"

- Before: "sample data"
  After: "example items"

- Before: "proof"
  After: "preview" or "workspace preview"

## Voice Rules
- Use concrete daily-life nouns: task list, calendar block, note, workout log, project brief, daily plan, workspace.
- Keep first-screen labels short and action-led.
- Avoid internal build words in visible copy: proof, demo, handoff, polish, sample data, command center.
- Do not promise intelligence, automation, or AI unless the product visibly performs it.
- Prefer calm utility over motivation-speak.
- Public pages may explain the product; signed-in app screens should tell the user what to do next.
- Empty states must answer: what is missing, what should the user do, and what will they get.
- Do not add longer explanations to fix vague copy. Replace vague copy with specific copy.

## Next 5 Copy Tasks
- [ ] Replace the visible meta description phrase "one command center" with "one calm daily workspace"; guardrail: do not touch root static files unless the supervisor explicitly allows that path.
- [ ] Inspect any rendered EasyList email examples for visible "sample" language; guardrail: replace only visible labels, not internal IDs.
- [ ] Rewrite the EasyStatistics empty state "Start with one small win" into a concrete next action; guardrail: one sentence only, no motivational flourish.
- [ ] Search protected app JSX strings for "demo," "proof," "handoff," "polish," and "command center"; guardrail: ignore class names, env flags, IDs, and docs.
- [ ] Review public hero CTAs for acquisition-heavy wording like "Start Free"; guardrail: keep routes and meaning unchanged, and do not invent pricing or account claims.

## Stop Or Continue
continue but fix copy first