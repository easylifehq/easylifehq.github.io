# EasyLife Roadmap

This roadmap is the working source of truth for product direction, release planning, and task tracking. Keep items phrased as testable outcomes so each release can be finished without losing the original intent.

## Current Version

- App package version: `3.7.1`
- Current planning target: `3.7.1` EasyProject and Pipeline Routing Polish
- Next feature target: `3.8.0` AI Assistance Layer

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

Status: Partially Done

Goal: Give Calendar a clearer structure and move customization into organized settings.

- Done: Day view uses an hour-by-hour layout.
- Done: Day, week, and month views can be switched from the calendar screen.
- Next: Unnecessary calendar header tabs are removed or consolidated.
- Repeating events support classes and other recurring obligations.
- Done: Wakeup time can be edited by the user in Settings.
- Users can create custom categories.
- Users can customize category colors for tasks, school, and personal categories.
- Started: Settings includes a dedicated Calendar section and app-specific settings cards.
- Next: Settings are split into app-specific pages.
- Next: Settings navigation works well on mobile.

### 3.4.0 Fast Capture and Notes Integration

Status: Done

Goal: Minimize the time between having a thought and saving it.

- Started: Creating a blank note, task, workout, event, or project item takes the fewest practical clicks.
- Done: EasyNotes has a direct blank-note route for one-click writing from HQ and the notes library.
- Done: EasyList focuses the first task row when the add-task page opens.
- Done: Returning to EasyNotes offers a Resume writing action for the previously open note.
- Done: EasyNotes has a button to make tasks from a note.
- Done: EasyNotes can transform note lines into a series of tasks.
- Done: Notes can send generated tasks to EasyList.
- Tasks can be routed to EasyProject, EasyPipeline, or Calendar when applicable.
- Untitled empty notes can be cleaned up safely on a recurring basis or via a maintenance action.

### 3.5.0 EasyWorkout Redesign

Status: Done

Goal: Separate passive workout logging from active workout mode.

- Done: EasyWorkout has a normal browsing/logging mode.
- Started: EasyWorkout has a focused Start Workout mode.
- Started: Workout mode hides unrelated UI.
- Done: Workout mode shows date, general notes, and exercise entry.
- Done: New workouts start with several compact exercise boxes already available.
- Exercise boxes can be added or removed quickly.
- Exercise names are free-form text, not restricted to hardcoded categories.
- Done: Each exercise has a notes field above sets.
- Exercise boxes are compact enough to reduce scrolling.
- Started: Paste-from-notes moves out of the primary workout flow and into an import area.
- Done: Duration is removed from focused workout mode.

### 3.6.0 EasyStatistics Hub

Status: In Progress

Goal: Keep statistics fun without making primary pages feel cramped.

- Done: EasyStatistics becomes the main analytics page.
- Started: Primary app pages show only light, useful summary stats.
- Done: EasyStatistics has an overall dashboard.
- Started: EasyStatistics has deeper per-app views for tasks, calendar, notes, workouts, projects, and pipeline.
- Statistics loading does not bog down the main app experience.

### 3.7.0 EasyProject and Pipeline Routing

Status: In Progress

Goal: Let tasks and notes move into larger workflows when they belong there.

- Done: Tasks can be sent to EasyProject.
- Done: Tasks can be sent to EasyPipeline.
- Done: Tasks can be sent to an existing EasyProject and section.
- Notes can create project-ready task groups.
- Done: Applicable tasks offer a clear send-to-project or send-to-pipeline action.
- Done: Routing preserves the original source task context.

### 3.8.0 AI Assistance Layer

Status: Planned

Goal: Add helpful suggestions after the manual systems are stable.

- AI scans current notes, tasks, and calendar data when appropriate.
- AI detects date phrases like "prep for exam on Tuesday."
- AI asks whether detected dates should become calendar events.
- AI can break notes into suggested tasks.
- AI can suggest whether an item belongs in EasyProject or EasyPipeline.
- AI suggestions are confirm-before-action, never automatic silent changes.

## Backlog by Area

### Global and Mobile

- Make feature popups fit mobile screens and browser chrome.
- Keep close buttons reachable above nav bars.
- Make "add blank" actions prominent across apps.
- Preserve user context when switching tabs.

### EasyList

- Redesign task ranking around human urgency.
- Improve list scan speed.
- Add quick check-off behavior.
- Add lightweight archive animation.
- Support planned work dates separately from deadlines.
- Support split task work time.
- Keep queue only on the to-do list page.

### EasyCalendar

- Add hour-by-hour day layout.
- Add day, week, and month switching.
- Support repeating class events.
- Let users edit wakeup time.
- Clarify event type and category fields.
- Support custom categories and colors.
- Fix event editing bugs.

### EasyNotes

- Fix long-note typing and textbook layout.
- Add note-to-task action.
- Add note-to-task-series action.
- Add folders.
- Add multi-select.
- Add bulk delete.
- Add move-to-folder.
- Add safe cleanup for untitled empty notes.
- Restore the open note when returning to EasyNotes.

### EasyWorkout

- Fix keyboard disappearing in exercise inputs.
- Add focused workout mode.
- Make exercise boxes smaller.
- Allow free-form exercise names.
- Add per-exercise notes above sets.
- Move old workout import away from active logging.

### EasyStatistics

- Move heavy stats out of primary pages.
- Create overall statistics dashboard.
- Add per-app statistics pages.
- Keep primary pages visually lighter.

### EasyProject and EasyPipeline

- Receive tasks from EasyNotes and EasyList.
- Preserve task context when routed.
- Add prompts for task routing only when useful.

### AI Backend

- Scan current data for dates and task intent.
- Suggest calendar additions from task and note text.
- Suggest task breakdowns from notes.
- Suggest project or pipeline routing.
