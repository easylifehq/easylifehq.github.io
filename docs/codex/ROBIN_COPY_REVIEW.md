# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward a calmer daily workspace voice, but some visible and near-visible language still sounds like product scaffolding, brochure framing, or internal fleet vocabulary.

## Mission Voice Fit
The best copy fits the mission when it uses plain daily-life nouns: workspace, today, tasks, notes, calendar, workout log, settings, plan, and capture. That language supports a professional personal assistant product. The weaker spots are phrases like "command center", "demo", "proof", "sample", and broad product-positioning language that makes EasyLife sound like a pitch or build artifact instead of a useful signed-in daily surface.

## Delicate Wording Risks
- "command center" in public metadata overstates the product and feels generic SaaS rather than calm personal assistant.
- "demo" remains in query and visual QA plumbing; likely acceptable internally, but any visible use should become "example day", "preview", or "workspace".
- "sample" IDs in the email page may be harmless identifiers, but if rendered anywhere, "sample" should become "example" or a concrete item label.
- "auth-proof-card" is an internal class name, but "proof" should not appear in visible auth copy because it sounds like a sales artifact.
- "Features" framing from the Simon review remains a staging risk: it turns module pages into brochures instead of working app surfaces.
- Any remaining "polish", "handoff", "workflow", "manager-ready", or "ready for service" style wording should be removed from customer-facing app copy unless the reader and outcome are concrete.
- The review docs themselves contain garbled characters in the checkpoint review excerpt, which is not product UI but weakens trust in fleet review packets.

## Beautiful Language Opportunities
- Replace product-positioning labels with direct user jobs: "Plan today", "Capture a note", "Review tasks", "Open calendar", "Check workout".
- Make Today copy shorter and more concrete: one next move, one reason, one action.
- Theme copy can feel more premium by describing mood and readability, not personality claims.
- Optional modules should use calm category labels like "Plan", "Track", "Review", and "Explore" rather than power-user language.
- Marketing pages should lead with the product name and one useful outcome, then let the preview carry the proof through visible working state.
- Email approval copy can be warmer and safer by emphasizing "review before adding" and "draft only" instead of intelligence or automation.

## Priority Rewrite
Fix any remaining visible "command center", "demo", "proof", "sample data", "handoff", and "polish" language in `app-vNext/src` when it appears in rendered strings, metadata, or user-visible examples. The next pass should be narrow: replace one internal/process phrase at a time with concrete daily-workspace nouns, without adding claims or length.

## Suggested Rewrites
- Before: "one command center"
  After: "one calm workspace"
- Before: "See Features"
  After: "See how it works"
- Before: "demo"
  After: "example day"
- Before: "sample data"
  After: "example items"
- Before: "proof"
  After: "preview"
- Before: "Calendar handoff"
  After: "Calendar prep"
- Before: "polish the plan"
  After: "clean up the plan"
- Before: "command center"
  After: "daily start"

## Voice Rules
- Use concrete daily nouns before product nouns.
- Keep first-screen copy short: next move, today context, action.
- Avoid builder words in customer-facing copy: demo, proof, handoff, polish, workflow, sample data.
- Do not promise intelligence, automation, or certainty unless the behavior is visible and deterministic.
- Separate marketing copy from app copy; the working app should use task labels, not sales language.
- Prefer "review", "draft", "add", "open", "capture", and "plan" over abstract verbs like "manage", "optimize", or "streamline".
- Let previews show usefulness; do not explain every module above the fold.

## Next 5 Copy Tasks
- [ ] Replace one visible "command center" phrase in app or public metadata with "daily workspace" or "calm workspace"; do not change routing, auth, config, or behavior.
- [ ] Audit `EasyListEmailPage.tsx` for rendered "sample" language and change only visible instances to "example"; leave internal IDs alone.
- [ ] Review Settings theme labels for clarity and rewrite one unclear mood label or helper line without adding feature claims.
- [ ] Compress one module page CTA or section label that says "Features" into a task-specific phrase; keep the same section count and behavior.
- [ ] Search rendered strings in `app-vNext/src` for "proof", "handoff", and "polish"; replace one visible instance with a concrete daily-life noun.

## Stop Or Continue
continue but fix copy first