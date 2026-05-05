# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward a calmer daily-assistant voice, but visible copy still mixes user-facing clarity with internal product words and feature-demo language.

## Mission Voice Fit
The best current language fits the mission when it says "workspace," "today," "daily plan," "capture," "task," "note," "calendar," and "draft reply." Those words help EasyLife feel like a connected personal suite. The weaker language still frames the product as a build artifact or brochure, especially "command center," "demo," "proof," "sample," "polish," and overly broad operating-system claims. For this audience, the voice should be concrete, quiet, and immediately useful: what should I do today, where do I put this, and what happens next?

## Delicate Wording Risks
- "command center" appears in public meta copy and still sounds generic SaaS/military rather than personal, calm, or useful.
- "personal operating system" works in internal mission language, but should be rare or absent in visible app copy because it overclaims and feels abstract.
- "demo" and "sample data" are acceptable as internal route/test language, but not as visible product language; they make the app feel temporary.
- "proof" in visible-adjacent naming like `auth-proof-card` may be internal class language, but if rendered anywhere it sounds salesy and defensive.
- "polish" and "handoff" should remain internal task language only; they are not buyer/user outcomes.
- The Phase 5 email language is close, but "draft reply" must always make approval explicit so it never implies sending or automation.
- School planner copy should avoid implying academic advice or prediction; use "suggested focus" only when it is clearly based on shown assignments/exams, not hidden intelligence.
- "What am I forgetting" is useful and human, but it should be staged as a review prompt, not a promise that EasyLife knows everything.

## Beautiful Language Opportunities
- Replace broad suite claims with concrete daily nouns: "today's plan," "task list," "calendar block," "recent note," "study load," "draft reply."
- Use quieter approval language for email-derived items: "Review before adding," "Needs your approval," "Keep as reference."
- Make school planning feel practical and grounded: "Heavy week," "Next exam," "Assignment due," "Study block," "Focus next."
- Let HQ copy read like a morning start surface: "Start with this," "Today needs," "Capture something," "Open room."
- On public/product pages, reduce repeated feature explanations and let one functional preview carry the product story.
- In Settings, favor direct control labels over explanations: "Theme," "Visible apps," "Notifications," "Account."

## Priority Rewrite
The single most important wording problem is removing remaining internal/product-build language from visible or meta-visible surfaces. Nami should target one narrow pass through `app-vNext/src` and app/public HTML metadata for "command center," "demo," "sample data," "proof," "polish," and "handoff," replacing only user-facing instances with concrete daily-workspace language while leaving internal identifiers and dev-only route flags untouched.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and follow-ups in one daily workspace."
- Before: "AI Command Center"
  After: "Quick actions"
- Before: "sample data"
  After: "example day"
- Before: "draft reply"
  After: "Draft reply for review"
- Before: "What am I forgetting"
  After: "Review loose ends"
- Before: "Study load view"
  After: "Heavy week view"
- Before: "School-to-calendar/task affordance"
  After: "Add to task list or calendar"
- Before: "proof surface"
  After: "working preview"

## Voice Rules
- Use concrete nouns before abstract product language: task list, note, calendar block, study plan, draft reply, workout log.
- Keep first-screen copy short; it should name the next action, not explain the system.
- Do not use builder words in visible copy: demo, proof, polish, handoff, workflow, artifact, sample data.
- Use approval language around email and reply surfaces: "review," "approve," "draft," "add," never implied sending.
- For school planning, describe shown inputs and recalculated suggestions; do not imply prediction or academic authority.
- Keep public marketing warmer than app labels, but keep the working app direct and task-shaped.
- Avoid grand claims unless the screen visibly proves them with a specific daily action.

## Next 5 Copy Tasks
- [ ] Replace the public/meta "command center" description with "daily workspace" language; do not touch package files, auth, routing, or generated output.
- [ ] Review `EasyListEmailPage.tsx` for visible "sample" language and change only rendered copy to "example" or concrete email/task labels; leave IDs alone.
- [ ] Add explicit approval wording near any "draft reply" action; do not add send behavior or imply automation.
- [ ] Audit the HQ first viewport for abstract suite claims and keep only one next-action sentence plus compact today context.
- [ ] Review the new school planner surface for prediction-like language; keep labels grounded in visible assignments, exams, and study blocks.

## Stop Or Continue
continue but fix copy first