# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward a calmer daily workspace, but visible copy still slips into product-brochure and builder-language habits before the user's next action is fully concrete.

## Mission Voice Fit
The strongest language fits the mission when it names daily actions plainly: task list, recent notes, daily plan, workout log, calendar block, capture, review, and next move. That voice supports a connected personal assistant product. The weaker language still frames EasyLife as a "command center", "demo", "proof", or feature showcase, which sounds more like the product explaining itself than helping the signed-in user decide what to do today.

## Delicate Wording Risks
- "command center" remains in public metadata copy. It is too generic-SaaS for EasyLife and conflicts with the calmer personal assistant direction.
- "Start Free" and "See Features" on app-like module pages blur marketing copy with working-app copy. They ask the user to evaluate the product instead of act inside it.
- "proof", "demo", and "sample" appear in source hits. Some are harmless internal identifiers, but any visible use should be treated as builder language.
- Repeated feature/hero language risks making each module feel like a brochure template rather than a specific daily tool.
- "personal operating system" works as internal mission language but is too abstract for frequent customer-facing UI.
- Any visible "handoff", "polish", "workflow", or "ready" phrasing should be checked carefully; these words often describe internal production work instead of user outcomes.
- The phrase "Opening your workspace" is clear and acceptable, but use it sparingly so "workspace" does not become another vague value prop.

## Beautiful Language Opportunities
- Replace broad product framing with direct daily-life nouns: "Today", "Task list", "Calendar block", "Recent notes", "Workout plan", "Project brief", "Inbox review".
- Make module first screens sound like usable tools: "Capture a note", "Plan today", "Review due work", "Log workout", "Choose the next task".
- Let public pages promise less and show more: one concrete use case per module is stronger than repeated feature language.
- Use short labels for primary actions and reserve explanatory copy for lower panels or detail states.
- On protected screens, lead with the user's next move, then add context. Avoid making the first screen explain the suite.

## Priority Rewrite
Fix the remaining customer-facing "command center", "demo", "proof", and generic feature language before more polish work. Nami should prioritize one visible source pass that replaces these with concrete daily-workspace wording, while leaving internal identifiers alone and avoiding broad rewrites.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, and projects in one calm daily workspace."
- Before: "Start Free"
  After: "Open workspace"
- Before: "See Features"
  After: "See how it works"
- Before: "AI command center"
  After: "Daily plan helper"
- Before: "sample data"
  After: "example day"
- Before: "proof"
  After: "preview"
- Before: "handoff"
  After: "calendar prep"
- Before: "polish"
  After: "cleanup"

## Voice Rules
- Lead with the user's next action, not the product category.
- Use concrete nouns before abstract nouns.
- Keep protected app labels short: "Capture", "Review", "Plan", "Log", "Open", "Add".
- Keep marketing copy separate from app copy.
- Do not use "command center", "personal operating system", "proof", "demo", "sample data", "handoff", or "polish" in visible customer-facing copy unless there is a specific user-facing reason.
- Do not invent AI, automation, backend, prediction, or productivity claims.
- First-screen copy should answer: who is this for, what should they do, and what do they get?

## Next 5 Copy Tasks
- [ ] Replace the visible public metadata phrase "command center" with "daily workspace" or another concrete daily-life phrase; do not edit deployment output or root generated files unless explicitly approved.
- [ ] Inspect one module page for "Start Free" and "See Features"; replace only visible app-like CTAs with direct action labels, preserving routes and behavior.
- [ ] Search visible `app-vNext/src` strings for "demo", "proof", "sample data", "handoff", and "polish"; change one visible instance only and leave internal identifiers untouched.
- [ ] Review EasyNotes and EasyList first-screen copy for action clarity; make one label describe the user's next move rather than the product feature.
- [ ] Audit the latest HQ/Today copy for abstract suite language; replace one vague phrase with a concrete task, note, calendar, or workout noun.

## Stop Or Continue
continue but fix copy first