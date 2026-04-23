# EasyList Research Notes (4.30.0)

This research pass is the planning baseline for the EasyList implementation release.

## Sources Reviewed

- Todoist help: list, board, and calendar layouts plus upcoming planning flow.
- Todoist help: calendar integration and how events differ from editable tasks.
- Microsoft To Do support: My Day, suggestions, and smart-list behavior.
- TickTick features and help: list, calendar, kanban, filters, grouping, and sorting.

## What Strong Task Tools Do Well

1. Keep the main list thin.
   - Todoist list view is strong because it stays readable and lets details stay secondary.
   - The best tools assume that most tasks only need a short title until the user asks for more.

2. Use smart views instead of one giant pile.
   - Microsoft To Do's My Day and suggestions keep focus narrow.
   - TickTick and Todoist both use dedicated views like Today, Upcoming, filters, and smart lists to reduce overload.

3. Offer multiple structures without forcing all of them at once.
   - Todoist supports list, board, and calendar layouts.
   - TickTick supports list, kanban, timeline, and filters.
   - The lesson for EasyList: multiple lists and grouped views are useful, but the default should stay simple.

4. Make grouping and sorting easy to change.
   - TickTick leans hard on group/sort controls.
   - Users need a quick way to switch between urgency, deadline, and list context.

5. Keep calendar events visually distinct from tasks.
   - Todoist keeps synced calendar events visually separate and often read-only.
   - This supports the EasyLife model where deadlines, events, and task blocks should not blur together.

6. Make daily focus an explicit mode.
   - Microsoft To Do's My Day is valuable because it gives users a clean daily reset.
   - EasyList should likely have a daily-focus view without making the entire system revolve around it.

7. Hide completion history unless the user needs it.
   - Most strong tools keep the active list front and center.
   - Completed, deleted, and archived material should be recoverable but not constantly visible.

## Best-Fit Directions For EasyList

### Keep

- Fast capture.
- One-line-readable task rows.
- Urgency-first ranking.
- Detail drawer for richer context.
- Multi-list support.

### Improve In 4.31.0

- Make the default view thinner and calmer.
- Add stronger smart views such as:
  - Today / Focus
  - Upcoming / deadlines
  - By list
- Improve batch actions so complete/delete/move work cleanly.
- Clarify soft delete vs completed vs archive so the model is not confusing.
- Add lightweight grouping/sorting controls without turning the page into a control panel.
- Keep linked calendar/project/pipeline details tucked into the drawer or secondary controls.

### Avoid

- Showing too many action rows at once.
- Mixing deleted/archive/completed in a way that makes users think the same action exists twice.
- Letting the list surface become as dense as a spreadsheet.

## Implementation Plan For 4.31.0

1. Tighten the default EasyList list density even more.
2. Introduce clearer smart views around Focus, Upcoming, and Lists.
3. Simplify batch actions and cleanup states.
4. Keep the task drawer as the deeper module for planning, routing, and notes.
5. Preserve fast capture while making the reading experience much calmer.
