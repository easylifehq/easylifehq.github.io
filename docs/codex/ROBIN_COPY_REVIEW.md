# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward calmer daily-assistant language, but visible and near-visible copy still slips into product-builder terms, brochure rhythm, and vague suite claims before the user's next action is fully clear.

## Mission Voice Fit
The best current language fits the mission when it says "workspace", "today", "next move", "capture", "calendar block", "task list", and "daily plan." Those words support a connected personal operating system without sounding inflated. The weaker fit appears where EasyLife still calls itself a "command center" or relies on proof/demo/polish language; that sounds like an internal product review or SaaS pitch instead of a calm personal workspace for a signed-in user.

## Delicate Wording Risks
- "command center" appears in `404.html` and `app-vNext/index.html` metadata. It is not the right product promise for EasyLife now; it sounds generic, corporate, and more like a control room than a personal assistant.
- "auth-proof-card" in `LoginPage.tsx` appears to be a class name, not visible copy, but "proof" remains a smoke-test term worth avoiding in customer-facing labels.
- "demo" appears in visual QA and context logic. If any version reaches visible UI, it should become "example", "preview", or "workspace" depending on context.
- "sample" IDs in EasyList email examples look internal, but visible email examples should not say "sample data." Use "example inbox", "example thread", or concrete message labels.
- Repeated brochure patterns still risk making the product sound explained instead of used: big claim, CTA, tags, preview, features.
- Broad claims like "one command center" overpromise the product shape and flatten the more human promise: one place to see what matters today.
- Any first-screen copy that explains the suite as a whole before naming the next action is a staging failure for this mode.

## Beautiful Language Opportunities
- Replace "command center" with "daily workspace" or "one place for today's work."
- Let Today/HQ copy speak in verbs: "Start with this", "Capture a thought", "Review today's plan", "Open the next task."
- Make command/capture language feel deterministic and humble: "Try a quick capture", "Turn a thought into a task", "Add a calendar block."
- Shorten module labels so they read like working tools, not product tours: "Tasks", "Calendar", "Notes", "Coach", "Inbox", "More."
- Use secondary copy to explain outcomes only after the primary action is visible.
- Make public marketing copy show concrete daily use instead of feature inventory: task list, note draft, calendar block, workout log, project brief.

## Priority Rewrite
Fix the remaining "command center" product promise in public metadata and any visible equivalent. The phrase now fights the mission: EasyLife should feel like a calm personal daily workspace, not a control-room dashboard. Nami should replace it with a concrete, user-centered line that names the daily objects EasyLife organizes without implying backend intelligence or a heavy command system.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar plans, workouts, and projects in one daily workspace."

- Before: "Command palette"
  After: "Quick actions"

- Before: "What am I forgetting"
  After: "Check today's loose ends"

- Before: "Plan my day"
  After: "Review today's plan"

- Before: "Capture note"
  After: "Save a note"

- Before: "sample data"
  After: "example day"

- Before: "proof"
  After: "preview" or "working example"

- Before: "polish"
  After: "cleanup" for internal docs, or remove from visible app copy.

## Voice Rules
- Lead with the user's next action, not the product concept.
- Use concrete nouns: task list, note, calendar block, project brief, workout log, daily plan.
- Avoid "command center", "proof", "demo", "sample data", "handoff", "polish", "workflow", and "high-tech" in visible copy.
- Keep primary labels short enough for mobile: 1 to 3 words where possible.
- Put explanation behind action, not before it.
- Do not imply AI, prediction, automation, or backend intelligence unless the visible feature is deterministic and present.
- Public pages may explain the product; protected app screens should sound like tools in use.

## Next 5 Copy Tasks
- [ ] Replace the public metadata phrase "one command center" with a calmer daily-workspace promise; guardrail: metadata copy only, no routing or auth files.
- [ ] Search visible JSX strings for "demo", "proof", "polish", "handoff", "sample data", and "command center"; guardrail: change only one visible phrase per task and ignore internal identifiers.
- [ ] Review HQ/Today first-screen labels and shorten any helper line that explains the suite before naming the next action; guardrail: no new claims or added feature text.
- [ ] Review UniversalCapture visible labels for deterministic action language; guardrail: use "Add", "Save", "Review", or "Capture" instead of AI-like promise words.
- [ ] Review marketing hero support tags for repeated brochure language; guardrail: demote or shorten one tag row without changing the product promise.

## Stop Or Continue
continue but fix copy first