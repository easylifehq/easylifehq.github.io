# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward a calmer assistant voice, but visible copy still slips into builder language, module-showroom framing, and vague product-doorway labels.

## Mission Voice Fit
The best current language is concrete and useful: "Today", "Capture note", "Open task list", "Plan my day", "Due today", "Next event", and "Open room" all fit the mission of a daily personal workspace. The weaker language appears where the product explains itself instead of helping the user act: marketing pages still say "Features", "How It Works", "Demo Path", and "Show this first", while some app copy still uses "workflow", "handoff", "proof", "sample", and "command center". That keeps EasyLife sounding partly like a product build or sales deck instead of one trusted daily assistant.

## Delicate Wording Risks
- "Demo Path", "Show this first", and "Use these moments to explain the product without wandering through every setting" sound like instructions to the builder or presenter, not buyer-facing product copy.
- "Draft handoff to EasyList", "EasyList handoff", and "Capture, refine, then hand off" are still too internal and process-heavy for customer-facing notes copy.
- "Open EasyLife" is clear enough as a navigation label, but as a primary CTA it is vague. It does not say what the user does next or what they get.
- "Features" and "How It Works" are generic brochure labels. They are not wrong, but they reinforce separate-module marketing instead of a single assistant path.
- "command center" appears in public/meta copy and conflicts with the newer, calmer assistant direction. It sounds generic SaaS and slightly militarized.
- "proof" appears in visible marketing copy such as "visible proof of what got done"; this is less risky than "proof" as internal evidence language, but still feels a little defensive and product-review-ish.
- "sample" appears mostly in IDs and mock constants, which is acceptable when not visible. Keep watching for visible "sample data" because it can break trust.
- Settings language such as "Planned global capture button" and "manual workflow" reads like product planning or implementation status if visible to users.
- "Project Planner AI" risks overpromising if no real AI behavior, confidence boundary, or deterministic explanation is visible nearby.
- "Show control" in the HQ demo path feels awkward and unclear. It does not tell the user what action to take or why it matters.

## Beautiful Language Opportunities
- Replace "Open EasyLife" with a more action-shaped CTA on at least one public surface, such as "Start today" or "Open today's plan".
- Reframe "Demo Path" as a user-facing "Daily path" or "Start here" if that section must stay visible.
- Replace "handoff" with concrete transfer language: "turn note lines into tasks", "send action lines to Tasks", or "make a task from this note".
- Replace "Features" with a calmer section label like "What it helps with" or remove the eyebrow entirely where the heading already does the work.
- Bring public pages closer to the app voice by using "Today", "Capture", "Plan", "Notes", and "More" as the vocabulary spine.
- Tighten Settings copy so it reads as choices the user controls now, not features planned by the builder.
- Use "example day" only where mock content is intentionally illustrative; otherwise, avoid exposing that data is sample/mock.
- Make "Plan My Day" copy more humble when automated suggestions are involved: preview, apply, undo, and keep the user in control.

## Priority Rewrite
The most important wording problem is the visible marketing section that says "Demo Path", "Show this first", and "Use these moments to explain the product without wandering through every setting." That copy is not addressed to the customer and exposes the builder/presenter mindset. Nami should turn this into a small copy-only task in `ProductMarketingPage.tsx`: rename the section and supporting sentence so it describes a real user path through the product, without adding claims, new sections, or broader marketing rewrites.

## Suggested Rewrites
- Before: "Demo Path"
  After: "Daily path"

- Before: "Show this first"
  After: "Start with one useful move"

- Before: "Use these moments to explain the product without wandering through every setting."
  After: "Follow the shortest path from capture to a clear next action."

- Before: "Draft handoff to EasyList"
  After: "Turn note lines into tasks"

- Before: "EasyList handoff"
  After: "Tasks from notes"

- Before: "Open EasyLife"
  After: "Open today's plan"

- Before: "Features"
  After: "What it helps with"

- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and follow-ups in one daily workspace."

## Voice Rules
- Use concrete daily nouns: task list, note, calendar block, workout log, project brief, daily plan, inbox, capture, More.
- Keep first-screen copy short and action-shaped: what to do next, why it matters, and where it opens.
- Avoid builder and review words in visible UI: demo, proof, handoff, polish, sample data, workflow, command center.
- Do not imply AI, prediction, or automation unless the UI clearly shows user approval, assumptions, preview, and undo.
- Public pages may explain the product, but app surfaces should use direct task labels instead of sales language.
- Prefer "turn this note into tasks" over abstract transfer language like "handoff".
- Treat optional modules as quiet support, not equal product promises.
- Do not add claims. Make existing claims plainer, smaller, and more useful.

## Next 5 Copy Tasks
- [ ] Rename the visible "Demo Path" section in `ProductMarketingPage.tsx`; guardrail: copy-only, keep the section and links, do not add claims.
- [ ] Replace one visible "handoff" phrase in EasyNotes marketing with concrete note-to-task language; guardrail: one page only, preserve meaning and route behavior.
- [ ] Replace the public/meta "command center" description with "daily workspace" language; guardrail: no root deployed file edits unless explicitly allowed by the task scope.
- [ ] Audit Settings for visible builder-state phrases like "Planned global capture button" and "manual workflow"; guardrail: labels must describe current user control, not future implementation.
- [ ] Replace one repeated "Open EasyLife" CTA on a marketing page with a more specific daily action label; guardrail: preserve the existing link target.

## Stop Or Continue
continue but fix copy first