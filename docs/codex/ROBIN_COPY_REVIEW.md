# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is closer to a calm daily workspace, but a few visible and near-visible phrases still sound like product-building shorthand instead of language for a person trying to plan a day.

## Mission Voice Fit
The mission calls for a connected, professional personal operating system that helps the user act without clutter. The newer direction fits when it uses concrete nouns like tasks, notes, calendar planning, workouts, workspace, and daily plan. It weakens when the copy says "command center", "demo", "proof", "sample", or "Start with" without a clear reader action and outcome. Those phrases make the app feel like a build artifact or generic SaaS surface rather than a trusted personal assistant.

## Delicate Wording Risks
- "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center." appears in public meta copy. "Command center" is explicitly off-voice for this mode and sounds more corporate than personal.
- "Start with" on the login proof card risks sounding like builder guidance or a generic onboarding prompt unless the next action is concrete.
- "Start with one small win." is warm, but still vague. It does not tell the user whether to add a task, finish a task, log a workout, or review today.
- "proof" in `auth-proof-card` may be internal class naming, but if any related visible label says proof, it should be replaced. Product proof language belongs in internal review, not the customer surface.
- "demo" query parameters and context names look internal and are not customer-facing by themselves. Do not churn them unless they render visibly.
- "sample" IDs in EasyList email examples are probably internal. If any visible email/card copy says "sample data" or "sample", change it to "example" or a concrete item name.
- The public app description still lists many modules at once. It is accurate, but it edges toward feature inventory rather than a staged first promise.
- "pipeline work" may not be clear to everyday personal-assistant users. It sounds business-process oriented unless the surface is specifically EasyPipeline.

## Beautiful Language Opportunities
- Replace "command center" with "daily workspace" or "one calm workspace" wherever the reader is a customer or signed-in user.
- Make empty-state nudges name the action: add a task, open today's list, review the next calendar block, capture a note, or log a workout.
- On the protected HQ first screen, favor one short sentence that says what today needs, not what the suite contains.
- On login or public surfaces, reduce proof-style language and use grounded outcomes: "Plan today", "Capture a thought", "Review what is next".
- Where module lists are necessary, stage them as supporting context after the main daily action rather than as the lead promise.
- For experiments or visual QA examples, use "example day" or "practice workspace" only when the user can see that the content is illustrative.

## Priority Rewrite
The most important wording problem to fix next is the remaining "command center" public/meta promise. It directly conflicts with the operating mode, makes EasyLife sound like generic SaaS, and appears in app-facing HTML metadata where it can shape previews and perception. Replace it with concrete daily-workspace language without expanding the promise or listing more features.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, and projects in one calm daily workspace."

- Before: "Start with one small win."
  After: "Finish one task from today."

- Before: "Start with"
  After: "Begin with today"

- Before: "Nothing completed yet this week. Start with one small win."
  After: "Nothing completed yet this week. Finish one small task from today."

- Before: "sample data"
  After: "example day"

- Before: "demo"
  After: "example"

- Before: "proof"
  After: "preview"

## Voice Rules
- Use concrete daily-life nouns: task list, note, calendar block, workout log, project brief, daily plan, workspace.
- Avoid visible builder words: demo, proof, handoff, polish, sample data, command center, workflow.
- Keep primary labels short and action-led: Plan today, Add task, Capture note, Review calendar, Log workout.
- Do not explain every module on the first screen; lead with the next useful action.
- Separate marketing copy from app copy. Public pages can describe EasyLife; the working app should tell the user what to do next.
- Prefer "workspace" over "platform", "suite", or "command center" in customer-facing copy.
- Do not add claims about intelligence, automation, outcomes, or reliability unless the visible product proves them.
- Empty states must answer: who is this for, what should they do, and what do they get?

## Next 5 Copy Tasks
- [ ] Replace the public/meta "command center" description with "one calm daily workspace"; guardrail: do not edit package, deploy, auth, Firebase, or generated output files unless the source file already owns this text.
- [ ] Review the login card for visible "Start with" or "proof" language; guardrail: change only visible strings, not class names or auth behavior.
- [ ] Rewrite the EasyStatistics empty-state sentence so it names a concrete action; guardrail: one sentence only, no new feature promise.
- [ ] Search visible JSX strings for "demo", "sample data", "proof", "handoff", and "polish"; guardrail: ignore internal identifiers, params, class names, and docs.
- [ ] Review the HQ first-screen copy for one clear daily next action; guardrail: no new sections, no longer explanatory copy, and no broad module inventory above the fold.

## Stop Or Continue
continue but fix copy first