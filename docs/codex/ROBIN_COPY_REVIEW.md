# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is closer to a calm personal workspace, but visible language still slips into product-builder phrasing and over-explains surfaces before the user's next action is clear.

## Mission Voice Fit
The best copy supports the mission: "Opening your workspace," "today," "workspace," "daily plan," and concrete module nouns fit a connected personal assistant suite. The weak spots are words like "command center," "demo," "proof," "polish," "handoff," "sample data," and "Start with," which make EasyLife sound like an internal build, a marketing prototype, or instructions to the builder instead of a trustworthy daily-use product.

## Delicate Wording Risks
- "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center." sounds like generic SaaS positioning and violates the operating-mode ban on command-center framing.
- "Start with" in visible auth copy can sound like builder instructions or onboarding filler unless the sentence names the actual action and outcome.
- "Nothing completed yet this week. Start with one small win." is warm but slightly generic and motivational; it should say what the user can do.
- "demo" and "visualQa" are acceptable in internal identifiers, but any visible "demo" language should be replaced with "example day," "preview," or "workspace."
- "proof" is acceptable as a class name, but visible proof/demo copy would feel salesy and internal.
- EasyProjects still needs scrutiny for "polish," "ship," and "Calendar handoff" because those phrases sound like product-building work, not a user's project plan.
- Settings still has a staging problem: too much visible explanatory copy and too many controls make the page read like an inventory instead of a control center.
- "pipeline work" may be too business-process-oriented for a personal assistant suite unless the product clearly serves that use case.

## Beautiful Language Opportunities
- Replace platform nouns with daily-life nouns: "daily plan," "task list," "calendar block," "project brief," "workout log," "note library," and "workspace."
- Let Settings speak in current state and next adjustment, not explanation: "Your setup," "Theme," "Apps shown," "Feedback."
- Public metadata should describe the product plainly without "command center."
- EasyProjects can become more human by naming real project moments: "Weekly planning review," "Finish project brief," "Calendar prep," "Next milestone."
- Empty states can be warmer by pairing a concrete condition with one action: "No completed workouts this week. Log today's session when you are ready."
- Marketing pages should let the product preview carry the detail; hero copy should stay short and concrete.

## Priority Rewrite
Fix the remaining "command center" and builder-process language in customer-facing surfaces first, especially metadata and EasyProjects sample copy. The next implementer should replace one visible internal phrase at a time with a concrete daily-life noun, without adding longer explanations or new product claims.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and daily planning in one calm workspace."

- Before: "Start with"
  After: "Open your workspace"

- Before: "Nothing completed yet this week. Start with one small win."
  After: "Nothing completed yet this week. Log one finished task when it is done."

- Before: "Calendar handoff"
  After: "Calendar prep"

- Before: "Ship polish"
  After: "Finish project brief"

- Before: "Sample data"
  After: "Example day"

- Before: "Proof"
  After: "Preview"

## Voice Rules
- Use concrete daily nouns before product nouns.
- Say what the user can do, not how the app was built.
- Keep first-screen copy short; detail belongs behind navigation, rows, panels, or controls.
- Avoid "command center," "proof," "handoff," "polish," "demo," "sample data," and "workflow" in visible copy.
- Do not make motivational claims when a plain task cue is better.
- Separate public marketing copy from working app copy: marketing may explain; app screens should direct action.
- Prefer "workspace," "daily plan," "task list," "calendar block," "project brief," "workout log," and "note library."

## Next 5 Copy Tasks
- [ ] Replace the visible "command center" meta description in app-facing HTML with a concrete "calm workspace" sentence; do not touch routing, config, auth, or package files.
- [ ] In EasyProjects visible sample/timeline copy, replace one "polish," "ship," or "Calendar handoff" phrase with a real user task noun; keep fields and behavior unchanged.
- [ ] Review Settings first-screen copy and remove one above-the-fold helper sentence that explains structure instead of helping the user adjust a setting; do not rename controls that affect meaning.
- [ ] Replace one visible "Start with" phrase with an action-specific label; avoid motivational filler.
- [ ] Search visible `app-vNext/src` strings for "demo," "proof," "handoff," and "sample data"; change only one customer-facing instance and leave internal identifiers alone.

## Stop Or Continue
continue but fix copy first