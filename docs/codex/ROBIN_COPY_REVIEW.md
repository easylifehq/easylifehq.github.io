# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is closer to a calm daily workspace, but some visible language still slips into platform, demo, and internal-build framing.

## Mission Voice Fit
The copy mostly fits the mission when it uses concrete daily nouns: tasks, notes, calendar planning, workouts, workspace, today, next move, capture, and review. The weaker fit appears where EasyLife calls itself a "command center" or leans on proof/demo/sample language; those phrases make the product feel like a pitch or test environment instead of a trustworthy personal assistant.

## Delicate Wording Risks
- "command center" in public meta copy is still too generic and SaaS-like for EasyLife. It promises breadth instead of a daily outcome.
- "proof" in `auth-proof-card` appears to be a class name, not necessarily visible copy, but this term should not become customer-facing.
- "demo" and "sample" appear mostly in internal/dev identifiers, route flags, and IDs. They are acceptable there, but risky if rendered visibly.
- "Inbox Intelligence" can sound like AI overreach unless the UI clearly shows approval, source, and user control.
- "Plan intensity modes" and "Coach" are acceptable if copy stays humble: suggested plan, lighter day, normal day, push day. Avoid guru or prediction language.
- Settings still appears vulnerable to too many stacked labels. Copy should not make the control center feel like an inventory.
- "More" is useful as navigation, but optional modules need plain grouping labels so it does not become a junk drawer.
- Any visible "sample data," "demo," "proof," "handoff," "polish," or "command center" wording should be treated as off-voice unless it is clearly developer-only.

## Beautiful Language Opportunities
- Replace broad suite claims with daily outcomes: "See what needs attention today" instead of describing every module.
- Make Today copy sharper: one next move, one reason it matters, one action.
- Use quiet assistant language for generated/local suggestions: "Suggested from your task list" or "Based on today's calendar."
- Make approval copy concrete: "Review before adding" is better than "approval workflow."
- Let Settings sound like control, not configuration: "Choose where EasyLife opens" is better than "Opening screen."
- For optional modules, use useful categories: "Planning," "People," "Projects," "Fun" rather than feature-heavy labels.
- Public meta descriptions should describe the product in one calm sentence, not a feature inventory.

## Priority Rewrite
Fix the remaining public-facing "command center" language in root and app meta descriptions. It is small, visible, and tone-setting: EasyLife should introduce itself as a calm daily workspace, not a generic control room for many modules.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar plans, workouts, and projects in one calm daily workspace."

- Before: "command center"
  After: "daily workspace"

- Before: "Inbox Intelligence"
  After: "Inbox review"

- Before: "AI daily brief"
  After: "Today brief"

- Before: "sample data"
  After: "example day"

- Before: "proof"
  After: "preview" or "example"

- Before: "Plan intensity"
  After: "Day pace"

## Voice Rules
- Lead with what the user can do today.
- Use concrete nouns: task list, calendar block, note, workout log, project brief, inbox item.
- Avoid platform fog: command center, workflow, proof, polish, handoff, automation.
- Keep first-screen labels short; save explanations for detail views.
- Treat AI-like surfaces as suggestions, drafts, or examples unless real deterministic behavior is visible.
- Separate public product copy from app copy. The app should use task labels, not sales language.
- Prefer "review before adding" over vague approval or intelligence claims.

## Next 5 Copy Tasks
- [ ] Replace the public meta description "command center" wording in root/app HTML with "one calm daily workspace"; do not add new claims or feature lists.
- [ ] Scan visible JSX strings for "demo," "proof," "sample data," "handoff," and "polish"; change only customer-facing text, not route params, IDs, class names, or docs.
- [ ] Rename any visible "Inbox Intelligence" label to "Inbox review" unless the screen clearly explains source, approval, and user control.
- [ ] Tighten one Today/HQ first-screen helper line to answer: what needs attention, why now, and what action is available.
- [ ] Review Settings first-screen labels and remove one repeated title or explanatory phrase while preserving all controls and behavior.

## Stop Or Continue
continue but fix copy first