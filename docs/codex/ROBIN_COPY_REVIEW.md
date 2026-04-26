# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is moving toward a calm, professional workspace voice, but a few inflated phrases still make the product sound more like a pitch than a useful daily suite.

## Mission Voice Fit
The best current language supports the mission: "Opening your workspace," "lived-in calendar," "calmer empty states," and "control center" style Settings language all point toward a connected daily product. The weaker language leans too abstract, especially phrases like "command center," "personal operating system," "premium," and "high-tech." EasyLife should sound capable, grounded, and useful, not self-impressed.

## Delicate Wording Risks
- "Command center" appears in root and app meta descriptions. It is not dangerous, but it sounds generic and over-large for a personal productivity suite.
- "Personal operating system" is mission language, but it should stay mostly internal. In user-facing copy it can feel inflated unless the UI clearly earns it.
- "Apple-clean," "premium," "high-tech," and "magnificent" are useful internal direction words, but should not become product copy.
- "Easy System App vNext" in README-level copy sounds transitional and engineering-facing; fine for docs, not suitable for product-facing surfaces.
- "Placeholder routes" and "migration target" are old implementation language and should stay out of any user-facing or public polish surface.
- Repeated product framing around suite/HQ/control language risks making every feature sound the same instead of giving each app a clear daily job.

## Beautiful Language Opportunities
- Replace broad product metaphors with concrete daily outcomes: see today, capture a thought, plan the next block, review what changed.
- Give each product page one distinct sentence that names its real use: tasks for triage, notes for capture, calendar for time, workout for training, HQ for the day.
- Keep loading and empty-state copy short, warm, and action-oriented.
- Use "workspace" carefully. It fits EasyLife better than "command center," but it can also become generic if repeated everywhere.
- Settings can sound more trustworthy by using plain control language: "Choose how EasyLife opens," "Set the apps you use," "Adjust the look and feel."
- Marketing hero copy should promise organization and momentum, not transformation or intelligence beyond what the app currently does.

## Priority Rewrite
The single most important wording problem is the lingering "command center" family of phrases in public-facing metadata and product copy. Replace it with quieter, concrete daily-workspace language so EasyLife feels trustworthy and useful instead of grandiose. Nami should scan app source and public metadata separately, then update only safe user-facing strings that can be changed without touching routing, auth, deployment, generated output, or package files.

## Suggested Rewrites
1. Before: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center."
   After: "EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one calm workspace."

2. Before: "Opening your workspace."
   After: "Opening your workspace."

3. Before: "personal operating system"
   After: "connected daily workspace"

4. Before: "command center"
   After: "home base"

5. Before: "high-tech product feel"
   After: "cleaner, sharper workspace feel"

6. Before: "premium connected suite"
   After: "polished connected suite"

7. Before: "Products and demo below"
   After: "Explore products below"

## Voice Rules
- Prefer concrete daily usefulness over big product metaphors.
- Use "workspace" sparingly and only when it names a real place in the app.
- Keep empty states short: what is empty, why it matters, what to do next.
- Do not describe EasyLife as intelligent, automated, or AI-powered unless the surface is clearly a mock or experiment.
- Avoid "premium," "high-tech," "magnificent," and "operating system" in user-facing copy.
- Product pages should sound related, not identical.
- Settings copy should feel calm, plain, and trustworthy.
- Loading, helper, and status text should be warm but not cute.

## Next 5 Copy Tasks
- [ ] Scan `app-vNext/src` for "command center" and replace one user-facing instance with concrete workspace language; do not touch docs, auth, routing, package files, or generated output.
- [ ] Review the EasyHQ marketing and signed-in HQ copy for one over-large product metaphor; replace it with a specific daily-start phrase.
- [ ] Give one product marketing page a more product-specific helper sentence; avoid new claims, testimonials, AI promises, or feature expansion.
- [ ] Review Settings labels and helper text for one vague control phrase; make it plainer and more trustworthy without changing behavior.
- [ ] Review loading and empty-state copy across one core app; make one sentence shorter, warmer, and action-oriented without adding new functionality.

## Stop Or Continue
continue but fix copy first