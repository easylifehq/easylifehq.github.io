# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward a calmer daily-workspace voice, but a few remaining phrases still sound like product-positioning language instead of plain, useful app copy.

## Mission Voice Fit
The language mostly fits the mission: clean, connected, professional, and focused on helping users move through tasks, notes, calendar, workouts, and settings without clutter. The best recent direction is the shift away from "command center," "premium," "high-tech," and "personal operating system" toward concrete words like workspace, daily focus, plan, review, capture, and schedule. The remaining risk is that some app and metadata language still frames EasyLife as a grand concept rather than a practical suite someone can trust every day.

## Delicate Wording Risks
- "Command center" still appears in root/app metadata samples. It feels overlarge, slightly militarized, and less hospitable than the product needs.
- "Personal operating system" is strong in mission docs, but should not leak into user-facing UI unless used very sparingly. It can sound abstract and inflated.
- "Premium," "high-tech," "Apple-clean," and "magnificent" are useful internal design prompts, but would feel fake or salesy in the product voice.
- "Opening your workspace." is serviceable, but slightly generic. It could be more specific if the loading context is known.
- Repeated "workspace" language can become flat if every page uses it as the answer. Use it as a suite anchor, not a filler word.
- Marketing pages risk sounding templated when every product is described through the same promise structure rather than the specific user moment each product handles.
- AI experiment copy should stay visibly mock-only. Avoid language that implies real intelligence, real automation, or production readiness.

## Beautiful Language Opportunities
- Replace big suite metaphors with action-based language: "Plan today," "Capture a note," "Review what is due," "Start the next workout."
- Give each module a distinct but restrained vocabulary: EasyList should sound decisive, EasyNotes calm, EasyCalendar time-aware, EasyWorkout focused, Settings controlled.
- Use short helper text that tells the user what the surface does now, not what the product aspires to be.
- Marketing previews can feel more real by naming concrete daily moments instead of generic statuses.
- Empty states can become warmer without becoming cute: "No notes yet. Start with the thought you do not want to lose."
- Loading and transition copy can be quieter and more human.
- Settings copy should continue leaning toward "control," "visibility," "layout," and "preferences" instead of abstract suite language.

## Priority Rewrite
Remove remaining user-facing "command center" language from metadata and UI-adjacent copy, replacing it with concrete daily-suite language. Nami should scan only user-facing source surfaces and public metadata, avoid mission/report docs, and change one phrase at a time so the copy cleanup stays reviewable.

## Suggested Rewrites
- Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
  After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one organized workspace."

- Before: "Opening your workspace."
  After: "Getting your day ready."

- Before: "AI Command Center"
  After: "AI Lab"

- Before: "personal operating system"
  After: "connected daily workspace"

- Before: "premium connected suite"
  After: "polished daily suite"

- Before: "high-tech product feel"
  After: "cleaner, calmer product feel"

- Before: "what matters today"
  After: "what needs attention today"

## Voice Rules
- Prefer concrete daily actions over abstract product metaphors.
- Keep sentences short, useful, and calm.
- Do not promise automation, intelligence, outcomes, or reliability beyond what the UI actually does.
- Use "workspace" sparingly as the suite-level word; use module-specific words inside each app.
- Avoid hype words: premium, magical, command center, high-tech, magnificent, effortless.
- Empty states should explain the next action without sounding needy or cute.
- Marketing copy should describe the product in use, not the product admiring itself.
- AI copy must clearly read as prototype, mock, preview, or lab unless the feature is production-real.

## Next 5 Copy Tasks
- [ ] Scan `app-vNext/src` metadata and user-facing strings for "command center" and replace one remaining instance with "organized workspace" or a more specific daily-use phrase; do not edit docs, behavior, routes, or config.
- [ ] Review EasyHQ user-facing headings and helper text for abstract suite language; replace one phrase with a concrete "today" or "workspace" action cue.
- [ ] Review EasyWorkout dashboard copy for decorative status language; make one line more focused on the current plan or next session without changing workout logic.
- [ ] Review AI Lab copy for production-sounding claims; change one phrase so it clearly reads as mock, prototype, or planning-only.
- [ ] Review one product marketing hero for repeated generic suite phrasing; rewrite one support line to name that product's specific daily use case without adding claims.

## Stop Or Continue
continue but fix copy first