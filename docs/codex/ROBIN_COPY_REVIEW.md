# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward a calmer daily assistant voice, but public and app copy still slips into brochure, builder, and internal QA language.

## Mission Voice Fit
The best language fits the mission when it says what the user can do next: add a task, capture a note, review today, approve an email item, plan study time. The weaker language still frames EasyLife as a "command center", a "demo", or a proof surface, which makes the product feel less like a trusted personal workspace and more like something being presented for review.

## Delicate Wording Risks
- "command center" remains in public meta copy. It is generic SaaS language and does not match the calmer personal assistant direction.
- "Start Free" and "See Features" on working or module-like routes make the surface feel like a marketing page instead of a tool the user can use.
- "demo", "proof", and "sample" appear in source hints. Some are internal identifiers, but any visible instance should be removed or replaced with "example day", "workspace", "preview", or a concrete task noun.
- "AI", "what am I forgetting", and inbox intelligence language need restraint. If the system is deterministic or mock/local, copy must not imply real prediction, surveillance, or external email automation.
- School planner copy should avoid implying persistence or calendar/task conversion until the affordance is visibly approval-based and non-committal.
- "draft reply" is acceptable only if paired with approval language. It should never sound like EasyLife sends or acts without the user.
- Repeated module identity and feature labels still risk sounding like product positioning instead of daily use.

## Beautiful Language Opportunities
- Replace "command center" with "daily workspace" or "today workspace" wherever it is public-facing.
- Make the first screen speak in action language: "Review today", "Capture a thought", "Approve inbox items", "Plan study time".
- Use quieter labels for mock/local examples: "Example day", "Suggested focus", "Draft only", "Needs approval".
- Let module copy sound connected: tasks become "next actions", calendar becomes "today's blocks", notes become "recent thoughts", school becomes "study load".
- Use compact status language instead of feature explanations: "2 due today", "1 draft waiting", "Heavy study day", "Open room after 3 PM".
- Keep public product copy simple and specific before any feature list.

## Priority Rewrite
The most important wording problem is the remaining marketing/build framing around working surfaces. Nami should remove or demote visible phrases like "command center", "demo", "proof", "sample data", "Start Free", and "See Features" from signed-in or product-demo routes, replacing them with concrete daily-workspace actions and approval-safe labels.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar plans, workouts, projects, and follow-ups in one daily workspace."

- Before: "Start Free"
  After: "Open EasyLife"

- Before: "See Features"
  After: "See how it works"

- Before: "sample data"
  After: "example day"

- Before: "proof"
  After: "workspace preview"

- Before: "draft reply"
  After: "Draft reply for approval"

- Before: "What am I forgetting"
  After: "Review open items"

## Voice Rules
- Lead with what the user can do today.
- Use concrete nouns: task list, note, calendar block, study load, draft reply, inbox item, workout log.
- Keep first-screen labels short and functional.
- Keep public marketing copy separate from signed-in app copy.
- Do not use builder words in visible UI: demo, proof, handoff, polish, sample data, workflow.
- Do not imply real AI, email automation, sending, persistence, or prediction unless the feature visibly does that.
- Pair every risky action with approval language: "review", "draft", "approve", "add when ready".

## Next 5 Copy Tasks
- [ ] Replace public-facing "command center" meta copy with "daily workspace"; guardrail: copy-only, no route or config behavior changes.
- [ ] Audit signed-in and product-demo routes for visible "Start Free" and "See Features"; guardrail: remove only where the surface is already a working app or app preview.
- [ ] Review EasyList email copy for "sample", "draft reply", and approval language; guardrail: preserve non-sending behavior and make approval explicit.
- [ ] Review Phase 6 school planner labels for persistence-safe wording; guardrail: use "suggest", "review", or "add when ready" instead of implying automatic calendar/task creation.
- [ ] Replace one remaining visible builder word such as "demo", "proof", "polish", or "handoff" with a concrete daily-life noun; guardrail: one narrow source area only.

## Stop Or Continue
continue but fix copy first