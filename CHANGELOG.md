# Changelog

All notable EasyLife app changes should be documented here.

The app version lives in `app-vNext/package.json`. When a release changes app behavior, update both `app-vNext/package.json` and `app-vNext/package-lock.json`.

## Unreleased

## 4.8.0

### Changed

- Updated the public root route so signed-in users open their selected startup page instead of the marketing landing page.
- Enlarged and repositioned the universal quick-add button so it is easier to hit on mobile and less pinned to the corner.

## 4.7.0

### Added

- Added local notification scheduling for task deadlines, calendar events, scheduled work blocks, and daily planning reminders.
- Added reminder duplicate prevention and quiet-hours adjustment for scheduled notifications.

### Changed

- Updated notification settings copy around active scheduling and removed standalone workout reminder controls.
- Updated the roadmap with 4.13.0 Settings and landing page cleanup, pushing general housekeeping to 4.14.0.

## 4.6.0

### Added

- Added a Firebase rules verification record covering current Firestore rule shape, client data paths, Cloud Function auth checks, and a manual owner-vs-other-user test plan.

### Changed

- Updated the security checklist and roadmap around the 4.6.0 Firebase rules verification pass.
- Documented that the verified Firestore rules were deployed to `pipeline-2f422`.

## 4.5.6

### Added

- Expanded EasyCalendar quick-create so blank hour slots can create events, deadlines, or scheduled EasyList task blocks.

## 4.5.4

### Changed

- Updated EasyCalendar day view so longer events and task blocks render once at their starting hour with a taller block based on duration.

## 4.5.3

### Added

- Added EasyCalendar quick-create from free hourly slots so tapping a blank hour opens a compact event form with the date and time prefilled.

### Changed

- Kept the deeper EasyCalendar interaction polish aligned with the cleaner calendar grid style from 4.5.0.

## 4.5.0

### Added

- Added Task vs Deadline item types to EasyList rows and task editing.
- Added Event vs Deadline item types to EasyCalendar creation and editing.
- Added linked task creation from EasyCalendar so exams, due dates, and events can create a connected EasyList item.
- Added a Settings startup preference so `/app` and mobile home-screen launches can open HQ, last-used, EasyList, Calendar, Notes, or Workout.
- Added optional EasyNote linking from EasyList task details.
- Added honest Labs statuses and recommendations so active, partial, and coming-soon toggles are clearer.
- Added a visible Gym Mode button on EasyWorkout dashboard and the workout logging page.
- Added stable workout exercise and set row IDs so typing exercise names no longer remounts the active input.

### Changed

- Calendar deadline markers now distinguish hard deadlines from normal task due dates.
- Calendar event forms now use clearer wording for event kind, deadline area, due time, and linked task estimates.
- Simplified EasyList task cards so the list shows more items and keeps extra detail inside the task drawer.
- Changed the PWA theme color from green to a neutral shell color so iPhone browser chrome blends better across themes.
- Changed mobile browser chrome to follow the active theme after the app shell loads.
- Changed Gym Mode so the main in-gym logger can be opened directly without requiring the Lab switch.
- Simplified EasyWorkout so the default surface is start, log, and save, with imports and training analytics tucked behind quiet advanced controls.
- Simplified high-traffic app surfaces across HQ, EasyCalendar, EasyNotes, and EasyPipeline so primary actions stay visible while previews, cleanup tools, and analytics sit behind calmer controls.
- Restyled EasyCalendar day, week, and month views around cleaner grid surfaces, sticky view controls, compact event blocks, and quieter advanced tools.
- Hid mobile runtime status noise from the main shell so users only see system details when functionality actually needs attention.
- Improved routine exercise row layout so routine builders do not inherit the EasyList task-row grid.
- Improved Gym Mode startup so it opens with the full focused exercise box count immediately.

## 4.4.0

### Added

- Added saved Assistant settings for enabling AI helpers, data review, cross-app suggestions, draft creation, review-before-save, and fallback behavior.
- Added a Settings Assistant section that explains what AI can review, suggest, draft, and never change automatically.
- Added assistant fallback controls for quiet, explanatory, and manual-workflow behavior.

### Changed

- Updated EasyProjects AI planning so the Project Planner requires both the Lab toggle and Assistant draft permissions.
- Kept AI project planning review-first before creating project sections or linked tasks.

## 4.3.0

### Added

- Added a Settings distribution checklist for sharing EasyLife with friends, TestFlight prep, support, privacy, and rollback readiness.
- Added direct Settings links from Distribution to the install guide and data export tools.
- Added mobile sharing QA notes for tester handoff, release version checks, and rollback practice.

## 4.2.0

### Added

- Added mobile viewport tracking so the app shell can respond to iPhone keyboard and visible-height changes.
- Added split scheduling for EasyList tasks so one task can become multiple calendar work blocks.
- Added a more polished loading state for app launch, auth restore, and lazy-loaded screens.

### Changed

- Improved EasyCalendar wording for event kind, color labels, recurrence, and calendar task block status.
- Improved task completion styling with lightweight theme-aware archive motion and reduced-motion support.
- Improved mobile bottom spacing and notes editor height handling when the keyboard is open.

## 4.1.1

### Added

- Added a notification preview helper that finds eligible upcoming task and calendar reminders.
- Added an EasyHQ notification preview panel so reminder candidates are visible before scheduling is automated.

## 4.1.0

### Added

- Added notification preferences for task deadlines, calendar blocks, daily planning, workouts, and quiet hours.
- Added notification permission onboarding and a test notification action in Settings.
- Added browser notification support helpers for the mobile/PWA foundation.

## 4.0.3

### Added

- Added mobile route memory so EasyLife remembers the last app screen used.
- Added an EasyHQ resume card for returning to the last active app screen.

## 4.0.2

### Added

- Added a Settings install section with iPhone and Android home-screen guidance.
- Added an Install EasyLife action that opens the share sheet when supported.
- Added mobile runtime detection for browser vs home-screen launch and online vs offline status.
- Added EasyHQ install guidance when EasyLife is still running in the browser.

### Changed

- Updated the home-screen app manifest to launch into `/app`.
- Made the top-left EasyLifeHQ brand return users to EasyHQ.
- Added an offline banner for the authenticated app shell.

## 4.0.0

### Added

- Added the first mobile app foundation with PWA install metadata for iPhone home-screen use.
- Added an EasyLife web app manifest, service worker, app icon set, and Apple touch icon.
- Added mobile install and future App Store readiness notes.

### Changed

- Updated the app document metadata, mobile viewport, theme color, and iOS standalone settings for a more app-like launch.

## 3.20.0

### Added

- Added deployable Firestore rules that restrict user data to the signed-in account owner.
- Added a security checklist for Firebase rules, frontend secrets, friendly errors, deploy review, and mobile security follow-up.

### Changed

- Narrowed AI Cloud Function CORS to known EasyLife and local development origins.
- Hardened auth startup so persistence failures do not block account checks.
- Replaced raw Firebase data-load errors with safer user-facing messages.

## 3.19.1

### Fixed

- Fixed mobile marketing and login page horizontal overflow that clipped header actions and hero copy.
- Tightened marketing header badge and container radii to match the polished command-center shell.

## 3.19.0

### Changed

- Refined the default EasyLife shell into a sleeker command-center visual system.
- Added subtler grid, panel highlight, stat card, and surface treatments across the app.
- Deepened Candy, Gamer, and Elvish theme personality through theme-specific panel, glow, and surface polish.
- Removed negative heading letter spacing from key responsive styles for cleaner mobile rendering.

## 3.18.0

### Added

- Settings now includes a Data section for reviewing stored EasyLife records.
- Added full JSON export for tasks, notes, calendar data, workouts, projects, pipeline data, contacts, settings, and metadata.
- Added a copyable data summary with per-app record counts and linked-data review totals.
- Added data health cards for linked calendar blocks, project task links, and notes in trash.

## 3.17.0

### Added

- Settings now stores app-specific preferences for EasyList, EasyNotes, EasyWorkout, EasyCalendar, and cross-app routing.
- Settings now includes editable app preference controls for task defaults, note behavior, workout mode defaults, calendar planning, and routing behavior.

### Changed

- EasyList quick-add rows now use the configured default urgency and row count.
- EasyWorkout start mode now uses configured exercise box and set defaults, with a toggle for last-time helpers.
- EasyCalendar Plan My Day now uses configured planning window and default task block length.

## 3.16.0

### Changed

- Standardized shared button, input, card, empty-state, toolbar, and drawer styling across the app.
- Tightened mobile overflow safeguards for common cards, drawers, toolbar rows, and action groups.
- Improved close-button labels for task, calendar, contact, pipeline, and quick-add drawers.

## 3.15.1

### Changed

- Tightened presentation copy on landing, login, product demo paths, and EasyHQ demo guidance.
- Added small layout safeguards for demo path copy on narrow screens.

## 3.15.0

### Added

- Main landing page now leads with the core EasyLifeHQ loop and a clearer demo path.
- Product landing pages now include demo-path sections for EasyList, EasyNotes, EasyCalendar, and EasyPipeline.
- EasyHQ now includes a first-run demo path for showing the core suite quickly.
- Login now gives clearer suite context before the account form.

## 3.14.2

### Fixed

- Synced the app package version, Settings version display, roadmap, versioning notes, and deploy assets for the 3.14 patch line.
- Added and preserved the full 3.x manual QA checklist as the product testing guide before any 4.0.0 expansion work resumes.

## 3.14.0

### Changed

- Settings now reads the current app version from the package metadata instead of a hardcoded display value.
- Mobile task and calendar drawers now use dynamic viewport height and safer sticky headers.
- The mobile capture close control now uses a clean text glyph.
- The roadmap now pauses 4.0.0 expansion until the 3.x product core has been tested in real use.
- Added a 3.x manual QA checklist for testing the full productivity core before 4.0.0 work resumes.

## 3.13.0

### Added

- EasyList task details now suggest whether a task belongs in EasyProjects or EasyPipeline.
- Routing suggestions explain the signal and require a user-confirmed send action.
- Tasks without a strong routing signal now get calm guidance to stay in EasyList for now.

## 3.12.0

### Changed

- EasyWorkout focused workout mode now starts with six compact exercise boxes.
- Focused workouts now include quick actions to add three exercise boxes or clear unused blank boxes.
- Old workout import copy is clearer and stays out of focused workout mode.
- Active workout cards and set rows are tighter on mobile.

## 3.11.0

### Added

- EasyNotes can now turn a note outline into an EasyProject with linked EasyList tasks.
- EasyNotes library organization work is formalized around folders, multi-select, bulk move, bulk delete, and cleanup.

## 3.10.0

### Changed

- Settings now uses a sectioned control center with a sidebar on desktop and a section picker on mobile.
- Settings sections now show one focused area at a time for appearance, apps, calendar, page controls, labs, and account.
- Updated the Settings version display for the current release.

## 3.9.0

### Added

- EasyCalendar fixed events can now repeat daily, weekly, or monthly.
- EasyCalendar day, week, and month views now show recurring event occurrences.
- EasyCalendar category tools can now create custom categories with user-selected colors.

## 3.8.1

### Added

- EasyList can now create suggested EasyCalendar task blocks for newly added tasks with due dates when the user opts in.

### Changed

- EasyList task creation now preserves the created task id so follow-up actions can link back cleanly.

## 3.8.0

### Changed

- Updated AI task extraction and project planning to use the full EasyList 1-10 urgency scale.
- EasyList brain-dump analysis now calls out detected due-date suggestions before tasks are saved.
- AI task analysis copy now reinforces that generated rows are editable and confirm-before-action.

## 3.7.1

### Changed

- EasyList task routing can now send a task to an existing EasyProject and section.
- EasyProject routing still offers a quick-create project fallback when no existing project is selected.

## 3.7.0

### Added

- Added manual EasyList task routing to EasyProjects from the task drawer.
- Added manual EasyList task routing to EasyPipeline from the task drawer.
- Routed items preserve source task context in project or pipeline notes.

## 3.6.0

### Added

- Added EasyStatistics as a dedicated progress hub.
- Added weekly overview stats for completed tasks, planned calendar work, fixed events, and workouts.
- Added EasyStatistics to app navigation and Settings visibility controls.

### Changed

- Moved the version display in Settings forward to the current app version.

## 3.5.1

### Changed

- EasyWorkout Start Workout now focuses the first exercise field when the page opens.
- Simplified EasyWorkout dashboard actions by removing the duplicate regular logging card.

## 3.5.0

### Added

- Added a focused EasyWorkout Start Workout path with five blank exercise boxes ready immediately.
- Added exercise-level notes above workout sets.

### Changed

- Moved paste-from-notes and duration out of focused workout mode so active logging starts cleaner.
- Renamed workout navigation around Start Workout and Log Old Workout.

## 3.4.0

### Added

- Added a Resume writing action to EasyNotes that opens the most recently edited note.
- Added a Make tasks button in the EasyNotes editor so note lines can be sent to EasyList quickly.
- Added a direct blank-note route so HQ and EasyNotes can open a fresh writing pad immediately.

### Changed

- EasyNotes-created tasks now use the current 1-10 urgency scale labels.
- EasyList now focuses the first task row when the add-task page opens.

## 3.3.0

### Added

- Added a real EasyCalendar month view.
- Added an hour-by-hour EasyCalendar day layout.
- Added calendar wakeup time to Settings and persisted it with user shell settings.
- Added in-calendar Day, View week, and View month controls above the day timeline.
- Added app-specific settings cards for EasyCalendar, EasyList, EasyNotes, and EasyWorkout.

### Changed

- EasyCalendar day planning now uses the user's wakeup time as the start of the visible day.

## 3.2.0

### Added

- Added deadline-only task items to EasyCalendar day and week views when an EasyList task has a due date but no active scheduled work block.
- Added scannable task metadata chips for deadline, estimate, planned calendar blocks, and category.
- Added a lightweight completion animation for task cards.

### Changed

- Changed EasyList urgency from a 1-5 scale to a 1-10 scale, from "Should've been done yesterday" to "Nice to have one day".
- Improved local brain-dump parsing so urgent language like "tomorrow", "forgot about", or "yesterday" maps to the highest urgency tiers.

## 3.1.7

### Added

- Added an EasyCalendar event drawer so fixed events can be opened, edited, saved, or deleted from day and week views.

### Changed

- Clarified duration fields as minutes in task, calendar, and workout forms.
- Removed the duplicated EasyList queue from the task capture page so the inbox focuses on adding tasks.
- Let EasyWorkout exercise names stay as normal free-form text instead of tying the input to the exercise suggestion datalist.
- Let the EasyNotes editor textarea grow with longer writing so the writing area moves naturally as notes get longer.
- Adjusted the mobile capture popup to respect dynamic viewport height and safe-area spacing.

### Fixed

- Calendar event validation now clearly explains that the end time must be after the start time.
- Existing calendar events, including class events, can now be edited after creation.
- Mobile capture popup close controls stay reachable above browser and device chrome.

## 3.1.6

### Added

- Added the working roadmap in `docs/ROADMAP.md`.
- Added release and versioning guidance in `docs/VERSIONING.md`.

### Changed

- Established the next planned release as `3.1.7` Stability Sweep.

## 3.1.6 Planning Baseline

### Notes

- Current app version at the time this roadmap was created.
- Future release entries should list user-facing additions, changes, fixes, and known follow-up work.
