# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is calmer and more concrete than before, but visible copy still slips into builder language, AI promise language, and module-brochure staging.

## Mission Voice Fit
The strongest language fits the mission: "Choose today's next move," "Start here," "Capture anything," "Today summary," "Open room," and "Drafts only until you approve" all support a calm personal workspace. The weaker language appears when EasyLife explains itself like an internal product review or prototype: "Demo Path," "Show this first," "Presentation flow," "workflow," "proof," "handoff," and broad AI helper copy. The product position should be practical daily assistance, not a pitch deck or build log.

## Delicate Wording Risks
- "Demo Path" and "Show this first" sound like instructions to the builder or presenter, not useful copy for a buyer or signed-in user.
- "Presentation flow" is internal staging language. A user does not know what to do with it.
- "Draft handoff to EasyList" and "EasyList handoff" still feel process-heavy and vague. Use concrete nouns like "task draft" or "action lines."
- "Workflow" appears in marketing navigation and product copy. It is not always wrong, but as a standalone section label it reads generic and less personal than "Plan," "Steps," "Review," or "Daily path."
- "AI workspace lab," "Try a safe AI command," and "AI can review, suggest, draft" risk overpromising if these are mock, experimental, or gated surfaces. Keep AI copy visibly review-first and scoped.
- "Project Planner AI" is too product-feature-like without explaining what the user gets or controls.
- "Home-screen PWA link," "TestFlight later," "Store metadata," "Rollback plan," and "Capacitor iOS and Android projects" are owner/build/distribution language. They should stay out of ordinary customer-facing Settings unless this is explicitly an admin/developer panel.
- "proof" in visible marketing copy still sounds like internal validation language, not a customer benefit.
- "sample" IDs appear mostly internal, but "example email" is visible and should be staged carefully so it does not make the Inbox surface feel fake.

## Beautiful Language Opportunities
- The Today/HQ surface can become more elegant by using fewer explanatory sentences and more crisp daily nouns: "Next move," "Today," "Open room," "Due work," "Capture."
- Marketing sections can shift from "Features" and "How It Works" toward simpler buyer paths like "What it helps with" and "How the day starts."
- AI copy can feel more trustworthy if every sentence names review, draft state, and user approval near the action.
- Settings copy can become clearer by separating user controls from product-owner distribution/admin language.
- The school planner copy is concrete and useful; keep that plain style for other optional modules.
- Replace "workspace" where repeated with more specific nouns when possible: "task list," "note library," "calendar day," "workout log," "project brief."

## Priority Rewrite
Fix the customer-facing builder language in marketing and HQ deeper sections first, especially "Demo Path," "Show this first," and "Presentation flow." These phrases break the product illusion because they describe how to present EasyLife instead of what the user should do. Nami should make one copy-only pass that renames these sections into user-facing, action-based labels without adding claims or expanding the page.

## Suggested Rewrites
- Before: "Demo Path"
  After: "A Simple First Day"

- Before: "Show this first"
  After: "Start with these moments"

- Before: "Use these moments to explain the product without wandering through every setting."
  After: "Begin with the few places that make the day easier to understand."

- Before: "Presentation flow"
  After: "Daily path"

- Before: "Draft handoff to EasyList"
  After: "Task draft for EasyList"

- Before: "Try a safe AI command"
  After: "Try a review-first helper"

- Before: "Set what AI can review, suggest, draft, and never do automatically."
  After: "Choose which helper suggestions stay available, and require review before anything changes."

- Before: "Keep visible proof of what got done"
  After: "Keep completed work visible"

## Voice Rules
- Lead with what the user can do today, not what the product demonstrates.
- Use concrete daily nouns: task list, calendar block, note, project brief, workout log, draft reply.
- Avoid builder words in visible UI: demo, proof, handoff, polish, presentation, workflow, sample data.
- Keep AI language modest: draft, suggest, review, approval, manual send, reversible.
- Do not imply automation unless the action is real, visible, and user-approved.
- Use "workspace" sparingly; prefer the specific place or object when the sentence allows it.
- First-screen copy should be short enough to scan in one breath.
- Optional modules should sound available, not equal to the main daily path.

## Next 5 Copy Tasks
- [ ] Rename "Demo Path," "Show this first," and its helper sentence in `ProductMarketingPage.tsx`; keep the section customer-facing and do not add new claims.
- [ ] Replace visible "handoff" language in EasyNotes marketing with "task draft" or "action lines"; keep meaning and preview structure unchanged.
- [ ] Audit visible "proof" copy in marketing routes and replace it with concrete completion or review language; ignore class names and internal identifiers.
- [ ] Tighten Settings AI descriptions so every AI-related control mentions draft, review, or approval near the action; do not imply automatic saves, sends, deletes, or scheduling.
- [ ] Separate owner/distribution language in Settings from ordinary user controls; keep technical terms only where the section is clearly for app distribution or admin review.

## Stop Or Continue
continue but fix copy first