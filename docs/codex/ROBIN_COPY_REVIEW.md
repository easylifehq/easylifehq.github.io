# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is close to a calm personal workspace voice, but several visible phrases still sound like builder notes, demo scaffolding, or generic product theater instead of daily user language.

## Mission Voice Fit
The strongest language now points toward a connected personal workspace: "Opening your workspace", daily planning, task lists, calendar prep, recent notes, and compact module status all fit the mission. The remaining risk is that EasyLife sometimes names its internal construction instead of the user's outcome. Phrases like "command center", "proof", "demo", "handoff", "workflow cleanup", "polish", and "sample" weaken trust because they sound like the product is explaining how it was made or staged rather than helping someone act today.

## Delicate Wording Risks
- "command center" in public meta copy is too generic and too SaaS-like for the personal assistant direction.
- "Start with" on the login proof card may read like builder-directed onboarding rather than a concrete user benefit unless the following copy names the action clearly.
- "auth-proof-card" is probably internal class naming, but any visible "proof" language should be avoided because it sounds like a pitch deck.
- "Quick blockers and handoffs." is visible sample calendar language that feels internal and workplace-process heavy. "Blockers" and "handoffs" do not match a calm personal life suite unless the context is explicitly work.
- "messy workflow cleanup and mobile-first demo polish" sounds like Codex or product-build language, not user-owned pipeline content.
- "Build onboarding screen" is plausible as a project task, but it feels like a software-builder sample rather than a broad EasyLife personal workspace example.
- "Nothing completed yet this week. Start with one small win." is clear, but "win" is a little motivational-generic. It is acceptable, though a calmer option would be more direct.
- The repeated use of "demo" in `visualQa` and route logic is internal and harmless, but visible demo/sample language should keep being removed from rendered strings.
- First-screen copy is still at risk of overexplaining. The visual review reports six headings above the fold on several routes, which means even good sentences are arriving too early.

## Beautiful Language Opportunities
- Replace remaining product-theater nouns with real user nouns: task list, daily plan, calendar block, note, project brief, workout log, setting, workspace.
- Give Settings a quieter control-center voice by leading with one concrete job, such as "Choose how EasyLife opens" or "Set up your workspace", then moving detail below.
- Make EasyProjects sample copy feel lived-in and broadly useful: weekly planning review, project brief, vendor follow-up, budget check, trip plan, calendar prep.
- In public meta and product pages, use one plain promise instead of a broad suite claim: "EasyLife keeps tasks, notes, calendar planning, workouts, and projects in one workspace."
- Where empty states say "Start with", make the action visible and specific: "Add one task", "Capture a note", "Plan the next block", "Log today's workout."
- Keep support copy shorter above the fold. Let the interface show structure before copy explains it.

## Priority Rewrite
The single most important wording problem is the remaining builder/process vocabulary in visible app examples, especially EasyProjects, EasyPipeline, calendar samples, and public meta copy. Replace one phrase at a time with concrete user-owned language, keeping the same UI shape and avoiding longer explanation. Nami should prioritize visible strings containing "command center", "handoff", "workflow", "polish", "proof", "demo", "sample data", and "ship" when those words are rendered to users.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and follow-ups in one workspace."

- Before: "Quick blockers and handoffs."
  After: "Quick decisions and follow-ups."

- Before: "Prep two examples: messy workflow cleanup and mobile-first demo polish."
  After: "Prep two examples: weekly planning review and mobile task cleanup."

- Before: "Build onboarding screen"
  After: "Finish project brief"

- Before: "Nothing completed yet this week. Start with one small win."
  After: "Nothing completed yet this week. Choose one task to finish first."

- Before: "Calendar handoff"
  After: "Calendar prep"

- Before: "Opening your workspace."
  After: "Opening your workspace." Keep. This is calm, concrete, and product-fit.

## Voice Rules
- Use concrete daily-life nouns before abstract product nouns.
- Say what the user can do next, not what the system proves, demos, ships, or polishes.
- Keep first-screen labels short: one job, one action, one useful status.
- Avoid "command center", "operating system", "premium", "high-tech", "proof", "handoff", "polish", "workflow", and "demo" in customer-facing copy.
- Separate public product copy from working app copy. Marketing may explain; the app should direct.
- Prefer "workspace", "daily plan", "task list", "calendar block", "note", "project brief", "workout log", and "settings" over vague suite language.
- Do not add claims about automation, AI, prediction, productivity gains, or reliability unless the visible product proves them.
- Empty states should answer: what is empty, what should I do, and what happens next.

## Next 5 Copy Tasks
- [ ] Replace the visible public meta phrase "command center" with "workspace"; guardrail: meta copy only, no route, build, auth, Firebase, or generated-output changes.
- [ ] In EasyCalendar sample data, replace "Quick blockers and handoffs." with a calmer user-facing planning phrase; guardrail: copy-only, preserve event data fields and behavior.
- [ ] In EasyPipeline visible sample notes, replace "workflow cleanup" and "demo polish" with concrete planning examples; guardrail: do not rename internal identifiers or add new sample records.
- [ ] In EasyProjects visible placeholders or sample tasks, replace one software-builder phrase such as "Build onboarding screen" with a broader user task; guardrail: one string only, no data-shape or persistence changes.
- [ ] Review first-screen headings on one marketing route and demote one repeated eyebrow or section label; guardrail: no new claims, no new sections, and keep the primary CTA unchanged.

## Stop Or Continue
continue but fix copy first