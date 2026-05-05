# Robin Copy Review

## Verdict
YELLOW

## One-Sentence Read
EasyLife is speaking more calmly and concretely, but a few visible and metadata strings still sound like internal product staging instead of a trusted daily workspace.

## Mission Voice Fit
The strongest current language fits the mission: "Opening your workspace," "daily plan," "workspace," "task list," and module-specific nouns support a connected personal assistant suite. The weaker copy still leans on broad platform language like "command center," internal review words like "demo" and "proof," and generic prompts like "Start with," which make the product feel less personal and less finished. For EasyLife, the voice should stay close to what the user can do today: plan the day, capture a note, review the calendar, finish a task, open a workout log, or adjust settings.

## Delicate Wording Risks
- `command center` in `404.html` and `app-vNext/index.html` is too generic SaaS and conflicts with the stated ban on command-center framing.
- `EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center.` reads like a feature inventory, not a daily assistant promise.
- `auth-proof-card` is likely a class name, but if any nearby visible login copy uses "proof," it should be replaced with a concrete trust or workspace cue.
- `Start with` on the login page can sound like onboarding instruction copy instead of a clear buyer/user outcome unless the next line is specific.
- `Nothing completed yet this week. Start with one small win.` is friendly, but "small win" is a little generic and coaching-app familiar. It may be fine in stats, but a more concrete action would be stronger.
- `demo` appears mostly in visual QA and dev-mode conditionals; keep it out of visible labels, route copy, and public-facing metadata.
- `sample` IDs in EasyList email are probably internal identifiers, but any rendered "sample" language should become "example" or a concrete item type.
- The public page language still risks explaining the suite as a full product inventory before proving the daily next action.
- The remaining unchecked queue language is not customer-facing, but it repeats "visible UI, interaction, or copy area" and "prefer deleting awkward complexity," which is builder instruction language and should not leak into app copy.

## Beautiful Language Opportunities
- Replace broad suite nouns with lived daily nouns: "workspace," "daily plan," "task list," "calendar block," "note," "project brief," and "workout log."
- Make first-screen copy shorter and more directional: one next action, one today cue, one compact status.
- Use module-specific verbs rather than platform verbs: "Plan," "Capture," "Review," "Finish," "Log," and "Adjust."
- On public pages, let the product promise be quieter and more useful: "Plan today, capture what matters, and keep your week in view."
- In empty states, name the first useful action instead of cheering the user on.
- In Settings, prefer "Choose how EasyLife opens and feels" over control-center or system language.
- In experiments or mock surfaces, say "example day" or "preview" only when needed, and avoid "demo" as visible copy.

## Priority Rewrite
Fix the remaining `command center` metadata and any visible command-center language first. It is the clearest mismatch with the operating mode and mission: EasyLife should feel like a calm daily workspace, not a generic SaaS dashboard. Nami should target only customer-facing meta strings and visible source strings, replacing the phrase with concrete daily-workspace language without touching routing, auth, Firebase, package files, or generated output.

## Suggested Rewrites
- Before: `EasyLife keeps tasks, notes, calendar planning, workouts, projects, and pipeline work in one command center.`
  After: `EasyLife keeps tasks, notes, calendar planning, workouts, and projects in one calm daily workspace.`
- Before: `Start with`
  After: `Open today`
- Before: `Nothing completed yet this week. Start with one small win.`
  After: `Nothing completed yet this week. Finish one task to start the log.`
- Before: `Products and demo below`
  After: `Explore EasyLife`
- Before: `sample data`
  After: `example day`
- Before: `proof`
  After: `workspace preview`
- Before: `command center`
  After: `daily workspace`
- Before: `polish`
  After: `clean up`

## Voice Rules
- Use concrete daily-life nouns before abstract product nouns.
- Keep first-screen labels short: `Today`, `Tasks`, `Calendar`, `Notes`, `Workout`, `Settings`.
- Say what the user can do and what changes next.
- Avoid "command center," "personal operating system," "premium," "high-tech," "proof," "handoff," "polish," "demo," and "sample data" in visible customer-facing copy.
- Separate public product copy from working app copy.
- Public copy may explain the promise; app copy should guide the next action.
- Do not describe implementation, testing, build state, mock status, or internal review language to the user.
- Empty states should offer one concrete next action, not a slogan.

## Next 5 Copy Tasks
- [ ] Replace the `command center` meta description in `app-vNext/index.html` with "one calm daily workspace"; guardrail: copy-only, no package, routing, auth, Firebase, or generated output changes.
- [ ] Replace the `command center` meta description in `404.html` only if root metadata is approved for this branch; guardrail: do not touch other root production files.
- [ ] Inspect `LoginPage.tsx` for visible "Start with" and "proof" language; guardrail: change only rendered text, not class names or auth behavior.
- [ ] Inspect EasyStatistics empty-state copy and replace "small win" with one concrete action; guardrail: one sentence only, no new feature claims.
- [ ] Search rendered app strings for "demo," "sample data," "handoff," "proof," and "polish"; guardrail: ignore internal identifiers and change only one visible phrase per task.

## Stop Or Continue
continue but fix copy first