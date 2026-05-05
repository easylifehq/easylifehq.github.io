# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward calm daily-assistant language, but visible copy still occasionally slips into builder, brochure, and internal proof wording.

## Mission Voice Fit
The mission asks for a connected, professional personal operating system that helps a signed-in user know what to do next today. The newer direction fits when it says "workspace", "daily plan", "task list", "capture", "calendar", "notes", and "workout log." It weakens when the product talks like a demo, proof packet, command center, or feature inventory. EasyLife should sound like a practical daily companion, not like a team explaining a product build.

## Delicate Wording Risks
- "command center" appears in app metadata and past copy samples. It is too generic SaaS and too militarized for the calm personal-assistant promise.
- "demo" remains in dev/QA query handling and may be harmless internally, but any visible instance should become "example day", "preview", or "workspace" depending on context.
- "proof" appears in `auth-proof-card`; the class name is probably internal, but visible proof language should be avoided because it sounds like sales validation rather than user value.
- "sample" appears in EasyList email IDs. Internal IDs are fine, but visible "sample data" should become "example email", "example message", or "example follow-up."
- "CommandCenterPage" and related command-center naming may be internal, but user-facing labels should not say "Command Center." Prefer "Today", "Daily plan", or "Quick actions."
- "More" can work as a navigation label, but optional modules inside it must not read like a product catalog. They need concrete names and short outcomes.
- "Future Plans dock" risks sounding like a builder placeholder if exposed directly. User-facing copy should say "Later plans" or "Ideas to revisit."
- "Fun/Drinks entry" risks tonal wobble. If visible, it should feel optional and grounded, such as "Fun plans" or "Drinks list", not like a joke module.
- "AI Lab", "mock", "sample", and "prototype" language should stay behind experiments/internal views. Working app copy should describe deterministic actions and approvals.

## Beautiful Language Opportunities
- Replace broad suite claims with daily-life nouns: "today", "next move", "task list", "note", "calendar block", "workout log", "follow-up", "draft reply."
- Let HQ sound like a start surface: short labels such as "Today", "Next move", "Capture", "Later", and "Review" are stronger than explanatory headings.
- Make Inbox Intelligence language trust-building by naming approval states clearly: "Review first", "Draft only", "Add to tasks", "Keep visible."
- School planner copy can become warmer and more useful with "This week", "Study load", "Next exam", and "Make a study block."
- Capacity and coach copy should stay humble: "lighter day", "normal plan", "push day" is better than implying prediction or optimization.
- Notes and memory copy should avoid mystique. "Recent notes", "Needs review", and "Turn into task" are clear and credible.

## Priority Rewrite
Fix remaining customer-facing builder/process words before adding any Phase 9 surface. The most important pass is to search visible app strings for "command center", "demo", "proof", "polish", "handoff", "sample data", "AI Lab", "mock", and "prototype", then replace only visible instances with concrete daily-workspace language. Do not rename internal identifiers unless they leak into the UI.

## Suggested Rewrites
- Before: "command center"
  After: "Today workspace"
- Before: "sample data"
  After: "example day"
- Before: "proof"
  After: "preview"
- Before: "Calendar handoff"
  After: "Calendar prep"
- Before: "Future Plans dock"
  After: "Later plans"
- Before: "Fun/Drinks entry"
  After: "Fun plans"
- Before: "AI daily brief"
  After: "Today brief"
- Before: "mock responses"
  After: "example suggestions"

## Voice Rules
- Use concrete daily nouns before product nouns.
- Keep first-screen labels short: "Today", "Next move", "Capture", "Review", "Later."
- Do not explain the whole system above the fold.
- Separate public product copy from working app copy.
- Keep experiments clearly non-production without putting "mock", "demo", or "prototype" in normal app surfaces.
- Prefer "review", "approve", and "draft" for email-related actions; never imply automatic sending.
- Avoid generic SaaS phrases: "command center", "workflow", "solution", "proof", "handoff", "polish."
- Write to the user doing the task, not to the builder shipping the feature.

## Next 5 Copy Tasks
- [ ] Search visible app strings for "command center" and replace customer-facing uses with "Today", "Daily plan", or "workspace"; leave internal file names alone.
- [ ] Review Phase 9 Future Plans copy and ensure the visible label is "Later plans" or similarly plain; do not expose "dock" as a user-facing noun.
- [ ] Review optional Fun/Drinks copy and make it grounded and optional; avoid joke tone, fake claims, or anything that competes with core daily modules.
- [ ] Audit Inbox approval language for clear consent verbs: "review", "approve", "draft", "add"; do not imply automatic email actions.
- [ ] Check EasyNotes and HQ first-screen copy for feature-inventory language; keep only the next action, today context, and compact status above secondary detail.

## Stop Or Continue
continue but fix copy first