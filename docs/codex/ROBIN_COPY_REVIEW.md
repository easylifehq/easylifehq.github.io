# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward a calmer daily workspace voice, but visible and near-visible copy still carries too much brochure, builder, and internal proof language.

## Mission Voice Fit
The mission calls for a connected, professional personal operating system that helps the user know what to do next today. The strongest copy direction is concrete and useful: tasks, notes, calendar, workout, daily plan, capture, review. The weaker direction is still present in phrases like "command center," "demo," "proof," "sample," and broad product framing that explains the system instead of helping the signed-in user act.

## Delicate Wording Risks
- `command center` in `404.html` and `app-vNext/index.html` sounds generic SaaS and overstates the product frame. It should become "workspace" or "daily workspace."
- `Start Free` on signed-in or app-like surfaces risks making the product feel like a sales page instead of a working personal assistant.
- `demo` is acceptable in internal query params, but risky when it appears in visible route copy, labels, or product surfaces. Prefer "example day" or "workspace preview."
- `proof` is acceptable as a class name, but visible "proof" copy would feel builder-facing and should be avoided.
- `sample data` or `sample` labels are fine as IDs, but visible sample language makes the app feel unfinished. Use "example," "draft," or the concrete item name.
- "personal operating system" is strong in internal mission language, but visible UI should use simpler nouns: workspace, today, plan, task list, notes, calendar.
- Product-route copy still appears to explain the suite before giving a concrete action. That is a staging problem for the protected app.
- The repeated review-packet and phase language in docs is fine internally, but it should not leak into app copy or route labels.

## Beautiful Language Opportunities
- Replace broad suite claims with daily-use sentences: what the user can do now and what they get next.
- Make the protected HQ voice more like a quiet assistant: "Start with this," "Review today," "Capture a thought," "Open your next block."
- Give each module one concrete action label instead of a product promise: "Add task," "Review next block," "Open recent note," "Log workout."
- Use "workspace" as the main connective noun instead of "command center."
- On public pages, keep the product promise brief and let the preview show the work.
- In inbox and school planner surfaces, keep approval language explicit: "Review before adding," "Draft only," "Needs approval."
- For AI or coach-adjacent UI, avoid certainty. Use "suggested," "based on today's items," and "review first."

## Priority Rewrite
The single most important wording problem is the remaining "command center" framing in customer-facing metadata and any visible product copy. It does not match the calmer EasyLife direction and makes the suite sound like generic SaaS. Replace it with concrete daily-workspace language everywhere it is visible or likely to appear in previews, browser metadata, or public descriptions.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, and projects in one calm daily workspace."

- Before: "Start Free"
  After: "Open EasyLife"

- Before: "AI Command Center"
  After: "Daily assistant"

- Before: "sample data"
  After: "example day"

- Before: "proof"
  After: "preview"

- Before: "demo"
  After: "workspace preview"

- Before: "What am I forgetting"
  After: "Check what needs attention"

- Before: "Future Plans"
  After: "Later plans"

## Voice Rules
- Use concrete nouns: task list, daily plan, calendar block, recent note, workout log, project brief.
- Keep first-screen labels short and action-led.
- Do not explain the whole product on the working app surface.
- Avoid builder words: proof, polish, handoff, sample data, demo, workflow, command center.
- Keep public marketing copy separate from app copy.
- Use "suggested" or "review before adding" for deterministic or mock assistant features.
- Prefer "workspace" over "platform," "system," or "command center."
- Make every visible sentence answer: who is this for, what should they do, and what do they get?

## Next 5 Copy Tasks
- [ ] Replace visible "command center" metadata in `404.html` and `app-vNext/index.html` with "daily workspace"; do not touch routing, build output, auth, Firebase, or package files.
- [ ] Audit signed-in surfaces for visible "Start Free" and replace only app-surface instances with an operational label such as "Open EasyLife" or "Go to Today"; leave true public marketing CTAs alone.
- [ ] Inspect EasyList email approval copy for visible "sample" or "demo" language and replace only customer-facing labels with "example" or concrete email/task nouns.
- [ ] Review HQ and command/capture copy for "command center" or feature-inventory phrasing; keep one next action and one today-context sentence above secondary details.
- [ ] Check optional More/Future/Fun entries for playful language that buries clarity; keep labels concrete, short, and clearly optional.

## Stop Or Continue
continue but fix copy first