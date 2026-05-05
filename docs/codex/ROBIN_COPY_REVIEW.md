# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward a calm daily workspace voice, but some visible and metadata-adjacent language still sounds like a product build, a demo scaffold, or an automation promise instead of a trustworthy personal assistant.

## Mission Voice Fit
The best current language fits the mission when it uses concrete daily nouns: workspace, task list, daily plan, calendar block, capture, draft reply, and today. The weaker language still leans on internal framing like "command center", "demo", "proof", "sample", and "AI/backend" style explanation, which makes the product feel less personal and less settled. For EasyLife, the voice should help the user answer "What should I do next today?" before explaining systems, modules, or future intelligence.

## Delicate Wording Risks
- "command center" in public metadata still feels generic SaaS and too forceful for a calm personal assistant app.
- "demo" remains in source patterns and may be acceptable as a route/query concept, but it should not appear in customer-facing copy unless clearly framed as an example.
- "proof" in visible or near-visible naming can leak builder language; customer copy should not ask the user to evaluate proof of work.
- "sample data" and sample IDs are acceptable internally, but any rendered copy should say "example day", "example task", or "example email".
- "email-derived" is precise for builders but too technical for users; it should become "from email" or "found in email" when visible.
- "approval queue" is clear enough for internal product review, but in the app it may feel bureaucratic; "Review from email" or "Needs approval" is warmer and more concrete.
- "non-sending draft-reply entry point" is builder language; visible copy should say "Draft reply" and "Review before sending".
- "What am I forgetting" is a useful command, but it risks implying intelligence the app may not actually have unless the result is clearly based on visible tasks, notes, and calendar context.
- The review/task language still repeats "polish", "proof", "handoff", and "command center"; those are fine in internal docs only when describing review state, but they should be aggressively removed from app-facing strings.
- Login or public metadata that says EasyLife keeps many tools in one "command center" explains the product broadly but does not pass the first-screen test for a signed-in user.

## Beautiful Language Opportunities
- Replace system nouns with daily-life nouns: "workspace", "today", "task list", "calendar block", "note", "project brief", "workout log".
- Let command/capture copy sound practical and bounded: "Add a task", "Capture a note", "Plan today", "Review from email".
- Use certainty only for deterministic actions: "Draft saved for review" rather than "AI will handle it".
- Make email candidate language quieter and safer: "Found in email" with "Review before adding" nearby.
- Make the protected HQ voice more like a daily assistant: short next-action labels, compact context, fewer broad product claims.
- Keep public marketing copy more concrete: describe the module outcome, not the product architecture.
- Use "example" instead of "demo" or "sample" wherever a user can see it.
- Use "workspace" instead of "command center" for the overall product promise.

## Priority Rewrite
The single most important wording problem to fix next is any remaining customer-facing "command center", "demo", "proof", "sample data", "handoff", or "polish" language in `app-vNext/src`, especially public metadata, marketing routes, HQ, experiments, and email review surfaces. Nami should make one narrow copy pass that replaces only visible or near-visible user strings with concrete daily-workspace language, while leaving internal identifiers alone unless they render into the UI.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and follow-ups in one daily workspace."

- Before: "Approval queue"
  After: "Review from email"

- Before: "Email-derived candidates"
  After: "Found in email"

- Before: "Draft reply entry point"
  After: "Draft reply"

- Before: "No real send behavior"
  After: "You review before anything is sent"

- Before: "Sample data"
  After: "Example day"

- Before: "What am I forgetting?"
  After: "Check what needs attention"

- Before: "Proof surface"
  After: "Today preview"

## Voice Rules
- Lead with the user's next action, not the product system.
- Use concrete nouns: task list, note, calendar block, project brief, workout log, daily plan, email draft.
- Avoid builder words in visible UI: demo, proof, handoff, polish, workflow, sample data, command center.
- Keep first-screen copy short; detail belongs behind actions, rows, drawers, or module routes.
- Do not imply real AI, email automation, sending, or prediction unless the behavior is visible and deterministic.
- Say "review before sending" anywhere reply drafting could be mistaken for automatic email action.
- Use "example" for mock data visible to users.
- Keep public marketing warmer and app screens more direct.

## Next 5 Copy Tasks
- [ ] Replace the public metadata phrase "command center" with "daily workspace"; do not alter routes, auth, build files, or product claims.
- [ ] Audit `EasyListEmailPage.tsx` visible strings for "approval queue", "email-derived", "sample", and reply language; rewrite only rendered copy with clear review-before-action wording.
- [ ] Check `UniversalCapture.tsx` for command labels that imply AI certainty; keep commands deterministic and tied to visible tasks, notes, calendar, and capture.
- [ ] Review HQ first-screen copy for any broad product explanation; keep only one next action, today context, and compact module status above the fold.
- [ ] Search `app-vNext/src/features/marketing` for visible "demo", "proof", "handoff", and "polish"; replace one instance at a time with concrete product nouns and no new claims.

## Stop Or Continue
continue but fix copy first