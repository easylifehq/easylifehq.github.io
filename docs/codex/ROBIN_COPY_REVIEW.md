# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is speaking more like a calm daily workspace now, but a few public and signed-in surfaces still carry internal product-builder language that weakens trust.

## Mission Voice Fit
The current direction fits the mission when it says "workspace," "today," "next move," "capture," "task list," and "calendar block." That language supports a connected personal assistant product without pretending the app can do more than it visibly does. The weaker fit is lingering "command center," "demo," "proof," and "polish" language around public metadata, visual QA surfaces, and internal sample experiences. Those words make EasyLife sound like a product presentation instead of a tool someone opens to decide what to do next.

## Delicate Wording Risks
- "command center" in public metadata is too generic SaaS and too broad for the current product promise. It should become "daily workspace" or "workspace for tasks, notes, calendar planning, workouts, and projects."
- "demo" is acceptable in internal route params and test hooks, but should not appear in visible product copy. It makes the app feel temporary.
- "proof" is acceptable in class names like `auth-proof-card`, but visible "proof" language should be avoided unless it names concrete evidence the buyer can inspect.
- "polish" sounds like builder language when customer-facing. It describes the maker's process, not the user's outcome.
- "handoff" is too internal unless the reader is staff or an operator. For EasyLife, use "calendar prep," "project brief," "task follow-up," or "next step."
- "sample data" weakens confidence if visible. Prefer "example day," "example task list," or "preview content" only when the surface clearly needs a demo label.
- "personal operating system" is mission language, not ideal app copy. It can feel inflated unless the screen immediately proves the daily action.
- "Today is not a dashboard dump" is useful reviewer language, but any visible app copy should avoid "dashboard" framing unless it is a literal dashboard route.

## Beautiful Language Opportunities
- HQ/Today can be warmer and more useful by naming one specific action: "Review today's first task," "Plan the next open block," or "Capture what just came up."
- Module status labels can be more concrete: "3 tasks due," "Next calendar block," "Recent note," "Workout ready."
- Empty states should say what the user can do next, not describe the feature: "Add one task for today" is stronger than "Manage your task workflow."
- Public product copy can become quieter by replacing broad suite claims with daily-life nouns: "tasks, notes, calendar blocks, workouts, and project briefs."
- Experimental surfaces should label uncertainty clearly: "Example response," "Mock daily plan," or "Preview only" if the content is visibly not live.
- Settings copy can feel more trustworthy by using control-center language only when paired with concrete controls: theme, modules, mobile, notifications, account.

## Priority Rewrite
Fix the remaining customer-facing "command center" language in public metadata and any visible app copy. It is the most mission-breaking phrase because it makes EasyLife sound like generic SaaS infrastructure instead of a personal daily workspace. Replace it with concrete product nouns and avoid adding a larger claim.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one daily workspace."
- Before: "Command center"
  After: "Today workspace"
- Before: "Demo"
  After: "Example day"
- Before: "Proof"
  After: "What is ready"
- Before: "Polish"
  After: "Clean up"
- Before: "Calendar handoff"
  After: "Calendar prep"
- Before: "Sample data"
  After: "Example plan"
- Before: "Personal operating system"
  After: "Connected daily workspace"

## Voice Rules
- Use concrete daily nouns: task list, note, calendar block, workout log, project brief, daily plan, workspace.
- Keep first-screen copy short: one next move, one today context line, one capture cue.
- Do not explain the whole suite above the fold.
- Keep marketing language out of the signed-in app.
- Use "example" only when content is clearly mock or illustrative.
- Avoid builder words in visible copy: proof, polish, handoff, workflow, demo, sample data, command center.
- Prefer verbs that tell the user what they can do: add, review, plan, capture, open, choose.
- Do not promise intelligence, automation, prediction, or AI unless the visible surface proves it and the feature is real.

## Next 5 Copy Tasks
- [ ] Replace public metadata "command center" with "daily workspace"; guardrail: metadata copy only, no routing or app behavior changes.
- [ ] Search visible `app-vNext/src` strings for "demo" and replace only customer-facing instances with "example day" or "preview"; guardrail: leave route params and internal identifiers unchanged.
- [ ] Review HQ/Today first-screen labels and shorten any line that explains the suite instead of naming today's action; guardrail: no new sections or claims.
- [ ] Replace one visible "proof," "polish," or "handoff" phrase with a concrete daily noun; guardrail: one phrase only, preserve meaning.
- [ ] Review experimental mock copy for clear labels like "Example response" or "Preview only"; guardrail: do not imply live AI, backend work, or real prediction.

## Stop Or Continue
continue but fix copy first