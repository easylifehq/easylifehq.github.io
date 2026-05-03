# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is close to a calm daily workspace voice, but several visible strings still sound like builder shorthand instead of language for a person trying to plan their day.

## Mission Voice Fit
The strongest language is concrete and useful: workspace, daily plan, task list, calendar block, workout log, and settings control center all fit the mission. The weaker language still leans on internal product/process words like "command center", "handoff", "proof", "demo", "workflow", and "polish". For EasyLife, the voice should feel like a personal assistant helping the user see what to do next, not a product team describing the app's construction.

## Delicate Wording Risks
- "command center" in public metadata overstates the product and feels like generic SaaS positioning rather than a calm personal workspace.
- "Quick blockers and handoffs." sounds like team operations language, not personal planning language.
- "Prep two examples: messy workflow cleanup and mobile-first demo polish." reads as internal build/test copy if it appears in a user-facing surface.
- "Start with" can work in a sentence, but as a visible standalone label it can feel like an instruction stub rather than a clear user action.
- "auth-proof-card" is likely internal class naming, but any visible "proof" phrasing should be avoided because it sounds like a sales artifact.
- Settings remains a staging risk: too many controls and explanations appear before the control-center job is clear.
- "sample data" and "demo" are acceptable in internal/dev route logic, but they should not appear as visible copy in the working app or product pages.
- "workflow" is too vague as a value word unless paired with a concrete noun and outcome.

## Beautiful Language Opportunities
- Replace operational jargon with daily-life nouns: task list, calendar block, project brief, workout log, note, reminder, daily plan.
- Make Settings sound like "choose how EasyLife behaves today" rather than "configure every preference".
- Let HQ copy name the user's next action first, then support it with compact status.
- Marketing pages can stay confident while becoming less brochure-like by showing specific use moments instead of feature labels.
- Empty states can be warmer and more useful with one clear action cue instead of broad encouragement.
- Experiment surfaces should be explicitly framed as example days or mock planning surfaces, not "demo" or "sample data".

## Priority Rewrite
Fix the remaining visible builder/process language in app copy, especially "command center", "handoff", "demo", "proof", "workflow", and "polish" when those terms render to users. Nami should turn this into small copy-only tasks by module, starting with public metadata and visible mock/demo content, then EasyCalendar/EasyPipeline/EasyProjects examples.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and daily work in one calm workspace."

- Before: "Quick blockers and handoffs."
  After: "Quick blockers and calendar prep."

- Before: "Prep two examples: messy workflow cleanup and mobile-first demo polish."
  After: "Prepare two example plans: clean up the task list and review the mobile day."

- Before: "Start with"
  After: "Begin with today's plan"

- Before: "Build onboarding screen"
  After: "Draft onboarding plan"

- Before: "Nothing completed yet this week. Start with one small win."
  After: "Nothing completed yet this week. Choose one small task for today."

- Before: "demo"
  After: "example day"

- Before: "workflow cleanup"
  After: "task list cleanup"

## Voice Rules
- Use concrete daily-life nouns before product nouns.
- Keep first-screen copy short: one job, one next action, one compact status line.
- Do not use "command center", "proof", "handoff", "polish", "demo", or "sample data" in visible customer-facing copy.
- Use "workspace" sparingly and only when it describes the whole suite.
- Prefer "calendar prep", "project brief", "task list", "daily plan", "workout log", and "recent notes".
- Keep Settings copy calm and staged; do not explain every setting before the user chooses a group.
- Separate internal/dev language from buyer and user language.
- Do not add claims about automation, AI, intelligence, prediction, or results unless the product visibly supports them.

## Next 5 Copy Tasks
- [ ] Replace public metadata "command center" language with "calm workspace" or equivalent concrete suite wording; do not edit deploy output unless the selected task explicitly allows it.
- [ ] Replace the visible EasyCalendar sample phrase "Quick blockers and handoffs." with concrete planning language; keep the same data shape and UI.
- [ ] Clean one EasyPipeline visible example that includes "workflow", "demo", or "polish"; replace only the rendered phrase and do not broaden scope.
- [ ] Review Settings first-screen helper copy and remove one explanatory sentence that appears before the primary settings group; preserve all controls and behavior.
- [ ] Search `app-vNext/src` for visible "proof", "demo", "sample data", "handoff", and "polish"; fix one user-facing instance only, leaving internal identifiers alone.

## Stop Or Continue
continue but fix copy first