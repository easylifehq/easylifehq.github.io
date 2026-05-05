# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is getting calmer and more concrete, but visible copy still slips into builder language, AI promise language, and broad workspace framing before the daily user action is fully clear.

## Mission Voice Fit
The best current language fits the mission well: "Capture anything", "Plan my day", "Opening your workspace", and the Today/HQ next-move framing feel useful, personal, and direct. The weaker copy still sounds like a product team narrating the system: "command center", "workflow", "demo", "proof", "handoff", "AI workspace lab", and "Start with..." pull EasyLife back toward an internal build or marketing tour instead of a calm daily assistant.

## Delicate Wording Risks
- "command center" in `404.html` and `app-vNext/index.html` is broad SaaS language and conflicts with the softer personal workspace direction.
- "AI cockpit" in app navigation sounds overblown and less trustworthy than a concrete module label.
- "Workflow" as a marketing nav label is generic and does not tell the buyer what they get.
- "Start Free" remains prominent on product pages; if these routes are being used as product proof for the signed-in experience, it reads like marketing chrome instead of app copy.
- "EasyNotes" copy still includes "Draft handoff to EasyList", "EasyList handoff", and "Capture, refine, then hand off"; "handoff" is internal process language, not user benefit.
- "AI workspace lab" and "A frontend-only sandbox..." are clear internally, but customer-facing experiments should avoid builder framing unless the page is explicitly a developer lab.
- "Ready to review a safe sample scan" and "Scan sample inbox" sound like demo scaffolding. If visible to users, use "example inbox" or "review example messages."
- "Start with today's workspace" is close, but "Start with X" can sound like instructions to the builder unless paired with a concrete user action.
- "The assistant can help organize work..." and similar Settings AI copy risks promising capability without showing exactly what is computed, drafted, or reviewed.
- "AI Analyze Into Rows" is awkward and mechanical. It should be a user action, not an implementation label.

## Beautiful Language Opportunities
- Replace "command center" with "daily workspace" or "one calm workspace" wherever it is public-facing.
- Turn generic "workflow" labels into concrete nouns: "Daily plan", "Task list", "Calendar prep", "Project brief", "Inbox review."
- Make AI language humbler and more review-based: "Draft suggestions", "Review before saving", "Example output", "Manual fallback."
- Keep the HQ first screen in verbs and nouns: "Plan today", "Capture a thought", "Review next task", "Open calendar block."
- Let marketing pages use product promise sparingly, then move quickly to functional previews.
- Make experiments copy clearly separate from production app copy: "Example command" is safer than "AI command" when the behavior is mock or preview-only.

## Priority Rewrite
Fix the remaining customer-facing builder/process words next, especially "command center", "workflow", "handoff", "proof", "demo", and "sample" where they appear in visible strings or metadata. The next Nami task should be a narrow copy-only pass over marketing, HQ, EasyNotes, EasyList Email, and experiment labels, replacing one phrase at a time with concrete daily-life nouns without adding new claims or longer explanations.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and follow-ups in one calm workspace."

- Before: "Draft handoff to EasyList"
  After: "Action lines for EasyList"

- Before: "Capture, refine, then hand off"
  After: "Capture, clean up, then turn into action"

- Before: "Workflow"
  After: "Daily plan"

- Before: "AI cockpit"
  After: "Assistant tools"

- Before: "AI workspace lab"
  After: "Assistant preview"

- Before: "Scan sample inbox"
  After: "Review example inbox"

- Before: "AI Analyze Into Rows"
  After: "Create editable task rows"

## Voice Rules
- Use concrete daily-life nouns before product abstractions: task list, calendar block, note, project brief, workout log, inbox review.
- Avoid builder words in visible copy: demo, proof, handoff, polish, workflow, artifact, command center.
- Keep first-screen copy short: one next action, today context, then compact status.
- Treat AI as draft, review, or example output unless real connected behavior is visible and reversible.
- Separate marketing promise from app action. Public pages may explain; signed-in app screens should tell the user what to do next.
- Prefer verbs that match the actual UI: capture, review, plan, open, add, log, draft.
- Do not make the app sound more certain than it is. Use "suggest", "draft", "example", and "review before saving" where appropriate.

## Next 5 Copy Tasks
- [ ] Replace public "command center" metadata with "calm workspace"; guardrail: metadata/copy only, no app logic or config behavior changes.
- [ ] Rename one visible "Workflow" marketing nav or section label to a concrete user noun; guardrail: preserve anchors and routing behavior.
- [ ] Replace EasyNotes "handoff" phrases with action-oriented note/task language; guardrail: copy only, no data or conversion behavior changes.
- [ ] Soften one visible AI label from capability claim to review-first draft language; guardrail: do not add new AI promises or implementation details.
- [ ] Replace one visible "sample" or "demo" inbox/action phrase with "example" language; guardrail: keep mock/demo behavior unchanged.

## Stop Or Continue
continue but fix copy first