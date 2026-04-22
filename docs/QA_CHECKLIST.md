# EasyLife Core QA Checklist

Use this checklist before reopening major feature work or sharing a presentation build. The goal is to catch workflow friction, mobile layout problems, and data handoff issues while the productivity core is stable enough to reason about.

## Release Checks

- Confirm Settings shows the current app version.
- Confirm `CHANGELOG.md`, `docs/ROADMAP.md`, `docs/VERSIONING.md`, and `app-vNext/package.json` agree on the release.
- Run `npm run build` from `app-vNext`.
- Confirm root `index.html`, `404.html`, and `assets/` were refreshed after the build.

## Global Mobile Checks

- Open the app on a narrow viewport or phone.
- Open and close the Apps menu from the header.
- Open the global capture modal and confirm the close control is reachable.
- Confirm no drawer or popup is hidden behind the browser chrome or bottom nav.
- Switch between apps and confirm the page does not feel cramped or horizontally scroll.
- Confirm each app has only one obvious command/navigation area.

## EasyList

- Add a single quick task.
- Add a task with a due date and duration in minutes.
- Change a task urgency from the 1-10 scale.
- Open task details and confirm the drawer close button stays reachable on mobile.
- Send a task to EasyCalendar.
- Send a task to EasyProjects.
- Send a job/application-style task to EasyPipeline.
- Confirm AI routing suggestions are helpful but still require confirmation.
- Complete a task and confirm the archive motion does not slow the page.

## EasyCalendar

- Create a fixed event.
- Edit the event after creation.
- Create a daily, weekly, or monthly recurring event.
- Confirm recurring events appear in day, week, and month views.
- Confirm day view uses the expected wakeup time.
- Create or edit a category color.
- Send a task into the calendar and confirm it appears as planned work.

## EasyNotes

- Create a blank note quickly.
- Use the Notes add/search/edit command strip.
- Type a long note and confirm the page moves naturally.
- Leave and return to EasyNotes, then confirm resume behavior.
- Create tasks from note lines.
- Create a project from note lines.
- Add a folder.
- Move notes into a folder.
- Multi-select notes and bulk delete.
- Run or verify cleanup behavior for untitled empty notes.

## EasyWorkout

- Start a workout from the main workout screen.
- Confirm focused workout mode hides unrelated UI.
- Confirm six compact exercise boxes appear by default.
- Add three exercise boxes.
- Clear blank boxes.
- Type a custom exercise name without the keyboard disappearing.
- Add exercise notes above sets.
- Save the workout and confirm it appears in history.

## EasyProjects

- Create a project manually.
- Add a section.
- Add or link tasks.
- Open a routed task from EasyList and confirm source context is preserved.
- Try the project planner AI only if the backend is available.

## EasyPipeline

- Create an application manually.
- Route an EasyList task into EasyPipeline.
- Confirm the routed item uses task title, category, due date, priority, and notes sensibly.
- Update status and follow-up details.

## EasyStatistics

- Open the overall statistics page.
- Confirm the page loads without making the rest of the suite feel heavy.
- Review task, calendar, notes, workout, project, and pipeline sections.

## Settings

- Change theme mode.
- Toggle visible apps.
- Change calendar wakeup time.
- Switch between Settings sections on desktop and mobile.
- Confirm app-specific settings cards are readable and only expose controls that are wired.

## Hold Criteria For 5.0.0

- Start EasyDrinks and EasyGames only after the core flows above feel stable in real use.
- If a core workflow feels confusing, patch the current productivity product first.
- Keep notes on repeated friction, especially mobile drawer behavior, fast capture speed, and cross-app routing clarity.
