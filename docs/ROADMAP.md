# EasyLife Roadmap

This roadmap is the working source of truth for product direction, release planning, and task tracking. Keep items phrased as testable outcomes so each release can be finished without losing the original intent.

## Current Version

- App package version: `3.15.0`
- Current planning target: `3.15.0` Demo, Onboarding, and Landing Pages
- Next feature target: `3.16.0` Core UX Refinement
- Product polish queue: `3.16.0` Core UX Refinement, `3.17.0` Settings Deepening, `3.18.0` Data Review and Export, `3.19.0` AI Trust and Controls
- Future major target: `4.0.0` Suite Expansion with EasyDrinks and EasyGames

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

### 3.16.0 Core UX Refinement

Status: Planned

Goal: Make the app feel more like a finished product and less like a collection of separate feature pages.

- Standardize button styling, button sizing, and button hierarchy across the suite.
- Standardize cards, page headers, empty states, loading states, and error states.
- Tighten mobile spacing across EasyHQ, EasyList, EasyCalendar, EasyNotes, EasyWorkout, EasyProjects, EasyPipeline, EasyContacts, EasyStatistics, and Settings.
- Make drawers, modals, menus, and sheets feel consistent across apps.
- Improve keyboard focus states and accessible labels where actions are easy to miss.
- Make destructive actions visually clear without making the interface feel scary.
- Reduce any remaining horizontal scroll or clipped text risks on mobile.
- Keep the visual system polished without adding heavy decoration.

### 3.17.0 Settings Deepening

Status: Planned

Goal: Turn Settings into the real control center for app-specific preferences.

- Add focused app-specific settings pages or sections instead of placeholder page-setting cards.
- Add EasyList settings for default urgency, quick-add defaults, archive motion, and task display preferences.
- Add EasyNotes settings for resume behavior, untitled note cleanup, default folder behavior, and note-to-task defaults.
- Add EasyWorkout settings for default exercise box count, workout mode defaults, and logging preferences.
- Add EasyCalendar settings for default view, wakeup time, category defaults, and planning preferences.
- Add EasyProjects and EasyPipeline settings for routing defaults and source-context behavior.
- Keep EasyDrinks and EasyGames settings hidden until the `4.0.0` hold lifts.
- Preserve the mobile-friendly Settings navigation created in `3.10.0`.

### 3.18.0 Data Review and Export

Status: Planned

Goal: Make the app feel safer, more trustworthy, and easier to inspect.

- Add basic export options for tasks, notes, workouts, projects, pipeline items, and contacts.
- Add clearer archive, trash, and recovery flows where data can disappear from the main view.
- Add review panels for linked data, such as tasks connected to calendar blocks, projects, or pipeline items.
- Add a lightweight data health page in Settings or EasyStatistics.
- Clarify delete confirmation copy for notes, tasks, events, projects, workout sessions, and pipeline items.
- Add empty-state guidance for recovering or reviewing old data.
- Keep data tools simple and user-controlled.

### 3.19.0 AI Trust and Controls

Status: Planned

Goal: Make AI helpers more understandable, configurable, and safe before expanding the suite.

- Add an AI settings section.
- Let users turn AI helpers on or off by app.
- Explain why AI suggestions appear for calendar dates, task routing, project planning, and note extraction.
- Add calmer fallback states when the AI backend is unavailable.
- Tune project and pipeline routing suggestions based on real use.
- Keep all AI actions review-first and reversible.
- Document which AI helpers are local heuristics and which use the backend.
- Avoid silent AI changes to user data.

### 4.0.0 Suite Expansion

Status: Held

Goal: Expand EasyLife beyond productivity into lightweight lifestyle and fun apps without weakening the core system.

- Add EasyDrinks as a quick drink journal and recipe app.
- EasyDrinks can save drink name, ingredients, notes, rating, tags, date, and favorite status.
- EasyDrinks supports broad drink types such as cocktails, mocktails, coffee, smoothies, and protein shakes.
- Add EasyGames as a small games hub.
- EasyGames launches with one or two lightweight built-in games instead of a giant game library.
- EasyGames tracks simple play stats or favorites where useful.
- Add EasyDrinks and EasyGames to navigation, app visibility settings, theme styling, roadmap, changelog, and versioning.
- Keep both apps MVP-sized for 4.0.0, then deepen them in later 4.x releases.

## Backlog by Area

### Global and Mobile

- Preserve user context when switching tabs across every app.
- Continue reducing minimum clicks to write, log, or capture.
- Keep mobile overlays checked as new drawers and sheets are added.
- Improve landing pages and demo flows in `3.15.0`.
- Standardize the visual system in `3.16.0`.
- Prepare navigation and settings for EasyDrinks and EasyGames once the `4.0.0` hold lifts.

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
- Add user-facing AI controls in `3.19.0`.
- Add better fallback states when AI is unavailable in `3.19.0`.

### EasyDrinks

- Build the EasyDrinks MVP when the `4.0.0` hold lifts.
- Add fast drink capture.
- Add saved favorite drinks.
- Add ingredients, notes, rating, tags, and date fields.
- Keep any alcohol-related copy neutral and responsible.

### EasyGames

- Build the EasyGames MVP when the `4.0.0` hold lifts.
- Add a games dashboard.
- Add one or two lightweight built-in games.
- Add simple favorites or stats if they do not slow down the MVP.
