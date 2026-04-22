# EasyLife Declutter Audit

Use this as the cleanup lens before adding major new apps. The goal is a deep-module interface: daily actions stay obvious, and power tools stay available without crowding the page.

## Control Rules

- Daily controls stay visible: add, search, start, today, and the primary mode switch.
- Secondary controls can stay visible only when they support the current page.
- Advanced controls move behind Edit, More, Settings, details, or the relevant drawer.
- Avoid two navigation layers that point to the same modes.
- Avoid promoting recovery/history pages beside daily work.
- Prefer one command row per page.

## Current Findings

### EasyCalendar

- Problem: Day, Week, and Month were shown in both the workspace subnav and the calendar page switcher.
- Patch: Removed the outer EasyCalendar subnav so the page-level view switcher is the only calendar mode control.
- Next cleanup: Make Week the primary Google-style view, with a single top command row for Today, view mode, and Add.

### EasyList

- Problem: Archive and Deleted were promoted beside the daily list and Add flow, which made cleanup/recovery feel like core daily actions.
- Patch: Removed Archive and Deleted from always-visible EasyList navigation.
- Patch: Removed the duplicate bulk Archive action; completing a task is the daily action.
- Next cleanup: Move history/recovery into Statistics or a quiet More menu if recovery needs to stay reachable.

### EasyNotes

- Problem: Add, search, edit, resume, folders, cleanup, and trash competed for attention.
- Done recently: Consolidated add/search/edit into one command strip and removed the duplicate floating add button.
- Next cleanup: Consider making the search input appear only after Search on narrow screens.

### EasyWorkout

- Problem: The top workout subnav duplicated the dashboard hero actions and made Start Workout less dominant.
- Patch: Removed the outer EasyWorkout subnav so the dashboard can make Start Workout the main action.
- Next cleanup: Keep old-workout logging and routines as secondary actions, not equal peers with Start Workout.

### EasyProjects

- Problem: A one-link Projects Home subnav added visual noise without helping navigation.
- Patch: Removed the one-link Projects subnav.
- Next cleanup: Keep project timeline/detail navigation inside the selected project, not global chrome.

### EasyPipeline

- Current state: Board, Stats, and Email Drafts still use a top subnav.
- Recommendation: Keep temporarily because these are distinct working areas, but consider moving Stats into EasyStatistics later.

### EasyStatistics

- Current state: Already functions as a hub for deeper review.
- Recommendation: Move archive/history-style review here over time so daily apps stay calm.

### Settings

- Current state: Settings is intentionally control-heavy.
- Recommendation: Keep controls grouped by section, but avoid exposing experimental or inactive settings as if they are daily actions.

## Hold Before 5.0.0

- Do one visual click-through of HQ, EasyList, EasyCalendar, EasyNotes, EasyWorkout, EasyProjects, EasyPipeline, EasyStatistics, and Settings.
- Confirm each page has only one obvious command area.
- Confirm history/recovery pages do not appear next to daily work unless there is a clear reason.
- Confirm mobile does not show stacked navigation bars or repeated mode buttons.
