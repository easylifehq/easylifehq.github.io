# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is getting calmer and more concrete, but visible copy still slips into builder language and sometimes explains the system instead of giving the user a clear next move.

## Mission Voice Fit
The language mostly fits the mission when it says "workspace," "today," "task," "calendar," "note," "reply draft," and "approval." Those words support a connected personal assistant product. The weaker fit appears where EasyLife still says "command center," "demo," "proof," or "sample" near customer-facing or app-adjacent surfaces. Those words make the product feel staged, internal, or sales-driven instead of lived-in and trustworthy.

## Delicate Wording Risks
- "command center" in public metadata overstates the product and sounds like generic SaaS positioning rather than a calm personal workspace.
- "demo" appears in dev access and query logic; harmless internally, but it should not appear in visible app copy or page labels.
- "proof" in class names is internal, but any visible "proof" language should be avoided because it sounds like builder evidence, not user value.
- "sample" appears in Inbox Intelligence candidate IDs. If any sample framing becomes visible, it will weaken trust by reminding the user the queue is staged.
- "Reply draft prepared for approval. Nothing is sent from this screen." is safe and clear, but slightly mechanical. It protects trust well; it could be warmer without losing certainty.
- "Use separators like three dashes between emails. Nothing is sent or archived from this screen." is functional, but it reads like implementation guidance. It should become user-task language if visible.
- "Opening your workspace." is clear and appropriate.
- Any remaining "Start Free" style CTA on signed-in surfaces is off-voice. It belongs to marketing, not the working app.
- Phrases like "polish," "handoff," "proof," "sample data," and "command center" should remain quarantined from visible product copy.

## Beautiful Language Opportunities
- Replace broad system nouns with daily-life nouns: "today," "task list," "calendar block," "reply draft," "project brief," "workout log," "notes," and "workspace."
- Make Inbox copy feel more like a review tray: calm, concrete, approval-based, and explicit about what will not happen automatically.
- Give HQ copy one strong first-screen sentence that names the next action and outcome, not the suite concept.
- Shorten helper copy below controls so primary labels do the work first.
- Turn any visible "nothing is sent" safety language into a reassuring approval promise.
- Keep command/capture language direct: "Add a task," "Capture a note," "Plan today," "Draft a reply."

## Priority Rewrite
The most important copy problem is visible or near-visible builder language around Inbox Intelligence and product positioning. Nami should search only user-facing app source for "command center," "demo," "proof," "sample data," "handoff," and "polish," then replace one visible instance at a time with concrete user nouns. Do not broaden the pass into docs, identifiers, or architecture.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, and projects in one daily workspace."

- Before: "Reply draft prepared for approval. Nothing is sent from this screen."
  After: "Reply draft ready to review. It will not send unless you approve it."

- Before: "Use separators like three dashes between emails. Nothing is sent or archived from this screen."
  After: "Paste emails here to review possible tasks, events, and replies. EasyLife will not send or archive anything."

- Before: "sample data"
  After: "example day"

- Before: "Calendar handoff"
  After: "Calendar prep"

- Before: "command center"
  After: "daily workspace"

## Voice Rules
- Use concrete product nouns before abstract system language.
- On signed-in surfaces, write for a person already using EasyLife today.
- Keep the first screen short: next move, today context, compact status.
- Do not use builder-review words in visible copy: "proof," "demo," "sample data," "handoff," "polish," or "workflow."
- Safety copy must be plain and specific: say what will happen, what will not happen, and what requires approval.
- Marketing may explain the product; the app should label actions.
- Prefer "review," "approve," "draft," "capture," "plan," and "add" over broad assistant promises.
- Do not imply automation, AI judgment, sending, archiving, or email access beyond what is visibly implemented.

## Next 5 Copy Tasks
- [ ] Replace the public metadata phrase "command center" with "daily workspace"; guardrail: copy-only, no root deploy or generated output edits unless explicitly approved.
- [ ] Review `EasyListEmailPage.tsx` for visible "sample" or staged-language leaks; guardrail: only change rendered strings, not IDs or data behavior.
- [ ] Rewrite the visible Inbox paste helper so it names the user action and the approval boundary in one short sentence.
- [ ] Check signed-in HQ and module first-screen CTAs for marketing-style language such as "Start Free"; guardrail: replace only visible labels with existing app actions.
- [ ] Search app source for visible "proof," "handoff," "polish," and "command center"; guardrail: ignore class names, imports, IDs, docs, and non-rendered internals.

## Stop Or Continue
continue but fix copy first