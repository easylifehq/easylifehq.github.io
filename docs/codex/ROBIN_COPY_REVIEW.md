# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward calm daily-assistant language, but a few visible and semi-visible phrases still sound like a product build, a demo shell, or a generic suite pitch.

## Mission Voice Fit
The strongest current language fits the mission when it names concrete daily use: tasks, notes, calendar planning, workouts, today context, next move, workspace, and capture. That voice supports a connected personal operating system without becoming grandiose. The weaker voice appears when EasyLife describes itself as a "command center" or when internal review language like "proof", "demo", "sample", and "polish" leaks near app surfaces. For this product, the buyer and signed-in user should hear a practical daily workspace, not a build process or showcase.

## Delicate Wording Risks
- "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center." feels generic and too SaaS-like. It also conflicts with the current mode rule against command-center framing.
- "command center" is too corporate for the mission and makes the product sound like an admin dashboard rather than a personal daily assistant.
- "pipeline work" may be unclear to normal personal-productivity users unless EasyPipeline is a public-facing concept they already understand.
- Root and app meta descriptions repeat the same command-center promise. Even if not primary screen copy, it is customer-facing enough to fix.
- "demo" in route/query logic appears mostly internal, but any visible use of "demo" should be replaced with "example day", "preview", or "workspace" depending on context.
- "proof" appears in a class name, not visible copy, but repeated proof language in reviews has already trained the task queue toward builder-speak. Avoid carrying it into UI labels.
- "sample" appears in internal IDs for email examples. IDs are not a copy issue, but visible email example labels should avoid "sample data" and prefer "example thread" or a concrete email subject.
- The changed file list includes `LoginPage.tsx`, an auth-adjacent surface. Any customer-facing auth copy should stay plain and should not imply new account, security, sync, or backend capabilities.

## Beautiful Language Opportunities
- Replace suite-pitch language with daily-life language: "Start your day", "Review today", "Capture a thought", "Plan the next block", "Open your task list".
- Make Today/HQ copy more decisive: one next move, one reason, one action.
- Use "workspace" carefully as a supporting noun, not a standalone value prop.
- Public marketing pages can feel warmer by showing what the user gets in one sentence instead of naming every module.
- Empty states should say what to do next, not what the app contains.
- Experiments and mock surfaces should say "example" only where needed, then quickly use concrete content such as "Morning plan", "Project brief", or "Workout log".
- Settings copy can become more premium by using short control-center labels and avoiding explanatory paragraphs above the fold.

## Priority Rewrite
Fix the remaining "command center" meta description in root and app entry surfaces. It is short, visible enough to matter, and directly violates the current EasyLife voice direction. Replace it with a concrete daily-workspace sentence that names the user outcome without making the app sound like a dashboard or claiming intelligence it has not proven.

## Suggested Rewrites
1. Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
   After: "EasyLife brings tasks, notes, calendar planning, workouts, and projects into one calm daily workspace."

2. Before: "command center"
   After: "daily workspace"

3. Before: "pipeline work"
   After: "project follow-up"

4. Before: "Opening your workspace."
   After: "Opening EasyLife."

5. Before: "sample data"
   After: "example day"

6. Before: "demo"
   After: "preview" for public pages, or "example" for mock-only app states

7. Before: "proof"
   After: "route evidence" in internal docs, or remove entirely from customer-facing UI

## Voice Rules
- Use concrete daily nouns: task list, note, calendar block, workout log, project brief, daily plan, workspace.
- Keep primary labels short and action-facing.
- Do not use "command center", "personal operating system", "premium", "high-tech", "proof", "handoff", or "polish" in visible product copy.
- Separate public explanation from working-app labels.
- First-screen copy should answer: what should I do next today?
- Do not list every module when one next action would orient the user faster.
- Avoid fake intelligence claims. Use "suggested", "next", "today", and "based on your current list" only when the UI visibly supports it.
- Prefer calm usefulness over excitement.

## Next 5 Copy Tasks
- [ ] Replace the meta description phrase "one command center" in root/app entry surfaces with "one calm daily workspace"; do not add new claims or edit auth, build, deploy, or package files.
- [ ] Review the protected HQ first viewport and shorten one helper sentence so it names the next action before module context; do not add new sections or controls.
- [ ] Scan visible UI strings in `app-vNext/src/features/marketing/` for "demo", "proof", "polish", and "handoff"; replace only one clearly customer-facing instance with concrete daily-workspace language.
- [ ] Review EasyProjects visible example copy for build-process language such as "ship" or "polish"; replace one phrase with a real user task label like "Finish project brief" or "Weekly planning review".
- [ ] Review UniversalCapture visible labels and helper text for staging; keep capture copy short, concrete, and secondary to Today rather than turning the first screen into a feature explanation.

## Stop Or Continue
continue but fix copy first