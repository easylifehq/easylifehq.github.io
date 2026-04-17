# Changelog

All notable EasyLife app changes should be documented here.

The app version lives in `app-vNext/package.json`. When a release changes app behavior, update both `app-vNext/package.json` and `app-vNext/package-lock.json`.

## Unreleased

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
