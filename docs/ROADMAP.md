# EasyLife Roadmap

This roadmap is the working source of truth for product direction, release planning, and task tracking. Keep items phrased as testable outcomes so each release can be finished without losing the original intent.

## Current Version

- App package version: `3.20.0`
- Current planning target: `3.20.0` Security Hardening
- Next feature target: `4.0.0` Mobile App Foundation
- Product polish queue: `4.0.0` Mobile App Foundation, `4.5.0` Firebase Rules Verification
- Future major target: `4.0.0` Mobile App Foundation and Notifications
- Future suite expansion target: `5.0.0` EasyDrinks and EasyGames

## Working Rules

- Fix high-friction bugs before adding major new systems.
- Keep each work session tied to one release target.
- Update this roadmap when a task moves from Planned to In Progress to Done.
- Update `CHANGELOG.md` before finishing a release batch.
- Update `app-vNext/package.json` and `app-vNext/package-lock.json` whenever shipping a versioned app change.
- Do not connect AI or cross-app routing until the underlying manual flows are clear.

## Release Plan

### 3.1.7 Stability Sweep

Status: Done

Goal: Remove the bugs and interaction issues that make the current app feel unreliable.

- Done: EasyNotes writing area grows with long notes so the page moves naturally while typing.
- Done: EasyWorkout exercise input accepts free-form exercise names without relying on the datalist picker.
- Done: EasyCalendar fixed events can be edited after creation, including class events.
- Done: Mobile feature popups fit below Safari browser chrome and keep the close button reachable.
- Done: Duration fields clearly identify minutes.
- Done: Calendar start and end time validation is understandable.
- Done: The task queue appears only where it belongs, not duplicated below add-task controls.

### 3.2.0 Task and Calendar Foundation

Status: Done

Goal: Make EasyList and EasyCalendar understandable together.

- Done: Tasks use due date as the deadline and linked EasyCalendar blocks as planned work time.
- Done: Calendar shows planned work blocks differently from deadline-only task items.
- Done: Task time can be split into multiple work blocks by sending the same task to EasyCalendar more than once.
- Done: EasyList ranking became a plain-language 1-10 urgency scale.
- Done: To-do list cards are faster to scan with metadata chips.
- Done: Completed tasks get a lightweight satisfying archive animation.
- Done in `3.1.7`: Add-task flow is simplified so the queue does not crowd the creation area.

### 3.3.0 Calendar and Settings Upgrade

Status: Done

Goal: Give Calendar a clearer structure and move customization into organized settings.

- Done: Day view uses an hour-by-hour layout.
- Done: Day, week, and month views can be switched from the calendar screen.
- Done: Calendar view switching moved into the calendar screen instead of relying on old header tabs.
- Done: Repeating events support classes and other recurring obligations.
- Done: Wakeup time can be edited by the user in Settings.
- Done: Users can create custom categories.
- Done: Users can customize category colors for tasks, school, and personal categories.
- Done: Settings includes a dedicated Calendar section and app-specific settings cards.
- Done: Settings are split into focused sections for each major settings area.
- Done: Settings navigation works well on mobile.

### 3.4.0 Fast Capture and Notes Integration

Status: Done

Goal: Minimize the time between having a thought and saving it.

- Started: Creating a blank note, task, workout, event, or project item takes the fewest practical clicks across the suite.
- Done: EasyNotes has a direct blank-note route for one-click writing from HQ and the notes library.
- Done: EasyList focuses the first task row when the add-task page opens.
- Done: Returning to EasyNotes offers a Resume writing action for the previously open note.
- Done: EasyNotes has a button to make tasks from a note.
- Done: EasyNotes can transform note lines into a series of tasks.
- Done: Notes can send generated tasks to EasyList.
- Done: Tasks can be routed to EasyProject, EasyPipeline, or Calendar when applicable.
- Moved to `3.11.0`: Untitled empty notes can be cleaned up safely on a recurring basis or via a maintenance action.

### 3.5.0 EasyWorkout Redesign

Status: Done

Goal: Separate passive workout logging from active workout mode.

- Done: EasyWorkout has a normal browsing/logging mode.
- Done: EasyWorkout has a focused Start Workout mode.
- Done: Workout mode hides unrelated UI.
- Done: Workout mode shows date, general notes, and exercise entry.
- Done: New workouts start with several compact exercise boxes already available.
- Done: Exercise boxes can be added or removed quickly.
- Done: Exercise names are free-form text, not restricted to hardcoded categories.
- Done: Each exercise has a notes field above sets.
- Done: Exercise boxes are compact enough to reduce scrolling.
- Done: Paste-from-notes moves out of the primary workout flow and into an import area.
- Done: Duration is removed from focused workout mode.

### 3.6.0 EasyStatistics Hub

Status: Done

Goal: Keep statistics fun without making primary pages feel cramped.

- Done: EasyStatistics becomes the main analytics page.
- Done: Primary app pages show only light, useful summary stats.
- Done: EasyStatistics has an overall dashboard.
- Done: EasyStatistics has deeper per-app views for tasks, calendar, notes, workouts, projects, and pipeline.
- Done: Statistics loading does not bog down the main app experience.

### 3.7.0 EasyProject and Pipeline Routing

Status: Done

Goal: Let tasks and notes move into larger workflows when they belong there.

- Done: Tasks can be sent to EasyProject.
- Done: Tasks can be sent to EasyPipeline.
- Done: Tasks can be sent to an existing EasyProject and section.
- Moved to `3.11.0`: Notes can create project-ready task groups.
- Done: Applicable tasks offer a clear send-to-project or send-to-pipeline action.
- Done: Routing preserves the original source task context.

### 3.8.0 AI Assistance Layer

Status: Done

Goal: Add helpful suggestions after the manual systems are stable.

- AI scans current notes, tasks, and calendar data when appropriate.
- Done: AI detects date phrases like "prep for exam on Tuesday" in EasyList brain dumps.
- Done: AI date suggestions stay editable and visible before tasks are saved.
- Done: AI asks whether detected dates should become suggested EasyCalendar task blocks.
- Done: AI can break notes or brain dumps into suggested tasks.
- Moved to `3.13.0`: AI can suggest whether an item belongs in EasyProject or EasyPipeline.
- Done: AI suggestions are confirm-before-action, never automatic silent changes.

### 3.9.0 Calendar Recurrence and Category Customization

Status: Done

Goal: Make classes and recurring obligations practical while giving users control over calendar colors.

- Done: Fixed events can repeat daily, weekly, or monthly.
- Done: Recurring events appear in day, week, and month views.
- Done: Recurring events block time for Plan My Day suggestions.
- Done: Calendar categories can be created by the user.
- Done: Category colors can be customized from the calendar tools.

### 3.10.0 Settings Navigation Split

Status: Done

Goal: Make Settings easier to scan by splitting the long page into focused control sections.

- Done: Settings has section navigation for Customize, Apps, Calendar, Pages, Labs, and Account.
- Done: Desktop Settings uses a sidebar.
- Done: Mobile Settings uses a section picker.
- Done: Each Settings section shows one focused area at a time.
- Done: Settings version display matches the current release.

### 3.10.1 Roadmap Cleanup

Status: Done

Goal: Remove duplicate backlog items and move unfinished leftovers into clear future releases.

- Done: Completed backlog items were reconciled against shipped releases.
- Done: Old Started items were either marked done or moved into a future release.
- Done: Future releases now have clear names and boundaries.

### 3.11.0 Notes Library Organization

Status: Done

Goal: Make EasyNotes feel more like a usable notes library instead of a flat pile of documents.

- Done: Add folders.
- Done: Add multi-select.
- Done: Add bulk delete.
- Done: Add move-to-folder.
- Done: Add safe cleanup for untitled empty notes.
- Done: Add project-ready task groups from notes.
- Done: Preserve sleek notes control center styling while adding these basic controls.

### 3.12.0 EasyWorkout Polish

Status: Done

Goal: Finish the workout quality-of-life details after the main Start Workout mode is stable.

- Done: Tighten active workout mobile spacing.
- Done: Make add/remove exercise boxes faster during a workout.
- Done: Improve old workout import placement and copy.
- Done: Add sensible defaults for starting exercise count.

### 3.13.0 AI Routing Suggestions

Status: Done

Goal: Let AI suggest where an item belongs without silently moving anything.

- Done: AI can suggest whether a task belongs in EasyProject.
- Done: AI can suggest whether a task belongs in EasyPipeline.
- Done: AI can scan current task context when appropriate.
- Done: AI suggestions stay confirm-before-action.

### 3.14.0 Final 3.x Stability Sweep

Status: Done

Goal: Make sure the productivity core is stable before expanding the suite.

- Done: Check mobile drawers, popups, and Safari browser chrome behavior across the main apps.
- Done: Verify version numbers, changelog entries, roadmap state, and deploy assets are synchronized.
- Done: Run a focused QA pass on EasyList, EasyCalendar, EasyNotes, EasyWorkout, EasyProjects, EasyPipeline, and EasyStatistics.
- Done: Fix small regressions before adding new lifestyle apps.
- Done: Hold `4.0.0` until the current product core has been tested in real use.
- Done: Add a manual QA checklist for the full 3.x productivity core.

### 3.14.2 Version Sync and Bug-Hunt Patch

Status: Done

Goal: Make the end-of-3.x testing build identify itself correctly and keep the QA plan close at hand.

- Done: Confirm the production build still passes.
- Done: Fix app package version drift after the 3.14 patch commits.
- Done: Keep Settings version display tied to package metadata.
- Done: Update changelog, roadmap, versioning notes, deploy files, and root assets.
- Done: Preserve the 3.x QA checklist as the guide for product testing before 4.0.0 resumes.

### 3.15.0 Demo, Onboarding, and Landing Pages

Status: Done

Goal: Make EasyLifeHQ easier to understand, demo, and trust before adding new apps.

- Done: Improve the main landing page so the value is obvious in the first screen.
- Done: Improve individual product landing pages for EasyList, EasyNotes, EasyCalendar, and EasyPipeline.
- Done: Add clearer calls to action for logging in, exploring products, and starting with the core suite.
- Done: Add a demo-friendly path that explains what to show first: HQ, EasyList, EasyNotes, EasyCalendar, Settings, and one cross-app handoff.
- Done: Add first-run or start-here guidance inside EasyHQ for new users.
- Done: Add demo-friendly empty states across the main apps so blank accounts still look intentional.
- Done: Make public pages and login feel polished on desktop and mobile.
- Done: Keep copy user-facing and direct, without overexplaining the interface.

### 3.15.1 Presentation Copy Polish

Status: Done

Goal: Tighten the new demo and landing copy before product testing.

- Done: Reduce repeated wording in the main landing demo path.
- Done: Tighten EasyHQ demo path descriptions.
- Done: Shorten login context copy.
- Done: Add narrow-screen safeguards for demo path copy.

### 3.16.0 Core UX Refinement

Status: Done

Goal: Make the app feel more like a finished product and less like a collection of separate feature pages.

- Done: Standardize shared button styling, sizing, and hierarchy across the suite.
- Done: Standardize common cards, page panels, empty states, loading states, inputs, and toolbars.
- Done: Tighten mobile spacing and overflow safeguards in shared layout primitives.
- Done: Make drawers and action groups feel more consistent across apps.
- Done: Improve accessible labels on close actions where context was easy to miss.
- Done: Make destructive actions visually clearer without making the interface feel scary.
- Done: Reduce horizontal scroll and clipped text risks in shared cards, drawers, and toolbar rows.
- Done: Keep the visual system polished without adding heavy decoration.

### 3.17.0 Settings Deepening

Status: Done

Goal: Turn Settings into the real control center for app-specific preferences.

- Done: Add focused app-specific settings controls instead of placeholder page-setting cards.
- Done: Add EasyList settings for default urgency, quick-add row count, and archive motion preference.
- Done: Add EasyNotes settings for resume behavior, untitled note cleanup, and note-to-task defaults.
- Done: Add EasyWorkout settings for default exercise box count, default set count, and last-time helpers.
- Done: Add EasyCalendar settings for default view, wakeup time, default task block length, and planning window.
- Done: Add EasyProjects and EasyPipeline routing defaults plus source-context behavior.
- Done: Keep EasyDrinks and EasyGames settings hidden until the `5.0.0` hold lifts.
- Done: Preserve the mobile-friendly Settings navigation created in `3.10.0`.

### 3.18.0 Data Review and Export

Status: Done

Goal: Make the app feel safer, more trustworthy, and easier to inspect.

- Done: Add JSON export for tasks, notes, workouts, projects, pipeline items, contacts, calendar records, settings, and metadata.
- Done: Add clearer review guidance where notes can disappear into trash or data can become linked across apps.
- Done: Add review panels for linked data, including task-calendar blocks and project task links.
- Done: Add a lightweight Data section in Settings.
- Done: Add copyable summary text for quick inspection and troubleshooting.
- Done: Add empty-state-friendly counts for recovering or reviewing old data.
- Done: Keep data tools simple and user-controlled.

### 3.19.0 High-Tech Visual Polish

Status: Done

Goal: Make EasyLife feel like a refined, classy command center while keeping the base app simple and easy to use.

- Done: Improve the base theme into a sleek daily-use command center.
- Done: Make page hierarchy, spacing, and cards feel more premium across the suite.
- Done: Polish shared HQ, Settings, EasyList, EasyNotes, EasyCalendar, EasyWorkout, EasyProjects, EasyPipeline, and EasyStatistics surfaces through the common shell styles.
- Done: Improve stats and action areas so quiet accounts still feel intentional.
- Done: Make themes feel more distinct while preserving the same easy interaction model.
- Done: Push Gamer toward a game-like command center, Elvish toward adventure/fantasy polish, and Candy toward bright playful energy.
- Done: Keep the base app refined and classy, with personality coming from themes.
- Done: Avoid AI assistant foundation work until the mobile foundation is stable.

### 3.19.x Real-Use Patch Cycle

Status: Done

Goal: Patch issues found during a week of real use before closing out the `3.x` line.

- Capture real friction, bugs, awkward copy, and layout issues from daily use.
- Patch mobile and desktop UI issues that show up in normal workflows.
- Keep release candidates focused on bug fixes, QA, version sync, and deploy assets.
- Close `3.x` only after the product feels stable enough to build `4.0.0` on top of it.

### 3.19.1 Visual QA Patch

Status: Done

Goal: Fix visual issues found during the `3.19.0` browser check.

- Done: Fix mobile marketing and login page horizontal overflow.
- Done: Keep header actions visible and readable on narrow screens.
- Done: Tighten marketing header radii to match the command-center shell.
- Done: Rebuild and refresh deploy assets after the CSS patch.

### 3.20.0 Security Hardening

Status: Planned

Goal: Make EasyLife significantly harder to attack, safer with user data, and ready for more ambitious `4.0.0` features.

- Done: Audit Firebase Authentication assumptions and make sure every authenticated route handles signed-out states safely.
- Done: Audit Firestore security rules so each user can only read and write their own data.
- Done: Review all client-side data access paths for user-id leakage, broad queries, unsafe writes, or missing ownership checks.
- Done: Review environment variables and build output so secrets are never exposed in the frontend bundle.
- Done: Add a dependency and package audit pass for known vulnerabilities.
- Done: Add a security checklist for deploys, including Firebase rules, hosting settings, API keys, and allowed domains.
- Done: Add user-facing safety copy where exports, deletes, trash, account actions, or future assistant features could affect private data.
- Done: Add safer error handling so sensitive technical details are not shown to users.
- Done: Document remaining security limits clearly, because no app can be made literally impossible to hack.
- Done: Keep the goal practical: reduce risk, close obvious holes, and create a repeatable security review process before `4.0.0`.

### 4.0.0 Mobile App Foundation

Status: Planned

Goal: Turn EasyLife into a real phone-first daily companion with app install, native-feeling navigation, and a path to notifications.

- Choose the mobile approach, with Capacitor preferred first because the current app is already React/Vite and can become an installable app without a full rewrite.
- Add Capacitor project scaffolding for iOS and Android while keeping the existing web app as the shared source of truth.
- Define app name, bundle IDs, icons, splash screen, platform targets, and build settings.
- Add a temporary `4.0.0` EasyLife mobile logo and app icon that fits the polished command-center identity.
- Create mobile-safe environment handling so Firebase config, API URLs, and build variables are clear per platform.
- Verify Firebase Authentication works inside the mobile wrapper, including sign-in, sign-out, persisted sessions, and signed-out redirects.
- Verify Firestore reads/writes work correctly in the mobile shell without broad or unsafe queries.
- Audit every primary route in the mobile wrapper: EasyHQ, EasyList, EasyCalendar, EasyNotes, EasyWorkout, EasyProjects, EasyPipeline, EasyStatistics, Settings, and Login.
- Add mobile app navigation rules for the shell, header, drawer/menu behavior, back behavior, and safe-area handling.
- Make the capture flow feel native on phone: fast open, usable keyboard behavior, reachable close/save actions, and no Safari-browser-chrome assumptions.
- Make mobile app layout honor safe areas, keyboard height, notches, home indicator areas, and small screens.
- Add app lifecycle handling for resume, background, and reload behavior so returning to the app keeps the user oriented.
- Add basic offline/degraded-state messaging for weak signal, failed sync, and unavailable Firebase operations.
- Confirm data export and safety tools still work in mobile.
- Add mobile-specific QA checklist covering install/open, login, navigation, capture, task edit, note edit, calendar edit, workout start, settings, and logout.
- Build local Android and iOS development versions where platform tooling is available.
- Document what is required for real app store release, including developer accounts, signing, screenshots, privacy details, and review notes.

### 4.1.0 Notification Foundation

Status: Planned

Goal: Add useful reminders without making EasyLife noisy or annoying.

- Decide notification stack for mobile, including Capacitor local notifications for on-device reminders and Firebase Cloud Messaging only if remote push is truly needed.
- Add notification permission onboarding with plain-language copy and a clear skip path.
- Add Settings controls for enabling, disabling, and tuning notification categories.
- Add task deadline reminders.
- Add calendar work-block reminders.
- Add daily planning or wake-up reminders based on the user wakeup/planning settings.
- Add workout reminders only if the user enables them.
- Add quiet-hours settings so notifications do not fire during unwanted times.
- Add test notification action in Settings.
- Add notification fallback states when permissions are denied, unavailable, or revoked.
- Keep notification scheduling deterministic and user-controlled; no surprise AI-triggered notifications.
- Add QA for permission prompts, scheduling, cancellation, duplicate prevention, and notification tap behavior.

### 4.2.0 Mobile Polish and Reliability

Status: Planned

Goal: Make the mobile app feel genuinely comfortable to use every day.

- Tighten all mobile screens after real device use, not just desktop browser simulation.
- Improve keyboard handling for notes, tasks, workout exercises, calendar forms, and settings fields.
- Make task completion, archive motion, and quick capture feel satisfying without slowing the app.
- Add better loading states for cold app launch, auth restore, and slow data loads.
- Improve app resume behavior so the last relevant page or note can reopen naturally.
- Reduce accidental taps by reviewing button sizes, spacing, sticky controls, and destructive actions.
- Add platform-specific polish for status bar color, splash timing, app icon display, and safe-area backgrounds.
- Add crash/error reporting plan before broader distribution.
- Create a real-device QA checklist for iPhone, Android, small screens, and large screens.

### 4.3.0 Mobile Distribution Prep

Status: Planned

Goal: Prepare the mobile app for sharing beyond local testing.

- Decide whether the first distribution path is TestFlight, Android internal testing, direct APK, or both stores.
- Prepare app metadata: name, subtitle, description, keywords, support URL, privacy URL, screenshots, and category.
- Document privacy posture for stored data, Firebase usage, notifications, exports, and AI features.
- Prepare app signing, build numbers, release notes, and platform-specific versioning.
- Add production build checklist for web, Android, and iOS outputs.
- Add rollback plan for bad mobile releases.
- Add user-facing support path for login problems, sync issues, notification issues, and data export questions.
- Run final mobile QA before any external install link is shared.

### 4.4.0 AI Assistant Foundation

Status: Planned

Goal: Start the assistant foundation only after mobile, notifications, security, and daily-use reliability are solid.

- Define what the assistant is allowed to see, suggest, and change.
- Add user-facing AI controls and explanation in Settings.
- Add better fallback states when AI is unavailable.
- Keep all assistant actions review-first, reversible, and scoped to the user account.
- Start with assistant planning and summarizing flows before allowing deeper automation.

### 4.5.0 Firebase Rules Verification

Status: Planned

Goal: Do the deeper Firebase security verification after the mobile foundation is moving, without blocking `4.0.0`.

- Re-check Firestore rules against every app data path after the mobile shell is in place.
- Deploy or re-deploy Firestore rules when the production timing is right.
- Add a simple rules test plan for signed-out users, the account owner, and a different signed-in user.
- Confirm mobile auth sessions still map cleanly to `users/{uid}` data.
- Review Firebase project settings, allowed domains, and hosting configuration before broader sharing.
- Update the security checklist with anything learned during real mobile testing.

### 5.0.0 EasyDrinks and EasyGames Suite Expansion

Status: Held

Goal: Expand EasyLife beyond productivity into lightweight lifestyle and fun apps after the mobile foundation is stable.

- Add EasyDrinks as a quick drink journal and recipe app.
- EasyDrinks can save drink name, ingredients, notes, rating, tags, date, and favorite status.
- EasyDrinks supports broad drink types such as cocktails, mocktails, coffee, smoothies, and protein shakes.
- Add EasyGames as a small games hub.
- EasyGames launches with one or two lightweight built-in games instead of a giant game library.
- EasyGames tracks simple play stats or favorites where useful.
- Add EasyDrinks and EasyGames to navigation, app visibility settings, theme styling, roadmap, changelog, and versioning.
- Keep both apps MVP-sized for `5.0.0`, then deepen them in later `5.x` releases.

## Backlog by Area

### Global and Mobile

- Preserve user context when switching tabs across every app.
- Continue reducing minimum clicks to write, log, or capture.
- Keep mobile overlays checked as new drawers and sheets are added.
- Improve landing pages and demo flows in `3.15.0`.
- Standardize the visual system in `3.16.0`.
- Build the mobile app foundation in `4.0.0`.
- Add notification support in `4.1.0`.
- Prepare navigation and settings for EasyDrinks and EasyGames once the `5.0.0` hold lifts.

### EasyList

- Add more keyboard-friendly quick actions.
- Add stronger filters for urgency, deadline, and calendar status.
- Keep task routing prompts useful without becoming noisy.
- Move list defaults and archive behavior into Settings in `3.17.0`.
- Include task export and linked-task review in `3.18.0`.

### EasyCalendar

- Clarify event type and category fields.
- Add richer recurrence controls later, such as selected weekdays or end dates.
- Move more calendar customization into the Settings Calendar section.
- Add calendar defaults and planning preferences to Settings in `3.17.0`.
- Include calendar/task link review in `3.18.0`.

### EasyNotes

- Keep notes library controls polished as the folder model grows.
- Consider nested folders only after flat folders feel solid.
- Add richer note-to-project options later if project templates need more structure.
- Move resume behavior, cleanup behavior, and note-processing defaults into Settings in `3.17.0`.
- Include notes export and trash recovery review in `3.18.0`.

### EasyWorkout

- Keep active workout logging compact on mobile as new controls are added.
- Add workout settings when Settings app sections become deeper pages.
- Move workout mode defaults and exercise box count into Settings in `3.17.0`.
- Include workout export in `3.18.0`.

### EasyStatistics

- Add more useful per-app drilldowns over time.
- Keep statistics fun without crowding primary app pages.
- Consider hosting data health summaries from `3.18.0`.

### EasyProject and EasyPipeline

- Improve note-to-project task groups after real use.
- Keep source context preserved whenever items move between apps.
- Move routing defaults into Settings in `3.17.0`.
- Include linked data review and export in `3.18.0`.

### AI Backend

- Deepen context scanning after the `3.x` product core has been tested.
- Keep tuning project and pipeline routing suggestions based on real use.
- Keep all AI actions review-first and reversible.
- Add user-facing AI controls after the mobile foundation is stable.
- Add better fallback states when AI is unavailable after the mobile foundation is stable.

### EasyDrinks

- Build the EasyDrinks MVP when the `5.0.0` hold lifts.
- Add fast drink capture.
- Add saved favorite drinks.
- Add ingredients, notes, rating, tags, and date fields.
- Keep any alcohol-related copy neutral and responsible.

### EasyGames

- Build the EasyGames MVP when the `5.0.0` hold lifts.
- Add a games dashboard.
- Add one or two lightweight built-in games.
- Add simple favorites or stats if they do not slow down the MVP.
