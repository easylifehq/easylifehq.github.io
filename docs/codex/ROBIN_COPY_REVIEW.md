# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is closer to a calm daily workspace, but visible and near-visible language still carries too much internal product-build vocabulary.

## Mission Voice Fit
The strongest copy direction is concrete and daily: tasks, calendar blocks, notes, workouts, capture, Today, More, and workspace. That fits the mission well. The weaker copy still says "command center", "demo", "proof", "sample", and "polish" in places that make EasyLife feel like a product prototype instead of a trustworthy personal assistant suite.

## Delicate Wording Risks
- "command center" appears in public metadata and app language; it sounds generic SaaS and conflicts with the softer personal assistant direction.
- "demo" is acceptable for internal dev flags, but risky if it leaks into visible product copy because it makes the app feel temporary.
- "sample data" and "sample" should not appear in visible UI. Prefer "example day" or real task nouns in mock/local views.
- "proof" in visible class names is not customer copy, but any visible proof/proof-card language should be avoided. It sounds like builder evidence, not buyer value.
- "polish", "handoff", "ship", and similar process words remain copy smells for this project. They describe the build process, not the user's day.
- "command palette" can be acceptable as a technical UI label, but for EasyLife it may be warmer as "Quick actions" unless the surface truly behaves like a command palette.
- The public pages still risk explaining the suite before showing the useful object. That is a staging issue even when individual sentences are clear.
- Any "Start Free" repetition on protected or app-like surfaces risks mixing marketing copy with working-app copy.

## Beautiful Language Opportunities
- Replace generic suite nouns with daily nouns: "Today", "daily plan", "task list", "calendar block", "recent note", "workout log", "project brief".
- Make the first protected screen sound like a gentle start, not a dashboard: "Start with this" is better than "command center".
- Use "Quick actions" for compact action surfaces that help the user do something now.
- In mock/local data, use "Example day" rather than "demo" or "sample data".
- For inbox intelligence, keep approval language plain: "Review before adding", "Draft only", "Needs approval".
- For capacity and coach copy, protect humility: "Suggested pace" or "Capacity signal" is better than confident prediction language.
- For optional modules, "More" should feel like a quiet utility shelf, not a feature inventory.

## Priority Rewrite
The single most important copy problem is internal vocabulary leaking into product-facing language. Nami should scan visible app and marketing strings for "command center", "demo", "proof", "polish", "handoff", "ship", and "sample data", then replace only visible user-facing instances with concrete daily-life nouns. Do not broaden scope into docs, class names, IDs, or auth logic unless the text is rendered to users.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, and projects in one daily workspace."

- Before: "Command Center"
  After: "Today"

- Before: "AI Command Center"
  After: "Quick actions"

- Before: "Sample data"
  After: "Example day"

- Before: "Calendar handoff"
  After: "Calendar prep"

- Before: "Project polish"
  After: "Finish project brief"

- Before: "Proof"
  After: "Workspace preview"

- Before: "Start Free"
  After: "Open EasyLife" on app-like or protected-adjacent surfaces only.

## Voice Rules
- Use concrete daily nouns before abstract product nouns.
- Keep primary labels short: Today, Tasks, Calendar, Notes, Coach, Inbox, More.
- Separate marketing copy from app copy. The working app should sound useful, not persuasive.
- Avoid internal build words in visible UI: demo, sample, proof, polish, handoff, ship, workflow.
- Do not overpromise intelligence. Prefer deterministic words like suggested, example, draft, review, approval, and local.
- Keep the first screen focused on one next action and compact status, not a feature inventory.
- When copy names a control, make the action and outcome obvious.

## Next 5 Copy Tasks
- [ ] Replace the public metadata phrase "one command center" with "one daily workspace"; do not touch auth, routing, deployment config, or generated output unless this source metadata is the editable app source.
- [ ] Scan `app-vNext/src` for visible "command center" strings and replace one rendered instance with "Today", "workspace", or "Quick actions"; ignore class names and internal route names.
- [ ] Review `EasyListEmailPage.tsx` for any rendered "sample" or "sample data" language and replace one visible instance with "example day"; do not change IDs or behavior.
- [ ] Review experiments command/capture surfaces for visible "AI Command Center" or "demo" language and replace one user-facing label with "Quick actions" or "example"; keep all AI/mock safety wording intact.
- [ ] Review EasyProjects visible mock/task copy for "polish", "ship", or "handoff" and replace one phrase with a concrete user task like "Finish project brief" or "Calendar prep"; do not change data shapes.

## Stop Or Continue
continue but fix copy first