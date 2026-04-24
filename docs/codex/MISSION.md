# EasyLife Mission

## 1. Mission

EasyLife 5.0 should feel like a connected, professional personal operating system.

The goal is not to make a pile of separate apps. The goal is to make EasyLife feel like one calm, useful suite where tasks, notes, calendar planning, workouts, projects, and settings all belong together.

EasyLife should help the user organize life faster, reduce friction, and make it easier to act on what matters without feeling buried in clutter.

The product should feel:

- connected
- clean
- fast
- trustworthy
- personal
- professional
- useful on desktop and solid on mobile

Every Codex Fleet task should move EasyLife closer to feeling like one polished system instead of disconnected feature pages.

## 2. Product Priorities

### Priority 1: Connected Suite Feel

EasyLife should feel like one product.

Improve shared navigation, shared layout patterns, shared empty states, shared spacing, shared language, and shared visual polish across the main apps.

Primary app areas:

- EasyList
- EasyNotes
- EasyCalendar
- EasyWorkout
- Settings

Secondary areas may be improved only when the change is small, safe, and clearly supports suite consistency.

### Priority 2: Professional Visual Polish

The app should look more intentional and less experimental.

Focus on cleaner spacing, better hierarchy, better cards and panels, consistent buttons, consistent headers, more useful page layouts, less clutter, better mobile behavior, and clear app identity without overdesigning.

Avoid huge redesigns unless specifically approved.

### Priority 3: Stability and Trust

Do not break working features.

EasyLife should feel safer after every run, not riskier. Prefer small improvements that preserve current behavior. Avoid clever rewrites, fragile abstractions, or changes that touch core data/auth systems.

### Priority 4: Useful Daily Flow

Prioritize improvements that make the product better for real daily use.

The user should be able to open EasyLife and quickly understand:

- what needs attention
- where to write something down
- what is scheduled
- what was completed
- how the different apps relate

### Priority 5: Settings Cleanup

Settings should feel like the control center for the suite.

Safe improvements include clearer labels, better grouping, better layout, and better explanations of existing options.

Do not add risky account/auth/backend settings without approval.

## 3. What Success Looks Like

EasyLife 5.0 is successful when a user can open the app and immediately feel like it is one connected personal operating system.

Signs of success:

- The main apps feel visually related.
- Navigation between apps feels obvious and consistent.
- Pages have less clutter and better structure.
- Mobile layouts are usable and not cramped or broken.
- EasyList, EasyNotes, EasyCalendar, EasyWorkout, and Settings feel like parts of the same suite.
- Empty states explain what to do next.
- Buttons, panels, cards, headings, and page shells follow consistent patterns.
- The app feels more polished without losing speed or simplicity.
- Builds pass after every unattended run.
- The task queue stays focused on safe, shippable improvements.

A successful Codex Fleet run should produce small visible progress without creating cleanup debt.

## 4. Hard Forbidden Scope

Codex Fleet must not perform the following unattended work.

### Absolutely Forbidden

Do not touch:

- Firebase rules
- Firebase config
- authentication logic
- login/logout/session handling
- billing
- payments
- secrets
- API keys
- environment files
- DNS
- deployment configuration
- GitHub Pages deployment setup
- Cloud Functions
- backend services
- database schema migrations
- production data
- package or lock files
- dependency changes
- broad rewrites
- generated build output
- destructive file deletes
- large app architecture changes

### Also Forbidden Unless Explicitly Approved

Do not modify:

- `functions/`
- `old-site/`
- `dist/`
- `build/`
- `coverage/`
- `.firebaserc`
- `firebase.json`
- `firestore.rules`
- `index.html`
- `sw.js`
- `manifest.webmanifest`
- root production config files
- auth-related feature files
- secret or credential files
- package manager files

### Behavioral Rule

If a task requires forbidden scope to do correctly, skip it and choose a safer task.

Do not partially edit sensitive areas. Do not prepare fake backend/auth/payment/deploy changes inside production code.

## 5. Safe Unattended Work

Codex Fleet may safely work on small, reviewable frontend and documentation improvements.

Safe task types include:

- UI spacing cleanup
- copy improvements
- card/header/panel polish
- empty state improvements
- responsive layout fixes
- minor accessibility improvements
- button label clarity
- suite-wide visual consistency
- small component cleanup
- CSS/token usage cleanup
- docs improvements
- mock-only experimental UI
- fake-data prototypes in clearly safe areas
- non-sensitive refactors limited to one small area

Safe files are usually inside:

- `app-vNext/src/features/easylist/`
- `app-vNext/src/features/easynotes/`
- `app-vNext/src/features/easycalendar/`
- `app-vNext/src/features/easyworkout/`
- `app-vNext/src/features/settings/`
- shared UI/style files when the change is small and clearly safe
- `docs/codex/`

Every unattended task should be small enough to review quickly.

## 6. Review Gate Rules

A task may only be marked complete when all review gates pass.

Before marking a task complete:

1. The build must pass using the repo's source-of-truth build command:

   ```powershell
   cd app-vNext
   npm.cmd run build
   ```

2. The working tree must be clean after commit.
3. No forbidden files may be changed.
4. No package/dependency files may be changed.
5. No auth, Firebase, billing, deploy, secret, backend, or generated output files may be touched.
6. The task must be small enough to understand from the diff.
7. The task must preserve existing behavior unless the task explicitly says otherwise.

If any gate fails, stop for human review.

## 7. How To Judge The Next Five Tasks

The next tasks should be chosen by asking:

- Does this move EasyLife closer to feeling like one connected suite?
- Is it small enough for one Codex round?
- Can it be reviewed quickly?
- Does it avoid forbidden scope?
- Does it improve real daily use?
- Does it reduce visual clutter or inconsistency?
- Does it preserve existing behavior?

Prefer:

- visible polish
- empty states
- spacing/layout cleanup
- mobile fixes
- shared language consistency
- docs/reporting clarity

Avoid:

- new production features
- backend work
- persistence changes
- routing changes
- auth/account changes
- dependency changes
- broad refactors

## Checkpoint Reviewer Rubric

### Continue

Continue when:

- build passes
- branch is clean
- changes are small and reviewable
- no forbidden files changed
- progress clearly supports the mission
- remaining tasks are safe

### Patch First

Patch before continuing when:

- copy feels rough
- UI polish is inconsistent
- a task technically passed but created obvious cleanup
- report/task queue state is confusing
- build passes but review found minor quality issues

### Stop For Human Review

Stop when:

- build fails
- forbidden files changed
- auth/Firebase/backend/deploy/secrets were touched
- dependency files changed
- data models or persistence behavior changed
- the branch becomes too broad to review comfortably
- the planner proposes risky or vague tasks
