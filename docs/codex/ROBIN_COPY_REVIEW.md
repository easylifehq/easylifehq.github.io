# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward a calmer daily assistant voice, but visible copy still slips into product-builder language and broad suite claims before the user's next action is concrete.

## Mission Voice Fit
The strongest copy fit is the newer daily-life vocabulary: "today", "next move", "capture", "task", "calendar", "workout", "school", and "draft reply" all support the personal assistant position. The weaker fit is the recurring meta-language around "command center", "demo", "proof", "sample", and broad module inventory language. EasyLife should sound like a working daily workspace, not a launch deck or internal prototype.

## Delicate Wording Risks
- "command center" appears in public meta copy and feels too generic SaaS for the EasyLife mission. It also overstates the product as a control room instead of a calm daily assistant.
- "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center" is a feature inventory. It lists the system before making the user outcome clear.
- "demo" remains in URL/test affordances and may be internal only, but any visible use would weaken trust by making the product feel staged.
- "proof" appears as an auth card class and may not be visible, but visible "proof" language would feel like a builder talking to reviewers rather than a user deciding what to do.
- "sample" appears in EasyList email candidate IDs. If exposed in UI, replace it; guests and users should see "example", "email", "draft", or the actual candidate type.
- "pipeline work" is vague for a personal assistant app unless the user already knows EasyPipeline. It sounds corporate and less personal than "projects" or "follow-ups".
- The phase work adds many concepts: inbox intelligence, school planner, coach, capacity, command layer. If all are explained near the first screen, the copy risks becoming a feature dump instead of a daily start surface.
- "Plan intensity" and "capacity signal" can sound algorithmic or advisory. Keep the language humble: it is a local planning estimate, not a prediction or health recommendation.

## Beautiful Language Opportunities
- Replace broad suite positioning with one clear daily promise: know what matters today, capture quickly, and move on.
- Give the Today/HQ surface short action labels that sound useful in the moment: "Review today", "Capture a thought", "Plan next block", "Open task list".
- Make inbox copy concrete and safe: "Review candidate", "Keep visible", "Draft reply", "Needs approval" are stronger than intelligence language.
- Make school planning copy feel practical rather than mock-like: "Exam this week", "Assignment due", "Study block", "Add to tasks".
- Make coach/capacity copy restrained: "Lighter day", "Normal day", "Push day" works if paired with plain assumptions like tasks due, calendar load, and workout status.
- Public meta copy can be warmer and more specific without making claims: "EasyLife brings tasks, notes, calendar planning, workouts, and projects into one daily workspace."

## Priority Rewrite
Fix the public-facing "command center" description first. It is visible, broad, and off-voice for a calm personal assistant product. Replace it wherever it appears in meta or customer-facing copy with concrete daily-workspace language that names the benefit without sounding like SaaS infrastructure.

## Suggested Rewrites
1. Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
   After: "EasyLife brings tasks, notes, calendar planning, workouts, and projects into one calm daily workspace."

2. Before: "command center"
   After: "daily workspace"

3. Before: "sample data"
   After: "example day"

4. Before: "demo"
   After: "preview" for public surfaces, or "example" when describing mock content.

5. Before: "proof"
   After: "preview", "status", or "example" depending on the visible context.

6. Before: "capacity signal"
   After: "Today's load"

7. Before: "Plan intensity"
   After: "Day pace"

8. Before: "draft reply affordance"
   After: "Review reply draft"

## Voice Rules
- Start with what the user can do today, not what the system contains.
- Use concrete nouns: task list, calendar block, note, workout log, school item, reply draft, daily plan.
- Avoid product-builder words in visible copy: demo, proof, sample data, handoff, polish, command center.
- Keep primary labels short: two to four words when possible.
- Keep uncertainty honest: say "suggested", "estimated", "based on today", or "example" when output is not authoritative.
- Separate public product copy from working app copy. Public copy may explain; app copy should help the user act.
- Do not stack every module in the first screen. Stage detail behind Today, More, module pages, drawers, or review panels.
- Prefer warm utility over hype. EasyLife should sound capable, quiet, and specific.

## Next 5 Copy Tasks
- [ ] Replace visible "command center" meta copy in `404.html` and `app-vNext/index.html` with "daily workspace" language; do not edit package, deploy, auth, or generated build files unless the supervisor explicitly allows root output.
- [ ] Search visible JSX strings for "demo", "proof", "sample data", "handoff", and "polish"; replace exactly one customer-facing instance with a concrete daily-life noun and leave internal identifiers alone.
- [ ] Review Today/HQ first-screen labels and shorten one over-explained helper line so it names the action, the reader, and the outcome in one sentence or less.
- [ ] Review inbox candidate labels and ensure every visible type is one of: task, deadline, event, follow-up, keep visible, draft reply; do not add automation or sending claims.
- [ ] Review capacity/coach copy and add humble framing where needed: "based on today's list" or "suggested pace"; do not imply prediction, medical advice, or real AI judgment.

## Stop Or Continue
continue but fix copy first