# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is calmer and more concrete than before, but visible and near-visible copy still sometimes speaks like a product build or brochure instead of a trusted daily workspace.

## Mission Voice Fit
The mission asks for a connected, professional personal operating system that helps the user know what to do next without clutter. The best current language, such as "Opening your workspace" and the newer task, deadline, event, follow-up, draft reply labels, fits that promise well. The remaining weak spots are phrases like "command center," "demo," "proof," "sample," and brochure-style route framing, which make EasyLife sound more like a pitch or test environment than a personal assistant app. The copy should keep moving toward concrete daily nouns: today, task list, calendar block, note, workout log, school week, capacity, draft reply, and workspace.

## Delicate Wording Risks
- "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center." overstates the product posture and uses generic SaaS language. "Command center" is too corporate and broad for the calm personal assistant voice.
- Public and app-like surfaces still appear to use "Start Free" and "See Features" in places where the experience should feel like working software, not a sales page.
- "Proof" appears in `auth-proof-card`. If not visible, it is harmless as a class name, but it signals nearby copy should be checked for product-validation language.
- "Demo" appears in route/query support and may be internal, but any visible use of "demo" should be replaced with "example day," "preview," or "workspace" depending on context.
- "Sample" appears in EasyList email candidate ids. If ids are not visible, no issue; if any related label says "sample data," it should become "example inbox" or "example message."
- "Pipeline work" in public metadata feels vague and business-tool oriented. For this mission, "projects" or "follow-ups" is clearer.
- The repeated phase/review language around "proof," "handoff," "polish," and "workflow" should stay out of user-facing surfaces. These are builder words, not buyer or user words.
- Any copy that introduces school planner, inbox intelligence, or capacity signals must avoid implying real AI, prediction, email automation, or calendar/task persistence unless those behaviors are actually present.

## Beautiful Language Opportunities
- Replace "command center" with "daily workspace" or "one place for today's tasks, notes, plans, and follow-ups."
- Make the Today/HQ first screen sound less like a module index and more like a daily assistant: "Next move," "Today," "Open room," "Capture quickly," "Review calendar."
- Use "draft reply" and "requires approval" consistently wherever email-derived reply affordances appear.
- For capacity and coach language, use humble deterministic framing: "Capacity signal," "Based on today's tasks and workout plan," "Light," "Normal," "Push."
- For school planning, keep copy practical: "Heavy week," "Next assignment," "Study block," "Add as task," "Plan a calendar block."
- Marketing pages should use shorter, calmer product promises and let the preview carry the detail.
- Empty and low-content states can become warmer by naming the next action directly: "Add the first task," "Capture a note," "Plan one block."

## Priority Rewrite
The single most important wording problem is "command center" and adjacent brochure language in public metadata and app-like route framing. Replace it with concrete daily-workspace language everywhere it is visible or used in metadata, then check nearby copy for "demo," "proof," "sample data," "handoff," and "polish" so the product no longer sounds like an internal build.

## Suggested Rewrites
1. Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
   After: "EasyLife keeps tasks, notes, calendar plans, workouts, projects, and follow-ups in one daily workspace."

2. Before: "Start Free"
   After: "Open EasyLife"

3. Before: "See Features"
   After: "See how it works"

4. Before: "sample data"
   After: "example day"

5. Before: "demo"
   After: "preview" or "example"

6. Before: "proof"
   After: "preview" or "example"

7. Before: "Plan intensity modes"
   After: "Choose today's pace"

8. Before: "Fitness coach connection"
   After: "Connect workouts to today"

## Voice Rules
- Lead with what the user can do today, not what the product contains.
- Prefer concrete nouns: task list, calendar block, note, workout log, school week, draft reply, workspace.
- Avoid builder words in visible copy: proof, handoff, polish, workflow, demo, sample data, command center.
- Keep primary labels short: Today, Tasks, Calendar, Notes, Coach, Inbox, More.
- Use secondary text only to clarify the action or outcome.
- Never imply real AI, email automation, predictions, or persistence unless the feature truly does it.
- For computed capacity or intensity language, show humility: "based on," "signal," "today," "suggested," not certainty.
- Separate marketing copy from app copy. Public pages may explain; protected app surfaces should help the user act.

## Next 5 Copy Tasks
- [ ] Replace visible "command center" in public metadata or UI strings with "daily workspace"; do not change routes, behavior, or product claims.
- [ ] Search visible `app-vNext/src` copy for "demo," "proof," and "sample data"; replace only customer-facing instances with "preview," "example," or "example day."
- [ ] Review HQ/Today copy and ensure the first screen names one next move, one today context, and one capture action without feature-inventory language.
- [ ] Review EasyList email approval copy and confirm every candidate action says task, deadline, event, follow-up, keep visible, or draft reply, with approval language for replies.
- [ ] Review Phase 7 capacity and intensity copy so Light, Normal, and Push read as user-selected plan modes, not predictive advice or AI certainty.

## Stop Or Continue
continue but fix copy first