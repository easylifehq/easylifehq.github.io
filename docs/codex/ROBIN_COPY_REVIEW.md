# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward a calmer personal workspace voice, but visible copy still slips into builder language, product-tour phrasing, and broad "command center" claims.

## Mission Voice Fit
The best current language fits the mission when it uses concrete daily nouns: task list, calendar planning, recent notes, workout log, daily plan, and workspace. The weaker language still sounds like an internal launch process or a software positioning deck. EasyLife should speak like a useful assistant for the user's day, not like a team explaining its product architecture.

## Delicate Wording Risks
- "command center" in app metadata overclaims and pushes EasyLife toward generic SaaS language instead of a calm personal assistant.
- "Start with" can sound like instruction to the builder or reviewer when the reader and result are not concrete.
- "EasyLife polish pass", "EasyLife polish launch", and "Ship polish" read as internal production language if they appear in visible sample data.
- "Calendar handoff" is builder/process language; it does not tell a user what happens or what they get.
- "auth-proof-card" appears likely internal class naming, but any visible "proof" language should be avoided unless it is literal evidence for a user.
- "sample data" and "demo" should stay out of customer-facing UI unless clearly framed as an example day or preview.
- Product pages still risk sounding like feature inventories when too many labels, chips, and preview headings appear before the user's next action is clear.

## Beautiful Language Opportunities
- Replace internal process words with daily-life outcomes: "Calendar prep", "Today's plan", "Project brief", "Workout log", "Recent notes".
- Make HQ copy center on one next action and today context, not the full suite promise.
- Give EasyList a more assistant-like task voice: "Next task", "Capture a thought", "Review today", "Undo completion".
- Give EasyNotes a capture-and-review voice: "Write it down", "Recent notes", "Turn into tasks".
- Give EasyCalendar a planning voice: "Plan today", "Next block", "Preview changes", "Undo plan".
- Marketing pages should use fewer eyebrows and labels, with one short product promise and one functional preview.

## Priority Rewrite
Fix the remaining visible builder/process terms across `app-vNext/src/` in one narrow slice at a time, starting with "command center", "handoff", and "polish". These words weaken trust because they describe the making of the product rather than the user's daily outcome.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and daily work in one calm workspace."

- Before: "Start with the next item in the queue."
  After: "Open the next task for today."

- Before: "Calendar handoff"
  After: "Calendar prep"

- Before: "EasyLife polish launch"
  After: "EasyLife launch plan"

- Before: "Ship polish"
  After: "Final launch tasks"

- Before: "Review the EasyLife polish pass"
  After: "Review the EasyLife launch notes"

## Voice Rules
- Use concrete daily nouns before abstract product nouns.
- Say what the user can do now and what they get from doing it.
- Keep first-screen labels short: "Today", "Next task", "Recent notes", "Plan day".
- Avoid "command center", "proof", "handoff", "polish", "demo", and "sample data" in visible copy.
- Keep marketing copy separate from app copy; the app should use task labels, not sales language.
- Do not claim AI, automation, prediction, or intelligence unless the feature is real and visible.
- Let secondary details appear after the user asks for them through navigation, rows, panels, or controls.

## Next 5 Copy Tasks
- [ ] Replace the visible metadata phrase "command center" with "calm workspace" or another concrete daily-workspace phrase; do not edit generated root output unless explicitly approved.
- [ ] Replace one visible "Calendar handoff" phrase with "Calendar prep" or "Calendar block"; keep behavior and route labels unchanged.
- [ ] Rename one visible sample project or note using "polish" to a concrete user task such as "launch notes" or "final QA check"; do not broaden into data model changes.
- [ ] Review "Start with" strings and rewrite one vague instruction into a concrete action with a reader and outcome.
- [ ] Recheck marketing preview labels for duplicate product-name chips and demote one label that repeats the page title.

## Stop Or Continue
continue but fix copy first